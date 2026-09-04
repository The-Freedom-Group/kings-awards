# King's Awards — Freedom Fire & Safety

Two static websites prepared as supporting material for a King's Awards for Enterprise
application. No build step, no dependencies — open the HTML files directly.

```
kings-awards/
├── index.html            Gateway linking both sites
├── personal/index.html   Tom Letcher — The Freedom Line (founder page)
├── personal/thread.js    the page's engine: the line, the pinned scene, the map
├── staff/index.html      The Way In — team site
├── staff/engine.js       its engine
├── assets/               logos, the portrait, the team and floor photographs
├── CNAME                 awards.freedomgroup.uk
└── README.md
```

Open `index.html` in a browser. The only external requests are Google Fonts; everything else
is inline or local.

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

Beyond the gates, Young Founder needs evidence of impact across **five themes**, which
chapter 05 and the Verified Record now follow in the award's own order:

| Theme | Evidence needed |
|---|---|
| Fresh ideas and creative thinking | Short video, up to 2 minutes, on the founder's journey from idea to impact |
| Driving growth and industry influence | Business performance over the past 1-2 years showing growth, plus external recognition (speaking testimonials, awards, media) |
| Leading and big-picture thinking | The organisation's long-term vision and how it is implemented |
| Strategic resilience | Challenges faced and how the organisation adapted |
| Customer value | How customer satisfaction is measured and used to improve products or services |

All five are outstanding, and the video does not exist yet.

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
| 04 Leadership | **The whole section** — five short pieces in the award's order: fresh ideas, growth and influence, big-picture leadership, resilience, customer value — plus the 2-minute video |
| Pull quote | One sentence in your own voice on why the work matters |
| 05 Governance | HMRC and filing status, accreditation reference numbers, insurance, engineer training and re-certification, environmental measures, community work |
| 07 Contact | Direct email, and mobile if you want it public |

### `staff/index.html` — The Way In

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

**Staff — The Way In.** Built for one reader, the assessor, and cut back on 4 September 2026 to the
Promoting Opportunity criteria and nothing else. Every chapter answers a line of the eligibility text, in
order: 01 the five tests as an index; 02 the programme and its four activities (work experience and careers
advice, mentoring, interview and job-related training, recruitment open to everyone), with the route from
starter to mentor; 03 the two-year test with the inspection-tag ruler; the three stories and 04 the nine
people it supported, as full-width tiles ticked present as you reach them, each opening a profile sheet
with the question, the film slot and their own words; 05 the proofs for the four groups (the people
supported, the organisation, the employees, the wider community); 06 the two public commitments (T Level
Ambassadors, Disability Confident) and the two exclusions (social mobility is not the main focus; not a
training provider); 07 the door, which is recruitment open to everyone with the contact details. Removed
at the same time: the break-glass call point, the fire-class quiz, the "more than a hiring policy"
interlude, the marquee and the "protecting for" ticker.

Skin: UK fire-safety signage in red, white, grey and black. Archivo wide and heavy for the big lines with
one Instrument Serif italic word in red; IBM Plex Mono for the small print. The team photo is the hero, an
escape-route strip down the left lights as far as you have read, sign tokens, a red notice for the
stories, plates on the wall, the inspection tag. Motion, from the studio-site study: a preloader that
slides the logo up and away behind a red bar, four hero lines rising out of masks, a ring cursor that lags
behind a red dot and becomes a red disc with an arrow over anything you can open, smooth scrolling (GSAP
ScrollSmoother) with parallax, the hero blurring away as you leave it, a black-to-paper wipe into the
intro statement, separators that grow, headings arriving a word at a time, the tiles' huge drifting
initials, the inspection tag turning in, the closing line arriving letter by letter, and a red 3D cube that rides down the right-hand side of the page with the scroll, tumbling as it goes,
with a live particle flame inside it that engulfs the whole cube when you hover or tap it; it hides itself
while the people are on screen so it never sits over a name. GSAP 3.13 (ScrollTrigger, ScrollSmoother, SplitText)
from cdnjs. Everything falls back to a plain, fully readable page if the library does not load or reduced
motion is set.

Both are responsive, keyboard-navigable, respect `prefers-reduced-motion`, and print sensibly.

---

## Hosting

Live at **https://awards.freedomgroup.uk** — GitHub Pages from this repo (the `CNAME` file),
so a push to `main` is a deploy. Gateway at `/`, founder page at `/personal/`, team site at
`/staff/`. There is no access control: the `noindex,nofollow` tags on both pages are a
request to search engines, not a lock, so treat the address as private by obscurity only,
and do not circulate it until the placeholders are gone.
