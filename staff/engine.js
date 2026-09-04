/* ══════════════════════════════════════════════════════════════════
   THE WAY IN — engine (GSAP: ScrollTrigger, ScrollSmoother, SplitText)
   The preloader, the hero lines rising out of their masks, the call
   point (a click breaks the glass, a click resets it), the ring
   cursor, smooth scrolling with parallax, separators that grow,
   headings that arrive a word at a time, the black-to-paper wipe,
   the escape-route strip lit as far as you have read, four signs
   that turn over, a floor plan that lights station by station, nine
   tiles ticked present as each arrives, the profile sheet, the ember
   field, the marquee, the two-year inspection tag, the fire-class
   paper, the call, the cube that flies into the footer, the ticker.
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

  if (!hasGsap) { html.classList.add("no-gsap"); var pl0 = $("#preloader"); if (pl0) pl0.style.display = "none"; }
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
  function closeMenu() { if (menu) { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); } }
  if (burger) burger.addEventListener("click", function () { menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); });
  if (menuX) menuX.addEventListener("click", closeMenu);

  /* ── the cursor ───────────────────────────────────────────── */
  var dot = $("#curDot"), ring = $("#curRing");
  if (dot && ring && fine && hasGsap) {
    var px = -100, py = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener("mousemove", function (e) { px = e.clientX; py = e.clientY; if (!shown) { shown = true; rx = px; ry = py; } }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest && e.target.closest("[data-cur], .tile, .card, .sq, .cp, .ext, .totop");
      document.body.classList.toggle("cur-big", !!t);
      document.body.classList.toggle("cur-off", !!(e.target.closest && e.target.closest("input, textarea, .prof-in, .menu")));
    });
    document.addEventListener("mouseleave", function () { document.body.classList.add("cur-off"); });
    document.addEventListener("mouseenter", function () { document.body.classList.remove("cur-off"); });
    (function loop() {
      dot.style.transform = "translate(" + px + "px," + py + "px)";
      rx += (px - rx) * 0.16; ry += (py - ry) * 0.16;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
      requestAnimationFrame(loop);
    })();
  }

  /* ── the cubes size their faces from their box ────────────── */
  function sizeCubes() { $$(".cube").forEach(function (c) { c.style.setProperty("--w", c.offsetWidth + "px"); }); }
  sizeCubes(); window.addEventListener("resize", sizeCubes);

  /* ── the call point ───────────────────────────────────────── */
  var hero = $("#top"), cp = $("#cp"), cpTop = $("#cpTop");
  function setGlass(broken) {
    if (!hero) return;
    hero.classList.toggle("broken", broken);
    if (cp) { cp.setAttribute("aria-pressed", broken); cp.setAttribute("aria-label", broken ? "Reset the call point" : "Break glass — reveal the team"); }
    if (cpTop) { cpTop.textContent = broken ? "Reset call point" : "Break glass"; cpTop.classList.toggle("reset", broken); }
    if (animate) {
      var lines = $$(broken ? ".hero .opened .line span" : ".hero .closed .line span");
      gsap.fromTo(lines, { y: "110%", rotation: 3 }, { y: "0%", rotation: 0, duration: 1.4, ease: "power4.out", stagger: .12, delay: broken ? .35 : 0 });
      var rest = $$(broken ? ".hero .opened .k, .hero .opened .strap, .hero .opened .cta" : ".hero .closed .k, .hero .closed .strap");
      gsap.fromTo(rest, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .9, stagger: .1, delay: broken ? .7 : .2 });
    }
  }
  if (cp) cp.addEventListener("click", function () { setGlass(!hero.classList.contains("broken")); });
  if (cpTop) cpTop.addEventListener("click", function () { var broken = !hero.classList.contains("broken"); setGlass(broken); if (broken) scrollTo("#top"); });

  /* ── the ember field ──────────────────────────────────────── */
  (function () {
    var cv = $("#embers"); if (!cv) return; var ctx = cv.getContext("2d"), W, H, ps = [], N = 160, run = false;
    function size() { var k = window.devicePixelRatio > 1 ? 1.5 : 1; W = cv.width = cv.offsetWidth * k; H = cv.height = cv.offsetHeight * k; }
    function one(p, fresh) { p.x = Math.random() * W; p.y = fresh ? Math.random() * H : H + 10; p.r = .6 + Math.random() * 2.2; p.v = .25 + Math.random() * .9; p.d = (Math.random() - .5) * .5; p.o = .25 + Math.random() * .7; p.t = Math.random() * 6.28; return p; }
    function seed() { ps = []; for (var i = 0; i < N; i++) ps.push(one({}, true)); }
    function frame() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < N; i++) { var p = ps[i]; p.y -= p.v; p.t += .03; p.x += p.d + Math.sin(p.t) * .3; if (p.y < -10 || p.x < -10 || p.x > W + 10) one(p, false);
        var a = p.o * (0.55 + 0.45 * Math.sin(p.t * 2)); ctx.fillStyle = "rgba(225,6,0," + a.toFixed(3) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        if (p.r > 2) { ctx.fillStyle = "rgba(255,255,255," + (a * .5).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * .4, 0, 6.28); ctx.fill(); } }
      requestAnimationFrame(frame);
    }
    size(); seed(); window.addEventListener("resize", function () { size(); seed(); });
    if (reduce) { run = true; frame(); run = false; return; }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (en) { var was = run; run = en.isIntersecting; if (run && !was) frame(); }); }).observe(cv); else { run = true; frame(); }
  })();

  /* ── the marquee ──────────────────────────────────────────── */
  (function () {
    var t = $("#carT"); if (!t) return; var one = t.innerHTML; t.innerHTML = one + one + one; var w = 0, x = 0;
    function measure() { w = t.scrollWidth / 3; } measure(); window.addEventListener("resize", measure);
    if (reduce) return;
    (function loop() { x -= 0.5; if (x <= -w) x += w; t.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)"; requestAnimationFrame(loop); })();
  })();

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
    /* the entrance */
    gsap.set(".hero .closed .line span", { y: "110%", rotation: 3 });
    gsap.set(".hero .closed .k, .hero .closed .strap", { autoAlpha: 0, y: 14 });
    var intro = gsap.timeline();
    intro.fromTo("#plLogo", { y: "120%" }, { y: "0%", duration: 1.1, ease: "power4.out" }, 0.3)
      .fromTo("#plTag", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .6 }, 1.1)
      .fromTo("#plBar", { scaleX: 0 }, { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0.4)
      .to("#plLogo", { y: "-130%", duration: .7, ease: "power4.in" }, 2.1)
      .to("#plTag", { autoAlpha: 0, duration: .3 }, 2.1)
      .fromTo("#preloader", { autoAlpha: 1, y: "0vh" }, { autoAlpha: 0, y: "-100vh", duration: .6, ease: "expo.inOut" }, 2.4)
      .to(".hero .closed .line span", { y: "0%", rotation: 0, duration: 2, ease: "power4.out", stagger: .12 }, 2.55)
      .to(".hero .closed .k, .hero .closed .strap", { autoAlpha: 1, y: 0, duration: 1, stagger: .12 }, 3)
      .fromTo("#cpwrap", { autoAlpha: 0, y: "18vh" }, { autoAlpha: 1, y: "0vh", duration: 2.4, ease: "sine.out" }, 2.9)
      .fromTo("#chrome", { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 1 }, 3.4)
      .fromTo("#fm", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 3.7)
      .fromTo("#fr a", { autoAlpha: 0, x: "-1em" }, { autoAlpha: 1, x: "0em", duration: .9, stagger: { each: .15, from: "end" } }, 3.5);
    var flSplit = new SplitText("#fl", { type: "chars" });
    intro.fromTo(flSplit.chars, { autoAlpha: 0, x: "1em" }, { autoAlpha: 1, x: "0em", duration: .7, stagger: .05 }, 3.5);

    /* the hero blurs away as you leave it, the photo drifts */
    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 20%", scrub: 1.5 } })
      .fromTo("#heroFoot", { autoAlpha: 1 }, { filter: "blur(3px)", autoAlpha: 0 }, 0)
      .fromTo("#heroHead", { autoAlpha: 1 }, { autoAlpha: 0, y: -60, filter: "blur(2px)" }, 0.2)
      .fromTo("#cpwrap", { y: 0 }, { y: -40 }, 0);
    smoother.effects("#heroPh", { speed: .85 });
    smoother.effects("#obj2", { speed: 1.18 });

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
    var introSec = $("#intro");
    gsap.timeline({ scrollTrigger: { trigger: ".colour-divider", start: "center 60%", end: "center 20%", scrub: true,
      onUpdate: function (st) { introSec.classList.toggle("on-white", st.progress > .5); } } })
      .to("#intro", { backgroundColor: "#F4F4F1" }, 0);
    /* the marquee cards lift in */
    gsap.timeline({ scrollTrigger: { trigger: ".client-logos", start: "top 90%", end: "bottom 60%", scrub: 1 } }).fromTo(".client-logos", { autoAlpha: 0 }, { autoAlpha: 1 }, 0);
    $$(".client-logos .card").forEach(function (c) { gsap.fromTo(c, { y: "5vh" }, { y: "0vh", scrollTrigger: { trigger: ".client-logos", start: "top 100%", end: "bottom 50%", scrub: 1 } }); });

    /* the call, letter by letter; the cube flying into the footer; the footer arriving */
    var ctaSplit = new SplitText(".cta-h", { type: "chars,words" });
    gsap.timeline({ scrollTrigger: { trigger: ".entrance", start: "top 80%", end: "bottom 70%", scrub: 2 } })
      .fromTo(ctaSplit.chars, { rotationZ: 3, autoAlpha: 0, x: "0.25em" }, { rotationZ: 0, autoAlpha: 1, x: "0em", stagger: .1 }, 0)
      .fromTo(".entrance .go .btn", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: .2 }, 1.2);
    gsap.timeline({ scrollTrigger: { trigger: "#footer", start: "top 90%", end: "bottom 95%", scrub: 2 } })
      .fromTo(".footer-item, footer h4, footer .ff", { rotationZ: 3, autoAlpha: 0, y: "1.5rem" }, { rotationZ: 0, autoAlpha: 1, y: "0rem", stagger: .1 }, 2)
      .fromTo("#obj3", { rotation: 0, scale: 1, autoAlpha: 0, x: "-30vw", y: "-70vh" }, { rotation: 141, scale: .8, autoAlpha: 1, x: "0vw", y: "6vh", duration: 5 }, 0);

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  } else if (hasGsap) {
    gsap.set(["#chrome", "#cpwrap", "#fm", "#obj3", "#fr a", "#fl"], { autoAlpha: 1 });
    gsap.set(".hero .line span", { y: 0 });
  }

  /* ── the route strip, the progress line, the chapter card ── */
  var story = $("#story"), route = $("#route"), lit = $("#routeLit");
  var chapters = $$("#story .ch, #story .hero, #story .intro, #story .purpose");
  var TITLES = { top: ["00", "The call point"], intro: ["00", "The way in"], award: ["01", "The award"], stories: ["i–iii", "Three stories"], programme: ["02", "The programme"], people: ["03", "The people"],
    purpose: ["03", "The people"], creds: ["04", "What we are"], test: ["05", "The two-year test"], training: ["06", "Training"], join: ["07", "Join"] };
  function drawRoute(y) {
    if (!route || !lit || !story) return;
    var H = story.offsetHeight, top = hero ? hero.offsetHeight : 0, reach = clamp(y + window.innerHeight * 0.58, top, H - 30);
    lit.style.top = top + "px"; lit.style.height = Math.max(0, reach - top) + "px";
    route.classList.toggle("landed", reach >= H - 32);
  }
  var prog = $("#prog"), now = $("#now"), nowN = $("#nowN"), nowT = $("#nowT"), lastCard = "", lastY = -1;
  var floor = $("#floor"), stations = $$("#floor .st");
  function frame() {
    var y = scrollY();
    if (y !== lastY) {
      lastY = y;
      var probe = y + window.innerHeight * 0.42, cur = null;
      chapters.forEach(function (s) { if (probe >= s.offsetTop && probe < s.offsetTop + s.offsetHeight) cur = s.id; });
      if (!cur && chapters.length && probe >= chapters[chapters.length - 1].offsetTop) cur = chapters[chapters.length - 1].id;
      if (prog) { var mx = (html.scrollHeight - window.innerHeight) || 1; prog.style.transform = "scaleX(" + clamp(y / mx, 0, 1).toFixed(4) + ")"; }
      var meta = TITLES[cur]; if (meta && cur !== lastCard) { lastCard = cur; if (now) { nowN.textContent = meta[0]; nowT.textContent = meta[1]; } }
      if (now) now.classList.toggle("on", y > window.innerHeight * 0.5);
      if (floor && stations.length) { var r = floor.getBoundingClientRect(), lp = clamp((window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.25), 0, 1); floor.style.setProperty("--lp", lp.toFixed(3)); stations.forEach(function (st, k) { st.classList.toggle("lit", lp >= (k + 0.5) / stations.length); }); }
      drawRoute(y);
    }
    requestAnimationFrame(frame);
  }
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
    $("#pfName").textContent = t.dataset.name; $("#pfRole").innerHTML = t.dataset.role;
    $("#pfRoute").textContent = t.dataset.route; $("#pfRoute2").textContent = t.dataset.route; $("#pfBand").style.setProperty("--b", t.dataset.b || "#111");
    $("#pfFocus").innerHTML = t.dataset.focus;
    var q = t.dataset.q || ""; $("#pfQ").textContent = /^TK/.test(q) ? "Question to be written for " + t.dataset.name : "“" + q + "”";
    $("#pfSince").textContent = t.dataset.since === "TK" ? "TK — start date" : t.dataset.since;
    $("#pfAct").innerHTML = t.dataset.act.split(" ").map(function (k) { return ACTS[k] || k; }).join("<br>");
    var tpl = $("template.story", t); $("#pfStory").innerHTML = tpl ? tpl.innerHTML : "";
    $("#pfVid").style.setProperty("--a", getComputedStyle(t).getPropertyValue("--a"));
    var was = !prof.hidden; prof.hidden = false; document.body.classList.add("prof-open"); if (smoother) smoother.paused(true); if (!was) pclose.focus();
    var inn = $(".prof-in"); if (inn) { inn.scrollTop = 0; inn.style.animation = "none"; void inn.offsetWidth; inn.style.animation = ""; }
  }
  function closeProf() { if (!prof || prof.hidden) return; prof.hidden = true; document.body.classList.remove("prof-open"); if (smoother) smoother.paused(false); if (lastEl && lastEl.focus) lastEl.focus(); }
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

  /* ── the paper ────────────────────────────────────────────── */
  var FIRE = { a: "Class A — wood, paper, textiles. Water, foam, powder or wet chemical will do it.", b: "Class B — petrol, paint, solvents. Foam, CO₂ or powder. Never water.",
    c: "Class C — flammable gases. Dry powder only, once the supply is isolated.", e: "Live electrical — CO₂ or dry powder. Water and foam conduct.", f: "Class F — cooking oils and fats. Wet chemical, purpose-built for the job." };
  var fnote = $("#fnote"), fcs = $$(".fc"), exts = $$(".ext");
  function pickFire(cls) {
    fcs.forEach(function (b) { var on = b.getAttribute("data-cls") === cls; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    exts.forEach(function (x) { var ok = (" " + x.getAttribute("data-ok") + " ").indexOf(" " + cls + " ") >= 0; x.classList.toggle("hit", ok); x.classList.toggle("miss", !ok); });
    if (fnote) fnote.textContent = FIRE[cls] || "";
  }
  fcs.forEach(function (b) { b.addEventListener("click", function () { pickFire(b.getAttribute("data-cls")); }); });
  if (fcs.length) pickFire("a");
  var QUIZ = [{ q: "Waste-paper bin alight in an office.", cls: "a" }, { q: "Overheated fuse board — still live.", cls: "e" }, { q: "Chip-pan fire in the staff kitchen.", cls: "f" },
    { q: "Petrol spill ignited in the yard.", cls: "b" }, { q: "Gas cylinder burning at the valve.", cls: "c" }, { q: "Laptop charger smoking on a desk.", cls: "e" }];
  var fmL = $("#fmLearn"), fmT = $("#fmTest"), fq = $("#fq"), fsc = $("#fscore"), qi = 0, qScore = 0, qLock = false;
  function setFMode(test) {
    document.body.classList.toggle("ftest", test); fmL.classList.toggle("on", !test); fmT.classList.toggle("on", test);
    fmL.setAttribute("aria-pressed", !test); fmT.setAttribute("aria-pressed", test); fq.hidden = !test; fsc.hidden = !test;
    exts.forEach(function (x) { x.classList.remove("hit", "miss", "right", "wrong"); });
    if (test) { qi = 0; qScore = 0; qLock = false; askQ(); } else pickFire("a");
  }
  function askQ() {
    fsc.textContent = qScore + " / " + QUIZ.length;
    if (qi >= QUIZ.length) { fq.innerHTML = "<b>" + qScore + " of " + QUIZ.length + ".</b> " + (qScore === QUIZ.length ? "Full marks — you'd pass our induction." : "Return to Learn, then sit it again."); if (fnote) fnote.textContent = "Sit the paper again whenever you like."; return; }
    fq.innerHTML = "Q" + (qi + 1) + " — <b>" + QUIZ[qi].q + "</b> Which extinguisher?"; if (fnote) fnote.textContent = "Mark your answer.";
  }
  exts.forEach(function (x) {
    x.setAttribute("tabindex", "0");
    function answer() {
      if (!document.body.classList.contains("ftest") || qLock || qi >= QUIZ.length) return; qLock = true;
      var cls = QUIZ[qi].cls, ok = (" " + x.getAttribute("data-ok") + " ").indexOf(" " + cls + " ") >= 0;
      x.classList.add(ok ? "right" : "wrong"); if (ok) qScore++; if (fnote) fnote.textContent = (ok ? "Correct. " : "Marked wrong. ") + FIRE[cls]; fsc.textContent = qScore + " / " + QUIZ.length;
      setTimeout(function () { x.classList.remove("right", "wrong"); qi++; qLock = false; askQ(); }, 1400);
    }
    x.addEventListener("click", answer); x.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); answer(); } });
  });
  if (fmL && fmT) { fmL.addEventListener("click", function () { setFMode(false); }); fmT.addEventListener("click", function () { setFMode(true); }); }

  /* ── protecting-since ─────────────────────────────────────── */
  var EPOCH = new Date(2021, 7, 27).getTime(), g = ["tD2", "tH2", "tM2", "tS2"].map(function (id) { return document.getElementById(id); }), lastSec = -1;
  function ticker() { var s = Math.floor((Date.now() - EPOCH) / 1000); if (s === lastSec || !g[0]) return; lastSec = s;
    g[0].textContent = Math.floor(s / 86400); g[1].textContent = pad2(Math.floor(s / 3600) % 24); g[2].textContent = pad2(Math.floor(s / 60) % 60); g[3].textContent = pad2(s % 60); }
  ticker(); setInterval(ticker, 1000);
})();
