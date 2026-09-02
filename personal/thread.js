/* ══════════════════════════════════════════════════════════════════
   THE FREEDOM LINE — engine
   One rAF loop drives everything: the thread drawn through every
   chapter, the pinned 2021 scene, the hero choreography, the cursor,
   the magnetic elements and the velocity marquees. Native scrolling
   throughout; prefers-reduced-motion collapses it all to a still,
   fully readable page.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia &&
    window.matchMedia("(pointer: fine)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };

  /* ── entrance ─────────────────────────────────────────────── */
  function ready() { document.body.classList.add("ready"); }
  if (reduce) { ready(); }
  else if (document.readyState === "complete") { setTimeout(ready, 900); }
  else { window.addEventListener("load", function () { setTimeout(ready, 900); }); }

  /* ── portrait load ────────────────────────────────────────── */
  var shot = $("#shot"), shotWrap = $("#shotWrap");
  function lit() { if (shot) shot.classList.add("on"); }
  if (shot) {
    shot.complete ? lit()
      : (shot.addEventListener("load", lit), shot.addEventListener("error", lit));
  }

  /* ── split headlines: words for h2, letters for the name ──── */
  function split(el, mode, step) {
    var parts = mode === "letters"
      ? el.textContent.split("")
      : el.textContent.trim().split(/\s+/);
    el.textContent = "";
    parts.forEach(function (t, i) {
      if (mode === "letters" && t === " ") { el.appendChild(document.createTextNode(" ")); return; }
      var box = document.createElement("span"); box.className = "wa";
      var ink = document.createElement("i"); ink.textContent = t;
      ink.style.setProperty("--d", (i * step) + "s");
      box.appendChild(ink); el.appendChild(box);
      if (mode !== "letters" && i < parts.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }
  if (!reduce) {
    $$(".ch h2, .rec-head h2").forEach(function (el) { split(el, "words", 0.055); });
    $$(".hero-type h1 span").forEach(function (el) { split(el, "letters", 0.045); });
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

  var PLAN = [
    { id: "top",  x: 0.10, y: 0.72 },
    { id: "ones", x: 0.50, y: 0.50, noKnot: true },
    { id: "c01",  x: 0.14, y: 0.42 },
    { id: "c02",  x: 0.86, y: 0.42 },
    { id: "c03",  x: 0.16, y: 0.42 },
    { id: "c04",  x: 0.50, y: 0.40 },
    { id: "c05",  x: 0.84, y: 0.42 },
    { id: "c06",  x: 0.15, y: 0.42 },
    { id: "c07",  x: 0.50, y: 0.52 }
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
      pts.push({ x: W * p.x, y: el.offsetTop + el.offsetHeight * p.y,
                 id: p.id, el: el, noKnot: !!p.noKnot });
    });
    if (pts.length < 2) return false;
    pts.push({ x: W * 0.5, y: H + 40, id: "beyond", el: null, noKnot: true });

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

    knots.forEach(function (k) { k.remove(); });
    knots = []; knotAt = [];
    var SAMPLES = 280, samples = [];
    for (var s = 0; s <= SAMPLES; s++) {
      var pt = live.getPointAtLength(totalLen * s / SAMPLES);
      samples.push({ x: pt.x, y: pt.y, l: totalLen * s / SAMPLES });
    }
    pts.forEach(function (p) {
      if (p.noKnot || p.id === "beyond") return;
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
    var h = explore.offsetHeight || 1;
    var p = clamp((y + window.innerHeight * 0.62) / h, 0, 1);
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

  /* ══ CURSOR ═══════════════════════════════════════════════ */
  var cur = $("#cur"), curDot = $("#curDot"), curRing = $("#curRing");
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, curSeen = false;
  if (fine && !reduce && cur) {
    document.documentElement.classList.add("cur-on");
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY; curSeen = true;
      var t = e.target;
      var hot = t.closest && t.closest("a,button,summary,[data-mag],.node");
      cur.classList.toggle("big", !!hot);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cur.style.opacity = "1"; });
  }

  /* ── magnetic elements ────────────────────────────────────── */
  if (fine && !reduce) {
    $$("[data-mag]").forEach(function (el) {
      var tx = 0, ty = 0, cx = 0, cy = 0, on = false, raf = null;
      function tick() {
        cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
        el.style.transform = "translate(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px)";
        if (on || Math.abs(cx) > 0.1 || Math.abs(cy) > 0.1) raf = requestAnimationFrame(tick);
        else { el.style.transform = ""; raf = null; }
      }
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * 0.32;
        ty = (e.clientY - r.top - r.height / 2) * 0.32;
        on = true; if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener("mouseleave", function () { tx = 0; ty = 0; on = false; });
    });
  }

  /* ══ MARQUEES ═════════════════════════════════════════════ */
  var marquees = [];
  $$(".mq-t").forEach(function (t) {
    var base = t.getAttribute("data-base") || "";
    var html = "";
    for (var i = 0; i < 6; i++) html += "<span>" + base + "</span>";
    t.innerHTML = html;
    marquees.push({ el: t, x: 0, dir: +(t.getAttribute("data-mq") || 1), w: 0 });
  });
  function measureMarquees() {
    marquees.forEach(function (m) {
      var first = m.el.firstElementChild;
      m.w = first ? first.offsetWidth : 0;
    });
  }

  /* ══ PINNED SCENE — 2021 ══════════════════════════════════ */
  var scene = $("#ones"), phrases = $$("#phs .ph");
  var sceneTop = 0, sceneRange = 1;
  function measureScene() {
    if (!scene) return;
    var r = scene.getBoundingClientRect();
    sceneTop = r.top + (window.pageYOffset || document.documentElement.scrollTop);
    sceneRange = Math.max(1, scene.offsetHeight - window.innerHeight);
  }
  function runScene(y) {
    if (!scene || reduce || window.innerWidth <= 820) return;
    var p = clamp((y - sceneTop) / sceneRange, 0, 1);
    var idx = Math.min(phrases.length - 1, Math.floor(p * phrases.length));
    phrases.forEach(function (ph, i) { ph.classList.toggle("on", i === idx); });
  }

  /* ══ HERO CHOREOGRAPHY ════════════════════════════════════ */
  var hero = $(".hero"), heroSpans = $$(".hero-type h1 span"),
      heroSub = $(".hero-sub"), followBtn = $(".follow");
  var tiltX = 0, tiltY = 0;

  /* ══ MASTER LOOP ══════════════════════════════════════════ */
  var chapters = $$("#explore .ch, #explore .hero, #explore .scene");
  var chrome = $("#chrome"), spine = $$(".spine a");
  var lastY = -1, velY = 0;

  function frame() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var moved = y !== lastY;
    velY = lerp(velY, moved ? y - lastY : 0, 0.12);
    lastY = y;

    /* cursor */
    if (fine && !reduce && curSeen) {
      curDot.style.transform = "translate(" + mx + "px," + my + "px)";
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      curRing.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    }

    /* marquees — velocity-reactive */
    if (!reduce) {
      marquees.forEach(function (m) {
        if (!m.w) return;
        m.x -= m.dir * (0.55 + Math.min(6, Math.abs(velY) * 0.12));
        if (m.x <= -m.w) m.x += m.w;
        if (m.x > 0) m.x -= m.w;
        m.el.style.transform = "translate3d(" + m.x.toFixed(1) + "px,0,0)";
      });
    }

    if (moved || velY !== 0) {
      if (chrome) chrome.classList.toggle("stuck", y > 40);

      /* hero: name lines drift apart, sub fades, portrait parallax + tilt */
      if (hero && !reduce) {
        var hp = clamp(y / (hero.offsetHeight || 1), 0, 1);
        if (heroSpans[0]) heroSpans[0].style.transform = "translate3d(" + (hp * -40) + "px," + (hp * -70) + "px,0)";
        if (heroSpans[1]) heroSpans[1].style.transform = "translate3d(" + (hp * 40) + "px," + (hp * -34) + "px,0)";
        if (heroSub) heroSub.style.opacity = String(1 - hp * 1.6);
        if (followBtn) followBtn.style.opacity = String(1 - hp * 2);
        if (shotWrap) {
          shotWrap.style.transform = "translate3d(" + tiltX.toFixed(1) + "px," +
            (hp * -46 + tiltY).toFixed(1) + "px,0)";
        }
      }

      /* floor image drifts inside its crop */
      var floor = $("#floorShot");
      if (floor && !reduce) {
        var fr = floor.getBoundingClientRect();
        var fp = clamp((window.innerHeight - fr.top) / (window.innerHeight + fr.height), 0, 1);
        floor.style.transform = "translate3d(0," + ((fp - 0.5) * 46).toFixed(1) + "px,0) scale(1.08)";
      }

      /* chrome tone + spine */
      var mid = y + 90, dark = false, cur2 = null;
      chapters.forEach(function (s) {
        var top = s.offsetTop, bot = top + s.offsetHeight;
        if (mid >= top && mid < bot)
          dark = s.classList.contains("dark") || s.classList.contains("scene");
        if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur2 = s.id;
      });
      var exploring = document.body.dataset.view === "explore";
      document.body.classList.toggle("dark-chrome", dark && exploring);
      spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });

      if (exploring) { drawThread(y); runScene(y); }
    }
    requestAnimationFrame(frame);
  }

  /* portrait mouse tilt */
  if (fine && !reduce) {
    window.addEventListener("mousemove", function (e) {
      tiltX = (e.clientX / innerWidth - 0.5) * 14;
      tiltY = (e.clientY / innerHeight - 0.5) * 10;
    }, { passive: true });
  }

  /* fall back to plain scroll handling when reduced motion is on */
  if (reduce) {
    function still() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (chrome) chrome.classList.toggle("stuck", y > 40);
      var mid = y + 90, dark = false, cur2 = null;
      chapters.forEach(function (s) {
        var top = s.offsetTop, bot = top + s.offsetHeight;
        if (mid >= top && mid < bot)
          dark = s.classList.contains("dark") || s.classList.contains("scene");
        if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur2 = s.id;
      });
      var exploring = document.body.dataset.view === "explore";
      document.body.classList.toggle("dark-chrome", dark && exploring);
      spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });
      if (exploring) drawThread(y);
    }
    window.addEventListener("scroll", still, { passive: true });
    still();
  } else {
    requestAnimationFrame(frame);
  }

  /* ── rebuild on layout shifts ─────────────────────────────── */
  var rebuildTimer = null;
  function rebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () {
      buildPath(); measureScene(); measureMarquees(); lastY = -1;
    }, 140);
  }
  window.addEventListener("resize", rebuild);
  window.addEventListener("load", rebuild);
  if ("ResizeObserver" in window && explore) new ResizeObserver(rebuild).observe(explore);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  buildPath(); measureScene(); measureMarquees();

  /* ══ EXPLORE ⇄ VERIFIED RECORD (pink wipe) ════════════════ */
  var mE = $("#mExplore"), mR = $("#mRecord"), wipe = $("#wipe");
  function applyView(v) {
    document.body.dataset.view = v;
    mE.setAttribute("aria-pressed", v === "explore");
    mR.setAttribute("aria-pressed", v === "record");
    if (v === "record") document.body.classList.remove("dark-chrome");
    window.scrollTo(0, 0);
    if (v === "explore") rebuild();
  }
  function setView(v) {
    if (document.body.dataset.view === v) return;
    if (reduce || !wipe || !wipe.animate) { applyView(v); return; }
    wipe.style.transformOrigin = "bottom";
    wipe.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
      { duration: 300, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" })
      .onfinish = function () {
        applyView(v);
        wipe.style.transformOrigin = "top";
        wipe.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
          { duration: 340, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" });
      };
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
