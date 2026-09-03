# QA results — founder page, 3 September 2026

Everything below was run against the final files, served locally (`serve.js`, port 8080) and
driven through headless Chrome over the DevTools protocol (`qa-harness.js`). Lighthouse 12 was
run with `npx lighthouse@12`. This folder starts with an underscore so GitHub Pages does not
publish it.

## Responsive (six viewports)

| Viewport | Horizontal overflow | CLS (full scroll-through) | Console | Fonts loaded |
|---|---|---|---|---|
| 360×800 | none (360/360) | 0 | clean | Anton, Inter, Instrument Serif |
| 390×844 | none | 0 | clean | all |
| 768×1024 | none | 0 | clean | all |
| 1024×768 | none | 0.0002 | clean | all |
| 1440×900 | none | 0.0001 | clean | all |
| 1920×1080 | none | 0.00004 | clean | all |

Screenshots of the hero, thirty-second record, origin, progress, group, record and contact at
each width are in `screenshots/after/`. `screenshots/before/` holds the previous version at
1440 and 390 (rendered with the Google Fonts link stripped, because the sandbox had no network;
the layout is otherwise as it was).

Sticky-header check: after anchor navigation every section heading sits well below the 80px
header (scroll margins on all anchors). No clipped text found in the screenshots.

## Lighthouse 12

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop | **100** | **100** | **100** | 66 |
| Mobile (throttled) | **95** | **100** | **100** | 66 |

Mobile: LCP 2.3 s, CLS 0, TBT 150 ms, Speed Index 1.8 s. Desktop: LCP 0.5 s, CLS 0, TBT 0 ms.

SEO is 66 only because of the deliberate `noindex,nofollow` tag (`is-crawlable` fails). Every
other SEO audit passes. The tag stays until Tom approves the content — see
`_private/CONTENT_REQUIRED.md` item 21.

Remaining sub-100 audits are hosting matters, not page defects: text compression and minification
are served by GitHub Pages / the CDN; the DOM-size warning is the 24-entry record.

Full reports: `lighthouse-desktop.html`, `lighthouse-mobile.html`.

## Accessibility

- **Keyboard walk** from the first element to the footer: 86 stops, every one with a visible
  3px focus ring, in document order: skip links → header nav → chapter spine → hero spurs and
  calls to action → thirty-second record links → skip-the-story → sources → group map nodes →
  panel link → table links → get in touch → print button → every source link in the record →
  contact → footer. (`harness-report.txt`)
- **Section menu (phone):** opening moves focus to Close; Tab is trapped inside; Escape closes
  and returns focus to the menu button. Verified programmatically.
- **Group map:** every node is a real button, keyboard-activated, `aria-pressed` reflects the
  selection, the panel is a live region, and the table beneath is the equivalent for screen
  readers and the layout used under 600px.
- **Reduced motion:** the line is drawn in full on load (`stroke-dashoffset: 0`), the head sits
  at its end, the pinned sequence renders static, nothing animates. Screenshots
  `1440-reduced-motion-*.jpg`.
- **No JavaScript:** the page renders and reads in order; the map's nodes render at their
  inline positions and the table stands in for interaction. Screenshots `1440-nojs-*.jpg`.
- **Contrast** (computed, WCAG 2.x formula): every text/background pair used on the page is
  between 4.65:1 and 16.9:1. Pink text uses a deeper tone on ivory (#C60F6E, 5.0:1) and the
  brand pink on carbon (#FF2D8D, 5.4:1). Status is carried by shape and word, never colour alone.
- **Touch targets:** buttons, nodes, nav links and skip links are 44px or larger.
- Heading order is h1 → h2 → h3 → h4 throughout (Lighthouse `heading-order` passes).

## Links and assets

- All ten external links return HTTP 200 (Companies House ×7, gov.uk, freedomgroup.uk,
  freedom-fire.co.uk).
- All local assets load (no 4xx in any run). No third-party requests are made.
- Public page contains no "TK", "TODO", "Tom to supply", "Outstanding" or "one click away".

## Print

`evidence-pack.pdf` is the page printed from headless Chrome: header, navigation, story sections
and decoration are removed; the founder's name and proposition head the pack; each record entry
is kept whole on a page and its source URL is printed after the link.

## Not done, and why

- **The screen recording** (`20260903-0821-11.7964346.mp4`) could not be decoded by headless
  Chrome or Edge on this machine (no ffmpeg available), so the "before" comparison uses renders
  of the live site as it stood that morning instead.
- **INP** cannot be measured without real user interaction; TBT (150 ms mobile, 0 ms desktop) and
  the absence of long tasks after load are the proxies.
- **AVIF** was not generated (no encoder available); WebP with JPEG/PNG fallback is used.
