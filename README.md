# King's Awards — Freedom Fire & Safety

Two static websites prepared as supporting material for a King's Awards for Enterprise
application. No build step, no dependencies.

**The founder page (`personal/`) was rebuilt on 3 September 2026 as an evidence-led profile**
with a verified record. It carries no placeholders; every gap is logged in
`_private/CONTENT_REQUIRED.md`. What changed is in `CHANGELOG.md`; test results and
screenshots are in `_qa/`. The team site (`staff/`) has not had that pass yet — the
placeholder list below still applies to it.

```
kings-awards/
├── index.html            Gateway linking both sites
├── personal/index.html   Tom Letcher — The Freedom Line (founder page)
├── personal/thread.js    the page's engine: the line, the pinned scene, the map
├── staff/index.html      The People of Freedom Fire — team site
├── staff/engine.js       its engine
├── assets/               logos, the portrait, the team and floor photographs
├── CNAME                 awards.freedomgroup.uk
└── README.md
```

## Run, build, deploy

- **Run locally:** any static server from the repository root, e.g.
  `python -m http.server 8080` or `npx serve .`, then open `http://localhost:8080/personal/`.
  Opening the HTML files directly also works.
- **Build:** there is no build. Edit `personal/index.html` (all CSS is inline) and
  `personal/thread.js`.
- **Deploy:** GitHub Pages serves `main`; a push is a deploy (the `CNAME` file maps
  `awards.freedomgroup.uk`). Folders beginning with an underscore (`_private/`, `_qa/`) are
  not published. `README.md` **is** published.
- **Fonts and images:** the founder page makes no third-party requests — fonts are self-hosted
  Latin subsets in `assets/fonts/`, images are WebP with JPEG/PNG fallbacks. The team site still
  loads Google Fonts.
- **Re-check the record:** the verified record states "last checked 3 September 2026" and flags
  itself as stale after 90 days. Re-check the Companies House links in `personal/index.html`,
  update every `<time datetime>` and the dates in the copy, and republish.
- **Going public:** the page is `noindex,nofollow` until Tom approves it. To index it, change the
  robots meta tag in `personal/index.html`, add a `sitemap.xml`, and re-run Lighthouse SEO.

---

## ⚠️ Two things to check before going further

**1. The deadline is 1pm on Tuesday 8 September 2026.** Applications for the 2027 awards close
then. That is one week from today. If you intend to apply this cycle, the placeholder content
below needs filling in the next few days.

**2. Categories: the STAFF site supports a Promoting Opportunity (social mobility) application. The FOUNDER page supports a Young Founder application.**
Young Founder is out regardless — Companies House records Tom's DOB as April 1996, making
him 31 on 6 May 2027, past the 18–30 limit.

The social mobility criteria the sites now mirror:

- A programme supporting people from disadvantaged backgrounds into work — running **at
  least 2 years** — via one or more of: work experience/careers advice, mentoring,
  interview and job-related training, recruitment open to everyone
- **Provable benefit to four groups**: the people supported, the organisation, employees,
  the wider community
- Social mobility must NOT be the organisation's main focus (Freedom Fire is a fire safety
  company — this fits, and both sites now say so explicitly)

Where this lives: the staff site's **chapter 07 — The Open Door** is the programme page
(four criteria activities + the four proofs + the two-year test, all with evidence slots).
The founder page carries the Young Founder gates in its Verified Record: actively
leading 6 May 2026 - 8 Sept 2027 (already evidenced by the register), the 18-30 age test
(WARNING - UNRESOLVED: the register says April 1996 -> 31 on 6 May 2027; settle this before
anything else), and the commercial threshold (250k GBP turnover or 500k GBP external
funding, evidence outstanding).

⚠️ **The two-year test is a hard gate.** If the programme cannot show a start date ≥2
years before submission with a dated record behind it, this category must wait a cycle —
establish that before writing another word of the application.

Sources: [King's Awards for Enterprise](https://www.gov.uk/kings-awards-for-enterprise) ·
[eligibility](https://www.gov.uk/kings-awards-for-enterprise/eligibility) ·
[how to apply](https://www.gov.uk/kings-awards-for-enterprise/how-to-apply). Helpline
020 4551 0081.

---

## What's real and what isn't

Every factual claim on both sites comes from one of two places:

- **The Companies House register** (verified 30 August 2026) — company number 13589467,
  incorporated 27 August 2021, SIC 84250, registered office, Tom Letcher's directorship and
  April 1996 date of birth.
- **The company's own material** — freedom-fire.co.uk, the phone number, the Freedom Freight
  supply chain page, the Firestorm brand, and details you confirmed directly (nationwide
  coverage, homes and businesses, 11–50 people).

**Nothing has been invented.** No accreditations, no turnover figures, no testimonials, no
staff names, no awards. Where content was needed but not known, there is a marked placeholder
instead. An award assessment tests claims, so anything unverifiable was left for you to write.

Placeholders appear as dashed amber boxes (`.tk`) and inline highlights (`.tk-inline`). They
are deliberately obvious. Search either file for `class="tk` to find them all.

---

## Placeholders to fill

### `personal/index.html` — Tom Letcher

No placeholders remain on the page. Everything Tom still needs to supply or decide — 23 items,
each with the evidence required, an owner and a status — is in `_private/CONTENT_REQUIRED.md`.
The two that block the most: the Young Founder age test (the register says April 1996) and the
"Freedom Global Ltd" entity, which the company's own site names but the register does not show.

### `staff/index.html` — The People of Freedom Fire

| Section | What's needed |
|---|---|
| Who we are | Two or three paragraphs on what it's actually like to work there |
| The work | Confirm the four disciplines match the real service list |
| The team | **Names, roles, one line each, and square photos (min 800×800px)** for eight cards — duplicate or delete to match headcount. Same framing and background for every photo |
| Firestorm | What products sit under the brand, what the specification does differently, launch date, trademark number, product photography |
| How we work | Confirm value 04 — apprenticeships and funded qualifications |
| Join us | Careers email, open roles, what you offer (training, van, tickets, progression) |
| **07 The Open Door** | **The award chapter.** Four criteria activities with dates and numbers; the four proofs (people/business/team/community); the programme start date for the two-year test — with documents |

**Get written consent** from every member of staff before publishing their name and photograph,
and leave out anyone who would rather not appear.

---

## Design notes

Two deliberately different registers, because they are for different readers.

**Personal — The Freedom Line.** One pink line is drawn from the first unit to what comes
next. It enters the hero from the left, lifts over the portrait, drops down the right with
four spurs (Fire, Global, Distribution, Facilities), threads all seven chapters and settles
at the foot of the page with a beacon and "still drawing". Porcelain, carbon and pink, with
pink held to roughly 5% of the surface. Anton for display, Inter for text, Instrument Serif
italic for the script accents. Around the chapters: an entrance line, a custom cursor,
velocity marquees, a pinned 2021 scene ("One key. One unit. One director. Aged 25."),
drifting topographic contours, poster words, a years rail that moves with the scroll, and
a corner card naming the chapter. Chapter 04 is the group map drawn as the Freedom Group
logo's orbital system — gradient planets on a tilted pink tape, operating companies lit,
planned ones small and dark on the outer ring. **Explore ⇄ Verified Record** in the header
swaps the whole thing for a clean printable page behind a pink wipe. Third person
throughout, one first-person pull quote. Keyboard-navigable (skip link, focus-trapped
chapter sheet), and `prefers-reduced-motion` collapses it all to a still, fully readable
page.

**Staff** — dark, brand-led, louder. Barlow Condensed display type, the night-navy and flame
palette taken from the existing Freedom Freight page (`#0a0e16`, `#e01b0e`, `#ff6a1f`,
`#ffb454`), ember drift in the hero, scroll reveals, hover lift on cards. Uses the white
Freedom logo throughout; the personal site uses the black version in its footer.

Both are responsive, keyboard-navigable, respect `prefers-reduced-motion`, and print sensibly.

---

## Hosting

Live at **https://awards.freedomgroup.uk** — GitHub Pages from this repo (the `CNAME` file),
so a push to `main` is a deploy. Gateway at `/`, founder page at `/personal/`, team site at
`/staff/`. There is no access control: the `noindex,nofollow` tags on both pages are a
request to search engines, not a lock, so treat the address as private by obscurity only,
and do not circulate it until the placeholders are gone.
