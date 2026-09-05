# Hosting: three sites, two domains, one repo

| Site | Source in this repo | Built output | Served from | Domain |
|---|---|---|---|---|
| Tom's founder portfolio | `personal/` | `sites/tomletcher/public/` | Cloudflare Worker `tomletcher` | **tomletcher.co.uk** |
| The Way In (team site) | `staff/` | `sites/thewayin/public/` | Cloudflare Worker `thewayin` | **thewayin.freedom-fire.co.uk** |
| King's Awards gateway | `index.html` | `docs/` (with redirect stubs) | GitHub Pages | awards.freedomgroup.uk |

`python build_sites.py` rebuilds all three outputs from the sources. Edit only the
sources, run the build, commit everything, push. Cloudflare redeploys each Worker on
push; GitHub Pages redeploys the gateway on push.

Each Worker serves **only** its `public/` folder: the page, its engine, the assets it
actually references, and for the portfolio the public claim register in `data/`.
Nothing else in the repo is reachable from either domain.

---

## One-time setup (Cloudflare dashboard)

Cloudflare's Git integration deploys a Worker straight from a GitHub repo. Because
both sites live in this one repo, each Worker points at a different **root
directory**. Do this twice.

### Worker 1: `tomletcher`

1. <https://dash.cloudflare.com> → the account that holds **tomletcher.co.uk**
   (it is already there, parked: nameservers neil/ziggy.ns.cloudflare.com).
2. **Compute → Workers & Pages → Create → Import a repository.**
3. Connect GitHub if it is not already; choose **The-Freedom-Group/kings-awards**.
4. Project name **tomletcher**. Set **Root directory** to `sites/tomletcher`.
   Build command **empty**. Deploy command `npx wrangler deploy`. Everything else
   comes from `sites/tomletcher/wrangler.jsonc`.
5. **Deploy.** It appears at `https://tomletcher.<subdomain>.workers.dev`.
6. On the Worker → **Settings → Domains & Routes → Add → Custom domain** →
   `tomletcher.co.uk`. Cloudflare creates the DNS record and certificate itself,
   because the zone is already on this account. Add `www.tomletcher.co.uk` the same
   way if you want it to work too.
7. Remove the parking redirect: **Websites → tomletcher.co.uk → Rules** (or the
   registrar "lander" setting) so nothing else answers on the apex.

### Worker 2: `thewayin`

freedom-fire.co.uk is already on the same Cloudflare account, so this is the same job as
Worker 1.

1. **Compute → Workers & Pages → Create → Import a repository** →
   **kings-awards** again. Project name **thewayin**, **Root directory**
   `sites/thewayin`, build command empty, deploy `npx wrangler deploy`. Deploy.
2. Worker → **Domains → Add → Custom domain** → domain freedom-fire.co.uk,
   subdomain `thewayin`. Cloudflare adds the record and the
   certificate.

Both Workers are **public** by design: these two sites are meant to be read by
assessors, journalists and investors. The staff page still sends
`noindex,nofollow` and the portfolio stays `noindex` until Tom wants it indexed
(remove the robots meta in `personal/index.html`, rebuild, push).

---

## Cutting over the old URLs

`awards.freedomgroup.uk/personal/` and `/staff/` keep serving full copies until
both domains are live. Do **not** cut over before then: the awards site is what the
application links to, and the deadline is 1pm on 8 September 2026.

When both domains answer:

1. GitHub → **kings-awards → Settings → Pages → Build and deployment → Branch**:
   change the folder from `/ (root)` to **`/docs`**. Save.
2. That is all. `docs/` already contains the gateway with links to the two domains,
   the `CNAME`, and instant client-side redirects at `/personal/` and `/staff/`
   (GitHub Pages cannot send a true 301; each stub carries a canonical link to the
   new home, so the old links keep working and search engines learn the move).
3. Optionally delete nothing: `personal/` and `staff/` remain the sources.

After cut-over there is one public copy of each site, at its own domain, plus the
frozen release tag made at submission (see below).

---

## Freezing the submitted release

Before the form is submitted, tag the exact commit that the live sites were built
from, so the evidence seen at the deadline can be reproduced:

```bash
git tag -a kae-2027-submission -m "Release submitted with the 2027 application"
git push origin kae-2027-submission
```

---

## Checking it worked

```bash
curl -I https://tomletcher.co.uk/                          # 200, server: cloudflare
curl -I https://tomletcher.co.uk/personal/                  # 301 -> /
curl -I https://thewayin.freedom-fire.co.uk/        # 200
curl -I https://awards.freedomgroup.uk/personal/            # 200 until cut-over; then the stub
```
