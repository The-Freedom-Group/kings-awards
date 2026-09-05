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

**Personal — Tom Letcher.** Rebuilt on 5 September 2026 to the founder portfolio master plan (Tom's
document of 4 September), with the visual design locked: porcelain, carbon and pink, Anton, Inter and
Instrument Serif, the pink line, the pinned scene, the group map and the Explore ⇄ Verified Record switch
are all unchanged. What changed is the content hierarchy, the copy and the evidence. The origin now starts
at the real object, one second-hand extinguisher sold on Facebook Marketplace in March 2019, with the
dated steps to incorporation on 27 August 2021 stated separately. Eight chapters in the plan's order:
01 The Spark, 02 From Sale to System (eight problem → decision → build → result stages), 03 Proof, Not
Promise (six metrics, each with definition, period, scope, source type and last-checked date), 04 How I
Build (five decision stories, including three dated resilience cases and three feedback-to-change cases),
05 Built With People (with a link to The Way In rather than repeating it), 06 The Platform Ahead (three
horizons: trading, proposed within 24 to 36 months, long-term options; the map relabelled so only the
registered company is a fact), 07 The Record, 08 Still Building (a short long view, three actions and a
restrained dedication). All TK placeholders, age copy and award-test language are gone from Explore.
Statuses use three labels everywhere: Verified, Management data, Target. Outstanding items are held back
from the live story and listed only in the register.

The claim register lives in `personal/data/` as `claims.json`, `metrics.json`, `timeline.json`,
`sources.json` and `people.json` (approved public fields only; no private file paths or personal data).
`python personal/build_record.py` regenerates the Verified Record's commercial-record and timeline tables
from it, so a figure is written once. The hero offers "Watch the two-minute story" (a film slot in
chapter 01, scheduled for September 2026) and "View the verified record". Top-of-page links: skip to the
story, skip animation, view evidence. The entrance loader fails safe at two seconds. Canonical URL is
`https://tomletcher.co.uk/`; the page stays `noindex` until Tom wants it discoverable, and the 301 from
the awards URL is set up when the domain is.

**Staff — The Way In.** Rebuilt on 5 September 2026 to the Promoting Opportunity master plan (Tom's
document of 4 September), with the signage skin and the studio engine unchanged. Nine chapters in the
plan's order: 01 Why it exists; 02 The route in (the six-stage pathway and the two qualifying activities
that have evidence: placements since 2021 and recruitment open to Jobcentre referrals; mentoring and
training are not counted until hours are logged); 03 The people (eight participants, first name, role and
route only until each has approved a full profile; Tom is the founder and sponsor, not counted); 04 The
impact (one panel per beneficiary group with a count, a method note and, where there is one, a voice);
05 The partners (Newbridge College, the Growth Company, Jobcentre Plus, names only until confirmed);
06 The timeline (dated spine and the two-year inspection tag); 07 How we learn (feedback, adjustment,
observed result); 08 Evidence record (eligibility statement, the five tests as a navigator, the two
commitments, and every claim with status, source and evidence ID); 09 What comes next. The call point
returns with the plan's microcopy, "In case of missed potential. Break glass", and the reveal from "Not
everyone arrives by the same route" to "Everyone deserves a way in". Deficit labels, the nine-person and
four-of-four claims, the headcount bracket, "paid from day one" and "certified trade" are gone. The claim
register lives in `staff/data/` (PO- evidence IDs, consent flags in `people.json`). GSAP is self-hosted in
`staff/vendor/`. The preloader fails safe at two seconds; skip-animation and view-evidence links sit at the
top of the page.

Both are responsive, keyboard-navigable, respect `prefers-reduced-motion`, and print sensibly.

---

## Hosting

Three sites, two domains, one repo. The founder portfolio is served at **tomletcher.co.uk** and
The Way In at **thewayin.freedom-fire.co.uk**, each as a Cloudflare static-asset Worker built
from this repo (`python build_sites.py` → `sites/tomletcher/` and `sites/thewayin/`). The gateway stays
on GitHub Pages at **awards.freedomgroup.uk**, and once both domains are live its `/personal/` and
`/staff/` paths become redirects (`docs/`). The dashboard steps, the DNS position of each domain and
the cut-over order are in **HOSTING.md**. Until cut-over the old URLs keep serving full copies, because
the application links to them and the deadline is 1pm on 8 September 2026.