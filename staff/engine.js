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
  /* a finger scrolls the page itself: smoothing the touch and normalising the scroll both mean GSAP
     takes the gesture over, which is what strands a phone on a section it cannot swipe out of - and
     is why every dialog here has to switch normalising off again. The portfolio keeps its scroll
     work to fine pointers for the same reason; only the desktop gets the smoothed scroll. */
  if (animate) smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1, smoothTouch: 0, normalizeScroll: fine, ignoreMobileResize: true, effects: true, onUpdate: function (self) { if (typeof drawRoute === "function") drawRoute(self.scrollTop()); } });
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
    gsap.set("#gSlats, #gate .rail, #gate .housing, #gStencil1, #gStencil2", { autoAlpha: 0 });   /* first a black screen; the shutter arrives after the line */
    gsap.set(".hero .opened .line span", { y: "110%", rotation: 3 });
    gsap.set(".hero .opened .k, .hero .opened .strap, .hero .opened .cta", { autoAlpha: 0, y: 14 });
    var intro = gsap.timeline(); window.__intro = intro;
    setTimeout(function () { if (intro.progress() < 1) intro.progress(1); }, 22000);
    var skipAnim = $("#skipAnim"); if (skipAnim) skipAnim.addEventListener("click", function () { intro.progress(1); });
    var gateSkip = $("#gateSkip"); if (gateSkip) { gate.classList.add("armed"); gateSkip.addEventListener("click", function () { intro.progress(1); }); }
    var hurry = function () { if (intro.progress() < 1) intro.timeScale(2.5); };
    ["wheel", "touchstart", "keydown"].forEach(function (ev) { window.addEventListener(ev, hurry, { passive: true, once: true }); });
    var flSplit = new SplitText("#fl", { type: "chars" });
    /* the mark comes in and goes out again; the shutter arrives; the line is typed out on it */
    var caret = $("#gCaret");
    /* each letter appears in turn and the caret moves to sit right after it, so it follows the typing */
    function typer(sel, step) {
      /* split into words as well as letters: letters alone are each their own element, so a narrow
         screen breaks the line between two of them and ARRIVES is left split across the two lines */
      var split = new SplitText(sel, { type: "words,chars" }), tl = gsap.timeline();
      gsap.set(split.chars, { autoAlpha: 0 });
      tl.call(function () { var host = $(sel); if (caret && host) host.prepend(caret); }, null, 0);
      split.chars.forEach(function (c, i) {
        tl.call(function () { gsap.set(c, { autoAlpha: 1 }); if (caret && c.after) c.after(caret); }, null, 0.02 + i * step);
      });
      return tl;
    }
    var typing1 = typer("#gType1", 0.055), typing2 = typer("#gType2", 0.06);
    var caretOn = function () { if (caret) { caret.classList.add("on"); caret.classList.remove("blink"); } };
    var caretBlink = function () { if (caret) { caret.classList.remove("on"); caret.classList.add("blink"); } };
    var caretOff = function () { if (caret) caret.classList.remove("blink"); };
    intro.fromTo("#gLogo", { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out" }, 0.3)
      .to("#gLogo", { autoAlpha: 0, scale: 1.05, duration: .8, ease: "power2.in" }, 2.9)
      /* line one is typed on the black screen, holds, then fades; line two the same; only then does the shutter appear */
      .set("#gStencil1", { autoAlpha: 1 }, 3.8).call(caretOn, null, 3.8)
      .add(typing1, 4.0)
      .call(caretBlink, null, 5.9).call(caretOff, null, 7.0)
      .to("#gStencil1", { autoAlpha: 0, y: -12, duration: .7, ease: "power2.in" }, 7.0)
      .set("#gStencil2", { autoAlpha: 1 }, 7.9).call(caretOn, null, 7.9)
      .add(typing2, 8.1)
      .call(caretBlink, null, 9.7).call(caretOff, null, 10.8)
      .to("#gStencil2", { autoAlpha: 0, y: -12, duration: .8, ease: "power2.in" }, 10.8)
      .fromTo("#gSlats, #gate .rail, #gate .housing", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.0, ease: "power2.out" }, 11.7)
      .add("gate", 13.0)
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
    /* the timeline: when its row of cards reaches the middle of the screen the page holds still and
       further scrolling moves the cards sideways; once the last card is in, the page carries on */
    var tlSec = $("#timeline"), tlOl = $("#timeline ol.spine.journey"), tlPin = $("#tlPin");
    /* the hold is wanted on a phone too: the page stops and the cards travel, which is what the
       line under them has always promised. It is the width that used to switch this off. */
    if (tlSec && tlOl && tlPin) {
      /* one hold: the cards slide across, then the page stays put a little longer while the route
         drops down the right of them and runs back beneath them to the left */
      var tlDist = function () { return Math.max(0, tlOl.scrollWidth - tlOl.clientWidth); };
      window.__tlHold = 720;
      var cardsX = function (st) { var total = tlDist() + window.__tlHold; return -Math.min(st.progress * total, tlDist()); };
      window.__tlST = ScrollTrigger.create({
        trigger: tlPin, start: "center center", end: function () { return "+=" + (tlDist() + window.__tlHold); },
        pin: tlPin, pinSpacing: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (st) { gsap.set(tlOl, { x: cardsX(st) }); },
        onRefresh: function (st) { gsap.set(tlOl, { x: cardsX(st) }); }
      });
    }
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
  /* the side line is a desktop thing; the stylesheet hides it below 900, so none of its work is done
     there either. Read live rather than once, so a rotated tablet lands on the right answer. */
  var routeMQ = window.matchMedia ? window.matchMedia("(max-width: 899px)") : null;
  var noRoute = function () { return !!(routeMQ && routeMQ.matches); };
  var TITLES = { top: ["00", "The way in"], why: ["01", "Why it exists"], programme: ["02", "The route in"], timeline: ["03", "The timeline"],
    people: ["04", "The people"], impact: ["05", "The impact"], partners: ["06", "The partners"], learn: ["07", "How we learn"],
    next: ["08", "What comes next"] };
  /* the rail: a thin track from the foot of the hero to the end of the story, a red line
     that eases towards how far you have read, a lamp at its head, and a tick per chapter */
  var routeTrack = $("#routeTrack"), routeHead = $("#routeHead"), routeLbl = $("#routeLbl"), routeLblN = $("#routeLblN"), routeLblT = $("#routeLblT"), ticks = [], litP = 0, lastLit = 0, stillFrames = 99;
  function buildTicks() {
    ticks.forEach(function (t) { t.remove(); }); ticks = [];
    if (!route || noRoute()) return;
    chapters.forEach(function (sec) {
      if (sec.id === "top") return;
      var t = document.createElement("i"); t.className = "tick"; t.sec = sec; route.appendChild(t); ticks.push(t);
    });
  }
  var routeH = $("#routeH"), litH = $("#routeLitH"), routeR = $("#routeR"), litR = $("#routeLitR"), trackR = $("#routeTrackR"),
      routeH2 = $("#routeH2"), litH2 = $("#routeLitH2"), trackE = $("#routeTrackE"), litE = $("#routeLitE"),
      headWrap = $("#routeHeadWrap"), tlRail = $(".tl-rail"), peopleEl = $("#people");
  /* the route: down the left to the timeline, along its line to the right, straight down the right, back across to
     the left just above The People, then down the left as before. Five segments, one continuous measure of progress. */
  function drawRoute(y) {
    if (!route || !lit || !story || noRoute()) return;
    var pageEl = $("#smooth-content") || document.body, vh = window.innerHeight;
    var H = pageEl.offsetHeight, top = hero ? hero.offsetHeight : 0, W = story.offsetWidth, end = H - 24;
    var stripW = route.offsetWidth || 20, lx = stripW / 2, rx = W - stripW / 2;
    /* positions come from layout, never from the screen, so nothing lags the smoother by a frame */
    function pageTop(el) { var t = 0; while (el && el !== pageEl) { t += el.offsetTop; el = el.offsetParent; } return t; }
    var detour = !!(tlRail && peopleEl), st = window.__tlST || null, tlPinEl = $("#tlPin");
    var yTl = end, yP = end, pinOff = 0;
    if (detour) {
      if (st) pinOff = clamp(y - st.start, 0, Math.max(0, st.end - st.start));   /* while held, everything in the hold rides with the page */
      yTl = pageTop(tlRail) + 32.5 + pinOff;
      yP = (st && tlPinEl) ? pageTop(tlPinEl) + tlPinEl.offsetHeight + 36 + pinOff : pageTop(peopleEl) - 64;
      if (yP <= yTl + 40) yP = yTl + 40;
    }
    var segA = Math.max(1, yTl - top), segB = detour ? Math.max(1, rx - lx) : 0, segC = detour ? Math.max(1, yP - yTl) : 0,
        segD = segB, segE = Math.max(0, end - yP), L = segA + segB + segC + segD + segE;
    /* the line reads ahead of the viewport, and arrives at the foot exactly when the page does */
    var target = clamp((y + vh * 0.58 - top) / Math.max(1, H - vh * 0.42 - top), 0, 1);
    litP = reduce ? target : litP + (target - litP) * 0.16;
    if (Math.abs(target - litP) < 0.0004) litP = target;
    /* the lamp keeps pace with the reader: its height on the page follows the scroll directly, and each crossing
       is folded into a short stretch of scroll so the lamp is never left behind or racing ahead */
    var hyLin = top + litP * Math.max(1, end - top), cb = detour ? Math.min(140, Math.max(40, (yP - yTl) / 4)) : 0;
    var sy = y, hx, hy, side, pA, pB = 0, pC = 0, pD = 0, pE = 0;
    var tlOlEl = st ? $("#timeline ol.spine.journey") : null, tlDistNow = tlOlEl ? Math.max(1, tlOlEl.scrollWidth - tlOlEl.clientWidth) : 1;
    if (!detour) { hx = lx; hy = hyLin; side = "left"; pA = clamp((hyLin - top) / segA, 0, 1); }
    else if (st && sy < st.start) { hx = lx; hy = Math.min(hyLin, yTl); side = "left"; pA = clamp((hy - top) / segA, 0, 1); }
    else if (st && sy <= st.end) {
      /* inside the hold: the first stretch slides the cards, the next drops the lamp down the right, the last runs it back */
      var total = Math.max(1, st.end - st.start), hold = Math.min(window.__tlHold || 0, total), slide = total - hold, q = sy - st.start;
      var down = hold * 0.28, back = hold - down;
      pA = 1;
      if (q <= slide) { pB = slide > 0 ? q / slide : 1; hx = lx + pB * (rx - lx); hy = yTl; side = "along"; }
      else if (q <= slide + down) { pB = 1; pC = (q - slide) / Math.max(1, down); hx = rx; hy = yTl + pC * (yP - yTl); side = "right"; }
      else { pB = 1; pC = 1; pD = clamp((q - slide - down) / Math.max(1, back), 0, 1); hx = rx - pD * (rx - lx); hy = yP; side = "back"; }
    }
    else if (st) { pA = 1; pB = 1; pC = 1; pD = 1; pE = clamp((hyLin - yP) / Math.max(1, segE), 0, 1); hx = lx; hy = yP + pE * segE; side = "left"; }
    else if (!st && hyLin < yTl) { hx = lx; hy = hyLin; side = "left"; pA = clamp((hyLin - top) / segA, 0, 1); }
    else if (!st && hyLin < yTl + cb) { pA = 1; pB = (hyLin - yTl) / cb; hx = lx + pB * (rx - lx); hy = yTl; side = "along"; }
    else if (hyLin < yP - cb) { pA = 1; pB = 1; pC = clamp((hyLin - yTl) / Math.max(1, yP - cb - yTl), 0, 1); hx = rx; hy = yTl + pC * (yP - yTl); side = "right"; }
    else if (hyLin < yP) { pA = 1; pB = 1; pC = 1; pD = (hyLin - (yP - cb)) / cb; hx = rx - pD * (rx - lx); hy = yP; side = "back"; }
    else { pA = 1; pB = 1; pC = 1; pD = 1; pE = clamp((hyLin - yP) / Math.max(1, segE), 0, 1); hx = lx; hy = hyLin; side = "left"; }
    var reach = litP * L;
    lit.style.top = top + "px"; lit.style.height = (pA * segA).toFixed(1) + "px"; lit.style.transform = "none";
    if (routeTrack) { routeTrack.style.top = top + "px"; routeTrack.style.height = segA + "px"; }
    if (trackE) { trackE.style.top = yP + "px"; trackE.style.height = segE + "px"; trackE.style.display = detour ? "" : "none"; }
    if (litE) { litE.style.top = yP + "px"; litE.style.height = (pE * segE).toFixed(1) + "px"; litE.style.transform = "none"; litE.style.display = detour ? "" : "none"; }
    if (routeH) { routeH.style.top = yTl + "px"; routeH.style.display = detour ? "" : "none"; }
    if (litH) { litH.style.width = (pB * 100).toFixed(2) + "%"; litH.style.transform = "none"; }
    if (routeR) { routeR.style.top = yTl + "px"; routeR.style.height = segC + "px"; routeR.style.bottom = "auto"; routeR.style.display = detour ? "" : "none"; }
    if (trackR) { trackR.style.top = "0"; trackR.style.height = segC + "px"; }
    if (litR) { litR.style.top = "0"; litR.style.height = (pC * segC).toFixed(1) + "px"; litR.style.transform = "none"; }
    if (routeH2) { routeH2.style.top = yP + "px"; routeH2.style.display = detour ? "" : "none"; }
    if (litH2) { litH2.style.width = (pD * 100).toFixed(2) + "%"; litH2.style.left = "auto"; litH2.style.right = "0"; litH2.style.transform = "none"; }
    if (headWrap) {
      headWrap.style.transform = "translate3d(" + hx.toFixed(1) + "px," + hy.toFixed(1) + "px,0)";
      headWrap.classList.toggle("flip", side === "right");
      headWrap.classList.toggle("along", side === "along");
      headWrap.classList.toggle("below", side === "back");
    }
    var v = Math.abs(litP - lastLit) * (end - top); lastLit = litP; stillFrames = v < 0.25 ? stillFrames + 1 : 0;
    if (headWrap) headWrap.classList.toggle("moving", stillFrames < 70);
    /* a tick per chapter, on whichever strip the route is using at that height */
    var here = null;
    for (var i = 0; i < ticks.length; i++) {
      var sec = ticks[i].sec, st = sec.offsetTop, onRight = detour && st > yTl && st < yP;
      var host = onRight ? routeR : route;
      if (host && ticks[i].parentNode !== host) host.appendChild(ticks[i]);
      ticks[i].style.top = (onRight ? st - yTl : st) + "px";
      var passed = hyLin >= st - 2;
      ticks[i].classList.toggle("on", passed);
      if (passed) here = i;
    }
    for (var k = 0; k < ticks.length; k++) ticks[k].classList.toggle("here", k === here);
    if (routeLbl) {
      var meta = here !== null ? (TITLES[ticks[here].sec.id] || ["00", "The way in"]) : ["00", "The way in"];
      if (routeLblN.textContent !== meta[0]) { routeLblN.textContent = meta[0]; routeLblT.textContent = meta[1]; }
    }
    if (headWrap) headWrap.classList.toggle("landed", litP >= 0.999);
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
    if (!smoother) drawRoute(y);
    if (prog) { progP = reduce ? progT : progP + (progT - progP) * 0.16; if (Math.abs(progT - progP) < 0.0004) progP = progT; prog.style.transform = "scaleX(" + progP.toFixed(4) + ")"; }
    requestAnimationFrame(frame);
  }
  buildTicks();
  requestAnimationFrame(frame);
  var rebuildTimer = null;
  /* the ticks are rebuilt too, so crossing the width where the side line appears brings its chapter
     marks with it rather than leaving a bare strip */
  function rebuild() { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(function () { lastY = -1; buildTicks(); sizeCubes(); }, 140); }
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
    $("#pfSupport").textContent = d.support || ""; (function () { var ul = $("#pfSkills .pf-list"); if (!ul) { $("#pfSkills").textContent = d.skills || ""; return; } ul.innerHTML = ""; (d.skills || "").split(",").forEach(function (t) { t = t.trim(); if (!t) return; var li = document.createElement("li"); li.textContent = t.charAt(0).toUpperCase() + t.slice(1); ul.appendChild(li); }); })();
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
      fr.src = "https://customer-" + cust + ".cloudflarestream.com/" + d.stream + "/iframe?preload=metadata&letterboxColor=%23000000&defaultTextTrack=en";
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
