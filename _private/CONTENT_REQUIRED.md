# CONTENT_REQUIRED — the founder page (`personal/`)

Every factual gap, contradiction or unsupported claim found while rebuilding the founder page,
with what would resolve it. Nothing on this list appears on the public page as a fact. Where the
page mentions one of these at all, it is as a claim with the status **Pending evidence** or
**Not verified**, and never with a number attached.

This folder starts with an underscore so GitHub Pages does not publish it. (`README.md` at the
root **is** published, at `/README.md` — see item 23.)

Register checks were made against Companies House on **3 September 2026**. Re-check before
relying on any of them after that date.

| # | Claim / gap | Where it would appear | Required evidence | Owner | Status |
|---|---|---|---|---|---|
| 1 | **Young Founder age test.** The register records Tom's date of birth as April 1996, making him 31 on 6 May 2027 — outside the 18–30 range. | Verified record → Eligibility | Confirm the date of birth. If the register is wrong, file the correction (CH01) **before** applying and keep the acknowledgement. If it is right, the Young Founder category is unavailable and the application must use another category. | Tom | **BLOCKED — decides everything else** |
| 2 | Commercial threshold for Young Founder (≥ £250,000 turnover, or ≥ £500,000 external funding). | Verified record → Eligibility | Accounts signed by the accountant showing turnover for the latest year, or the funding agreements. Micro-company accounts on the register do not show turnover. | Tom / accountant | Pending evidence |
| 3 | Reported revenue: freedomgroup.uk states 2023 £42k, 2024 £503k, 2025 £1.13m, eBay sales 2025–26 about £890k, Temu about £160k in the first three months. | Not on the page. Would go in Measured progress and the record. | Accountant's letter or filed full accounts for the annual figures; platform sales exports for a stated period for the marketplace figures, with the definition (orders placed or despatched, which channels). | Tom / accountant | Pending evidence — **not stated publicly** |
| 4 | **"Freedom Global Ltd"** — freedomgroup.uk describes it as the trading company, "trading as Freedom Fire & Safety Ltd". No company of that name is registered at the Bury address, and Tom's only registered directorship is Freedom Fire & Safety Ltd. | The Group map and table; record → Operating companies | Either the company number and register entry for Freedom Global Ltd, or correct the group site. This is a **contradiction between the company's own site and the register** and an assessor will find it in minutes. | Tom | **Not verified — contradiction** |
| 5 | Status of **Freedom Distribution** and **Freedom Facilities**. The previous founder page said Distribution was operating and Facilities launching; freedomgroup.uk says both are planned. | The Group; What comes next | Confirm the true status. If either is incorporated, its company number. The public page now uses the group site's wording ("planned"). | Tom | Not verified |
| 6 | **Hepa Fellas** — listed as "launching" on the previous founder page; not mentioned on freedomgroup.uk. | Dropped from the public page. | Confirm whether it exists and its status. | Tom | Removed pending confirmation |
| 7 | Trademarks: Firestorm, Voltz, Kunergy, T3, Crystal Cleaning Solutions ("™" claimed on freedomgroup.uk). | The Group map; record → Operating companies and brands | UK IPO trademark numbers for each, to be checked against the IPO register. | Tom | Pending evidence |
| 8 | Future ventures (Freedom Form, Freight, Fly, Fuel — "2029+"). | The Group map (dashed, "future"); What comes next | None needed while they are presented as stated intent. Do not describe any as trading or incorporated. | — | Stated intent only |
| 9 | The service list (Equipment / Detection / Assurance). freedom-fire.co.uk currently shows only a "coming soon" page, so there is no public source. | The build; Thirty-second record | Confirm the three categories match what is delivered; add fire doors, passive fire protection, sprinklers or dry risers if covered. A live company website would be the natural source. | Tom | As described by the company |
| 10 | Operating model: "chooses its own suppliers, specifies its own products, tracks each consignment from factory to the Bury warehouse". | The build | Nothing further if it stays attributed to the company. To state it as fact: supplier list, product specifications, and the tracking system. | Tom | As described by the company |
| 11 | Coverage and customers ("UK-wide", "homes and businesses"). | Thirty-second record (attributed) | Job or delivery records showing geography; customer mix. | Tom | As described by the company |
| 12 | Third-party accreditations (BAFE SP101 / SP203, FIA, SafeContractor, CHAS, ISO 9001, NSI, SSAIB). | Record → Governance | Certificate numbers, checked against each scheme's public register. None is claimed on the page. | Tom | Pending evidence |
| 13 | Insurance cover. | Record → Governance | Current certificate of insurance. | Tom | Pending evidence |
| 14 | Tax and HMRC standing. | Record → Governance | Written confirmation from the accountant. | Accountant | Pending evidence |
| 15 | Awards and press. The portfolio timeline claims a **runner-up place in the eBay UK Business Awards 2024**. A web search on 3 September 2026 found no public source. | Record → Press and recognition | eBay's published results or written confirmation from eBay; press cuttings with dates. | Tom | Pending evidence — **not stated publicly** |
| 16 | Tom's own words: the founding story, the four leadership pieces (creative thinking, growth and influence, big-picture leadership, resilience), and a one-sentence pull quote. | Origin; Operating philosophy | Written by Tom. The page currently makes no first-person claims. | Tom | Not supplied |
| 17 | Dated milestones 2022–2024 (first major contract, first employee, nationwide coverage, each accreditation). | Measured progress | Dates and documents for each. The rail currently shows register events only. | Tom | Not supplied |
| 18 | Headcount by year (an earlier note said "11–50 people"). | Measured progress; record | Payroll or PAYE evidence. Not on the page. | Tom / accountant | Not supplied |
| 19 | The portrait: confirm it is approved for public use and for the share image. A higher-resolution 4:5 portrait would improve the hero on large screens. | Hero; share image | Confirmation; optionally a new photograph (min 1200×1500). | Tom | Confirm |
| 20 | Direct email `tom.letcher@freedom-fire.co.uk` is published on the page and in the structured data. | Contact; footer; JSON-LD | Confirm this is intended to be public. | Tom | Confirm |
| 21 | Publishing approval. The page is `noindex,nofollow` and has no sitemap, deliberately, until Tom approves the content. | `<meta name="robots">` | Tom's approval. Then: change robots to `index,follow`, add `sitemap.xml`, and re-run Lighthouse SEO. | Tom | Awaiting approval |
| 22 | The team site (`staff/`) still carries marked placeholders and supports a different category (Promoting Opportunity) with its own two-year evidence gate. It was not part of this pass. | `staff/index.html` | See the root README's placeholder list for the staff site. | Tom / the team | Untouched |
| 23 | `README.md` at the repository root is served publicly at `/README.md` and contains internal notes (deadline, eligibility warnings, placeholder lists). | Site root | Move working notes into `_private/` or accept that they are public. | Bill | Decide |

## Blocked specifically because verified information is missing

- **Any use of the Young Founder category** (item 1).
- **Any turnover, sales, order or funding figure** (items 2, 3).
- **Presenting Freedom Global, Freedom Distribution or Freedom Facilities as companies** (items 4, 5).
- **Naming any accreditation, award or press item** (items 12, 15).
- **First-person content from Tom** (item 16).
- **Indexing by search engines** (item 21).
