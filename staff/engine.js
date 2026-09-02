/* ══════════════════════════════════════════════════════════════════
   THE PEOPLE — engine (the register)
   Print motion only: headlines rise line by line from their
   baselines, part-rules draw themselves, the path's numerals turn
   red as the reader passes, the assessment marks in red pen, the
   folio names the part you are reading, and the signature line
   takes real ink. Nothing glows, nothing floats.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var pad2  = function (x) { return x < 10 ? "0" + x : "" + x; };

  /* ── headlines rise from their baselines ──────────────────── */
  function splitWords(el, step, base) {
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
      } else if (nd.nodeType === 1) {
        splitWords(nd, step, base);          /* recurse into <em> etc. */
        out.push(nd);
      } else { out.push(nd); }
    });
    el.textContent = "";
    out.forEach(function (nd) { el.appendChild(nd); });
  }
  function delayWords(root, step, base) {
    $$(".lm i", root).forEach(function (i, k) {
      i.style.setProperty("--d", (base + k * step).toFixed(2) + "s");
    });
  }
  if (!reduce) {
    $$(".h-b, .bigq, #coverH").forEach(function (el) {
      splitWords(el, 0.05, 0);
      delayWords(el, 0.05, el.id === "coverH" ? 0.15 : 0.05);
      if (el.id !== "coverH") el.classList.add("rvh");
    });
    var ch = $("#coverH");
    if (ch) requestAnimationFrame(function () {
      requestAnimationFrame(function () { ch.classList.add("in"); });
    });
  }

  /* ── observation: parts, sheets, headlines ────────────────── */
  var watched = $$(".rv, .part, .rvh");
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    watched.forEach(function (e) { io.observe(e); });
  }

  /* ── the reading position: folio, index, progress, path ───── */
  var progFill = $("#progFill"), folio = $("#folio"), index = $$(".index a");
  var sections = $$("main section");
  var PARTS = { top: "Cover", who: "Who we are", work: "The work", crew: "The crew",
    door: "The Open Door", training: "Training", build: "What we're building",
    code: "The code", join: "Join us" };
  var prows = $$("#proc .prow"), procEl = $("#proc");
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (progFill) {
      var mx = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      progFill.style.width = (clamp(y / mx, 0, 1) * 100).toFixed(2) + "%";
    }
    var vm = y + window.innerHeight * 0.42, cur = null, idx = 0;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (vm >= s.offsetTop && vm < s.offsetTop + s.offsetHeight) { cur = s.id; idx = i; }
    }
    index.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur); });
    if (folio && cur) {
      var line = "The People · " + (PARTS[cur] || "") + " · Part " + (idx + 1) + " of " +
        sections.length;
      if (folio.textContent !== line) folio.textContent = line;
    }
    if (prows.length && procEl) {
      var r = procEl.getBoundingClientRect();
      var lp = clamp((window.innerHeight * 0.86 - r.top) /
                     (r.height + window.innerHeight * 0.2), 0, 1);
      for (var k = 0; k < prows.length; k++) {
        prows[k].classList.toggle("lit", lp >= (k + 0.65) / prows.length);
      }
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  if (reduce) prows.forEach(function (r) { r.classList.add("lit"); });

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
    fcs.forEach(function (b) {
      var on = b.getAttribute("data-cls") === cls;
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
    });
    exts.forEach(function (x) {
      var ok = (" " + x.getAttribute("data-ok") + " ").indexOf(" " + cls + " ") >= 0;
      x.classList.toggle("hit", ok); x.classList.toggle("miss", !ok);
    });
    if (fnote) fnote.textContent = FIRE[cls] || "";
  }
  fcs.forEach(function (b) {
    b.addEventListener("click", function () { pickFire(b.getAttribute("data-cls")); });
  });
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
    if (test) { qi = 0; qScore = 0; qLock = false; askQ(); }
    else { pickFire("a"); }
  }
  function askQ() {
    fsc.textContent = qScore + " / " + QUIZ.length;
    if (qi >= QUIZ.length) {
      fq.innerHTML = "<b>" + qScore + " of " + QUIZ.length + ".</b> " +
        (qScore === QUIZ.length ? "Full marks — you'd pass our induction."
          : "Return to Learn, then sit it again.");
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
      setTimeout(function () {
        x.classList.remove("right", "wrong");
        qi++; qLock = false; askQ();
      }, 1400);
    }
    x.addEventListener("click", answer);
    x.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); answer(); }
    });
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
      sctx.lineWidth = 2; sctx.lineCap = "round"; sctx.lineJoin = "round";
      sctx.strokeStyle = "#C40000";
      if (keep) sctx.putImageData(keep, 0, 0);
    }
    function pos(e) {
      var r = sig.getBoundingClientRect();
      var p = e.touches ? e.touches[0] : e;
      return [p.clientX - r.left, p.clientY - r.top];
    }
    sig.addEventListener("mousedown", function (e) {
      drawing = true; var p = pos(e); lx = p[0]; ly = p[1]; e.preventDefault();
    });
    sig.addEventListener("mousemove", function (e) {
      if (!drawing) return;
      var p = pos(e);
      sctx.beginPath(); sctx.moveTo(lx, ly); sctx.lineTo(p[0], p[1]); sctx.stroke();
      lx = p[0]; ly = p[1]; signed = true; e.preventDefault();
    });
    window.addEventListener("mouseup", function () { drawing = false; });
    sig.addEventListener("touchstart", function (e) {
      drawing = true; var p = pos(e); lx = p[0]; ly = p[1]; e.preventDefault();
    }, { passive: false });
    sig.addEventListener("touchmove", function (e) {
      if (!drawing) return;
      var p = pos(e);
      sctx.beginPath(); sctx.moveTo(lx, ly); sctx.lineTo(p[0], p[1]); sctx.stroke();
      lx = p[0]; ly = p[1]; signed = true; e.preventDefault();
    }, { passive: false });
    sig.addEventListener("touchend", function () { drawing = false; });
    if (sigClear) sigClear.addEventListener("click", function () {
      sctx.clearRect(0, 0, sig.width, sig.height); signed = false;
    });
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
