/* ══════════════════════════════════════════════════════════════════
   THE PEOPLE — engine (the register)
   Print motion, and a few doors: headlines rise from their baselines,
   part-rules draw themselves, the cover door swings open as you
   scroll (or when you knock), the four activity doors open on click,
   timecards clock in and tilt under the pointer, the red path draws
   itself with a walker on it, the two-year test measures a date, the
   evidence slots are stamped, the assessment marks in red pen, and
   the signature line takes real ink. Nothing glows.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var pad2  = function (x) { return x < 10 ? "0" + x : "" + x; };

  /* ── headlines rise from their baselines ──────────────────── */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes), out = [];
    nodes.forEach(function (nd) {
      if (nd.nodeType === 3) {
        nd.textContent.split(/(\s+)/).forEach(function (tk) {
          if (!tk) return;
          if (/^\s+$/.test(tk)) { out.push(document.createTextNode(" ")); return; }
          var box = document.createElement("span"); box.className = "lm";
          var ink = document.createElement("i"); ink.textContent = tk;
          box.appendChild(ink); out.push(box);
        });
      } else if (nd.nodeType === 1) { splitWords(nd); out.push(nd); }
      else { out.push(nd); }
    });
    el.textContent = "";
    out.forEach(function (nd) { el.appendChild(nd); });
  }
  function delayWords(root, step, base) {
    $$(".lm i", root).forEach(function (i, k) { i.style.setProperty("--d", (base + k * step).toFixed(2) + "s"); });
  }
  if (!reduce) {
    $$(".h-b, .bigq, #coverH").forEach(function (el) {
      splitWords(el);
      delayWords(el, 0.05, el.id === "coverH" ? 0.15 : 0.05);
      if (el.id !== "coverH") el.classList.add("rvh");
    });
    var ch = $("#coverH");
    if (ch) requestAnimationFrame(function () { requestAnimationFrame(function () { ch.classList.add("in"); }); });
  }

  /* ── observation: parts, sheets, headlines, stamps ────────── */
  var watched = $$(".rv, .part, .rvh, .tk");
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    watched.forEach(function (e) { io.observe(e); });
  }

  /* ── the pointer: a red dot, and a ring that follows it ───── */
  var cur = $("#cur"), curDot = $("#curdot"), mx = 0, my = 0, rx = 0, ry = 0, curRaf = null;
  if (cur && curDot && fine && !reduce) {
    document.documentElement.classList.add("cur-on");
    function curTick() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      cur.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
      if (Math.abs(mx - rx) > 0.2 || Math.abs(my - ry) > 0.2) curRaf = requestAnimationFrame(curTick); else curRaf = null;
    }
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      curDot.style.transform = "translate(" + mx + "px," + my + "px)";
      var t = e.target, hot = t.closest && t.closest("a,button,input,canvas,.card,.ext");
      cur.classList.toggle("big", !!hot);
      if (!curRaf) curRaf = requestAnimationFrame(curTick);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.style.opacity = "0"; curDot.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cur.style.opacity = ""; curDot.style.opacity = ""; });
  }

  /* ── the cover door ───────────────────────────────────────── */
  var doorway = $("#doorway"), leaf = $("#leaf"), doorBtn = $("#doorBtn"), doorCap = $("#doorCap");
  var doorKnocked = false, doorAngle = 0;
  function setDoor(deg) {
    doorAngle = deg;
    if (leaf) leaf.style.setProperty("--o", (-deg).toFixed(1) + "deg");
    if (doorway) doorway.classList.toggle("open", deg > 18);
  }
  /* on a desk the cover is pinned for one viewport of scrolling while the
     door opens; the door is fully open before the page moves on. On a phone
     it opens as the doorway comes into view. A knock opens it at once. */
  function doorFromScroll(y) {
    if (!doorway || reduce) return;
    var target;
    if (doorKnocked) target = 100;
    else if (window.innerWidth > 920) target = clamp(6 + (y / window.innerHeight) * 94, 6, 100);
    else {
      var r = doorway.getBoundingClientRect();
      target = clamp(6 + ((window.innerHeight - r.top) / (window.innerHeight * 0.75)) * 94, 6, 100);
    }
    setDoor(target);
    if (doorCap && !doorKnocked) doorCap.textContent = target >= 99 ? "Come in" : "Scroll to open, or knock";
  }
  if (doorBtn) {
    doorBtn.addEventListener("click", function () {
      doorKnocked = !doorKnocked;
      doorBtn.setAttribute("aria-pressed", doorKnocked);
      doorBtn.setAttribute("aria-label", doorKnocked ? "Close the door" : "Open the door");
      if (doorCap) doorCap.textContent = doorKnocked ? "Come in" : "Scroll to open, or knock";
      if (reduce) setDoor(doorKnocked ? 100 : 70); else doorFromScroll(window.pageYOffset || 0);
    });
  }
  if (reduce) setDoor(70); else setTimeout(function () { setDoor(6); }, 400);

  /* ── the four doors ───────────────────────────────────────── */
  $$("#doors .dr").forEach(function (dr) {
    var b = $(".leaf", dr), lbl = $(".open", dr);
    if (!b) return;
    b.addEventListener("click", function () {
      var on = !dr.classList.contains("on");
      dr.classList.toggle("on", on);
      b.setAttribute("aria-expanded", on);
      if (lbl) lbl.textContent = on ? "Close" : "Open";
    });
  });

  /* ── the clocking-in board: cards tilt under the pointer ──── */
  if (fine && !reduce) {
    $$("#rack .card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "rotateY(" + (px * 10).toFixed(2) + "deg) rotateX(" + (-py * 10).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* ── the profiles: a card opens a sheet ───────────────────── */
  var prof = $("#prof"), pclose = $("#pclose"), lastCard = null;
  var ACTS = { a: "a · work experience or careers advice", b: "b · mentoring", c: "c · interview and job-related training", d: "d · recruitment open to everyone" };
  function openProf(card) {
    if (!prof) return;
    lastCard = card;
    $("#pfName").textContent = card.dataset.name;
    $("#pfRole").innerHTML = card.dataset.role;
    $("#pfRoute").textContent = card.dataset.route; $("#pfRoute2").textContent = card.dataset.route;
    $("#pfFocus").innerHTML = card.dataset.focus;
    $("#pfSince").textContent = card.dataset.since === "TK" ? "TK — start date" : card.dataset.since;
    $("#pfAct").innerHTML = card.dataset.act.split(" ").map(function (k) { return ACTS[k] || k; }).join("<br>");
    var tpl = $("template.story", card);
    $("#pfStory").innerHTML = tpl ? tpl.innerHTML : "";
    prof.hidden = false; document.body.classList.add("prof-open");
    pclose.focus();
  }
  function closeProf() {
    if (!prof || prof.hidden) return;
    prof.hidden = true; document.body.classList.remove("prof-open");
    if (lastCard) lastCard.focus();
  }
  $$("#rack .card").forEach(function (c) { c.addEventListener("click", function () { openProf(c); }); });
  if (pclose) pclose.addEventListener("click", closeProf);
  if (prof) {
    prof.addEventListener("click", function (e) { if (e.target === prof) closeProf(); });
    window.addEventListener("keydown", function (e) {
      if (prof.hidden) return;
      if (e.key === "Escape") { closeProf(); return; }
      if (e.key === "Tab") {
        var f = $$("button, a[href]", prof), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ── the loupe: photographs magnify under the pointer ─────── */
  var loupe = $("#loupe");
  if (loupe && fine && !reduce) {
    $$(".plate, .doorway").forEach(function (host) {
      var im = $("img", host), zoom = 2.2;
      if (!im) return;
      host.addEventListener("mousemove", function (e) {
        var r = im.getBoundingClientRect();
        if (!im.naturalWidth) return;
        if (host.classList.contains("doorway") && doorAngle < 40) { loupe.classList.remove("on"); return; }
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { loupe.classList.remove("on"); return; }
        var fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
        var bw = r.width * zoom, bh = r.height * zoom;
        loupe.style.backgroundImage = "url(" + JSON.stringify(im.currentSrc || im.src) + ")";
        loupe.style.backgroundSize = bw.toFixed(0) + "px " + bh.toFixed(0) + "px";
        loupe.style.backgroundPosition = (-(fx * bw - 85)).toFixed(0) + "px " + (-(fy * bh - 85)).toFixed(0) + "px";
        loupe.style.transform = "translate(" + (e.clientX - 85) + "px," + (e.clientY - 85) + "px)";
        loupe.classList.add("on");
      });
      host.addEventListener("mouseleave", function () { loupe.classList.remove("on"); });
    });
  }

  /* ── the cover door leans toward the pointer ──────────────── */
  if (doorway && fine && !reduce) {
    doorway.addEventListener("mousemove", function (e) {
      var r = doorway.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      doorway.style.transform = "rotateY(" + (px * 6).toFixed(2) + "deg) rotateX(" + (-py * 4).toFixed(2) + "deg)";
    });
    doorway.addEventListener("mouseleave", function () { doorway.style.transform = ""; });
  }

  /* ── print the exhibit ────────────────────────────────────── */
  var printEx = $("#printExhibit");
  if (printEx && window.print) {
    printEx.hidden = false;
    printEx.addEventListener("click", function () {
      document.body.classList.add("print-exhibit");
      $$("#doors .dr").forEach(function (d) { d.classList.add("on"); });
      window.print();
    });
    window.addEventListener("afterprint", function () { document.body.classList.remove("print-exhibit"); });
  }

  /* ── the two-year test ────────────────────────────────────── */
  var progStart = $("#progStart"), verdict = $("#verdict"), ruler = $("#ruler"), pin = $("#pin"), band = $("#band"), cut = $("#cut");
  var twoYearState = $("#twoYearState");
  var DEADLINE = new Date(2026, 8, 8), CUTOFF = new Date(2024, 8, 8), EPOCH0 = new Date(2021, 7, 27);
  function monthsBetween(a, b) { return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) - (b.getDate() < a.getDate() ? 1 : 0); }
  function fmt(d) { return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  function pct(d) { return clamp((d - EPOCH0) / (DEADLINE - EPOCH0), 0, 1) * 100; }
  if (band) band.style.width = pct(CUTOFF).toFixed(2) + "%";
  if (cut) cut.style.left = pct(CUTOFF).toFixed(2) + "%";
  $$("#ruler .yr").forEach(function (y) { y.style.left = pct(new Date(+y.textContent, 0, 1)).toFixed(2) + "%"; });
  if (progStart && verdict) {
    progStart.addEventListener("input", function () {
      if (!progStart.value) {
        verdict.innerHTML = "Enter the date of the earliest record.";
        if (ruler) ruler.classList.remove("set", "fail"); if (twoYearState) twoYearState.textContent = "";
        return;
      }
      var d = new Date(progStart.value + "T00:00:00");
      if (isNaN(d)) return;
      var m = monthsBetween(d, DEADLINE), ok = d <= CUTOFF;
      if (ok) {
        verdict.innerHTML = "<b>Passes.</b> By the closing date the programme will have run for " +
          Math.floor(m / 12) + " year" + (Math.floor(m / 12) === 1 ? "" : "s") + " and " + (m % 12) + " month" + (m % 12 === 1 ? "" : "s") +
          " — dated from " + fmt(d) + ". Keep that record.";
      } else {
        var sh = Math.abs(monthsBetween(CUTOFF, d));
        verdict.innerHTML = "<b>Not yet.</b> A record from " + fmt(d) + " is " + sh + " month" + (sh === 1 ? "" : "s") +
          " too young for this cycle. Unless an earlier record exists, this category waits a year.";
      }
      if (pin) pin.style.left = pct(d).toFixed(2) + "%";
      if (ruler) { ruler.classList.add("set"); ruler.classList.toggle("fail", !ok); }
      if (twoYearState) twoYearState.textContent = ok ? "· Passes on the date given" : "· Not yet, on the date given";
    });
  }

  /* ── the reading position: folio, index, progress, path ───── */
  var progFill = $("#progFill"), folio = $("#folio"), index = $$(".index a");
  var sections = $$("main section");
  var PARTS = { top: "Cover", who: "Who we are", work: "The work", crew: "The crew", door: "The Open Door",
    training: "Training", build: "What we're building", code: "The code", join: "Join us" };
  var steps = $$("#rail .step"), rail = $("#rail"), railInk = $("#railInk"), walker = $("#walker");
  if (railInk) { var L = 1000; try { L = railInk.getTotalLength(); } catch (e) {} railInk.style.setProperty("--l", L); }
  var ticking = false, lastLp = -1, moveT = null;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (progFill) {
      var mx2 = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      progFill.style.width = (clamp(y / mx2, 0, 1) * 100).toFixed(2) + "%";
    }
    doorFromScroll(y);
    var vm = y + window.innerHeight * 0.42, cur2 = null, idx = 0;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (vm >= s.offsetTop && vm < s.offsetTop + s.offsetHeight) { cur2 = s.id; idx = i; }
    }
    index.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });
    if (folio && cur2) {
      var line = "The People · " + (PARTS[cur2] || "") + " · Part " + (idx + 1) + " of " + sections.length;
      if (folio.textContent !== line) folio.textContent = line;
    }
    if (steps.length && rail) {
      var r = rail.getBoundingClientRect();
      var lp = clamp((window.innerHeight * 0.86 - r.top) / (r.height + window.innerHeight * 0.2), 0, 1);
      for (var k = 0; k < steps.length; k++) steps[k].classList.toggle("lit", lp >= (k + 0.65) / steps.length);
      if (railInk && !reduce) {
        var Lr = parseFloat(railInk.style.getPropertyValue("--l")) || 1000;
        railInk.style.strokeDashoffset = (Lr * (1 - lp)).toFixed(1);
        if (walker) {
          walker.setAttribute("transform", "translate(" + (6 + lp * 988).toFixed(1) + " 0)");
          if (lp !== lastLp) { rail.classList.add("moving"); clearTimeout(moveT); moveT = setTimeout(function () { rail.classList.remove("moving"); }, 260); }
          lastLp = lp;
        }
        rail.style.setProperty("--lp", (lp * 100).toFixed(1) + "%");   /* the vertical rail on phones */
      }
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  if (reduce) steps.forEach(function (r) { r.classList.add("lit"); });

  /* ── the assessment ───────────────────────────────────────── */
  var FIRE = {
    a: "Class A — wood, paper, textiles. Water, foam, powder or wet chemical will do it.",
    b: "Class B — petrol, paint, solvents. Foam, CO₂ or powder. Never water.",
    c: "Class C — flammable gases. Dry powder only, once the supply is isolated.",
    e: "Live electrical — CO₂ or dry powder. Water and foam conduct.",
    f: "Class F — cooking oils and fats. Wet chemical, purpose-built for the job."
  };
  var fnote = $("#fnote"), fcs = $$(".fc"), exts = $$(".ext");
  function pickFire(cls) {
    fcs.forEach(function (b) { var on = b.getAttribute("data-cls") === cls; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    exts.forEach(function (x) {
      var ok = (" " + x.getAttribute("data-ok") + " ").indexOf(" " + cls + " ") >= 0;
      x.classList.toggle("hit", ok); x.classList.toggle("miss", !ok);
    });
    if (fnote) fnote.textContent = FIRE[cls] || "";
  }
  fcs.forEach(function (b) { b.addEventListener("click", function () { pickFire(b.getAttribute("data-cls")); }); });
  if (fcs.length) pickFire("a");

  var QUIZ = [
    { q: "Waste-paper bin alight in an office.", cls: "a" },
    { q: "Overheated fuse board — still live.", cls: "e" },
    { q: "Chip-pan fire in the staff kitchen.", cls: "f" },
    { q: "Petrol spill ignited in the yard.", cls: "b" },
    { q: "Gas cylinder burning at the valve.", cls: "c" },
    { q: "Laptop charger smoking on a desk.", cls: "e" }
  ];
  var fmL = $("#fmLearn"), fmT = $("#fmTest"), fq = $("#fq"), fsc = $("#fscore");
  var qi = 0, qScore = 0, qLock = false;
  function setFMode(test) {
    document.body.classList.toggle("ftest", test);
    fmL.classList.toggle("on", !test); fmT.classList.toggle("on", test);
    fmL.setAttribute("aria-pressed", !test); fmT.setAttribute("aria-pressed", test);
    fq.hidden = !test; fsc.hidden = !test;
    exts.forEach(function (x) { x.classList.remove("hit", "miss", "right", "wrong"); });
    if (test) { qi = 0; qScore = 0; qLock = false; askQ(); } else { pickFire("a"); }
  }
  function askQ() {
    fsc.textContent = qScore + " / " + QUIZ.length;
    if (qi >= QUIZ.length) {
      fq.innerHTML = "<b>" + qScore + " of " + QUIZ.length + ".</b> " +
        (qScore === QUIZ.length ? "Full marks — you'd pass our induction." : "Return to Learn, then sit it again.");
      if (fnote) fnote.textContent = "Sit the paper again whenever you like.";
      return;
    }
    fq.innerHTML = "Q" + (qi + 1) + " — <b>" + QUIZ[qi].q + "</b> Which extinguisher?";
    if (fnote) fnote.textContent = "Mark your answer.";
  }
  exts.forEach(function (x) {
    x.setAttribute("tabindex", "0");
    function answer() {
      if (!document.body.classList.contains("ftest") || qLock || qi >= QUIZ.length) return;
      qLock = true;
      var cls = QUIZ[qi].cls;
      var ok = (" " + x.getAttribute("data-ok") + " ").indexOf(" " + cls + " ") >= 0;
      x.classList.add(ok ? "right" : "wrong");
      if (ok) qScore++;
      if (fnote) fnote.textContent = (ok ? "Correct. " : "Marked wrong. ") + FIRE[cls];
      fsc.textContent = qScore + " / " + QUIZ.length;
      setTimeout(function () { x.classList.remove("right", "wrong"); qi++; qLock = false; askQ(); }, 1400);
    }
    x.addEventListener("click", answer);
    x.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); answer(); } });
  });
  if (fmL && fmT) {
    fmL.addEventListener("click", function () { setFMode(false); });
    fmT.addEventListener("click", function () { setFMode(true); });
  }

  /* ── the signature line ───────────────────────────────────── */
  var sig = $("#sigPad"), sigClear = $("#sigClear");
  if (sig && sig.getContext) {
    var sctx = sig.getContext("2d"), drawing = false, signed = false, lx = 0, ly = 0;
    function sigSize() {
      var w = sig.clientWidth || (sig.parentElement && sig.parentElement.clientWidth);
      if (!w) return;
      var keep = null;
      if (signed) { try { keep = sctx.getImageData(0, 0, sig.width, sig.height); } catch (e) {} }
      sig.width = w; sig.height = 88;
      sctx.lineWidth = 2; sctx.lineCap = "round"; sctx.lineJoin = "round"; sctx.strokeStyle = "#C40000";
      if (keep) sctx.putImageData(keep, 0, 0);
    }
    function pos(e) { var r = sig.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return [p.clientX - r.left, p.clientY - r.top]; }
    sig.addEventListener("mousedown", function (e) { drawing = true; var p = pos(e); lx = p[0]; ly = p[1]; e.preventDefault(); });
    sig.addEventListener("mousemove", function (e) {
      if (!drawing) return; var p = pos(e);
      sctx.beginPath(); sctx.moveTo(lx, ly); sctx.lineTo(p[0], p[1]); sctx.stroke();
      lx = p[0]; ly = p[1]; signed = true; e.preventDefault();
    });
    window.addEventListener("mouseup", function () { drawing = false; });
    sig.addEventListener("touchstart", function (e) { drawing = true; var p = pos(e); lx = p[0]; ly = p[1]; e.preventDefault(); }, { passive: false });
    sig.addEventListener("touchmove", function (e) {
      if (!drawing) return; var p = pos(e);
      sctx.beginPath(); sctx.moveTo(lx, ly); sctx.lineTo(p[0], p[1]); sctx.stroke();
      lx = p[0]; ly = p[1]; signed = true; e.preventDefault();
    }, { passive: false });
    sig.addEventListener("touchend", function () { drawing = false; });
    if (sigClear) sigClear.addEventListener("click", function () { sctx.clearRect(0, 0, sig.width, sig.height); signed = false; });
    window.addEventListener("resize", sigSize);
    window.addEventListener("load", sigSize);
    sigSize();
  }

  /* ── protecting-since ─────────────────────────────────────── */
  var EPOCH = new Date(2021, 7, 27).getTime();
  var groups = [["tD", "tH", "tM", "tS"], ["tD2", "tH2", "tM2", "tS2"]].map(function (g) {
    return g.map(function (id) { return document.getElementById(id); });
  });
  var lastSec = -1;
  function ticker() {
    var s = Math.floor((Date.now() - EPOCH) / 1000);
    if (s === lastSec) return;
    lastSec = s;
    groups.forEach(function (g) {
      if (!g[0]) return;
      g[0].textContent = Math.floor(s / 86400);
      g[1].textContent = pad2(Math.floor(s / 3600) % 24);
      g[2].textContent = pad2(Math.floor(s / 60) % 60);
      g[3].textContent = pad2(s % 60);
    });
  }
  ticker();
  setInterval(ticker, 1000);
})();
