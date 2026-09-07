"""Wire a film that is already on Cloudflare Stream into the site.

    python tools/stream_wire.py josh 44e0f0e1e551fbbd2ba679ca7e11f5dc

Waits for Stream to finish processing if it has not, then writes the video ID into the
person's tile (or the portfolio's story slot for the key tomstory) and rebuilds.
"""
import sys, re, json
import stream_upload as su

if __name__ == "__main__":
    if len(sys.argv) < 3: sys.exit(__doc__)
    key, uid = sys.argv[1].lower(), sys.argv[2]
    tok = su.token()
    res = su.wait_ready(uid, tok)
    m = re.search(r'https://customer-([a-z0-9]+)\.cloudflarestream\.com', json.dumps(res))
    if not m: sys.exit("Ready, but no playback URL returned; video ID " + uid)
    su.wire(key, uid, m.group(1))
