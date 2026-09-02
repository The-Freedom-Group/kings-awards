/* ══════════════════════════════════════════════════════════════════
   THE NIGHT SHIFT — engine
   Vertical scroll drives a horizontal walk through the depot. The HUD
   clock interpolates 18:00 → 06:00 across the journey, time markers
   parallax through each bay, embers drift and answer the cursor, and
   the training-room quiz keeps score. Mobile and reduced-motion get
   the same bays as a vertical page.
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

  var horizontal = function () { return window.innerWidth > 900 && !reduce; };

  /* ── entrance ─────────────────────────────────────────────── */
  function ready() { document.body.classList.add("ready"); }
  if (reduce) { ready(); }
  else if (document.readyState === "complete") { setTimeout(ready, 1350); }
  else { window.addEventListener("load", function () { setTimeout(ready, 1350); }); }

  /* ── the shift geometry ───────────────────────────────────── */
  var shift = $("#shift"), track = $("#track"), bays = $$(".bayp");
  var trackW = 0, maxX = 0, scrollLen = 0;

  function layout() {
    if (!shift || !track) return;
    if (!horizontal()) { shift.style.height = ""; track.style.transform = ""; return; }
    trackW = track.scrollWidth;
    maxX = Math.max(0, trackW - window.innerWidth);
    scrollLen = maxX + window.innerHeight;
    shift.style.height = scrollLen + "px";
  }

  function progress() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    return maxX ? clamp(y / (scrollLen - window.innerHeight), 0, 1) : 0;
  }

  /* jump helper: bay index → scroll position */
  function bayX(i) {
    var x = 0;
    for (var k = 0; k < i; k++) x += bays[k].offsetWidth;
    return x;
  }
  function goBay(i) {
    i = clamp(i, 0, bays.length - 1);
    if (horizontal()) {
      var x = Math.min(bayX(i), maxX);
      window.scrollTo({ top: maxX ? x / maxX * (scrollLen - window.innerHeight) : 0,
                        behavior: reduce ? "auto" : "smooth" });
    } else {
      bays[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  /* ── HUD: clock, bay name, progress, dots ─────────────────── */
  var hudH = $("#hudH"), hudM = $("#hudM"), hudBay = $("#hudBay"), hudFill = $("#hudFill");
  var dots = $("#dots"), dotEls = [];
  bays.forEach(function (b, i) {
    var d = document.createElement("button");
    d.type = "button";
    d.setAttribute("data-lb", b.getAttribute("data-time") + " · " + b.getAttribute("data-bay"));
    d.setAttribute("aria-label", "Go to " + b.getAttribute("data-bay"));
    d.addEventListener("click", function () { goBay(i); });
    dots.appendChild(d); dotEls.push(d);
  });

  var SHIFT_START = 18 * 60, SHIFT_LEN = 12 * 60;   /* 18:00 → 06:00 */
  function hud(p) {
    var mins = Math.round(SHIFT_START + p * SHIFT_LEN) % (24 * 60);
    if (hudH) hudH.textContent = pad2(Math.floor(mins / 60));
    if (hudM) hudM.textContent = pad2(mins % 60);
    if (hudFill) hudFill.style.width = (p * 100).toFixed(2) + "%";

    var cx = horizontal()
      ? p * maxX + window.innerWidth * 0.5
      : null;
    var cur = 0;
    if (cx !== null) {
      var acc = 0;
      for (var i = 0; i < bays.length; i++) {
        acc += bays[i].offsetWidth;
        if (cx <= acc) { cur = i; break; }
        cur = i;
      }
    } else {
      var vm = (window.pageYOffset || 0) + window.innerHeight * 0.4;
      for (var k = 0; k < bays.length; k++) {
        if (vm >= bays[k].offsetTop) cur = k;
      }
    }
    if (hudBay) hudBay.textContent = bays[cur].getAttribute("data-bay");
    dotEls.forEach(function (d, di) { d.classList.toggle("on", di === cur); });
  }

  /* ── time markers + contours + spotlight per bay ──────────── */
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
  var tmarks = [];
  bays.forEach(function (b, i) {
    /* contours */
    var rand = rnd(83 + i * 173);
    var fx = document.createElement("div");
    fx.className = "topo"; fx.setAttribute("aria-hidden", "true");
    var anim = reduce ? ["", ""] : ["a", "b"];
    fx.innerHTML = '<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">' +
      contourGroup(200 + rand() * 180, 140 + rand() * 120, 150 + rand() * 70, 5, rand, anim[0]) +
      contourGroup(700 + rand() * 200, 380 + rand() * 150, 180 + rand() * 80, 6, rand,
                   anim[1] + (i % 3 === 1 ? " hot" : "")) + "</svg>";
    b.insertBefore(fx, b.firstChild);

    /* time marker */
    var tm = document.createElement("span");
    tm.className = "tmark"; tm.setAttribute("aria-hidden", "true");
    tm.textContent = b.getAttribute("data-time");
    b.insertBefore(tm, b.firstChild.nextSibling);
    tmarks.push({ el: tm, bay: b });

    /* spotlight */
    if (fine && !reduce) {
      var sp = document.createElement("div");
      sp.className = "spot"; sp.setAttribute("aria-hidden", "true");
      b.appendChild(sp);
      b.addEventListener("mousemove", (function (spx, bb) {
        return function (e) {
          var r = bb.getBoundingClientRect();
          spx.style.setProperty("--sx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
          spx.style.setProperty("--sy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        };
      })(sp, b), { passive: true });
    }
  });

  /* ── reveals ──────────────────────────────────────────────── */
  var watched = $$(".rv");
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle("in", en.isIntersecting); });
    }, { rootMargin: "0px -6% 0px -6%", threshold: 0.05 });
    watched.forEach(function (e) { io.observe(e); });
  }

  /* ── hero photograph ──────────────────────────────────────── */
  var heroShot = $("#heroShot");
  if (heroShot) {
    var hlit = function () { heroShot.classList.add("on"); };
    heroShot.complete ? hlit()
      : (heroShot.addEventListener("load", hlit), heroShot.addEventListener("error", hlit));
  }

  /* ── embers: the whole depot breathes ─────────────────────── */
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

  /* ── cursor + magnetics ───────────────────────────────────── */
  var cur = $("#cur"), curDot = $("#curDot"), curRing = $("#curRing");
  var mx = innerWidth / 2, my = innerHeight / 2, rx2 = mx, ry2 = my, curSeen = false;
  if (fine && !reduce && cur) {
    document.documentElement.classList.add("cur-on");
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY; curSeen = true;
      var hot = e.target.closest &&
        e.target.closest("a,button,[data-mag],.card,.ext,.dots button");
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
    /* tilt on cards */
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
  var walkBtn = $("#walkBtn");
  if (walkBtn) walkBtn.addEventListener("click", function () { goBay(1); });

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

  /* ── keyboard: arrow keys walk the bays ───────────────────── */
  window.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (e.target && /INPUT|TEXTAREA|BUTTON/.test(e.target.tagName)) return;
    var p = progress(), cx = p * maxX + window.innerWidth * 0.5, acc = 0, cur2 = 0;
    for (var i = 0; i < bays.length; i++) {
      acc += bays[i].offsetWidth;
      if (cx <= acc) { cur2 = i; break; }
      cur2 = i;
    }
    e.preventDefault();
    goBay(cur2 + (e.key === "ArrowRight" ? 1 : -1));
  });

  /* ── master loop ──────────────────────────────────────────── */
  var lastY = -1, velY = 0, laneFill = $("#laneFill"), stopEls = $$("#stops .stop"),
      stopsEl = $("#stops");

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

    var p = progress();
    if (horizontal()) {
      track.style.transform = "translate3d(" + (-p * maxX).toFixed(1) + "px,0,0)";
    }
    hud(p);

    /* time markers drift slower than the track — depth */
    if (horizontal() && !reduce) {
      for (var i = 0; i < tmarks.length; i++) {
        var r = tmarks[i].bay.getBoundingClientRect();
        if (r.right < -100 || r.left > window.innerWidth + 100) continue;
        var off = (r.left - window.innerWidth * 0.5) * 0.22;
        tmarks[i].el.style.transform = "translate3d(" + off.toFixed(1) + "px,-50%,0)";
      }
      /* hero photo eases as you walk away */
      if (heroShot) {
        var hp = clamp(p * 6, 0, 1);
        heroShot.style.transform = "translate3d(" + (hp * 60).toFixed(1) + "px,0,0) scale(1.05)";
      }
      /* the freight lane draws as its bay crosses the screen */
      if (laneFill && stopsEl) {
        var sr = stopsEl.getBoundingClientRect();
        var lp = clamp((window.innerWidth * 0.9 - sr.left) / (sr.width + window.innerWidth * 0.4), 0, 1);
        laneFill.style.width = (lp * 100).toFixed(1) + "%";
        for (var s2 = 0; s2 < stopEls.length; s2++) {
          stopEls[s2].classList.toggle("lit", lp >= (s2 + 0.6) / stopEls.length);
        }
      }
      /* photographs drift inside their crops */
      $$("[data-drift]").forEach(function (img) {
        var fr = img.getBoundingClientRect();
        var fp = clamp((window.innerWidth - fr.left) / (window.innerWidth + fr.width), 0, 1);
        img.style.transform = "translate3d(" + ((fp - 0.5) * 40).toFixed(1) + "px,0,0) scale(1.1)";
      });
    } else if (!horizontal() && laneFill) {
      laneFill.style.width = "100%";
      stopEls.forEach(function (s) { s.classList.add("lit"); });
    }

    requestAnimationFrame(frame);
  }

  if (reduce) {
    /* still page: ticker + lane lit */
    if (laneFill) laneFill.style.width = "100%";
    stopEls.forEach(function (s) { s.classList.add("lit"); });
    hud(0);
    setInterval(ticker, 1000);
  } else {
    requestAnimationFrame(frame);
  }

  /* ── relayout ─────────────────────────────────────────────── */
  var rt = null;
  function relayout() {
    clearTimeout(rt);
    rt = setTimeout(function () { emberSize(); layout(); }, 120);
  }
  window.addEventListener("resize", relayout);
  window.addEventListener("load", relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  layout(); emberSize();
})();
