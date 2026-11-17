"""Bake the planet maps for the portfolio (tomletcher.co.uk): the eight worlds of the Freedom system as one atlas of
equirectangular strips, coloured the way the group site's shaders colour them, plus the Earth for the carbon block.
Source maps: Solar System Scope, CC BY 4.0 (the same files the group site ships; the portfolio's footer credits them).

   python tools/bake_planets.py      (needs numpy, scipy and Pillow, and the freedom-group-site repo beside this one)

The portfolio draws them in personal/thread.js (makeBall): the system map's planets from worlds.webp, one 512x256
strip each in the order group, global, facilities, distribution, form, freight, fly, fuel; the carbon block's Earth
from earth-2k / earth-1k (phones) and earth-lights; Saturn's rings from ring.png.
"""
import os, numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(os.path.dirname(ROOT), "freedom-group-site", "assets")     # the group site's repo, checked out beside this one
OUT = os.path.join(ROOT, "assets", "planets")
os.makedirs(OUT, exist_ok=True)
TW, TH = 512, 256
rng = np.random.default_rng(7)

def load(name, size=None):
    im = Image.open(os.path.join(SRC, *name.split("/"))).convert("RGB")
    if size: im = im.resize(size, Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255.0

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def lum(a): return a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114

def ramp(alb, a, b, lo=0.06, hi=0.9):
    l = smooth(lo, hi, lum(alb))[..., None]
    return np.array(a, np.float32) * (1 - l) + np.array(b, np.float32) * l

def noise(h, w, cells_y, cells_x, octaves=4):
    """value noise that tiles left to right, so the seam of the map never shows"""
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0.0
    for o in range(octaves):
        cy, cx = cells_y * 2 ** o, cells_x * 2 ** o
        g = rng.random((cy + 1, cx)).astype(np.float32)
        g = np.concatenate([g, g[:, :3]], axis=1)                      # wrap in x
        z = ndimage.zoom(g, (h / cy, w / cx), order=3)[:h, :w]
        out += z[:h, :w] * amp; tot += amp; amp *= 0.5
    return out / tot

def bands(alb, k):
    """the group site's gas shader: latitude bands bent by turbulence, and long streaks along them"""
    h, w = alb.shape[:2]
    lat = (0.5 - (np.arange(h, dtype=np.float32) + 0.5) / h)[:, None] * np.pi
    n1 = noise(h, w, 4, 8)
    n2 = noise(h, w, 18, 5)
    m = (1 + k * 0.10 * np.sin(lat * 15.0 + (n1 - 0.5) * 6.0)) * (1 + k * 0.14 * (n2 - 0.5) * 2.0)
    return alb * m[..., None]

def save(arr, name, q=84):
    im = Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8))
    im.save(os.path.join(OUT, name), quality=q, method=6)
    print(name, im.size, round(os.path.getsize(os.path.join(OUT, name)) / 1024, 1), "kB")
    return im

S = (TW, TH)
worlds = []
# Freedom Group Enterprise: the brand's pink Earth
worlds.append(load("brand/pink-earth.webp", S))
# Freedom Global: Neptune's map on a blue ramp, banded
g = ramp(load("maps/neptune-2k.webp", S), [0.12, 0.38, 0.92], [0.88, 0.96, 1.0]); worlds.append(bands(g, 1.4) * 1.08)
# Freedom Facilities: the Moon's relief on a green ramp
m = load("maps/moon-2k.webp", S); worlds.append(ramp(m, [0.02, 0.26, 0.18], [0.6, 1.0, 0.8]) * (0.55 + 0.6 * lum(m))[..., None])
# Freedom Distribution: Mars as it is
worlds.append(load("maps/mars-2k.webp", S) * 1.04)
# Freedom Form: Saturn, warmed
worlds.append(load("maps/saturn-2k.webp", S) * np.array([1.0, 0.9, 0.62], np.float32) * 1.08)
# Freedom Freight: Jupiter as it is
worlds.append(load("maps/jupiter-2k.webp", S))
# Freedom Fly: Jupiter's storms on a violet ramp
worlds.append(ramp(load("maps/jupiter-2k.webp", S), [0.2, 0.06, 0.38], [0.84, 0.7, 0.98]))
# Freedom Fuel: Uranus on an indigo ramp, lightly banded
u = ramp(load("maps/uranus-2k.webp", S), [0.06, 0.08, 0.4], [0.5, 0.58, 1.0], lo=0.3, hi=0.95); worlds.append(bands(u, 1.0) * 1.1)

atlas = np.concatenate(worlds, axis=0)
save(atlas, "worlds.webp", q=82)

# Saturn's rings as a radial strip (inner edge to outer edge), colour and opacity
ring = Image.open(os.path.join(SRC, "maps", "saturn-ring-2k.webp")).convert("RGBA").resize((256, 2), Image.LANCZOS)
ring.save(os.path.join(OUT, "ring.png")); print("ring.png", ring.size, os.path.getsize(os.path.join(OUT, "ring.png")), "B")

# the Earth for the carbon block: the day side with its weather over it, and the lights of the night side
for tag, size in (("2k", (2048, 1024)), ("1k", (1024, 512))):
    day = load("maps/earth-day-2k.webp", size)
    cl = lum(load("maps/earth-clouds-2k.webp", size))
    cl = smooth(0.12, 0.95, cl)[..., None] * 0.86
    # a little more depth in the sea and life in the land, then the weather laid over
    day = np.clip((day - 0.5) * 1.08 + 0.5, 0, 1)
    shift = 3 if tag == "2k" else 2
    shadow = np.roll(cl, (shift, shift), axis=(0, 1)) * 0.22          # cloud shadow on the ground
    earth = day * (1 - shadow)
    earth = earth * (1 - cl) + np.array([1.0, 1.0, 1.0], np.float32) * cl
    save(earth, "earth-%s.webp" % tag, q=80)
night = load("maps/earth-night-2k.webp", (1024, 512))
lights = smooth(0.10, 0.62, lum(night) * 1.5)
im = Image.fromarray((lights * 255 + 0.5).astype(np.uint8), "L")
im.save(os.path.join(OUT, "earth-lights.webp"), quality=70, method=6)
print("earth-lights.webp", im.size, round(os.path.getsize(os.path.join(OUT, "earth-lights.webp")) / 1024, 1), "kB")
