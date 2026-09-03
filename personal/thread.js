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
    if (document.readyState === "complete") { setTimeout(readyOnce, 900); }
    else { window.addEventListener("load", function () { setTimeout(readyOnce, 900); }); }
    setTimeout(readyOnce, 3200);
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
  $$("#explore .hero, #explore .ch, #explore .scene, #explore .slab").forEach(function (sec, si) {
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
  var PW = { c01: "UNIT", c02: "BUILD", c03: "MOMENTUM", c04: "GROUP",
             c05: "METHOD", c06: "RECORD", c07: "NEXT" };
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
  function placeOrbits() {
    var RINGS = { A: [33, 13], B: [43, 20.5], C: [51, 28] };
    var PHI = -16 * Math.PI / 180, CX = 50, CY = 38;
    $$(".map .node").forEach(function (nd) {
      var ring = nd.getAttribute("data-ring");
      var x = CX, y = CY;
      if (ring !== "0" && RINGS[ring]) {
        var th = (+nd.getAttribute("data-ang") || 0) * Math.PI / 180;
        var ex = RINGS[ring][0] * Math.cos(th), ey = RINGS[ring][1] * Math.sin(th);
        x = CX + ex * Math.cos(PHI) - ey * Math.sin(PHI);
        y = CY + ex * Math.sin(PHI) + ey * Math.cos(PHI);
      }
      nd.style.left = x + "%";
      nd.style.top = (y / 76 * 100) + "%";
    });
  }
  placeOrbits();

  /* ── hero branch lines ────────────────────────────────────── */
  $$(".draw").forEach(function (p) {
    var L = 2000; try { L = p.getTotalLength(); } catch (e) {}
    p.style.setProperty("--len", L);
  });

  /* ── construct on entry, deconstruct on exit ──────────────── */
  var watched = $$(".rv, .draw, .map, .plate");
  if (!("IntersectionObserver" in window) || reduce) {
    watched.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
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
  var counters = $$(".metric .v").filter(function (v) {
    var t = v.textContent.trim();
    return /^[0-9]+$/.test(t) && +t < 1000;   /* years are labels, not quantities */
  });
  counters.forEach(function (v) { v.dataset.to = v.textContent.trim(); });
  function countUp(v) {
    var to = +v.dataset.to, t0 = null, dur = 1100;
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
        if (en.isIntersecting) countUp(en.target); else en.target.textContent = "0";
      });
    }, { threshold: 0.5 });
    counters.forEach(function (v) { v.textContent = "0"; ioc.observe(v); });
  }

  /* ══ THE THREAD ═══════════════════════════════════════════ */
  var explore = $("#explore"),
      thread  = $("#thread"),
      svg     = $("#threadSvg"),
      track   = $("#tTrack"),
      live    = $("#tLive"),
      head    = $("#tHead");

  /* L and R ride the empty margin outside the text column, so the
     line never crosses a word. C is the centre. */
  var PLAN = [
    { id: "ones", side: "C", y: 0.50, noKnot: true },
    { id: "c01",  side: "L", y: 0.42 },
    { id: "c02",  side: "R", y: 0.42 },
    { id: "c03",  side: "L", y: 0.42 },
    { id: "c04",  side: "C", y: 0.40 },
    { id: "c05",  side: "R", y: 0.42 },
    { id: "slab", side: "C", y: 0.50, noKnot: true },
    { id: "c06",  side: "L", y: 0.42 },
    { id: "c07",  side: "C", y: 0.52 }
  ];

  var pts = [], knots = [], totalLen = 0, knotAt = [], heroFrac = 0, heroIn = 0, pScale = 1;
  var endPt = null, endFrac = 1, endNote = null;

  function buildPath() {
    if (!explore || !thread || !svg) return false;
    if (window.innerWidth <= 820) { thread.style.display = "none"; return false; }
    thread.style.display = "";

    var W = explore.offsetWidth, H = explore.offsetHeight;
    if (!W || !H) return false;

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

    PLAN.forEach(function (p) {
      var el = document.getElementById(p.id);
      if (!el) return;
      pts.push({ x: SIDE[p.side], y: el.offsetTop + el.offsetHeight * p.y,
                 id: p.id, el: el, noKnot: !!p.noKnot });
    });
    if (pts.length < 2) return false;
    pts.push({ x: CX, y: H + 40, id: "beyond", el: null, noKnot: true });

    var d = heroPrefix || ("M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1));
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dy = (b.y - a.y) * 0.5;
      d += " C " + a.x.toFixed(1) + " " + (a.y + dy).toFixed(1) +
           ", " + b.x.toFixed(1) + " " + (b.y - dy).toFixed(1) +
           ", " + b.x.toFixed(1) + " " + b.y.toFixed(1);
    }

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    track.setAttribute("d", d);
    live.setAttribute("d", d);

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

    knots.forEach(function (k) { k.remove(); });
    knots = []; knotAt = [];
    var SAMPLES = 280, samples = [];
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

    /* where the head lands: the last point of the line still on the page */
    endPt = null; endFrac = 1;
    for (var e2 = 0; e2 < samples.length; e2++) {
      if (samples[e2].y >= H - 90) {
        endPt = samples[e2];
        endFrac = samples[e2].l / totalLen;
        break;
      }
    }
    if (!endPt) { endPt = samples[samples.length - 1]; endFrac = 0.99; }
    /* the furthest the reader can scroll is the foot of the story; the
       scroll-to-line mapping is scaled so the tip arrives at the end point
       exactly there - the burst fires only when it does */
    var pReachRaw = (H - window.innerHeight * 0.38) / H;
    pScale = pReachRaw > 0 ? (endFrac + 0.001) / pReachRaw : 1;
    if (endNote) endNote.remove();
    endNote = document.createElement("span");
    endNote.className = "endnote";
    endNote.textContent = "— still drawing";
    endNote.style.left = (endPt.x + 20) + "px";
    endNote.style.top = endPt.y + "px";
    thread.appendChild(endNote);
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

  function drawThread(y) {
    if (!totalLen || thread.style.display === "none") return;
    var h = explore.offsetHeight || 1;
    var p = clamp((y + window.innerHeight * 0.62) / h * pScale, 0, 1);
    p = Math.max(p, heroFrac * heroIn);
    live.style.strokeDashoffset = totalLen * (1 - p);
    thread.classList.toggle("on", p > 0.004);

    /* the head rides the line, then settles at the page's edge and beacons */
    var landed = p >= endFrac - 0.002;
    thread.classList.toggle("landed", landed);
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
  }

  /* ══ CURSOR ═══════════════════════════════════════════════ */
  var cur = $("#cur"), curDot = $("#curDot"), curRing = $("#curRing");
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, curSeen = false;
  if (fine && !reduce && cur) {
    document.documentElement.classList.add("cur-on");
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY; curSeen = true;
      var t = e.target;
      var hot = t.closest && t.closest("a,button,summary,[data-mag],.node");
      cur.classList.toggle("big", !!hot);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cur.style.opacity = "1"; });
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

  /* ══ PINNED SCENE — 2021 ══════════════════════════════════ */
  var scene = $("#ones"), phrases = $$("#phs .ph");
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

  /* ══ HERO CHOREOGRAPHY ════════════════════════════════════ */
  var hero = $(".hero");

  /* ══ MASTER LOOP ══════════════════════════════════════════ */
  var chapters = $$("#explore .ch, #explore .hero, #explore .scene, #explore .slab");
  var yrail = $("#yrail"), c03El = document.getElementById("c03");
  function W() { return explore ? explore.offsetWidth : window.innerWidth; }
  var chrome = $("#chrome"), spine = $$(".spine a");
  var prog = $("#prog"), card = $("#card"), cardN = $("#cardN"), cardT = $("#cardT");
  var now = $("#now"), nowN = $("#nowN"), nowT = $("#nowT");
  var TITLES = { top:["00","Tom Letcher"], ones:["00","One Unit"], c01:["01","One Unit"],
    c02:["02","The Build"], c03:["03","Momentum"], c04:["04","Freedom Group"],
    c05:["05","How I Build"], slab:["—","Five Years"], c06:["06","The Record"],
    c07:["07","Still Building"] };
  var lastCard = "";
  var lastY = -1, velY = 0;

  function frame() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var moved = y !== lastY;
    velY = lerp(velY, moved ? y - lastY : 0, 0.12);
    lastY = y;

    /* cursor */
    if (fine && !reduce && curSeen) {
      curDot.style.transform = "translate(" + mx + "px," + my + "px)";
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      curRing.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    }

    /* marquees — velocity-reactive */
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
      document.body.classList.toggle("dark-chrome", dark && exploring);
      spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });

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
        var early = y < window.innerHeight * 0.45;
        if (card) card.classList.toggle("away", early);
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
        /* the years rail drags with the scroll */
        if (yrail && c03El && window.innerWidth > 820) {
          var rp = clamp((y + window.innerHeight * 0.8 - c03El.offsetTop) /
                         (c03El.offsetHeight * 0.9), 0, 1);
          var over = Math.max(0, yrail.scrollWidth - yrail.parentElement.clientWidth);
          yrail.style.transform = "translate3d(" + (-rp * over).toFixed(1) + "px,0,0)";
        }
      }

      if (exploring) { drawThread(y); runScene(y); }
    }
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
      spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === cur2); });
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
    mE.setAttribute("aria-pressed", v === "explore");
    mR.setAttribute("aria-pressed", v === "record");
    if (v === "record") document.body.classList.remove("dark-chrome");
    window.scrollTo(0, 0);
    if (v === "explore") rebuild();
  }
  function setView(v) {
    if (document.body.dataset.view === v) return;
    if (reduce || !wipe || !wipe.animate) { applyView(v); return; }
    wipe.style.transformOrigin = "bottom";
    wipe.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
      { duration: 300, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" })
      .onfinish = function () {
        applyView(v);
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
    vM.setAttribute("aria-pressed", g === "map");
    vL.setAttribute("aria-pressed", g === "list");
    rebuild();
  }
  if (vM && vL) {
    vM.addEventListener("click", function () { setGrp("map"); });
    vL.addEventListener("click", function () { setGrp("list"); });
  }

  /* ── the group map ────────────────────────────────────────── */
  var DATA = {
    group:     { n: "Freedom Group", t: "The holding structure.",
                 b: "One group, built so each venture is a separate operating company rather than another department." },
    fire:      { n: "Freedom Fire &amp; Safety", t: "The business that started it.",
                 b: "Fire safety products, installation and compliance — serving homes and businesses across the UK.",
                 u: "https://www.freedom-fire.co.uk" },
    global:    { n: "Freedom Global", t: "Operating.",
                 b: "TK — one line on what Freedom Global does today, and the date it began trading." },
    dist:      { n: "Freedom Distribution", t: "Operating.",
                 b: "TK — one line on the distribution arm, and the date it began trading." },
    fac:       { n: "Freedom Facilities", t: "Launching.",
                 b: "TK — what it will do, and when it launches. Not yet trading." },
    hepa:      { n: "Hepa Fellas", t: "Launching.",
                 b: "TK — what it will do, and when it launches. Not yet trading." },
    firestorm: { n: "Firestorm", t: "Planned.", b: "TK — planned brand. Not yet trading." },
    voltz:     { n: "Voltz", t: "Planned.", b: "TK — planned brand. Not yet trading." },
    kunergy:   { n: "Kunergy", t: "Planned.", b: "TK — planned brand. Not yet trading." },
    t3:        { n: "T3", t: "Planned.", b: "TK — planned brand. Not yet trading." }
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
  $$(".chrome nav a, .sheet a, .mono-mark, .skip").forEach(function (a) {
    a.addEventListener("click", function () {
      if (document.body.dataset.view === "record") applyView("explore");
    });
  });
})();
