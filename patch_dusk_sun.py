"""Patch outdoor dusk weather: hide roof sun disc during anxiety/dusk."""
from __future__ import annotations

import base64
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
TARGETS = [ROOT / "情绪小屋-单文件版.html", ROOT / "game" / "room.html"]
OLD = "\t\t\tsun.visible = sunny || w === \"dusk\";"
NEW = "\t\t\tsun.visible = sunny;"


def patch_html(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    match = re.search(r'eval\(atob\("([^"]+)"\)\)', text)
    if not match:
        raise RuntimeError(f"eval block not found in {path}")
    js = base64.b64decode(match.group(1)).decode("utf-8")
    if OLD not in js:
        if NEW in js:
            print(f"already patched: {path.name}")
            return
        raise RuntimeError(f"target line not found in {path}")
    js = js.replace(OLD, NEW, 1)
    encoded = base64.b64encode(js.encode("utf-8")).decode("ascii")
    updated = text[: match.start(1)] + encoded + text[match.end(1) :]
    path.write_text(updated, encoding="utf-8")
    print(f"patched: {path.name}")


def main() -> None:
    for path in TARGETS:
        patch_html(path)


if __name__ == "__main__":
    main()
