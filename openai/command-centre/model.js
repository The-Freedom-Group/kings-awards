/* Freedom Command Centre — the live state every view reads.
 *
 * One object holds what a manager can change (extra picking time, decisions,
 * ticks, priorities) and recomputes the floor from it. Views never keep their
 * own copy of a number: they ask the model, so the Founder view, the Team view
 * and an answer in "Ask" can never disagree.
 */
(function (root) {
  'use strict';
  var D = root.FCC_DATA, X = root.FCC_ASK;

  var KEY = 'fcc.demo.v1';
  // A demo left open for more than 80 minutes starts again from 13:20 the next
  // time it loads, so it is never shown with the afternoon already over.
  var STALE_MS = 80 * 60000;
  // The clock holds at 14:40 however long a tab stays open: the last minute at
  // which moving people can still save every van, so the story never runs out.
  var HOLD_AT = 14 * 60 + 40;
  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY)) || null;
      return s && Date.now() - s.openedAt < STALE_MS ? s : null;
    } catch (e) { return null; }
  }

  function Model() {
    var s = load();
    // The demo clock: opens at 13:20 and runs in real time for this tab.
    this.openedAt = s && s.openedAt || Date.now();
    this.extra = s && s.extra || {};
    this.decided = s && s.decided || {};
    this.ticks = s && s.ticks || {};
    this.prio = s && s.prio || {};
    this.blockers = s && s.blockers || {};
    this.pointsAdj = s && s.pointsAdj || {};
    this.reviewed = s && s.reviewed || {};
    this.subs = [];
    this.recompute();
  }
  Model.prototype.save = function () {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ openedAt: this.openedAt, extra: this.extra, decided: this.decided, ticks: this.ticks, prio: this.prio, blockers: this.blockers, pointsAdj: this.pointsAdj, reviewed: this.reviewed }));
    } catch (e) { /* private mode: the demo still works, it just forgets on reload */ }
  };
  Model.prototype.reset = function () {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    this.openedAt = Date.now(); this.extra = {}; this.decided = {}; this.ticks = {}; this.prio = {}; this.blockers = {}; this.pointsAdj = {}; this.reviewed = {};
    this.recompute(); this.emit();
  };
  Model.prototype.on = function (fn) { this.subs.push(fn); };
  Model.prototype.emit = function () { this.save(); for (var i = 0; i < this.subs.length; i++) this.subs[i](this); };

  Model.prototype.now = function () {
    return Math.min(HOLD_AT, D.OPEN_AT + (Date.now() - this.openedAt) / 60000);
  };
  Model.prototype.recompute = function () {
    this.sim = D.simulate(this.extra);
    this.lastNow = Math.floor(this.now());
    this.floor = D.floorState(this.sim, this.lastNow);
    this.fix = this.findFix();
  };
  // Called every few seconds; only recomputes when the demo minute changes.
  Model.prototype.tick = function () {
    if (Math.floor(this.now()) !== this.lastNow) { this.recompute(); this.emit(); return true; }
    return false;
  };

  /* ---------------------------------------------------- the fix finder --- */
  // For a carrier at risk, try giving each person who is not picking a block of
  // picking time from now, shortest first, and keep the smallest change that
  // gets every parcel packed in time. Nothing here is scripted: it reruns the
  // floor for every candidate.
  Model.prototype.findFix = function () {
    // Start at the next 5-minute slot with at least 5 minutes to get there.
    var self = this, now = Math.floor(this.now() / 5) * 5 + 10;
    var risk = D.CARRIERS.map(function (c) { return self.floor.carriers[c.key]; }).filter(function (c) { return c.late > 0; });
    if (!risk.length) return null;
    var target = risk[0];
    var nowMin = Math.floor(self.now());
    var packBy = target.carrier.packBy;
    // Office support first: taking someone off the container to save a van
    // only moves the problem. Students are never moved by the machine.
    var free = D.PEOPLE.filter(function (p) {
      return !p.student && p.speed > 0 && !D.isPicking(D.pickWindows(p, self.extra[p.id]), now);
    }).sort(function (a, b) { return (b.office ? 1 : 0) - (a.office ? 1 : 0); });
    // One person if one person is enough; two only when nobody can do it alone.
    var office = free.filter(function (p) { return p.office; }).map(function (p) { return [p]; });
    var others = free.filter(function (p) { return !p.office; }).map(function (p) { return [p]; });
    var pairs = [];
    for (var i = 0; i < free.length; i++) for (var j = i + 1; j < free.length; j++) pairs.push([free[i], free[j]]);
    function tryTeams(list) {
      var best = null;
      list.forEach(function (team) {
        [60, 90, 120, 150, 180].forEach(function (len) {
          var end = Math.min(now + len, packBy);
          if (end - now < 30 || (best && best.len <= end - now)) return;
          var ex = JSON.parse(JSON.stringify(self.extra));
          team.forEach(function (p) { (ex[p.id] = ex[p.id] || []).push([now, end]); });
          var f = D.floorState(D.simulate(ex), nowMin);
          // In time with five minutes to spare, not to the minute.
          var ok = D.CARRIERS.every(function (c) { return f.carriers[c.key].late === 0 && (f.carriers[c.key].last <= c.packBy - 5 || nowMin >= c.at); });
          if (ok) best = { team: team, from: now, to: end, len: end - now, last: f.carriers[target.carrier.key].last };
        });
      });
      return best;
    }
    var best = tryTeams(office) || tryTeams(others) || tryTeams(pairs);
    if (!best) return { carrier: target.carrier, text: 'Nobody can be moved in time to save every ' + target.carrier.name + ' parcel. Ask ' + target.carrier.name + ' for a later collection, or send the overflow with DPD.' };
    var parts = best.team.map(function (p) {
      var cur = null; p.blocks.forEach(function (b) { if (now >= b[0] && now < b[1]) cur = b; });
      return '<b>' + p.name + '</b>' + (cur ? ' off ' + X.lc1(cur[2]) : '');
    });
    var names = best.team.map(function (p) { return p.name; }).join(' and ');
    return {
      carrier: target.carrier, person: best.team[0], team: best.team, names: names, from: best.from, to: best.to, last: best.last,
      text: 'Move ' + parts.join(' and ') + ' onto ' + target.carrier.name + ' picking from <b>' + D.hhmm(best.from) + ' to ' + D.hhmm(best.to) + '</b>. The last ' + target.carrier.name + ' parcel is then packed at ' + D.hhmm(best.last) + ', before ' + D.hhmm(packBy) + '.'
    };
  };
  Model.prototype.applyFix = function () {
    var f = this.fix, self = this; if (!f || !f.person) return;
    f.team.forEach(function (p) { (self.extra[p.id] = self.extra[p.id] || []).push([f.from, f.to]); });
    this.recompute(); this.emit();
    return f;
  };
  Model.prototype.undoMoves = function () { this.extra = {}; this.recompute(); this.emit(); };
  Model.prototype.moved = function () {
    var out = [], self = this;
    Object.keys(this.extra).forEach(function (id) { self.extra[id].forEach(function (w) { out.push({ p: D.BY_ID[id], from: w[0], to: w[1] }); }); });
    return out;
  };

  /* ------------------------------------------------------ sheets/points --- */
  Model.prototype.sheets = function () {
    var self = this, now = this.now(), out = {};
    D.PEOPLE.forEach(function (p) {
      out[p.id] = D.SHEETS[p.id].map(function (j, i) {
        var key = p.id + ':' + i;
        var done = key in self.ticks ? self.ticks[key] : (j[2] === 1 && j[0] <= now);
        return { key: key, t: j[0], title: j[1], done: !!done };
      });
    });
    return out;
  };
  Model.prototype.tickJob = function (key, v) { this.ticks[key] = v; this.emit(); };
  Model.prototype.points = function () {
    var out = {}, self = this;
    Object.keys(D.POINTS).forEach(function (k) { out[k] = D.POINTS[k] + (self.pointsAdj[k] || 0); });
    return out;
  };
  Model.prototype.givePoints = function (id, n) { this.pointsAdj[id] = (this.pointsAdj[id] || 0) + n; this.emit(); };

  /* ------------------------------------------------------- decisions --- */
  // Prepared cases waiting for a yes or no. The numbers are worked out from the
  // data at the moment the screen opens.
  Model.prototype.decisions = function () {
    var co2 = D.BY_SKU['FS-2CO2'], wm = D.BY_SKU['FS-1WM'];
    var co2Rate = X.dailyRate('FS-2CO2'), co2Need = Math.ceil(co2Rate * (D.SEA_LEAD_DAYS + 60) / 100) * 100;
    var risk = {}; X.riskRows().forEach(function (r) { risk[r.p.sku] = r; });
    co2Need = X.reorderQty(risk['FS-2CO2']);
    var wmNeed = X.reorderQty(risk['FS-1WM']);
    var list = [
      { id: 'po-co2', kind: 'Purchase', title: 'Reorder ' + X.num(co2Need) + ' × 2kg CO2 for FRD 016',
        why: Math.floor(X.cover(co2)) + ' days of stock left, nothing on order, and a sea order takes ~' + D.SEA_LEAD_DAYS + ' days door to door.',
        detail: ['Selling ' + co2Rate.toFixed(1) + ' a day (14-day pace)', X.num(X.free(co2)) + ' free to sell after open orders', 'Adds to FRD 016, still in production, so no extra freight', 'Bridge: 200 from the UK wholesaler until it lands'],
        value: co2Need * 11.4, by: 'Prepared by the stock controller' },
      { id: 'po-wm', kind: 'Purchase', title: 'UK top-up: ' + wmNeed + ' × 1L Water Mist',
        why: 'Only ' + X.num(X.free(wm)) + ' free to sell, about ' + Math.max(0, Math.floor(X.cover(wm))) + ' days, and it never ships by sea.',
        detail: ['Four weeks of cover at the current pace', 'Next-day from the UK supplier', 'Price held at last order'],
        value: wmNeed * 14.2, by: 'Prepared by the stock controller' },
      { id: 'price-foam', kind: 'Price', title: 'Amazon: 6L Foam from £34.99 to £36.49',
        why: 'Two main competitors moved up last week; we are now the cheapest by £3.10 and selling out faster than we restock.',
        detail: ['eBay price unchanged', 'Expected sales drop under 5% (last two rises)', 'About +£180 a month'],
        value: null, by: 'Prepared by e-commerce' },
      { id: 'refund-cab', kind: 'Refund', title: 'Refund £54.99 for a cabinet damaged in transit',
        why: 'Customer photos show a dented door. A carrier claim is ready to send alongside.',
        detail: ['Customer photos attached to the case', 'Carrier claim drafted, evidence attached', 'Within the refund limit agreed for damage in transit'],
        value: 54.99, by: 'Prepared by office support' },
      { id: 'guide-unload', kind: 'Safety', title: 'Approve the guide: container unloading by forklift',
        why: 'Today is a Container Day. The guide is written and reviewed; it needs a senior sign-off to go live.',
        detail: ['Pre-use forklift check included', 'Two-person rule for pallets over 500 kg', 'Students observe only'],
        value: null, by: 'Prepared by the warehouse lead' }
    ];
    var self = this;
    return list.map(function (d) { d.state = self.decided[d.id] || null; return d; });
  };
  Model.prototype.decide = function (id, v) { if (v) this.decided[id] = v; else delete this.decided[id]; this.emit(); };

  /* -------------------------------------------------------- blockers --- */
  Model.prototype.blockerList = function () {
    var self = this, out = [];
    D.CARRIERS.forEach(function (c) {
      var f = self.floor.carriers[c.key];
      if (f.late) out.push({ id: 'late-' + c.key, sev: 'high', title: c.name + ' collection at risk',
        why: f.late + ' ' + (f.late === 1 ? 'parcel' : 'parcels') + ' forecast after the ' + D.hhmm(c.packBy) + ' pack-by: the late container took two pickers off the floor and a Temu promotion doubled the parcels.',
        action: self.fix && self.fix.person ? { label: 'Move ' + self.fix.names, fn: 'fix' } : null, owner: 'Warehouse lead' });
    });
    var bat = D.BY_SKU['BAT-9V4'];
    out.push({ id: 'oos-9v', sev: 'med', title: 'Out of stock: Duracell 9V (4 pack)',
      why: bat.book + ' units on ' + D.ORDERS.filter(function (o) { return o.hold; }).length + ' orders on hold. UK top-up of 120 arrives tomorrow morning.',
      action: { label: 'Pause the listings', fn: 'ack' }, owner: 'E-commerce' });
    out.push({ id: 'feed-stock', sev: 'med', title: 'Stock levels feed is ' + Math.round(this.now() - (12 * 60 + 9)) + ' minutes old',
      why: 'The last file came in at 12:09 and the 13:00 one is late. Open orders and processed orders are on time; stock numbers are as of 12:09.',
      action: { label: 'Mark as chased', fn: 'ack' }, owner: 'Senior management' });
    return out.map(function (b) { b.state = self.blockers[b.id] || null; return b; });
  };
  Model.prototype.ackBlocker = function (id) { this.blockers[id] = 'ack'; this.emit(); };

  /* ------------------------------------------------- priorities (mine) --- */
  Model.prototype.priorities = function () {
    var self = this;
    return [
      { id: 'p1', title: 'Container day: FRD 014 counted and shelved by 15:30' },
      { id: 'p2', title: 'Sign off the Shopify launch checklist' },
      { id: 'p3', title: '1:1 with Sam: first month on placement' }
    ].map(function (p) { p.done = !!self.prio[p.id]; return p; });
  };
  Model.prototype.togglePrio = function (id) { this.prio[id] = !this.prio[id]; this.emit(); };

  /* ---------------------------------------------- photos to review --- */
  Model.prototype.reviews = function () {
    var self = this;
    return [
      { id: 'r1', who: 'Sam', job: 'Fire exit routes clear', at: '13:04', kind: 'exit' },
      { id: 'r2', who: 'Kai', job: 'Racking photos after unload', at: '11:52', kind: 'rack' },
      { id: 'r3', who: 'Maya', job: 'Packing bench stocked', at: '08:41', kind: 'bench' }
    ].map(function (r) { r.state = self.reviewed[r.id] || null; return r; });
  };
  Model.prototype.review = function (id, v) { this.reviewed[id] = v; this.emit(); };

  /* ------------------------------------------------ attention summary --- */
  Model.prototype.attention = function () {
    var out = [];
    this.blockerList().forEach(function (b) { if (!b.state) out.push({ title: b.title, why: b.why, sev: b.sev, kind: 'blocker' }); });
    this.decisions().forEach(function (d) { if (!d.state) out.push({ title: d.title, why: d.why, sev: 'dec', kind: 'decision' }); });
    return out;
  };

  /* ---------------------------------------------------- ask context --- */
  Model.prototype.ctx = function () {
    var self = this;
    return { now: Math.floor(this.now()), floor: this.floor, sim: this.sim, fix: this.fix, extra: this.extra, sheets: this.sheets(), points: this.points(), attention: function () { return self.attention(); } };
  };

  root.FCC_MODEL = Model;
})(typeof window !== 'undefined' ? window : globalThis);
