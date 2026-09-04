/* ══════════════════════════════════════════════════════════════════
   THE WAY IN — engine
   Quiet: things arrive as you reach them, headlines a word at a
   time. The four activities open on a click, the path lights step by
   step, the register opens a profile sheet, the two-year test does
   its sums, the fire-class paper marks itself, the ticker counts.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var pad2 = function (x) { return x < 10 ? "0" + x : "" + x; };

  /* ── headlines, a word at a time ──────────────────────────── */
  if (!reduce) $$(".ch h2").forEach(function (h) {
    var i = 0;
    function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (nd) {
        if (nd.nodeType === 3) {
          var frag = document.createDocumentFragment();
          nd.textContent.split(/(\s+)/).forEach(function (tk) {
            if (!tk) return;
            if (/^\s+$/.test(tk)) { frag.appendChild(document.createTextNode(" ")); return; }
            var s = document.createElement("span"); s.className = "w"; s.textContent = tk; s.style.setProperty("--d", (i++ * 0.07) + "s"); frag.appendChild(s);
          });
          node.replaceChild(frag, nd);
        } else if (nd.nodeType === 1 && nd.tagName !== "BR") wrap(nd);
      });
    }
    wrap(h);
  });

  /* ── hero words ───────────────────────────────────────────── */
  $$("#h1 .l").forEach(function (w, i) { w.style.setProperty("--d", (0.1 + i * 0.09) + "s"); });

  /* ── the cursor ───────────────────────────────────────────── */
  var cur = $("#cur"), curLb = $("#curLb"), fine = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var mx = -100, my = -100, cx = -100, cy = -100;
  if (cur && fine && !reduce) {
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; cur.classList.add("show"); }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.classList.remove("show"); });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest("[data-cur]");
      if (t) { curLb.textContent = t.getAttribute("data-cur"); cur.classList.add("big"); }
      else { cur.classList.remove("big"); }
    });
    document.addEventListener("mouseover", function (e) { cur.classList.toggle("hide", !!e.target.closest("input,textarea,.prof")); });
    (function curLoop() { cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22; cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)"; requestAnimationFrame(curLoop); })();
  }

  /* ── the hero: the photo grows to fill the screen ─────────── */
  var hero = $("#top"), stick = $("#stick"), slot = $("#slot"), photo = $("#heroPhoto"), copy = $("#heroCopy"), over = $("#heroOver"), cap = $("#heroCap"), glow = $("#glow");
  var desk = function () { return window.innerWidth > 900 && !reduce; };
  var slotR = null;
  function measureHero() {
    if (!hero || !slot || !desk()) { if (photo) photo.removeAttribute("style"); if (copy) copy.style.opacity = ""; return; }
    var sr = slot.getBoundingClientRect(), kr = stick.getBoundingClientRect();
    slotR = { l: sr.left - kr.left, t: sr.top - kr.top, w: sr.width, h: sr.height };
    drawHero(window.pageYOffset || 0, true);
  }
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  function drawHero(y, force) {
    if (!slotR || !desk()) return;
    var range = hero.offsetHeight - window.innerHeight, p = clamp(y / Math.max(1, range), 0, 1), q = ease(p);
    var W = window.innerWidth, H = window.innerHeight;
    var l = slotR.l + (0 - slotR.l) * q, t = slotR.t + (0 - slotR.t) * q, w = slotR.w + (W - slotR.w) * q, h = slotR.h + (H - slotR.h) * q;
    photo.style.left = l.toFixed(1) + "px"; photo.style.top = t.toFixed(1) + "px"; photo.style.width = w.toFixed(1) + "px"; photo.style.height = h.toFixed(1) + "px";
    photo.style.borderRadius = (20 * (1 - q)).toFixed(1) + "px"; photo.style.margin = "0";
    photo.style.boxShadow = q > .9 ? "none" : "";
    copy.style.opacity = clamp(1 - p * 2.2, 0, 1).toFixed(3); copy.style.transform = "translateY(" + (-p * 60).toFixed(1) + "px)";
    copy.style.pointerEvents = p > .4 ? "none" : "";
    cap.style.opacity = clamp(1 - p * 3, 0, 1).toFixed(3);
    over.style.opacity = clamp((p - .55) / .35, 0, 1).toFixed(3);
    over.style.pointerEvents = p > .8 ? "" : "none";
    hero.classList.toggle("done", p > .15);
  }
  if (hero && glow && fine) hero.addEventListener("mousemove", function (e) { var r = stick.getBoundingClientRect(); glow.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); glow.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }, { passive: true });

  /* ── parallax photos ──────────────────────────────────────── */
  var pxs = $$(".px[data-px]");
  function parallax() {
    if (reduce) return;
    pxs.forEach(function (el) { var r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return; var k = parseFloat(el.getAttribute("data-px")) || 0.06; var c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; el.style.transform = "translateY(" + (c * -k * 100 * 2).toFixed(1) + "px)"; });
  }

  /* ── reveal ───────────────────────────────────────────────── */
  var watched = $$(".rv");
  if (!("IntersectionObserver" in window) || reduce) watched.forEach(function (e) { e.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    watched.forEach(function (e) { io.observe(e); });
  }

  /* ── on scroll ────────────────────────────────────────────── */
  var chapters = $$("#story .ch, #story .hero");
  var TITLES = { top: ["00", "The way in"], award: ["01", "The award"], stories: ["", "Three stories"], programme: ["02", "The programme"], people: ["03", "The people"],
    creds: ["04", "What we are"], test: ["05", "The two-year test"], training: ["06", "Training"], join: ["07", "Join"] };
  var chrome = $("#chrome"), prog = $("#prog"), now = $("#now"), nowN = $("#nowN"), nowT = $("#nowT"), lastCard = "", lastY = -1;
  var rail = $("#rail"), steps = $$("#rail .step"), mover = $("#mover"), spine = $$(".spine a"), tests = $$(".tests .test"), testsBox = $(".tests");
  function frame() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (y !== lastY) {
      lastY = y;
      if (chrome) chrome.classList.toggle("stuck", y > 20);
      var probe = y + window.innerHeight * 0.42, cur = null;
      chapters.forEach(function (s) { if (probe >= s.offsetTop && probe < s.offsetTop + s.offsetHeight) cur = s.id; });
      if (!cur && chapters.length && probe >= chapters[chapters.length - 1].offsetTop) cur = chapters[chapters.length - 1].id;
      if (prog) { var mx = (document.documentElement.scrollHeight - window.innerHeight) || 1; prog.style.transform = "scaleX(" + clamp(y / mx, 0, 1).toFixed(4) + ")"; }
      var meta = TITLES[cur]; if (meta && cur !== lastCard) { lastCard = cur; if (now) { nowN.textContent = meta[0]; nowT.textContent = meta[1]; } }
      if (now) now.classList.toggle("on", y > window.innerHeight * 0.6);
      if (rail && steps.length) { var r = rail.getBoundingClientRect(), lp = clamp((window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.3), 0, 1); rail.style.setProperty("--lp", lp.toFixed(3)); if (mover) mover.style.left = (lp * 100).toFixed(2) + "%"; steps.forEach(function (st, k) { st.classList.toggle("lit", lp >= (k + 0.5) / steps.length); }); }
      var sk = cur === "stories" ? "award" : cur; spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === sk); });
      if (tests.length) { var mid = window.innerHeight * 0.5, any = false; tests.forEach(function (t) { var tr = t.getBoundingClientRect(), on = tr.top <= mid && tr.bottom > mid; t.classList.toggle("now", on); if (on) any = true; }); if (testsBox) testsBox.classList.toggle("reading", any); }
      drawHero(y); parallax();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  var heroTimer = null;
  function remeasure() { clearTimeout(heroTimer); heroTimer = setTimeout(function () { measureHero(); lastY = -1; }, 120); }
  window.addEventListener("resize", remeasure); window.addEventListener("load", remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  measureHero();

  /* ── the four activities ──────────────────────────────────── */
  $$("#acts .act").forEach(function (a) {
    var b = $("button", a);
    b.addEventListener("click", function () { var on = !a.classList.contains("on"); a.classList.toggle("on", on); b.setAttribute("aria-expanded", on); });
  });

  /* ── the stories filter the register ──────────────────────── */
  var rows = $$("#register .row"), chips = $$("#filters .chip");
  function setFilter(f, scroll) {
    chips.forEach(function (c) { c.classList.toggle("on", c.dataset.f === f); });
    rows.forEach(function (r) { r.classList.toggle("dim", f !== "all" && r.dataset.cat !== f); });
    if (scroll) { var reg = $("#people"); if (reg) window.scrollTo({ top: reg.offsetTop - 60, behavior: reduce ? "auto" : "smooth" }); }
  }
  chips.forEach(function (c) { c.addEventListener("click", function () { setFilter(c.dataset.f, false); }); });
  $$(".story[data-filter]").forEach(function (b) { b.addEventListener("click", function () { setFilter(b.dataset.filter, true); }); });
  if (fine && !reduce) $$(".story").forEach(function (card) {
    card.addEventListener("mousemove", function (e) { var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; card.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)"; });
    card.addEventListener("mouseleave", function () { card.style.transform = ""; });
  });

  /* ── profiles ─────────────────────────────────────────────── */
  var prof = $("#prof"), pclose = $("#pclose"), lastEl = null, curRow = -1;
  var ACTS = { a: "a · work experience or careers advice", b: "b · mentoring", c: "c · interview and job-related training", d: "d · recruitment open to everyone" };
  function openProf(row) {
    if (!prof) return; lastEl = document.activeElement;
    $("#pfName").textContent = row.dataset.name; $("#pfRole").innerHTML = row.dataset.role;
    $("#pfRoute").textContent = row.dataset.route; $("#pfRoute2").textContent = row.dataset.route; $("#pfBand").style.setProperty("--b", row.dataset.b || "#111");
    $("#pfFocus").innerHTML = row.dataset.focus;
    var q = row.dataset.q || ""; $("#pfQ").textContent = /^TK/.test(q) ? "Question to be written for " + row.dataset.name : "“" + q.replace(/ — /g, ", ") + "”";
    $("#pfSince").textContent = row.dataset.since === "TK" ? "TK — start date" : row.dataset.since;
    $("#pfAct").innerHTML = row.dataset.act.split(" ").map(function (k) { return ACTS[k] || k; }).join("<br>");
    var tpl = $("template.story", row); $("#pfStory").innerHTML = tpl ? tpl.innerHTML : "";
    curRow = rows.indexOf(row);
    var was = !prof.hidden; prof.hidden = false; document.body.classList.add("prof-open"); if (!was) pclose.focus();
    var inn = $(".prof-in"); if (inn) { inn.scrollTop = 0; inn.style.animation = "none"; void inn.offsetWidth; inn.style.animation = ""; }
  }
  var pPrev = $("#pPrev"), pNext = $("#pNext");
  if (pPrev) pPrev.addEventListener("click", function () { openProf(rows[(curRow - 1 + rows.length) % rows.length]); });
  if (pNext) pNext.addEventListener("click", function () { openProf(rows[(curRow + 1) % rows.length]); });
  function closeProf() { if (!prof || prof.hidden) return; prof.hidden = true; document.body.classList.remove("prof-open"); if (lastEl && lastEl.focus) lastEl.focus(); }
  rows.forEach(function (r) { r.addEventListener("click", function () { openProf(r); }); });
  if (pclose) pclose.addEventListener("click", closeProf);
  if (prof) {
    prof.addEventListener("click", function (e) { if (e.target === prof) closeProf(); });
    window.addEventListener("keydown", function (e) {
      if (prof.hidden) return;
      if (e.key === "Escape") { closeProf(); return; }
      if (e.key === "ArrowRight") { openProf(rows[(curRow + 1) % rows.length]); return; }
      if (e.key === "ArrowLeft") { openProf(rows[(curRow - 1 + rows.length) % rows.length]); return; }
      if (e.key === "Tab") { var f = $$("button, a[href]", prof), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
  }

  /* ── the two-year test ────────────────────────────────────── */
  var progStart = $("#progStart"), verdict = $("#verdict"), ruler = $("#ruler"), pin = $("#pin"), band = $("#band"), cut = $("#cut"), twoYearState = $("#twoYearState");
  var DEADLINE = new Date(2026, 8, 8), CUTOFF = new Date(2024, 8, 8), EPOCH0 = new Date(2021, 7, 27);
  function monthsBetween(a, b) { return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) - (b.getDate() < a.getDate() ? 1 : 0); }
  function fmt(d) { return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  function pct(d) { return clamp((d - EPOCH0) / (DEADLINE - EPOCH0), 0, 1) * 100; }
  if (band) band.style.width = pct(CUTOFF).toFixed(2) + "%"; if (cut) cut.style.left = pct(CUTOFF).toFixed(2) + "%";
  $$("#ruler .yr").forEach(function (y) { y.style.left = pct(new Date(+y.textContent, 0, 1)).toFixed(2) + "%"; });
  $$(".quick .chip").forEach(function (c) { c.addEventListener("click", function () { if (!progStart) return; progStart.value = c.dataset.d; progStart.dispatchEvent(new Event("input")); $$(".quick .chip").forEach(function (x) { x.classList.toggle("on", x === c); }); }); });
  if (progStart && verdict) progStart.addEventListener("input", function () {
    if (!progStart.value) { verdict.innerHTML = "Enter the date of the earliest record."; if (ruler) ruler.classList.remove("set", "fail"); if (twoYearState) twoYearState.innerHTML = ""; return; }
    var d = new Date(progStart.value + "T00:00:00"); if (isNaN(d)) return;
    var m = monthsBetween(d, DEADLINE), ok = d <= CUTOFF;
    if (ok) verdict.innerHTML = "<b class='ok'>Passes.</b> By the closing date the programme will have run for " + Math.floor(m / 12) + " year" + (Math.floor(m / 12) === 1 ? "" : "s") + " and " + (m % 12) + " month" + (m % 12 === 1 ? "" : "s") + ", dated from " + fmt(d) + ". Keep that record.";
    else { var sh = Math.abs(monthsBetween(CUTOFF, d)); verdict.innerHTML = "<b>Not yet.</b> A record from " + fmt(d) + " is " + sh + " month" + (sh === 1 ? "" : "s") + " too young for this cycle. Unless an earlier record exists, this category waits a year."; }
    if (pin) pin.style.left = pct(d).toFixed(2) + "%"; if (ruler) { ruler.classList.add("set"); ruler.classList.toggle("fail", !ok); }
    if (twoYearState) twoYearState.innerHTML = ok ? "<span class='st ok'>Passes on the date given</span>" : "<span class='st no'>Not yet, on the date given</span>";
  });

  /* ── the paper ────────────────────────────────────────────── */
  var FIRE = { a: "Class A: wood, paper, textiles. Water, foam, powder or wet chemical will do it.", b: "Class B: petrol, paint, solvents. Foam, CO₂ or powder. Never water.",
    c: "Class C: flammable gases. Dry powder only, once the supply is isolated.", e: "Live electrical: CO₂ or dry powder. Water and foam conduct.", f: "Class F: cooking oils and fats. Wet chemical, purpose-built for the job." };
  var fnote = $("#fnote"), fcs = $$(".fc"), exts = $$(".ext");
  function pickFire(cls) {
    fcs.forEach(function (b) { var on = b.getAttribute("data-cls") === cls; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    exts.forEach(function (x) { var ok = (" " + x.getAttribute("data-ok") + " ").indexOf(" " + cls + " ") >= 0; x.classList.toggle("hit", ok); x.classList.toggle("miss", !ok); });
    if (fnote) fnote.textContent = FIRE[cls] || "";
  }
  fcs.forEach(function (b) { b.addEventListener("click", function () { pickFire(b.getAttribute("data-cls")); }); });
  if (fcs.length) pickFire("a");
  var QUIZ = [{ q: "Waste-paper bin alight in an office.", cls: "a" }, { q: "Overheated fuse board, still live.", cls: "e" }, { q: "Chip-pan fire in the staff kitchen.", cls: "f" },
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
    if (qi >= QUIZ.length) { fq.innerHTML = "<b>" + qScore + " of " + QUIZ.length + ".</b> " + (qScore === QUIZ.length ? "Full marks. You'd pass our induction." : "Return to Learn, then sit it again."); if (fnote) fnote.textContent = "Sit the paper again whenever you like."; return; }
    fq.innerHTML = "Q" + (qi + 1) + " · <b>" + QUIZ[qi].q + "</b> Which extinguisher?"; if (fnote) fnote.textContent = "Mark your answer.";
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
