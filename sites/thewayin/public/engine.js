/* ══════════════════════════════════════════════════════════════════
   THE WAY IN — engine (GSAP: ScrollTrigger, ScrollSmoother, SplitText)
   The preloader, the hero lines rising out of their masks, the ring
   cursor, smooth scrolling with parallax, separators that grow,
   headings that arrive a word at a time, the black-to-paper wipe,
   the escape-route strip lit as far as you have read, four signs
   that turn over, a floor plan that lights station by station, nine
   tiles ticked present as each arrives, the profile sheet, the
   two-year inspection tag, the closing line letter by letter, and
   the cube that flies into the footer.
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
  function closeMenu() { if (menu) { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); document.body.classList.remove("menu-open"); } }
  if (burger) burger.addEventListener("click", function () { menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); document.body.classList.add("menu-open"); });
  if (menuX) menuX.addEventListener("click", closeMenu);

  /* ── the cursor ───────────────────────────────────────────── */
  var dot = $("#curDot"), ring = $("#curRing");
  if (dot && ring && fine && hasGsap) {
    var px = -100, py = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener("mousemove", function (e) { px = e.clientX; py = e.clientY; if (!shown) { shown = true; rx = px; ry = py; } }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest && e.target.closest("[data-cur], .tile, .sq, .cp, .totop");
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

  /* ── the cube that rides the page ─────────────────────── */
  var cubeFixed = $("#cubeFixed");
  function sizeCubes() { $$(".cube").forEach(function (c) { c.style.setProperty("--w", c.offsetWidth + "px"); }); }
  sizeCubes(); window.addEventListener("resize", sizeCubes);

  /* ── the call point: a click breaks the glass, a click resets it ── */
  var cp = $("#cp"), cpTop = $("#cpTop"), heroSec = $("#top");
  function setGlass(broken) {
    if (!heroSec) return;
    heroSec.classList.toggle("broken", broken);
    if (cp) { cp.setAttribute("aria-pressed", broken); cp.setAttribute("aria-label", broken ? "Reset the call point" : "Break glass — reveal the team"); }
    if (cpTop) { cpTop.textContent = broken ? "Reset call point" : "Break glass"; cpTop.classList.toggle("reset", broken); }
    if (animate) {
      var lines = $$(broken ? ".hero .opened .line span" : ".hero .closed .line span");
      gsap.fromTo(lines, { y: "110%", rotation: 3 }, { y: "0%", rotation: 0, duration: 1.4, ease: "power4.out", stagger: .12, delay: broken ? .35 : 0 });
      var rest = $$(broken ? ".hero .opened .k, .hero .opened .strap, .hero .opened .cta" : ".hero .closed .k, .hero .closed .strap");
      gsap.fromTo(rest, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .9, stagger: .1, delay: broken ? .7 : .2 });
    }
  }
  if (cp) cp.addEventListener("click", function () { setGlass(!heroSec.classList.contains("broken")); });
  if (cpTop) cpTop.addEventListener("click", function () { var broken = !heroSec.classList.contains("broken"); setGlass(broken); if (broken) scrollTo("#top"); });

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
    /* failsafe: nobody waits behind the preloader for more than two seconds; and
       "Skip animation" jumps the whole entrance to its finished state */
    setTimeout(function () { if (intro.progress() < 0.45) intro.progress(1); }, 2600);
    var skipAnim = $("#skipAnim"); if (skipAnim) skipAnim.addEventListener("click", function () { intro.progress(1); });
    /* the preloader is gone inside two seconds; the hero then arrives on top of readable content */
    intro.fromTo("#plLogo", { y: "120%" }, { y: "0%", duration: .8, ease: "power4.out" }, 0.15)
      .fromTo("#plTag", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .5 }, 0.7)
      .fromTo("#plBar", { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 0.2)
      .to("#plLogo", { y: "-130%", duration: .5, ease: "power4.in" }, 1.35)
      .to("#plTag", { autoAlpha: 0, duration: .25 }, 1.35)
      .fromTo("#preloader", { autoAlpha: 1, y: "0vh" }, { autoAlpha: 0, y: "-100vh", duration: .5, ease: "expo.inOut" }, 1.55)
      .to(".hero .closed .line span", { y: "0%", rotation: 0, duration: 1.8, ease: "power4.out", stagger: .12 }, 1.65)
      .to(".hero .closed .k, .hero .closed .strap", { autoAlpha: 1, y: 0, duration: 1, stagger: .12 }, 2.05)
      .fromTo("#cpanim", { autoAlpha: 0, y: "18vh" }, { autoAlpha: 1, y: "0vh", duration: 2.2, ease: "sine.out" }, 1.95)
      .fromTo("#chrome", { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 1 }, 2.3)
      .fromTo("#fm", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 2.6)
      .fromTo("#fr a", { autoAlpha: 0, x: "-1em" }, { autoAlpha: 1, x: "0em", duration: .9, stagger: { each: .15, from: "end" } }, 2.45);
    var flSplit = new SplitText("#fl", { type: "chars" });
    intro.fromTo(flSplit.chars, { autoAlpha: 0, x: "1em" }, { autoAlpha: 1, x: "0em", duration: .7, stagger: .05 }, 2.45);

    /* the hero blurs away as you leave it, the photo drifts */
    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 20%", scrub: 1.5 } })
      .fromTo("#heroFoot", { autoAlpha: 1 }, { filter: "blur(3px)", autoAlpha: 0 }, 0)
      .fromTo("#heroHead", { autoAlpha: 1 }, { autoAlpha: 0, y: -60, filter: "blur(2px)" }, 0.2)
      .fromTo("#cpanim", { y: 0 }, { y: -40 }, 0);
    smoother.effects("#heroPh", { speed: .85 });

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

    /* the call, letter by letter; the cube flying into the footer; the footer arriving */
    var ctaSplit = new SplitText(".cta-h", { type: "chars,words" });
    gsap.timeline({ scrollTrigger: { trigger: ".entrance", start: "top 80%", end: "bottom 70%", scrub: 2 } })
      .fromTo(ctaSplit.chars, { rotationZ: 3, autoAlpha: 0, x: "0.25em" }, { rotationZ: 0, autoAlpha: 1, x: "0em", stagger: .1 }, 0)
      .fromTo(".entrance .go .btn", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: .2 }, 1.2);
    gsap.timeline({ scrollTrigger: { trigger: "#footer", start: "top 90%", end: "bottom 95%", scrub: 2 } })
      .fromTo(".footer-item, footer h4, footer .ff", { rotationZ: 3, autoAlpha: 0, y: "1.5rem" }, { rotationZ: 0, autoAlpha: 1, y: "0rem", stagger: .1 }, 2);

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  } else if (hasGsap) {
    gsap.set(["#chrome", "#cpanim", "#fm", "#fr a", "#fl"], { autoAlpha: 1 });
    gsap.set(".hero .line span", { y: 0 });
  }

  /* ── the route strip, the progress line, the chapter card ── */
  var hero = $("#top"), story = $("#story"), route = $("#route"), lit = $("#routeLit");
  var chapters = $$("#story .ch, #story .hero, #story .intro");
  var TITLES = { top: ["00", "The way in"], why: ["01", "Why it exists"], programme: ["02", "The route in"], people: ["03", "The people"],
    impact: ["04", "The impact"], partners: ["05", "The partners"], timeline: ["06", "The timeline"], learn: ["07", "How we learn"],
    record: ["08", "Evidence record"], next: ["09", "What comes next"] };
  function drawRoute(y) {
    if (!route || !lit || !story) return;
    var H = story.offsetHeight, top = hero ? hero.offsetHeight : 0, reach = clamp(y + window.innerHeight * 0.58, top, H - 30);
    lit.style.top = top + "px"; lit.style.height = Math.max(0, reach - top) + "px";
    route.classList.toggle("landed", reach >= H - 32);
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
      if (prog) prog.style.transform = "scaleX(" + pr.toFixed(4) + ")";
      if (cubeFixed) { var vh = window.innerHeight, bh = cubeFixed.offsetHeight, ct = vh * 0.11 + (reduce ? 0 : pr * (vh * 0.97 - bh - vh * 0.11));
        cubeFixed.style.top = ct.toFixed(1) + "px"; if (!reduce) cubeFixed.style.setProperty("--spin", (pr * 540).toFixed(1) + "deg");
        /* hidden while the people are on screen, so it never sits over a name */
        if (peopleSec) { var pb = peopleSec.getBoundingClientRect(); cubeFixed.classList.toggle("hide", pb.top < vh * 0.85 && pb.bottom > vh * 0.15); } }
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
    var d = t.dataset, approved = d.consent === "approved";
    prof.classList.toggle("pending", !approved);
    $("#pfName").textContent = d.name; $("#pfRole").textContent = d.role;
    $("#pfRoute").textContent = d.route; $("#pfRoute2").textContent = d.route; $("#pfBand").style.setProperty("--b", d.b || "#111");
    $("#pfSince").textContent = d.since || "";
    $("#pfSupport").textContent = d.support || ""; $("#pfSkills").textContent = d.skills || "";
    $("#pfResp").textContent = d.resp || ""; $("#pfNext").textContent = d.next || "";
    $$("#pfFields .opt").forEach(function (el) { el.style.display = el.querySelector("b").textContent ? "" : "none"; });
    var tpl = $("template.story", t); $("#pfStory").innerHTML = tpl ? tpl.innerHTML : "";
    $("#pfWords").style.display = tpl ? "" : "none";
    $("#pfQ").textContent = "Film with " + d.name + ": to be recorded";
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

})();
