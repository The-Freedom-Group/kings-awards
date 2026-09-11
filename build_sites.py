"""Build the two standalone sites from this repo's sources.

    python build_sites.py              # writes sites/tomletcher and sites/thewayin
    python build_sites.py --stubs      # ALSO turns personal/ and staff/ on the Pages
                                       # site into redirect stubs (only once the
                                       # new domains are live; see HOSTING.md)

Sources stay where they are (personal/, staff/, assets/). Each output folder is a
complete Cloudflare static-asset Worker: wrangler.jsonc + public/. Nothing in
public/ is hand-edited; rerun this script after any change and commit the result.
"""
import os, re, shutil, sys, json, hashlib, subprocess, tempfile

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

def npx(tool, args, text):
    """run a Node minifier from npx on the given text; if it is unavailable, return the text unchanged"""
    try:
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write(text); tmp = f.name
        r = subprocess.run(["npx", "--yes", tool] + args + [tmp], capture_output=True, text=True, encoding="utf-8", shell=True, timeout=240)
        os.unlink(tmp)
        if r.returncode == 0 and r.stdout.strip():
            return r.stdout
        sys.stderr.write("  %s skipped: %s\n" % (tool, (r.stderr or "").strip()[:200]))
    except Exception as e:
        sys.stderr.write("  %s skipped: %s\n" % (tool, e))
    return text

def minify_js(text):
    return npx("terser", ["--compress", "--mangle", "--comments", "false", "--"], text)

def minify_css(text):
    return npx("csso-cli", ["-i"], text)

def minify_html(text):
    """whitespace between tags collapsed conservatively, comments dropped; inline styles and scripts are done
    separately so nothing in them changes meaning"""
    styles, scripts = [], []
    def keep_style(m):
        styles.append(minify_css(m.group(2))); return "%s\x00S%d\x00%s" % (m.group(1), len(styles) - 1, m.group(3))
    def keep_script(m):
        body = m.group(2)
        if body.strip(): body = minify_js(body)
        scripts.append(body); return "%s\x00J%d\x00%s" % (m.group(1), len(scripts) - 1, m.group(3))
    text = re.sub(r"(<style[^>]*>)(.*?)(</style>)", keep_style, text, flags=re.S)
    text = re.sub(r"(<script(?![^>]*\bsrc=)[^>]*>)(.*?)(</script>)", keep_script, text, flags=re.S)
    text = re.sub(r"<!--(?!\[if).*?-->", "", text, flags=re.S)
    text = re.sub(r">\s+<", "> <", text)
    text = re.sub(r"[ \t]*\n[ \t]*", "\n", text)
    text = re.sub(r"\n{2,}", "\n", text)
    text = re.sub(r"\x00S(\d+)\x00", lambda m: styles[int(m.group(1))], text)
    text = re.sub(r"\x00J(\d+)\x00", lambda m: scripts[int(m.group(1))], text)
    return text

def fingerprint(path):
    h = hashlib.sha1(open(path, "rb").read()).hexdigest()[:8]
    root, ext = os.path.splitext(path)
    return "%s.%s%s" % (root, h, ext)

def build(name, cfg):
    src = os.path.join(ROOT, cfg["src"])
    out = os.path.join(ROOT, "sites", name)
    pub = os.path.join(out, "public")
    if os.path.isdir(pub):
        shutil.rmtree(pub)
    os.makedirs(os.path.join(pub, "assets"), exist_ok=True)

    html = open(os.path.join(src, cfg["page"]), encoding="utf-8").read()
    js = open(os.path.join(src, cfg["engine"]), encoding="utf-8").read()

    # every asset the page or its engine refers to, and nothing else; each one is copied under a name that
    # carries a hash of its content, so it can be cached for a year and still change the moment it changes
    DATA_RE = re.compile(r"(?<![./])assets/([A-Za-z0-9_./-]+)")
    data_texts = {}
    for extra in cfg["extra"]:
        for dp, _, fs in os.walk(os.path.join(src, extra)):
            for fn in fs:
                if fn.endswith(".json"):
                    p = os.path.join(dp, fn); data_texts[os.path.relpath(p, src)] = open(p, encoding="utf-8").read()
    refs = sorted(set(ASSET_RE.findall(html) + ASSET_RE.findall(js) + sum([DATA_RE.findall(t) for t in data_texts.values()], [])))
    refs = [r for r in refs if os.path.exists(os.path.join(ROOT, "assets", r.split("?")[0]))]
    named = {}
    for rel in refs:
        clean = rel.split("?")[0]
        s = os.path.join(ROOT, "assets", clean)
        stamped = fingerprint(s)
        newrel = os.path.relpath(stamped, os.path.join(ROOT, "assets")).replace("\\", "/")
        d = os.path.join(pub, "assets", newrel)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(s, d)
        named[rel] = newrel
    for rel in sorted(named, key=len, reverse=True):
        html = html.replace("../assets/" + rel, "../assets/" + named[rel])
        js = js.replace("../assets/" + rel, "../assets/" + named[rel])

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

    # the engine is minified and fingerprinted too; the page points at the stamped name
    js_min = minify_js(js)
    eng_root, eng_ext = os.path.splitext(cfg["engine"])
    eng_name = "%s.%s%s" % (eng_root, hashlib.sha1(js_min.encode("utf-8")).hexdigest()[:8], eng_ext)
    html = html.replace('src="%s"' % cfg["engine"], 'src="%s" defer' % eng_name)
    html = minify_html(html)
    open(os.path.join(pub, "index.html"), "w", encoding="utf-8").write(html)
    open(os.path.join(pub, eng_name), "w", encoding="utf-8").write(js_min)
    for extra in cfg["extra"]:
        shutil.copytree(os.path.join(src, extra), os.path.join(pub, extra))
    # the data files point at the stamped asset names too
    for relpath, text in data_texts.items():
        text = DATA_RE.sub(lambda m: "assets/" + named.get(m.group(1), m.group(1)), text)
        open(os.path.join(pub, relpath), "w", encoding="utf-8").write(text)
    open(os.path.join(pub, "_redirects"), "w", encoding="utf-8").write(cfg["redirects"])
    open(os.path.join(pub, "_headers"), "w", encoding="utf-8").write(
        "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n"
        "  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n"
        "/index.html\n  Cache-Control: public, max-age=0, must-revalidate\n"
        "/\n  Cache-Control: public, max-age=0, must-revalidate\n"
        "/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n"
        "/vendor/*\n  Cache-Control: public, max-age=604800\n"
        "/data/*\n  Cache-Control: public, max-age=3600\n"
        "/*.js\n  Cache-Control: public, max-age=31536000, immutable\n")

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
