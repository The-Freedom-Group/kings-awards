/* ══════════════════════════════════════════════════════════════════
   THE WAY IN — engine (GSAP: ScrollTrigger, ScrollSmoother, SplitText)
   The preloader, the hero that rises out of its masks, the ring
   cursor, smooth scrolling with parallax, the reveals, the wipe to
   white, the carousel, the starfield, the glass object that flies
   into the footer, the staggered footer, the profile sheet, and the
   two-year test.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ── if the library never arrives, show the page plainly ── */
  function plain() {
    document.documentElement.classList.add("no-gsap");
    var pl = $("#preloader"); if (pl) pl.style.display = "none";
    $$(".hero .line span").forEach(function (s) { s.style.transform = "none"; });
    ["#top", "#bm", "#obj1", "#obj3"].forEach(function (s) { var e = $(s); if (e) e.style.opacity = "1"; });
    $$(".fi,.sl,.fu-1,.tile,.footer-item,.cta-h").forEach(function (e) { e.style.opacity = "1"; e.style.visibility = "visible"; });
  }
  if (!hasGsap) { plain(); }
  else {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
    gsap.config({ nullTargetWarn: false });
    gsap.defaults({ duration: 1 });
  }

  /* ── smooth scrolling ─────────────────────────────────────── */
  var smoother = null;
  if (hasGsap && !reduce) {
    smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1, smoothTouch: 0.5, normalizeScroll: true, ignoreMobileResize: true, effects: true });
  }
  function scrollTo(target) {
    var el = typeof target === "string" ? $(target) : target; if (!el) return;
    if (smoother) smoother.scrollTo(el, true, "top top"); else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
  $$('a[href^="#"]').forEach(function (a) { a.addEventListener("click", function (e) { var h = a.getAttribute("href"); if (h.length > 1 && $(h)) { e.preventDefault(); scrollTo(h); closeMenu(); } }); });

  /* ── menu ─────────────────────────────────────────────────── */
  var menu = $("#menu");
  function closeMenu() { if (menu) { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); } }
  var burger = $("#burger"); if (burger) burger.addEventListener("click", function () { menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); });
  var mx = $("#menuX"); if (mx) mx.addEventListener("click", closeMenu);

  /* ── the cursor ───────────────────────────────────────────── */
  var dot = $("#curDot"), ring = $("#curRing");
  if (dot && ring && fine) {
    var px = -100, py = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener("mousemove", function (e) { px = e.clientX; py = e.clientY; if (!shown) { shown = true; rx = px; ry = py; } }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest && e.target.closest("[data-cur], .tile, .card");
      document.body.classList.toggle("cur-big", !!t);
      document.body.classList.toggle("cur-off", !!(e.target.closest && e.target.closest("input, textarea, .prof")));
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

  /* ── the glass objects size their faces from their box ────── */
  function sizeGlass() { $$(".glass .cube").forEach(function (c) { c.style.setProperty("--w", c.offsetWidth + "px"); }); }
  sizeGlass(); window.addEventListener("resize", sizeGlass);

  /* ── the starfield ────────────────────────────────────────── */
  (function () {
    var cv = $("#stars"); if (!cv) return; var ctx = cv.getContext("2d"), W, H, stars = [], N = 240, run = false;
    function size() { W = cv.width = cv.offsetWidth * (window.devicePixelRatio > 1 ? 1.5 : 1); H = cv.height = cv.offsetHeight * (window.devicePixelRatio > 1 ? 1.5 : 1); }
    function seed() { stars = []; for (var i = 0; i < N; i++) stars.push({ x: (Math.random() - .5) * W, y: (Math.random() - .5) * H, z: Math.random() * W, o: Math.random() }); }
    function frame() {
      if (!run) return;
      ctx.fillStyle = "rgba(5,3,10,.5)"; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      for (var i = 0; i < N; i++) { var s = stars[i]; s.z -= 1.6 + s.o * 2.2; if (s.z <= 1) { s.x = (Math.random() - .5) * W; s.y = (Math.random() - .5) * H; s.z = W; }
        var k = 260 / s.z, x = cx + s.x * k, y = cy + s.y * k, k2 = 260 / (s.z + 26), x2 = cx + s.x * k2, y2 = cy + s.y * k2;
        if (x < 0 || x > W || y < 0 || y > H) continue;
        ctx.strokeStyle = "rgba(240,233,238," + (0.08 + 0.5 * (1 - s.z / W)) + ")"; ctx.lineWidth = Math.max(.5, 1.6 * (1 - s.z / W)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke(); }
      requestAnimationFrame(frame);
    }
    size(); seed(); window.addEventListener("resize", function () { size(); seed(); });
    if (reduce) { run = true; frame(); run = false; return; }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (en) { var was = run; run = en.isIntersecting; if (run && !was) frame(); }); }).observe(cv); else { run = true; frame(); }
  })();

  /* ── the carousel ─────────────────────────────────────────── */
  (function () {
    var t = $("#carT"); if (!t) return; var one = t.innerHTML; t.innerHTML = one + one + one; var w = 0, x = 0;
    function measure() { w = t.scrollWidth / 3; } measure(); window.addEventListener("resize", measure);
    if (reduce) return;
    (function loop() { x -= 0.45; if (x <= -w) x += w; t.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)"; requestAnimationFrame(loop); })();
  })();

  /* ── everything animated ──────────────────────────────────── */
  if (hasGsap) {
    var top = $("#top");
    if (reduce) {
      gsap.set(["#top", "#bm", "#obj1", "#obj3"], { autoAlpha: 1 });
      gsap.set(".hero .line span", { y: 0 });
    } else {
      /* the entrance */
      var intro = gsap.timeline();
      intro.fromTo("#plLogo", { y: "120%" }, { y: "0%", duration: 1.1, ease: "power4.out" }, 0.3)
        .fromTo("#plTag", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .6 }, 1.1)
        .to("#plLogo", { y: "-130%", duration: .7, ease: "power4.in" }, 2.1)
        .to("#plTag", { autoAlpha: 0, duration: .3 }, 2.1)
        .fromTo("#preloader", { autoAlpha: 1, y: "0vh" }, { autoAlpha: 0, y: "-100vh", duration: .6, ease: "expo.inOut" }, 2.4)
        .fromTo(".hero .line span", { rotation: 3, autoAlpha: 0, y: "5em" }, { rotation: 0, autoAlpha: 1, y: "0em", duration: 2, ease: "power4.out", stagger: .1 }, 2.55)
        .fromTo("#obj1", { autoAlpha: 0, y: "25vh" }, { autoAlpha: 1, y: "0vh", duration: 2.9, ease: "sine.out" }, 3.2)
        .fromTo("#top", { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 1 }, 3.4)
        .fromTo("#bm", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 3.7)
        .fromTo("#br a", { autoAlpha: 0, x: "-1em" }, { autoAlpha: 1, x: "0em", duration: .9, stagger: { each: .15, from: "end" } }, 3.5);
      var blSplit = new SplitText("#bl", { type: "chars" });
      intro.fromTo(blSplit.chars, { autoAlpha: 0, x: "1em" }, { autoAlpha: 1, x: "0em", duration: .7, stagger: .06 }, 3.5);

      /* the hero blurs away as you leave it */
      gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 20%", scrub: 1.5 } })
        .fromTo(".bottom-row", { autoAlpha: 1 }, { filter: "blur(3px)", autoAlpha: 0 }, 0)
        .fromTo(".hero-intro", { autoAlpha: 1 }, { autoAlpha: 0, y: -60 }, 0.2);
      if (smoother) smoother.effects("#obj1", { speed: 0.8 });
      if (smoother) smoother.effects("#obj2", { speed: 1.15 });

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
      $$(".test.sl").forEach(function (el) {
        gsap.timeline({ scrollTrigger: { trigger: el, start: "top 100%", end: "bottom 75%", scrub: 1 } })
          .fromTo(el, { autoAlpha: 0, x: "1em" }, { autoAlpha: 1, x: "0em" }, 1);
      });
      /* the tiles */
      $$(".tile").forEach(function (t) {
        gsap.timeline({ scrollTrigger: { trigger: t, start: "top 100%", end: "top 45%", scrub: 1 } }).fromTo(t, { y: "5vh", autoAlpha: 0 }, { y: "0vh", autoAlpha: 1 }, 0);
        var big = $(".big", t); if (big) { gsap.set(big, { xPercent: -50 }); gsap.fromTo(big, { yPercent: -62 }, { yPercent: -40, ease: "none", scrollTrigger: { trigger: t, start: "top bottom", end: "bottom top", scrub: true } }); }
      });
      /* the blur box */
      $$(".blur-box").forEach(function (b) {
        gsap.timeline({ scrollTrigger: { trigger: b, start: "top 100%", end: "bottom 80%", scrub: 1 } }).fromTo(b, { rotationZ: 2.5, autoAlpha: 0, x: "2.5vw" }, { rotationZ: 0, autoAlpha: 1, x: "0vw" }, .5);
      });
      /* the wipe to white, and the header follows */
      var wipe = gsap.timeline({ scrollTrigger: { trigger: ".colour-divider", start: "center 50%", end: "center 30%", scrub: true,
        onUpdate: function (st) { var on = st.progress > .5; $("#white").classList.toggle("on-white", on); if (top) top.classList.toggle("dark-on-white", on); } } });
      wipe.to(".change-to-white", { background: "#fbf8f9" }, 0);
      ScrollTrigger.create({ trigger: ".purpose", start: "top 60px", onEnter: function () { if (top) top.classList.remove("dark-on-white"); }, onLeaveBack: function () { if (top) top.classList.add("dark-on-white"); } });
      gsap.timeline({ scrollTrigger: { trigger: ".client-logos", start: "top 90%", end: "bottom 60%", scrub: 1 } }).fromTo(".client-logos", { autoAlpha: 0 }, { autoAlpha: 1 }, 0);
      $$(".client-logos .card").forEach(function (c, i) { gsap.fromTo(c, { y: "5vh" }, { y: "0vh", scrollTrigger: { trigger: ".client-logos", start: "top 100%", end: "bottom 50%", scrub: 1 } }); });

      /* the call, the object flying in, the footer arriving */
      var ctaSplit = new SplitText(".cta-h", { type: "chars,words" });
      var ftSplit = new SplitText(".ft .mail", { type: "chars" });
      var ft = gsap.timeline({ scrollTrigger: { trigger: ".footer", start: "top 85%", end: "bottom 85%", scrub: 2 } });
      ft.fromTo(".footer-header, .footer-menu-item li, .footer-item img, .ft-line", { rotationZ: 3, autoAlpha: 0, y: "1.5rem" }, { rotationZ: 0, autoAlpha: 1, y: "0rem", stagger: .1 }, 2)
        .fromTo("#obj3", { rotation: 0, scale: 1, autoAlpha: 0, x: "-33vw", y: "-60vh" }, { rotation: 141, scale: .8, autoAlpha: 1, x: "0vw", y: "4vh", duration: 5 }, 0)
        .fromTo(ftSplit.chars, { autoAlpha: 0, x: "0.5em" }, { autoAlpha: 1, x: "0em", stagger: .1 }, 2.2);
      gsap.timeline({ scrollTrigger: { trigger: ".cta", start: "top 85%", end: "bottom 60%", scrub: 2 } })
        .fromTo(ctaSplit.chars, { rotationZ: 3, autoAlpha: 0, x: "0.25em" }, { rotationZ: 0, autoAlpha: 1, x: "0em", stagger: .1 }, 0)
        .fromTo(".cta .btn", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0 }, 1.2);

      window.addEventListener("load", function () { ScrollTrigger.refresh(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  /* ── profiles ─────────────────────────────────────────────── */
  var tiles = $$(".tile"), prof = $("#prof"), pclose = $("#pclose"), lastEl = null, curIx = -1;
  var ACTS = { a: "a · work experience or careers advice", b: "b · mentoring", c: "c · interview and job-related training", d: "d · recruitment open to everyone" };
  function openProf(t) {
    if (!prof) return; lastEl = document.activeElement; curIx = tiles.indexOf(t);
    $("#pfName").textContent = t.dataset.name; $("#pfRole").innerHTML = t.dataset.role + " · " + t.dataset.route;
    $("#pfRoute").textContent = t.dataset.route; $("#pfFocus").innerHTML = t.dataset.focus;
    $("#pfQ").textContent = "“" + t.dataset.q + "”"; $("#pfSince").textContent = t.dataset.since === "TK" ? "TK · start date" : t.dataset.since;
    $("#pfAct").innerHTML = t.dataset.act.split(" ").map(function (k) { return ACTS[k] || k; }).join("<br>");
    var tpl = $("template.story-t", t); $("#pfStory").innerHTML = tpl ? tpl.innerHTML : "";
    var vid = $("#pfVid"); vid.style.setProperty("--a", getComputedStyle(t).getPropertyValue("--a")); vid.style.setProperty("--b", getComputedStyle(t).getPropertyValue("--b"));
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

  /* ── the two-year test ────────────────────────────────────── */
  var progStart = $("#progStart"), verdict = $("#verdict"), twoYearState = $("#twoYearState");
  var DEADLINE = new Date(2026, 8, 8), CUTOFF = new Date(2024, 8, 8);
  function monthsBetween(a, b) { return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) - (b.getDate() < a.getDate() ? 1 : 0); }
  function fmt(d) { return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  function judge() {
    if (!progStart.value) { verdict.innerHTML = "Enter the date of the earliest record."; if (twoYearState) twoYearState.textContent = ""; return; }
    var d = new Date(progStart.value + "T00:00:00"); if (isNaN(d)) return;
    var m = monthsBetween(d, DEADLINE), ok = d <= CUTOFF;
    if (ok) verdict.innerHTML = "<b>Passes.</b> By the closing date the programme will have run for " + Math.floor(m / 12) + " year" + (Math.floor(m / 12) === 1 ? "" : "s") + " and " + (m % 12) + " month" + (m % 12 === 1 ? "" : "s") + ", dated from " + fmt(d) + ". Keep that record.";
    else { var sh = Math.abs(monthsBetween(CUTOFF, d)); verdict.innerHTML = "<b>Not yet.</b> A record from " + fmt(d) + " is " + sh + " month" + (sh === 1 ? "" : "s") + " too young for this cycle. Unless an earlier record exists, this category waits a year."; }
    if (twoYearState) twoYearState.textContent = ok ? "● Passes on the date given" : "Not yet, on the date given";
  }
  if (progStart && verdict) progStart.addEventListener("input", judge);
  $$(".calc .quick button").forEach(function (b) { b.addEventListener("click", function () { progStart.value = b.dataset.d; judge(); $$(".calc .quick button").forEach(function (x) { x.classList.toggle("on", x === b); }); }); });
})();
