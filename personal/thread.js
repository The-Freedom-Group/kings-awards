/* ══════════════════════════════════════════════════════════════════
   THE FREEDOM LINE — engine
   Native scrolling throughout. Work happens only on scroll (one
   requestAnimationFrame per scroll event, none while idle). The line
   is an SVG path drawn by stroke-dashoffset — no layout, no reflow.
   prefers-reduced-motion: the line is drawn in full, nothing moves.
   Without JavaScript the page reads top to bottom unchanged.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var narrow = function () { return window.innerWidth <= 820; };

  /* ── contours: a static texture behind each panel ─────────── */
  function rnd(seed) { return function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; }
  function blobPath(cx, cy, r, rand) {
    var a1 = .16 + rand() * .1, a2 = .08 + rand() * .08, a3 = .05 + rand() * .05;
    var p1 = rand() * 6.28, p2 = rand() * 6.28, p3 = rand() * 6.28, d = "";
    for (var i = 0; i <= 56; i++) {
      var th = i / 56 * Math.PI * 2;
      var rr = r * (1 + a1 * Math.sin(2 * th + p1) + a2 * Math.sin(3 * th + p2) + a3 * Math.sin(5 * th + p3));
      d += (i ? " L " : "M ") + (cx + Math.cos(th) * rr * 1.35).toFixed(1) + " " + (cy + Math.sin(th) * rr).toFixed(1);
    }
    return d + " Z";
  }
  function contourGroup(cx, cy, r, rings, rand, cls) {
    var g = '<g class="' + cls + '">';
    for (var k = 0; k < rings; k++) {
      var s = 1 - k * .17;
      g += '<path d="' + blobPath(cx + k * 6 * (rand() - .5) * 4, cy + k * 5 * (rand() - .5) * 4, r * s, rand) + '"/>';
    }
    return g + "</g>";
  }
  function drawContours() {
    $$("#story .hero, #story .ch, #story .scene").forEach(function (sec, si) {
      var rand = rnd(97 + si * 131);
      var fx = document.createElement("div");
      fx.className = "topo"; fx.setAttribute("aria-hidden", "true");
      fx.innerHTML = '<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">' +
        contourGroup(180 + rand() * 160, 120 + rand() * 130, 150 + rand() * 70, 5, rand, "") +
        contourGroup(720 + rand() * 180, 400 + rand() * 140, 180 + rand() * 80, 6, rand, si % 3 === 1 ? "pk" : "") + "</svg>";
      sec.insertBefore(fx, sec.firstChild);
    });
  }
  /* decoration waits for an idle moment; the content never waits for decoration */
  if ("requestIdleCallback" in window) requestIdleCallback(drawContours, { timeout: 1500 });
  else setTimeout(drawContours, 60);

  /* ── poster words, one per chapter ────────────────────────── */
  var PW = { origin: "ORIGIN", build: "BUILD", progress: "PROGRESS", group: "GROUP", method: "METHOD", next: "NEXT" };
  Object.keys(PW).forEach(function (id) {
    var sec = document.getElementById(id);
    if (!sec) return;
    var w = document.createElement("span");
    w.className = "pw"; w.textContent = PW[id]; w.setAttribute("aria-hidden", "true");
    sec.insertBefore(w, sec.firstChild);
  });

  /* ── reveal headings and figures as they arrive (never body copy) */
  var watched = $$(".rv, .map, .plate");
  $$(".map").forEach(function (m) { $$(".node", m).forEach(function (n, i) { n.style.setProperty("--d", (i * 0.03) + "s"); }); });
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    watched.forEach(function (e) { io.observe(e); });
  }

  /* ══ THE LINE ═════════════════════════════════════════════ */
  var story = $("#story"), thread = $("#thread"), svg = $("#threadSvg"),
      track = $("#tTrack"), live = $("#tLive"), head = $("#tHead");

  /* L and R ride the empty margin outside the text column, so the line
     never crosses a word. The record has no line: evidence stands alone. */
  var PLAN = [
    { id: "in-brief", side: "R", y: 0.30 },
    { id: "one",      side: "R", y: 0.50, noKnot: true },
    { id: "origin",   side: "L", y: 0.42 },
    { id: "build",    side: "R", y: 0.42 },
    { id: "progress", side: "L", y: 0.42 },
    { id: "group",    side: "R", y: 0.38 },
    { id: "method",   side: "L", y: 0.42 },
    { id: "next",     side: "L", y: 0.40 }
  ];
  var pts = [], knots = [], totalLen = 0, knotAt = [], endPt = null, endFrac = 1, endNote = null, heroFrac = 0;
  function placeHead(x, y) { head.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)"; }

  function buildPath() {
    if (!story || !thread || !svg) return false;
    var W = story.offsetWidth, H = story.offsetHeight;
    if (!W || !H) return false;
    var col = story.querySelector(".ch .wrap") || story.querySelector(".wrap");
    var cr = col ? col.getBoundingClientRect() : { left: 0, right: W };
    var mobile = narrow();
    var LX = mobile ? 10 : Math.max(18, cr.left - 34);
    var RX = mobile ? 10 : Math.min(W - 18, cr.right + 34);
    var SIDE = { L: LX, R: RX };
    pts = [];

    var heroPrefix = "";
    var heroEl = document.getElementById("top"), stage = document.getElementById("heroStage");
    if (heroEl && stage && !mobile) {
      /* the bend: in from the left under the copy, up over the portrait,
         down the right as the trunk that carries the four chapter spurs */
      var hT = heroEl.offsetTop, hH = heroEl.offsetHeight;
      var sr = stage.getBoundingClientRect(), hr = heroEl.getBoundingClientRect();
      var yMain  = hT + (sr.bottom - hr.top) + 8;
      var yTop   = hT + hH * 0.50;
      var xLift  = W * 0.66, xTrunk = W * 0.82, xTerm = W * 0.885;
      var yExit  = hT + hH;
      var r = Math.min(34, W * 0.022);
      heroPrefix = "M " + LX.toFixed(1) + " " + yMain.toFixed(1) +
        " H " + (xLift - r).toFixed(1) +
        " Q " + xLift.toFixed(1) + " " + yMain.toFixed(1) + " " + xLift.toFixed(1) + " " + (yMain - r).toFixed(1) +
        " V " + (yTop + r).toFixed(1) +
        " Q " + xLift.toFixed(1) + " " + yTop.toFixed(1) + " " + (xLift + r).toFixed(1) + " " + yTop.toFixed(1) +
        " H " + (xTrunk - r).toFixed(1) +
        " Q " + xTrunk.toFixed(1) + " " + yTop.toFixed(1) + " " + xTrunk.toFixed(1) + " " + (yTop + r).toFixed(1) +
        " V " + yExit.toFixed(1);
      var top0 = yTop + 60, gap = Math.max(48, (yExit - 30 - top0) / 4);
      for (var bi = 0; bi < 4; bi++) {
        var by = top0 + gap * bi + gap * 0.5, sp = document.getElementById("sp" + bi);
        if (sp) sp.setAttribute("d", "M " + xTrunk.toFixed(1) + " " + (by - 30).toFixed(1) +
          " C " + xTrunk.toFixed(1) + " " + (by - 6).toFixed(1) + ", " + (xTrunk + 14).toFixed(1) + " " + by.toFixed(1) +
          ", " + (xTrunk + 42).toFixed(1) + " " + by.toFixed(1) + " H " + xTerm.toFixed(1));
        var nd = document.getElementById("hn" + bi);
        if (nd) { nd.style.left = (xTerm - 6.5) + "px"; nd.style.top = (by - hT) + "px"; }
      }
      var lbl = document.getElementById("hlStart");
      if (lbl) { lbl.style.left = LX + "px"; lbl.style.top = (yMain - hT) + "px"; }
      pts.push({ x: xTrunk, y: yExit, id: "top", el: heroEl, noKnot: true });
    } else {
      $$(".spur").forEach(function (p) { p.setAttribute("d", ""); });
    }

    /* a change of side happens in the padding at the top of the next section,
       where there is nothing to read — never across a heading */
    var prevSide = mobile ? "L" : "R";
    PLAN.forEach(function (p) {
      var el = document.getElementById(p.id);
      if (!el) return;
      var side = mobile ? "L" : p.side;
      if (side !== prevSide) {
        var band = el.classList.contains("scene") ? el.offsetHeight * 0.12
                 : (parseFloat(getComputedStyle(el).paddingTop) || 72);
        pts.push({ x: SIDE[prevSide], y: el.offsetTop + 14, id: p.id + "-x1", el: null, noKnot: true });
        pts.push({ x: SIDE[side], y: el.offsetTop + band - 18, id: p.id + "-x2", el: null, noKnot: true });
      }
      pts.push({ x: SIDE[side], y: el.offsetTop + el.offsetHeight * p.y, id: p.id, el: el, noKnot: !!p.noKnot });
      prevSide = side;
    });
    if (pts.length < 2) return false;
    var last = pts[pts.length - 1];
    pts.push({ x: last.x, y: H - 40, id: "end", el: null, noKnot: true });

    var d = heroPrefix || ("M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1));
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dy = (b.y - a.y) * 0.5;
      d += mobile ? (" L " + b.x.toFixed(1) + " " + b.y.toFixed(1))
                  : (" C " + a.x.toFixed(1) + " " + (a.y + dy).toFixed(1) + ", " + b.x.toFixed(1) + " " + (b.y - dy).toFixed(1) +
                     ", " + b.x.toFixed(1) + " " + b.y.toFixed(1));
    }
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    track.setAttribute("d", d);
    live.setAttribute("d", d);
    try { totalLen = live.getTotalLength(); } catch (e) { totalLen = 0; }
    if (!totalLen) return false;
    live.style.strokeDasharray = totalLen;
    live.style.strokeDashoffset = reduce ? 0 : totalLen;
    /* the hero bend is drawn in full on arrival; it must never be half a line */
    heroFrac = 0;
    if (heroPrefix) {
      var probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      probe.setAttribute("d", heroPrefix); svg.appendChild(probe);
      try { heroFrac = probe.getTotalLength() / totalLen; } catch (e) { heroFrac = 0; }
      svg.removeChild(probe);
    }

    knots.forEach(function (k) { k.remove(); });
    knots = []; knotAt = [];
    var SAMPLES = 240, samples = [];
    for (var s = 0; s <= SAMPLES; s++) {
      var pt = live.getPointAtLength(totalLen * s / SAMPLES);
      samples.push({ x: pt.x, y: pt.y, l: totalLen * s / SAMPLES });
    }
    pts.forEach(function (p) {
      if (p.noKnot) return;
      var best = samples[0], bd = Infinity;
      samples.forEach(function (sp) { var dd = (sp.x - p.x) * (sp.x - p.x) + (sp.y - p.y) * (sp.y - p.y); if (dd < bd) { bd = dd; best = sp; } });
      var k = document.createElement("i");
      k.className = "knot" + (p.el && p.el.classList.contains("dark") ? " dk" : "");
      k.style.left = p.x + "px"; k.style.top = p.y + "px";
      thread.appendChild(k); knots.push(k); knotAt.push(best.l / totalLen);
    });
    endPt = samples[samples.length - 1]; endFrac = 0.995;
    if (endNote) endNote.remove();
    endNote = document.createElement("span");
    endNote.className = "endnote"; endNote.textContent = "still drawing";
    endNote.style.left = (endPt.x + 18) + "px"; endNote.style.top = endPt.y + "px";
    thread.appendChild(endNote);
    if (reduce) { thread.classList.add("on", "landed"); placeHead(endPt.x, endPt.y); knots.forEach(function (k) { k.classList.add("hit"); }); }
    return true;
  }

  function drawThread(y) {
    if (!totalLen || reduce) return;
    var h = story.offsetHeight || 1;
    var p = clamp((y + window.innerHeight * 0.62) / h, 0, 1);
    p = Math.max(p, heroFrac);
    live.style.strokeDashoffset = totalLen * (1 - p);
    thread.classList.toggle("on", p > 0.004);
    var landed = p >= endFrac - 0.002;
    thread.classList.toggle("landed", landed);
    if (p > 0.004) {
      var pt = landed && endPt ? endPt : live.getPointAtLength(totalLen * p);
      placeHead(pt.x, pt.y);
    }
    for (var i = 0; i < knots.length; i++) knots[i].classList.toggle("hit", p >= knotAt[i]);
  }

  /* ══ THE PINNED SEQUENCE — 2021 ═══════════════════════════ */
  var scene = $("#one"), phrases = $$("#phs .ph"), sceneTop = 0, sceneRange = 1;
  function measureScene() {
    if (!scene) return;
    sceneTop = scene.offsetTop; sceneRange = Math.max(1, scene.offsetHeight - window.innerHeight);
  }
  function runScene(y) {
    if (!scene || reduce || narrow()) return;
    var p = clamp((y - sceneTop) / sceneRange, 0, 1);
    var idx = Math.min(phrases.length - 1, Math.floor(p * phrases.length));
    phrases.forEach(function (ph, i) { ph.classList.toggle("on", i === idx); });
  }

  /* ══ ON SCROLL: chrome, spine, progress, indicator ════════ */
  var chapters = $$("#story .ch, #story .hero, #story .scene, #record");
  var chrome = $("#chrome"), spine = $$(".spine a"), navLinks = $$(".chrome nav a");
  var prog = $("#prog"), now = $("#now"), nowN = $("#nowN"), nowT = $("#nowT");
  var TITLES = { top: ["00", "Tom Letcher"], "in-brief": ["30s", "Thirty-second record"], one: ["01", "Origin"],
    origin: ["01", "Origin"], build: ["02", "The build"], progress: ["03", "Measured progress"],
    group: ["04", "The Freedom Group"], method: ["05", "Operating philosophy"], next: ["06", "What comes next"],
    record: ["07", "Verified record"] };
  var NAV = { origin: "#origin", one: "#origin", build: "#origin", progress: "#progress", group: "#group",
    method: "#group", next: "#group", record: "#record" };
  var lastCard = "", ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (chrome) chrome.classList.toggle("stuck", y > 40);

    var mid = y + 90, dark = false, cur = null;
    chapters.forEach(function (s) {
      var top = s.offsetTop, bot = top + s.offsetHeight;
      if (mid >= top && mid < bot) dark = s.classList.contains("dark") || s.classList.contains("scene");
      if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur = s.id;
    });
    document.body.classList.toggle("dark-chrome", dark);
    var spineKey = cur === "one" ? "origin" : cur;
    spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === spineKey); });
    navLinks.forEach(function (a) {
      if (NAV[cur] === a.getAttribute("href")) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    if (prog) {
      var mx = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      prog.style.transform = "scaleX(" + clamp(y / mx, 0, 1).toFixed(4) + ")";
    }
    var meta = TITLES[cur];
    if (meta && cur !== lastCard) { lastCard = cur; if (now) { nowN.textContent = meta[0]; nowT.textContent = meta[1]; } }
    if (now) now.classList.toggle("on", y > window.innerHeight * 0.45);

    drawThread(y); runScene(y);
    ticking = false;
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener("scroll", requestTick, { passive: true });

  /* ── rebuild on layout shifts ─────────────────────────────── */
  var rebuildTimer = null;
  function rebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () { buildPath(); measureScene(); onScroll(); }, 120);
  }
  window.addEventListener("resize", rebuild);
  window.addEventListener("load", rebuild);
  if ("ResizeObserver" in window && story) new ResizeObserver(rebuild).observe(story);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  buildPath(); measureScene(); onScroll();

  /* ══ THE GROUP MAP ════════════════════════════════════════ */
  var CH = "https://find-and-update.company-information.service.gov.uk/";
  var checked = "3 September 2026";
  var ST = {
    v: '<span class="st v"><i>✓</i>Verified</span>',
    p: '<span class="st p"><i>◐</i>Pending evidence</span>',
    n: '<span class="st n"><i>✕</i>Not verified</span>'
  };
  var DATA = {
    ffs: { n: "Freedom Fire &amp; Safety Ltd", says: "The operating business: fire-safety equipment, installation and compliance work for homes and businesses.",
      st: "v", why: " — company 13589467, active, incorporated 27 August 2021.", u: CH + "company/13589467", ul: "Companies House record" },
    global: { n: "Freedom Global", says: "Described as “Freedom Global Ltd”, the multi-brand ecommerce company, trading as Freedom Fire &amp; Safety Ltd.",
      st: "n", why: " — no company of this name at the registered office, and the founder's only registered directorship is Freedom Fire &amp; Safety Ltd.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    distribution: { n: "Freedom Distribution", says: "Planned trade distribution and wholesale company.",
      st: "n", why: " — not on the register as a company connected to the founder.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    facilities: { n: "Freedom Facilities", says: "Planned compliance, servicing and facilities company.",
      st: "n", why: " — not on the register as a company connected to the founder.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    firestorm: { n: "Firestorm", says: "A fire-safety brand the company states it owns, with a trademark claimed.", st: "p", why: " — trademark number not yet supplied.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    voltz: { n: "Voltz", says: "A brand the company states it owns, with a trademark claimed.", st: "p", why: " — trademark number not yet supplied.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    kunergy: { n: "Kunergy", says: "A brand the company states it owns, with a trademark claimed.", st: "p", why: " — trademark number not yet supplied.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    t3: { n: "T3", says: "A brand the company states it owns, with a trademark claimed.", st: "p", why: " — trademark number not yet supplied.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    crystal: { n: "Crystal Cleaning Solutions", says: "A cleaning brand the company states it owns, with a trademark claimed.", st: "p", why: " — trademark number not yet supplied.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    form: { n: "Freedom Form", says: "A commercial property venture the company describes for 2029 onwards.", st: "n", why: " — stated intent only; no company exists.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    freight: { n: "Freedom Freight", says: "A logistics and freight venture the company describes for 2029 onwards.", st: "n", why: " — stated intent only; no company exists.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    fly: { n: "Freedom Fly", says: "A drone-services venture the company describes for 2029 onwards.", st: "n", why: " — stated intent only; no company exists.", u: "https://freedomgroup.uk/", ul: "The company's description" },
    fuel: { n: "Freedom Fuel", says: "A forecourt and convenience-retail venture the company describes for 2029 onwards.", st: "n", why: " — stated intent only; no company exists.", u: "https://freedomgroup.uk/", ul: "The company's description" }
  };
  var pN = $("#pName"), pS = $("#pSays"), pSt = $("#pStatus"), pC = $("#pChecked"), pG = $("#pGo");
  $$(".node").forEach(function (nd) {
    nd.addEventListener("click", function () {
      $$(".node").forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
      nd.setAttribute("aria-pressed", "true");
      var d = DATA[nd.dataset.k];
      if (!d || !pN) return;
      pN.innerHTML = d.n; pS.innerHTML = d.says; pSt.innerHTML = ST[d.st] + d.why; pC.textContent = checked;
      pG.href = d.u; pG.textContent = d.ul + " ↗";
    });
  });

  /* ══ SECTION SHEET (small screens) ════════════════════════ */
  var burger = $("#burger"), sheet = $("#sheet"), sheetClose = $("#sheetClose");
  function sheetOn(o) {
    var was = sheet.classList.contains("on");
    sheet.classList.toggle("on", o); sheet.hidden = !o;
    burger.setAttribute("aria-expanded", o);
    document.documentElement.style.overflow = o ? "hidden" : "";
    if (o) sheetClose.focus(); else if (was) burger.focus();
  }
  if (burger && sheet) {
    burger.addEventListener("click", function () { sheetOn(!sheet.classList.contains("on")); });
    sheetClose.addEventListener("click", function () { sheetOn(false); });
    sheet.addEventListener("click", function (e) { if (e.target.closest("a")) sheetOn(false); });
    window.addEventListener("keydown", function (e) {
      if (!sheet.classList.contains("on")) return;
      if (e.key === "Escape") { sheetOn(false); return; }
      if (e.key !== "Tab") return;
      var f = $$("button, a[href]", sheet), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ══ THE RECORD: print, and staleness ═════════════════════ */
  var printBtn = $("#printBtn");
  if (printBtn && window.print) { printBtn.hidden = false; printBtn.addEventListener("click", function () { window.print(); }); }
  var checkedOn = $("#checkedOn"), recMeta = $("#recMeta");
  if (checkedOn && recMeta) {
    var then = new Date(checkedOn.getAttribute("datetime") + "T00:00:00");
    var days = (Date.now() - then.getTime()) / 86400000;
    if (days > 90) recMeta.classList.add("is-stale");
  }
})();
