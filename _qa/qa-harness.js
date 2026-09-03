// QA harness over the DevTools protocol.
// node qa.js <url> <outDir>
// For each viewport: load with LCP/CLS observers, scroll through, check overflow,
// console errors, network failures, font load; screenshot key sections.
// Then at 1440: keyboard walk, reduced-motion render, print PDF, node keyboard activation, sheet at 390.
const fs = require('fs'), cp = require('child_process'), http = require('http'), path = require('path');
const [url, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const port = 9340;
const chrome = cp.spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + port,
   '--user-data-dir=' + outDir + '-prof', '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(p) { return new Promise((res, rej) => http.get('http://127.0.0.1:' + port + p, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej)); }
const report = [];
const log = (...a) => { const s = a.join(' '); console.log(s); report.push(s); };

const OBS = `
window.__m = { lcp: 0, cls: 0, shifts: [] };
try {
  new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__m.cls += e.value; window.__m.shifts.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: (e.sources||[]).map(s => s.node && s.node.tagName ? s.node.tagName + '.' + (s.node.className||'') : '?').join(',') }); } } }).observe({ type: 'layout-shift', buffered: true });
} catch (e) {}
`;

(async () => {
  let targets; for (let i = 0; i < 40; i++) { try { targets = await json('/json'); break; } catch (e) { await sleep(250); } }
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = {}; let logs = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) logs.push(m.params.type + ': ' + m.params.args.map(a => a.value || a.description).join(' '));
    if (m.method === 'Runtime.exceptionThrown') logs.push('EXCEPTION: ' + (m.params.exceptionDetails.exception || {}).description);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') logs.push('LOG: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
    if (m.method === 'Network.loadingFailed') logs.push('NETFAIL: ' + m.params.errorText);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) logs.push('HTTP ' + m.params.response.status + ' ' + m.params.response.url); };
  const send = (method, params) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable'); await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: OBS });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result.result ? r.result.result.value : undefined; };
  const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(r.result.data, 'base64')); };
  const scrollTo = async (sel) => { await ev('document.documentElement.style.scrollBehavior="auto"; (function(){var e=document.querySelector(' + JSON.stringify(sel) + '); if(e){window.scrollTo(0, e.getBoundingClientRect().top + window.pageYOffset - 70)}})()'); await sleep(900); };

  const VIEWPORTS = [[360, 800], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]];
  for (const [w, h] of VIEWPORTS) {
    logs = [];
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
    await send('Emulation.setTouchEmulationEnabled', { enabled: w < 800 });
    await send('Page.navigate', { url }); await sleep(3000);
    const tag = w + 'x' + h;
    await shot(tag + '-hero');
    const fonts = await ev('JSON.stringify({anton:document.fonts.check("400 20px Anton"),inter:document.fonts.check("600 16px Inter"),serif:document.fonts.check("italic 20px \\"Instrument Serif\\"")})');
    // scroll through the page in steps to trigger reveals and the line
    const H = await ev('document.documentElement.scrollHeight');
    for (let y = 0; y < H; y += Math.round(h * 0.8)) { await ev('window.scrollTo(0,' + y + ')'); await sleep(90); }
    await sleep(600);
    const overflow = await ev('JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bw:document.body.scrollWidth})');
    const m = await ev('JSON.stringify(window.__m)');
    log('== ' + tag + ' fonts=' + fonts + ' overflow=' + overflow + ' metrics=' + m + ' height=' + H);
    // find any element wider than the viewport
    const wide = await ev('(function(){var out=[];document.querySelectorAll("body *").forEach(function(e){var r=e.getBoundingClientRect();if(r.right>window.innerWidth+1&&r.width>0&&getComputedStyle(e).position!=="fixed"){var p=e;var clipped=false;while(p&&p!==document.body){var o=getComputedStyle(p).overflowX;if(o==="hidden"||o==="auto"||o==="scroll"||o==="clip"){clipped=true;break}p=p.parentElement}if(!clipped)out.push(e.tagName+"."+(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className)+" right="+Math.round(r.right))}});return JSON.stringify(out.slice(0,12))})()');
    log('   unclipped-wide: ' + wide);
    log('   console: ' + (logs.length ? logs.join(' | ') : 'clean'));
    for (const sel of ['#in-brief', '#origin', '#progress', '#group', '#record', '#contact']) { await scrollTo(sel); await shot(tag + '-' + sel.replace('#', '')); }
    // heading / sticky header collision check: after anchor navigation, is the heading below the header?
    const coll = await ev('(function(){var out=[];["origin","build","progress","group","method","next","record"].forEach(function(id){var e=document.getElementById(id);if(!e)return;location.hash="#"+id;var h=e.querySelector("h2");if(!h)return;var r=h.getBoundingClientRect();out.push(id+":"+Math.round(r.top))});return JSON.stringify(out)})()');
    log('   h2 top after hash-nav (header is 80px): ' + coll);
  }

  // ── 1440 extras ─────────────────────────────────────────────
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await send('Page.navigate', { url }); await sleep(2500);
  // keyboard walk
  const seq = [];
  await ev('document.body.focus()');
  for (let i = 0; i < 120; i++) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    const d = await ev('(function(){var e=document.activeElement;if(!e||e===document.body)return "BODY";var cs=getComputedStyle(e);var r=e.getBoundingClientRect();return e.tagName+(e.id?"#"+e.id:"")+"["+((e.getAttribute("aria-label")||e.textContent||"").trim().replace(/\\s+/g," ").slice(0,28))+"] outline="+cs.outlineStyle+"/"+cs.outlineWidth+" vis="+(r.width>0&&r.height>0)})()');
    seq.push(d);
    if (i === 2) await shot('1440-focus-skiplink');
    if (i === 8) await shot('1440-focus-cta');
    if (d === 'BODY' && i > 5) break;
  }
  log('== keyboard walk (' + seq.length + ' stops): ' + seq.join(' -> '));
  // keyboard-activate a group node
  await scrollTo('#group');
  const nodeTest = await ev('(function(){var n=document.querySelector(".node[data-k=global]");n.focus();n.click();return document.getElementById("pName").textContent+" | "+document.getElementById("pStatus").textContent.slice(0,60)+" | pressed="+n.getAttribute("aria-pressed")})()');
  log('== node activation: ' + nodeTest);
  await shot('1440-group-selected');
  // reduced motion
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url }); await sleep(2500);
  const rm = await ev('JSON.stringify({dash:getComputedStyle(document.getElementById("tLive")).strokeDashoffset,landed:document.getElementById("thread").className,sceneStatic:getComputedStyle(document.querySelector(".scene .stick")).position})');
  log('== reduced-motion: ' + rm);
  await scrollTo('#origin'); await shot('1440-reduced-motion-origin');
  await scrollTo('#one'); await shot('1440-reduced-motion-scene');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  // print
  await send('Page.navigate', { url }); await sleep(2000);
  const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
  fs.writeFileSync(path.join(outDir, 'evidence-pack.pdf'), Buffer.from(pdf.result.data, 'base64'));
  log('== print: evidence-pack.pdf ' + fs.statSync(path.join(outDir, 'evidence-pack.pdf')).size + ' bytes');
  // no-JS render
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await send('Page.navigate', { url }); await sleep(1500);
  await shot('1440-nojs-hero'); await scrollTo('#group'); await shot('1440-nojs-group');
  const nojs = await ev('document.documentElement.className');
  await send('Emulation.setScriptExecutionDisabled', { value: false });
  log('== no-js class: ' + nojs);
  // sheet at 390
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.navigate', { url }); await sleep(2000);
  const sheetTest = await ev('(function(){document.getElementById("burger").click();var f=document.activeElement;return "focus="+f.id+" hidden="+document.getElementById("sheet").hidden})()');
  await sleep(300); await shot('390-sheet-open');
  const esc = await ev('(function(){window.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}));return "hidden="+document.getElementById("sheet").hidden+" focus="+document.activeElement.id})()');
  log('== sheet: ' + sheetTest + ' | after Escape: ' + esc);
  await scrollTo('#group'); await shot('390-group');
  fs.writeFileSync(path.join(outDir, 'report.txt'), report.join('\n'));
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
