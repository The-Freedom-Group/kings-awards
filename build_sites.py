"""Build the two standalone sites from this repo's sources.

    python build_sites.py              # writes sites/tomletcher and sites/thewayin
    python build_sites.py --stubs      # ALSO turns personal/ and staff/ on the Pages
                                       # site into redirect stubs (only once the
                                       # new domains are live; see HOSTING.md)

Sources stay where they are (personal/, staff/, assets/). Each output folder is a
complete Cloudflare static-asset Worker: wrangler.jsonc + public/. Nothing in
public/ is hand-edited; rerun this script after any change and commit the result.
"""
import os, re, shutil, sys, json

ROOT = os.path.dirname(os.path.abspath(__file__))
TOM = "https://tomletcher.co.uk/"
WAY = "https://thewayin.freedom-fire.co.uk/"
AWARDS = "https://awards.freedomgroup.uk/"
COMPAT = "2026-09-01"

SITES = {
    "tomletcher": {
        "src": "personal", "page": "index.html", "engine": "thread.js", "extra": ["data"],
        "self": TOM, "other": WAY, "other_rel": "../staff/index.html",
        "og_image": "https://awards.freedomgroup.uk/assets/tom-mono.jpg",
        "redirects": "/personal /  301\n/personal/* /  301\n",
    },
    "thewayin": {
        "src": "staff", "page": "index.html", "engine": "engine.js", "extra": ["data", "vendor"],
        "self": WAY, "other": TOM, "other_rel": "../personal/index.html",
        "og_image": "https://awards.freedomgroup.uk/assets/team.jpg",
        "redirects": "/staff /  301\n/staff/* /  301\n",
    },
}

ASSET_RE = re.compile(r"\.\./assets/([A-Za-z0-9_./-]+)")

def build(name, cfg):
    src = os.path.join(ROOT, cfg["src"])
    out = os.path.join(ROOT, "sites", name)
    pub = os.path.join(out, "public")
    if os.path.isdir(pub):
        shutil.rmtree(pub)
    os.makedirs(os.path.join(pub, "assets"), exist_ok=True)

    html = open(os.path.join(src, cfg["page"]), encoding="utf-8").read()
    js = open(os.path.join(src, cfg["engine"]), encoding="utf-8").read()

    # every asset the page or its engine refers to, and nothing else
    refs = sorted(set(ASSET_RE.findall(html) + ASSET_RE.findall(js)))
    for rel in refs:
        rel = rel.split("?")[0]
        s = os.path.join(ROOT, "assets", rel)
        d = os.path.join(pub, "assets", rel)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(s, d)

    # rewrite paths: assets beside the page, the sister site on its own domain,
    # the gateway on the awards domain, the canonical and social URLs on this domain
    html = html.replace(cfg["other_rel"], cfg["other"])
    html = html.replace('href="../"', 'href="%s"' % AWARDS)
    html = html.replace("../assets/", "assets/")
    html = html.replace('content="%s"' % cfg["og_image"], 'content="%sassets/%s"' % (cfg["self"], os.path.basename(cfg["og_image"])))
    html = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="%s">' % cfg["self"], html)
    if 'rel="canonical"' in html:
        html = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % cfg["self"], html)
    else:
        html = html.replace('<meta name="robots"', '<link rel="canonical" href="%s">\n<meta name="robots"' % cfg["self"], 1)
    js = js.replace("../assets/", "assets/")

    open(os.path.join(pub, "index.html"), "w", encoding="utf-8").write(html)
    open(os.path.join(pub, cfg["engine"]), "w", encoding="utf-8").write(js)
    for extra in cfg["extra"]:
        shutil.copytree(os.path.join(src, extra), os.path.join(pub, extra))
    open(os.path.join(pub, "_redirects"), "w", encoding="utf-8").write(cfg["redirects"])
    open(os.path.join(pub, "_headers"), "w", encoding="utf-8").write(
        "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n")

    wrangler = {
        "name": name,
        "compatibility_date": COMPAT,
        "assets": {"directory": "./public", "not_found_handling": "404-page"},
    }
    with open(os.path.join(out, "wrangler.jsonc"), "w", encoding="utf-8") as f:
        f.write("// Static-asset Worker: Cloudflare serves ./public and nothing else.\n"
                "// Deployed by Workers Builds from The-Freedom-Group/kings-awards with\n"
                "// the root directory set to sites/%s. Custom domain: %s\n" % (name, cfg["self"]))
        json.dump(wrangler, f, indent=2)
        f.write("\n")
    open(os.path.join(pub, "404.html"), "w", encoding="utf-8").write(
        '<!doctype html><meta charset="utf-8"><title>Not found</title>'
        '<meta http-equiv="refresh" content="0;url=/"><p>Not found. <a href="/">Go to the start.</a></p>\n')
    left = sum(len(fs) for _, _, fs in os.walk(pub))
    print("built sites/%s: %d files, %d assets" % (name, left, len(refs)))

STUB = """<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="{url}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0;url={url}">
<script>location.replace("{url}" + location.hash);</script>
</head><body><p>This page has moved to <a href="{url}">{url}</a>.</p></body></html>
"""

def docs():
    """The hand-over version of the awards site, in docs/: the gateway with links to
    the two domains, and instant client-side redirects at the old /personal/ and
    /staff/ URLs (GitHub Pages cannot send a real 301). Nothing in personal/ or
    staff/ is touched. Once both domains resolve, switch the repo's Pages source
    from the root to /docs in Settings -> Pages and the old URLs start forwarding."""
    d = os.path.join(ROOT, "docs")
    if os.path.isdir(d):
        shutil.rmtree(d)
    os.makedirs(os.path.join(d, "personal")); os.makedirs(os.path.join(d, "staff"))
    gate = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    gate = gate.replace('href="personal/index.html"', 'href="%s"' % TOM).replace('href="staff/index.html"', 'href="%s"' % WAY)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(gate)
    shutil.copy2(os.path.join(ROOT, "CNAME"), os.path.join(d, "CNAME"))
    open(os.path.join(d, "personal", "index.html"), "w", encoding="utf-8").write(STUB.format(url=TOM))
    open(os.path.join(d, "staff", "index.html"), "w", encoding="utf-8").write(STUB.format(url=WAY))
    open(os.path.join(d, ".nojekyll"), "w").close()
    print("built docs/: gateway + redirect stubs for /personal/ and /staff/")

if __name__ == "__main__":
    for n, c in SITES.items():
        build(n, c)
    docs()
