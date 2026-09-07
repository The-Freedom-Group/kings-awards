"""Upload one film to Cloudflare Stream and wire it into The Way In.

    python tools/stream_upload.py gabriel "C:/Users/freed/Downloads/KingAwards Videos/Gabriel_Combined.mov"

The first argument is the person's key on the site (the tile's data-k: bill, harrison,
gabriel, billy, jojo, elliot, josh, or tom for the founder card). The second is the
file. Nothing is scaled down: the master is sent as it is and Stream makes the
streaming renditions itself.

The API token is read from the CLOUDFLARE_API_TOKEN environment variable or from the
file C:/Users/freed/.cf_stream_token (one line). It needs Stream: Edit on the account.
"""
import os, sys, re, json, time, base64, subprocess
import requests

ACCOUNT = "68de5f992b8ea058b068d6a32c4cf6a1"
API = "https://api.cloudflare.com/client/v4/accounts/%s/stream" % ACCOUNT
ORIGINS = "thewayin.freedom-fire.co.uk,tomletcher.co.uk,localhost,127.0.0.1,localhost:8080,127.0.0.1:8080"
CHUNK = 16 * 1024 * 1024          # a multiple of 256 KiB, as tus on Stream requires
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def token():
    t = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not t:
        p = os.path.join(os.path.expanduser("~"), ".cf_stream_token")
        if os.path.exists(p): t = open(p, encoding="utf-8").read().strip()
    if not t:
        sys.exit("No token. Set CLOUDFLARE_API_TOKEN or put the token in ~/.cf_stream_token")
    return t

def b64(s): return base64.b64encode(s.encode("utf-8")).decode("ascii")

def upload(path, name, tok):
    size = os.path.getsize(path)
    meta = "name %s,allowedorigins %s,requiresignedurls %s" % (b64(name), b64(ORIGINS), b64("false"))
    r = requests.post(API, headers={"Authorization": "Bearer " + tok, "Tus-Resumable": "1.0.0",
                                    "Upload-Length": str(size), "Upload-Metadata": meta})
    if r.status_code != 201:
        sys.exit("Could not start the upload (%s): %s" % (r.status_code, r.text[:400]))
    loc, uid = r.headers["Location"], r.headers.get("stream-media-id")
    print("Upload started. Video ID:", uid)
    off, t0 = 0, time.time()
    H = {"Authorization": "Bearer " + tok, "Tus-Resumable": "1.0.0"}
    def server_offset():
        try:
            h = requests.head(loc, headers=H, timeout=60)
            return int(h.headers.get("Upload-Offset", off))
        except Exception:
            return off
    with open(path, "rb") as f:
        while off < size:
            f.seek(off); chunk = f.read(CHUNK)
            ok = False
            for attempt in range(8):
                try:
                    p = requests.patch(loc, data=chunk, timeout=300,
                                       headers=dict(H, **{"Upload-Offset": str(off), "Content-Type": "application/offset+octet-stream"}))
                    if p.status_code == 204: off = int(p.headers.get("Upload-Offset", off + len(chunk))); ok = True; break
                    print("  chunk retry", attempt + 1, p.status_code, p.text[:200])
                except Exception as ex:
                    print("  connection dropped (%s); resuming" % type(ex).__name__)
                time.sleep(5 * (attempt + 1)); off = server_offset(); f.seek(off); chunk = f.read(CHUNK)
            if not ok: sys.exit("Upload failed at %d bytes" % off)
            rate = off / max(1, time.time() - t0) / 1e6
            print("  %5.1f%%  %.0f / %.0f MB  %.1f MB/s" % (100 * off / size, off / 1e6, size / 1e6, rate))
    return uid

def wait_ready(uid, tok):
    print("Uploaded. Waiting for Stream to process it (this can take a few minutes for a long 4K file)...")
    for _ in range(240):
        r = requests.get(API + "/" + uid, headers={"Authorization": "Bearer " + tok}).json()
        res = r.get("result", {}); st = res.get("status", {})
        print("  status:", st.get("state"), st.get("pctComplete", ""))
        if res.get("readyToStream"):
            # the account default requires signed URLs; these films play from the sites' own domains
            requests.post(API + "/" + uid, headers={"Authorization": "Bearer " + tok}, timeout=300,
                          json={"requireSignedURLs": False, "allowedOrigins": ORIGINS.split(",")})
            return res
        if st.get("state") == "error": sys.exit("Stream reported an error: " + json.dumps(st))
        time.sleep(15)
    sys.exit("Timed out waiting for processing; the video ID is %s, run the wiring step later." % uid)

def wire_story(uid, customer):
    """Tom's two-minute story on the portfolio: the placeholder becomes the Stream player."""
    p = os.path.join(ROOT, "personal", "index.html")
    s = open(p, encoding="utf-8").read()
    frame = ('<figure class="film live" id="film" aria-label="The two-minute founder story">\n'
             '      <iframe src="https://customer-%s.cloudflarestream.com/%s/iframe?preload=metadata&letterboxColor=%%23000000" '
             'allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen" allowfullscreen '
             'title="Tom Letcher, the two-minute story" loading="lazy"></iframe>\n    </figure>' % (customer, uid))
    s, n = re.subn(r'<figure class="film(?: live)?" id="film"[^>]*>.*?</figure>', lambda m: frame, s, count=1, flags=re.S)
    if n != 1: sys.exit("Could not find the film placeholder on the portfolio")
    if ".film.live iframe" not in s:
        s = s.replace(".film-in{", ".film.live iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}\n.film-in{", 1)
    open(p, "w", encoding="utf-8").write(s)
    subprocess.run([sys.executable, os.path.join(ROOT, "build_sites.py")], check=True)
    print("Wired the two-minute story -> %s (customer %s) on the portfolio and rebuilt." % (uid, customer))

def wire(key, uid, customer):
    if key == "tomstory": return wire_story(uid, customer)
    p = os.path.join(ROOT, "staff", "index.html")
    s = open(p, encoding="utf-8").read()
    pat = r'(<button class="tile[^"]*" type="button" data-cur data-k="%s"[^>]*?)( data-stream="[^"]*")?( aria-haspopup)' % re.escape(key)
    s, n = re.subn(pat, lambda m: m.group(1) + ' data-stream="%s"' % uid + m.group(3), s, count=1)
    if n != 1: sys.exit("Could not find the tile for " + key)
    if 'data-stream-customer=' in s:
        s = re.sub(r'data-stream-customer="[^"]*"', 'data-stream-customer="%s"' % customer, s, count=1)
    else:
        s = s.replace("<body", '<body data-stream-customer="%s"' % customer, 1)
    open(p, "w", encoding="utf-8").write(s)
    j = os.path.join(ROOT, "staff", "data", "people.json")
    d = json.load(open(j, encoding="utf-8"))
    if key == "tom": d["founder"]["stream_id"] = uid; d["founder"]["film"] = "on Cloudflare Stream"
    for person in d["people"]:
        if person["name"].lower() == key: person["stream_id"] = uid; person["film"] = "on Cloudflare Stream"
    json.dump(d, open(j, "w", encoding="utf-8"), ensure_ascii=False, indent=2); open(j, "a", encoding="utf-8").write("\n")
    subprocess.run([sys.executable, os.path.join(ROOT, "build_sites.py")], check=True)
    print("Wired %s -> %s (customer %s) and rebuilt the sites. Check it at http://127.0.0.1:8080/staff/ then say push." % (key, uid, customer))

if __name__ == "__main__":
    if len(sys.argv) < 3: sys.exit(__doc__)
    key, path = sys.argv[1].lower(), sys.argv[2]
    if not os.path.exists(path): sys.exit("File not found: " + path)
    tok = token()
    uid = upload(path, "The Way In - " + key.capitalize(), tok)
    res = wait_ready(uid, tok)
    m = re.search(r'https://customer-([a-z0-9]+)\.cloudflarestream\.com', json.dumps(res))
    if not m: sys.exit("Ready, but no playback URL returned; video ID " + uid)
    wire(key, uid, m.group(1))
