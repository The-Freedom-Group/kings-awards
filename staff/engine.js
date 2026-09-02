/* ══════════════════════════════════════════════════════════════════
   THE PEOPLE — engine (the dossier)
   A paper document needs a light hand: sheets lay down as they enter,
   the ladder's checkboxes tick with the scroll, the exam marks itself
   in red pen, the drill flashes the margins and stamps the page, the
   marquee runs the red tape, and the protecting-since counters tick.
   No canvas, no particles, no cursor games — ink only.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var pad2  = function (x) { return x < 10 ? "0" + x : "" + x; };

  /* ── the cover sheet lifts ────────────────────────────────── */
  function ready() { document.body.classList.add("ready"); }
  if (reduce) { ready(); }
  else if (document.readyState === "complete") { setTimeout(ready, 1150); }
  else { window.addEventListener("load", function () { setTimeout(ready, 1150); }); }

  /* ── sheets lay down as they enter ────────────────────────── */
  var watched = $$(".rv");
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

  /* ── header progress + file tabs ──────────────────────────── */
  var progFill = $("#progFill"), tabs = $$(".tabs a");
  var sections = $$("main section");
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (progFill) {
      var mx = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      progFill.style.width = (clamp(y / mx, 0, 1) * 100).toFixed(2) + "%";
    }
    var vm = y + window.innerHeight * 0.42, cur = null;
    sections.forEach(function (s) {
      if (vm >= s.offsetTop && vm < s.offsetTop + s.offsetHeight) cur = s.id;
    });
    tabs.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur); });

    /* the ladder ticks with the scroll, in both directions */
    if (rows.length) {
      var cr = rows[0].parentElement.getBoundingClientRect();
      var lp = clamp((window.innerHeight * 0.86 - cr.top) /
                     (cr.height + window.innerHeight * 0.25), 0, 1);
      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.toggle("lit", lp >= (i + 0.7) / rows.length);
      }
    }
    ticking = false;
  }
  var rows = $$(".crow");
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (reduce) rows.forEach(function (r) { r.classList.add("lit"); });

  /* ── marquee: the red tape runs ───────────────────────────── */
  var marquees = [];
  $$(".mq-t").forEach(function (t) {
    var base = t.getAttribute("data-base") || "";
    var html = "";
    for (var i = 0; i < 6; i++) html += "<span>" + base + "</span>";
    t.innerHTML = html;
    marquees.push({ el: t, x: 0, w: 0 });
  });
  function measureMarquees() {
    marquees.forEach(function (m) {
      var first = m.el.firstElementChild;
      m.w = first ? first.offsetWidth : 0;
    });
  }
  if (!reduce && marquees.length) {
    (function mloop() {
      marquees.forEach(function (m) {
        if (!m.w) return;
        m.x -= 0.7;
        if (m.x <= -m.w) m.x += m.w;
        m.el.style.transform = "translate3d(" + m.x.toFixed(1) + "px,0,0)";
      });
      requestAnimationFrame(mloop);
    })();
  }

  /* ── the drill: margin flash + stamp ──────────────────────── */
  var drillBtn = $("#drillBtn"), toast = $("#toast"), drillLock = false;
  function stampSay(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    setTimeout(function () { toast.classList.remove("on"); }, 3600);
  }
  if (drillBtn) {
    drillBtn.addEventListener("click", function () {
      if (drillLock || reduce) {
        if (reduce) stampSay("Drill logged.");
        return;
      }
      drillLock = true;
      var t0 = performance.now();
      document.body.classList.add("drill-on");
      setTimeout(function () {
        document.body.classList.remove("drill-on");
        stampSay("DRILL COMPLETE — " + ((performance.now() - t0) / 1000).toFixed(1) + "s");
        drillLock = false;
      }, 2550);
    });
  }

  /* ── the exam ─────────────────────────────────────────────── */
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
      fq.innerHTML = "<b>" + qScore + " / " + QUIZ.length + " — marked in red pen.</b> " +
        (qScore === QUIZ.length ? "Full marks. You'd pass our induction."
          : "Switch to Learn, have another look, then resit.");
      if (fnote) fnote.textContent = "Press SIT THE PAPER to resit.";
      return;
    }
    fq.innerHTML = "Q" + (qi + 1) + " of " + QUIZ.length + " — <b>" + QUIZ[qi].q +
      "</b> Which extinguisher?";
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

  /* ── protecting-since counters (both instances) ───────────── */
  var EPOCH = new Date(2021, 7, 27).getTime();
  var ids = [["tD","tH","tM","tS"],["tD2","tH2","tM2","tS2"]].map(function (g) {
    return g.map(function (id) { return document.getElementById(id); });
  });
  var lastSec = -1;
  function ticker() {
    var s = Math.floor((Date.now() - EPOCH) / 1000);
    if (s === lastSec) return;
    lastSec = s;
    ids.forEach(function (g) {
      if (!g[0]) return;
      g[0].textContent = Math.floor(s / 86400);
      g[1].textContent = pad2(Math.floor(s / 3600) % 24);
      g[2].textContent = pad2(Math.floor(s / 60) % 60);
      g[3].textContent = pad2(s % 60);
    });
  }
  ticker();
  setInterval(ticker, 1000);

  window.addEventListener("resize", measureMarquees);
  window.addEventListener("load", measureMarquees);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureMarquees);
  measureMarquees();
})();
