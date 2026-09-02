/* ══════════════════════════════════════════════════════════════════
   THE PEOPLE OF FREEDOM FIRE — engine
   Night-and-ember sister of the founder page's engine: heat contours,
   poster words sliding against the scroll, velocity marquees, an ember
   cursor, magnetic controls, two-way reveals and counters. Native
   scrolling; prefers-reduced-motion collapses it all.
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

  /* ── entrance ─────────────────────────────────────────────── */
  function ready() { document.body.classList.add("ready"); }
  if (reduce) { ready(); }
  else if (document.readyState === "complete") { setTimeout(ready, 850); }
  else { window.addEventListener("load", function () { setTimeout(ready, 850); }); }

  /* ── heat contours behind every panel ─────────────────────── */
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
      var x = cx + Math.cos(th) * rr * 1.35, y = cy + Math.sin(th) * rr;
      d += (i ? " L " : "M ") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d + " Z";
  }
  function contourGroup(cx, cy, r, rings, rand, cls) {
    var g = '<g class="' + cls + '">';
    for (var k = 0; k < rings; k++) {
      var s = 1 - k * .17;
      g += '<path d="' + blobPath(cx + k * 6 * (rand() - .5) * 4,
                                  cy + k * 5 * (rand() - .5) * 4,
                                  r * s, rand) + '"/>';
    }
    return g + "</g>";
  }
  $$("#main .hero, #main .ch").forEach(function (sec, si) {
    var rand = rnd(211 + si * 149);
    var fx = document.createElement("div");
    fx.className = "topo"; fx.setAttribute("aria-hidden", "true");
    var anim = reduce ? ["", ""] : ["a", "b"];
    fx.innerHTML =
      '<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">' +
      contourGroup(180 + rand() * 160, 130 + rand() * 120, 150 + rand() * 70, 5, rand, anim[0]) +
      contourGroup(720 + rand() * 180, 400 + rand() * 140, 180 + rand() * 80, 6, rand,
                   anim[1] + (si % 3 === 1 ? " hot" : "")) +
      "</svg>";
    sec.insertBefore(fx, sec.firstChild);
  });

  /* ── one poster word per chapter ──────────────────────────── */
  var pws = [];
  $$("#main .ch[data-word]").forEach(function (sec) {
    var w = document.createElement("span");
    w.className = "pw"; w.textContent = sec.getAttribute("data-word");
    w.setAttribute("aria-hidden", "true");
    sec.insertBefore(w, sec.firstChild);
    pws.push({ el: w, sec: sec });
  });

  /* ── headlines assemble word by word ──────────────────────── */
  function split(el, step) {
    var nodes = Array.prototype.slice.call(el.childNodes), out = [];
    nodes.forEach(function (nd) {
      if (nd.nodeType === 3) {
        nd.textContent.split(/(\s+)/).forEach(function (tk) {
          if (!tk) return;
          if (/^\s+$/.test(tk)) { out.push(document.createTextNode(" ")); return; }
          var box = document.createElement("span"); box.className = "wa";
          var ink = document.createElement("i"); ink.textContent = tk;
          box.appendChild(ink); out.push(box);
        });
      } else { out.push(nd); }   /* keep .flame spans whole */
    });
    el.textContent = "";
    var wi = 0;
    out.forEach(function (nd) {
      el.appendChild(nd);
      if (nd.classList && (nd.classList.contains("wa") || nd.classList.contains("flame"))) {
        var tgt = nd.classList.contains("wa") ? nd.firstChild : nd;
        tgt.style.setProperty("--d", (wi * step) + "s"); wi++;
      }
    });
  }
  if (!reduce) {
    $$("#main .ch h2, .hero h1").forEach(function (el) { split(el, 0.055); });
  }

  /* ── stagger the grids ────────────────────────────────────── */
  function stagger(sel, child, step) {
    $$(sel).forEach(function (g) {
      $$(child, g).forEach(function (c, i) { c.style.setProperty("--d", (i * step) + "s"); });
    });
  }
  stagger(".team", ".person", 0.06);
  stagger(".cards", ".cardx", 0.08);
  stagger(".vals", ".val", 0.08);
  stagger(".stops", ".stop", 0.09);

  /* ── two-way reveals ──────────────────────────────────────── */
  var watched = $$(".rv, .plate, .team, .cards, .vals");
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle("in", en.isIntersecting); });
    }, { rootMargin: "-4% 0px -10% 0px", threshold: 0.06 });
    watched.forEach(function (e) { io.observe(e); });
  }
  var heroH = $("#heroH");
  if (heroH) {
    reduce ? heroH.classList.add("in")
           : setTimeout(function () { heroH.classList.add("in"); }, 1150);
  }

  /* ── counters in the stat bar ─────────────────────────────── */
  var counters = $$("[data-count]");
  function countUp(v) {
    var to = +v.getAttribute("data-count"), t0 = null, dur = 1200;
    if (reduce) { v.textContent = to; return; }
    (function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      v.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ("IntersectionObserver" in window && !reduce) {
    var ioc = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) countUp(en.target);
        else en.target.textContent = "0";
      });
    }, { threshold: 0.5 });
    counters.forEach(function (v) { v.textContent = "0"; ioc.observe(v); });
  }

  /* ── cursor ───────────────────────────────────────────────── */
  var cur = $("#cur"), curDot = $("#curDot"), curRing = $("#curRing");
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, curSeen = false;
  if (fine && !reduce && cur) {
    document.documentElement.classList.add("cur-on");
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY; curSeen = true;
      var hot = e.target.closest && e.target.closest("a,button,summary,[data-mag],.person,.cardx");
      cur.classList.toggle("big", !!hot);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cur.style.opacity = "1"; });
  }

  /* ── magnetic controls ────────────────────────────────────── */
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
        tx = (e.clientX - r.left - r.width / 2) * 0.32;
        ty = (e.clientY - r.top - r.height / 2) * 0.32;
        on = true; if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener("mouseleave", function () { tx = 0; ty = 0; on = false; });
    });
  }

  /* ── marquees ─────────────────────────────────────────────── */
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

  /* ── master loop ──────────────────────────────────────────── */
  var chapters = $$("#main .ch, #main .hero");
  var chrome = $("#chrome"), spine = $$(".spine a"), prog = $("#prog");
  var routeFill = $("#routeFill"), stopsEl = $("#stops"), stopEls = $$("#stops .stop");
  var lastY = -1, velY = 0;

  function frame() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var moved = y !== lastY;
    velY = lerp(velY, moved ? y - lastY : 0, 0.12);
    lastY = y;

    if (fine && !reduce && curSeen) {
      curDot.style.transform = "translate(" + mx + "px," + my + "px)";
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      curRing.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    }

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
      if (prog) {
        var mx2 = (document.documentElement.scrollHeight - window.innerHeight) || 1;
        prog.style.transform = "scaleX(" + clamp(y / mx2, 0, 1).toFixed(4) + ")";
      }

      /* poster words slide against the scroll */
      if (!reduce) {
        for (var pi = 0; pi < pws.length; pi++) {
          var ps = pws[pi].sec;
          var pp = (y + window.innerHeight - ps.offsetTop) /
                   (window.innerHeight + ps.offsetHeight);
          if (pp > -0.1 && pp < 1.1) {
            pws[pi].el.style.transform = "translate3d(" +
              ((pp - 0.5) * -window.innerWidth * 0.22).toFixed(1) + "px,-50%,0)" +
              " skewX(" + clamp(-velY * 0.08, -5, 5).toFixed(2) + "deg)";
          }
        }
        /* the freight route draws with the scroll, lighting each stop */
        if (routeFill && stopsEl) {
          var sr = stopsEl.getBoundingClientRect();
          var rpp = clamp((window.innerHeight * 0.88 - sr.top) /
                          (sr.height + window.innerHeight * 0.3), 0, 1);
          routeFill.style.width = (rpp * 100).toFixed(1) + "%";
          for (var si2 = 0; si2 < stopEls.length; si2++) {
            stopEls[si2].classList.toggle("lit", rpp >= (si2 + 0.6) / stopEls.length);
          }
        }

        /* photographs drift inside their crops */
        $$("[data-drift]").forEach(function (img) {
          var fr = img.getBoundingClientRect();
          var fp = clamp((window.innerHeight - fr.top) / (window.innerHeight + fr.height), 0, 1);
          img.style.transform = "translate3d(0," + ((fp - 0.5) * 44).toFixed(1) + "px,0) scale(1.08)";
        });
      }

      /* spine */
      var cur2 = null;
      chapters.forEach(function (s) {
        var top = s.offsetTop, bot = top + s.offsetHeight;
        if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur2 = s.id;
      });
      spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });
    }
    requestAnimationFrame(frame);
  }

  if (reduce) {
    function still() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (chrome) chrome.classList.toggle("stuck", y > 40);
      var cur2 = null;
      chapters.forEach(function (s) {
        var top = s.offsetTop, bot = top + s.offsetHeight;
        if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur2 = s.id;
      });
      spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });
    }
    window.addEventListener("scroll", still, { passive: true });
    still();
  } else {
    requestAnimationFrame(frame);
  }

  window.addEventListener("load", measureMarquees);
  window.addEventListener("resize", measureMarquees);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureMarquees);
  measureMarquees();

  /* ══ INTERACTIVE LAYER ═══════════════════════════════════ */

  /* ── ember canvas: they rise, and they get out of your way ── */
  var efx = $("#emberfx"), ectx = null, EP = [], eBurst = 0;
  var eW = 0, eH = 0, emx = -1e4, emy = -1e4;
  function emberSize() {
    if (!efx) return;
    var hero = efx.parentElement;
    eW = efx.width = hero.clientWidth;
    eH = efx.height = hero.clientHeight;
  }
  if (efx && !reduce && efx.getContext) {
    ectx = efx.getContext("2d");
    efx.classList.add("on");
    emberSize();
    window.addEventListener("resize", emberSize);
    for (var ei = 0; ei < 110; ei++) {
      EP.push({ x: Math.random() * 2000, y: Math.random() * 1200,
                vx: 0, vy: -(0.25 + Math.random() * 0.6),
                r: 0.8 + Math.random() * 1.7, ph: Math.random() * 6.28,
                hot: Math.random() < 0.5 });
    }
    efx.parentElement.addEventListener("mousemove", function (e) {
      var r = efx.getBoundingClientRect();
      emx = e.clientX - r.left; emy = e.clientY - r.top;
    }, { passive: true });
    efx.parentElement.addEventListener("mouseleave", function () {
      emx = -1e4; emy = -1e4;
    });
  }
  function embers(ts) {
    if (!ectx || !eW) return;
    ectx.clearRect(0, 0, eW, eH);
    for (var i = 0; i < EP.length; i++) {
      var p = EP[i];
      p.ph += 0.012;
      p.x += p.vx + Math.sin(p.ph + i) * 0.22;
      p.y += p.vy - eBurst * (0.5 + Math.random());
      p.vx *= 0.94;
      var dx = p.x - emx, dy = p.y - emy, dd = dx * dx + dy * dy;
      if (dd < 14400) {                 /* 120px — the cursor stirs them */
        var d = Math.sqrt(dd) || 1, f = (120 - d) / 120 * 1.6;
        p.vx += (dx / d) * f; p.vy -= f * 0.12;
      }
      p.vy = Math.min(-0.2, p.vy + 0.006);
      if (p.y < -8 || p.x < -8 || p.x > eW + 8) {
        p.x = Math.random() * eW; p.y = eH + 6;
        p.vy = -(0.25 + Math.random() * 0.6); p.vx = 0;
      }
      var tw = 0.55 + 0.45 * Math.sin(ts / 300 + p.ph * 5);
      ectx.beginPath();
      ectx.arc(p.x % (eW + 16), p.y, p.r, 0, 6.283);
      ectx.fillStyle = p.hot
        ? "rgba(255,75,43," + (0.5 * tw).toFixed(2) + ")"
        : "rgba(196,0,0," + (0.42 * tw).toFixed(2) + ")";
      ectx.fill();
    }
    eBurst *= 0.9;
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
        var secs = ((performance.now() - t0) / 1000).toFixed(1);
        say("Drill complete in " + secs + "s. Muscle memory matters.");
        drillLock = false;
      }, 2550);
    });
  }

  /* ── the Tuesday scrub ────────────────────────────────────── */
  var scene = $("#tuesday"), phrases = $$("#phs .ph");
  var sceneTop = 0, sceneRange = 1;
  function measureScene() {
    if (!scene) return;
    var r = scene.getBoundingClientRect();
    sceneTop = r.top + (window.pageYOffset || document.documentElement.scrollTop);
    sceneRange = Math.max(1, scene.offsetHeight - window.innerHeight);
  }
  function runScene(y) {
    if (!scene || reduce || window.innerWidth <= 820) return;
    var p = clamp((y - sceneTop) / sceneRange, 0, 1);
    var idx = Math.min(phrases.length - 1, Math.floor(p * phrases.length));
    phrases.forEach(function (ph, i) { ph.classList.toggle("on", i === idx); });
  }
  window.addEventListener("resize", measureScene);
  window.addEventListener("load", measureScene);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureScene);
  measureScene();

  /* ── know your fire ───────────────────────────────────────── */
  var FIRE = {
    a: "Class A — wood, paper, textiles. Water, foam, powder or wet chemical will do it.",
    b: "Class B — petrol, paint, solvents. Foam, CO₂ or powder. Never water.",
    c: "Class C — flammable gases. Dry powder only, once the supply is isolated.",
    e: "Live electrical — CO₂ or dry powder. Water and foam conduct.",
    f: "Class F — cooking oils and fats. Wet chemical, purpose-built for the job."
  };
  var fnote = $("#fnote");
  var fcs = $$(".fc"), exts = $$(".ext");
  function pickFire(cls) {
    fcs.forEach(function (b) {
      var on = b.getAttribute("data-cls") === cls;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
    });
    exts.forEach(function (x) {
      var ok = (" " + x.getAttribute("data-ok") + " ").indexOf(" " + cls + " ") >= 0;
      x.classList.toggle("hit", ok);
      x.classList.toggle("miss", !ok);
    });
    if (fnote) fnote.textContent = FIRE[cls] || "";
  }
  fcs.forEach(function (b) {
    b.addEventListener("click", function () { pickFire(b.getAttribute("data-cls")); });
  });
  if (fcs.length) pickFire("a");

  /* ── 3D tilt on every card ────────────────────────────────── */
  if (fine && !reduce) {
    $$(".cardx, .person, .stop, .val").forEach(function (el) {
      el.addEventListener("mouseenter", function () { el.classList.add("tilting"); });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "translateY(-4px) rotateX(" + (-py * 4).toFixed(2) +
          "deg) rotateY(" + (px * 4).toFixed(2) + "deg)";
      });
      el.addEventListener("mouseleave", function () {
        el.classList.remove("tilting");
        el.style.transform = "";
      });
    });

    /* cursor spotlight over the dark panels */
    $$("#main .ch.deep, #main .ch.join, #main .hero").forEach(function (sec) {
      var sp = document.createElement("div");
      sp.className = "spot"; sp.setAttribute("aria-hidden", "true");
      sec.appendChild(sp);
      sec.addEventListener("mousemove", function (e) {
        var r = sec.getBoundingClientRect();
        sp.style.setProperty("--sx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        sp.style.setProperty("--sy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      }, { passive: true });
    });
  }

  /* ── protecting-since ticker ──────────────────────────────── */
  var tD = $("#tD"), tH = $("#tH"), tM = $("#tM"), tS = $("#tS");
  var EPOCH = new Date(2021, 7, 27).getTime();   /* 27 August 2021 */
  var lastSec = -1;
  function pad(x) { return x < 10 ? "0" + x : "" + x; }
  function ticker() {
    var s = Math.floor((Date.now() - EPOCH) / 1000);
    if (s === lastSec || !tD) return;
    lastSec = s;
    tD.textContent = Math.floor(s / 86400);
    tH.textContent = pad(Math.floor(s / 3600) % 24);
    tM.textContent = pad(Math.floor(s / 60) % 60);
    tS.textContent = pad(s % 60);
  }
  ticker();

  /* ── the interactive frame loop ───────────────────────────── */
  if (!reduce) {
    (function iloop(ts) {
      embers(ts || 0);
      runScene(window.pageYOffset || document.documentElement.scrollTop);
      ticker();
      requestAnimationFrame(iloop);
    })(0);
  } else {
    setInterval(ticker, 1000);
  }

  /* ── menu sheet ───────────────────────────────────────────── */
  var burger = $("#burger"), sheet = $("#sheet");
  function sheetOn(o) {
    sheet.classList.toggle("on", o);
    burger.setAttribute("aria-expanded", o);
    document.documentElement.style.overflow = o ? "hidden" : "";
  }
  if (burger && sheet) {
    burger.addEventListener("click", function () { sheetOn(!sheet.classList.contains("on")); });
    $("#sheetClose").addEventListener("click", function () { sheetOn(false); });
    sheet.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target === sheet) sheetOn(false);
    });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") sheetOn(false); });
  }
})();
