"""Freedom Fire & Safety Ltd - Organisational Structure, September 2026.

Builds the editable PowerPoint (A4 landscape, one slide) from the data at the top
of this file. Edit the PEOPLE / DEPARTMENTS lists, run it, then export the PDF:

    python build_org_chart.py
    (PowerPoint: File > Export > PDF, or the export step in the README)

Everything is a normal PowerPoint shape, so roles can also be edited directly in
the .pptx without touching this script.
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "..", "assets")
OUT = os.path.join(HERE, "FFSL-Organisational-Structure-Sept-2026.pptx")

# ── palette: the company's own (black, red, greys) ───────────────────────
RED, BLACK, INK2, GREY, LINE, PAPER, WHITE = "C40000", "111111", "4B4B47", "8A8A85", "D9D9D3", "F4F4F1", "FFFFFF"
GROUP_BG = "0B0B0B"
PLANET = {"fire": "FF6A3D", "green": "2FE0A0", "blue": "38A9FF", "violet": "A487DF", "gold": "D7B35F"}
FONT = "Segoe UI"

# ── the data ─────────────────────────────────────────────────────────────
# tag: FT full-time · PT part-time · PL placement · CT contractor · VO volunteer
# way_in: came into the company through The Way In (placement, T Level, Jobcentre referral)
DEPARTMENTS = [
    {"name": "Leadership and strategy",
     "people": [],
     "note": "Direction, group strategy, supplier and partner relationships"},
    {"name": "E-commerce and marketplace management",
     "people": [("Bill Nebo", "Web Developer", "PT", True),
                ("Gabriel Mroczek", "Web Developer", "PT", True),
                ("Elliot Saxon", "Ecommerce Assistant", "FT", True),
                ("Josh Okolanji", "Ecommerce Assistant", "PT", True)],
     "lead": "Bill and Gabriel: T Level placements, then summer interns, now part-time employees within the business",
     "note": "External, contracted: Ecommerce Intelligence (Amazon agency) · Regan Prestwood (graphic design)"},
    {"name": "Operations and fulfilment",
     "people": [("Jojo Williams", "Warehouse Operative · via Newbridge College", "FT", True),
                ("Harrison Duckworth", "Warehouse Operative · T Level student", "FT", True),
                ("Dylan Griffiths", "Warehouse Operative", "FT", True)],
     "lead": "Harrison and Dylan: full-time as subcontractors for the past six months, now moving into full-time employment within the business",
     "note": ""},
    {"name": "Sales and customer service",
     "people": [],
     "note": "Trade sales and key accounts. Customer messages, returns and reviews are handled through the support desk, shared with the e-commerce team. No dedicated post at September 2026."},
    {"name": "Fire-safety services and compliance",
     "people": [("Gary Hodson", "Risk Assessor", "CT", False)],
     "note": "Servicing, installation, fire risk assessment and contracted site work"},
    {"name": "Business support",
     "people": [("Alex Parker", "Accounts", "PT", False),
                ("Vishal Bhanderi", "Accounts & Bookkeeping", "PT", False),
                ("Milad Shukri", "IT", "CT", False),
                ("Billy Kelly", "IT", "CT", False)],
     "note": ""},
    {"name": "Early careers, placements and training",
     "people": [],
     "note": "",
     "programme": ["College placements since 2021 (Newbridge College, additional needs)",
                   "T Level industry placements since Sept 2025 (Growth Company)",
                   "Recruitment open to Jobcentre Plus referrals",
                   "Disability Confident Committed (Level 1); Level 2 Employer in progress"]},
]
TAG = {"FT": ("Full-time", BLACK, WHITE), "PT": ("Part-time", GREY, WHITE), "PL": ("Placement", RED, WHITE),
       "CT": ("Subcontractor", WHITE, BLACK), "VO": ("Volunteer", WHITE, INK2), "DIR": ("Director", RED, WHITE)}

GROUP = [
    ("TRADING NOW", PLANET["fire"], [("Freedom Fire & Safety Ltd · becoming Freedom Global", "Incorporated 27 August 2021 · the operating company on this page. Trades today as Freedom Global on eBay, Amazon, Temu, OnBuy and Shopify; takes the Freedom Global name, with Freedom Fire & Safety continuing as the fire-safety brand.")]),
    ("PROPOSED · 2028 TO 2029", PLANET["green"], [("Freedom Facilities · 2028", "Compliance, servicing and facilities on recurring contracts"),
                                                      ("Freedom Distribution · 2029", "Trade and B2B supply of the owned brands")]),
    ("LONG-TERM OPTIONS · 2030 ONWARDS", PLANET["violet"], [("Form · Freight · Fly · Fuel", "Property, logistics, aerial services and forecourts")]),
]
SHARED = "Shared infrastructure: Brands & IP (Firestorm, FXL, Skyline) · direct sourcing · one warehouse · technology · marketplaces"

# ── helpers ──────────────────────────────────────────────────────────────
def rgb(h): return RGBColor.from_string(h)

def box(slide, x, y, w, h, fill=None, line=None, lw=0.75, shape=MSO_SHAPE.RECTANGLE, radius=None):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    s.shadow.inherit = False
    if fill: s.fill.solid(); s.fill.fore_color.rgb = rgb(fill)
    else: s.fill.background()
    if line: s.line.color.rgb = rgb(line); s.line.width = Pt(lw)
    else: s.line.fill.background()
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = radius
    tf = s.text_frame; tf.margin_left = tf.margin_right = Inches(0.06); tf.margin_top = tf.margin_bottom = Inches(0.03)
    tf.word_wrap = True
    return s

def text(shape, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    """runs: list of paragraphs; each paragraph a list of (text, size, bold, colour, italic?)"""
    tf = shape.text_frame; tf.vertical_anchor = anchor
    first = True
    for para in runs:
        p = tf.paragraphs[0] if first else tf.add_paragraph(); first = False
        p.alignment = align; p.space_after = Pt(0); p.space_before = Pt(0)
        for r in para:
            t, size, bold, colour = r[0], r[1], r[2], r[3]
            run = p.add_run(); run.text = t; f = run.font; f.name = FONT; f.size = Pt(size); f.bold = bold; f.color.rgb = rgb(colour)
            if len(r) > 4: f.italic = r[4]
    return shape

def line(slide, x1, y1, x2, y2, colour=BLACK, lw=1.0):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = rgb(colour); c.line.width = Pt(lw)
    return c

def pill(slide, x, y, label, fill, fg, w=0.62, h=0.16, border=None):
    p = box(slide, x, y, w, h, fill=fill, line=border or (BLACK if fill == WHITE else None), lw=0.5, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    p.text_frame.margin_top = p.text_frame.margin_bottom = 0; p.text_frame.margin_left = p.text_frame.margin_right = Inches(0.02)
    text(p, [[(label, 5.5, True, fg)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    return p

# ── the slide ────────────────────────────────────────────────────────────
prs = Presentation()
prs.slide_width, prs.slide_height = Inches(11.69), Inches(8.27)
slide = prs.slides.add_slide(prs.slide_layouts[6])
bg = box(slide, 0, 0, 11.69, 8.27, fill=WHITE)

# header
slide.shapes.add_picture(os.path.join(ASSETS, "ff_logo_black.png"), Inches(0.45), Inches(0.36), height=Inches(0.5))
t = box(slide, 2.35, 0.3, 6.6, 0.42); text(t, [[("Freedom Fire & Safety Ltd — Organisational Structure", 17, True, BLACK)]], anchor=MSO_ANCHOR.MIDDLE)
t = box(slide, 2.35, 0.7, 6.6, 0.26); text(t, [[("Company 13589467 · Unit 19, Pilsworth Industrial Estate, Bury, BL9 8RE · Trading as Freedom Global · A self-contained operating business with its own leadership, team and departments", 7.5, False, INK2)]], anchor=MSO_ANCHOR.MIDDLE)
t = box(slide, 9.0, 0.33, 2.24, 0.6); text(t, [[("DATED", 6, True, RED)], [("September 2026", 9, True, BLACK)], [("King's Awards for Enterprise 2027", 6.5, False, INK2)]], align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)
line(slide, 0.45, 1.05, 11.24, 1.05, colour=BLACK, lw=1.5)

# ── left: the company chart ──────────────────────────────────────────────
L, R_EDGE = 0.45, 8.05
# Tom at the top
tom_w, tom_h = 3.0, 0.5
tom_x, tom_y = L + (R_EDGE - L - tom_w) / 2, 1.16
tb = box(slide, tom_x, tom_y, tom_w, tom_h, fill=BLACK)
text(tb, [[("Tom Letcher", 11, True, WHITE)], [("Founder & Managing Director", 7.2, False, "DDDDDD")]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
box(slide, tom_x, tom_y + tom_h, tom_w, 0.04, fill=RED)

# two rows of departments: 4 then 3
row1, row2 = DEPARTMENTS[:4], DEPARTMENTS[4:]
gap = 0.14
col_w1 = (R_EDGE - L - gap * 3) / 4
col_w2 = (R_EDGE - L - gap * 2) / 3
y_row1, y_row2 = 2.02, 5.0
head_h, card_h, card_gap = 0.32, 0.34, 0.05

def dept(slide, d, x, y, w, row_bottom):
    hd = box(slide, x, y, w, head_h, fill=RED)
    text(hd, [[(d["name"].upper(), 6.8, True, WHITE)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    cy = y + head_h + 0.06
    if d.get("programme"):
        pb = box(slide, x, cy, w, row_bottom - cy, fill=PAPER, line=LINE, lw=0.75)
        paras = [[(li, 6.6, False, INK2)] for i, li in enumerate(d["programme"])]
        text(pb, paras, anchor=MSO_ANCHOR.TOP)
        pb.text_frame.paragraphs[0].space_after = Pt(2)
        for p in pb.text_frame.paragraphs[1:]: p.space_before = Pt(1.5)
        return
    for name, title, tag, way in d["people"]:
        label, fill, fg = TAG[tag]
        tall = len(title) > 30
        h = card_h + (0.36 if tall else 0)
        cb = box(slide, x, cy, w, h, fill=WHITE, line=LINE, lw=0.75)
        if way: box(slide, x, cy, 0.05, h, fill=RED)
        text(cb, [[(name, 7.2, True, BLACK)], [(title, 6.2, False, INK2)]], anchor=MSO_ANCHOR.MIDDLE)
        cb.text_frame.margin_left = Inches(0.12 if way else 0.06)
        cb.text_frame.margin_right = Inches(0.7)
        pill(slide, x + w - 0.68, cy + (h - 0.16) / 2, label, fill, fg, w=0.64, border=(BLACK if tag == "CT" else GREY if tag == "VO" else None))
        cy += h + card_gap
    paras = []
    if d.get("lead"): paras.append([(d["lead"], 6.2, True, BLACK)])
    if d.get("note"): paras.append([(d["note"], 6, False, GREY, True)])
    if paras:
        nb = box(slide, x, cy + 0.02, w, 0.8)
        text(nb, paras)
        if len(paras) > 1: nb.text_frame.paragraphs[1].space_before = Pt(2)

# connectors: Tom -> spine -> each header (row 1); row 2 hangs from a second spine
spine1_y = y_row1 - 0.16
line(slide, tom_x + tom_w / 2, tom_y + tom_h + 0.04, tom_x + tom_w / 2, spine1_y, colour=BLACK, lw=1.2)
xs1 = [L + i * (col_w1 + gap) for i in range(4)]
line(slide, xs1[0] + col_w1 / 2, spine1_y, xs1[-1] + col_w1 / 2, spine1_y, colour=BLACK, lw=1.2)
for i, d in enumerate(row1):
    x = xs1[i]; line(slide, x + col_w1 / 2, spine1_y, x + col_w1 / 2, y_row1, colour=BLACK, lw=1.2)
    dept(slide, d, x, y_row1, col_w1, y_row2 - 0.32)
spine2_y = y_row2 - 0.16
xs2 = [L + i * (col_w2 + gap) for i in range(3)]
line(slide, xs1[0] + col_w1 / 2, spine1_y, xs1[0] + col_w1 / 2, y_row1, colour=BLACK, lw=1.2)
# a drop from the first spine's left end down the margin to the second spine
line(slide, L - 0.12, spine1_y, L - 0.12, spine2_y, colour=BLACK, lw=1.2)
line(slide, L - 0.12, spine1_y, xs1[0] + col_w1 / 2, spine1_y, colour=BLACK, lw=1.2)
line(slide, L - 0.12, spine2_y, xs2[-1] + col_w2 / 2, spine2_y, colour=BLACK, lw=1.2)
for i, d in enumerate(row2):
    x = xs2[i]; line(slide, x + col_w2 / 2, spine2_y, x + col_w2 / 2, y_row2, colour=BLACK, lw=1.2)
    dept(slide, d, x, y_row2, col_w2, 7.22)

# legend + footer
ly = 7.4
lx = L
t = box(slide, lx, ly, 0.5, 0.18); text(t, [[("KEY", 6, True, BLACK)]], anchor=MSO_ANCHOR.MIDDLE); lx += 0.42
for tag in ("FT", "PT", "CT"):
    label, fill, fg = TAG[tag]
    pill(slide, lx, ly + 0.01, label, fill, fg, w=0.74, border=(BLACK if tag == "CT" else GREY if tag == "VO" else None)); lx += 0.8
box(slide, lx + 0.08, ly + 0.01, 0.05, 0.16, fill=RED)
t = box(slide, lx + 0.14, ly - 0.02, 3.6, 0.24)
text(t, [[("Red edge: came into the company through The Way In (college placement, T Level industry placement or Jobcentre Plus referral)", 6, False, INK2)]], anchor=MSO_ANCHOR.MIDDLE)
t = box(slide, L, 7.7, 7.6, 0.4)
text(t, [[("Prepared 6 September 2026 from the company staff register. Employment basis shown as at September 2026, including moves into direct employment now in progress.", 5.8, False, GREY)]])

# ── right: the developing group structure ────────────────────────────────
GX, GY, GW, GH = 8.3, 1.16, 2.94, 6.06
gp = box(slide, GX, GY, GW, GH, fill=GROUP_BG)
slide.shapes.add_picture(os.path.join(ASSETS, "group-logo-light.png"), Inches(GX + 0.18), Inches(GY + 0.16), height=Inches(0.62))
t = box(slide, GX + 0.9, GY + 0.16, GW - 1.0, 0.62)
text(t, [[("FREEDOM GROUP ENTERPRISES LTD", 7.4, True, WHITE)], [("Developing group structure", 7, True, PLANET["fire"])], [("Group company. Strategy and brand architecture.", 6, False, "BBBBBB")]], anchor=MSO_ANCHOR.MIDDLE)
line(slide, GX + 0.18, GY + 0.9, GX + GW - 0.18, GY + 0.9, colour="333333", lw=0.75)
cy = GY + 1.0
for tier, colour, entries in GROUP:
    hb = box(slide, GX + 0.18, cy, GW - 0.36, 0.2)
    dot = box(slide, GX + 0.18, cy + 0.05, 0.1, 0.1, fill=colour, shape=MSO_SHAPE.OVAL)
    text(hb, [[("     " + tier, 6.2, True, colour)]], anchor=MSO_ANCHOR.MIDDLE)
    cy += 0.24
    for name, desc in entries:
        eh = 0.5 if len(desc) < 120 else 0.86
        eb = box(slide, GX + 0.18, cy, GW - 0.36, eh, fill="161616", line="2A2A2A", lw=0.5)
        text(eb, [[(name, 7.6, True, WHITE)], [(desc, 5.9, False, "BBBBBB")]], anchor=MSO_ANCHOR.MIDDLE)
        cy += eh + 0.06
    cy += 0.06
sb = box(slide, GX + 0.18, cy + 0.02, GW - 0.36, 0.62, fill="161616", line="2A2A2A", lw=0.5)
text(sb, [[("SHARED INFRASTRUCTURE", 6.2, True, PLANET["blue"])], [(SHARED.split(": ", 1)[1], 6, False, "BBBBBB")]], anchor=MSO_ANCHOR.MIDDLE)
wb = box(slide, GX + 0.18, GY + GH - 0.62, GW - 0.36, 0.5)
text(wb, [[("The group company and the proposed companies are not yet on the register. Years are targets; long-term options are not plans.", 5.6, False, "9A9A9A", True)]], anchor=MSO_ANCHOR.BOTTOM)

prs.save(OUT)
print("saved", OUT)
