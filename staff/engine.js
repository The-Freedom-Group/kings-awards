/* ══════════════════════════════════════════════════════════════════
   THE PEOPLE — engine (vertical)
   Conventional scrolling, maximal surface: per-section contours and
   tinted atmospheres, poster words sliding against the scroll, a
   velocity marquee, cursor-stirred embers, spotlight, magnetics and
   tilt, the scroll-lit ladder in The Open Door, the scored quiz, the
   drill, and the protecting-since ticker.
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
  var pad2  = function (x) { return x < 10 ? "0" + x : "" + x; };

  /* ── entrance ─────────────────────────────────────────────── */
  function ready() { document.body.classList.add("ready"); }
  if (reduce) { ready(); }
  else if (document.readyState === "complete") { setTimeout(ready, 1300); }
  else { window.addEventListener("load", function () { setTimeout(ready, 1300); }); }

  /* ── per-section furniture: contours, poster word, spotlight ─ */
  function rnd(seed) {
    return function () {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  }
  function blobPath(cx, cy, r, rand) {
    var a1 = .16 + rand() * .1, a2 = .08 + rand() * .08, a3 = .05 + rand() * .05;
    var p1 = rand() * 6.28, p2 = rand() * 6.28, p3 = rand() * 6.28;
    var d = "";
    for (var i = 0; i <= 56; i++) {
      var th = i / 56 * Math.PI * 2;
      var rr = r * (1 + a1 * Math.sin(2 * th + p1) + a2 * Math.sin(3 * th + p2) +
                        a3 * Math.sin(5 * th + p3));
      d += (i ? " L " : "M ") + (cx + Math.cos(th) * rr * 1.35).toFixed(1) + " " +
           (cy + Math.sin(th) * rr).toFixed(1);
    }
    return d + " Z";
  }
  function contourGroup(cx, cy, r, rings, rand, cls) {
    var g = '<g class="' + cls + '">';
    for (var k = 0; k < rings; k++) {
      g += '<path d="' + blobPath(cx + (rand() - .5) * 40, cy + (rand() - .5) * 34,
                                  r * (1 - k * .17), rand) + '"/>';
    }
    return g + "</g>";
  }
  var sections = $$("main section");
  var pws = [];
  sections.forEach(function (sec, i) {
    var rand = rnd(83 + i * 173);
    var fx = document.createElement("div");
    fx.className = "topo"; fx.setAttribute("aria-hidden", "true");
    var anim = reduce ? ["", ""] : ["a", "b"];
    fx.innerHTML = '<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">' +
      contourGroup(200 + rand() * 180, 140 + rand() * 120, 150 + rand() * 70, 5, rand, anim[0]) +
      contourGroup(700 + rand() * 200, 380 + rand() * 150, 180 + rand() * 80, 6, rand,
                   anim[1] + (i % 3 === 1 ? " hot" : "")) + "</svg>";
    sec.insertBefore(fx, sec.firstChild);

    var word = sec.getAttribute("data-word");
    if (word) {
      var w = document.createElement("span");
      w.className = "pw"; w.setAttribute("aria-hidden", "true");
      w.textContent = word;
      sec.insertBefore(w, sec.firstChild.nextSibling);
      pws.push({ el: w, sec: sec });
    }

    if (fine && !reduce) {
      var sp = document.createElement("div");
      sp.className = "spot"; sp.setAttribute("aria-hidden", "true");
      sec.appendChild(sp);
      sec.addEventListener("mousemove", (function (spx, ss) {
        return function (e) {
          var r = ss.getBoundingClientRect();
          spx.style.setProperty("--sx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
          spx.style.setProperty("--sy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        };
      })(sp, sec), { passive: true });
    }
  });

  /* ── reveals ──────────────────────────────────────────────── */
  var watched = $$(".rv");
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle("in", en.isIntersecting); });
    }, { rootMargin: "-4% 0px -8% 0px", threshold: 0.05 });
    watched.forEach(function (e) { io.observe(e); });
  }

  /* ── hero photograph ──────────────────────────────────────── */
  var heroShot = $("#heroShot");
  if (heroShot) {
    var hlit = function () { heroShot.classList.add("on"); };
    heroShot.complete ? hlit()
      : (heroShot.addEventListener("load", hlit), heroShot.addEventListener("error", hlit));
  }

  /* ── embers ───────────────────────────────────────────────── */
  var efx = $("#emberfx"), ectx = null, EP = [], eBurst = 0;
  var eW = 0, eH = 0, emx = -1e4, emy = -1e4;
  function emberSize() {
    if (!efx) return;
    eW = efx.width = window.innerWidth;
    eH = efx.height = window.innerHeight;
  }
  if (efx && !reduce && efx.getContext) {
    ectx = efx.getContext("2d");
    emberSize();
    for (var ei = 0; ei < 100; ei++) {
      EP.push({ x: Math.random() * 2000, y: Math.random() * 1200,
                vx: 0, vy: -(0.22 + Math.random() * 0.55),
                r: 0.8 + Math.random() * 1.6, ph: Math.random() * 6.28,
                hot: Math.random() < 0.5 });
    }
    window.addEventListener("mousemove", function (e) {
      emx = e.clientX; emy = e.clientY;
    }, { passive: true });
    document.addEventListener("mouseleave", function () { emx = -1e4; emy = -1e4; });
  }
  function embers(ts) {
    if (!ectx || !eW) return;
    ectx.clearRect(0, 0, eW, eH);
    for (var i = 0; i < EP.length; i++) {
      var p = EP[i];
      p.ph += 0.012;
      p.x += p.vx + Math.sin(p.ph + i) * 0.2;
      p.y += p.vy - eBurst * (0.5 + Math.random());
      p.vx *= 0.94;
      var dx = p.x - emx, dy = p.y - emy, dd = dx * dx + dy * dy;
      if (dd < 14400) {
        var d = Math.sqrt(dd) || 1, f = (120 - d) / 120 * 1.6;
        p.vx += (dx / d) * f; p.vy -= f * 0.12;
      }
      p.vy = Math.min(-0.18, p.vy + 0.006);
      if (p.y < -8 || p.x < -20 || p.x > eW + 20) {
        p.x = Math.random() * eW; p.y = eH + 6;
        p.vy = -(0.22 + Math.random() * 0.55); p.vx = 0;
      }
      var tw = 0.5 + 0.5 * Math.sin(ts / 300 + p.ph * 5);
      ectx.beginPath();
      ectx.arc(p.x, p.y, p.r, 0, 6.283);
      ectx.fillStyle = p.hot
        ? "rgba(255,75,43," + (0.42 * tw).toFixed(2) + ")"
        : "rgba(196,0,0," + (0.36 * tw).toFixed(2) + ")";
      ectx.fill();
    }
    eBurst *= 0.9;
  }

  /* ── cursor + magnetics + tilt ────────────────────────────── */
  var cur = $("#cur"), curDot = $("#curDot"), curRing = $("#curRing");
  var mx = innerWidth / 2, my = innerHeight / 2, rx2 = mx, ry2 = my, curSeen = false;
  if (fine && !reduce && cur) {
    document.documentElement.classList.add("cur-on");
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY; curSeen = true;
      var hot = e.target.closest &&
        e.target.closest("a,button,[data-mag],.card,.ext,.spine a");
      cur.classList.toggle("big", !!hot);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cur.style.opacity = "1"; });
  }
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
        tx = (e.clientX - r.left - r.width / 2) * 0.3;
        ty = (e.clientY - r.top - r.height / 2) * 0.3;
        on = true; if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener("mouseleave", function () { tx = 0; ty = 0; on = false; });
    });
    $$(".card").forEach(function (el) {
      el.addEventListener("mouseenter", function () { el.classList.add("tilting"); });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "translateY(-3px) rotateX(" + (-py * 4).toFixed(2) +
          "deg) rotateY(" + (px * 4).toFixed(2) + "deg)";
      });
      el.addEventListener("mouseleave", function () {
        el.classList.remove("tilting"); el.style.transform = "";
      });
    });
  }

  /* ── marquee ──────────────────────────────────────────────── */
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

  /* ── the drill ────────────────────────────────────────────── */
  var drillBtn = $("#drillBtn"), toast = $("#toast"), drillLock = false;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    setTimeout(function () { toast.classList.remove("on"); }, 3600);
  }
  if (drillBtn) {
    drillBtn.addEventListener("click", function () {
      if (drillLock) return;
      drillLock = true;
      var t0 = performance.now();
      document.body.classList.add("drill-on");
      eBurst = 3.2;
      setTimeout(function () {
        document.body.classList.remove("drill-on");
        say("Drill complete in " + ((performance.now() - t0) / 1000).toFixed(1) +
            "s. Muscle memory matters.");
        drillLock = false;
      }, 2550);
    });
  }

  /* ── know your fire ───────────────────────────────────────── */
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
      fq.innerHTML = "<b>" + qScore + " out of " + QUIZ.length + ".</b> " +
        (qScore === QUIZ.length ? "Full marks — you'd pass our induction."
          : "Switch to Learn and have another look, then go again.");
      if (fnote) fnote.textContent = "Tap Test yourself to run it again.";
      return;
    }
    fq.innerHTML = "Callout " + (qi + 1) + " of " + QUIZ.length + " — <b>" +
      QUIZ[qi].q + "</b> Which extinguisher?";
    if (fnote) fnote.textContent = "Pick a card.";
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
      if (fnote) fnote.textContent = (ok ? "Right. " : "Not that one. ") + FIRE[cls];
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

  /* ── ticker ───────────────────────────────────────────────── */
  var tD = $("#tD"), tH = $("#tH"), tM = $("#tM"), tS = $("#tS");
  var EPOCH = new Date(2021, 7, 27).getTime();
  var lastSec = -1;
  function ticker() {
    if (!tD) return;
    var s = Math.floor((Date.now() - EPOCH) / 1000);
    if (s === lastSec) return;
    lastSec = s;
    tD.textContent = Math.floor(s / 86400);
    tH.textContent = pad2(Math.floor(s / 3600) % 24);
    tM.textContent = pad2(Math.floor(s / 60) % 60);
    tS.textContent = pad2(s % 60);
  }

  /* ── master loop ──────────────────────────────────────────── */
  var chrome = $("#chrome"), progFill = $("#progFill"), spine = $$(".spine a");
  var laneFill = $("#laneFill"), stepEls = $$("#steps .step"), stepsEl = $("#steps");
  var lastY = -1, velY = 0;

  function frame(ts) {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var moved = y !== lastY;
    velY = lerp(velY, moved ? y - lastY : 0, 0.12);
    lastY = y;

    if (fine && !reduce && curSeen) {
      curDot.style.transform = "translate(" + mx + "px," + my + "px)";
      rx2 = lerp(rx2, mx, 0.16); ry2 = lerp(ry2, my, 0.16);
      curRing.style.transform = "translate(" + rx2.toFixed(1) + "px," + ry2.toFixed(1) + "px)";
    }

    embers(ts || 0);
    ticker();

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
      if (progFill) {
        var mx3 = (document.documentElement.scrollHeight - window.innerHeight) || 1;
        progFill.style.width = (clamp(y / mx3, 0, 1) * 100).toFixed(2) + "%";
      }

      /* spine tracking */
      var vm = y + window.innerHeight * 0.42, cur2 = null;
      sections.forEach(function (s) {
        if (vm >= s.offsetTop && vm < s.offsetTop + s.offsetHeight) cur2 = s.id;
      });
      spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });

      if (!reduce) {
        var vh = window.innerHeight;
        /* poster words slide against the scroll, and lean with speed */
        for (var i = 0; i < pws.length; i++) {
          var ps = pws[i].sec;
          var pp = (y + vh - ps.offsetTop) / (vh + ps.offsetHeight);
          if (pp > -0.1 && pp < 1.1) {
            pws[i].el.style.transform = "translate3d(" +
              ((pp - 0.5) * -window.innerWidth * 0.2).toFixed(1) + "px,-50%,0)" +
              " skewX(" + clamp(-velY * 0.06, -4, 4).toFixed(2) + "deg)";
          }
        }
        /* hero photo settles */
        if (heroShot) {
          var hp = clamp(y / (vh || 1), 0, 1);
          heroShot.style.transform = "translate3d(0," + (hp * -40).toFixed(1) + "px,0) scale(1.04)";
        }
        /* the ladder draws as it enters */
        if (laneFill && stepsEl) {
          var sr = stepsEl.getBoundingClientRect();
          var lp = clamp((vh * 0.88 - sr.top) / (sr.height + vh * 0.3), 0, 1);
          laneFill.style.width = (lp * 100).toFixed(1) + "%";
          for (var s2 = 0; s2 < stepEls.length; s2++) {
            stepEls[s2].classList.toggle("lit", lp >= (s2 + 0.6) / stepEls.length);
          }
        }
        /* photographs drift inside their crops */
        $$("[data-drift]").forEach(function (img) {
          var fr = img.getBoundingClientRect();
          var fp = clamp((vh - fr.top) / (vh + fr.height), 0, 1);
          img.style.transform = "translate3d(0," + ((fp - 0.5) * 42).toFixed(1) + "px,0) scale(1.1)";
        });
      }
    }
    requestAnimationFrame(frame);
  }

  if (reduce) {
    if (laneFill) laneFill.style.width = "100%";
    stepEls.forEach(function (s) { s.classList.add("lit"); });
    function still() {
      var y = window.pageYOffset || 0;
      if (chrome) chrome.classList.toggle("stuck", y > 40);
      var vm = y + window.innerHeight * 0.42, cur2 = null;
      sections.forEach(function (s) {
        if (vm >= s.offsetTop && vm < s.offsetTop + s.offsetHeight) cur2 = s.id;
      });
      spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });
    }
    window.addEventListener("scroll", still, { passive: true });
    still();
    setInterval(ticker, 1000);
  } else {
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", function () { emberSize(); measureMarquees(); });
  window.addEventListener("load", function () { emberSize(); measureMarquees(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureMarquees);
  measureMarquees();
})();
