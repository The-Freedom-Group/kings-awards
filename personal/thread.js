/* ══════════════════════════════════════════════════════════════════
   THE FREEDOM LINE
   One path is generated from the real position of every chapter, then
   drawn as the reader descends. A lit head rides the leading edge and
   each chapter knot ignites as the line reaches it.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* ── entrance ─────────────────────────────────────────────── */
  function ready() { document.body.classList.add("ready"); }
  if (reduce) { ready(); }
  else if (document.readyState === "complete") { setTimeout(ready, 900); }
  else { window.addEventListener("load", function () { setTimeout(ready, 900); }); }

  /* ── portrait ─────────────────────────────────────────────── */
  var shot = $("#shot"), shotWrap = $(".hero-shot");
  function lit() { if (shot) shot.classList.add("on"); }
  if (shot) {
    shot.complete ? lit()
      : (shot.addEventListener("load", lit), shot.addEventListener("error", lit));
  }

  /* ── headlines assemble word by word ──────────────────────── */
  if (!reduce) {
    $$(".ch h2, .rec-head h2, .hero-type h1 span").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      words.forEach(function (w, i) {
        var box = document.createElement("span"); box.className = "wa";
        var ink = document.createElement("i"); ink.textContent = w;
        ink.style.setProperty("--d", (i * 0.055) + "s");
        box.appendChild(ink); el.appendChild(box);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ── stagger groups ───────────────────────────────────────── */
  function stagger(sel, child, step) {
    $$(sel).forEach(function (g) {
      $$(child, g).forEach(function (c, i) { c.style.setProperty("--d", (i * step) + "s"); });
    });
  }
  stagger(".metrics", ".metric", 0.09);
  stagger(".grp-list", "li", 0.05);
  stagger(".map", ".node", 0.07);

  /* ── hero branch lines ────────────────────────────────────── */
  $$(".draw").forEach(function (p) {
    var L = 2000; try { L = p.getTotalLength(); } catch (e) {}
    p.style.setProperty("--len", L);
  });

  /* ── construct on entry, deconstruct on exit ──────────────── */
  var watched = $$(".rv, .draw, .map, .plate");
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle("in", en.isIntersecting); });
    }, { rootMargin: "-4% 0px -10% 0px", threshold: 0.06 });
    watched.forEach(function (e) { io.observe(e); });
  }

  var heroType = $(".hero-type");
  if (heroType) {
    reduce ? heroType.classList.add("in")
           : setTimeout(function () { heroType.classList.add("in"); }, 1250);
  }

  /* ── metric counters ──────────────────────────────────────── */
  var counters = $$(".metric .v").filter(function (v) { return /^\d+$/.test(v.textContent.trim()); });
  counters.forEach(function (v) { v.dataset.to = v.textContent.trim(); });
  function countUp(v) {
    var to = +v.dataset.to, t0 = null, dur = 1100;
    if (reduce) { v.textContent = to; return; }
    (function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      v.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ("IntersectionObserver" in window && !reduce) {
    var ioc = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) countUp(en.target); else en.target.textContent = "0";
      });
    }, { threshold: 0.5 });
    counters.forEach(function (v) { v.textContent = "0"; ioc.observe(v); });
  }

  /* ══ THE THREAD ═══════════════════════════════════════════ */
  var explore = $("#explore"),
      thread  = $("#thread"),
      svg     = $("#threadSvg"),
      track   = $("#tTrack"),
      live    = $("#tLive"),
      head    = $("#tHead");

  // which side of the page each chapter sits on, in document order
  var PLAN = [
    { id: "top", x: 0.10, y: 0.72 },
    { id: "c01", x: 0.14, y: 0.42 },
    { id: "c02", x: 0.86, y: 0.42 },
    { id: "c03", x: 0.16, y: 0.42 },
    { id: "c04", x: 0.50, y: 0.40 },
    { id: "c05", x: 0.84, y: 0.42 },
    { id: "c06", x: 0.15, y: 0.42 },
    { id: "c07", x: 0.50, y: 0.52 }
  ];

  var pts = [], knots = [], totalLen = 0, knotAt = [];

  function buildPath() {
    if (!explore || !thread || !svg) return false;
    if (window.innerWidth <= 820) { thread.style.display = "none"; return false; }
    thread.style.display = "";

    var W = explore.offsetWidth, H = explore.offsetHeight;
    if (!W || !H) return false;

    pts = [];
    PLAN.forEach(function (p) {
      var el = document.getElementById(p.id);
      if (!el) return;
      pts.push({ x: W * p.x, y: el.offsetTop + el.offsetHeight * p.y, id: p.id, el: el });
    });
    if (pts.length < 2) return false;
    // leave the page unfinished, running off the bottom edge
    pts.push({ x: W * 0.5, y: H + 40, id: "beyond", el: null });

    var d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dy = (b.y - a.y) * 0.5;
      d += " C " + a.x.toFixed(1) + " " + (a.y + dy).toFixed(1) +
           ", " + b.x.toFixed(1) + " " + (b.y - dy).toFixed(1) +
           ", " + b.x.toFixed(1) + " " + b.y.toFixed(1);
    }

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    track.setAttribute("d", d);
    live.setAttribute("d", d);

    try { totalLen = live.getTotalLength(); } catch (e) { totalLen = 0; }
    if (!totalLen) return false;
    live.style.strokeDasharray = totalLen;
    live.style.strokeDashoffset = totalLen;

    // a knot at every chapter, and the length along the path where it sits
    knots.forEach(function (k) { k.remove(); });
    knots = []; knotAt = [];
    var SAMPLES = 260, samples = [];
    for (var s = 0; s <= SAMPLES; s++) {
      var pt = live.getPointAtLength(totalLen * s / SAMPLES);
      samples.push({ x: pt.x, y: pt.y, l: totalLen * s / SAMPLES });
    }
    pts.forEach(function (p) {
      if (p.id === "beyond") return;
      var best = samples[0], bd = Infinity;
      samples.forEach(function (sp) {
        var dd = (sp.x - p.x) * (sp.x - p.x) + (sp.y - p.y) * (sp.y - p.y);
        if (dd < bd) { bd = dd; best = sp; }
      });
      var k = document.createElement("i");
      k.className = "knot" + (p.el && p.el.classList.contains("dark") ? " dk" : "");
      k.style.left = p.x + "px"; k.style.top = p.y + "px";
      thread.appendChild(k);
      knots.push(k); knotAt.push(best.l / totalLen);
    });
    return true;
  }

  function drawThread(y) {
    if (!totalLen || thread.style.display === "none") return;
    var top = explore.offsetTop, h = explore.offsetHeight || 1;
    var p = clamp((y + window.innerHeight * 0.62 - top) / h, 0, 1);

    live.style.strokeDashoffset = totalLen * (1 - p);
    thread.classList.toggle("on", p > 0.004 && p < 0.999);

    if (p > 0.004) {
      var pt = live.getPointAtLength(totalLen * p);
      head.style.left = pt.x + "px";
      head.style.top  = pt.y + "px";
    }
    for (var i = 0; i < knots.length; i++) {
      knots[i].classList.toggle("hit", p >= knotAt[i]);
    }
  }

  /* ── scroll loop ──────────────────────────────────────────── */
  var chapters = $$("#explore .ch, #explore .hero");
  var chrome = $("#chrome"), spine = $$(".spine a"), hero = $(".hero"), ticking = false;

  function frame() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (chrome) chrome.classList.toggle("stuck", y > 40);

    if (shotWrap && hero && !reduce) {
      var k = clamp(y / (hero.offsetHeight || 1), 0, 1);
      shotWrap.style.transform = "translate3d(0," + (k * -46) + "px,0)";
    }

    var mid = y + 90, dark = false, cur = null;
    chapters.forEach(function (s) {
      var top = s.offsetTop, bot = top + s.offsetHeight;
      if (mid >= top && mid < bot) dark = s.classList.contains("dark");
      if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur = s.id;
    });
    var exploring = document.body.dataset.view === "explore";
    document.body.classList.toggle("dark-chrome", dark && exploring);
    spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur); });

    if (exploring) drawThread(y);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });

  /* rebuild when the layout can have moved */
  var rebuildTimer = null;
  function rebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () { buildPath(); frame(); }, 140);
  }
  window.addEventListener("resize", rebuild);
  window.addEventListener("load", rebuild);
  if ("ResizeObserver" in window && explore) new ResizeObserver(rebuild).observe(explore);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  buildPath(); frame();

  /* ── explore ⇄ verified record ────────────────────────────── */
  var mE = $("#mExplore"), mR = $("#mRecord");
  function setView(v) {
    document.body.dataset.view = v;
    mE.setAttribute("aria-pressed", v === "explore");
    mR.setAttribute("aria-pressed", v === "record");
    if (v === "record") document.body.classList.remove("dark-chrome");
    window.scrollTo(0, 0);
    if (v === "explore") rebuild(); else frame();
  }
  if (mE && mR) {
    mE.addEventListener("click", function () { setView("explore"); });
    mR.addEventListener("click", function () { setView("record"); });
  }

  /* ── map ⇄ list ───────────────────────────────────────────── */
  var vM = $("#vMap"), vL = $("#vList");
  function setGrp(g) {
    document.body.dataset.grp = g;
    vM.setAttribute("aria-pressed", g === "map");
    vL.setAttribute("aria-pressed", g === "list");
    rebuild();
  }
  if (vM && vL) {
    vM.addEventListener("click", function () { setGrp("map"); });
    vL.addEventListener("click", function () { setGrp("list"); });
  }

  /* ── the group map ────────────────────────────────────────── */
  var DATA = {
    group:     { n: "Freedom Group", t: "The holding structure.",
                 b: "One group, built so each venture is a separate operating company rather than another department." },
    fire:      { n: "Freedom Fire &amp; Safety", t: "The business that started it.",
                 b: "Fire safety products, installation and compliance — serving homes and businesses across the UK." },
    global:    { n: "Freedom Global", t: "Operating.",
                 b: "TK — one line on what Freedom Global does today, and the date it began trading." },
    dist:      { n: "Freedom Distribution", t: "Operating.",
                 b: "TK — one line on the distribution arm, and the date it began trading." },
    fac:       { n: "Freedom Facilities", t: "Launching.",
                 b: "TK — what it will do, and when it launches. Not yet trading." },
    hepa:      { n: "Hepa Fellas", t: "Launching.",
                 b: "TK — what it will do, and when it launches. Not yet trading." },
    firestorm: { n: "Firestorm", t: "Planned.", b: "TK — planned brand. Not yet trading." },
    voltz:     { n: "Voltz", t: "Planned.", b: "TK — planned brand. Not yet trading." },
    kunergy:   { n: "Kunergy", t: "Planned.", b: "TK — planned brand. Not yet trading." },
    t3:        { n: "T3", t: "Planned.", b: "TK — planned brand. Not yet trading." }
  };
  var pN = $("#pName"), pT = $("#pTag"), pB = $("#pBody"), pG = $("#pGo"), panel = $("#panel");
  $$(".node").forEach(function (nd) {
    nd.addEventListener("click", function () {
      $$(".node").forEach(function (o) { o.classList.remove("sel"); });
      nd.classList.add("sel");
      var d = DATA[nd.dataset.k];
      if (!d || !pN) return;
      pN.innerHTML = d.n; pT.textContent = d.t; pB.textContent = d.b;
      pG.style.display = nd.dataset.s === "future" ? "none" : "";
      if (!reduce && panel && panel.animate) {
        panel.animate(
          [{ opacity: 0.15, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 420, easing: "cubic-bezier(.2,.8,.25,1)" });
      }
    });
  });

  /* ── chapter sheet ────────────────────────────────────────── */
  var burger = $("#burger"), sheet = $("#sheet");
  function sheetOn(o) {
    sheet.classList.toggle("on", o);
    burger.setAttribute("aria-expanded", o);
    document.documentElement.style.overflow = o ? "hidden" : "";
  }
  if (burger && sheet) {
    burger.addEventListener("click", function () { sheetOn(!sheet.classList.contains("on")); });
    $("#sheetClose").addEventListener("click", function () { sheetOn(false); });
    sheet.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target === sheet) sheetOn(false);
    });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") sheetOn(false); });
  }
})();
