"""Regenerate the Verified Record's data-driven tables from personal/data/*.json.

Run from the repo root or from personal/:  python personal/build_record.py
It rewrites only the blocks between <!-- @metrics --> / <!-- @/metrics --> and
<!-- @timeline --> / <!-- @/timeline --> in personal/index.html, so figures are
written once, in the register, and the page follows.
"""
import json, os, re, html

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
PAGE = os.path.join(HERE, "index.html")

def load(name):
    with open(os.path.join(DATA, name + ".json"), encoding="utf-8") as f:
        return json.load(f)

def esc(s):
    return html.escape(str(s), quote=False)

STATUS = {"verified": "Verified", "management": "Management data", "target": "Target"}

def metrics_table(metrics, sources, claims):
    checked = {c["evidence_id"]: c["last_checked"] for c in claims["claims"]}
    rows = []
    for m in metrics:
        src = sources[m["source"]]
        src_html = ('<a href="%s">%s</a>' % (esc(src["url"]), esc(src["name"]))) if src["kind"] == "public" \
                   else esc(src["name"]) + " · on request"
        rows.append(
            "<tr><td class=\"v\">%s</td><td class=\"d\"><b>%s.</b> %s</td><td class=\"d\">%s<br><small>%s</small></td>"
            "<td class=\"d\"><span class=\"status %s\">%s</span><br>%s</td><td class=\"id\">%s<br>%s</td></tr>"
            % (esc(m["value"]), esc(m["label"]), esc(m["definition"]), esc(m["period"]), esc(m["scope"]),
               m["status"], STATUS[m["status"]], src_html, esc(m["id"]), esc(checked.get(m["id"], ""))))
    return ("<div class=\"rec-wrap\"><table class=\"rec-tbl\"><thead><tr><th>Value</th><th>Claim and definition</th>"
            "<th>Period and scope</th><th>Status and source</th><th>Evidence · checked</th></tr></thead><tbody>\n"
            + "\n".join(rows) + "\n</tbody></table></div>")

def timeline_table(timeline):
    rows = ["<tr><th>%s</th><td class=\"d\">%s</td><td class=\"d\">%s</td><td class=\"id\">%s</td></tr>"
            % (esc(t["label"]), esc(t["title"]), esc(t["entity"]), esc(t["ev"])) for t in timeline]
    return ("<div class=\"rec-wrap\"><table class=\"rec-tbl\"><thead><tr><th>When</th><th>Milestone</th><th>Entity</th>"
            "<th>Evidence</th></tr></thead><tbody>\n" + "\n".join(rows) + "\n</tbody></table></div>")

def inject(page, key, block):
    pat = re.compile(r"(<!-- @%s -->)(.*?)(<!-- @/%s -->)" % (key, key), re.S)
    assert pat.search(page), "marker missing: " + key
    return pat.sub(lambda mm: mm.group(1) + "\n      " + block + "\n      " + mm.group(3), page, count=1)

def main():
    metrics, sources, claims, timeline = load("metrics"), load("sources"), load("claims"), load("timeline")
    with open(PAGE, encoding="utf-8") as f:
        page = f.read()
    page = inject(page, "metrics", metrics_table(metrics, sources, claims))
    page = inject(page, "timeline", timeline_table(timeline))
    with open(PAGE, "w", encoding="utf-8") as f:
        f.write(page)
    print("record rebuilt: %d metrics, %d timeline entries" % (len(metrics), len(timeline)))

if __name__ == "__main__":
    main()
