/* Freedom Command Centre — "Ask the business".
 *
 * A question goes in as plain English and comes back as an answer worked out
 * from the demo data: the question is read for what it is about (sales, stock,
 * dispatch, returns, people, shipments) and for the things it names (a period,
 * a channel, a carrier, a product, a person), then the numbers are computed,
 * not looked up. Every answer lists the steps it took and the feeds it read.
 *
 * It runs entirely in the browser: nothing typed here leaves the page.
 */
(function (root) {
  'use strict';
  var D = root.FCC_DATA;

  /* ---------------------------------------------------------- format --- */
  function money(v, dp) {
    var n = Math.abs(v), s;
    if (dp === undefined) dp = n >= 1000 ? 0 : 2;
    s = n.toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (v < 0 ? '-£' : '£') + s;
  }
  function num(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function pct(v) { return (v > 0 ? '+' : '') + Math.round(v * 100) + '%'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // lower-case a label's first letter mid-sentence, unless it starts with an acronym (FRD, T Level)
  function lc1(s) { s = String(s); return /^([A-Z][A-Z0-9]|T Level|Amazon|Evri|Royal Mail|Temu|Yodel|Shopify|TikTok|OnBuy|Linnworks|Freedom)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); }
  function plural(n, a, b) { return n === 1 ? a : (b || a + 's'); }
  var WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function dayName(dt) { return WD[dt.getDay()] + ' ' + dt.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()]; }

  /* -------------------------------------------------------- measures --- */
  function chName(k) { for (var i = 0; i < D.CHANNELS.length; i++) if (D.CHANNELS[i].key === k) return D.CHANNELS[i].name; return k; }
  function rangeDays(period) { return D.DAYS.slice(period.from, period.to + 1); }
  function totals(days, channel) {
    var t = { rev: 0, units: 0, orders: 0 };
    days.forEach(function (d) {
      D.CHANNELS.forEach(function (c) {
        if (channel && c.key !== channel) return;
        t.rev += d.rev[c.key]; t.units += d.units[c.key]; t.orders += d.orders[c.key];
      });
    });
    return t;
  }
  function skuUnits(days, sku, channel) {
    var u = 0;
    days.forEach(function (d) { var r = d.bySku[sku]; for (var k in r) if (!channel || k === channel) u += r[k]; });
    return u;
  }
  function dailyRate(sku, n) { return skuUnits(D.DAYS.slice(28 - (n || 14)), sku) / (n || 14); }
  function free(p) { return Math.max(0, p.stock - p.book); }
  function cover(p) { var r = dailyRate(p.sku); return r > 0 ? free(p) / r : Infinity; }
  function firstArrival(p) {
    var a = p.incoming.slice().sort(function (x, y) { return x.etaDays - y.etaDays; });
    return a[0] || null;
  }

  /* -------------------------------------------------------- entities --- */
  var CH_WORDS = { ebay: /\be-?bay\b/, amazon: /\bamazon\b/, temu: /\btemu\b/, shopify: /\bshopify\b|\bour (own )?(web)?site\b|\bweb ?store\b/, tiktok: /\btik ?tok\b/, onbuy: /\bon ?buy\b/ };
  var CAR_WORDS = { rm: /\broyal ?mail\b|\brm\b/, yodel: /\byodel\b/, evri: /\bevri\b|\bhermes\b/, dpd: /\bdpd\b/ };
  var CAT_WORDS = {
    'Extinguishers': /\bextinguishers?\b/, 'Fire blankets': /\bblankets?\b/, 'Safety signs': /\bsigns?\b|\bsignage\b/,
    'Alarms': /\balarms?\b|\bdetectors?\b/, 'Batteries': /\bbatter(y|ies)\b/, 'Bundles': /\bbundles?\b|\bkits?\b/,
    'Stands & cabinets': /\bstands?\b|\bcabinets?\b/, 'First aid': /\bfirst aid\b/, 'Spares': /\bspares?\b|\bbrackets?\b|\bseals?\b|\btags?\b/
  };
  var STOP = ['the', 'a', 'an', 'of', 'for', 'we', 'have', 'how', 'many', 'much', 'do', 'is', 'are', 'in', 'on', 'our', 'what', 'stock', 'left', 'got', 'any', 'fire', 'extinguisher', 'extinguishers', 'firestorm', 'selling', 'doing', 'sell', 'sold', 'and', 'units'];
  function findProduct(q) {
    // One-letter tokens ("x" in "1.2m x 1.2m") match far too much to count.
    var toks = q.replace(/(\d)\s+(kg|l|m)\b/g, '$1$2').replace(/co2|co₂/g, 'co2').split(/[^a-z0-9.]+/).filter(function (t) { return t.length > 1 && STOP.indexOf(t) < 0; });
    if (!toks.length) return null;
    var best = null, bestScore = 0;
    D.PRODUCTS.forEach(function (p) {
      var name = (p.name + ' ' + p.sku).toLowerCase().replace(/co2/g, 'co2');
      var words = name.split(/[^a-z0-9.]+/);
      var s = 0;
      toks.forEach(function (t) {
        if (words.indexOf(t) >= 0 || (t.length > 3 && words.indexOf(t.replace(/e?s$/, '')) >= 0)) s += /\d/.test(t) ? 3 : 2;
        else if (t.length > 3 && name.indexOf(t.replace(/s$/, '')) >= 0) s += 1;
      });
      // A size alone ("2kg") is only a guess unless something else agrees.
      if (s > bestScore || (s === bestScore && best && p.rate > best.rate)) { bestScore = s; best = p; }
    });
    return bestScore >= 2 ? best : null;
  }
  function findPerson(q) {
    for (var i = 0; i < D.PEOPLE.length; i++) if (new RegExp('\\b' + D.PEOPLE[i].name.toLowerCase() + '\\b').test(q)) return D.PEOPLE[i];
    return null;
  }
  function findPeriod(q) {
    var y = D.DAYS.length - 1; // yesterday
    var mondayBack = (D.DAYS[y].wd + 6) % 7; // days since Monday, counting yesterday
    if (/\byesterday\b/.test(q)) return { from: y, to: y, label: 'yesterday', short: dayName(D.DAYS[y].date) };
    if (/\blast week\b/.test(q)) { var end = y - mondayBack - 1; return { from: end - 6, to: end, label: 'last week', short: 'Mon to Sun last week' }; }
    if (/\bthis week\b|\bso far this week\b/.test(q)) { var from = Math.max(0, y - mondayBack); return { from: from, to: y, label: 'this week so far', short: (y - from + 1) + ' days to yesterday' }; }
    if (/\b(28|30|four weeks|month)\b/.test(q)) return { from: 0, to: y, label: 'the last 28 days', short: '28 days' };
    if (/\b(14|two weeks|fortnight)\b/.test(q)) return { from: y - 13, to: y, label: 'the last 14 days', short: '14 days' };
    return { from: y - 6, to: y, label: 'the last 7 days', short: '7 days', dflt: true };
  }
  function first(map, q) { for (var k in map) if (map[k].test(q)) return k; return null; }

  /* --------------------------------------------------------- intents --- */
  var INTENTS = [
    ['attention', /\battention\b|\bneeds? me\b|\bfocus\b|\bpriorit|\bblock(er|ed)|\bgoing wrong\b|\bproblems?\b|\bworry\b|\bwhat should i\b|\bbriefing\b|\bbrief me\b|\bsummar/],
    ['dispatch', /\bget (everything|it all|all|them|it) out\b|\bdispatch|\bcollections?\b|\bvans?\b|\bon track\b|\blate\b|\bout today\b|\bship(ped|ping)? today\b|\bready\b|\bpack(ed|ing)?\b|\bparcels?\b|\bopen orders\b|\bbacklog\b/],
    ['top', /\bbest.?sell|\bsold (the )?(best|most)\b|\bsells? (the )?(best|most)\b|\btop\b|\bmost popular\b|\bselling (best|most|well)\b|\bbiggest sellers?\b|\bbest products?\b|\bwhat sells\b/],
    ['slow', /\bslow\b|\bdead stock\b|\bnot selling\b|\bisn'?t selling\b|\boverstock|\btoo much stock\b|\bsitting\b|\bworst\b/],
    ['stockrisk', /\brun(ning)? out\b|\blow (on )?stock\b|\bstock.?outs?\b|\breorder\b|\border more\b|\brestock\b|\bout of stock\b|\bshort(age)?s?\b|\bbuy more\b|\bpurchas/],
    ['stockof', /\bhow many\b.*\b(have|got|left|in stock)\b|\bstock (of|for|level|on)\b|\bin stock\b|\bhow much stock\b/],
    ['channels', /\bchannels?\b|\bgrow(ing|th)\b|\bfastest\b|\bmarketplaces?\b|\bcompare\b|\bsplit\b|\bmix\b|\bwhere do (we|our) sales\b/],
    ['returns', /\breturns?\b|\brefunds?\b|\bcoming back\b|\bsent back\b|\bcomplain/],
    ['team', /\bwho\b|\bstaff\b|\bteam\b|\bbusiest\b|\bbehind\b|\bworkload\b|\bdoing what\b|\bpoints\b|\bleaderboard\b|\bstudents?\b|\bt level\b|\bplacements?\b|\bon shift\b|\bworking today\b|\bpeople\b/],
    ['outside', /\bcustomers?\b|\breviews?\b|\bprofit|\bmargins?\b|\bcash\b|\bbank\b|\bwages?\b|\bsalar|\bvat\b|\btax\b|\bvaluation\b|\binvest/],
    ['inbound', /\bcontainers?\b|\bshipments?\b|\bfreight\b|\bchina\b|\barriv|\bincoming\b|\bon the water\b|\beta\b|\blanding\b|\bdelivery from\b/],
    ['aov', /\baverage order\b|\baov\b|\bbasket size\b|\border value\b/],
    ['sales', /\bsales\b|\brevenue\b|\bturnover\b|\bhow (did|are|is|were) (we|it|things|sales)\b|\btakings\b|\bmoney\b|\bmade\b|\bmake\b|\bearn|\bbr(ing|ought) in\b|\bsold\b|\bdid we sell\b|\bunits\b|\bperform|\btrading\b|\bnumbers\b|\borders\b/]
  ];

  function classify(q) {
    var hits = INTENTS.filter(function (it) { return it[1].test(q); }).map(function (it) { return it[0]; });
    var product = findProduct(q), person = findPerson(q);
    if (person && hits.indexOf('team') < 0) hits.unshift('team');
    if (person) return 'person';
    if (/\btom\b/.test(q) && !product) return 'tom';
    if (/\bpoints\b|\bleaderboard\b/.test(q)) return 'team';
    // A named carrier is a dispatch question ("will evri make it?").
    if (first(CAR_WORDS, q) && hits.indexOf('returns') < 0) return 'dispatch';
    // Today's trading is only known from open orders, not the daily sales file.
    if (/\btoday\b|\bso far\b/.test(q) && hits.indexOf('sales') >= 0 && hits.indexOf('dispatch') < 0 && hits.indexOf('top') < 0 && !product) return 'today';
    if (hits.indexOf('outside') >= 0 && !product) return 'outside';
    if (product && (hits.indexOf('stockof') >= 0 || (/\bhow many\b|\bstock\b|\bleft\b/.test(q) && !/\bsold\b|\bsell/.test(q)))) return 'stockof';
    if (product && /\bhow (is|are|has)\b|\bdoing\b|\bselling\b|\bsales\b|\bsold\b/.test(q) && hits.indexOf('top') < 0) return 'product';
    if (product && !hits.length) return 'product';
    if (!hits.length && first(CH_WORDS, q)) return 'sales';
    var order = ['attention', 'inbound', 'returns', 'aov', 'stockrisk', 'slow', 'top', 'channels', 'dispatch', 'team', 'stockof', 'sales'];
    for (var i = 0; i < order.length; i++) if (hits.indexOf(order[i]) >= 0) return order[i];
    return null;
  }

  /* --------------------------------------------------------- answers --- */
  // ctx: { now, sim, floor } from the app, so dispatch answers match the screen.
  var A = {};

  // A category named in a sales question ("how many extinguishers did we sell
  // yesterday") is answered from the products in it, not the whole shop.
  function catSales(q, per, ch, cat) {
    var days = rangeDays(per), len = per.to - per.from + 1, back = len < 7 ? 7 : len;
    var prev = per.from - back >= 0 ? D.DAYS.slice(per.from - back, per.from - back + len) : null;
    var ps = D.PRODUCTS.filter(function (p) { return p.cat === cat; });
    var rows = ps.map(function (p) { var u = skuUnits(days, p.sku, ch); return { p: p, u: u, rev: u * p.price }; }).filter(function (r) { return r.u; }).sort(function (a, b) { return b.u - a.u; });
    var units = rows.reduce(function (s, r) { return s + r.u; }, 0), rev = rows.reduce(function (s, r) { return s + r.rev; }, 0);
    var pu = prev ? ps.reduce(function (s, p) { return s + skuUnits(prev, p.sku, ch); }, 0) : 0;
    var html = '<p>' + (per.label === 'yesterday' ? 'Yesterday' : 'Over ' + per.label) + (ch ? ' on ' + chName(ch) : '') + ' we sold <b>' + num(units) + ' ' + cat.toLowerCase() + '</b>, worth <b>' + money(rev) + '</b>.' + (pu ? ' That is ' + pct((units - pu) / pu) + ' on ' + (len < 7 ? 'the same ' + plural(len, 'day') + ' last week' : 'the ' + len + ' days before') + '.' : '') + '</p>';
    if (rows.length) html += '<p>Most of it was the ' + esc(shortName(rows[0].p)) + ' (' + num(rows[0].u) + ').</p>';
    return {
      html: html, viz: rows.length ? { type: 'bars', unit: 'units', rows: rows.slice(0, 6).map(function (r) { return { label: shortName(r.p), value: r.u }; }) } : null,
      steps: ['Read the processed-orders feed (Linnworks, 06:00)', 'Kept the ' + ps.length + ' products in ' + cat.toLowerCase() + (ch ? ' sold on ' + chName(ch) : ''), 'Counted units over ' + per.label],
      sources: ['Processed orders · Linnworks · 06:00 today'],
      follow: ['What is about to run out?', 'What sold best this week?']
    };
  }

  A.sales = function (q, ctx) {
    var per = findPeriod(q), ch = first(CH_WORDS, q), cat = first(CAT_WORDS, q);
    if (cat) return catSales(q, per, ch, cat);
    var days = rangeDays(per), len = per.to - per.from + 1;
    // Like for like: a day or a part-week is compared with the same days a
    // week earlier, so a Monday is never measured against a Sunday.
    var back = len < 7 ? 7 : len;
    var prev = D.DAYS.slice(Math.max(0, per.from - back), Math.max(0, per.from - back) + len);
    var t = totals(days, ch), p = per.from - back >= 0 ? totals(prev, ch) : null;
    var prevLabel = len === 1 ? 'the same day last week' : len < 7 ? 'the same days last week' : 'the ' + len + ' days before';
    var scope = ch ? 'on ' + chName(ch) : 'across every channel';
    var html = '<p>' + (per.label === 'yesterday' ? 'Yesterday (' + per.short + ')' : 'Over ' + per.label) + ', ' + scope + ', we took <b>' + money(t.rev) + '</b> from <b>' + num(t.orders) + '</b> orders (' + num(t.units) + ' units).</p>';
    if (p && p.rev > 0) {
      var ch2 = (t.rev - p.rev) / p.rev;
      html += '<p>That is <b>' + pct(ch2) + '</b> on ' + prevLabel + ' (' + money(p.rev) + ').</p>';
    }
    var viz;
    if (!ch) {
      var rows = D.CHANNELS.map(function (c) { return { label: c.name, value: totals(days, c.key).rev }; }).sort(function (a, b) { return b.value - a.value; });
      var lead = rows[0];
      html += '<p>' + lead.label + ' brought in ' + Math.round(lead.value / t.rev * 100) + '% of it.</p>';
      viz = { type: 'bars', unit: 'money', rows: rows };
    } else {
      viz = { type: 'spark', unit: 'money', label: chName(ch) + ', daily sales, 28 days', values: D.DAYS.map(function (d) { return d.rev[ch]; }), mark: [per.from, per.to] };
    }
    return {
      html: html, viz: viz,
      steps: ['Read the processed-orders feed (Linnworks, 06:00)', 'Took ' + per.label + (ch ? ', ' + chName(ch) + ' only' : ''), p ? 'Compared it with ' + prevLabel : 'Summed by channel'],
      sources: ['Processed orders · Linnworks · 06:00 today'],
      follow: ch ? ['Best sellers on ' + chName(ch) + ' this week', 'Which channel is growing fastest?'] : ['Which channel is growing fastest?', 'What sold best this week?', 'What is our average order value?']
    };
  };

  A.top = function (q) {
    var per = findPeriod(q), ch = first(CH_WORDS, q), cat = first(CAT_WORDS, q);
    var days = rangeDays(per);
    var rows = D.PRODUCTS.filter(function (p) { return !cat || p.cat === cat; }).map(function (p) {
      var u = skuUnits(days, p.sku, ch);
      return { p: p, units: u, rev: u * p.price };
    }).filter(function (r) { return r.units > 0; });
    var byRev = /revenue|money|value|£/.test(q);
    rows.sort(function (a, b) { return byRev ? b.rev - a.rev : b.units - a.units; });
    var top = rows.slice(0, 5);
    if (!top.length) return none('Nothing in that range sold ' + (ch ? 'on ' + chName(ch) : '') + '.');
    var html = '<p>' + (cat ? 'In ' + cat.toLowerCase() + ', the' : 'The') + ' best seller over ' + per.label + (ch ? ' on ' + chName(ch) : '') + ' was the <b>' + esc(top[0].p.name) + '</b>: ' + num(top[0].units) + ' units, ' + money(top[0].rev) + '.</p>';
    if (top.length > 1) {
      var rest = rows.slice(5).reduce(function (s, r) { return s + (byRev ? r.rev : r.units); }, 0);
      var all = rows.reduce(function (s, r) { return s + (byRev ? r.rev : r.units); }, 0);
      html += '<p>The top five make up ' + Math.round((all - rest) / all * 100) + '% of ' + (byRev ? 'sales value' : 'units') + '.' + (byRev ? '' : ' Ranked by units; ask "by revenue" to rank by value.') + '</p>';
    }
    return {
      html: html,
      viz: { type: 'bars', unit: byRev ? 'money' : 'units', rows: top.map(function (r) { return { label: shortName(r.p), value: byRev ? r.rev : r.units }; }) },
      steps: ['Read the processed-orders feed', 'Counted units per product over ' + per.label + (ch ? ' on ' + chName(ch) : '') + (cat ? ' in ' + cat : ''), 'Ranked by ' + (byRev ? 'sales value' : 'units')],
      sources: ['Processed orders · Linnworks · 06:00 today'],
      follow: ['Are any of these about to run out?', 'What is not selling?', 'How is the ' + shortName(top[0].p) + ' doing?']
    };
  };

  A.slow = function () {
    var days = D.DAYS.slice(0);
    var rows = D.PRODUCTS.map(function (p) {
      var u = skuUnits(days, p.sku), r = u / 28;
      return { p: p, units: u, cover: r > 0 ? p.stock / r : Infinity, tied: p.stock * p.price / 1.2 };
    }).filter(function (r) { return r.p.stock > 50 && (r.cover > 365); }).sort(function (a, b) { return b.tied - a.tied; });
    if (!rows.length) return none('Nothing is sitting still: every product with stock has sold in the last 28 days.');
    var tied = rows.reduce(function (s, r) { return s + r.tied; }, 0);
    var html = '<p><b>' + rows.length + ' ' + plural(rows.length, 'product') + '</b> would take more than a year to sell through at the last 28 days’ pace, holding about <b>' + money(tied) + '</b> of stock at selling price (ex VAT).</p>';
    html += '<p>Worst is the <b>' + esc(rows[0].p.name) + '</b>: ' + num(rows[0].p.stock) + ' in stock, ' + num(rows[0].units) + ' sold in 28 days. Options: bundle it with a best seller, list it on Temu and TikTok Shop, or clear it in the next promotion.</p>';
    return {
      html: html,
      viz: { type: 'table', head: ['Product', 'In stock', 'Sold 28d', 'Cover'], rows: rows.map(function (r) { return [shortName(r.p), num(r.p.stock), num(r.units), r.cover === Infinity ? 'none sold' : (r.cover / 365).toFixed(1) + ' yrs']; }) },
      steps: ['Read stock levels (Linnworks, hourly)', 'Worked out sell-through for every product over 28 days', 'Kept anything with more than a year of cover'],
      sources: ['Stock levels · Linnworks · hourly', 'Processed orders · 28 days'],
      follow: ['What should we reorder?', 'What sold best this week?']
    };
  };

  // Two questions hide in "what will run out": what goes dry soon, and what
  // must be ordered NOW because a sea order takes ~100 days. UK lines
  // (alarms, batteries, signs, water mist) are next-day, so only the first
  // question applies to them.
  function riskRows(cat) {
    return D.PRODUCTS.filter(function (p) { return (!cat || p.cat === cat) && dailyRate(p.sku) > 0.3; }).map(function (p) {
      var c = cover(p), a = firstArrival(p), lead = p.uk ? 2 : D.SEA_LEAD_DAYS;
      return { p: p, cover: c, arrival: a, gap: a ? Math.max(0, a.etaDays - c) : Infinity, rate: dailyRate(p.sku), lead: lead,
        soon: c < 30, orderNow: !a && c < lead + 14 };
    });
  }
  function reorderQty(r) { return r.p.uk ? Math.ceil(r.rate * 28 / 10) * 10 : Math.ceil(r.rate * (r.lead + 60) / 100) * 100; }
  function when(d) { return d <= 1 ? 'tomorrow' : 'in ' + d + ' days'; }
  A.stockrisk = function (q) {
    var cat = first(CAT_WORDS, q);
    var all = riskRows(cat);
    var soon = all.filter(function (r) { return r.soon; }).sort(function (a, b) { return a.cover - b.cover; });
    var sea = all.filter(function (r) { return r.orderNow && !r.p.uk && !r.soon; }).sort(function (a, b) { return a.cover - b.cover; });
    if (!soon.length && !sea.length) return none('Nothing ' + (cat ? 'in ' + cat.toLowerCase() + ' ' : '') + 'is at risk: everything has cover or stock on the way.');
    var html = '';
    if (soon.length) {
      html += '<p><b>' + soon.length + ' ' + plural(soon.length, 'product') + '</b> run out within 30 days at the last 14 days\u2019 pace:</p><ul>';
      soon.slice(0, 5).forEach(function (r) {
        var line = '<li><b>' + esc(shortName(r.p)) + '</b>: ';
        line += r.cover < 1 ? 'out of stock now' + (r.p.book ? ', ' + r.p.book + ' ' + plural(r.p.book, 'unit') + ' waiting on orders' : '') : Math.floor(r.cover) + ' days left';
        if (r.arrival) line += r.gap > 0 ? '; ' + r.arrival.ref + ' arrives ' + when(r.arrival.etaDays) + ', about <b>' + Math.ceil(r.gap) + ' ' + plural(Math.ceil(r.gap), 'day') + ' short</b>' : '; ' + r.arrival.ref + ' (' + num(r.arrival.qty) + ') arrives in time';
        else line += '; <b>nothing on order</b>. ' + (r.p.uk ? 'UK next-day line: top up ' + num(reorderQty(r)) : 'Sea line: order ' + num(reorderQty(r)) + ' now');
        html += line + '.</li>';
      });
      html += '</ul>';
    }
    if (sea.length) {
      var r0 = sea[0];
      html += '<p>Order now, even though it looks fine: <b>' + esc(shortName(r0.p)) + '</b> has ' + Math.floor(r0.cover) + ' days left, but a sea order takes ~' + D.SEA_LEAD_DAYS + ' days and nothing is on order. Suggested: <b>' + num(reorderQty(r0)) + '</b> onto FRD 016, the next container still in production, with a small UK top-up to bridge the gap.</p>';
      if (sea.length > 1) html += '<p>' + (sea.length - 1) + ' more ' + plural(sea.length - 1, 'line has', 'lines have') + ' less cover than the sea lead time and nothing on order: ' + sea.slice(1).map(function (r) { return esc(shortName(r.p)) + ' (' + Math.floor(r.cover) + ' days)'; }).join(', ') + '. Worth adding to the same container.</p>';
    }
    var vizRows = soon.concat(sea).slice(0, 6);
    return {
      html: html,
      viz: { type: 'cover', rows: vizRows.map(function (r) { return { label: shortName(r.p), cover: r.cover, eta: r.arrival ? r.arrival.etaDays : null }; }) },
      steps: ['Read stock levels and the order book (Linnworks)', 'Worked out each product\u2019s daily pace over 14 days', 'Matched incoming stock from Freedom Freight', 'Checked cover against each line\u2019s lead time: next day in the UK, ~' + D.SEA_LEAD_DAYS + ' days by sea'],
      sources: ['Stock levels · Linnworks · hourly', 'Open orders · every 5 min', 'Freedom Freight · container ETAs'],
      follow: ['When is the next container landing?', 'What is not selling?']
    };
  };

  A.stockof = function (q) {
    var p = findProduct(q);
    if (!p) return none('I could not tell which product you meant. Try a size and type, like "2kg CO2" or "fire blanket".');
    var c = cover(p), a = firstArrival(p), r = dailyRate(p.sku);
    var html = p.stock <= 0
      ? '<p>We have <b>none</b> of the ' + esc(p.name) + ' on the shelf' + (p.book ? '; <b>' + num(p.book) + ' ' + plural(p.book, 'unit is', 'units are') + ' waiting</b> on orders on hold' : '') + '.</p>'
      : '<p>We have <b>' + num(p.stock) + '</b> × ' + esc(p.name) + ' on the shelf' + (p.book ? ', of which ' + num(p.book) + ' are already on open orders, leaving <b>' + num(free(p)) + ' free to sell</b>' : '') + '.</p>';
    html += '<p>' + (p.stock <= 0 ? '' : r > 0 ? 'At ' + r.toFixed(1) + ' a day that lasts <b>' + (c === Infinity ? 'indefinitely' : Math.floor(c) + ' days') + '</b>. ' : 'It has not sold in the last 14 days. ') + (a ? num(a.qty) + ' more arrive on ' + a.ref + ' ' + when(a.etaDays) + '.' : 'Nothing is on order.') + '</p>';
    return {
      html: html,
      viz: { type: 'spark', unit: 'units', label: shortName(p) + ', units sold a day, 28 days', values: D.DAYS.map(function (d) { var s = 0, x = d.bySku[p.sku]; for (var k in x) s += x[k]; return s; }) },
      steps: ['Matched "' + shortName(p) + '" (' + p.sku + ')', 'Read its stock level and order book', 'Worked out cover from the 14-day pace'],
      sources: ['Stock levels · Linnworks · hourly', 'Open orders · every 5 min'],
      follow: ['How is the ' + shortName(p) + ' selling?', 'What is about to run out?']
    };
  };

  A.product = function (q) {
    var p = findProduct(q);
    if (!p) return none('I could not tell which product you meant.');
    var per = findPeriod(q), days = rangeDays(per), len = per.to - per.from + 1;
    var back = len < 7 ? 7 : len;
    var u = skuUnits(days, p.sku), prevU = per.from - back >= 0 ? skuUnits(D.DAYS.slice(per.from - back, per.from - back + len), p.sku) : 0;
    var rows = D.CHANNELS.map(function (c) { return { label: c.name, value: skuUnits(days, p.sku, c.key) }; }).filter(function (r) { return r.value > 0; }).sort(function (a, b) { return b.value - a.value; });
    var html = '<p>The <b>' + esc(p.name.replace(/^The /, '')) + '</b> sold <b>' + num(u) + ' units</b> (' + money(u * p.price) + ') over ' + per.label + (prevU ? ', ' + pct((u - prevU) / prevU) + ' on ' + (len < 7 ? 'the same ' + plural(len, 'day') + ' last week' : 'the ' + len + ' days before') : '') + '.</p>';
    if (rows.length) html += '<p>' + rows[0].label + ' sells the most of it (' + Math.round(rows[0].value / u * 100) + '%). ' + num(free(p)) + ' free in stock, about ' + (cover(p) === Infinity ? 'plenty of' : Math.floor(cover(p))) + ' days of cover.</p>';
    return {
      html: html,
      viz: { type: 'bars', unit: 'units', rows: rows },
      steps: ['Matched "' + shortName(p) + '" (' + p.sku + ')', 'Counted its units by channel over ' + per.label, 'Compared with the period before'],
      sources: ['Processed orders · Linnworks · 06:00 today', 'Stock levels · hourly'],
      follow: ['What sold best this week?', 'How many ' + shortName(p) + ' do we have?']
    };
  };

  A.channels = function () {
    var a = D.DAYS.slice(14), b = D.DAYS.slice(0, 14);
    var rows = D.CHANNELS.map(function (c) {
      var x = totals(a, c.key).rev, y = totals(b, c.key).rev;
      return { c: c, now: x, before: y, growth: y ? (x - y) / y : 0 };
    });
    var all = rows.reduce(function (s, r) { return s + r.now; }, 0);
    var g = rows.slice().sort(function (x, y) { return y.growth - x.growth; });
    var html = '<p>Comparing the last two weeks with the two before, <b>' + g[0].c.name + '</b> is growing fastest at <b>' + pct(g[0].growth) + '</b>, then ' + g[1].c.name + ' (' + pct(g[1].growth) + ').</p>';
    html += '<p>eBay is still the engine: ' + Math.round(rows[0].now / all * 100) + '% of the last fortnight’s ' + money(all) + '. ' + (g[g.length - 1].growth < 0 ? g[g.length - 1].c.name + ' slipped ' + Math.abs(Math.round(g[g.length - 1].growth * 100)) + '%.' : '') + '</p>';
    return {
      html: html,
      viz: { type: 'growth', rows: g.map(function (r) { return { label: r.c.name, value: r.now, growth: r.growth }; }) },
      steps: ['Read 28 days of processed orders', 'Split by channel', 'Compared the last 14 days with the 14 before'],
      sources: ['Processed orders · Linnworks · 28 days'],
      follow: ['Best sellers on TikTok Shop this week', 'How did Amazon do yesterday?']
    };
  };

  A.returns = function (q) {
    var per = findPeriod(q.indexOf('week') < 0 && q.indexOf('yesterday') < 0 ? q + ' 28' : q);
    var rs = D.RETURNS.filter(function (r) { return r.day >= per.from && r.day <= per.to; });
    var prod = findProduct(q);
    if (prod) {
      var mine = rs.filter(function (r) { return r.sku === prod.sku; }), sent = skuUnits(rangeDays(per), prod.sku);
      return {
        html: '<p>The <b>' + esc(prod.name.replace(/^The /, '')) + '</b> had <b>' + mine.length + ' ' + plural(mine.length, 'return') + '</b> over ' + per.label + ', from ' + num(sent) + ' sent (' + (sent ? (mine.length / sent * 100).toFixed(1) : '0') + '%).' + (mine.length ? ' Main reason: "' + mainReason(mine, prod.sku).toLowerCase() + '".' : '') + '</p><p>Across the shop it was ' + (rs.length / Math.max(1, totals(rangeDays(per)).units) * 100).toFixed(1) + '%.</p>',
        viz: null,
        steps: ['Matched "' + shortName(prod) + '" (' + prod.sku + ')', 'Read its returns booked in the Hub over ' + per.label, 'Compared them with units sent'],
        sources: ['Returns · Freedom Hub', 'Processed orders · Linnworks'],
        follow: ['Why are products coming back?', 'How is the ' + shortName(prod) + ' selling?']
      };
    }
    if (!rs.length) return none('Nothing came back over ' + per.label + '.');
    var units = totals(rangeDays(per)).units;
    var byReason = {}, bySku = {};
    rs.forEach(function (r) { byReason[r.reason] = (byReason[r.reason] || 0) + 1; bySku[r.sku] = (bySku[r.sku] || 0) + 1; });
    var reasons = Object.keys(byReason).map(function (k) { return { label: k, value: byReason[k] }; }).sort(function (a, b) { return b.value - a.value; });
    var skus = Object.keys(bySku).map(function (k) { return { p: D.BY_SKU[k], n: bySku[k], rate: bySku[k] / Math.max(1, skuUnits(rangeDays(per), k)) }; }).sort(function (a, b) { return b.n - a.n; });
    var worst = skus.slice().filter(function (s) { return s.n >= 2; }).sort(function (a, b) { return b.rate - a.rate; })[0];
    var html = '<p><b>' + rs.length + ' returns</b> over ' + per.label + ', ' + (rs.length / units * 100).toFixed(1) + '% of units sent. The top reason is <b>' + reasons[0].label.toLowerCase() + '</b> (' + reasons[0].value + ').</p>';
    if (worst) {
      var why = mainReason(rs, worst.p.sku);
      var fix = /transit/i.test(why) ? 'A corner-protected box would pay for itself.' : /missing/i.test(why) ? 'Add a second-person check on bundles before they are sealed.' : /gauge/i.test(why) ? 'Check gauges at goods-in, before stock is shelved.' : /wrong/i.test(why) ? 'Clearer size charts on the listing should cut these.' : '';
      html += '<p>The one to fix: the <b>' + esc(worst.p.name.replace(/^The /, '')) + '</b> comes back ' + Math.round(worst.rate * 100) + '% of the time, mostly "' + why.toLowerCase() + '". ' + fix + '</p>';
    }
    return {
      html: html,
      viz: { type: 'bars', unit: 'count', rows: reasons },
      steps: ['Read returns booked in the Hub over ' + per.label, 'Grouped by reason and product', 'Worked out each product’s return rate against units sent'],
      sources: ['Returns · Freedom Hub', 'Processed orders · Linnworks'],
      follow: ['What sold best this week?', 'What needs my attention?']
    };
  };
  function mainReason(rs, sku) {
    var m = {}; rs.forEach(function (r) { if (r.sku === sku) m[r.reason] = (m[r.reason] || 0) + 1; });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; })[0];
  }

  A.dispatch = function (q, ctx) {
    var car = first(CAR_WORDS, q), f = ctx.floor;
    var list = D.CARRIERS.filter(function (c) { return !car || c.key === car; }).map(function (c) { return f.carriers[c.key]; });
    var late = list.filter(function (c) { return c.late > 0; });
    var left = f.total - f.ready;
    var html = car ? '' : '<p>' + num(f.ready) + ' of ' + num(f.total) + ' parcels due out today are packed; ' + num(f.picking) + ' are being picked and ' + num(f.waiting) + ' are waiting' + (left ? '' : '') + '.</p>';
    list.forEach(function (c) {
      if (!car) return;
      html += '<p><b>' + c.carrier.name + '</b> collects at ' + D.hhmm(c.carrier.at) + ' (packed by ' + D.hhmm(c.carrier.packBy) + '): ' + c.ready + ' of ' + c.total + ' ready. ' + (c.late ? 'At today’s staffing the last one is packed at <b>' + D.hhmm(c.last) + '</b>, so <b>' + c.late + ' ' + plural(c.late, 'parcel') + ' would miss the van</b>.' : 'The last one is forecast at ' + D.hhmm(c.last) + ', <b>in time</b>.') + '</p>';
    });
    if (!car) html += late.length ? '<p><b>' + late.map(function (c) { return c.carrier.name; }).join(' and ') + ' ' + (late.length > 1 ? 'are' : 'is') + ' at risk</b>: ' + late.map(function (c) { return c.late + ' ' + plural(c.late, 'parcel') + ' forecast after ' + D.hhmm(c.carrier.packBy); }).join(', ') + '. Everything else makes its van.</p>' : '<p><b>Every carrier makes its van.</b> The last parcel is forecast at ' + D.hhmm(Math.max.apply(null, list.map(function (c) { return c.last; }))) + '.</p>';
    if (late.length && ctx.fix) html += '<p>Fix: ' + ctx.fix.text + ' It is one tap on the Team view.</p>';
    return {
      html: html,
      viz: { type: 'carriers', rows: list },
      steps: ['Read open orders (Linnworks, every 5 min)', 'Queued them by collection time through each person’s order view', 'Ran the rest of the day minute by minute at today’s staffing', 'Compared each carrier’s last parcel with its packed-by time'],
      sources: ['Open orders · Linnworks · ' + D.hhmm(ctx.now - 3), 'Day plan · Freedom Hub'],
      follow: late.length ? ['Who could help on Evri?', 'Who is behind today?'] : ['Who is busiest today?', 'How did we do yesterday?'],
      action: late.length && ctx.fix ? { label: 'Open the Team view', go: 'team' } : null
    };
  };

  A.team = function (q, ctx) {
    var f = ctx.floor, now = ctx.now;
    var rows = D.PEOPLE.map(function (p) {
      var sheet = ctx.sheets[p.id], done = sheet.filter(function (j) { return j.done; }).length;
      var late = sheet.filter(function (j) { return !j.done && j.t < now; });
      return { p: p, done: done, total: sheet.length, late: late, orders: f.people[p.id].done, pts: ctx.points[p.id] };
    });
    var html, viz;
    if (/\bpoints\b|\bleaderboard\b|\bwinning\b/.test(q)) {
      var lb = rows.slice().sort(function (a, b) { return b.pts - a.pts; });
      html = '<p><b>' + lb[0].p.name + '</b> leads the points table on ' + lb[0].pts + ', ' + (lb[0].pts - lb[1].pts) + ' ahead of ' + lb[1].p.name + '. Points come from sending the workday sheet on time and ticking every job.</p>';
      viz = { type: 'bars', unit: 'count', rows: lb.map(function (r) { return { label: r.p.name, value: r.pts }; }) };
    } else if (/\bbusiest\b|\bmost (orders|work)\b|\bpicked\b/.test(q)) {
      var bz = rows.filter(function (r) { return r.orders > 0; }).sort(function (a, b) { return b.orders - a.orders; });
      html = '<p><b>' + bz[0].p.name + '</b> has packed the most today: ' + bz[0].orders + ' orders. ' + bz.slice(1, 3).map(function (r) { return r.p.name + ' ' + r.orders; }).join(', ') + '.</p>';
      viz = { type: 'bars', unit: 'count', rows: bz.map(function (r) { return { label: r.p.name, value: r.orders }; }) };
    } else if (/\bstudents?\b|\bt level\b|\bplacements?\b|\bapprentic/.test(q)) {
      var learners = D.PEOPLE.filter(function (p) { return p.student || /placement/i.test(p.role); });
      html = '<p><b>' + learners.length + ' ' + plural(learners.length, 'learner') + '</b> on shift today: ' + learners.map(function (p) { return p.name + ' (' + lc1(p.role) + ')'; }).join(' and ') + '. Students are never moved by the system; they follow their own learning plan, with hours and sign-offs logged.</p>';
      viz = { type: 'table', head: ['Person', 'Role', 'Sheet', 'Orders'], rows: learners.map(function (p) { var r = rows.filter(function (x) { return x.p === p; })[0]; return [p.name, p.role, r.done + '/' + r.total, String(r.orders)]; }) };
    } else if (/\bon shift\b|\bwho'?s in\b|\bwho is in\b|\bworking today\b|\bwho is working\b|\bwho'?s working\b/.test(q)) {
      html = '<p><b>' + D.PEOPLE.length + ' people</b> are on shift today. Right now: ' + D.PEOPLE.map(function (p) {
        var b = null; p.blocks.forEach(function (x) { if (now >= x[0] && now < x[1]) b = x; });
        var mv = ctx.extra[p.id] && ctx.extra[p.id].some(function (w) { return now >= w[0] && now < w[1]; });
        return p.name + ', ' + (mv ? 'Evri picking' : b ? lc1(b[2]) : 'on a break');
      }).join('; ') + '.</p>';
      viz = { type: 'table', head: ['Person', 'Role', 'Hours'], rows: D.PEOPLE.map(function (p) { return [p.name, p.role, p.start + '–' + p.end]; }) };
    } else if (/\bevri\b|\bhelp\b|\bfree\b|\bspare\b|\bcould\b/.test(q) && ctx.fix) {
      html = '<p>' + ctx.fix.text + '</p><p>I tried every person who is not picking this afternoon and kept the smallest change that gets every parcel out on time.</p>';
      viz = { type: 'carriers', rows: [f.carriers.evri] };
    } else {
      var behind = rows.filter(function (r) { return r.late.length; });
      html = behind.length ? '<p><b>' + behind.length + ' ' + plural(behind.length, 'person has', 'people have') + ' jobs past their time</b>: ' + behind.map(function (r) { return r.p.name + ' (' + r.late.map(function (j) { return lc1(j.title); }).join('; ') + ')'; }).join(', ') + '.</p>' : '<p>Nobody is behind on their sheet.</p>';
      html += '<p>' + D.PEOPLE.length + ' on shift. Across the team, ' + rows.reduce(function (s, r) { return s + r.done; }, 0) + ' of ' + rows.reduce(function (s, r) { return s + r.total; }, 0) + ' workday jobs are ticked.</p>';
      viz = { type: 'table', head: ['Person', 'Sheet', 'Orders', 'Late jobs'], rows: rows.map(function (r) { return [r.p.name, r.done + '/' + r.total, String(r.orders), String(r.late.length)]; }) };
    }
    return {
      html: html, viz: viz,
      steps: ['Read today’s workday sheets', 'Read who packed what from the floor', 'Checked each job against its time'],
      sources: ['Workday sheets · Freedom Hub', 'Packing floor · live'],
      follow: ['Will we get everything out today?', 'Who is top of the points table?']
    };
  };

  A.person = function (q, ctx) {
    var p = findPerson(q), sheet = ctx.sheets[p.id], now = ctx.now;
    var cur = null; p.blocks.forEach(function (b) { if (now >= b[0] && now < b[1]) cur = b; });
    var extra = ctx.extra[p.id] && ctx.extra[p.id].some(function (w) { return now >= w[0] && now < w[1]; });
    var late = sheet.filter(function (j) { return !j.done && j.t < now; });
    var st = ctx.floor.people[p.id];
    var html = '<p><b>' + p.name + '</b> (' + lc1(p.role) + ') is on <b>' + (extra ? 'Evri picking, moved by you' : cur ? lc1(cur[2]) : 'a break') + '</b> right now' + (st.now ? ', with order ' + st.now.id + ' in hand' : '') + '.</p>';
    html += '<p>' + sheet.filter(function (j) { return j.done; }).length + ' of ' + sheet.length + ' sheet jobs ticked' + (late.length ? ', ' + late.length + ' late (' + late.map(function (j) { return lc1(j.title); }).join('; ') + ')' : ', none late') + '. ' + st.done + ' orders packed today, ' + ctx.points[p.id] + ' points.</p>';
    return {
      html: html,
      viz: { type: 'sheet', rows: sheet.map(function (j) { return { t: D.hhmm(j.t), title: j.title, done: j.done, late: !j.done && j.t < now }; }) },
      steps: ['Found ' + p.name + ' on today’s rota', 'Read their workday sheet and day plan', 'Read their packing from the floor'],
      sources: ['Workday sheets · Freedom Hub', 'Day plan · Freedom Hub'],
      follow: ['Who is behind today?', 'Who is busiest today?']
    };
  };

  A.inbound = function () {
    var cs = D.CONTAINERS;
    var html = '<p>The next container is <b>' + cs[0].ref + '</b>, ' + cs[0].status.toLowerCase() + ', landing at ' + cs[0].port + ' in about <b>' + cs[0].etaDays + ' days</b> with ' + num(sumObj(cs[0].lines)) + ' units on ' + Object.keys(cs[0].lines).length + ' lines.</p>';
    var saves = Object.keys(cs[0].lines).map(function (k) { return D.BY_SKU[k]; }).filter(function (p) { return cover(p) < 30; });
    if (saves.length) html += '<p>It matters most for the ' + saves.map(function (p) { return '<b>' + esc(shortName(p)) + '</b> (' + Math.floor(cover(p)) + ' days left)'; }).join(' and ') + '.</p>';
    html += '<p>After that, ' + cs[1].ref + ' is ' + cs[1].status.toLowerCase() + ', about ' + cs[1].etaDays + ' days out. Door to door, a sea order takes about ' + D.SEA_LEAD_DAYS + ' days.</p>';
    return {
      html: html,
      viz: { type: 'table', head: ['Container', 'Status', 'Lands in', 'Units'], rows: cs.map(function (c) { return [c.ref, c.status, c.etaDays + ' days', num(sumObj(c.lines))]; }) },
      steps: ['Read live shipments from Freedom Freight', 'Matched each line to today’s stock cover'],
      sources: ['Freedom Freight · shipment tracker'],
      follow: ['What is about to run out?', 'What should we reorder?'],
      link: { label: 'See it on Freedom Freight', href: 'https://freedomfreight.co.uk/' }
    };
  };
  function sumObj(o) { var s = 0; for (var k in o) s += o[k]; return s; }

  A.aov = function (q) {
    var per = findPeriod(q), days = rangeDays(per), ch = first(CH_WORDS, q);
    var rows = D.CHANNELS.map(function (c) { var t = totals(days, c.key); return { label: c.name, value: t.orders ? t.rev / t.orders : 0 }; }).sort(function (a, b) { return b.value - a.value; });
    var t = totals(days), html;
    if (ch) {
      var tc = totals(days, ch), rank = rows.map(function (r) { return r.label; }).indexOf(chName(ch)) + 1;
      html = '<p>The average ' + chName(ch) + ' order over ' + per.label + ' was <b>' + money(tc.rev / Math.max(1, tc.orders), 2) + '</b>, against ' + money(t.rev / t.orders, 2) + ' across every channel. That ranks ' + ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth'][rank] + ' of ' + rows.length + '.</p>';
    } else html = '<p>The average order over ' + per.label + ' was <b>' + money(t.rev / t.orders, 2) + '</b>. ' + rows[0].label + ' baskets are the biggest at ' + money(rows[0].value, 2) + '; ' + rows[rows.length - 1].label + ' the smallest at ' + money(rows[rows.length - 1].value, 2) + '.</p>';
    return {
      html: html, viz: { type: 'bars', unit: 'money2', rows: rows },
      steps: ['Read processed orders over ' + per.label, 'Divided sales by orders for each channel'],
      sources: ['Processed orders · Linnworks'],
      follow: ['What sold best this week?', 'Which channel is growing fastest?']
    };
  };

  A.attention = function (q, ctx) {
    var items = ctx.attention();
    var html = '<p>' + (items.length ? '<b>' + items.length + ' ' + plural(items.length, 'thing needs', 'things need') + ' you</b> today, most urgent first:' : 'Nothing needs you right now.') + '</p><ol>';
    items.forEach(function (it) { html += '<li><b>' + esc(it.title) + '</b>. ' + esc(it.why) + '</li>'; });
    html += '</ol>';
    return {
      html: html, viz: null,
      steps: ['Checked collections against the floor forecast', 'Checked the three Linnworks feeds are on time', 'Read decisions waiting for a yes or no', 'Checked stock cover against incoming containers'],
      sources: ['Open orders · Linnworks', 'Decisions · Freedom Hub', 'Stock levels · Linnworks'],
      follow: ['Will we get everything out today?', 'What is about to run out?']
    };
  };

  // Today: the sales file only covers up to yesterday, so today is read from
  // the open orders that have come in since the cut-off.
  A.today = function (q, ctx) {
    var ord = D.ORDERS, now = ctx.now;
    var overnight = ord.filter(function (o) { return o.overnight; });
    var since = ord.filter(function (o) { return !o.overnight && o.arrive <= now; });
    var val = since.reduce(function (s, o) { return s + o.value; }, 0);
    var byCh = {}; since.forEach(function (o) { byCh[o.channel] = (byCh[o.channel] || 0) + 1; });
    var rows = Object.keys(byCh).map(function (k) { return { label: chName(k), value: byCh[k] }; }).sort(function (a, b) { return b.value - a.value; });
    var promo = since.filter(function (o) { return o.promo; }).length;
    var f = ctx.floor;
    var html = '<p>So far today, <b>' + since.length + ' orders</b> worth <b>' + money(val) + '</b> have come in since 08:00, on top of ' + overnight.length + ' that arrived overnight.' + (promo ? ' ' + promo + ' of today’s are from the Temu lunchtime promotion.' : '') + '</p>';
    html += '<p>On the floor, ' + f.ready + ' of ' + f.total + ' parcels due out today are packed. Full sales figures for today arrive with tomorrow’s 06:00 file.</p>';
    return {
      html: html, viz: { type: 'bars', unit: 'count', rows: rows },
      steps: ['Read open orders (Linnworks, every 5 min)', 'Counted orders received since 08:00 by channel', 'Read the packing floor'],
      sources: ['Open orders · Linnworks · ' + D.hhmm(now - 3)],
      follow: ['Will we get everything out today?', 'How did we do yesterday?']
    };
  };

  A.tom = function () {
    return {
      html: '<p>Tom Letcher is the founder and managing director. This is his dashboard: the Founder view shows what needs him today. Everyone else in this demo is invented; on the real system they are the team on the floor.</p>',
      viz: null, steps: [], sources: [],
      follow: ['What needs my attention?', 'Who is on shift?'], action: { label: 'Open the Founder view', go: 'founder' }
    };
  };

  A.outside = function () {
    return {
      html: '<p>That is not in this demo’s data. The demo holds <b>orders</b>, <b>sales by channel</b>, <b>stock</b>, <b>returns</b>, <b>the team</b> and <b>shipments from China</b>; finance, customers and reviews stay in their own systems. Ask Tom for those.</p>',
      viz: null, steps: [], sources: [], follow: HELP.slice(0, 3)
    };
  };

  function none(text) {
    return { html: '<p>' + text + '</p>', viz: null, steps: [], sources: [], follow: ['What needs my attention?', 'How did we do yesterday?'] };
  }

  function shortName(p) { return p.name.replace(/^FIRESTORM /, '').replace(/ Extinguisher$/, ''); }

  var HELP = ['How did we do yesterday?', 'Will we get everything out today?', 'What is about to run out?', 'What sold best this week on eBay?', 'Which channel is growing fastest?', 'Why are products coming back?', 'Who is behind today?', 'When is the next container landing?', 'How many 2kg CO2 do we have?'];

  function ask(question, ctx) {
    // Markup is never a question: anything inside <...> is dropped before reading.
    var q = ' ' + String(question || '').replace(/<[^>]*>?/g, ' ').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim() + ' ';
    var intent = classify(q);
    if (!intent) {
      return { intent: null, html: '<p>I can answer questions about <b>sales</b>, <b>orders and dispatch</b>, <b>stock</b>, <b>returns</b>, <b>the team</b> and <b>shipments from China</b>. I could not match that one to any of them. Try one of these:</p>', viz: null, steps: [], sources: [], follow: HELP.slice(0, 4) };
    }
    var out = A[intent](q, ctx);
    out.intent = intent;
    // Sales history ends yesterday; say so rather than quietly answering a different question.
    if (/\btoday\b/.test(q) && ['top', 'sales', 'product', 'aov', 'channels', 'slow'].indexOf(intent) >= 0) {
      out.html = '<p class="faint">Today’s sales arrive with tomorrow’s 06:00 file, so this covers the days to yesterday.</p>' + out.html;
    }
    return out;
  }

  root.FCC_ASK = { ask: ask, riskRows: riskRows, reorderQty: reorderQty, lc1: lc1, HELP: HELP, money: money, num: num, pct: pct, esc: esc, cover: cover, dailyRate: dailyRate, free: free, firstArrival: firstArrival, shortName: shortName, totals: totals };
})(typeof window !== 'undefined' ? window : globalThis);
