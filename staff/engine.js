/* ══════════════════════════════════════════════════════════════════
   THE OPEN DOOR — engine
   The founder page's engine, mirrored: a flame line drawn through
   the chapters as you read, a pinned scene, headlines that rise word
   by word, poster words behind chapters, a velocity marquee. Plus the
   door (a click opens and closes it), the four activities, the roll
   call, the profiles, the two-year test and the assessment.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var pad2 = function (x) { return x < 10 ? "0" + x : "" + x; };

  /* ── the door ─────────────────────────────────────────────── */
  var door = $("#top"), doorBtn = $("#doorBtn"), hint = $("#hint");
  function setDoor(open) {
    if (!door) return;
    door.classList.toggle("open", open);
    if (doorBtn) doorBtn.setAttribute("aria-pressed", open);
    if (hint) hint.style.opacity = open ? "0" : "";
    var ot = $("#openTop"); if (ot) ot.textContent = open ? "Close the door" : "Open the door";
  }
  ["#doorBtn", "#doorOpen"].forEach(function (s) { var b = $(s); if (b) b.addEventListener("click", function () { setDoor(true); }); });
  var dc = $("#doorClose"); if (dc) dc.addEventListener("click", function () { setDoor(false); });
  var ot = $("#openTop");
  if (ot) ot.addEventListener("click", function () {
    var open = !door.classList.contains("open");
    setDoor(open);
    if (open) window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ── split headlines: words rise ──────────────────────────── */
  function split(el, step) {
    var nodes = Array.prototype.slice.call(el.childNodes), out = [];
    nodes.forEach(function (nd) {
      if (nd.nodeType === 3) {
        nd.textContent.split(/(\s+)/).forEach(function (tk) {
          if (!tk) return;
          if (/^\s+$/.test(tk)) { out.push(document.createTextNode(" ")); return; }
          var box = document.createElement("span"); box.className = "wa";
          var ink = document.createElement("i"); ink.textContent = tk; box.appendChild(ink); out.push(box);
        });
      } else { out.push(nd); }
    });
    el.textContent = ""; var wi = 0;
    out.forEach(function (nd) { el.appendChild(nd); if (nd.classList && nd.classList.contains("wa")) { nd.firstChild.style.setProperty("--d", (wi * step) + "s"); wi++; } });
  }
  if (!reduce) $$(".ch h2").forEach(function (el) { split(el, 0.055); });

  /* ── poster words ─────────────────────────────────────────── */
  var PW = { award: "TESTED", programme: "FOUR", people: "NINE", creds: "STANDING", test: "TWO YEARS", training: "FIRE", join: "IN" };
  var pws = [];
  Object.keys(PW).forEach(function (id) {
    var sec = document.getElementById(id); if (!sec) return;
    var w = document.createElement("span"); w.className = "pw"; w.textContent = PW[id]; w.setAttribute("aria-hidden", "true");
    sec.insertBefore(w, sec.firstChild); pws.push({ el: w, sec: sec });
  });

  /* ── reveal ───────────────────────────────────────────────── */
  var watched = $$(".rv");
  if (!("IntersectionObserver" in window) || reduce) watched.forEach(function (e) { e.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    watched.forEach(function (e) { io.observe(e); });
  }

  /* ── the line ─────────────────────────────────────────────── */
  var story = $("#story"), thread = $("#thread"), svg = $("#threadSvg"), track = $("#tTrack"), live = $("#tLive"), head = $("#tHead");
  var PLAN = [
    { id: "award", side: "L", y: 0.40 }, { id: "one", side: "R", y: 0.5, noKnot: true }, { id: "programme", side: "L", y: 0.42 },
    { id: "people", side: "R", y: 0.36 }, { id: "creds", side: "L", y: 0.44 }, { id: "test", side: "R", y: 0.4 },
    { id: "training", side: "L", y: 0.42 }, { id: "join", side: "R", y: 0.45 }
  ];
  var pts = [], knots = [], totalLen = 0, knotAt = [], endPt = null, endFrac = 1, endNote = null, pScale = 1;
  function placeHead(x, y) { head.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)"; }
  function buildPath() {
    if (!story || !thread || !svg || window.innerWidth <= 820) return false;
    var W = story.offsetWidth, H = story.offsetHeight; if (!W || !H) return false;
    var col = story.querySelector(".ch .wrap"); var cr = col ? col.getBoundingClientRect() : { left: 0, right: W };
    var LX = Math.max(18, cr.left - 34), RX = Math.min(W - 32, cr.right + 34), SIDE = { L: LX, R: RX };
    pts = [];
    var d0 = document.getElementById("top");
    if (d0) pts.push({ x: W / 2, y: d0.offsetTop + d0.offsetHeight - 2, id: "top", el: d0, noKnot: true });
    var prev = "C";
    PLAN.forEach(function (p) {
      var el = document.getElementById(p.id); if (!el) return;
      if (prev !== "C" && p.side !== prev) {
        var band = el.classList.contains("scene") ? el.offsetHeight * 0.12 : (parseFloat(getComputedStyle(el).paddingTop) || 76);
        pts.push({ x: SIDE[prev], y: el.offsetTop + 14, noKnot: true }); pts.push({ x: SIDE[p.side], y: el.offsetTop + band - 18, noKnot: true });
      }
      pts.push({ x: SIDE[p.side], y: el.offsetTop + el.offsetHeight * p.y, id: p.id, el: el, noKnot: !!p.noKnot }); prev = p.side;
    });
    if (pts.length < 2) return false;
    var last = pts[pts.length - 1]; pts.push({ x: last.x, y: H - 40, noKnot: true });
    var d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) { var a = pts[i], b = pts[i + 1], dy = (b.y - a.y) * 0.5;
      d += " C " + a.x.toFixed(1) + " " + (a.y + dy).toFixed(1) + ", " + b.x.toFixed(1) + " " + (b.y - dy).toFixed(1) + ", " + b.x.toFixed(1) + " " + b.y.toFixed(1); }
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); track.setAttribute("d", d); live.setAttribute("d", d);
    try { totalLen = live.getTotalLength(); } catch (e) { totalLen = 0; } if (!totalLen) return false;
    live.style.strokeDasharray = totalLen; live.style.strokeDashoffset = reduce ? 0 : totalLen;
    knots.forEach(function (k) { k.remove(); }); knots = []; knotAt = [];
    var S = 240, samples = [];
    for (var s = 0; s <= S; s++) { var pt = live.getPointAtLength(totalLen * s / S); samples.push({ x: pt.x, y: pt.y, l: totalLen * s / S }); }
    pts.forEach(function (p) {
      if (p.noKnot) return; var best = samples[0], bd = Infinity;
      samples.forEach(function (sp) { var dd = (sp.x - p.x) * (sp.x - p.x) + (sp.y - p.y) * (sp.y - p.y); if (dd < bd) { bd = dd; best = sp; } });
      var k = document.createElement("i"); k.className = "knot" + (p.el && p.el.classList.contains("light") ? " lt" : "");
      k.style.left = p.x + "px"; k.style.top = p.y + "px"; thread.appendChild(k); knots.push(k); knotAt.push(best.l / totalLen);
    });
    endPt = null; endFrac = 1;
    for (var e2 = 0; e2 < samples.length; e2++) if (samples[e2].y >= H - 90) { endPt = samples[e2]; endFrac = samples[e2].l / totalLen; break; }
    if (!endPt) { endPt = samples[samples.length - 1]; endFrac = 0.99; }
    if (endNote) endNote.remove();
    endNote = document.createElement("span"); endNote.className = "endnote"; endNote.textContent = "— the door is still open";
    var onRight = endPt.x > W / 2; endNote.style.left = (endPt.x + (onRight ? -18 : 18)) + "px"; endNote.style.top = endPt.y + "px"; endNote.style.transform = onRight ? "translate(-100%,-50%)" : "translate(0,-50%)"; thread.appendChild(endNote);
    var pReachRaw = (H - window.innerHeight * 0.38) / H; pScale = pReachRaw > 0 ? (endFrac + 0.001) / pReachRaw : 1;
    if (reduce) { thread.classList.add("on", "landed"); placeHead(endPt.x, endPt.y); knots.forEach(function (k) { k.classList.add("hit"); }); }
    return true;
  }
  function drawThread(y) {
    if (!totalLen || reduce || window.innerWidth <= 820) return;
    var h = story.offsetHeight || 1, p = clamp((y + window.innerHeight * 0.62) / h * pScale, 0, 1);
    live.style.strokeDashoffset = totalLen * (1 - p); thread.classList.toggle("on", p > 0.004);
    var landed = p >= endFrac - 0.002; thread.classList.toggle("landed", landed);
    if (p > 0.004) { var pt = landed && endPt ? endPt : live.getPointAtLength(totalLen * p); placeHead(pt.x, pt.y); }
    for (var i = 0; i < knots.length; i++) knots[i].classList.toggle("hit", p >= knotAt[i]);
  }

  /* ── the pinned scene ─────────────────────────────────────── */
  var scene = $("#one"), phrases = $$("#phs .ph"), sceneTop = 0, sceneRange = 1;
  function measureScene() { if (!scene) return; sceneTop = scene.offsetTop; sceneRange = Math.max(1, scene.offsetHeight - window.innerHeight); }
  function runScene(y) {
    if (!scene || reduce || window.innerWidth <= 820) return;
    var p = clamp((y - sceneTop) / sceneRange, 0, 1), idx = Math.min(phrases.length - 1, Math.floor(p * phrases.length));
    phrases.forEach(function (ph, i) { ph.classList.toggle("on", i === idx); });
  }

  /* ── marquee + roll call ──────────────────────────────────── */
  var marquees = [];
  $$(".mq-t").forEach(function (t) { var base = t.getAttribute("data-base") || "", html = ""; for (var i = 0; i < 6; i++) html += "<span>" + base + "</span>"; t.innerHTML = html; marquees.push({ el: t, x: 0, dir: 1, w: 0, speed: 0.6 }); });
  var rollT = $("#rollT"), cards = $$("#rack .card");
  if (rollT) {
    var one = "";
    cards.forEach(function (c) { one += '<button type="button" class="' + (c.dataset.cat === "tbd" ? "tbd" : "") + '" data-k="' + c.dataset.k + '">' + c.dataset.name + '<i>·</i></button>'; });
    rollT.innerHTML = one + one + one;
    rollT.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; var c = $('#rack .card[data-k="' + b.dataset.k + '"]'); if (c) openProf(c); });
    marquees.push({ el: rollT, x: 0, dir: 1, w: 0, speed: 0.35, roll: true });
  }
  function measureMarquees() { marquees.forEach(function (m) { if (m.roll) { m.w = m.el.scrollWidth / 3; } else { var f = m.el.firstElementChild; m.w = f ? f.offsetWidth : 0; } }); }

  /* ── on scroll ────────────────────────────────────────────── */
  var chapters = $$("#story .ch, #story .door, #story .scene");
  var chrome = $("#chrome"), spine = $$(".spine a"), prog = $("#prog"), now = $("#now"), nowN = $("#nowN"), nowT = $("#nowT");
  var TITLES = { top: ["00", "The door"], award: ["01", "The award"], one: ["01", "The award"], programme: ["02", "The programme"], people: ["03", "The people"],
    creds: ["04", "What we are"], test: ["05", "The two-year test"], training: ["06", "Training"], join: ["07", "Join"] };
  var lastCard = "", lastY = -1, velY = 0, steps = $$("#rail .step"), rail = $("#rail");
  function frame() {
    var y = window.pageYOffset || document.documentElement.scrollTop, moved = y !== lastY;
    velY = lerp(velY, moved ? y - lastY : 0, 0.12); lastY = y;
    if (!reduce) marquees.forEach(function (m) { if (!m.w) return; m.x -= m.dir * (m.speed + Math.min(6, Math.abs(velY) * 0.12)); if (m.x <= -m.w) m.x += m.w; if (m.x > 0) m.x -= m.w; m.el.style.transform = "translate3d(" + m.x.toFixed(1) + "px,0,0)"; });
    if (moved || Math.abs(velY) > 0.01) {
      if (chrome) chrome.classList.toggle("stuck", y > 40);
      var mid = y + 90, light = false, cur = null;
      chapters.forEach(function (s) { var top = s.offsetTop, bot = top + s.offsetHeight; if (mid >= top && mid < bot) light = s.classList.contains("light"); if (y + window.innerHeight * 0.42 >= top && y + window.innerHeight * 0.42 < bot) cur = s.id; });
      document.body.classList.toggle("light-chrome", light);
      if (!cur && chapters.length && y + window.innerHeight * 0.42 >= chapters[chapters.length - 1].offsetTop) cur = chapters[chapters.length - 1].id;
      var sk = cur === "one" ? "award" : cur; spine.forEach(function (a) { a.classList.toggle("on", a.dataset.t === sk); });
      if (prog) { var mx = (document.documentElement.scrollHeight - window.innerHeight) || 1; prog.style.transform = "scaleX(" + clamp(y / mx, 0, 1).toFixed(4) + ")"; }
      var meta = TITLES[cur]; if (meta && cur !== lastCard) { lastCard = cur; if (now) { nowN.textContent = meta[0]; nowT.textContent = meta[1]; } }
      if (now) now.classList.toggle("on", y > window.innerHeight * 0.45);
      if (!reduce) for (var pi = 0; pi < pws.length; pi++) { var ps = pws[pi].sec, pp = (y + window.innerHeight - ps.offsetTop) / (window.innerHeight + ps.offsetHeight); if (pp > -0.1 && pp < 1.1) pws[pi].el.style.transform = "translate3d(" + ((pp - 0.5) * -(story.offsetWidth) * 0.22).toFixed(1) + "px,-50%,0)"; }
      if (rail && steps.length) { var r = rail.getBoundingClientRect(), lp = clamp((window.innerHeight * 0.86 - r.top) / (r.height + window.innerHeight * 0.2), 0, 1); steps.forEach(function (st, k) { st.classList.toggle("lit", lp >= (k + 0.65) / steps.length); }); }
      drawThread(y); runScene(y);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  var rebuildTimer = null;
  function rebuild() { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(function () { buildPath(); measureScene(); measureMarquees(); lastY = -1; }, 140); }
  window.addEventListener("resize", rebuild); window.addEventListener("load", rebuild);
  if ("ResizeObserver" in window && story) new ResizeObserver(rebuild).observe(story);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  buildPath(); measureScene(); measureMarquees();

  /* ── the four activities ──────────────────────────────────── */
  $$("#acts .act").forEach(function (a) {
    var b = $("button", a);
    b.addEventListener("click", function () { var on = !a.classList.contains("on"); a.classList.toggle("on", on); b.setAttribute("aria-expanded", on); });
  });

  /* ── profiles ─────────────────────────────────────────────── */
  var prof = $("#prof"), pclose = $("#pclose"), lastEl = null;
  var ACTS = { a: "a · work experience or careers advice", b: "b · mentoring", c: "c · interview and job-related training", d: "d · recruitment open to everyone" };
  function openProf(card) {
    if (!prof) return; lastEl = document.activeElement;
    $("#pfName").textContent = card.dataset.name; $("#pfRole").innerHTML = card.dataset.role;
    $("#pfRoute").textContent = card.dataset.route; $("#pfRoute2").textContent = card.dataset.route;
    $("#pfFocus").innerHTML = card.dataset.focus;
    var q = card.dataset.q || ""; $("#pfQ").textContent = /^TK/.test(q) ? "Question to be written for " + card.dataset.name : "“" + q + "”";
    $("#pfSince").textContent = card.dataset.since === "TK" ? "TK — start date" : card.dataset.since;
    $("#pfAct").innerHTML = card.dataset.act.split(" ").map(function (k) { return ACTS[k] || k; }).join("<br>");
    var tpl = $("template.story", card); $("#pfStory").innerHTML = tpl ? tpl.innerHTML : "";
    prof.hidden = false; document.body.classList.add("prof-open"); pclose.focus();
  }
  function closeProf() { if (!prof || prof.hidden) return; prof.hidden = true; document.body.classList.remove("prof-open"); if (lastEl && lastEl.focus) lastEl.focus(); }
  cards.forEach(function (c) { c.addEventListener("click", function () { openProf(c); }); });
  if (pclose) pclose.addEventListener("click", closeProf);
  if (prof) {
    prof.addEventListener("click", function (e) { if (e.target === prof) closeProf(); });
    window.addEventListener("keydown", function (e) {
      if (prof.hidden) return;
      if (e.key === "Escape") { closeProf(); return; }
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
  if (progStart && verdict) progStart.addEventListener("input", function () {
    if (!progStart.value) { verdict.innerHTML = "Enter the date of the earliest record."; if (ruler) ruler.classList.remove("set", "fail"); if (twoYearState) twoYearState.textContent = ""; return; }
    var d = new Date(progStart.value + "T00:00:00"); if (isNaN(d)) return;
    var m = monthsBetween(d, DEADLINE), ok = d <= CUTOFF;
    if (ok) verdict.innerHTML = "<b>Passes.</b> By the closing date the programme will have run for " + Math.floor(m / 12) + " year" + (Math.floor(m / 12) === 1 ? "" : "s") + " and " + (m % 12) + " month" + (m % 12 === 1 ? "" : "s") + " — dated from " + fmt(d) + ". Keep that record.";
    else { var sh = Math.abs(monthsBetween(CUTOFF, d)); verdict.innerHTML = "<b>Not yet.</b> A record from " + fmt(d) + " is " + sh + " month" + (sh === 1 ? "" : "s") + " too young for this cycle. Unless an earlier record exists, this category waits a year."; }
    if (pin) pin.style.left = pct(d).toFixed(2) + "%"; if (ruler) { ruler.classList.add("set"); ruler.classList.toggle("fail", !ok); }
    if (twoYearState) twoYearState.innerHTML = ok ? "<i>✓</i>Passes on the date given" : "<i>✕</i>Not yet, on the date given";
  });

  /* ── the assessment ───────────────────────────────────────── */
  var FIRE = { a: "Class A — wood, paper, textiles. Water, foam, powder or wet chemical will do it.", b: "Class B — petrol, paint, solvents. Foam, CO₂ or powder. Never water.",
    c: "Class C — flammable gases. Dry powder only, once the supply is isolated.", e: "Live electrical — CO₂ or dry powder. Water and foam conduct.", f: "Class F — cooking oils and fats. Wet chemical, purpose-built for the job." };
  var fnote = $("#fnote"), fcs = $$(".fc"), exts = $$(".ext");
  function pickFire(cls) {
    fcs.forEach(function (b) { var on = b.getAttribute("data-cls") === cls; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    exts.forEach(function (x) { var ok = (" " + x.getAttribute("data-ok") + " ").indexOf(" " + cls + " ") >= 0; x.classList.toggle("hit", ok); x.classList.toggle("miss", !ok); });
    if (fnote) fnote.textContent = FIRE[cls] || "";
  }
  fcs.forEach(function (b) { b.addEventListener("click", function () { pickFire(b.getAttribute("data-cls")); }); });
  if (fcs.length) pickFire("a");
  var QUIZ = [{ q: "Waste-paper bin alight in an office.", cls: "a" }, { q: "Overheated fuse board — still live.", cls: "e" }, { q: "Chip-pan fire in the staff kitchen.", cls: "f" },
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
    if (qi >= QUIZ.length) { fq.innerHTML = "<b>" + qScore + " of " + QUIZ.length + ".</b> " + (qScore === QUIZ.length ? "Full marks — you'd pass our induction." : "Return to Learn, then sit it again."); if (fnote) fnote.textContent = "Sit the paper again whenever you like."; return; }
    fq.innerHTML = "Q" + (qi + 1) + " — <b>" + QUIZ[qi].q + "</b> Which extinguisher?"; if (fnote) fnote.textContent = "Mark your answer.";
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
