/* Freedom Command Centre — the screens.
 *
 * Three views over one model: Founder (what needs me today), Team (who is on
 * what, and what to move), Ask (questions answered from the data). Every
 * number is read from the model at render time; nothing on screen is typed in.
 */
(function () {
  'use strict';
  var D = window.FCC_DATA, X = window.FCC_ASK, M = new window.FCC_MODEL();
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var esc = X.esc, num = X.num, money = X.money, hhmm = D.hhmm;
  var params = new URLSearchParams(location.search);
  var EMBED = params.get('embed') === '1';
  if (EMBED) document.documentElement.classList.add('embed');

  var view = 'founder';
  var open = {};            // decision cases the viewer has expanded
  var convo = [];           // Ask: the conversation so far (kept across views)
  var VIEWS = {
    founder: { kicker: 'Founder dashboard', title: 'Today' },
    team: { kicker: 'Staff command view', title: 'The floor' },
    ask: { kicker: 'AI · Business intelligence', title: 'Ask the business' }
  };

  function ic(id, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  function pctTxt(v) { return '<span class="' + (v >= 0 ? 'up' : 'down') + '">' + (v >= 0 ? '▲ ' : '▼ ') + Math.abs(Math.round(v * 100)) + '%</span>'; }
  function initials(n) { return n.slice(0, 1); }
  function greeting(now) { return now < 12 * 60 ? 'Good morning' : now < 17 * 60 ? 'Good afternoon' : 'Good evening'; }

  /* ------------------------------------------------------------ header --- */
  var DAYN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function paintClock() {
    var now = M.now();
    $('#clock').textContent = hhmm(Math.floor(now));
    $('#clock').setAttribute('datetime', hhmm(Math.floor(now)));
    var d = new Date(); $('#date').textContent = DAYN[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()];
  }
  function paintFeeds() {
    var now = M.now();
    var oo = Math.max(1, Math.round(now - Math.floor((now - 2) / 5) * 5));
    var stock = Math.round(now - (12 * 60 + 9));
    $('#feeds').innerHTML =
      '<span class="feed ok" title="Linnworks open orders, every 5 minutes">' + ic('check') + 'Open orders · ' + oo + ' min</span>' +
      '<span class="feed ok" title="Linnworks processed orders, daily at 06:00">' + ic('check') + 'Sales · 06:00</span>' +
      '<span class="feed warn" title="Linnworks stock levels, hourly: the 12:00 file is late">' + ic('alert') + 'Stock levels · ' + stock + ' min</span>';
  }
  function paintCounts() {
    var a = M.attention().length;
    var t = M.reviews().filter(function (r) { return !r.state; }).length + (M.fix && M.fix.person ? 1 : 0);
    document.querySelectorAll('[data-count="founder"]').forEach(function (el) { el.textContent = a || ''; });
    document.querySelectorAll('[data-count="team"]').forEach(function (el) { el.textContent = t || ''; });
  }

  /* ----------------------------------------------------------- shared --- */
  function carrierRows(compact) {
    var now = M.lastNow;
    return D.CARRIERS.map(function (c) {
      var f = M.floor.carriers[c.key];
      var gone = now >= c.at;
      var state = f.late ? 'bad' : 'ok';
      var pctReady = f.total ? f.ready / f.total : 1;
      var right = gone ? (f.late ? '<b class="bad">Gone</b><span class="bad">' + f.late + ' missed</span>' : '<b class="ok">Collected</b>') : f.late
        ? '<b class="bad">' + hhmm(f.last) + '</b><span class="bad">' + f.late + ' late</span>'
        : '<b>' + (f.ready === f.total ? 'Ready' : hhmm(f.last)) + '</b><span class="ok">' + (f.ready === f.total ? 'all packed' : 'in time') + '</span>';
      return '<div class="car"><span class="car-ic ' + state + '">' + ic(f.late && !gone ? 'alert' : 'truck') + '</span>' +
        '<div><div class="car-n">' + c.name + '<span>van ' + hhmm(c.at) + (compact ? '' : ' · pack by ' + hhmm(c.packBy)) + '</span></div>' +
        '<div class="bar ' + (f.late && !gone ? 'bad' : 'ok') + '" role="img" aria-label="' + f.ready + ' of ' + f.total + ' packed"><i style="width:' + Math.round(pctReady * 100) + '%"></i></div>' +
        '<div class="faint" style="font-size:12px;margin-top:5px">' + f.ready + ' of ' + f.total + ' packed' + (f.expected ? ' · ' + f.expected + ' more expected' : '') + '</div></div>' +
        '<div class="car-r">' + right + '</div></div>';
    }).join('');
  }

  function sparkSvg(values, opts) {
    opts = opts || {};
    var w = 240, h = opts.h || 34, max = Math.max.apply(null, values) || 1, min = opts.zero ? 0 : Math.min.apply(null, values) * 0.85;
    var pts = values.map(function (v, i) { return [i / (values.length - 1) * w, h - 2 - (v - min) / (max - min || 1) * (h - 6)]; });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('');
    var mark = '';
    if (opts.mark) {
      var x0 = opts.mark[0] / (values.length - 1) * w, x1 = opts.mark[1] / (values.length - 1) * w;
      mark = '<rect x="' + (x0 - 3) + '" y="0" width="' + Math.max(6, x1 - x0 + 6) + '" height="' + h + '" fill="rgba(255,45,141,.12)" rx="3"/>';
    }
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true" style="stroke:none">' + mark +
      '<path d="' + line + 'L' + w + ' ' + h + 'L0 ' + h + 'Z" fill="rgba(255,45,141,.1)"/>' +
      '<path d="' + line + '" fill="none" stroke="#ff2d8d" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>';
  }

  var CH_COL = { ebay: '#ff2d8d', temu: '#ff74b8', amazon: '#c60f6e', shopify: '#ffc2de', tiktok: '#8f5bff', onbuy: '#6cb4ff' };
  function channelChart() {
    var days = D.DAYS.slice(14), W = 400, H = 150, pad = 34, bw = (W - pad) / days.length;
    var max = Math.max.apply(null, days.map(function (d) { return D.CHANNELS.reduce(function (s, c) { return s + d.rev[c.key]; }, 0); }));
    var top = Math.ceil(max / 1000) * 1000;
    var out = '<svg class="chart" viewBox="0 0 ' + W + ' ' + (H + 22) + '" role="img" aria-label="Sales by channel, last 14 days" style="stroke:none">';
    [0, 0.5, 1].forEach(function (g) { var y = H - g * (H - 8); out += '<line x1="' + pad + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="rgba(255,255,255,.07)" stroke-width="1"/><text x="' + (pad - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + (g ? '£' + (top * g / 1000).toFixed(g === 1 ? 0 : 1).replace(/\.0$/, '') + 'k' : '0') + '</text>'; });
    days.forEach(function (d, i) {
      var y = H, x = pad + i * bw + 3;
      D.CHANNELS.forEach(function (c) {
        var hgt = d.rev[c.key] / top * (H - 8);
        y -= hgt;
        out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw - 6).toFixed(1) + '" height="' + Math.max(0, hgt - 1).toFixed(1) + '" fill="' + CH_COL[c.key] + '" rx="1.5"><title>' + c.name + ' · ' + money(d.rev[c.key]) + '</title></rect>';
      });
      if (i % 2 === 0 || i === days.length - 1) out += '<text x="' + (x + (bw - 6) / 2) + '" y="' + (H + 16) + '" text-anchor="middle">' + d.date.getDate() + '</text>';
    });
    out += '</svg><div class="legend">' + D.CHANNELS.map(function (c) { return '<span><i style="background:' + CH_COL[c.key] + '"></i>' + c.name + '</span>'; }).join('') + '</div>';
    return out;
  }

  /* ---------------------------------------------------------- founder --- */
  function renderFounder() {
    var now = M.lastNow, f = M.floor;
    var att = M.attention();
    var risk = D.CARRIERS.filter(function (c) { return f.carriers[c.key].late && now < c.at; });
    var pending = M.decisions().filter(function (d) { return !d.state; });
    var y = D.DAYS[27], yWeek = D.DAYS[20];
    var yRev = X.totals([y]).rev, ywRev = X.totals([yWeek]).rev;
    var w7 = X.totals(D.DAYS.slice(21)).rev, p7 = X.totals(D.DAYS.slice(14, 21)).rev;
    var daily = D.DAYS.map(function (d) { return X.totals([d]).rev; });
    var rows = X.riskRows(), soon = rows.filter(function (r) { return r.soon; }), sea = rows.filter(function (r) { return r.orderNow && !r.p.uk && !r.soon; });
    var oos = soon.filter(function (r) { return r.cover < 1; }).length;
    var lastAll = Math.max.apply(null, D.CARRIERS.map(function (c) { return f.carriers[c.key].last; }));

    var sum = [];
    if (risk.length) sum.push('<b>' + risk.map(function (c) { return c.name; }).join(' and ') + ' ' + (risk.length > 1 ? 'are' : 'is') + ' at risk</b> of missing the van');
    if (pending.length) sum.push('<b>' + pending.length + ' ' + (pending.length === 1 ? 'decision waits' : 'decisions wait') + '</b> for a yes or no');
    var otherIssues = M.blockerList().filter(function (b) { return !b.state && b.id.indexOf('late-') !== 0; }).length;
    if (otherIssues) sum.push('<b>' + otherIssues + ' other ' + (otherIssues === 1 ? 'issue is' : 'issues are') + '</b> flagged');
    var line = sum.length ? (sum.length > 1 ? sum.slice(0, -1).join(', ') + ' and ' + sum[sum.length - 1] : sum[0]) + '.' : 'Nothing needs you. Every van is on track and every decision is made.';

    var html = '<section class="hello fadein"><div><h2>' + greeting(now) + ', <em>Tom.</em></h2><p>' + line.charAt(0).toUpperCase() + line.slice(1) + '</p></div></section>';

    html += '<section class="kpis">' +
      '<div class="panel kpi"><div class="k">' + ic('truck') + 'Out today</div><div class="v num">' + f.ready + '<small>/ ' + f.total + '</small></div>' +
        '<div class="s">' + (risk.length ? '<span class="chip bad">' + ic('alert') + risk.length + ' van at risk</span>' : '<span class="chip ok">' + ic('check') + 'All vans on track</span>') + '</div>' +
        '<div class="bar ' + (risk.length ? 'bad' : 'ok') + '"><i style="width:' + Math.round(f.ready / f.total * 100) + '%"></i></div></div>' +
      '<div class="panel kpi"><div class="k">' + ic('box') + 'Yesterday</div><div class="v num">' + money(yRev) + '</div>' +
        '<div class="s">' + pctTxt((yRev - ywRev) / ywRev) + ' on last ' + DAYN[yWeek.wd] + '</div></div>' +
      '<div class="panel kpi"><div class="k">' + ic('feed') + 'Last 7 days</div><div class="v num">' + money(w7) + '</div>' +
        '<div class="s">' + pctTxt((w7 - p7) / p7) + ' on the week before</div>' + sparkSvg(daily, { mark: [21, 27] }) + '</div>' +
      '<div class="panel kpi"><div class="k">' + ic('alert') + 'Stock to act on</div><div class="v num">' + (soon.length + sea.length) + '<small>products</small></div>' +
        '<div class="s">' + (oos ? '<span class="chip warn">' + oos + ' out</span>' : '') + '<span>' + soon.length + ' within 30 days · ' + sea.length + ' need a sea order</span></div></div>' +
      '</section>';

    // Needs you: blockers first, then decisions waiting, then decided ones.
    var needs = '';
    M.blockerList().forEach(function (b) {
      var gone = b.id.indexOf('late-') === 0 && false;
      if (b.state) {
        needs += '<div class="item decided"><span class="item-ic ok">' + ic('check') + '</span><div><div class="done-row"><span>' + esc(b.title) + ' · <b>noted</b></span><button class="undo" data-act="unack" data-id="' + b.id + '">Undo</button></div></div></div>';
        return;
      }
      var act = b.action ? (b.action.fn === 'fix'
        ? '<button class="btn primary sm" data-act="fix">' + ic('arrow') + esc(b.action.label) + ' to ' + M.fix.carrier.name + '</button><button class="btn sm" data-go="team">See the floor</button>'
        : '<button class="btn sm" data-act="ack" data-id="' + b.id + '">' + ic('check') + esc(b.action.label) + '</button>') : '';
      needs += '<div class="item"><span class="item-ic ' + (b.sev === 'high' ? 'bad' : 'warn') + '">' + ic('alert') + '</span><div>' +
        '<h3>' + esc(b.title) + (b.sev === 'high' ? '<span class="chip bad">Urgent</span>' : '') + '</h3><p>' + esc(b.why) + '</p>' +
        (b.action && b.action.fn === 'fix' && M.fix ? '<div class="fix-inline">' + ic('ask') + ' ' + M.fix.text + '</div>' : '') +
        '<div class="meta">Owner: ' + esc(b.owner) + '</div><div class="acts">' + act + '</div></div></div>';
    });
    var moves = M.moved();
    if (moves.length && !risk.length) {
      needs += '<div class="item decided"><span class="item-ic ok">' + ic('check') + '</span><div><div class="done-row"><span>' + moves.map(function (m) { return m.p.name + ' moved to Evri picking ' + hhmm(m.from) + '–' + hhmm(m.to); }).join('; ') + ' · <b>every van on track</b></span><button class="undo" data-act="unmove">Undo</button></div></div></div>';
    }
    var decs = M.decisions();
    decs.filter(function (d) { return !d.state; }).concat(decs.filter(function (d) { return d.state; })).forEach(function (d) {
      if (d.state) {
        needs += '<div class="item decided"><span class="item-ic ' + (d.state === 'yes' ? 'ok' : '') + '">' + ic(d.state === 'yes' ? 'check' : 'x') + '</span><div><div class="done-row"><span>' + esc(d.title) + ' · <b>' + (d.state === 'yes' ? 'approved' : 'declined') + '</b></span><button class="undo" data-act="undecide" data-id="' + d.id + '">Undo</button></div></div></div>';
        return;
      }
      var isOpen = !!open[d.id];
      needs += '<div class="item"><span class="item-ic pink">' + ic(d.kind === 'Purchase' ? 'box' : d.kind === 'Safety' ? 'check' : d.kind === 'Price' ? 'feed' : 'arrow') + '</span><div>' +
        '<h3>' + esc(d.title) + '<span class="chip">' + esc(d.kind) + '</span></h3><p>' + esc(d.why) + '</p>' +
        (isOpen ? '<div class="case fadein"><ul>' + d.detail.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><div class="val">' + esc(d.by) + (d.value ? ' · about ' + money(d.value) : '') + '</div></div>' : '') +
        '<div class="acts"><button class="btn sm approve" data-act="decide" data-id="' + d.id + '" data-v="yes">' + ic('check') + 'Approve</button>' +
        '<button class="btn sm" data-act="decide" data-id="' + d.id + '" data-v="no">' + ic('x') + 'Decline</button>' +
        '<button class="btn sm" data-act="case" data-id="' + d.id + '" aria-expanded="' + isOpen + '">' + (isOpen ? 'Hide the case' : 'See the case') + '</button></div></div></div>';
    });

    var prios = M.priorities().map(function (p) {
      return '<label><input class="tick" type="checkbox" data-act="prio" data-id="' + p.id + '"' + (p.done ? ' checked' : '') + '><span>' + esc(p.title) + '</span></label>';
    }).join('');
    var c0 = D.CONTAINERS[0];

    html += '<section class="grid-f">' +
      '<div class="col"><div class="panel"><div class="ph"><h2>Needs you</h2><span class="count">' + att.length + ' open</span><span class="aside">Most urgent first</span></div><div class="pb">' + needs + '</div></div></div>' +
      '<div class="col">' +
        '<div class="panel"><div class="ph"><h2>Collections today</h2><span class="aside">Forecast at ' + hhmm(now) + '</span></div><div class="pb">' + carrierRows(false) + '</div></div>' +
        '<div class="panel"><div class="ph"><h2>My priorities</h2></div><div class="pb prio">' + prios + '</div></div>' +
        '<div class="panel"><div class="ph"><h2>Next container</h2><span class="aside">Freedom Freight</span></div><div class="pb"><div class="ship"><span class="ship-ic">' + ic('ship') + '</span><div><b>' + c0.ref + '</b><p>' + c0.status + ' · lands at ' + c0.port + ' in ' + c0.etaDays + ' days · ' + num(Object.keys(c0.lines).reduce(function (s, k) { return s + c0.lines[k]; }, 0)) + ' units</p></div><a class="btn sm" href="https://freedomfreight.co.uk/" target="_blank" rel="noopener">Track ' + ic('arrow') + '</a></div></div></div>' +
        '<div class="panel"><div class="ph"><h2>Sales by channel</h2><span class="aside">14 days</span></div><div class="pb">' + channelChart() + '</div></div>' +
      '</div></section>';
    return html;
  }

  /* ------------------------------------------------------------- team --- */
  function blockAt(p, t) {
    var mv = (M.extra[p.id] || []).filter(function (w) { return t >= w[0] && t < w[1]; })[0];
    if (mv) return [mv[0], mv[1], 'Evri picking (moved)', 'pick', true];
    for (var i = 0; i < p.blocks.length; i++) if (t >= p.blocks[i][0] && t < p.blocks[i][1]) return p.blocks[i];
    return null;
  }
  function kindOf(b) {
    if (!b) return 'off';
    if (b[3] === 'pick') return 'pick';
    if (/Lunch/.test(b[2])) return 'lunch';
    if (/container/i.test(b[2])) return 'cont';
    if (/Training/.test(b[2])) return 'train';
    return 'office';
  }
  var STATUS = { pick: ['pink', 'Picking'], cont: ['warn', 'Container'], lunch: ['', 'Break'], train: ['', 'Training'], office: ['', 'Office'], off: ['', 'Off shift'] };

  function personCard(p) {
    var now = M.lastNow, b = blockAt(p, now), k = kindOf(b), st = STATUS[k];
    var sheet = M.sheets()[p.id], done = sheet.filter(function (j) { return j.done; }).length;
    var late = sheet.filter(function (j) { return !j.done && j.t < now; }).length;
    var fp = M.floor.people[p.id];
    var moved = b && b[4];
    var next = (M.extra[p.id] || []).filter(function (w) { return w[0] > now; })[0];
    var nowTx = b ? '<b>' + esc(b[2]) + '</b> until ' + hhmm(next ? next[0] : b[1]) : 'Not on shift now';
    if (next) nowTx += '<br><span style="color:var(--pink-2)">Then Evri picking ' + hhmm(next[0]) + '–' + hhmm(next[1]) + ', moved by you</span>';
    if (fp.now) nowTx += '<br>Order ' + fp.now.id + ' · ' + fp.now.items + ' ' + (fp.now.items === 1 ? 'item' : 'items') + ' · ' + D.CARRIERS.filter(function (c) { return c.key === fp.now.carrier; })[0].name;
    return '<button type="button" class="person' + (moved || next ? ' moved' : '') + '" data-act="person" data-id="' + p.id + '">' +
      '<div class="p-top"><span class="av">' + initials(p.name) + '</span><div><b>' + p.name + '</b><span>' + esc(p.role) + '</span></div><span class="chip ' + (next ? 'pink' : st[0]) + '">' + (moved ? 'Moved' : next ? 'Moving ' + hhmm(next[0]) : st[1]) + '</span></div>' +
      '<div class="p-now">' + nowTx + '</div>' +
      '<div><div class="p-row"><span>Workday sheet</span><b>' + done + ' of ' + sheet.length + (late ? ' · <span class="late">' + late + ' late</span>' : '') + '</b></div><div class="bar ' + (late ? 'warn' : 'ok') + '"><i style="width:' + Math.round(done / sheet.length * 100) + '%"></i></div></div>' +
      '<div class="p-foot"><span><b>' + fp.done + '</b>orders packed</span><span><b>' + M.points()[p.id] + '</b>points</span></div></button>';
  }

  function timeline() {
    var a = D.DAY_START, z = D.DAY_END, span = z - a, now = M.lastNow;
    var pos = function (t) { return ((t - a) / span * 100).toFixed(2) + '%'; };
    var out = '<div class="tl"><div class="tl-in"><div class="tl-axis"><span></span><div class="ticks">';
    for (var h = 8; h <= 17; h++) out += '<span style="left:' + pos(h * 60) + '">' + (h < 10 ? '0' : '') + h + ':00</span>';
    out += '</div></div>';
    D.PEOPLE.forEach(function (p) {
      out += '<div class="tl-row"><b>' + p.name + '</b><div class="tl-track">';
      p.blocks.forEach(function (bl) {
        out += '<div class="blk ' + kindOf(bl) + '" style="left:' + pos(bl[0]) + ';width:calc(' + pos(bl[1]) + ' - ' + pos(bl[0]) + ' - 2px)" title="' + esc(bl[2]) + ' ' + hhmm(bl[0]) + '–' + hhmm(bl[1]) + '">' + esc(bl[2]) + '</div>';
      });
      (M.extra[p.id] || []).forEach(function (w) {
        out += '<div class="blk moved" style="left:' + pos(w[0]) + ';width:calc(' + pos(w[1]) + ' - ' + pos(w[0]) + ' - 2px)" title="Moved to Evri picking">Evri picking (moved)</div>';
      });
      out += '</div></div>';
    });
    out += '</div><div class="now-line" data-t="' + hhmm(now) + '" style="left:calc(92px + (100% - 92px) * ' + ((now - a) / span).toFixed(4) + ')"></div></div>';
    out += '<div class="tl-legend"><span><i style="background:rgba(255,45,141,.3)"></i>Picking</span><span><i style="background:rgba(255,181,71,.3)"></i>Container</span><span><i style="background:rgba(108,180,255,.25)"></i>Training</span><span><i></i>Office and breaks</span><span><i style="background:#ff2d8d"></i>Moved by you</span></div>';
    return out;
  }

  // Simple flat drawings for the three photos waiting review (no real photos in a demo).
  function photo(kind) {
    var s = '<svg class="ph-img" viewBox="0 0 160 96" aria-hidden="true"><rect width="160" height="96" fill="#1c1c20"/>';
    if (kind === 'exit') s += '<path d="M40 96 64 30h32l24 66z" fill="#26262b"/><rect x="66" y="30" width="28" height="40" fill="#2f2f35"/><rect x="68" y="14" width="24" height="10" rx="1.5" fill="#1faa59"/><path d="M73 19h6m3 0h5" stroke="#eafff2" stroke-width="1.6"/><path d="M80 70v26" stroke="#3a3a41" stroke-width="1"/>';
    else if (kind === 'rack') s += '<path d="M22 14v76M138 14v76" stroke="#ff8a3d" stroke-width="3"/><path d="M22 36h116M22 62h116M22 88h116" stroke="#3b6fd8" stroke-width="3"/><rect x="30" y="18" width="30" height="17" fill="#8a6a45"/><rect x="64" y="22" width="22" height="13" fill="#9b7a52"/><rect x="92" y="18" width="38" height="17" fill="#7d6040"/><rect x="30" y="44" width="44" height="17" fill="#9b7a52"/><rect x="80" y="47" width="26" height="14" fill="#8a6a45"/><rect x="40" y="70" width="34" height="17" fill="#7d6040"/><rect x="96" y="70" width="34" height="17" fill="#c40000"/>';
    else s += '<rect x="16" y="52" width="128" height="8" fill="#5a4a3a"/><path d="M24 60v30M136 60v30" stroke="#444" stroke-width="3"/><rect x="26" y="34" width="26" height="18" fill="#9b7a52"/><rect x="58" y="40" width="18" height="12" fill="#8a6a45"/><rect x="84" y="24" width="14" height="28" fill="#c40000" rx="3"/><rect x="104" y="36" width="30" height="16" fill="#e6e1d6"/><rect x="104" y="18" width="30" height="5" fill="#666"/>';
    return s + '</svg>';
  }

  function renderTeam() {
    var now = M.lastNow, f = M.floor;
    var working = D.PEOPLE.filter(function (p) { return kindOf(blockAt(p, now)) !== 'off'; }).length;
    var picking = D.PEOPLE.filter(function (p) { return kindOf(blockAt(p, now)) === 'pick'; }).length;
    var lastHour = M.sim.rows.filter(function (q) { return q.done !== null && q.done > now - 60 && q.done <= now; }).length;
    var risk = D.CARRIERS.filter(function (c) { return f.carriers[c.key].late && now < c.at; });
    var moves = M.moved();
    var html = '';
    if (risk.length && M.fix && M.fix.person) {
      var c = f.carriers[M.fix.carrier.key];
      html += '<section class="fixbar fadein"><span class="item-ic bad">' + ic('alert') + '</span><div><h3>' + M.fix.carrier.name + ': ' + c.late + ' ' + (c.late === 1 ? 'parcel' : 'parcels') + ' would miss the ' + hhmm(M.fix.carrier.at) + ' van</h3><p>Suggested by the Command Centre: ' + M.fix.text + '</p></div>' +
        '<div class="acts"><button class="btn primary" data-act="fix">' + ic('arrow') + 'Move ' + M.fix.names + '</button><button class="btn" data-act="person" data-id="' + M.fix.person.id + '">See ' + M.fix.person.name + '’s day</button></div></section>';
    } else if (risk.length) {
      html += '<section class="fixbar fadein"><span class="item-ic bad">' + ic('alert') + '</span><div><h3>' + risk.map(function (x) { return x.name; }).join(' and ') + ' at risk</h3><p>' + (M.fix ? M.fix.text : '') + '</p></div></section>';
    } else if (moves.length) {
      var ev = f.carriers.evri;
      html += '<section class="fixbar ok fadein"><span class="item-ic ok">' + ic('check') + '</span><div><h3>Every van is on track</h3><p><b>' + moves.map(function (m) { return m.p.name; }).join(' and ') + '</b> on Evri picking from ' + hhmm(moves[0].from) + ' to ' + hhmm(moves[0].to) + '. The last Evri parcel is now forecast at <b>' + hhmm(ev.last) + '</b>, before ' + hhmm(ev.carrier.packBy) + '. ' + (moves.length > 1 ? 'Their' : moves[0].p.name + '’s') + ' other work moves to tomorrow morning.</p></div><div class="acts"><button class="btn" data-act="unmove">Undo the move</button></div></section>';
    }
    html += '<section class="floor-stats">' +
      stat('team', 'On shift now', working, 'of ' + D.PEOPLE.length + ' rostered') +
      stat('box', 'Picking now', picking, f.picking + ' orders in hand') +
      stat('truck', 'Parcels to go', f.total - f.ready, f.ready + ' packed so far') +
      stat('clock', 'Packed last hour', lastHour, 'orders') + '</section>';
    html += '<section class="people">' + D.PEOPLE.map(personCard).join('') + '</section>';
    html += '<section class="panel" style="margin-top:16px"><div class="ph"><h2>Day plan</h2><span class="aside">Container FRD 014 arrived three hours late</span></div><div class="pb">' + timeline() + '</div></section>';
    var rv = M.reviews();
    var lb = D.PEOPLE.map(function (p) { return { p: p, pts: M.points()[p.id] }; }).sort(function (a, b) { return b.pts - a.pts; });
    var maxPts = lb[0].pts;
    html += '<section class="grid-t"><div class="col"><div class="panel"><div class="ph"><h2>Photos to review</h2><span class="count">' + rv.filter(function (r) { return !r.state; }).length + ' waiting</span><span class="aside">Proof that a job was done right</span></div><div class="pb"><div class="reviews">' +
      rv.map(function (r) {
        return '<div class="rv">' + photo(r.kind) + '<div class="rv-b"><b>' + esc(r.job) + '</b><span>' + r.who + ' · ' + r.at + '</span>' +
          (r.state ? '<div class="done-row" style="margin-top:10px"><span>' + ic(r.state === 'ok' ? 'check' : 'reset') + (r.state === 'ok' ? 'Passed' : 'Sent back to redo') + '</span></div>' :
          '<div class="acts"><button class="btn sm ok" data-act="review" data-id="' + r.id + '" data-v="ok">' + ic('check') + 'Pass</button><button class="btn sm" data-act="review" data-id="' + r.id + '" data-v="redo">Redo</button></div>') + '</div></div>';
      }).join('') + '</div></div><div class="panel"><div class="ph"><h2>Collections</h2></div><div class="pb">' + carrierRows(true) + '</div></div></div>' +
      '<div class="col"><div class="panel"><div class="ph"><h2>Points this month</h2></div><div class="pb lb">' +
      lb.map(function (r, i) { return '<div class="lb-r"><em>' + (i + 1) + '</em><span>' + r.p.name + '</span><b>' + r.pts + '</b><div class="bar ' + (i ? '' : 'pink') + '"><i style="width:' + Math.round(r.pts / maxPts * 100) + '%"></i></div></div>'; }).join('') +
      '</div></div></div></section>';
    return html;
  }
  function stat(icon, k, v, s) { return '<div class="panel kpi"><div class="k">' + ic(icon) + k + '</div><div class="v num">' + v + '</div><div class="s">' + s + '</div></div>'; }

  var lastFocus = null;
  // refresh: re-drawn after a change while open, so keep focus where it was.
  function openPerson(id, refresh) {
    var keep = refresh && document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.key || document.activeElement.dataset.act : null;
    if (!refresh) lastFocus = document.activeElement;
    var p = D.BY_ID[id], now = M.lastNow, b = blockAt(p, now), sheet = M.sheets()[id];
    var fp = M.floor.people[id];
    var canMove = p.speed > 0 && kindOf(b) !== 'pick' && kindOf(b) !== 'off' && now < 960;
    var blocks = p.blocks.slice();
    (M.extra[id] || []).forEach(function (w) { blocks.push([w[0], w[1], 'Evri picking (moved by you)', 'pick', true]); });
    blocks.sort(function (x, y) { return x[0] - y[0]; });
    var html = '<div class="d-head"><span class="av">' + initials(p.name) + '</span><div><h2 id="drawerTitle">' + p.name + '</h2><span>' + esc(p.role) + ' · ' + p.start + '–' + p.end + '</span></div></div>';
    html += '<div class="acts">' + (canMove ? '<button class="btn primary" data-act="move" data-id="' + id + '">' + ic('arrow') + 'Move to Evri picking now</button>' : '') +
      '<button class="btn" data-act="points" data-id="' + id + '" data-v="5">' + ic('star') + '+5 points</button></div>';
    html += '<div class="d-sec"><h3>Right now</h3><p style="margin:0;font-size:14px">' + (b ? '<b>' + esc(b[2]) + '</b> until ' + hhmm(b[1]) : 'Not on shift') + (fp.now ? '. Order ' + fp.now.id + ' in hand.' : '.') + ' ' + fp.done + ' orders packed today.</p></div>';
    html += '<div class="d-sec"><h3>Workday sheet</h3>' + sheet.map(function (j) {
      var late = !j.done && j.t < now;
      return '<label class="sheet-row' + (late ? ' is-late' : '') + '"><input class="tick" type="checkbox" data-act="tick" data-key="' + j.key + '"' + (j.done ? ' checked' : '') + '><time>' + hhmm(j.t) + '</time><span>' + esc(j.title) + (late ? ' · late' : '') + '</span></label>';
    }).join('') + '</div>';
    html += '<div class="d-sec"><h3>Day plan</h3><div class="blocks-l">' + blocks.map(function (bl) {
      var cur = now >= bl[0] && now < bl[1];
      return '<div class="' + (cur ? 'cur' : '') + '"><time>' + hhmm(bl[0]) + '–' + hhmm(bl[1]) + '</time><span>' + esc(bl[2]) + '</span></div>';
    }).join('') + '</div></div>';
    $('#drawerBody').innerHTML = html;
    $('#drawer').hidden = false;
    $('#drawer').dataset.id = id;
    if (refresh) {
      var back = keep && ($('#drawerBody [data-key="' + keep + '"]') || $('#drawerBody [data-act="' + keep + '"]'));
      if (back) back.focus();
    } else setTimeout(function () { var x = $('.drawer-x'); if (x) x.focus(); }, 30);
  }
  function closeDrawer() {
    if ($('#drawer').hidden) return;
    var id = $('#drawer').dataset.id;
    $('#drawer').hidden = true; delete $('#drawer').dataset.id;
    var card = id && $('.person[data-id="' + id + '"]');
    var to = card || (lastFocus && document.contains(lastFocus) ? lastFocus : null);
    if (to) to.focus();
  }

  /* -------------------------------------------------------------- ask --- */
  function renderAsk() {
    var html = '<div class="ask">';
    if (!convo.length) html += '<section class="ask-hero fadein"><h2>Ask the <em>business.</em></h2><p>Orders, stock, products, channels, returns, the team, shipments from China. Ask in plain English; the answer is worked out from the data, with the working shown.</p></section>';
    html += '<form class="ask-form" id="askForm" autocomplete="off"><label class="sr" for="askQ">Your question</label><input id="askQ" name="q" placeholder="Ask anything, e.g. what is about to run out?" maxlength="200"><button class="btn primary" type="submit">' + ic('send') + '<span>Ask</span></button></form>';
    html += '<p class="ask-note">In this demo, questions are read by rules written for it and answered by working through the sample data in your browser: no language model, and nothing you type leaves the page. In the live Hub, our assistant answers from the real records with a language model.</p>';
    if (!convo.length) html += '<div class="chips">' + X.HELP.map(function (q) { return '<button type="button" class="q-chip" data-ask="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>';
    html += '<div class="convo" id="convo">' + convo.map(function (c) { return turnHtml(c, false); }).join('') + '</div></div>';
    return html;
  }
  function turnHtml(c, animate) {
    var a = c.a;
    var out = '<div class="you">' + esc(c.q) + '</div><article class="panel ans" data-turn="' + c.i + '"><div class="ans-h">' + ic('ask') + 'Command Centre</div>';
    if (a.steps.length) out += '<ul class="steps">' + a.steps.map(function (s) { return '<li class="' + (animate ? '' : 'on') + '">' + (animate ? '<span class="spin"></span>' : ic('check')) + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul>';
    out += '<div class="ans-body' + (animate ? '' : ' on') + '">' + a.html + (a.viz ? '<div class="viz">' + viz(a.viz) + '</div>' : '') +
      (a.sources.length ? '<div class="ans-src">' + ic('feed') + a.sources.map(esc).join('<span class="faint">·</span>') + '</div>' : '') +
      '<div class="ans-follow">' + (a.action ? '<button class="btn primary sm" data-go="' + a.action.go + '">' + ic('arrow') + esc(a.action.label) + '</button>' : '') +
      (a.link ? '<a class="btn sm" href="' + a.link.href + '" target="_blank" rel="noopener">' + esc(a.link.label) + ic('arrow') + '</a>' : '') +
      a.follow.map(function (q) { return '<button type="button" class="q-chip" data-ask="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div></div></article>';
    return out;
  }
  function viz(v) {
    var fmt = function (x) { return v.unit === 'money' ? money(x) : v.unit === 'money2' ? money(x, 2) : num(x); };
    if (v.type === 'bars' || v.type === 'growth') {
      var max = Math.max.apply(null, v.rows.map(function (r) { return r.value; })) || 1;
      return v.rows.map(function (r, i) {
        return '<div class="hb"><span>' + esc(r.label) + '</span><div class="bar ' + (i ? '' : 'pink') + '"><i style="width:' + Math.max(1, Math.round(r.value / max * 100)) + '%"></i></div><b>' + (v.type === 'growth' ? money(r.value) + ' <span class="g ' + (r.growth >= 0 ? 'up' : 'down') + '">' + X.pct(r.growth) + '</span>' : fmt(r.value)) + '</b></div>';
      }).join('');
    }
    if (v.type === 'spark') return '<div class="faint" style="font-size:12px;margin-bottom:6px">' + esc(v.label) + '</div>' + sparkSvg(v.values, { h: 70, zero: true, mark: v.mark });
    if (v.type === 'table') return '<table class="tbl"><thead><tr>' + v.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + v.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    if (v.type === 'cover') {
      return '<div class="faint" style="font-size:12px;margin-bottom:6px">Days of stock left · <span style="color:var(--tx)">|</span> next delivery</div>' + v.rows.map(function (r) {
        var w = Math.min(100, (r.cover === Infinity ? 60 : r.cover) / 60 * 100), m = r.eta !== null ? Math.min(100, r.eta / 60 * 100) : null;
        return '<div class="hb"><span>' + esc(r.label) + '</span><div class="bar ' + (r.cover < 14 ? 'bad' : 'warn') + '" style="position:relative;overflow:visible"><i style="width:' + Math.max(1.5, w) + '%"></i>' + (m !== null ? '<em style="position:absolute;top:-4px;bottom:-4px;left:' + m + '%;width:2px;background:var(--tx)" title="delivery"></em>' : '') + '</div><b>' + (r.cover < 1 ? 'out' : Math.floor(r.cover) + 'd') + '</b></div>';
      }).join('') + '<div class="faint" style="font-size:11.5px;margin-top:6px">Scale: 60 days</div>';
    }
    if (v.type === 'carriers') {
      return v.rows.map(function (f) {
        return '<div class="hb"><span>' + f.carrier.name + ' · ' + hhmm(f.carrier.at) + '</span><div class="bar ' + (f.late ? 'bad' : 'ok') + '"><i style="width:' + Math.round(f.ready / Math.max(1, f.total) * 100) + '%"></i></div><b class="' + (f.late ? 'down' : 'up') + '">' + (f.late ? f.late + ' late' : 'in time') + '</b></div>';
      }).join('');
    }
    if (v.type === 'sheet') return v.rows.map(function (r) { return '<div class="hb" style="grid-template-columns:52px 1fr auto"><span class="faint" style="font-family:var(--mono)">' + r.t + '</span><span style="white-space:normal">' + esc(r.title) + '</span><b class="' + (r.done ? 'up' : r.late ? 'down' : 'faint') + '">' + (r.done ? 'done' : r.late ? 'late' : 'later') + '</b></div>'; }).join('');
    return '';
  }
  var asking = false;
  function ask(q) {
    q = String(q || '').trim();
    if (!q || asking) return;
    var a = X.ask(q, M.ctx());
    var c = { q: q, a: a, i: convo.length };
    convo.push(c);
    if (view !== 'ask') { go('ask'); }
    var hero = $('.ask-hero'); if (hero) hero.remove();
    var chips = $('.ask .chips'); if (chips) chips.remove();
    var box = $('#convo');
    box.insertAdjacentHTML('beforeend', turnHtml(c, true));
    var art = box.querySelector('[data-turn="' + c.i + '"]');
    var you = art.previousElementSibling;
    var input = $('#askQ'); if (input) input.value = '';
    asking = true;
    try { you.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } catch (e) { you.scrollIntoView(); }
    var lis = art.querySelectorAll('.steps li'), i = 0;
    var step = function () {
      if (i > 0) lis[i - 1].querySelector('.spin') && (lis[i - 1].querySelector('.spin').outerHTML = ic('check'));
      if (i < lis.length) { lis[i].classList.add('on'); i++; setTimeout(step, 360); return; }
      art.querySelector('.ans-body').classList.add('on');
      asking = false;
    };
    step();
  }

  /* ----------------------------------------------------------- routing --- */
  function render() {
    var v = $('#view'), y = window.scrollY;
    v.innerHTML = view === 'founder' ? renderFounder() : view === 'team' ? renderTeam() : renderAsk();
    document.querySelectorAll('[data-view]').forEach(function (a) { if (a.dataset.view === view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#viewKicker').textContent = VIEWS[view].kicker;
    $('#viewTitle').textContent = VIEWS[view].title;
    document.title = VIEWS[view].kicker + ' · Freedom Command Centre';
    paintCounts(); paintFeeds();
    return y;
  }
  function go(v, keepScroll) {
    if (!VIEWS[v]) v = 'founder';
    var changed = v !== view;
    view = v;
    if (location.hash !== '#' + v) history.replaceState(null, '', location.pathname + location.search.replace(/([?&])q=[^&]*/, '$1').replace(/[?&]$/, '') + '#' + v);
    render();
    if (changed && !keepScroll) window.scrollTo(0, 0);
  }
  // A model change re-renders the screen in place, keeping the scroll position.
  M.on(function () {
    paintCounts(); paintFeeds(); paintClock();
    if (view === 'ask') return;
    var y = window.scrollY; render(); window.scrollTo(0, y);
    var id = $('#drawer').dataset.id; if (id) openPerson(id, true);
  });

  /* ------------------------------------------------------------ toasts --- */
  var tTimer;
  function toast(html, undo) {
    var t = $('#toast');
    t.innerHTML = '<span>' + html + '</span>' + (undo ? '<button type="button" id="toastUndo">Undo</button>' : '');
    t.classList.add('on');
    if (undo) $('#toastUndo').onclick = function () { undo(); t.classList.remove('on'); };
    clearTimeout(tTimer); tTimer = setTimeout(function () { t.classList.remove('on'); }, 5200);
  }

  /* ------------------------------------------------------------ events --- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act],[data-go],[data-ask],[data-view]');
    if (!el) return;
    if (el.dataset.view && el.tagName === 'A') { e.preventDefault(); closeDrawer(); go(el.dataset.view); return; }
    if (el.dataset.go) { e.preventDefault(); closeDrawer(); go(el.dataset.go); return; }
    if (el.dataset.ask) { e.preventDefault(); ask(el.dataset.ask); return; }
    var act = el.dataset.act, id = el.dataset.id;
    if (act === 'tick' || act === 'prio') return; // handled on change
    if (act === 'decide') {
      M.decide(id, el.dataset.v);
      var d = M.decisions().filter(function (x) { return x.id === id; })[0];
      toast((el.dataset.v === 'yes' ? 'Approved: ' : 'Declined: ') + esc(d.title), function () { M.decide(id, null); });
    } else if (act === 'undecide') M.decide(id, null);
    else if (act === 'case') { open[id] = !open[id]; var y = window.scrollY; render(); window.scrollTo(0, y); }
    else if (act === 'fix') {
      var f = M.applyFix();
      if (f) toast(f.names + ' moved to ' + f.carrier.name + ' picking, ' + hhmm(f.from) + '–' + hhmm(f.to) + '. Every van is now on track.', function () { M.undoMoves(); });
    } else if (act === 'unmove') M.undoMoves();
    else if (act === 'ack') { M.ackBlocker(id); toast('Noted. It stays on the owner’s list.', function () { delete M.blockers[id]; M.emit(); }); }
    else if (act === 'unack') { delete M.blockers[id]; M.emit(); }
    else if (act === 'review') { M.review(id, el.dataset.v); toast(el.dataset.v === 'ok' ? 'Photo passed. The job is signed off.' : 'Sent back with a note to redo it.', function () { delete M.reviewed[id]; M.emit(); }); }
    else if (act === 'person') openPerson(id);
    else if (act === 'close-drawer') closeDrawer();
    else if (act === 'points') { M.givePoints(id, +el.dataset.v); toast('+' + el.dataset.v + ' points to ' + D.BY_ID[id].name + '.', function () { M.givePoints(id, -el.dataset.v); }); }
    else if (act === 'move') {
      var p = D.BY_ID[id], from = Math.floor(M.now() / 5) * 5 + 10, to = Math.min(from + 120, D.CARRIERS[2].packBy);
      (M.extra[id] = M.extra[id] || []).push([from, to]);
      M.recompute(); M.emit();
      var ev = M.floor.carriers.evri;
      toast(p.name + ' moved to Evri picking ' + hhmm(from) + '–' + hhmm(to) + '. Evri now ' + (ev.late ? ev.late + ' late' : 'in time, last parcel ' + hhmm(ev.last)) + '.', function () { M.extra[id].pop(); if (!M.extra[id].length) delete M.extra[id]; M.recompute(); M.emit(); });
    } else if (act === 'reset') { convo = []; open = {}; M.reset(); go('founder'); toast('Demo restarted at 13:20.'); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.dataset.act === 'tick') M.tickJob(el.dataset.key, el.checked);
    if (el.dataset.act === 'prio') M.togglePrio(el.dataset.id);
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'askForm') { e.preventDefault(); ask($('#askQ').value); }
  });
  document.addEventListener('keydown', function (e) {
    if ($('#drawer').hidden) return;
    if (e.key === 'Escape') { closeDrawer(); return; }
    // Keep Tab inside the open drawer.
    if (e.key === 'Tab') {
      var f = Array.prototype.slice.call($('.drawer-panel').querySelectorAll('button, input, a[href]'));
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      else if (!$('.drawer-panel').contains(document.activeElement)) { e.preventDefault(); a.focus(); }
    }
  });
  window.addEventListener('hashchange', function () { var v = location.hash.slice(1); if (VIEWS[v] && v !== view) go(v); });

  /* ------------------------------------------------------------- start --- */
  var start = location.hash.slice(1);
  var q0 = params.get('q');
  go(VIEWS[start] ? start : q0 ? 'ask' : 'founder', true);
  if (q0) setTimeout(function () { ask(q0.slice(0, 200)); }, 250);
  paintClock();
  setInterval(function () { paintClock(); if (!M.tick()) paintFeeds(); }, 2000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { paintClock(); M.tick(); } });
})();
