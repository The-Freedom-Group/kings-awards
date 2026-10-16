/* Freedom Command Centre — demo data and the packing-floor model.
 *
 * Everything here is SAMPLE data, generated from one fixed seed so the demo is
 * identical every time it is opened (it can be rehearsed). The shapes follow the
 * real Freedom Hub: Linnworks open-order / processed-order / stock-level feeds,
 * order views per person, carrier collections, workday sheets and points.
 * Names are invented; no real staff, customer or supplier data is in this file.
 *
 * The packing floor is not scripted. Orders are queued by collection time and
 * worked through minute by minute by whoever is rostered to pick, so every
 * "ready by" time on screen is the model's own forecast, and moving a person
 * changes it.
 */
(function (root) {
  'use strict';

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ------------------------------------------------------------ clock --- */
  // The demo day always opens at 13:20 and then runs in real time, so the
  // afternoon collections are still ahead whenever it is shown.
  var DAY_START = 8 * 60;           // 08:00
  var OPEN_AT = 13 * 60 + 20;       // 13:20
  var CUTOFF = 14 * 60;             // "order before 2pm" for same-day dispatch
  var DAY_END = 17 * 60 + 30;

  function hhmm(m) {
    m = Math.round(m);
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
  }

  /* --------------------------------------------------------- channels --- */
  // Mix follows the group's own 2026 channel plan: eBay first, then Temu.
  var CHANNELS = [
    { key: 'ebay', name: 'eBay', share: 0.56, trend: 0.00 },
    { key: 'temu', name: 'Temu', share: 0.20, trend: 0.06 },
    { key: 'amazon', name: 'Amazon', share: 0.10, trend: 0.38 },
    { key: 'shopify', name: 'Shopify', share: 0.06, trend: 0.12 },
    { key: 'tiktok', name: 'TikTok Shop', share: 0.05, trend: 0.64 },
    { key: 'onbuy', name: 'OnBuy', share: 0.03, trend: -0.05 }
  ];

  var CARRIERS = [
    { key: 'rm', name: 'Royal Mail', at: 15 * 60 + 30 },
    { key: 'yodel', name: 'Yodel', at: 16 * 60 },
    { key: 'evri', name: 'Evri', at: 16 * 60 + 30 },
    { key: 'dpd', name: 'DPD', at: 17 * 60 }
  ];

  /* --------------------------------------------------------- products --- */
  // rate = typical units a day across every channel. big = goes by DPD.
  // ch = the channels it is listed on (all when omitted).
  var P = [
    ['FS-1PWD', 'FIRESTORM 1kg ABC Powder Extinguisher', 'Extinguishers', 18.99, 1180, 23],
    ['FS-2PWD', 'FIRESTORM 2kg ABC Powder Extinguisher', 'Extinguishers', 24.99, 610, 9.5],
    ['FS-6PWD', 'FIRESTORM 6kg ABC Powder Extinguisher', 'Extinguishers', 42.99, 395, 5.2, { big: 1 }],
    ['FS-2CO2', 'FIRESTORM 2kg CO2 Extinguisher', 'Extinguishers', 44.95, 296, 12.8],
    ['FS-5CO2', 'FIRESTORM 5kg CO2 Extinguisher', 'Extinguishers', 79.99, 182, 2.8, { big: 1 }],
    ['FS-6FOAM', 'FIRESTORM 6L Foam Extinguisher', 'Extinguishers', 34.99, 505, 8.4],
    ['FS-2FOAM', 'FIRESTORM 2L Foam Extinguisher', 'Extinguishers', 24.99, 41, 4.6],
    ['FS-6WC', 'FIRESTORM 6L Wet Chemical Extinguisher', 'Extinguishers', 69.92, 148, 2.3],
    ['FS-1WM', 'FIRESTORM 1L Water Mist Extinguisher', 'Extinguishers', 29.99, 22, 3.7, { uk: 1 }],
    ['FS-9WAT', 'FIRESTORM 9L Water Extinguisher', 'Extinguishers', 39.99, 254, 1.7, { big: 1 }],
    ['CAR-1PWD', '1kg Car Extinguisher Kit with Bracket', 'Extinguishers', 21.99, 288, 4.9],
    ['FB-12', 'Fire Blanket 1.2m x 1.2m', 'Fire blankets', 9.99, 2080, 18.5],
    ['FB-18', 'Fire Blanket 1.8m x 1.2m', 'Fire blankets', 16.99, 214, 2.4],
    ['ST-DBL', 'Double Extinguisher Stand', 'Stands & cabinets', 24.99, 138, 3.1, { big: 1 }],
    ['CAB-SGL', 'Single Extinguisher Cabinet', 'Stands & cabinets', 54.99, 47, 1.3, { big: 1 }],
    ['ST-CHR', 'Chrome Single Extinguisher Stand', 'Stands & cabinets', 19.99, 262, 0.08, { big: 1 }],
    ['BRK-UNI', 'Universal Extinguisher Wall Bracket', 'Spares', 2.99, 3380, 15.2],
    ['SEAL-100', 'Anti-Tamper Seals (pack of 100)', 'Spares', 4.99, 1290, 5.4],
    ['TAG-50', 'Extinguisher Service Tags (pack of 50)', 'Spares', 6.99, 396, 1.9],
    ['SG-FEP', 'Fire Exit Sign, Photoluminescent', 'Safety signs', 3.49, 1790, 13.4],
    ['SG-CO2', 'CO2 Extinguisher ID Sign', 'Safety signs', 1.49, 2570, 7.1],
    ['SG-FAN', 'Fire Action Notice', 'Safety signs', 2.99, 885, 6.2],
    ['SG-NSA5', 'No Smoking Sign, A5', 'Safety signs', 1.29, 910, 0.12],
    ['SA-10Y', '10-Year Smoke Alarm', 'Alarms', 14.99, 402, 7.4],
    ['SA-HEAT', 'Heat Alarm for Kitchens', 'Alarms', 17.99, 118, 2.5],
    ['CO-ALM', 'Carbon Monoxide Alarm', 'Alarms', 19.99, 24, 4.1],
    ['BAT-AA24', 'Energizer AA Batteries (24 pack)', 'Batteries', 9.99, 690, 9.1, { ch: ['ebay', 'amazon', 'shopify', 'onbuy', 'tiktok'] }],
    ['BAT-9V4', 'Duracell 9V Batteries (4 pack)', 'Batteries', 8.99, 0, 3.6, { ch: ['ebay', 'amazon', 'shopify', 'onbuy', 'tiktok'] }],
    ['FA-BS10', 'First Aid Kit, BS 8599 Medium', 'First aid', 22.99, 158, 3.0],
    ['BND-OFF', 'The Commercial Office Kit', 'Bundles', 84.0, 64, 1.9, { ch: ['ebay', 'shopify', 'amazon'], big: 1 }],
    ['BND-KIT', 'The Commercial Kitchen Kit', 'Bundles', 98.5, 41, 1.2, { ch: ['ebay', 'shopify', 'amazon'], big: 1 }],
    ['BND-HOME', 'Home Fire Safety Bundle', 'Bundles', 39.99, 133, 3.8, { ch: ['ebay', 'shopify', 'amazon', 'tiktok'] }],
    ['EXT-CVR', 'Outdoor Extinguisher Cover', 'Spares', 12.99, 327, 0.9]
  ];

  var PRODUCTS = P.map(function (r) {
    var o = r[6] || {};
    // uk: bought next-day from UK wholesalers rather than shipped from China.
    var uk = !!o.uk || ['Alarms', 'Batteries', 'First aid', 'Safety signs'].indexOf(r[2]) >= 0;
    return { sku: r[0], name: r[1], cat: r[2], price: r[3], stock: r[4], rate: r[5], big: !!o.big, ch: o.ch || null, uk: uk, book: 0, incoming: [] };
  });
  var BY_SKU = {};
  PRODUCTS.forEach(function (p) { BY_SKU[p.sku] = p; });

  /* ------------------------------------------------- inbound (Freight) --- */
  var CONTAINERS = [
    { ref: 'FRD 015', status: 'On the water', etaDays: 9, port: 'Felixstowe',
      lines: { 'FS-1PWD': 6000, 'FS-6FOAM': 1500, 'FS-2FOAM': 1200, 'FB-12': 4000, 'BRK-UNI': 5000 } },
    { ref: 'FRD 016', status: 'In production', etaDays: 52, port: 'Felixstowe',
      lines: { 'FS-2PWD': 3000, 'FS-6PWD': 1200, 'FS-6WC': 600, 'CAR-1PWD': 1500 } }
  ];
  // Fast UK top-ups (wholesaler, next day) for the lines that never ship by sea.
  var UK_DELIVERIES = [{ ref: 'UK top-up', etaDays: 1, lines: { 'BAT-9V4': 120 } }];
  CONTAINERS.concat(UK_DELIVERIES).forEach(function (c) {
    Object.keys(c.lines).forEach(function (sku) {
      BY_SKU[sku].incoming.push({ ref: c.ref, qty: c.lines[sku], etaDays: c.etaDays });
    });
  });
  var SEA_LEAD_DAYS = 100;   // order to warehouse, door to door (Freedom Freight)

  /* -------------------------------------------------------- history --- */
  // 28 full days before today plus today. Day 0 = 27 days ago, day 27 =
  // yesterday. The weekday pattern follows the real calendar, so "yesterday"
  // and "Monday" mean what they say.
  var WEEKDAY = [0.58, 1.34, 1.12, 1.02, 0.98, 0.9, 0.71]; // Sun..Sat
  var R = rng(20261103);
  var today = new Date(); today.setHours(12, 0, 0, 0);
  var DAYS = [];
  for (var d = 0; d < 28; d++) {
    var dt = new Date(today.getTime() - (28 - d) * 864e5);
    DAYS.push({ date: dt, wd: dt.getDay(), units: {}, rev: {}, orders: {}, bySku: {} });
  }
  function chShare(ch, d) { return ch.share * (1 + ch.trend * (d / 27 - 0.5)); }
  var SCALE = 0.62;
  DAYS.forEach(function (day, di) {
    CHANNELS.forEach(function (c) { day.units[c.key] = 0; day.rev[c.key] = 0; day.orders[c.key] = 0; });
    PRODUCTS.forEach(function (p) {
      var chans = CHANNELS.filter(function (c) { return !p.ch || p.ch.indexOf(c.key) >= 0; });
      var tot = chans.reduce(function (s, c) { return s + chShare(c, di); }, 0);
      day.bySku[p.sku] = {};
      chans.forEach(function (c) {
        var mean = p.rate * SCALE * WEEKDAY[day.wd] * chShare(c, di) / tot * (0.78 + R() * 0.44);
        var u = Math.floor(mean + R());
        if (p.sku === 'BAT-9V4' && di >= 24) u = 0;       // ran out four days ago
        day.bySku[p.sku][c.key] = u;
        day.units[c.key] += u;
        day.rev[c.key] += u * p.price;
      });
    });
    CHANNELS.forEach(function (c) { day.orders[c.key] = Math.round(day.units[c.key] / 1.42); });
  });

  /* -------------------------------------------------------- returns --- */
  var RETURN_REASONS = {
    'CAB-SGL': [['Damaged in transit', 0.11]],
    'FS-6PWD': [['Damaged in transit', 0.025], ['Gauge reading low on arrival', 0.012]],
    'FS-1PWD': [['Gauge reading low on arrival', 0.006], ['Changed mind', 0.004]],
    'FS-2CO2': [['Ordered wrong size', 0.018]],
    'SA-10Y': [['Faulty, chirping', 0.014]],
    'BND-KIT': [['Item missing from bundle', 0.03]],
    'FB-12': [['Changed mind', 0.005]],
    '*': [['Changed mind', 0.004], ['Ordered wrong item', 0.003]]
  };
  var RETURNS = [];
  DAYS.forEach(function (day, di) {
    PRODUCTS.forEach(function (p) {
      var units = 0; for (var k in day.bySku[p.sku]) units += day.bySku[p.sku][k];
      (RETURN_REASONS[p.sku] || RETURN_REASONS['*']).forEach(function (rr) {
        var n = Math.floor(units * rr[1] + R());
        for (var i = 0; i < n; i++) RETURNS.push({ day: di, sku: p.sku, reason: rr[0] });
      });
    });
  });

  /* --------------------------------------------------------- people --- */
  // speed: share of a full picker. Blocks are what the day plan has them on.
  var PEOPLE = [
    { id: 'aiden', view: ['dpd'], name: 'Aiden', role: 'Warehouse lead', speed: 0.85, start: '08:00', end: '17:30',
      blocks: [[480, 540, 'Open up, feeds check, brief'], [540, 690, 'DPD and big-item picking', 'pick'], [690, 720, 'Goods-in sign-off'], [720, 750, 'Lunch'], [750, 1050, 'DPD and big-item picking', 'pick']] },
    { id: 'maya', view: ['yodel', 'rm'], name: 'Maya', role: 'Pick and pack', speed: 1.0, start: '08:30', end: '17:00',
      blocks: [[510, 750, 'eBay small-parcel picking', 'pick'], [750, 780, 'Lunch'], [780, 1020, 'eBay small-parcel picking', 'pick']] },
    { id: 'kai', view: ['yodel', 'dpd'], name: 'Kai', role: 'Pick and pack', speed: 1.0, start: '08:30', end: '17:00',
      blocks: [[510, 750, 'Temu and Amazon picking', 'pick'], [750, 780, 'Lunch'], [780, 930, 'Unloading container FRD 014'], [930, 1020, 'Temu and Amazon picking', 'pick']] },
    { id: 'owen', view: ['evri'], name: 'Owen', role: 'Dispatch', speed: 0.9, start: '09:00', end: '17:30',
      blocks: [[540, 600, 'Labels and manifests'], [600, 750, 'Evri picking', 'pick'], [750, 780, 'Lunch'], [780, 930, 'Unloading container FRD 014'], [930, 1050, 'Pack check and dispatch', 'pick']] },
    { id: 'sam', view: ['rm'], name: 'Sam', role: 'T Level student', speed: 0.6, start: '09:00', end: '15:00', student: true,
      blocks: [[540, 600, 'Training on pick accuracy'], [600, 750, 'Royal Mail picking', 'pick'], [750, 780, 'Lunch'], [780, 900, 'Royal Mail picking', 'pick']] },
    { id: 'leah', view: ['evri'], name: 'Leah', role: 'Office support', speed: 0.8, start: '09:00', end: '17:30', office: true,
      blocks: [[540, 720, 'Customer messages'], [720, 750, 'Lunch'], [750, 900, 'Amazon listings for the new range'], [900, 1050, 'Returns and claims']] },
    { id: 'ravi', view: [], name: 'Ravi', role: 'E-commerce placement', speed: 0, start: '09:30', end: '15:30', office: true,
      blocks: [[570, 720, 'Product photos of the 6L foam'], [720, 750, 'Lunch'], [750, 930, 'Shopify collections']] }
  ];
  var BY_ID = {}; PEOPLE.forEach(function (p) { BY_ID[p.id] = p; });

  /* ------------------------------------------------- workday sheets --- */
  // [time, job, done-by-demo-open?]. Anything not done before its time is late.
  var SHEETS = {
    aiden: [[480, 'Open up and alarm off', 1], [485, 'Check the three Linnworks feeds are on time', 1], [500, 'Morning brief with the floor', 1], [690, 'Sign off goods-in count', 1], [960, 'Collections check: every carrier ready', 0], [1040, 'Lock up checklist', 0]],
    maya: [[510, 'Packing bench stocked', 1], [600, 'Clear the eBay priority view', 1], [840, 'Mid-afternoon bench tidy', 0], [1010, 'Hand over open orders', 0]],
    kai: [[510, 'Forklift pre-use check', 1], [600, 'Container unload: count by pallet', 1], [700, 'Racking photos after unload', 1], [990, 'Empty pallets out', 0]],
    owen: [[540, 'Print first carrier manifests', 1], [700, 'Damaged stock to quarantine', 0], [930, 'Evri manifest', 0], [1000, 'DPD manifest and pallet wrap', 0]],
    sam: [[540, 'Read today’s pick-accuracy guide', 1], [660, 'Fire exit routes clear (photo)', 0], [780, 'Log learning hours', 1], [890, 'Reflection: one thing I learned', 0]],
    leah: [[540, 'Reply to overnight messages', 1], [660, 'Chase two open carrier claims', 1], [900, 'Book in returns', 0], [1020, 'Day summary to the boss', 0]],
    ravi: [[570, 'Shoot 6L foam: six angles', 1], [760, 'Upload and alt text', 0], [900, 'Collections: alarms and detection', 0]]
  };
  var POINTS = { aiden: 412, maya: 468, kai: 391, owen: 344, sam: 287, leah: 455, ravi: 302 };

  /* ----------------------------------------------- today's open orders --- */
  var RO = rng(31102026);
  function pickProduct() {
    var tot = 0; PRODUCTS.forEach(function (p) { if (p.stock > 0 || p.sku === 'BAT-9V4') tot += p.rate; });
    var x = RO() * tot;
    for (var i = 0; i < PRODUCTS.length; i++) {
      var p = PRODUCTS[i]; if (!(p.stock > 0 || p.sku === 'BAT-9V4')) continue;
      x -= p.rate; if (x <= 0) return p;
    }
    return PRODUCTS[0];
  }
  function pickChannel(p) {
    var cs = CHANNELS.filter(function (c) { return !p.ch || p.ch.indexOf(c.key) >= 0; });
    var tot = cs.reduce(function (s, c) { return s + chShare(c, 27); }, 0), x = RO() * tot;
    for (var i = 0; i < cs.length; i++) { x -= chShare(cs[i], 27); if (x <= 0) return cs[i].key; }
    return cs[0].key;
  }
  var ORDERS = [];
  var PROMO_RATE = 0.36;
  var orderNo = 4418230;
  function makeOrder(arrive, overnight, force) {
    force = force || {};
    var first = pickProduct();
    var lines = [{ sku: first.sku, qty: RO() < 0.18 ? 2 : 1 }];
    var n = RO() < 0.27 ? (RO() < 0.3 ? 3 : 2) : 1;
    for (var i = 1; i < n; i++) { var q = pickProduct(); if (q.sku !== first.sku) lines.push({ sku: q.sku, qty: 1 }); }
    var big = lines.some(function (l) { return BY_SKU[l.sku].big; });
    var items = lines.reduce(function (s, l) { return s + l.qty; }, 0);
    var carrier;
    if (big) carrier = 'dpd';
    else {
      var x = RO();
      carrier = items === 1 && BY_SKU[first.sku].cat === 'Safety signs' ? 'rm' : x < 0.24 ? 'rm' : x < 0.58 ? 'yodel' : 'evri';
    }
    if (force.carrier && !big) carrier = force.carrier;
    var ch = force.channel && (!first.ch || first.ch.indexOf(force.channel) >= 0) ? force.channel : pickChannel(first);
    var hold = lines.some(function (l) { return l.sku === 'BAT-9V4'; });
    ORDERS.push({
      id: String(orderNo++), channel: ch, carrier: carrier, lines: lines, items: items, arrive: arrive,
      overnight: !!overnight, hold: hold, promo: !!force.promo,
      value: lines.reduce(function (s, l) { return s + l.qty * BY_SKU[l.sku].price; }, 0),
      work: 5.5 + 2.2 * items + (big ? 4 : 0) + (lines.length > 1 ? 2 : 0)
    });
  }
  // Overnight: everything that came in after yesterday's 2pm cut-off.
  for (var o = 0; o < 72; o++) makeOrder(DAY_START - 1, true);
  // Today until the cut-off: a steady trickle, heavier mid-morning.
  for (var t = DAY_START; t < CUTOFF; t += 1) {
    var per = t < 600 ? 0.075 : t < 720 ? 0.11 : 0.085;
    if (RO() < per) makeOrder(t, false);
    // Temu lunchtime promotion on the 1kg and the blanket: Temu parcels go by Evri.
    if (t >= 720 && t < 840 && RO() < PROMO_RATE) makeOrder(t, false, { channel: 'temu', carrier: 'evri', promo: true });
  }
  ORDERS.forEach(function (ord) { if (ord.hold) return; ord.lines.forEach(function (l) { BY_SKU[l.sku].book += l.qty; }); });
  BY_SKU['BAT-9V4'].book = ORDERS.filter(function (x) { return x.hold; }).reduce(function (s, x) { return s + x.items; }, 0);

  /* ------------------------------------------------------- the floor --- */
  // assign: { personId: [[from, to], ...] } extra picking windows added by a
  // manager on top of the day plan.
  function pickWindows(person, extra) {
    var w = person.blocks.filter(function (b) { return b[3] === 'pick'; }).map(function (b) { return [b[0], b[1]]; });
    (extra || []).forEach(function (x) { w.push(x); });
    return w;
  }
  function isPicking(windows, t) { for (var i = 0; i < windows.length; i++) if (t >= windows[i][0] && t < windows[i][1]) return true; return false; }

  // Parcels must be packed this long before the van, for manifests and loading.
  var PACK_BUFFER = 20;
  var COLL = {}; CARRIERS.forEach(function (c) { COLL[c.key] = c.at; c.packBy = c.at - PACK_BUFFER; });

  function viewOf(p, views) { return (views && views[p.id]) || p.view; }

  // extra: { personId: [[from, to]] } picking time added by a manager.
  // extraViews: { personId: ['evri'] } a changed order view.
  function simulate(extra, extraViews) {
    extra = extra || {};
    var queue = ORDERS.filter(function (x) { return !x.hold; }).map(function (x) { return { o: x, start: null, done: null, by: null }; });
    queue.sort(function (a, b) { return (COLL[a.o.carrier] - COLL[b.o.carrier]) || (a.o.arrive - b.o.arrive); });
    var workers = PEOPLE.filter(function (p) { return p.speed > 0; }).map(function (p) {
      return { p: p, w: pickWindows(p, extra[p.id]), job: null, left: 0 };
    });
    for (var t = DAY_START; t < 20 * 60; t++) {
      for (var i = 0; i < workers.length; i++) {
        var wk = workers[i];
        if (!wk.job) {
          if (!isPicking(wk.w, t)) continue;
          // Their own order view first; once it is empty they help out on
          // whatever is due soonest (the Hub's "Helping out").
          var pick = null;
          for (var j = 0; j < queue.length && !pick; j++) {
            var q = queue[j];
            if (q.start === null && q.o.arrive <= t && viewOf(wk.p, extraViews).indexOf(q.o.carrier) >= 0) pick = q;
          }
          for (j = 0; j < queue.length && !pick; j++) {
            if (queue[j].start === null && queue[j].o.arrive <= t) pick = queue[j];
          }
          if (pick) { pick.start = t; pick.by = wk.p.id; wk.job = pick; wk.left = pick.o.work; }
          if (!wk.job) continue;
        }
        // A job in hand is finished even if the block ends; nobody walks off mid-parcel.
        var sp = wk.p.speed * (isPicking(wk.w, t) ? 1 : 0.85);
        wk.left -= sp;
        if (wk.left <= 0) { wk.job.done = t + 1; wk.job = null; }
      }
    }
    var byId = {}; queue.forEach(function (q) { byId[q.o.id] = q; });
    return { rows: queue, byId: byId };
  }

  function floorState(sim, now) {
    var st = { waiting: 0, picking: 0, ready: 0, total: 0, carriers: {}, people: {} };
    CARRIERS.forEach(function (c) { st.carriers[c.key] = { carrier: c, total: 0, ready: 0, last: 0, late: 0, expected: 0 }; });
    PEOPLE.forEach(function (p) { st.people[p.id] = { done: 0, now: null, units: 0 }; });
    sim.rows.forEach(function (q) {
      var c = st.carriers[q.o.carrier];
      c.total++; st.total++;
      if (q.o.arrive > now) c.expected++;
      if (q.done !== null && q.done <= now) { c.ready++; st.ready++; if (q.by) { st.people[q.by].done++; st.people[q.by].units += q.o.items; } }
      else if (q.start !== null && q.start <= now) { st.picking++; st.people[q.by].now = q.o; }
      else st.waiting++;
      var fin = q.done === null ? 24 * 60 : q.done;
      if (fin > c.last) c.last = fin;
      if (fin > c.carrier.packBy) c.late++;
    });
    return st;
  }

  root.FCC_DATA = {
    hhmm: hhmm, DAY_START: DAY_START, OPEN_AT: OPEN_AT, CUTOFF: CUTOFF, DAY_END: DAY_END,
    CHANNELS: CHANNELS, CARRIERS: CARRIERS, PRODUCTS: PRODUCTS, BY_SKU: BY_SKU, DAYS: DAYS,
    RETURNS: RETURNS, CONTAINERS: CONTAINERS, SEA_LEAD_DAYS: SEA_LEAD_DAYS, PEOPLE: PEOPLE, BY_ID: BY_ID,
    SHEETS: SHEETS, PACK_BUFFER: PACK_BUFFER, POINTS: POINTS, ORDERS: ORDERS, simulate: simulate, floorState: floorState,
    pickWindows: pickWindows, isPicking: isPicking, today: today
  };
})(typeof window !== 'undefined' ? window : globalThis);
