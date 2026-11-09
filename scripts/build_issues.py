#!/usr/bin/env python3
"""Generate issues.json from the issue-N/ folders (number + masthead date)."""
import json, re, sys
from datetime import datetime
from pathlib import Path

root = Path(__file__).resolve().parent.parent
date_re = re.compile(r"(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})")
issues = []
for page in sorted(root.glob("issue-*/index.html")):
    m = re.fullmatch(r"issue-(\d+)", page.parent.name)
    if not m:
        continue
    head = page.read_text(encoding="utf-8")
    top = re.search(r'class="masthead-top".*?class="masthead-logo"', head, re.S)
    d = date_re.search(top.group(0) if top else head)
    if not d:
        sys.exit(f"{page}: no masthead date found")
    day, month, year = d.groups()
    iso = datetime.strptime(f"{day} {month} {year}", "%d %B %Y").date().isoformat()
    issues.append({"number": int(m.group(1)), "path": page.parent.name, "date": iso})
issues.sort(key=lambda i: i["number"], reverse=True)
(root / "issues.json").write_text(json.dumps({"issues": issues}, indent=2) + "\n")
print(f"Wrote {len(issues)} issues")
