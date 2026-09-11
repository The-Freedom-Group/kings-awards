/* ══════════════════════════════════════════════════════════════════
   THE FREEDOM LINE — engine
   One rAF loop drives everything: the thread drawn through every
   chapter, the pinned 2021 scene, the hero choreography, the cursor,
   the magnetic elements and the velocity marquees. Native scrolling
   throughout; prefers-reduced-motion collapses it all to a still,
   fully readable page.
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
  function ready() {
    document.body.classList.add("ready");
    if (reduce) { heroIn = 1; return; }
    var t0 = null;
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1500);
      heroIn = 1 - Math.pow(1 - k, 3);
      if (k < 1) requestAnimationFrame(step);
    });
  }
  /* the entrance waits for load, but never for long: a slow font server
     must not hold the page behind a monogram. Whichever comes first wins. */
  var readied = false;
  function readyOnce() { if (!readied) { readied = true; ready(); } }
  if (reduce) { readyOnce(); }
  else {
    if (document.readyState === "complete") { setTimeout(readyOnce, 700); }
    else { window.addEventListener("load", function () { setTimeout(readyOnce, 700); }); }
    /* failsafe: nobody waits behind the monogram for more than two seconds */
    setTimeout(readyOnce, 2000);
  }

  /* ── portrait load ────────────────────────────────────────── */
  var shot = $("#shot"), shotWrap = $("#shotWrap");
  function lit() { if (shot) shot.classList.add("on"); }
  if (shot) {
    shot.complete ? lit()
      : (shot.addEventListener("load", lit), shot.addEventListener("error", lit));
  }

  /* ── split headlines: words for h2, letters for the name ──── */
  function split(el, mode, step) {
    if (mode === "letters") {
      var chars = el.textContent.split("");
      el.textContent = "";
      chars.forEach(function (t, i) {
        if (t === " ") { el.appendChild(document.createTextNode(" ")); return; }
        var box = document.createElement("span"); box.className = "wa";
        var ink = document.createElement("i"); ink.textContent = t;
        ink.style.setProperty("--d", (i * step) + "s");
        box.appendChild(ink); el.appendChild(box);
      });
      return;
    }
    /* words: walk the child nodes so <br> and inline elements survive */
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
      } else { out.push(nd); }
    });
    el.textContent = "";
    var wi = 0;
    out.forEach(function (nd) {
      el.appendChild(nd);
      if (nd.classList && nd.classList.contains("wa")) {
        nd.firstChild.style.setProperty("--d", (wi * step) + "s"); wi++;
      }
    });
  }
  if (!reduce) {
    $$(".ch h2, .slab h2").forEach(function (el) { split(el, "words", 0.055); });
  }

  /* ── the moving background: a drifting grid and travelling dots ── */
  function rnd(seed) {           /* deterministic, so layouts are stable */
    return function () {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  }
  $$("#explore .hero, #explore .ch, #explore .scene, #explore .slab, #explore .mq, footer").forEach(function (sec, si) {
    var rand = rnd(97 + si * 131);


    /* a drifting dot grid, and two faint orbits with dots travelling them */
    var dr = document.createElement("div");
    dr.className = "drift"; dr.setAttribute("aria-hidden", "true");
    sec.insertBefore(dr, sec.firstChild);
    if (!reduce) {
      var ob = document.createElement("div");
      ob.className = "orbits"; ob.setAttribute("aria-hidden", "true");
      var o = "";
      for (var oi = 0; oi < 2; oi++) {
        var cx = 150 + rand() * 700, cy = 100 + rand() * 400, rx = 160 + rand() * 260, ry = rx * (.32 + rand() * .2);
        var tilt = -30 + rand() * 40, pid = "orb" + si + oi;
        var d = "M " + (cx - rx).toFixed(1) + " " + cy.toFixed(1) +
                " A " + rx.toFixed(1) + " " + ry.toFixed(1) + " 0 1 0 " + (cx + rx).toFixed(1) + " " + cy.toFixed(1) +
                " A " + rx.toFixed(1) + " " + ry.toFixed(1) + " 0 1 0 " + (cx - rx).toFixed(1) + " " + cy.toFixed(1);
        var dur = (26 + rand() * 30).toFixed(1), dur2 = (34 + rand() * 30).toFixed(1);
        o += '<g transform="rotate(' + tilt.toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')">' +
             '<path id="' + pid + '" class="' + (oi ? "pk" : "") + '" d="' + d + '"/>' +
             '<circle r="3.2"><animateMotion dur="' + dur + 's" repeatCount="indefinite"><mpath href="#' + pid + '"/></animateMotion></circle>' +
             '<circle r="2" class="dim"><animateMotion dur="' + dur2 + 's" begin="-' + (dur2 / 2).toFixed(1) + 's" repeatCount="indefinite"><mpath href="#' + pid + '"/></animateMotion></circle>' +
             '</g>';
      }
      ob.innerHTML = '<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">' + o + "</svg>";
      sec.insertBefore(ob, sec.firstChild);
    }
  });

  /* ── poster words, one per chapter ────────────────────────── */
  var PW = { c01: "SPARK", c02: "PROOF", c03: "METHOD", c04: "PEOPLE",
             c05: "FUTURE", c06: "RECORD", c07: "NEXT" };
  var pws = [];
  Object.keys(PW).forEach(function (id) {
    var sec = document.getElementById(id);
    if (!sec) return;
    var w = document.createElement("span");
    w.className = "pw"; w.textContent = PW[id]; w.setAttribute("aria-hidden", "true");
    sec.insertBefore(w, sec.firstChild);
    pws.push({ el: w, sec: sec });
  });

  /* ── stagger groups ───────────────────────────────────────── */
  function stagger(sel, child, step) {
    $$(sel).forEach(function (g) {
      $$(child, g).forEach(function (c, i) { c.style.setProperty("--d", (i * step) + "s"); });
    });
  }
  stagger(".metrics", ".metric", 0.09);
  stagger(".grp-list", "li", 0.05);
  stagger(".map", ".node", 0.07);

  /* planets sit ON the drawn rings: same ellipses, same rotation */
  var RINGS = { A: [33, 13], B: [43, 20.5], C: [51, 28] }, PHI = -16 * Math.PI / 180, MCX = 50, MCY = 38;
  var mapEl = $("#map"), rocket = $("#rocket");
  function ringXY(ring, deg) {
    var th = deg * Math.PI / 180;
    var ex = RINGS[ring][0] * Math.cos(th), ey = RINGS[ring][1] * Math.sin(th);
    return { x: MCX + ex * Math.cos(PHI) - ey * Math.sin(PHI), y: MCY + ex * Math.sin(PHI) + ey * Math.cos(PHI) };
  }
  /* planets and the rocket are placed with a translate, in pixels, so they move on the compositor
     with sub-pixel precision; left/top stay at zero. The ring labels keep percentages: they never move. */
  function mapPx(p) {
    var W0 = mapEl ? mapEl.offsetWidth : 0, H0 = mapEl ? mapEl.offsetHeight : 0;
    return { x: p.x / 100 * W0, y: p.y / 76 * H0 };
  }
  function putNode(nd, p) {
    var q = mapPx(p);
    nd.style.setProperty("--ox", q.x.toFixed(2) + "px");
    nd.style.setProperty("--oy", q.y.toFixed(2) + "px");
  }
  var rocketA = 300;
  function placeOrbits() {
    $$(".map .node, .map .yrlbl").forEach(function (nd) {
      var ring = nd.getAttribute("data-ring");
      if (nd.classList.contains("yrlbl")) {
        var lp = ringXY(ring, +nd.getAttribute("data-ang") || 0);
        nd.style.left = lp.x + "%"; nd.style.top = (lp.y / 76 * 100) + "%";
        return;
      }
      nd.style.left = "0"; nd.style.top = "0";
      if (ring === "0" || !RINGS[ring]) { putNode(nd, { x: MCX, y: MCY }); return; }
      if (nd.dataset.a === undefined) nd.dataset.a = nd.getAttribute("data-ang") || "0";
      putNode(nd, ringXY(ring, +nd.dataset.a));
    });
    if (rocket) placeRocket();
  }
  function placeRocket() {
    var r0 = ringXY("B", rocketA), r1 = ringXY("B", rocketA + 1.5);
    var q0 = mapPx(r0), q1 = mapPx(r1);
    var ang = Math.atan2(q1.y - q0.y, q1.x - q0.x) * 180 / Math.PI;
    rocket.style.left = "0"; rocket.style.top = "0";
    rocket.style.setProperty("--ox", q0.x.toFixed(2) + "px");
    rocket.style.setProperty("--oy", q0.y.toFixed(2) + "px");
    rocket.style.setProperty("--r", ang.toFixed(2) + "deg");
  }
  placeOrbits();
  /* the planets drift round their rings, slowly enough to read; the rocket laps the middle ring.
     Speeds are in degrees per second, so the motion is the same at any frame rate. The entrance
     animation keeps its transform transition; once it has played, the "go" class removes the
     transition so each frame's position applies instantly and the motion is continuous. */
  var SPEED = { A: 1.0, B: 1.0, C: 1.0 }, ROCKET_SPEED = 12, lastT = 0, wasIn = false, goTimer = null;
  var orbitBoost = 0, orbitBoostTarget = 0, orbitNodes = null;
  function orbitStep(ts) {
    if (!mapEl) return;
    var inView = mapEl.classList.contains("in") && document.body.dataset.grp !== "list";
    if (inView !== wasIn) {
      wasIn = inView; clearTimeout(goTimer);
      if (inView) goTimer = setTimeout(function () { mapEl.classList.add("go"); lastT = 0; }, 1500);
      else mapEl.classList.remove("go");
    }
    if (!inView || !mapEl.classList.contains("go")) { lastT = ts; return; }
    var dt = lastT ? Math.min(0.05, (ts - lastT) / 1000) : 0; lastT = ts;
    if (!dt) return;
    /* while the line is lapping the inner ring the whole system turns faster, easing in and out */
    orbitBoost += (orbitBoostTarget - orbitBoost) * Math.min(1, dt * 3);
    dt *= 1 + 3.2 * orbitBoost;
    if (!orbitNodes) orbitNodes = $$(".map .node[data-ring]", mapEl);
    orbitNodes.forEach(function (nd) {
      var ring = nd.getAttribute("data-ring");
      if (ring === "0" || !RINGS[ring]) return;
      var a = (+nd.dataset.a || 0) + SPEED[ring] * dt; if (a > 360) a -= 360;
      nd.dataset.a = a;
      putNode(nd, ringXY(ring, a));
    });
    if (rocket) { rocketA += ROCKET_SPEED * dt; if (rocketA > 360) rocketA -= 360; placeRocket(); }
  }

  /* ── hero branch lines ────────────────────────────────────── */
  $$(".draw").forEach(function (p) {
    var L = 2000; try { L = p.getTotalLength(); } catch (e) {}
    p.style.setProperty("--len", L);
  });

  /* ── construct on entry, deconstruct on exit ──────────────── */
  var watched = $$(".rv, .draw, .map, .plate"), io = null;
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle("in", en.isIntersecting); });
    }, { rootMargin: "-4% 0px -10% 0px", threshold: 0.06 });
    watched.forEach(function (e) { io.observe(e); });
  }

  var heroType = $(".hero-type");
  if (heroType) {
    reduce ? heroType.classList.add("in")
           : setTimeout(function () { heroType.classList.add("in"); }, 1250);
  }

  /* ── metric counters ──────────────────────────────────────── */
  /* every number counts up on arrival: the largest numeric token in each is animated, the rest of the text stays */
  var counters = $$(".metric .v").map(function (v) {
    var html = v.innerHTML, text = v.textContent, m = text.match(/\d[\d,]*(?:\.\d+)?/g);
    if (!m) return null;
    var tok = m.reduce(function (a, b) { return parseFloat(b.replace(/,/g, "")) > parseFloat(a.replace(/,/g, "")) ? b : a; });
    var val = parseFloat(tok.replace(/,/g, "")), dec = (tok.split(".")[1] || "").length;
    return { el: v, html: html, tok: tok, val: val, dec: dec };
  }).filter(Boolean);
  function fmtNum(n, dec) { var f = n.toFixed(dec), parts = f.split("."); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return parts.join("."); }
  function setCount(c, n) { c.el.innerHTML = c.html.replace(c.tok, fmtNum(n, c.dec)); }
  function countUp(c) {
    var t0 = null, dur = 1200;
    if (reduce) { setCount(c, c.val); return; }
    (function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      setCount(c, c.val * e);
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ("IntersectionObserver" in window && !reduce) {
    var ioc = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var c = counters.filter(function (x) { return x.el === en.target; })[0]; if (!c) return;
        if (en.isIntersecting) countUp(c); else setCount(c, 0);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { setCount(c, 0); ioc.observe(c.el); });
  }

  /* ══ THE THREAD ═══════════════════════════════════════════ */
  var explore = $("#explore"),
      thread  = $("#thread"),
      svg     = $("#threadSvg"),
      track   = $("#tTrack"),
      live    = $("#tLive"),
      track2  = $("#tTrack2"),
      live2   = $("#tLive2"),
      head    = $("#tHead");
  var ringA = 0, ringB = 0, ringLen = 0, loopA = 0, loopB = 0, loopMarks = null, hasHold = false;
  var rideMeta = null, rideA = 0, rideB = 0, chartsEl = $("#charts"), lineClipRect = $("#lineClipRect"), chartParts = null, tlRows = [];
  var rideThread = $("#rideThread"), rideSvg = $("#rideSvg"), rTrack = $("#rTrack"), rLive = $("#rLive"), rHead = $("#rHead"), rideBox = null;
  /* the lap: the page holds still at holdLock while the wheel, a finger or the keys move the line round
     the ring; HOLD_PX is how much wheel travel one lap takes */
  var builtH = 0, holdLock = 0, holds = [], holdActive = null, hold = { active: false };
  function lockScrollTo(yy) { try { window.scrollTo({ top: yy, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, yy); } }
  /* a hold takes the page where the crossing notch left it, so nothing snaps; only a long overshoot eases back */
  function settle(h, y, dy) {
    h.settleAt = performance.now() + 350;
    lockScrollTo(h.lock);
  }
  /* within reach of a lock the wheel is taken over and the page decelerates onto the lock: an ease-out over
     roughly a third of a second, scaled to the distance, so the stop is a glide rather than a snap */
  var REACH = 150;
  function approach(h, y, dir) {
    h.phase = "approach"; h.dir = dir; h.from = y; h.t0 = performance.now();
    h.dur = clamp(Math.abs(h.lock - y) * 3.4, 280, 560);
    h.prog = h.shown = dir ? 1 : 0;
    lockScrollTo(y);                       /* cancels the notch's own animation where we stand */
  }
  /* virtual scrolling on desktop: the wheel moves a target and the page eases to it every frame. The browser
     never animates a wheel notch itself, so a lock can cap the target and the page glides onto it and stays. */
  var vs = { on: false, cur: 0, tgt: 0, last: -9, extAt: 0 };
  if (fine && !reduce) { vs.on = true; vs.cur = vs.tgt = window.pageYOffset || document.documentElement.scrollTop; }
  function maxScroll() { return Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight); }
  window.addEventListener("wheel", function (e) {
    if (document.body.classList.contains("bio-open")) return;           /* the reader and the lightbox scroll themselves */
    if (e.ctrlKey) return;                                                /* pinch zoom */
    var d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
    if (holdActive) {
      e.preventDefault();
      if (holdActive.phase === "hold") holdActive.prog = clamp(holdActive.prog + d / holdActive.px, -0.02, 1.02);
      return;
    }
    if (!vs.on) return;
    e.preventDefault();
    vs.tgt = clamp(vs.tgt + d, 0, maxScroll());
  }, { passive: false });
  /* a scroll we did not make (the scrollbar, a key, an anchor) becomes the new position and target */
  window.addEventListener("scroll", function () {
    if (!vs.on) return;
    var sy = window.pageYOffset || document.documentElement.scrollTop;
    if (Math.abs(sy - vs.last) > 1.5) { vs.cur = vs.tgt = sy; vs.extAt = performance.now(); }
  }, { passive: true });
  var vsT = 0;
  function vsStep(now) {
    if (!vs.on) return;
    var dt = vsT ? Math.min(0.05, (now - vsT) / 1000) : 0.016; vsT = now;
    var diff = vs.tgt - vs.cur;
    if (Math.abs(diff) < 0.2) { if (diff) vs.cur = vs.tgt; else return; }
    else vs.cur += diff * (1 - Math.exp(-dt * 10));
    var next = Math.round(vs.cur * 2) / 2;
    if (next !== vs.last) { vs.last = next; try { window.scrollTo({ top: next, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, next); } }
  }
  var touchY = null;
  window.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (!holdActive || touchY === null) return;
    e.preventDefault();
    var ty = e.touches[0].clientY;
    if (holdActive.phase === "hold") holdActive.prog = clamp(holdActive.prog + (touchY - ty) / (holdActive.px * 0.5), -0.02, 1.02);
    touchY = ty;
  }, { passive: false });
  window.addEventListener("keydown", function (e) {
    if (!holdActive) return;
    var k = e.key, d = 0;
    if (k === "ArrowDown" || k === "PageDown" || k === " ") d = 0.12; else if (k === "ArrowUp" || k === "PageUp") d = -0.12; else return;
    e.preventDefault();
    if (holdActive.phase === "hold") holdActive.prog = clamp(holdActive.prog + d, -0.02, 1.02);
  });

  /* L and R ride the empty margin outside the text column, so the
     line never crosses a word. C is the centre. */
  var PLAN = [
    { id: "ones", side: "C", y: 0.50, noKnot: true },
    { id: "c01",  side: "L", y: 0.16, rail: true },
    { id: "c02",  side: "R", y: 0.42 },
    { id: "c03",  side: "L", y: 0.42 },
    { id: "c04",  side: "R", y: 0.42 },
    { id: "c05",  side: "C", y: 0.40, core: true },
    { id: "charts", ride: true },
    { id: "c06",  side: "R", y: 0.42 },
    { id: "c07",  side: "C", y: 0.5, ring: true }
  ];

  var pts = [], knots = [], totalLen = 0, knotAt = [], heroFrac = 0, heroIn = 0, pScale = 1, ySamples = [];
  var endPt = null, endFrac = 1, endNote = null;

  function buildPath() {
    if (!explore || !thread || !svg) return false;
    if (window.innerWidth <= 820) { thread.style.display = "none"; return false; }
    thread.style.display = "";

    var W = explore.offsetWidth, H = explore.offsetHeight;
    if (!W || !H) return false;
    builtH = H;

    /* find the text column so the line can run outside it */
    var col = explore.querySelector(".ch .wrap") || explore.querySelector(".wrap");
    var cr = col ? col.getBoundingClientRect() : { left: 0, right: W };
    var LX = Math.max(18, cr.left - 34);
    var RX = Math.min(W - 18, cr.right + 34);
    var CX = W * 0.5;
    var SIDE = { L: LX, R: RX, C: CX };

    pts = [];

    /* ── the hero bend, to the reference proportions ──────────
       Runs in from the left, lifts over the portrait, turns down the
       right and continues as the page thread. Four spurs peel off the
       descending trunk. One stroke; the spurs hang from it. */
    var heroEl = document.getElementById("top");
    var heroPrefix = "", heroExit = null;
    if (heroEl) {
      var hT = heroEl.offsetTop, hH = heroEl.offsetHeight;
      var yMain  = hT + hH * 0.81;           // the long horizontal
      var yTop   = hT + hH * 0.545;          // the lifted horizontal
      var xLift  = W * 0.665;                // where it starts to rise
      var xTrunk = W * 0.822;                // the descending trunk
      var xTerm  = W * 0.886;                // spur terminals
      var yExit  = hT + hH * 0.985;          // where it leaves the hero
      var r = Math.min(34, W * 0.022);
      var bys = [0.748, 0.803, 0.858, 0.913].map(function (f) { return hT + hH * f; });

      heroPrefix =
        "M " + LX.toFixed(1) + " " + yMain.toFixed(1) +
        " H " + (xLift - r).toFixed(1) +
        " Q " + xLift.toFixed(1) + " " + yMain.toFixed(1) +
        " "   + xLift.toFixed(1) + " " + (yMain - r).toFixed(1) +
        " V " + (yTop + r).toFixed(1) +
        " Q " + xLift.toFixed(1) + " " + yTop.toFixed(1) +
        " "   + (xLift + r).toFixed(1) + " " + yTop.toFixed(1) +
        " H " + (xTrunk - r).toFixed(1) +
        " Q " + xTrunk.toFixed(1) + " " + yTop.toFixed(1) +
        " "   + xTrunk.toFixed(1) + " " + (yTop + r).toFixed(1) +
        " V " + yExit.toFixed(1);

      heroExit = { x: xTrunk, y: yExit, id: "top", el: heroEl, noKnot: true };

      /* spurs + their terminals */
      for (var bi = 0; bi < 4; bi++) {
        var by = bys[bi], sp = document.getElementById("sp" + bi);
        if (sp) {
          var d2 = "M " + xTrunk.toFixed(1) + " " + (by - 30).toFixed(1) +
                   " C " + xTrunk.toFixed(1) + " " + (by - 6).toFixed(1) +
                   ", "  + (xTrunk + 14).toFixed(1) + " " + by.toFixed(1) +
                   ", "  + (xTrunk + 42).toFixed(1) + " " + by.toFixed(1) +
                   " H " + xTerm.toFixed(1);
          sp.setAttribute("d", d2);
          var L2 = 300; try { L2 = sp.getTotalLength(); } catch (e) {}
          sp.style.setProperty("--l", L2);
        }
        var nd = document.getElementById("hn" + bi);
        if (nd) {
          nd.style.left = (xTerm - 6.5) + "px";
          nd.style.top  = (by - hT) + "px";
        }
      }

      var lbl = document.getElementById("hlStart");
      if (lbl) {
        lbl.style.left = LX + "px";
        lbl.style.top = (yMain - hT) + "px";
      }
      pts.push(heroExit);
    }

    var er0 = explore.getBoundingClientRect();
    /* an element's place on the page from layout alone: the reveal transforms never touch offsets */
    var pageXY = function (el) {
      var x = 0, y = 0;
      while (el && el !== explore) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
      return { x: x, y: y };
    };
    PLAN.forEach(function (p) {
      var el = document.getElementById(p.id);
      if (!el) return;
      if (p.core) {
        /* the line joins the inner orbit at its left-hand point, laps it once, carries on round to the
           bottom and leaves from there; the whole ring is traced in the map's own geometry */
        var mp = el.querySelector(".map"), mr = mp && mp.offsetWidth ? { w: mp.offsetWidth, h: mp.offsetHeight } : null;
        if (mr && document.body.dataset.grp !== "list") {
          var mo = pageXY(mp), cx = mo.x, cy = mo.y, sx = mr.w / 100, sy = mr.h / 76;
          mr.height = mr.h;
          /* the page holds with the map centred on screen */
          holdLock = Math.max(0, cy + mr.h / 2 - window.innerHeight / 2);
          var ringPt = function (ring, deg) { var q = ringXY(ring, deg); return { x: cx + q.x * sx, y: cy + q.y * sy }; };
          var core = { x: cx + 50 * sx, y: cy + 38 * sy };
          /* the line arrives from the right, level with the planet, and stops on it while the rings light up */
          var eIn = ringPt("C", 0);
          pts.push({ x: core.x, y: core.y, id: p.id, el: el, noKnot: true, cpIn: { x: eIn.x + Math.min(160, mr.w * 0.12), y: core.y },
                     loop: { pts: [], end: { x: core.x, y: core.y }, yA: core.y, yB: core.y } });
          return;
        }
      }
      if (p.rail) {
        /* the timeline: the chapter's knot up by the heading, then straight down the rail through every
           entry's knot; each row lights as the line reaches it */
        pts.push({ x: SIDE[p.side], y: el.offsetTop + el.offsetHeight * p.y, id: p.id, el: el, noKnot: false });
        var tlEl = document.getElementById("timeline");
        tlRows = [];
        if (tlEl) {
          tlEl.classList.add("rail");
          $$(".tl-list li", tlEl).forEach(function (li) {
            var kn = li.querySelector(".tl-knot"); if (!kn) return;
            var ko = pageXY(kn);
            var pt = { x: ko.x + kn.offsetWidth / 2, y: ko.y + kn.offsetHeight / 2, id: "tl", el: el, noKnot: true, row: li };
            pts.push(pt); tlRows.push(pt);
          });
        }
        return;
      }
      if (p.ride) {
        /* the charts: the line runs along the tops of the bars, then rides the line chart's own curve to the
           £100m point; both charts build as it passes. Geometry from layout, viewBox scaled to the figures. */
        var figB = $("#chBars"), figL = $("#chLine"), svgB = figB && figB.querySelector("svg"), svgL = figL && figL.querySelector("svg");
        if (!figB || !figL || !svgB || !svgL) return;
        var frame = function (fig, svg) {
          var rf = fig.getBoundingClientRect(), rs = svg.getBoundingClientRect(), sc = rf.width && fig.offsetWidth ? rf.width / fig.offsetWidth : 1;
          var fo = pageXY(fig), vb = svg.viewBox.baseVal, w = rs.width / sc, h = rs.height / sc;
          return { ox: fo.x + (rs.left - rf.left) / sc, oy: fo.y + (rs.top - rf.top) / sc, sx: w / vb.width, sy: h / vb.height };
        };
        var FB = frame(figB, svgB), FL = frame(figL, svgL), years = {};
        $$("g.seg-g", svgB).forEach(function (g) {
          var yr = (g.getAttribute("data-t") || "").split(" ")[0], r = g.querySelector("rect"); if (!yr || !r) return;
          var top = parseFloat(r.getAttribute("y")), cx = parseFloat(r.getAttribute("x")) + parseFloat(r.getAttribute("width")) / 2;
          if (!years[yr] || top < years[yr].top) years[yr] = { top: top, cx: cx };
        });
        var yrs = Object.keys(years).sort(), ridePts = [], marks = { years: [], yearNames: yrs, lineStart: 0, L: FL };
        /* the line comes in at the chart's origin and rises over the bar tops on one smooth curve */
        ridePts.push({ x: FB.ox + 58 * FB.sx, y: FB.oy + 252 * FB.sy, origin: true });
        yrs.forEach(function (yr) { ridePts.push({ x: FB.ox + years[yr].cx * FB.sx, y: FB.oy + (years[yr].top - 7) * FB.sy, top: true }); });

        /* the growth chart's own lines become smooth curves (Catmull-Rom made cubic), and the ride uses the
           same curve, so the two coincide exactly. The points are kept on the element for later rebuilds. */
        var chain = function (list, level) {
          for (var i2 = 1; i2 < list.length; i2++) {
            var p0 = list[Math.max(0, i2 - 2)], p1 = list[i2 - 1], p2 = list[i2], p3 = list[Math.min(list.length - 1, i2 + 1)];
            p2.c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
            p2.c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
          }
          if (list.length > 1) { var f0 = list[0], f1 = list[1], en = list[list.length - 1];
            f1.c1 = { x: f0.x + (f1.x - f0.x) * 0.35, y: f0.y };                      /* leaves the baseline level */
            en.c2 = { x: en.x - Math.abs(en.x - list[list.length - 2].x) * 0.35, y: en.y + level }; }  /* arrives level */
          return list;
        };
        var toD = function (list) {
          var out = "M " + list[0].x.toFixed(2) + " " + list[0].y.toFixed(2);
          for (var i3 = 1; i3 < list.length; i3++) { var q = list[i3]; out += " C " + q.c1.x.toFixed(2) + " " + q.c1.y.toFixed(2) + ", " + q.c2.x.toFixed(2) + " " + q.c2.y.toFixed(2) + ", " + q.x.toFixed(2) + " " + q.y.toFixed(2); }
          return out;
        };
        var readPts = function (sel) {
          var elx = svgL.querySelector(sel); if (!elx) return { el: null, pts: [] };
          var src = elx.getAttribute("data-points") || elx.getAttribute("points") || "";
          return { el: elx, pts: src.trim().split(/\s+/).map(function (t) { var q = t.split(","); return { x: parseFloat(q[0]), y: parseFloat(q[1]) }; }) };
        };
        var actV = readPts(".ln.act"), tgtV = readPts(".ln.tgt");
        [actV, tgtV].forEach(function (o, oi) {
          if (!o.el || o.pts.length < 2) return;
          var pathEl = o.el;
          if (pathEl.tagName.toLowerCase() === "polyline") {
            pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            Array.prototype.forEach.call(o.el.attributes, function (at) { if (at.name !== "points") pathEl.setAttribute(at.name, at.value); });
            pathEl.setAttribute("data-points", o.el.getAttribute("points"));
            o.el.parentNode.replaceChild(pathEl, o.el);
          }
          pathEl.setAttribute("d", toD(chain(o.pts.map(function (q) { return { x: q.x, y: q.y }; }), oi ? 2 : 0)));
        });
        var toDoc = function (q) { return { x: FL.ox + q.x * FL.sx, y: FL.oy + q.y * FL.sy }; };
        var act = chain(actV.pts.map(toDoc), 0), tgt = chain(tgtV.pts.map(toDoc), 2);
        var lineIdx = ridePts.length;
        /* the bars: the line hops from top to top like a rabbit, a clean arc each time */
        for (var hi = 1; hi < ridePts.length; hi++) {
          var a0 = ridePts[hi - 1], a1 = ridePts[hi], dxh = a1.x - a0.x, apex = Math.min(a0.y, a1.y) - Math.max(44, Math.min(120, Math.abs(dxh) * 0.55));
          a1.c1 = { x: a0.x + dxh * 0.22, y: apex }; a1.c2 = { x: a1.x - dxh * 0.22, y: apex };
        }
        /* the last hop carries it across into the growth chart and lands it on the baseline */
        if (act.length) {
          var lastTop = ridePts[ridePts.length - 1], land = act[0], dxl = land.x - lastTop.x;
          land.c1 = { x: lastTop.x + dxl * 0.25, y: Math.min(lastTop.y, land.y) - 150 }; land.c2 = { x: land.x - dxl * 0.18, y: land.y - 150 };
          ridePts.push(land);
          for (var ai = 1; ai < act.length; ai++) ridePts.push(act[ai]);
          if (tgt.length) { tgt[0].c1 = null; for (var ti = 1; ti < tgt.length; ti++) ridePts.push(tgt[ti]); }
        }
        if (ridePts.length < 3) return;
        /* fractions of the ride's length for each bar and for the start of the line chart */
        var cum = [0]; for (var ri = 1; ri < ridePts.length; ri++) cum.push(cum[ri - 1] + Math.hypot(ridePts[ri].x - ridePts[ri - 1].x, ridePts[ri].y - ridePts[ri - 1].y));
        var Lr = cum[cum.length - 1] || 1;
        marks.years = yrs.map(function (_, yi) { return cum[yi + 1] / Lr; }); marks.lineStart = cum[lineIdx] / Lr;
        var co0 = pageXY(el), fb0 = pageXY(figB);
        /* straight down out of the system from the planet, then down the margin to the left of the panel,
           then in through its side at the axis */
        /* it sweeps left above the panel, arrives vertical in the margin beside it, and runs down that margin */
        /* straight down out of the system to just below it, then one S across the gap into the margin beside the
           panel, arriving vertical, then down that margin */
        var mapEl2 = document.querySelector("#c05 .map");
        if (mapEl2) { var mo2 = pageXY(mapEl2), mb = mo2.y + mapEl2.offsetHeight; pts.push({ x: mo2.x + mapEl2.offsetWidth * 0.5, y: mb + 30, id: "mapOut", el: el, noKnot: true, cpIn: { x: mo2.x + mapEl2.offsetWidth * 0.5, y: mb - 120 } }); }
        pts.push({ x: fb0.x - 40, y: fb0.y + 30, id: "chartsIn", el: el, noKnot: true, cpIn: { x: fb0.x - 40, y: fb0.y - 110 } });
        pts.push({ x: ridePts[0].x, y: ridePts[0].y, id: "charts", el: el, noKnot: true, rideTo: ridePts.slice(1), marks: marks, cpIn: { x: ridePts[0].x - 110, y: ridePts[0].y },
                   yS: ridePts[0].y, yE: ridePts[0].y,
                   lock: Math.max(0, Math.max(co0.y + el.offsetHeight + 56 - window.innerHeight, Math.min(co0.y - 96, co0.y + el.offsetHeight / 2 - window.innerHeight / 2))) });
        return;
      }
      if (p.ring) {
        /* the end note: the line splits above the words, encircles them, and rejoins below */
        var quo = el.querySelector(".quo");
        if (quo) {
          var qo = pageXY(quo), qTop = qo.y - 14, qBot = qo.y + quo.offsetHeight + 14;
          var top0 = qTop - 70, bot0 = qBot + 64, half = quo.offsetWidth / 2 + 70;
          pts.push({ x: CX, y: top0, id: "ringTop", el: el, noKnot: true });
          pts.push({ x: CX, y: bot0, id: "ringBot", el: el, noKnot: true, arc: half, qTop: qTop, qBot: qBot });
          return;
        }
      }
      pts.push({ x: SIDE[p.side], y: el.offsetTop + el.offsetHeight * p.y,
                 id: p.id, el: el, noKnot: !!p.noKnot });
    });
    if (pts.length < 2) return false;
    /* the line's destination: the centre of the back-to-start button in the footer,
       measured in the story's own coordinates (the footer sits below the story) */
    var tt = document.querySelector("#totop .ring"), er = explore.getBoundingClientRect();
    if (tt) {
      var tr = tt.getBoundingClientRect();
      pts.push({ x: tr.left + tr.width / 2 - er.left, y: tr.top + tr.height / 2 - er.top, id: "beyond", el: null, noKnot: true });
    } else {
      pts.push({ x: CX, y: H + 40, id: "beyond", el: null, noKnot: true });
    }

    var d = heroPrefix || ("M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1));
    var dAtA = "", dAtB = "", d2 = "", dLoopIn = "", dLoopOut = "", loopMeta = null, dRideIn = "", dRideOut = "", holdDefs = [];
    rideMeta = null;
    var f1 = function (v) { return v.toFixed(1); };
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dy = (b.y - a.y) * 0.5, from = a;
      if (a.loop) {
        /* lap the inner ring, then leave from its bottom heading right, curving down to the next point */
        dLoopIn = d;
        a.loop.pts.forEach(function (q) { d += " L " + f1(q.x) + " " + f1(q.y); });
        dLoopOut = d; loopMeta = a.loop; loopMarks = a.loop.marks || null; from = a.loop.end;
        var dy2 = (b.y - from.y) * 0.5, cIn = b.cpIn || { x: b.x, y: b.y - dy2 };
        d += " C " + f1(from.x) + " " + f1(from.y + Math.max(200, dy2 * 1.2)) + ", " + f1(cIn.x) + " " + f1(cIn.y) + ", " + f1(b.x) + " " + f1(b.y);
        continue;
      }
      if (a.rideTo) {
        /* along the bar tops and up the line chart's curve, then on to the next point */
        dRideIn = d;
        a.rideTo.forEach(function (q) {
          d += q.c1 ? (" C " + f1(q.c1.x) + " " + f1(q.c1.y) + ", " + f1(q.c2.x) + " " + f1(q.c2.y) + ", " + f1(q.x) + " " + f1(q.y)) : (" L " + f1(q.x) + " " + f1(q.y));
        });
        dRideOut = d; rideMeta = a; from = a.rideTo[a.rideTo.length - 1];
        /* off the top of the growth chart heading right, then down the right-hand margin */
        var dy3 = Math.max(160, (b.y - from.y) * 0.5);
        d += " C " + f1(from.x + 170) + " " + f1(from.y) + ", " + f1(b.x) + " " + f1(b.y - dy3) + ", " + f1(b.x) + " " + f1(b.y);
        continue;
      }
      if (b.arc) {
        /* the end note: the line splits in two at the top, each half swings out round the words and they
           rejoin at the bottom; this stroke takes the left, the second stroke the right */
        var half = b.arc, qT = b.qTop, qB = b.qBot, kIn = Math.max(24, (qT - a.y) * 0.9), kOut = Math.max(24, (b.y - qB) * 0.9);
        var side = function (sgn) {
          var xs = a.x + sgn * half;
          return " C " + f1(a.x) + " " + f1(a.y + kIn) + ", " + f1(xs) + " " + f1(qT - kIn * 0.6) + ", " + f1(xs) + " " + f1(qT) +
                 " L " + f1(xs) + " " + f1(qB) +
                 " C " + f1(xs) + " " + f1(qB + kOut * 0.6) + ", " + f1(b.x) + " " + f1(b.y - kOut) + ", " + f1(b.x) + " " + f1(b.y);
        };
        dAtA = d; d += side(-1); dAtB = d;
        d2 = "M " + f1(a.x) + " " + f1(a.y) + side(1);
        continue;
      }
      var c2 = b.cpIn || { x: b.x, y: b.y - dy };
      d += " C " + f1(a.x) + " " + f1(a.y + dy) +
           ", " + f1(c2.x) + " " + f1(c2.y) +
           ", " + f1(b.x) + " " + f1(b.y);
    }

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    track.setAttribute("d", d);
    live.setAttribute("d", d);
    if (track2 && live2) {
      track2.setAttribute("d", d2); live2.setAttribute("d", d2);
      track2.style.display = live2.style.display = d2 ? "" : "none";
    }

    try { totalLen = live.getTotalLength(); } catch (e) { totalLen = 0; }
    if (!totalLen) return false;

    /* how much of the stroke is the hero bend? it should never be
       half-drawn while the reader is still looking at it */
    heroFrac = 0;
    if (heroPrefix) {
      var probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      probe.setAttribute("d", heroPrefix);
      svg.appendChild(probe);
      try { heroFrac = probe.getTotalLength() / totalLen; } catch (e) { heroFrac = 0; }
      svg.removeChild(probe);
    }
    live.style.strokeDasharray = totalLen;
    live.style.strokeDashoffset = totalLen;
    /* where the ring opens and closes, as fractions of the main stroke; the right half is drawn in step */
    ringA = ringB = ringLen = 0;
    if (dAtB && live2) {
      var pr2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svg.appendChild(pr2);
      try {
        pr2.setAttribute("d", dAtA); ringA = pr2.getTotalLength() / totalLen;
        pr2.setAttribute("d", dAtB); ringB = pr2.getTotalLength() / totalLen;
        ringLen = live2.getTotalLength();
      } catch (e) { ringA = ringB = ringLen = 0; }
      svg.removeChild(pr2);
      live2.style.strokeDasharray = ringLen; live2.style.strokeDashoffset = ringLen;
    }

    knots.forEach(function (k) { k.remove(); });
    knots = []; knotAt = [];
    var SAMPLES = 1200, samples = [];
    for (var s = 0; s <= SAMPLES; s++) {
      var pt = live.getPointAtLength(totalLen * s / SAMPLES);
      samples.push({ x: pt.x, y: pt.y, l: totalLen * s / SAMPLES });
    }
    pts.forEach(function (p) {
      if (p.noKnot || p.id === "beyond") return;
      var best = samples[0], bd = Infinity;
      samples.forEach(function (sp) {
        var dd = (sp.x - p.x) * (sp.x - p.x) + (sp.y - p.y) * (sp.y - p.y);
        if (dd < bd) { bd = dd; best = sp; }
      });
      var k = document.createElement("i");
      k.className = "knot" + (p.el && p.el.classList.contains("dark") ? " dk" : "");
      k.style.left = p.x + "px"; k.style.top = p.y + "px";
      thread.appendChild(k);
      knots.push(k); knotAt.push(best.l / totalLen);
    });

    /* the lap round the ring is not a descent, so for the scroll mapping its samples are given a
       virtual height: the approach, the lap and the exit are spread evenly over a window either side
       of the ring, and the samples just after the exit hold at the window's foot */
    loopA = loopB = 0; hasHold = false;
    if (loopMeta && dLoopOut) {
      var pr3 = document.createElementNS("http://www.w3.org/2000/svg", "path"), lIn = 0, lOut = 0;
      svg.appendChild(pr3);
      try { pr3.setAttribute("d", dLoopIn); lIn = pr3.getTotalLength(); pr3.setAttribute("d", dLoopOut); lOut = pr3.getTotalLength(); } catch (e) { lIn = lOut = 0; }
      svg.removeChild(pr3);
      if (lOut >= lIn) {
        hasHold = true;
        var lA = lIn;
        for (var si = 0; si < samples.length; si++) { if (samples[si].l <= lIn && samples[si].y >= loopMeta.yA) { lA = samples[si].l; break; } }
        for (var sj = 0; sj < samples.length; sj++) {
          var sm = samples[sj];
          if (sm.l >= lA && sm.l <= lOut) sm.y = loopMeta.yA + (loopMeta.yB - loopMeta.yA) * (sm.l - lA) / Math.max(1, lOut - lA);
          else if (sm.l > lOut && sm.y < loopMeta.yB) sm.y = loopMeta.yB;
        }
        loopA = lA / totalLen; loopB = lOut / totalLen;
        holdDefs.push({ id: "map", lock: holdLock, a: loopA, b: loopB, px: 3400 });
      }
    }
    /* the ride climbs, so its samples take a virtual height too: a window below its entry point */
    rideA = rideB = 0;
    if (rideMeta && dRideOut) {
      var pr4 = document.createElementNS("http://www.w3.org/2000/svg", "path"), rIn = 0, rOut = 0;
      svg.appendChild(pr4);
      try { pr4.setAttribute("d", dRideIn); rIn = pr4.getTotalLength(); pr4.setAttribute("d", dRideOut); rOut = pr4.getTotalLength(); } catch (e) { rIn = rOut = 0; }
      svg.removeChild(pr4);
      if (rOut > rIn) {
        /* the exit is paced from where the scroll target sits when the hold lets go, so nothing jumps */
        var exit0 = Math.max(rideMeta.yE, (rideMeta.lock || 0) + window.innerHeight * 0.62), prevV = exit0;
        for (var sr = 0; sr < samples.length; sr++) {
          var smp = samples[sr];
          if (smp.l >= rIn && smp.l <= rOut) smp.y = rideMeta.yS + (rideMeta.yE - rideMeta.yS) * (smp.l - rIn) / (rOut - rIn);
          else if (smp.l > rOut) { var paced = Math.max(prevV, smp.y, exit0 + (smp.l - rOut) * 0.85); smp.y = paced; prevV = paced; }
        }
        rideA = rIn / totalLen; rideB = rOut / totalLen;
        holdDefs.push({ id: "charts", lock: rideMeta.lock, a: rideA, b: rideB, px: 2600 });
        if (chartsEl) chartsEl.classList.add("ride");
        if (lineClipRect) lineClipRect.setAttribute("width", "0");
        if (rideSvg && rTrack && rLive && chartsEl) {
          var co2 = pageXY(chartsEl); rideBox = { x: co2.x, y: co2.y, w: chartsEl.offsetWidth, h: chartsEl.offsetHeight };
          rideSvg.setAttribute("viewBox", rideBox.x + " " + rideBox.y + " " + rideBox.w + " " + rideBox.h);
          rTrack.setAttribute("d", d); rLive.setAttribute("d", d);
          rLive.style.strokeDasharray = totalLen; rLive.style.strokeDashoffset = totalLen;
        }
      }
    }
    /* each hold keeps its state if the page is still at it; otherwise it starts fresh for where the page is */
    var yNow = window.pageYOffset || document.documentElement.scrollTop;
    holds = holdDefs.sort(function (u, v) { return u.lock - v.lock; }).map(function (def) {
      var old = holds.filter(function (h) { return h.id === def.id; })[0];
      if (old && old.phase === "hold" && Math.abs(yNow - def.lock) <= 320) { def.phase = "hold"; def.prog = old.prog; def.shown = old.shown; return def; }
      def.phase = yNow > def.lock + 40 ? "after" : "before"; def.prog = def.shown = def.phase === "after" ? 1 : 0; return def;
    });
    tlRows.forEach(function (pt) {
      var best = samples[0], bd = Infinity;
      samples.forEach(function (sp) { var dd = (sp.x - pt.x) * (sp.x - pt.x) + (sp.y - pt.y) * (sp.y - pt.y); if (dd < bd) { bd = dd; best = sp; } });
      pt.frac = best.l / totalLen;
    });
    ySamples = samples;
    /* where the head lands: the very end of the line, on the button */
    endPt = samples[samples.length - 1]; endFrac = 0.999;
    /* the furthest the reader can scroll is the foot of the page; the
       scroll-to-line mapping is scaled so the tip arrives on the button
       exactly there - the burst fires only when it does */
    var docH = document.documentElement.scrollHeight || H;
    var pReachRaw = (docH - window.innerHeight * 0.38) / H;
    pScale = pReachRaw > 0 ? (endFrac + 0.001) / pReachRaw : 1;
    /* knots count back up the line, so the landing flash runs bottom to top */
    knots.forEach(function (k, i) { k.style.setProperty("--i", knots.length - 1 - i); });
    if (head && !head.querySelector(".halo")) {
      var halo = document.createElement("i"); halo.className = "halo"; head.appendChild(halo);
    }
    return true;
  }

  /* the landing: a shockwave, a burst of sparks, and the knots lit in turn */
  var wasLanded = false;
  function burst(pt) {
    if (reduce || !pt) return;
    var frag = document.createDocumentFragment(), bits = [];
    ["", "w2", "w3"].forEach(function (c) {
      var w = document.createElement("i"); w.className = "wave " + c;
      w.style.left = pt.x + "px"; w.style.top = pt.y + "px"; frag.appendChild(w); bits.push(w);
    });
    for (var i = 0; i < 26; i++) {
      var a = (i / 26) * Math.PI * 2 + Math.random() * .25, r = 90 + Math.random() * 220;
      var s = document.createElement("i"); s.className = "spark";
      s.style.left = pt.x + "px"; s.style.top = pt.y + "px";
      s.style.setProperty("--dx", (Math.cos(a) * r).toFixed(1) + "px");
      s.style.setProperty("--dy", (Math.sin(a) * r).toFixed(1) + "px");
      s.style.animationDelay = (Math.random() * .12) + "s";
      frag.appendChild(s); bits.push(s);
    }
    thread.appendChild(frag);
    thread.classList.add("burst");
    setTimeout(function () { bits.forEach(function (b) { b.remove(); }); thread.classList.remove("burst"); }, 2200);
  }

  /* the line descends monotonically, so the point level with a given page
     height can be found by bisection over the samples; the tip is drawn to
     the point 62% down the viewport, so it is always on screen as you read */
  function fracAtY(ty) {
    var s = ySamples, n = s.length;
    if (!n) return 0;
    if (ty <= s[0].y) return 0;
    if (ty >= s[n - 1].y) return 1;
    var lo = 0, hi = n - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (s[mid].y < ty) lo = mid; else hi = mid; }
    var a = s[lo], b = s[hi], t = b.y > a.y ? (ty - a.y) / (b.y - a.y) : 0;
    return (a.l + (b.l - a.l) * t) / totalLen;
  }
  function drawThread(y) {
    if (!totalLen || thread.style.display === "none") return;
    var p = clamp(fracAtY(y + window.innerHeight * 0.62), 0, 1);
    p = Math.max(p, heroFrac * heroIn);
    if (holds.length && !reduce) {
      holdActive = null;
      var ext = vs.on && performance.now() - vs.extAt < 200;                /* an anchor or the scrollbar is moving the page */
      holds.forEach(function (h) {
        var dy = y - h.lock, hadY = h.prevY !== undefined, down = hadY && y > h.prevY, up = hadY && y < h.prevY;
        if (vs.on) {
          if (ext) {
            /* while something else moves the page, the holds only follow where it goes */
            if (h.phase === "hold" || h.phase === "approach") { h.phase = dy > 0 ? "after" : "before"; h.shown = h.prog = dy > 0 ? 1 : 0; }
            if (h.phase === "before" && dy >= 320) h.phase = "after";
            if (h.phase === "after" && dy <= -320) h.phase = "before";
          } else if (h.phase === "before") {
            if (dy >= 320) h.phase = "after";
            else if (vs.tgt >= h.lock - 0.5) { vs.tgt = h.lock; h.phase = "approach"; h.dir = 0; h.prog = h.shown = 0; h.t0 = performance.now(); }
          } else if (h.phase === "after") {
            if (dy <= -320) h.phase = "before";
            else if (vs.tgt < h.lock - 0.5 && y > h.lock - 320) { vs.tgt = h.lock; h.phase = "approach"; h.dir = 1; h.prog = h.shown = 1; h.t0 = performance.now(); }
          }
          if (h.phase === "approach") {
            vs.tgt = h.lock;
            if (Math.abs(dy) > 320) h.phase = dy > 0 ? "after" : "before";
            else if (Math.abs(vs.cur - h.lock) < 1.5 || performance.now() - (h.t0 || 0) > 1400) { vs.cur = vs.tgt = h.lock; h.phase = "hold"; }
            else holdActive = h;
          }
          if (h.phase === "hold") {
            vs.tgt = h.lock;
            h.shown += (h.prog - h.shown) * 0.09;
            if (h.prog > 1 && h.shown > 0.995) { h.phase = "after"; h.shown = 1; }
            else if (h.prog < 0 && h.shown < 0.005) { h.phase = "before"; h.shown = 0; vs.tgt = h.lock - 10; }
            else if (Math.abs(dy) > 320) h.phase = dy > 0 ? "after" : "before";
          }
        } else {
          if (h.phase === "before") {
            if (dy >= 320) h.phase = "after";                                   /* jumped past: nothing plays */
            else if (dy >= 0 || (dy >= -REACH && down)) approach(h, y, 0);
          } else if (h.phase === "after") {
            if (dy <= -320) h.phase = "before";                                 /* jumped back above */
            else if (dy < 0 || (dy <= REACH && up)) approach(h, y, 1);
          }
          if (h.phase === "approach") {
            if (Math.abs(dy) > 320) h.phase = dy > 0 ? "after" : "before";      /* dragged away: let it go */
            else {
              var ta = clamp((performance.now() - h.t0) / h.dur, 0, 1), ea = 1 - Math.pow(1 - ta, 3);
              lockScrollTo(h.from + (h.lock - h.from) * ea);
              if (ta >= 1) { h.phase = "hold"; h.settleAt = performance.now() + 350; lockScrollTo(h.lock); }
              else holdActive = h;
            }
          }
          if (h.phase === "hold") {
            h.shown += (h.prog - h.shown) * 0.09;
            if (h.prog > 1 && h.shown > 0.995) { h.phase = "after"; h.shown = 1; }
            else if (h.prog < 0 && h.shown < 0.005) { h.phase = "before"; h.shown = 0; lockScrollTo(h.lock - 8); }
            else if (Math.abs(dy) > 320) h.phase = dy > 0 ? "after" : "before";   /* dragged away: let it go */
            else if (Math.abs(dy) > 2 && performance.now() > (h.settleAt || 0)) settle(h, y, dy);   /* once settled, stay exactly there */
          }
        }
        if (h.phase === "hold") { p = h.a + (h.b - h.a) * clamp(h.shown, 0, 1); holdActive = h; }
        else if (h.phase === "approach") p = h.dir ? Math.max(p, h.b) : Math.min(p, h.a);
        else if (h.phase === "before") p = Math.min(p, h.a);
        else p = Math.max(p, h.b);
        h.prevY = y;
      });
      hold.active = !!holdActive;
    }
    live.style.strokeDashoffset = totalLen * (1 - p);
    if (rLive && rideBox) {
      rLive.style.strokeDashoffset = totalLen * (1 - p);
      var onRide = p > rideA - 0.004 && p < rideB + 0.004;
      if (rideThread) rideThread.classList.toggle("on", onRide);
      if (rHead && onRide) { var rp0 = live.getPointAtLength(totalLen * p); rHead.style.left = (rp0.x - rideBox.x) + "px"; rHead.style.top = (rp0.y - rideBox.y) + "px"; }
    }
    if (rideMeta && rideB > rideA && chartsEl) {
      /* the bars stand up as the line reaches them; the line chart is revealed to wherever the head has got */
      if (!chartParts) chartParts = { segs: $$("#chBars g.seg-g", chartsEl), vls: $$("#chBars .vl", chartsEl), dots: $$("#chLine .dot-g", chartsEl), lvls: $$("#chLine .vl", chartsEl) };
      chartParts.segs.forEach(function (g) { if (!g.__yr) g.__yr = (g.getAttribute("data-t") || "").split(" ")[0]; });
      chartParts.dots.forEach(function (g) { if (g.__cx === undefined) { var c0 = g.querySelector("circle"); g.__cx = c0 ? parseFloat(c0.getAttribute("cx")) : -1; } });
      chartParts.lvls.forEach(function (t) { if (t.__x === undefined) t.__x = parseFloat(t.getAttribute("x")); });
      var chartHold = holds.filter(function (h) { return h.id === "charts"; })[0];
      var rp = chartHold ? (chartHold.phase === "hold" ? clamp(chartHold.shown, 0, 1) : chartHold.phase === "after" ? 1 : 0) : clamp((p - rideA) / (rideB - rideA), 0, 1), mk2 = rideMeta.marks;
      var upBy = {};
      mk2.yearNames.forEach(function (yr, yi) { upBy[yr] = rp >= mk2.years[yi] - 0.005; });
      chartParts.segs.forEach(function (g) { g.classList.toggle("up", !!upBy[g.__yr]); });
      chartParts.vls.forEach(function (t, ti) { t.classList.toggle("up", rp >= (mk2.years[ti] || 0) - 0.005); });
      var vx = 0;
      if (rp >= mk2.lineStart) {
        var hp = live.getPointAtLength(totalLen * p); vx = (hp.x - mk2.L.ox) / mk2.L.sx;
        if (rp >= 0.999) vx = 640;
      }
      if (lineClipRect) lineClipRect.setAttribute("width", Math.max(0, Math.min(640, vx + 2)).toFixed(1));
      chartParts.dots.forEach(function (g) { g.classList.toggle("up", g.__cx >= 0 && g.__cx <= vx + 1); });
      chartParts.lvls.forEach(function (t) { t.classList.toggle("up", t.__x <= vx + 1); });
    }
    if (live2 && ringLen) {
      var p2 = ringB > ringA ? clamp((p - ringA) / (ringB - ringA), 0, 1) : 0;
      live2.style.strokeDashoffset = ringLen * (1 - p2);
    }
    /* while the page holds on the pink planet the glow runs outward: the planet, ring A, ring B, ring C, the planet */
    var mapHold = holds.filter(function (h) { return h.id === "map"; })[0];
    var lapping = !!(mapHold && mapHold.phase === "hold");
    orbitBoostTarget = lapping ? 1 : 0;
    thread.classList.toggle("lap", lapping);
    if (mapEl) {
      var f = lapping ? clamp(mapHold.shown, 0, 1) : -1;
      mapEl.classList.toggle("lap", lapping);
      /* the planet; ring A's line, then its planets; ring B; ring C; the planet again */
      var ph = function (a, b) { return lapping && f >= a && f < b; };
      mapEl.classList.toggle("lap-core", lapping && (f < 0.12 || f >= 0.88));
      mapEl.classList.toggle("lap-a-ring", ph(0.12, 0.22)); mapEl.classList.toggle("lap-a", ph(0.22, 0.37));
      mapEl.classList.toggle("lap-b-ring", ph(0.37, 0.47)); mapEl.classList.toggle("lap-b", ph(0.47, 0.62));
      mapEl.classList.toggle("lap-c-ring", ph(0.62, 0.72)); mapEl.classList.toggle("lap-c", ph(0.72, 0.88));
    }
    thread.classList.toggle("on", p > 0.004);

    /* the head rides the line, then settles at the page's edge and beacons */
    var landed = p >= endFrac - 0.002;
    thread.classList.toggle("landed", landed);
    document.body.classList.toggle("landed", landed);
    if (landed && !wasLanded) burst(endPt);
    wasLanded = landed;
    if (p > 0.004) {
      var pt = landed && endPt ? endPt : live.getPointAtLength(totalLen * p);
      head.style.left = pt.x + "px";
      head.style.top  = pt.y + "px";
    }
    for (var i = 0; i < knots.length; i++) {
      knots[i].classList.toggle("hit", p >= knotAt[i]);
    }
    for (var ri = 0; ri < tlRows.length; ri++) tlRows[ri].row.classList.toggle("lit", p >= tlRows[ri].frac - 0.001);
  }

  /* ══ CURSOR ═══════════════════════════════════════════════ */
  var cur = $("#cur"), curDot = $("#curDot"), curRing = $("#curRing"), curLbl = $("#curLbl");
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, curSeen = false, lastMx = mx, lastMy = my, cvx = 0, cvy = 0, idleTimer = null;
  if (fine && !reduce && cur) {
    document.documentElement.classList.add("cur-on");
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!curSeen) { curSeen = true; rx = mx; ry = my; lastMx = mx; lastMy = my; cur.classList.add("seen"); }
      cur.classList.remove("idle"); clearTimeout(idleTimer); idleTimer = setTimeout(function () { cur.classList.add("idle"); }, 3500);
      var t = e.target;
      var labelled = t.closest && t.closest("[data-cur-label]");
      var hot = t.closest && t.closest("a,button,summary,[data-mag],.node");
      cur.classList.toggle("label", !!labelled);
      cur.classList.toggle("big", !!hot && !labelled);
      if (labelled && curLbl) curLbl.textContent = labelled.getAttribute("data-cur-label");
    }, { passive: true });
    window.addEventListener("mousedown", function () { cur.classList.add("down"); });
    window.addEventListener("mouseup", function () { cur.classList.remove("down"); });
    document.addEventListener("mouseleave", function () { cur.classList.remove("seen"); });
    document.addEventListener("mouseenter", function () { if (curSeen) cur.classList.add("seen"); });
  }

  /* ── magnetic elements ────────────────────────────────────── */
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

  /* ══ MARQUEES ═════════════════════════════════════════════ */
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
  /* the banner can be dragged: it follows the hand, keeps a little momentum, then resumes */
  marquees.forEach(function (m) {
    var box = m.el.parentElement; if (!box) return;
    var down = false, lx = 0;
    m.v = 0; m.drag = false;
    box.addEventListener("pointerdown", function (e) {
      down = true; lx = e.clientX; m.drag = true; m.v = 0; box.classList.add("drag");
      try { box.setPointerCapture(e.pointerId); } catch (err) {}
    });
    box.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - lx; lx = e.clientX; m.x += dx; m.v = dx;
      if (m.w) { while (m.x <= -m.w) m.x += m.w; while (m.x > 0) m.x -= m.w; }
      m.el.style.transform = "translate3d(" + m.x.toFixed(1) + "px,0,0)";
    });
    function up() { down = false; m.drag = false; box.classList.remove("drag"); }
    box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
  });

  /* ══ PINNED SCENE — 2021 ══════════════════════════════════ */
  var scene = $("#ones"), phrases = $$("#phs .ph"), sceneYr = $("#sceneYr"),
      railDots = $$("#rail3 i"), railSegs = $$("#rail3 s");
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
    var local = p * phrases.length - idx;
    phrases.forEach(function (ph, i) { ph.classList.toggle("on", i === idx); });
    /* the year line and the three-point rail follow the phase: start, now, next */
    if (sceneYr && phrases[idx] && sceneYr.textContent !== phrases[idx].getAttribute("data-yr"))
      sceneYr.textContent = phrases[idx].getAttribute("data-yr");
    railDots.forEach(function (d, i) { d.classList.toggle("on", i === idx); d.classList.toggle("done", i < idx); });
    railSegs.forEach(function (sg, i) { sg.style.setProperty("--f", i < idx ? 1 : i === idx ? clamp(local * 1.15, 0, 1).toFixed(3) : 0); });
  }

  /* ══ "+" REVEALS — one floating panel beside the pressed circle ══ */
  (function () {
    var pop = $("#popover"), body = $("#popBody"), x = $("#popX"), cur = null;
    if (!pop || !body) return;
    function close() { if (!cur) return; cur.classList.remove("is-open"); cur.setAttribute("aria-expanded", "false"); cur = null; pop.classList.remove("on"); }
    function place(btn) {
      var r = btn.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight, pw = pop.offsetWidth, ph = pop.offsetHeight;
      var left = clamp(r.left - 8, 16, W - pw - 16), above = r.bottom + 12 + ph > H - 16 && r.top - 12 - ph > 16;
      pop.style.left = left + "px"; pop.style.top = (above ? r.top - 12 - ph : r.bottom + 12) + "px";
      pop.style.setProperty("--ax", clamp(r.left + r.width / 2 - left - 6, 14, pw - 26) + "px");
      pop.classList.toggle("above", above);
    }
    $$("button.more[data-pop]").forEach(function (btn) {
      var content = document.getElementById(btn.getAttribute("data-pop")); if (!content) return;
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        if (cur === btn) { close(); return; }
        close(); cur = btn; btn.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
        body.innerHTML = content.innerHTML; pop.classList.add("on"); place(btn);
      });
    });
    if (x) x.addEventListener("click", close);
    document.addEventListener("click", function (ev) { if (cur && !pop.contains(ev.target)) close(); });
    window.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
    window.addEventListener("resize", close);
    (function follow() { if (cur) { var r = cur.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) close(); else place(cur); } requestAnimationFrame(follow); })();
  })();

  /* ══ HERO CHOREOGRAPHY ════════════════════════════════════ */
  var hero = $(".hero");

  /* ══ MASTER LOOP ══════════════════════════════════════════ */
  var chapters = $$("#explore .ch, #explore .hero, #explore .scene, #explore .slab");
  var yrail = $("#yrail"), c03El = yrail ? yrail.closest(".ch") : null;
  function W() { return explore ? explore.offsetWidth : window.innerWidth; }
  var chrome = $("#chrome"), spine = $$(".spine a"), spineEl = $("#spine");
  var prog = $("#prog"), card = $("#card"), cardN = $("#cardN"), cardT = $("#cardT"), cardPg = $("#cardPg");
  var now = $("#now"), nowN = $("#nowN"), nowT = $("#nowT");
  var TITLES = { top:["00","Tom Letcher"], ones:["00","Start · Now · Next"], filmsec:["00","The two-minute story"], c01:["01","The Spark"],
    c02:["02","Proof, Not Promise"], c03:["03","How I Build"], c04:["04","Built With People"],
    c05:["05","The Next Ten Years"], c06:["06","The Company"], c07:["07","Still Building"] };
  var lastCard = "";
  var lastY = -1, velY = 0;
  function flowSpine(y, cur2, inFooter) {
    if (!spine.length) return;
    var si = -1, n = spine.length;
    spine.forEach(function (a, k) { if (a.dataset.t === cur2) si = k; });
    if (si < 0 && inFooter) si = n;
    var f = 0;
    if (si >= n) f = 1;
    else if (si >= 0) {
      var sec = document.getElementById(spine[si].dataset.t);
      var within = sec ? clamp((y + window.innerHeight * 0.42 - sec.offsetTop) / Math.max(1, sec.offsetHeight), 0, 1) : 0;
      f = Math.min(1, (si + within) / Math.max(1, n - 1));
    }
    spine.forEach(function (a, k) { a.classList.toggle("on", k === si); a.classList.toggle("done", k < si); });
    if (spineEl) spineEl.style.setProperty("--f", f.toFixed(4));
  }

  function frame() {
    vsStep(performance.now());
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var moved = y !== lastY;
    /* if the page has changed height since the line was measured (fonts, images), measure it again */
    if (builtH && explore && explore.offsetHeight !== builtH) { builtH = explore.offsetHeight; rebuild(); }
    velY = lerp(velY, moved ? y - lastY : 0, 0.12);
    lastY = y;

    /* cursor */
    if (fine && !reduce && curSeen) {
      curDot.style.transform = "translate(" + mx + "px," + my + "px)";
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      /* the ring leans into fast movement and settles round when the hand stops */
      cvx = lerp(cvx, mx - lastMx, 0.2); cvy = lerp(cvy, my - lastMy, 0.2); lastMx = mx; lastMy = my;
      var sp = Math.min(Math.hypot(cvx, cvy), 40), k = cur.classList.contains("down") ? 0.82 : 1;
      var stretch = 1 + sp * 0.012, ang = sp > 1 ? Math.atan2(cvy, cvx) * 180 / Math.PI : 0;
      curRing.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) rotate(" + ang.toFixed(1) + "deg) scale(" + (stretch * k).toFixed(3) + "," + ((2 - stretch) * k).toFixed(3) + ") rotate(" + (-ang).toFixed(1) + "deg)";
    }

    /* marquees — velocity-reactive */
    if (!reduce) {
      marquees.forEach(function (m) {
        if (!m.w || m.drag) return;
        if (m.v) { m.x += m.v; m.v *= 0.94; if (Math.abs(m.v) < 0.05) m.v = 0; }
        else m.x -= m.dir * (0.55 + Math.min(6, Math.abs(velY) * 0.12));
        while (m.x <= -m.w) m.x += m.w;
        while (m.x > 0) m.x -= m.w;
        m.el.style.transform = "translate3d(" + m.x.toFixed(1) + "px,0,0)";
      });
    }

    /* the held lap and the signature move without the page scrolling, so those frames draw too */
    if (moved || velY !== 0 || hold.active) {
      if (chrome) chrome.classList.toggle("stuck", y > 40);

      /* hero: portrait drifts against the scroll */
      if (hero && !reduce && shotWrap) {
        var hp = clamp(y / (hero.offsetHeight || 1), 0, 1);
        shotWrap.style.transform = "translate3d(0," + (hp * -46).toFixed(1) + "px,0)";
      }

      /* chrome tone + spine */
      var mid = y + 90, dark = false, cur2 = null;
      chapters.forEach(function (s) {
        var top = s.offsetTop, bot = top + s.offsetHeight;
        if (mid >= top && mid < bot)
          dark = s.classList.contains("dark") || s.classList.contains("scene");
        if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur2 = s.id;
      });
      var exploring = document.body.dataset.view === "explore";
      var inFooter = cur2 === null && y > window.innerHeight;
      if (inFooter) dark = true;
      if (spineEl) spineEl.classList.toggle("away", inFooter);
      document.body.classList.toggle("dark-chrome", dark && exploring);
      flowSpine(y, cur2, inFooter);

      /* progress hairline */
      if (prog) {
        var mx2 = (document.documentElement.scrollHeight - window.innerHeight) || 1;
        prog.style.transform = "scaleX(" + clamp(y / mx2, 0, 1).toFixed(4) + ")";
      }

      /* the corner card, and the chrome label where the card can't fit, name where you are */
      if (exploring) {
        var meta = TITLES[cur2];
        if (meta && cur2 !== lastCard) {
          lastCard = cur2;
          if (card) { cardN.textContent = meta[0]; cardT.textContent = meta[1]; }
          if (now)  { nowN.textContent = meta[0]; nowT.textContent = meta[1]; }
        }
        var early = y < window.innerHeight * 0.45 || inFooter;
        if (card) card.classList.toggle("away", early);
        if (cardPg && cur2) {
          var cs = document.getElementById(cur2);
          if (cs) cardPg.style.setProperty("--p", clamp((y + window.innerHeight * 0.42 - cs.offsetTop) / Math.max(1, cs.offsetHeight), 0, 1).toFixed(3));
        }
        if (now)  now.classList.toggle("on", !early);
      }

      /* poster words slide against the scroll */
      if (!reduce) {
        for (var pi = 0; pi < pws.length; pi++) {
          var ps = pws[pi].sec;
          var pp = (y + window.innerHeight - ps.offsetTop) /
                   (window.innerHeight + ps.offsetHeight);
          if (pp > -0.1 && pp < 1.1) {
            pws[pi].el.style.transform = "translate3d(" +
              ((pp - 0.5) * -W() * 0.22).toFixed(1) + "px,-50%,0)";
          }
        }
      }

      if (exploring) { drawThread(y); runScene(y); }
    }
    orbitStep(performance.now());
    requestAnimationFrame(frame);
  }

  /* fall back to plain scroll handling when reduced motion is on */
  if (reduce) {
    function still() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (chrome) chrome.classList.toggle("stuck", y > 40);
      var mid = y + 90, dark = false, cur2 = null;
      chapters.forEach(function (s) {
        var top = s.offsetTop, bot = top + s.offsetHeight;
        if (mid >= top && mid < bot)
          dark = s.classList.contains("dark") || s.classList.contains("scene");
        if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur2 = s.id;
      });
      var exploring = document.body.dataset.view === "explore";
      document.body.classList.toggle("dark-chrome", dark && exploring);
      flowSpine(y, cur2, cur2 === null && y > window.innerHeight);
      if (exploring) drawThread(y);
    }
    window.addEventListener("scroll", still, { passive: true });
    still();
  } else {
    requestAnimationFrame(frame);
  }

  /* ── rebuild on layout shifts ─────────────────────────────── */
  var rebuildTimer = null;
  function rebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () {
      buildPath(); measureScene(); measureMarquees(); placeOrbits(); lastY = -1;
    }, 140);
  }
  window.addEventListener("resize", rebuild);
  window.addEventListener("load", rebuild);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { rebuild(); });
  window.addEventListener("load", rebuild);
  if ("ResizeObserver" in window && explore) new ResizeObserver(rebuild).observe(explore);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  buildPath(); measureScene(); measureMarquees();

  /* ══ EXPLORE ⇄ VERIFIED RECORD (pink wipe) ════════════════ */
  var mE = $("#mExplore"), mR = $("#mRecord"), wipe = $("#wipe");
  function applyView(v) {
    document.body.dataset.view = v;
    if (v === "record") {
      $$("#record .rv").forEach(function (e) { e.classList.add("in"); });
    }
    if (mE) mE.setAttribute("aria-pressed", v === "explore");
    if (mR) mR.setAttribute("aria-pressed", v === "record");
    if (v === "record") document.body.classList.remove("dark-chrome");
    window.scrollTo(0, 0);
    if (v === "explore") rebuild();
  }
  function setView(v, then) {
    if (document.body.dataset.view === v) { if (then) then(); return; }
    if (reduce || !wipe || !wipe.animate) { applyView(v); if (then) then(); return; }
    wipe.style.transformOrigin = "bottom";
    wipe.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
      { duration: 300, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" })
      .onfinish = function () {
        applyView(v); if (then) then();
        wipe.style.transformOrigin = "top";
        wipe.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
          { duration: 340, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" });
      };
  }
  if (mE && mR) {
    mE.addEventListener("click", function () { setView("explore"); });
    mR.addEventListener("click", function () { setView("record"); });
  }

  /* ── map ⇄ list ───────────────────────────────────────────── */
  var vM = $("#vMap"), vL = $("#vList");
  function setGrp(g) {
    document.body.dataset.grp = g;
    if (vM) vM.setAttribute("aria-pressed", g === "map");
    if (vL) vL.setAttribute("aria-pressed", g === "list");
    rebuild();
  }
  if (vM && vL) {
    vM.addEventListener("click", function () { setGrp("map"); });
    vL.addEventListener("click", function () { setGrp("list"); });
  }

  /* ── the group map ────────────────────────────────────────── */
  var DATA = {
    group:   { n: "Freedom Group", t: "Group strategy and brand architecture.",
               b: "The operating model the trading company runs on today, and the shape the next companies would take: brands and IP held in the company's name, direct sourcing, one warehouse, shared technology, marketplaces, trade supply and on-site services.", u: "https://www.freedomgroup.uk" },
    global:  { n: "Freedom Fire &amp; Safety Ltd", t: "Trading since 2019. Incorporated 27 August 2021.",
               b: "The trading company. Owned brands Firestorm, FXL and Skyline; direct manufacturing; one warehouse in Bury; storefronts on eBay, Temu and Amazon, with Shopify and OnBuy in preparation; servicing and contracted site work nationwide. Trades online as Freedom Global.",
               u: "https://www.freedom-fire.co.uk" },
    fac:     { n: "Freedom Facilities", t: "Proposed, 24 to 36 months.",
               b: "A separate operating company for compliance, servicing and facilities on recurring contracts, taking the existing servicing work out of the trading company once it justifies its own management and accounts." },
    dist:    { n: "Freedom Distribution", t: "Proposed, 24 to 36 months.",
               b: "A separate operating company for trade and B2B supply of the owned brands to retailers, wholesalers and distributors. Depends on the brand portfolio and direct sourcing already in place." },
    form:    { n: "Property", t: "Long-term option. No date.",
               b: "A commercial property platform for the group's own premises, kept open as an option in the group model." },
    freight: { n: "Freight", t: "Long-term option. No date.",
               b: "A logistics arm for imports and freight control. The in-house consignment tracker is the only part of this that exists today." },
    fly:     { n: "Aerial services", t: "Long-term option. No date.",
               b: "Surveying and inspection. An option in the group model, not a plan." },
    fuel:    { n: "Forecourts", t: "Long-term option. No date.",
               b: "Forecourt and convenience retail. An option in the group model, not a plan." }
  };
  var pN = $("#pName"), pT = $("#pTag"), pB = $("#pBody"), pG = $("#pGo"), panel = $("#panel");
  $$(".node").forEach(function (nd) {
    nd.addEventListener("click", function () {
      $$(".node").forEach(function (o) { o.classList.remove("sel"); o.setAttribute("aria-pressed", "false"); });
      nd.classList.add("sel"); nd.setAttribute("aria-pressed", "true");
      var d = DATA[nd.dataset.k];
      if (!d || !pN) return;
      pN.innerHTML = d.n; pT.textContent = d.t; pB.textContent = d.b;
      if (d.u) { pG.href = d.u; pG.style.display = ""; } else { pG.style.display = "none"; }
      if (!reduce && panel && panel.animate) {
        panel.animate(
          [{ opacity: 0.15, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 420, easing: "cubic-bezier(.2,.8,.25,1)" });
      }
    });
  });

  /* ── chapter sheet ────────────────────────────────────────── */
  var burger = $("#burger"), sheet = $("#sheet");
  function sheetOn(o) {
    var was = sheet.classList.contains("on");
    sheet.classList.toggle("on", o);
    burger.setAttribute("aria-expanded", o);
    document.documentElement.style.overflow = o ? "hidden" : "";
    if (o) { $("#sheetClose").focus(); }
    else if (was) { burger.focus(); }
  }
  function sheetTrap(e) {
    if (e.key !== "Tab" || !sheet.classList.contains("on")) return;
    var f = $$("button, a[href]", sheet), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (burger && sheet) {
    burger.addEventListener("click", function () { sheetOn(!sheet.classList.contains("on")); });
    $("#sheetClose").addEventListener("click", function () { sheetOn(false); });
    sheet.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target === sheet) sheetOn(false);
    });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") sheetOn(false); });
    window.addEventListener("keydown", sheetTrap);
  }

  /* ── a chapter link taken from the Verified Record returns to Explore first;
        otherwise the anchor sits inside a hidden block and the click does nothing ── */
  $$(".chrome nav a, .sheet a, .mono-mark, .skip:not(#skipRec)").forEach(function (a) {
    a.addEventListener("click", function () {
      if (document.body.dataset.view === "record") applyView("explore");
    });
  });

  /* ── back to the start, in either view ── */
  var totopA = $("#totop");
  if (totopA) totopA.addEventListener("click", function (ev) {
    ev.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ── "View the verified record" and "View evidence" open the record view directly ── */
  $$("[data-view-record], #skipRec").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      /* a code link lands on its own row and lights it for a moment */
      var h = a.getAttribute("href") || "", row = h.indexOf("#rec-") === 0 ? document.getElementById(h.slice(1)) : null;
      setView("record", function () {
        if (!row) return;
        row.scrollIntoView({ block: "center" });
        row.classList.add("hit"); setTimeout(function () { row.classList.remove("hit"); }, 2600);
      });
    });
  });

  /* ── "Skip animation": everything readable at once, nothing waits on a reveal ── */
  var skipAnim = $("#skipAnim");
  if (skipAnim) skipAnim.addEventListener("click", function () {
    readyOnce(); heroIn = 1;
    $$(".rv, .draw, .map, .plate, .metrics, .grp-list, .hero-type").forEach(function (el) { el.classList.add("in"); });
    if (io) { $$(".rv, .draw, .map, .plate").forEach(function (el) { io.unobserve(el); }); }
  });
})();


/* ── the eBay rank cards: numbers count up as they arrive, cards tilt to the pointer ── */
(function () {
  var box = document.getElementById("ranks"); if (!box) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fmt = function (n) { return Math.round(n).toLocaleString("en-GB"); };
  function count(el, to, dur, dec) {
    if (reduce) { el.textContent = dec ? to : fmt(to); return; }
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), ease = 1 - Math.pow(1 - k, 3), v = to * ease;
      el.textContent = dec ? v.toFixed(dec) : fmt(v);
      if (k < 1) requestAnimationFrame(step); else el.textContent = dec ? to : fmt(to);
    }
    requestAnimationFrame(step);
  }
  var done = false;
  function go() {
    if (done) return; done = true; box.classList.add("go");
    box.querySelectorAll("[data-count]").forEach(function (el, i) { setTimeout(function () { count(el, +el.getAttribute("data-count"), 1600); }, 200 + i * 120); });
    box.querySelectorAll("[data-pct]").forEach(function (el, i) { var v = el.getAttribute("data-pct"); setTimeout(function () { count(el, +v, 1600, (v.split(".")[1] || "").length); }, 300 + i * 120); });
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es, io) { es.forEach(function (en) { if (en.isIntersecting) { go(); io.disconnect(); } }); }, { threshold: 0.25 }).observe(box);
  } else go();
  /* tilt: fine pointers only */
  if (window.matchMedia && window.matchMedia("(pointer:fine)").matches && !reduce) {
    box.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (ev) {
        var r = card.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = "rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }
})();


/* ── phones: fold and unfold. The buttons and headings only act below 820px ── */
(function () {
  var mq = window.matchMedia && window.matchMedia("(max-width: 820px)");
  function phone() { return mq && mq.matches; }
  document.addEventListener("click", function (ev) {
    if (!phone()) return;
    var t = ev.target;
    var b = t.closest && t.closest(".fold-t");
    if (b) { var host = b.getAttribute("data-fold") === "env" ? b.closest(".env") : b.closest(".cols"); if (host) { var on = host.classList.toggle("open"); b.textContent = on ? "Less" : (b.getAttribute("data-fold") === "env" ? "All six" : "Read more"); } return; }
    var st = t.closest && t.closest(".stage h3"); if (st) { st.parentElement.classList.toggle("open"); return; }
    var mk = t.closest && t.closest(".metric .k"); if (mk) { mk.closest(".metric").classList.toggle("open"); return; }
    var hz = t.closest && t.closest(".hz h3"); if (hz) { hz.closest(".hz").classList.toggle("open"); return; }
    var nm = t.closest && t.closest(".grp-list .nm"); if (nm) { nm.closest("li").classList.toggle("open"); return; }
  });
  /* on a phone the first stage and the first story start open, the rest closed */
  function init() {
    if (!phone()) return;
    var first = document.querySelector(".stage"); if (first) first.classList.add("open");
    document.querySelectorAll("details.story[open]").forEach(function (d, i) { if (i > 0) d.removeAttribute("open"); });
  }
  init();
})();


/* ── the charts: a tooltip follows the pointer over every bar and point ── */
(function () {
  var figs = document.querySelectorAll(".chart"); if (!figs.length) return;
  var tip = document.createElement("div"); tip.className = "ctip"; document.body.appendChild(tip);
  figs.forEach(function (f) {
    f.querySelectorAll("[data-t]").forEach(function (g) {
      function show(e) { tip.textContent = g.getAttribute("data-t"); tip.classList.add("on"); move(e); }
      function move(e) { var p = e.touches ? e.touches[0] : e; tip.style.left = p.clientX + "px"; tip.style.top = p.clientY + "px"; }
      function hide() { tip.classList.remove("on"); }
      g.addEventListener("mouseenter", show); g.addEventListener("mousemove", move); g.addEventListener("mouseleave", hide);
      g.addEventListener("touchstart", show, { passive: true }); g.addEventListener("touchend", hide);
    });
  });
})();


/* ── Before Freedom: the biography reader ── */
(function () {
  var bio = document.getElementById("bio"), open = document.getElementById("bioOpen"), close = document.getElementById("bioClose"), toTl = document.getElementById("bioToTimeline");
  if (!bio || !open) return;
  var last = null;
  function show() { last = document.activeElement; bio.classList.add("on"); bio.setAttribute("aria-hidden", "false"); document.body.classList.add("bio-open"); bio.scrollTop = 0; setTimeout(function () { close.focus(); }, 60); }
  function hide() { bio.classList.remove("on"); bio.setAttribute("aria-hidden", "true"); document.body.classList.remove("bio-open"); if (last && last.focus) last.focus(); }
  open.addEventListener("click", show);
  close.addEventListener("click", hide);
  if (toTl) toTl.addEventListener("click", function () { hide(); });
  window.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && bio.classList.contains("on")) { hide(); ev.stopImmediatePropagation(); } }, true);
})();


/* ── the timeline pictures, on request ── */
(function () {
  var lb = document.getElementById("lb"), img = document.getElementById("lbImg"), x = document.getElementById("lbX");
  var prev = document.getElementById("lbPrev"), next = document.getElementById("lbNext"), fig = lb ? lb.querySelector(".lb-fig") : null;
  var capWhen = document.getElementById("lbWhen"), capWhat = document.getElementById("lbWhat"), capN = document.getElementById("lbN");
  if (!lb || !img) return;
  var views = Array.prototype.slice.call(document.querySelectorAll(".tl-view")), at = -1;
  function show(i) {
    if (!views.length) return;
    at = (i + views.length) % views.length;
    var b = views[at], li = b.closest("li");
    img.src = b.getAttribute("data-src");
    var w = li ? li.querySelector(".when") : null, t = li ? li.querySelector(".what b") : null;
    if (capWhen) capWhen.textContent = w ? w.textContent : "";
    if (capWhat) capWhat.textContent = t ? t.textContent : "";
    if (capN) capN.textContent = (at + 1) + " / " + views.length + (b.getAttribute("data-credit") ? "  ·  " + b.getAttribute("data-credit") : "");
    img.alt = (w ? w.textContent + ": " : "") + (t ? t.textContent : "");
  }
  function open(i) { show(i); lb.hidden = false; document.body.classList.add("bio-open"); }
  function close() { lb.hidden = true; img.src = ""; document.body.classList.remove("bio-open"); }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest(".tl-view");
    if (b) { open(views.indexOf(b)); return; }
    if (lb.hidden) return;
    if (ev.target.closest && ev.target.closest(".lb-nav")) return;
    if (!fig || !fig.contains(ev.target)) close();
  });
  if (prev) prev.addEventListener("click", function () { show(at - 1); });
  if (next) next.addEventListener("click", function () { show(at + 1); });
  if (x) x.addEventListener("click", close);
  window.addEventListener("keydown", function (ev) {
    if (lb.hidden) return;
    if (ev.key === "Escape") { close(); ev.stopImmediatePropagation(); }
    else if (ev.key === "ArrowRight") { show(at + 1); ev.preventDefault(); }
    else if (ev.key === "ArrowLeft") { show(at - 1); ev.preventDefault(); }
  }, true);
})();
