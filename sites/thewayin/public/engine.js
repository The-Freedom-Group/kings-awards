/* ══════════════════════════════════════════════════════════════════
   THE WAY IN — engine (GSAP: ScrollTrigger, ScrollSmoother, SplitText)
   The preloader, the hero lines rising out of their masks, the ring
   cursor, smooth scrolling with parallax, separators that grow,
   headings that arrive a word at a time, the black-to-paper wipe,
   the escape-route strip lit as far as you have read, four signs
   that turn over, a floor plan that lights station by station, nine
   tiles ticked present as each arrives, the profile sheet, the
   two-year inspection tag, the closing line letter by letter, and
   the extinguisher that rides the page.
   Everything falls back to a plain, readable page without GSAP.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var pad2 = function (x) { return x < 10 ? "0" + x : "" + x; };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined" && typeof window.ScrollSmoother !== "undefined" && typeof window.SplitText !== "undefined";
  var html = document.documentElement;

  if (!hasGsap) { html.classList.add("no-gsap"); var h0 = $("#top"); if (h0) h0.classList.add("open"); }
  else {
    html.classList.add("has-gsap");
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
    gsap.config({ nullTargetWarn: false });
    gsap.defaults({ duration: 1 });
  }
  var animate = hasGsap && !reduce;

  /* ── smooth scrolling ─────────────────────────────────────── */
  var smoother = null;
  if (animate) smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1, smoothTouch: 0.4, normalizeScroll: true, ignoreMobileResize: true, effects: true });
  window.__smoother = smoother;
  function scrollY() { return smoother ? smoother.scrollTop() : (window.pageYOffset || html.scrollTop); }
  function scrollTo(target) {
    var el = typeof target === "string" ? $(target) : target; if (!el) return;
    if (el.id === "top") { if (smoother) smoother.scrollTo(0, true); else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); return; }
    if (smoother) smoother.scrollTo(el, true, "top 80px");
    else { var y = el.getBoundingClientRect().top + (window.pageYOffset || html.scrollTop) - 80; window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); }
  }
  $$('a[href^="#"]').forEach(function (a) { a.addEventListener("click", function (e) { var h = a.getAttribute("href"); if (h.length > 1 && $(h)) { e.preventDefault(); closeMenu(); scrollTo(h); } }); });

  /* ── menu ─────────────────────────────────────────────────── */
  var menu = $("#menu"), burger = $("#burger"), menuX = $("#menuX");
  function closeMenu() { if (menu) { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); document.body.classList.remove("menu-open"); } }
  if (burger) burger.addEventListener("click", function () { menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); document.body.classList.add("menu-open"); });
  if (menuX) menuX.addEventListener("click", closeMenu);

  /* ── the cursor ───────────────────────────────────────────── */
  var dot = $("#curDot"), ring = $("#curRing");
  if (dot && ring && fine && hasGsap) {
    var px = -100, py = -100, rx = -100, ry = -100, shown = false, lpx = -100, lpy = -100, cvx = 0, cvy = 0, idleT = null, curLbl = $("#curLbl");
    window.addEventListener("mousemove", function (e) {
      px = e.clientX; py = e.clientY; if (!shown) { shown = true; rx = px; ry = py; lpx = px; lpy = py; }
      document.body.classList.remove("cur-idle"); clearTimeout(idleT); idleT = setTimeout(function () { document.body.classList.add("cur-idle"); }, 3500);
    }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      var lab = e.target.closest && e.target.closest("[data-cur-label]");
      var t = e.target.closest && e.target.closest("[data-cur], .tile, .founder, .sq, .totop, .pclose, .pnav button, .menu a, .menu .x, .more summary, a, button");
      document.body.classList.toggle("cur-label", !!lab);
      document.body.classList.toggle("cur-big", !!t && !lab);
      if (lab && curLbl) curLbl.textContent = lab.getAttribute("data-cur-label");
      document.body.classList.toggle("cur-off", !!(e.target.closest && e.target.closest("input, textarea, select")));
    });
    window.addEventListener("mousedown", function () { document.body.classList.add("cur-down"); });
    window.addEventListener("mouseup", function () { document.body.classList.remove("cur-down"); });
    document.addEventListener("mouseleave", function () { document.body.classList.add("cur-off"); });
    document.addEventListener("mouseenter", function () { document.body.classList.remove("cur-off"); });
    (function loop() {
      dot.style.transform = "translate(" + px + "px," + py + "px)";
      rx += (px - rx) * 0.18; ry += (py - ry) * 0.18;
      /* the ring leans into fast movement, squeezes on a press, and settles round when still */
      cvx += (px - lpx - cvx) * 0.2; cvy += (py - lpy - cvy) * 0.2; lpx = px; lpy = py;
      var sp = Math.min(Math.hypot(cvx, cvy), 40), k = document.body.classList.contains("cur-down") ? 0.82 : 1;
      var stretch = 1 + sp * 0.012, ang = sp > 1 ? Math.atan2(cvy, cvx) * 180 / Math.PI : 0;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) rotate(" + ang.toFixed(1) + "deg) scale(" + (stretch * k).toFixed(3) + "," + ((2 - stretch) * k).toFixed(3) + ") rotate(" + (-ang).toFixed(1) + "deg)";
      requestAnimationFrame(loop);
    })();
  }

  /* ── the extinguisher that rides the page ─────────────── */
  var progP = 0, progT = 0;
  function sizeCubes() {}

  /* ── the shutter opens as you scroll; without motion it stands open ── */
  var heroSec = $("#top");
  if (!animate && heroSec) { heroSec.classList.add("open"); var g0 = $("#gate"); if (g0) g0.remove(); }

  /* ── reveal (IO, works with or without the library) ──────── */
  var watched = $$(".rv, .flip");
  if (!("IntersectionObserver" in window) || reduce) watched.forEach(function (e) { e.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    watched.forEach(function (e) { io.observe(e); });
  }

  /* ── headline wipes, the fallback when there is no library ── */
  if (!hasGsap && !reduce) $$(".ch h2").forEach(function (h) {
    var parts = Array.prototype.slice.call(h.childNodes), i = 0;
    parts.forEach(function (nd) {
      if (nd.nodeType === 3 && nd.textContent.trim()) { var s = document.createElement("span"); s.className = "wipe"; s.style.setProperty("--d", (i++ * 0.18) + "s"); s.textContent = nd.textContent; h.replaceChild(s, nd); }
      else if (nd.nodeType === 1 && nd.tagName === "EM") { nd.classList.add("wipe"); nd.style.setProperty("--d", (i++ * 0.18) + "s"); }
    });
  });

  /* ── everything animated ──────────────────────────────────── */
  if (animate) {
    /* the entrance: the gate itself is the first thing seen. The company mark sits on the
       closed shutter, the housing lamp turns green, and the gate rolls up on its own with a
       lit edge and a wash of daylight; "Everyone deserves a way in." rises behind it, then the
       header and the foot of the hero arrive. Scrolling early hurries it; "Skip animation" ends it. */
    var gate = $("#gate");
    gsap.set("#slats", { yPercent: -102 });   /* the hero's own shutter already stands open behind the gate */
    gsap.set("#gSlats, #gate .rail, #gate .housing, #gStencil2", { autoAlpha: 0 });   /* first a black screen; the shutter arrives after the line */
    gsap.set(".hero .opened .line span", { y: "110%", rotation: 3 });
    gsap.set(".hero .opened .k, .hero .opened .strap, .hero .opened .cta", { autoAlpha: 0, y: 14 });
    var intro = gsap.timeline(); window.__intro = intro;
    setTimeout(function () { if (intro.progress() < 1) intro.progress(1); }, 15000);
    var skipAnim = $("#skipAnim"); if (skipAnim) skipAnim.addEventListener("click", function () { intro.progress(1); });
    var hurry = function () { if (intro.progress() < 1) intro.timeScale(2.5); };
    ["wheel", "touchstart", "keydown"].forEach(function (ev) { window.addEventListener(ev, hurry, { passive: true, once: true }); });
    var flSplit = new SplitText("#fl", { type: "chars" });
    /* the mark comes in and goes out again; the shutter arrives; the line is typed out on it */
    var typeSplit = new SplitText("#gType", { type: "chars" }), caret = $("#gCaret");
    gsap.set(typeSplit.chars, { autoAlpha: 0 });
    /* each letter appears in turn and the caret moves to sit right after it, so it follows the typing */
    var typing = gsap.timeline();
    typeSplit.chars.forEach(function (c, i) {
      typing.call(function () { gsap.set(c, { autoAlpha: 1 }); if (caret && c.after) c.after(caret); }, null, i * 0.055);
    });
    intro.fromTo("#gLogo", { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power3.out" }, 0.25)
      .to("#gLogo", { autoAlpha: 0, scale: 1.05, duration: .7, ease: "power2.in" }, 2.4)
      /* the line is typed on the black screen, holds, then fades; only then does the shutter appear */
      .set("#gStencil2", { autoAlpha: 1 }, 3.2)
      .call(function () { if (caret) caret.classList.add("on"); }, null, 3.2)
      .add(typing, 3.4)
      .call(function () { if (caret) { caret.classList.remove("on"); caret.classList.add("blink"); } }, null, 5.2)
      .call(function () { if (caret) caret.classList.remove("blink"); }, null, 5.9)
      .to("#gStencil2", { autoAlpha: 0, y: -12, duration: .7, ease: "power2.in" }, 5.8)
      .fromTo("#gSlats, #gate .rail, #gate .housing", { autoAlpha: 0 }, { autoAlpha: 1, duration: .9, ease: "power2.out" }, 6.5)
      .add("gate", 7.7)
      .call(function () { gate.classList.add("opening"); }, null, "gate")
      .fromTo("#gateEdge", { opacity: 0 }, { opacity: 1, duration: .5 }, "gate+=0.15")
      .to("#gSlats", { yPercent: -102, duration: 2.6, ease: "power3.inOut" }, "gate+=0.35")
      .to("#gate", { backgroundColor: "rgba(17,17,17,0)", duration: .6 }, "gate+=0.9")
      .fromTo("#gDay", { opacity: 0 }, { opacity: .3, duration: .7, ease: "power2.out" }, "gate+=1.25")
      .to("#gDay", { opacity: 0, duration: 1.1, ease: "power2.out" }, "gate+=1.95")
      .to("#gateEdge", { opacity: 0, duration: .5 }, "gate+=2.55")
      .call(function () { heroSec.classList.add("open"); }, null, "gate+=1.6")
      .fromTo("#hOpened", { autoAlpha: 0 }, { autoAlpha: 1, duration: .4 }, "gate+=1.6")
      .to(".hero .opened .line span", { y: "0%", rotation: 0, duration: 1.6, ease: "power4.out", stagger: .12 }, "gate+=1.75")
      .to(".hero .opened .k, .hero .opened .strap, .hero .opened .cta", { autoAlpha: 1, y: 0, duration: .9, stagger: .12 }, "gate+=2.3")
      .to("#gate .housing", { yPercent: -100, duration: .7, ease: "power2.in" }, "gate+=2.45")
      .fromTo("#chrome", { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 1 }, "gate+=2.5")
      .to("#gate", { autoAlpha: 0, duration: .5, onComplete: function () { gate.classList.add("done"); } }, "gate+=2.75")
      .fromTo("#fm", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, "gate+=2.9")
      .fromTo("#fr a", { autoAlpha: 0, x: "-1em" }, { autoAlpha: 1, x: "0em", duration: .9, stagger: { each: .15, from: "end" } }, "gate+=2.8")
      .fromTo(flSplit.chars, { autoAlpha: 0, x: "1em" }, { autoAlpha: 1, x: "0em", duration: .7, stagger: .05 }, "gate+=2.8");

    /* separators with text: 25% → 100% */
    $$(".sep.with-text").forEach(function (el) {
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 100%", end: "bottom 30%", scrub: 1 } })
        .fromTo(el, { width: "25%" }, { width: "100%", duration: 2 }, 1).fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, 1);
    });
    /* headings, a word at a time */
    $$("h2.fi, p.fi").forEach(function (el) {
      var st = new SplitText(el, { type: "words" });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 100%", end: "bottom 70%", scrub: 1 } })
        .fromTo(st.words, { autoAlpha: 0, y: "0.5em" }, { autoAlpha: 1, y: "0em", stagger: .1 }, 1);
    });
    $$(".fu-1").forEach(function (el) {
      var st = new SplitText(el, { type: "words" });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 100%", end: "bottom 70%", scrub: 1 } })
        .fromTo(st.words, { rotation: 3, autoAlpha: 0, y: "2rem" }, { rotation: 0, autoAlpha: 1, y: "0rem", stagger: .15, duration: 1.5 }, 1);
    });
    $$("h2.sl").forEach(function (el) {
      var st = new SplitText(el, { type: "words" });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 100%", end: "bottom 70%", scrub: 1 } })
        .fromTo(st.words, { autoAlpha: 0, x: "1em" }, { autoAlpha: 1, x: "0em", stagger: .1 }, 1);
    });
    $$("h2.wd").forEach(function (el) {
      var st = new SplitText(el, { type: "words" });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 95%", end: "bottom 60%", scrub: 1 } })
        .fromTo(st.words, { autoAlpha: 0, y: "0.6em", rotation: 2 }, { autoAlpha: 1, y: "0em", rotation: 0, stagger: .12 }, 0);
    });
    $$(".test.sl").forEach(function (el) {
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 100%", end: "bottom 75%", scrub: 1 } })
        .fromTo(el, { autoAlpha: 0, x: "1em" }, { autoAlpha: 1, x: "0em" }, 1);
    });
    /* the tiles */
    $$(".tile").forEach(function (t) {
      gsap.timeline({ scrollTrigger: { trigger: t, start: "top 100%", end: "top 55%", scrub: 1 } }).fromTo(t, { y: "6vh", autoAlpha: 0 }, { y: "0vh", autoAlpha: 1 }, 0);
      var big = $(".big", t); if (big) { gsap.set(big, { xPercent: -50 }); gsap.fromTo(big, { yPercent: -66 }, { yPercent: -36, ease: "none", scrollTrigger: { trigger: t, start: "top bottom", end: "bottom top", scrub: true } }); }
    });
    /* the inspection tag turns in */
    $$(".blur-box").forEach(function (b) {
      gsap.timeline({ scrollTrigger: { trigger: b, start: "top 100%", end: "bottom 80%", scrub: 1 } }).fromTo(b, { rotationZ: 2.5, autoAlpha: 0, x: "2.5vw" }, { rotationZ: 0, autoAlpha: 1, x: "0vw" }, .5);
    });
    /* the wipe from black to paper */
    var introSec = $(".intro");
    if (introSec) gsap.timeline({ scrollTrigger: { trigger: ".colour-divider", start: "center 60%", end: "center 20%", scrub: true,
      onUpdate: function (st) { introSec.classList.toggle("on-white", st.progress > .5); } } })
      .to(introSec, { backgroundColor: "#F4F4F1" }, 0);

    /* the call, letter by letter; the footer arriving */
    var ctaSplit = new SplitText(".cta-h", { type: "chars,words" });
    gsap.timeline({ scrollTrigger: { trigger: ".entrance", start: "top 80%", end: "bottom 70%", scrub: 2 } })
      .fromTo(ctaSplit.chars, { rotationZ: 3, autoAlpha: 0, x: "0.25em" }, { rotationZ: 0, autoAlpha: 1, x: "0em", stagger: .1 }, 0)
      .fromTo(".entrance .go .btn", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: .2 }, 1.2);
    gsap.timeline({ scrollTrigger: { trigger: "#footer", start: "top 90%", end: "bottom 95%", scrub: 2 } })
      .fromTo(".footer-item, footer h4, footer .ff", { rotationZ: 3, autoAlpha: 0, y: "1.5rem" }, { rotationZ: 0, autoAlpha: 1, y: "0rem", stagger: .1 }, 2);

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  } else if (hasGsap) {
    gsap.set(["#chrome", "#fm", "#fr a", "#fl"], { autoAlpha: 1 });
    gsap.set(".hero .line span", { y: 0 });
  }

  /* ── the route strip, the progress line, the chapter card ── */
  var hero = $("#top"), story = $("#story"), route = $("#route"), lit = $("#routeLit");
  var chapters = $$("#story .ch, #story .hero, #story .intro");
  var TITLES = { top: ["00", "The way in"], why: ["01", "Why it exists"], programme: ["02", "The route in"], people: ["03", "The people"],
    impact: ["04", "The impact"], partners: ["05", "The partners"], timeline: ["06", "The timeline"], learn: ["07", "How we learn"],
    next: ["08", "What comes next"] };
  /* the rail: a thin track from the foot of the hero to the end of the story, a red line
     that eases towards how far you have read, a lamp at its head, and a tick per chapter */
  var routeTrack = $("#routeTrack"), routeHead = $("#routeHead"), routeLbl = $("#routeLbl"), routeLblN = $("#routeLblN"), routeLblT = $("#routeLblT"), ticks = [], litP = 0, lastLit = 0, stillFrames = 99;
  function buildTicks() {
    ticks.forEach(function (t) { t.remove(); }); ticks = [];
    if (!route) return;
    chapters.forEach(function (sec) {
      if (sec.id === "top") return;
      var t = document.createElement("i"); t.className = "tick"; t.sec = sec; route.appendChild(t); ticks.push(t);
    });
  }
  function drawRoute(y) {
    if (!route || !lit || !story) return;
    var pageEl = $("#smooth-content") || document.body, vh = window.innerHeight;
    var H = pageEl.offsetHeight, top = hero ? hero.offsetHeight : 0, span = Math.max(1, H - 24 - top);
    /* the line reads ahead of the viewport, and arrives at the foot exactly when the page does */
    var target = clamp((y + vh * 0.58 - top) / Math.max(1, H - vh * 0.42 - top), 0, 1);
    litP = reduce ? target : litP + (target - litP) * 0.16;
    if (Math.abs(target - litP) < 0.0004) litP = target;
    var reach = top + litP * span;
    lit.style.top = top + "px"; lit.style.height = span + "px"; lit.style.transform = "scaleY(" + litP.toFixed(4) + ")";
    if (routeTrack) { routeTrack.style.top = top + "px"; routeTrack.style.height = span + "px"; }
    if (routeHead) routeHead.style.transform = "translate3d(0," + reach.toFixed(1) + "px,0)";
    /* the label beside the lamp names the chapter while you move, then goes quiet */
    var v = Math.abs(litP - lastLit) * span; lastLit = litP; stillFrames = v < 0.25 ? stillFrames + 1 : 0;
    route.classList.toggle("moving", stillFrames < 70);
    var here = null;
    for (var i = 0; i < ticks.length; i++) {
      var st = ticks[i].sec.offsetTop; ticks[i].style.top = st + "px"; ticks[i].classList.toggle("on", reach >= st - 2);
      if (reach >= st - 2) here = i;
    }
    for (var j = 0; j < ticks.length; j++) ticks[j].classList.toggle("here", j === here);
    if (routeLbl) {
      routeLbl.style.transform = "translate3d(0," + reach.toFixed(1) + "px,0) translateY(-50%)";
      var meta = here !== null ? (TITLES[ticks[here].sec.id] || ["00", "The way in"]) : ["00", "The way in"];
      if (routeLblN.textContent !== meta[0]) { routeLblN.textContent = meta[0]; routeLblT.textContent = meta[1]; }
    }
    route.classList.toggle("landed", litP >= 0.999);
  }
  var peopleSec = $("#people"), prog = $("#prog"), now = $("#now"), nowN = $("#nowN"), nowT = $("#nowT"), lastCard = "", lastY = -1;
  var floor = $("#floor"), stations = $$("#floor .st");
  function frame() {
    var y = scrollY();
    if (y !== lastY) {
      lastY = y;
      var probe = y + window.innerHeight * 0.42, cur = null;
      chapters.forEach(function (s) { if (probe >= s.offsetTop && probe < s.offsetTop + s.offsetHeight) cur = s.id; });
      if (!cur && chapters.length && probe >= chapters[chapters.length - 1].offsetTop) cur = chapters[chapters.length - 1].id;
      var mx = (html.scrollHeight - window.innerHeight) || 1, pr = clamp(y / mx, 0, 1);
      progT = pr;
      var meta = TITLES[cur]; if (meta && cur !== lastCard) { lastCard = cur; if (now) { nowN.textContent = meta[0]; nowT.textContent = meta[1]; } }
      if (now) now.classList.toggle("on", y > window.innerHeight * 0.5);
      if (floor && stations.length) { var r = floor.getBoundingClientRect(), lp = clamp((window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.25), 0, 1); floor.style.setProperty("--lp", lp.toFixed(3)); stations.forEach(function (st, k) { st.classList.toggle("lit", lp >= (k + 0.5) / stations.length); }); }
    }
    drawRoute(y);
    if (prog) { progP = reduce ? progT : progP + (progT - progP) * 0.16; if (Math.abs(progT - progP) < 0.0004) progP = progT; prog.style.transform = "scaleX(" + progP.toFixed(4) + ")"; }
    requestAnimationFrame(frame);
  }
  buildTicks();
  requestAnimationFrame(frame);
  var rebuildTimer = null;
  function rebuild() { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(function () { lastY = -1; sizeCubes(); }, 140); }
  window.addEventListener("resize", rebuild); window.addEventListener("load", rebuild);
  if ("ResizeObserver" in window && story) new ResizeObserver(rebuild).observe(story);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);

  /* ── four signs ───────────────────────────────────────────── */
  $$("#signs .sq").forEach(function (b) {
    b.addEventListener("click", function () { var on = !b.classList.contains("on"); b.classList.toggle("on", on); b.setAttribute("aria-expanded", on); });
  });

  /* ── the roll call: ticked present as each tile arrives ───── */
  var tiles = $$("#register .tile");
  if (!("IntersectionObserver" in window) || reduce) tiles.forEach(function (r) { r.classList.add("here"); });
  else {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting) return; rio.unobserve(en.target); var t = en.target; setTimeout(function () { t.classList.add("here"); }, 420); }); }, { threshold: 0.45 });
    tiles.forEach(function (r) { rio.observe(r); });
  }

  /* ── profiles ─────────────────────────────────────────────── */
  var prof = $("#prof"), pclose = $("#pclose"), lastEl = null, curIx = -1;
  var ACTS = { a: "a · work experience or careers advice", b: "b · mentoring", c: "c · interview and job-related training", d: "d · recruitment open to everyone" };
  function openProf(t) {
    if (!prof || !t) return; if (prof.hidden) lastEl = document.activeElement; curIx = tiles.indexOf(t);
    var d = t.dataset, approved = d.consent === "approved";
    prof.classList.toggle("pending", !approved);
    $("#pfName").textContent = d.name; $("#pfRole").textContent = d.role;
    $("#pfRoute").textContent = d.route; $("#pfRoute2").textContent = d.route; $("#pfBand").style.setProperty("--b", d.b || "#111");
    $("#pfSince").textContent = d.since || "";
    $("#pfSupport").textContent = d.support || ""; $("#pfSkills").textContent = d.skills || "";
    $("#pfResp").textContent = d.resp || ""; $("#pfNext").textContent = d.next || "";
    $$("#pfFields .opt").forEach(function (el) { el.style.display = el.querySelector("b").textContent ? "" : "none"; });
    $("#pfQ").textContent = "Film with " + d.name + ": to be recorded";
    var ov = $("#pfOv"); if (ov) ov.textContent = d.name + " · " + d.role;
    $("#pfVid").classList.toggle("wide", !!d.wide);
    $("#pfVid").style.setProperty("--a", getComputedStyle(t).getPropertyValue("--a"));
    var v = $("#pfVideo"), vid = $("#pfVid"), img = $("#pfImg"), note = $("#pfVnote");
    /* a film on Cloudflare Stream arrives as the Stream player; the master is never scaled by us */
    var oldFrame = vid.querySelector("iframe"); if (oldFrame) oldFrame.remove();
    var cust = document.body.getAttribute("data-stream-customer");
    if (d.stream && cust) {
      if (v) { v.pause(); v.removeAttribute("src"); v.hidden = true; }
      var fr = document.createElement("iframe");
      fr.src = "https://customer-" + cust + ".cloudflarestream.com/" + d.stream + "/iframe?preload=metadata&letterboxColor=%23000000";
      fr.allow = "accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"; fr.allowFullscreen = true;
      fr.title = "Film with " + d.name; fr.loading = "lazy";
      vid.appendChild(fr); vid.classList.add("has-video");
    } else if (v) { v.pause(); if (d.video) { if (v.getAttribute("src") !== d.video) v.src = d.video; v.poster = d.photo || ""; v.hidden = false; vid.classList.add("has-video"); } else { v.removeAttribute("src"); v.hidden = true; vid.classList.remove("has-video"); } }
    if (note) note.hidden = !(d.video || d.stream);
    if (img) { if (d.photo) { img.src = d.photo; img.hidden = false; } else { img.hidden = true; } }
    var doc = $("#pfDoc"); if (doc) { if (d.hascard && approved) { doc.textContent = d.doclabel || "See the card"; doc.hidden = false; } else { doc.hidden = true; } }
    var was = !prof.hidden; prof.hidden = false; document.body.classList.add("prof-open"); if (smoother) smoother.paused(true); if (hasGsap && ScrollTrigger.normalizeScroll()) ScrollTrigger.normalizeScroll().disable(); if (!was) pclose.focus();
    var inn = $(".prof-in"); if (inn) { inn.scrollTop = 0; inn.style.animation = "none"; void inn.offsetWidth; inn.style.animation = ""; }
  }
  function closeProf() { if (!prof || prof.hidden) return; var v0 = $("#pfVideo"); if (v0) v0.pause(); var fr0 = $("#pfVid iframe"); if (fr0) fr0.remove(); prof.hidden = true; document.body.classList.remove("prof-open"); if (smoother) smoother.paused(false); if (hasGsap && ScrollTrigger.normalizeScroll()) ScrollTrigger.normalizeScroll().enable(); if (lastEl && lastEl.focus) lastEl.focus(); }
  tiles.forEach(function (t) { t.addEventListener("click", function () { openProf(t); }); });
  if (pclose) pclose.addEventListener("click", closeProf);
  var pPrev = $("#pPrev"), pNext = $("#pNext");
  if (pPrev) pPrev.addEventListener("click", function () { openProf(tiles[(curIx - 1 + tiles.length) % tiles.length]); });
  if (pNext) pNext.addEventListener("click", function () { openProf(tiles[(curIx + 1) % tiles.length]); });
  if (prof) {
    prof.addEventListener("click", function (e) { if (e.target === prof) closeProf(); });
    window.addEventListener("keydown", function (e) {
      if (menu && menu.classList.contains("open") && e.key === "Escape") { closeMenu(); return; }
      if (prof.hidden) return;
      if (e.key === "Escape") { closeProf(); return; }
      if (e.key === "ArrowRight") { openProf(tiles[(curIx + 1) % tiles.length]); return; }
      if (e.key === "ArrowLeft") { openProf(tiles[(curIx - 1 + tiles.length) % tiles.length]); return; }
      if (e.key === "Tab") { var f = $$("button, a[href]", prof), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
  }

  /* ── the card from Josh's mum: a box on the page, never a file ── */
  (function () {
    var box = $("#cardbox"), x = $("#cardX"); if (!box) return;
    var lastFocus = null;
    function open() { lastFocus = document.activeElement; box.hidden = false; document.body.classList.add("card-open"); if (smoother) smoother.paused(true); if (hasGsap && ScrollTrigger.normalizeScroll()) ScrollTrigger.normalizeScroll().disable(); if (x) x.focus(); }
    function close() { if (box.hidden) return; box.hidden = true; document.body.classList.remove("card-open"); if (smoother && !document.body.classList.contains("prof-open")) { smoother.paused(false); if (hasGsap && ScrollTrigger.normalizeScroll()) ScrollTrigger.normalizeScroll().enable(); } if (lastFocus && lastFocus.focus) lastFocus.focus(); }
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-card]"); if (b && !b.hidden) { ev.preventDefault(); open(); return; }
      if (!box.hidden && ev.target === box) close();
    });
    if (x) x.addEventListener("click", close);
    window.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !box.hidden) { close(); ev.stopImmediatePropagation(); } }, true);
  })();

  /* ── "+" popovers: one floating panel beside the pressed button, kept on screen ── */
  (function () {
    var pop = $("#popover"), body = $("#popBody"), x = $("#popX"), cur = null;
    if (!pop || !body) return;
    function close() { if (!cur) return; cur.classList.remove("is-open"); cur.querySelector("summary").setAttribute("aria-expanded", "false"); cur = null; pop.classList.remove("on"); }
    function place(btn) {
      var r = btn.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight, pw = pop.offsetWidth, ph = pop.offsetHeight;
      /* above by preference, so the panel never covers the button or link beneath; below only when there is no room above */
      var left = clamp(r.left - 8, 16, W - pw - 16), above = r.top - 12 - ph > 16 || r.bottom + 12 + ph > H - 16;
      var top = above ? r.top - 12 - ph : r.bottom + 12;
      pop.style.left = left + "px"; pop.style.top = top + "px";
      pop.style.setProperty("--ax", clamp(r.left + r.width / 2 - left - 6, 14, pw - 26) + "px");
      pop.classList.toggle("above", above);
    }
    $$(".more").forEach(function (d) {
      var btn = d.querySelector("summary"), content = d.querySelector(".pop"); if (!btn || !content) return;
      btn.setAttribute("role", "button"); btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        if (cur === d) { close(); return; }
        close(); cur = d; d.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
        body.innerHTML = content.innerHTML; pop.classList.add("on"); place(btn);
      });
    });
    if (x) x.addEventListener("click", close);
    document.addEventListener("click", function (ev) { if (cur && !pop.contains(ev.target)) close(); });
    window.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
    window.addEventListener("resize", close);
    /* the panel follows its button while the page moves, and lets go if it leaves the screen */
    (function follow() { if (cur) { var r = cur.querySelector("summary").getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) close(); else place(cur.querySelector("summary")); } requestAnimationFrame(follow); })();
  })();

  /* ── the inspection tag ───────────────────────────────────── */
  var progStart = $("#progStart"), verdict = $("#verdict"), ruler = $("#ruler"), pin = $("#pin"), band = $("#band"), cut = $("#cut"), twoYearState = $("#twoYearState");
  var DEADLINE = new Date(2026, 8, 8), CUTOFF = new Date(2024, 8, 8), EPOCH0 = new Date(2021, 7, 27);
  function monthsBetween(a, b) { return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) - (b.getDate() < a.getDate() ? 1 : 0); }
  function fmt(d) { return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  function pct(d) { return clamp((d - EPOCH0) / (DEADLINE - EPOCH0), 0, 1) * 100; }
  if (band) band.style.width = pct(CUTOFF).toFixed(2) + "%"; if (cut) cut.style.left = pct(CUTOFF).toFixed(2) + "%";
  $$("#ruler .yr").forEach(function (y) { y.style.left = pct(new Date(+y.textContent, 0, 1)).toFixed(2) + "%"; });
  function judge() {
    if (!progStart.value) { verdict.innerHTML = "Enter the date of the earliest record."; if (ruler) ruler.classList.remove("set", "fail"); if (twoYearState) twoYearState.innerHTML = ""; return; }
    var d = new Date(progStart.value + "T00:00:00"); if (isNaN(d)) return;
    var m = monthsBetween(d, DEADLINE), ok = d <= CUTOFF;
    if (ok) verdict.innerHTML = "<b class='ok'>Passes.</b> By the closing date the programme will have run for " + Math.floor(m / 12) + " year" + (Math.floor(m / 12) === 1 ? "" : "s") + " and " + (m % 12) + " month" + (m % 12 === 1 ? "" : "s") + " — dated from " + fmt(d) + ". Keep that record.";
    else { var sh = Math.abs(monthsBetween(CUTOFF, d)); verdict.innerHTML = "<b>Not yet.</b> A record from " + fmt(d) + " is " + sh + " month" + (sh === 1 ? "" : "s") + " too young for this cycle. Unless an earlier record exists, this category waits a year."; }
    if (pin) pin.style.left = pct(d).toFixed(2) + "%"; if (ruler) { ruler.classList.add("set"); ruler.classList.toggle("fail", !ok); }
    if (twoYearState) twoYearState.innerHTML = ok ? "<span class='sign black'>✓ Passes on the date given</span>" : "<span class='sign red'>✕ Not yet, on the date given</span>";
  }
  if (progStart && verdict) progStart.addEventListener("input", judge);
  $$(".quick button").forEach(function (b) { b.addEventListener("click", function () { progStart.value = b.dataset.d; judge(); $$(".quick button").forEach(function (x) { x.classList.toggle("on", x === b); }); }); });

})();


/* ── phones: fold and unfold. Only acts below 820px ── */
(function () {
  var mq = window.matchMedia && window.matchMedia("(max-width: 820px)");
  function phone() { return mq && mq.matches; }
  document.addEventListener("click", function (ev) {
    if (!phone()) return;
    var t = ev.target;
    var li = t.closest && t.closest("ol.spine li"); if (li) { li.classList.toggle("open"); return; }
    var k = t.closest && t.closest(".actcard .k"); if (k) { k.closest(".actcard").classList.toggle("open"); return; }
  });
  if (phone()) { var a = document.querySelector(".actcard"); if (a) a.classList.add("open"); }
})();


/* ── timeline photos open large ── */
(function () {
  var box = document.getElementById("picbox"), img = document.getElementById("picImg"), cap = document.getElementById("picCap"), x = document.getElementById("picX");
  if (!box) return;
  var last = null;
  function open(p) { img.src = p.currentSrc || p.src; img.alt = p.alt; cap.textContent = p.alt; box.hidden = false; document.body.classList.add("card-open"); last = p; if (window.__smoother) window.__smoother.paused(true); x.focus(); }
  function close() { box.hidden = true; document.body.classList.remove("card-open"); if (window.__smoother) window.__smoother.paused(false); if (last && last.focus) last.focus(); }
  document.addEventListener("click", function (ev) { var p = ev.target.closest && ev.target.closest("ol.spine .pic"); if (p) { ev.preventDefault(); open(p); } });
  x.addEventListener("click", close);
  box.addEventListener("click", function (ev) { if (ev.target === box) close(); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !box.hidden) close(); });
  document.querySelectorAll("ol.spine .pic").forEach(function (p) { p.setAttribute("tabindex", "0"); p.setAttribute("role", "button"); p.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(p); } }); });
})();
