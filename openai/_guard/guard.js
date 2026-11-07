/* Copy protection. Inlined first in <head> on every page (see
   App.contentForHeader); minified at build, raw in dev.

   Nothing here can make a web page impossible to copy: the browser must be
   given the HTML, CSS and images to show them. What this does is stop the
   casual routes (right-click, select-and-copy, drag an image out, Ctrl+U,
   Ctrl+S, F12) and make the inspector unpleasant to use. The scraper
   blocks live at the edge (Cloudflare WAF) and in src/worker.mjs. */
(function () {
  'use strict';
  var D = document, W = window;
  var FIELD = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
  var NOTICE = '\u00a9 The Freedom Group. This content is protected and may not be copied.';
  function inField(t) { return !!(t && t.closest && t.closest(FIELD)); }
  function stop(e) { e.preventDefault(); e.stopPropagation(); return false; }

  // framed by another site: leave (the CSP header also refuses this)
  try { if (W.top !== W.self) { W.top.location.replace(W.location.href); } } catch (err) { try { D.documentElement.innerHTML = ''; } catch (err2) {} }

  // 1. right-click / long-press menu, kept on form fields so paste still works
  D.addEventListener('contextmenu', function (e) { if (!inField(e.target)) stop(e); }, true);

  // 2. shortcuts that open the inspector, view the source, or save/print the page
  D.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    if (k === 'f12') return stop(e);
    if (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k' || k === 'e' || k === 's' || k === 'p')) return stop(e);
    if (mod && !e.shiftKey && (k === 'u' || k === 's' || k === 'p')) return stop(e);
  }, true);

  // 3. selecting, copying and dragging outside form fields
  D.addEventListener('selectstart', function (e) { if (!inField(e.target)) stop(e); }, true);
  D.addEventListener('dragstart', function (e) { if (!inField(e.target)) stop(e); }, true);
  function onCopy(e) {
    if (inField(e.target)) return;
    try { if (e.clipboardData) e.clipboardData.setData('text/plain', NOTICE); } catch (err) {}
    stop(e);
  }
  D.addEventListener('copy', onCopy, true);
  D.addEventListener('cut', onCopy, true);

  // 4. inspector open: cover the page and keep covering it
  var locked = false;
  function cover() {
    if (!D.body) return;
    var o = D.getElementById('ffg-lock');
    if (!o) {
      o = D.createElement('div');
      o.id = 'ffg-lock';
      o.className = 'ffg-lock';
      o.innerHTML = '<div class="ffg-lock__box"><span class="ffg-lock__brand">The Freedom Group</span>' +
        '<p>This page is protected.</p><p class="ffg-lock__small">Close the browser inspector and reload the page to carry on. ' +
        'Want to see how it is built? Ask Tom.</p></div>';
      D.body.appendChild(o);
    }
    D.documentElement.classList.add('ffg-locked');
  }
  function lock() {
    if (locked) return;
    locked = true;
    cover();
    D.addEventListener('DOMContentLoaded', cover);
    setInterval(cover, 400);
  }
  // (a) the pause trap: `debugger` only stops when an inspector is attached,
  //     so a long gap means one is open (and it pauses them every second)
  function trap() {
    var t = performance.now();
    debugger;
    if (performance.now() - t > 200) lock();
  }
  // (b) the console probe: the id getter only runs when the console panel
  //     renders the element, which it does only while it is open
  var probe = new Image();
  try { Object.defineProperty(probe, 'id', { get: function () { lock(); return 'ffg'; } }); } catch (err) {}
  function poke() { try { console.log('%c', '', probe); } catch (err) {} }

  try {
    console.log('%cStop.', 'color:#E10600;font:700 42px Archivo,system-ui,sans-serif');
    console.log('%cThis is a Freedom Group site. Its design, code, text and pictures are copyright and may not be copied or reused. If someone told you to paste something here, it is a scam.', 'font:15px system-ui,sans-serif;color:#111');
  } catch (err) {}
  poke();
  setInterval(trap, 1000);
  setInterval(poke, 2000);
})();
