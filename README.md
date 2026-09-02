# King's Awards — Freedom Fire & Safety

Two static websites prepared as supporting material for a King's Awards for Enterprise
application. No build step, no dependencies — open the HTML files directly.

```
kings-awards/
├── index.html            Gateway linking both sites
├── personal/index.html   Tom Letcher — formal professional profile
├── staff/index.html      The People of Freedom Fire — team site
├── assets/               ff_logo.png, ff_logo_black.png, FireStorm.png
└── README.md
```

Open `index.html` in a browser. The only external requests are Google Fonts; everything else
is inline or local.

---

## ⚠️ Two things to check before going further

**1. The deadline is 1pm on Tuesday 8 September 2026.** Applications for the 2027 awards close
then. That is one week from today. If you intend to apply this cycle, the placeholder content
below needs filling in the next few days.

**2. Categories: the STAFF site supports a Promoting Opportunity (social mobility) application. The founder page's category is still to be confirmed.**
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
The founder page is untouched by this category pending its own.

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

| Section | What's needed |
|---|---|
| Hero | Professional portrait, 4:5 portrait orientation, min 1200×1500px |
| 01 Profile | Two or three paragraphs on your route into fire safety — what you did before 2021, why you started rather than stayed employed |
| 02 The business | Confirm the three service pillars match reality; add fire doors / passive / sprinklers / dry risers if applicable |
| 03 Trajectory | 2022 headline; 2023–24 headcount, coverage, accreditations (BAFE SP101/SP203, FIA, SafeContractor, CHAS, ISO 9001, NSI, SSAIB), apprenticeships |
| 04 Leadership | **The whole section** — four short pieces: fresh thinking, growth and influence, long-term vision, resilience |
| Pull quote | One sentence in your own voice on why the work matters |
| 05 Governance | HMRC and filing status, accreditation reference numbers, insurance, engineer training and re-certification, environmental measures, community work |
| 07 Contact | Direct email, and mobile if you want it public |

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

**Personal** — light, editorial, restrained. Serif headings (Source Serif 4), generous
whitespace, hairline rules, a single muted gold accent, no animation. Structured around the
five themes the King's Awards assessment looks for: fresh ideas, growth and influence,
long-term vision, resilience, and customer value. Third person throughout, which reads as more
credible than first person for an award submission; there is one first-person pull quote for
contrast.

**Staff** — dark, brand-led, louder. Barlow Condensed display type, the night-navy and flame
palette taken from the existing Freedom Freight page (`#0a0e16`, `#e01b0e`, `#ff6a1f`,
`#ffb454`), ember drift in the hero, scroll reveals, hover lift on cards. Uses the white
Freedom logo throughout; the personal site uses the black version in its footer.

Both are responsive, keyboard-navigable, respect `prefers-reduced-motion`, and print sensibly.

---

## Hosting

Currently local files. If you want them online, the same pattern as Freedom Freight works —
a Cloudflare static-asset Worker serving a directory, behind Cloudflare Access if it should
stay private during drafting. Worth keeping private until the placeholders are gone, since the
`noindex,nofollow` tags on both pages are a request to search engines, not a lock.
