# Changelog — founder page (`personal/`)

## 3 September 2026 — the evidence-led rebuild

The founder page was rebuilt as a single, evidence-led experience with two pathways: the story
and the verified record. The visual identity — ivory, carbon and magenta, the condensed display
type, the script accents, the black-and-ivory chapter rhythm, the portrait-led hero and the
pink line — is kept and refined. Everything that could not be supported by a public record was
either removed or marked, and moved to `_private/CONTENT_REQUIRED.md`.

### Content and truth
- **Every claim was checked against Companies House on 3 September 2026** (company overview,
  officers, persons with significant control, filing history, the founder's appointments and a
  company-name search). The page now carries facts the previous version did not have: four years
  of accounts filed, four confirmation statements, £100 stated capital, the PSC entry (75%+ shares
  and votes), the registered-office change in February 2025, and the next filing dates.
- **No placeholders remain.** Every "TK", "Tom to supply", "Outstanding" and editorial note has
  gone from the public page. Twenty-three items are logged privately with owner and status.
- **The Young Founder contradiction is stated, not softened.** The record shows the age test as
  *Not verified*, with the reason (date of birth April 1996 on the register).
- **The group is described as what it is.** The register shows one company. Freedom Global,
  Freedom Distribution and Freedom Facilities are shown as stated by the company and marked
  *Not verified*; the brands as *Pending evidence*; the 2029+ ventures as stated intent. The
  company's own site was found to contradict the previous page on two of these statuses.
- **No unverified statistic appears anywhere.** Reported revenue and marketplace figures are
  withheld; the record says what evidence would be needed to state them.
- **Every material statistic has a period, a definition and a source.** Four metrics in
  Measured progress, each with an expandable source and a link into the register.

### Information architecture
- One page, two routes: **Explore the story** and **Review the evidence**, both from the hero.
- Sections: Hero · Thirty-second record · Origin · The build · Measured progress · The Freedom
  Group · Operating philosophy · What comes next · Verified record · Contact.
- Navigation, the chapter indicator in the header, the mobile section menu and the section
  headings all use the same names. The Explore / Verified Record pill is gone; the record is
  a section reached by nav, by both calls to action and by the skip links.
- A **thirty-second record** answers who, what he founded, what it does, what has been achieved,
  what is verifiable and what to do next, each with its status.

### The verified record
- Rebuilt as the strongest part of the page: 24 entries in six groups (identity and
  registration, eligibility, operating companies and brands, commercial evidence, governance and
  compliance, press and recognition) plus contact.
- Each entry states the **claim, status (Verified / Pending evidence / Not verified), period,
  source with a direct link, date checked, and a plain-English explanation.** Status is shown by
  shape and word, never colour alone.
- A **last-checked date** with a staleness flag (script marks the record as due for re-checking
  after 90 days), a status key, and a **Print the evidence pack** button. Print styles strip all
  decoration, print link URLs after each source, and keep entries unbroken across pages.

### Motion, accessibility and readability
- The entrance loader, custom cursor, marquees and per-frame animation loops are gone. Work
  happens only on scroll; nothing animates off-screen.
- The pinned "One key. One unit. One director. Aged 25." sequence is one 1.5-viewport section
  with a visible **Skip the story** link. Body copy never animates.
- **The line** is SVG, drawn by stroke offset (no layout), switches sides only in the padding
  band at the top of a section (never across text), is fully drawn for reduced-motion users, and
  becomes a simple vertical rail on small screens.
- **The group map** is redrawn as flat shapes on three orbits with a legend, visible statuses,
  keyboard-operable nodes (`aria-pressed`), a live-region detail panel with a supporting link, and
  an equivalent table that is also the phone layout.
- Skip links to the story and the evidence; semantic landmarks; a logical heading order; focus
  rings on every interactive element; 44px targets; a focus-trapped section menu; a no-JS fallback
  (the page reads in order and the map's table stands in for the diagram).
- Body copy 17–19px, side copy 16px, labels 13–14px, line lengths 55–70 characters. All
  text/background pairs meet WCAG AA (measured 4.65:1 to 16.9:1). Sticky-header collisions are
  prevented by scroll margins on every anchor.

### Performance and sharing
- Fonts are **self-hosted Latin subsets** (Anton, Inter variable 400–600, Instrument Serif
  italic — 89 KB in total), preloaded; there are now **no third-party requests at all**.
- The portrait and logos ship as WebP with JPEG/PNG fallbacks and explicit dimensions; below-the-
  fold images are lazy-loaded; the hero image is fetch-priority high.
- Descriptive title and description, canonical URL, Open Graph and Twitter cards, a designed
  1200×630 share image, a touch icon, and Person / Organization / ProfilePage JSON-LD built only
  from register facts. The page stays `noindex` until the content is approved (see
  `_private/CONTENT_REQUIRED.md`, item 21).

### Footer
- Contact routes, company registration, a privacy statement (no cookies, no analytics, no
  third-party scripts — now literally true), an accessibility statement with a contact route,
  and copyright.

### Test and audit results (local, 3 September 2026)
- Six viewports (360×800, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080): no horizontal
  overflow, CLS ≤ 0.0002, console clean, fonts loaded, every external link 200.
- Keyboard walk from the first element to the footer: 86 stops, all with a visible focus ring,
  in a sensible order; the section menu traps focus and returns it on close.
- Reduced motion: the line is drawn in full, the pinned sequence is static, nothing moves.
- No-JS: page renders and reads in order.
- Lighthouse desktop: performance 100, accessibility 100, best practices 100. SEO 66 only
  because of the deliberate `noindex` (the remaining SEO audits pass).
- Full results, screenshots (before and after) and the printed evidence pack are in `_qa/`.

### Earlier the same day
- Keyboard and reduced-motion fixes, the chapter card moved into the header on laptop widths,
  the entrance timeout, Record header alignment, README rewrite (see git history).
