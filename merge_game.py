#!/usr/bin/env python3
"""Merge sandbag + fountain changes into 情绪小屋-单文件版.html, then patch to game/room.html."""
from pathlib import Path
import re
import base64
import subprocess
import sys

ROOT = Path(__file__).parent
BASE_HTML = ROOT / "情绪小屋-单文件版.html"
SAND_HTML = ROOT / "情绪小屋-单文件版-沙袋.html"
FOUN_HTML = ROOT / "情绪小屋-单文件版-喷泉.html"
ADDON_MARKER = "// 1. 电闪雷鸣特效"


def read_eval_lines(html_path: Path) -> list[str]:
    text = html_path.read_text(encoding="utf-8")
    match = re.search(r'eval\(atob\("([^"]+)"\)\)', text)
    if not match:
        raise RuntimeError(f"eval block not found in {html_path}")
    return base64.b64decode(match.group(1)).decode("utf-8").splitlines()


def encode_eval_js(lines: list[str]) -> str:
    return base64.b64encode("\n".join(lines).encode("utf-8")).decode("ascii")


def find_line(lines: list[str], pattern: str, start: int = 0) -> int:
    for i in range(start, len(lines)):
        if pattern in lines[i]:
            return i
    raise RuntimeError(f"pattern not found: {pattern!r}")


def find_last_line(lines: list[str], pattern: str) -> int:
    for i in range(len(lines) - 1, -1, -1):
        if pattern in lines[i]:
            return i
    raise RuntimeError(f"pattern not found: {pattern!r}")


def extract_addon_scripts(html_path: Path) -> str:
    text = html_path.read_text(encoding="utf-8")
    start = text.find(ADDON_MARKER)
    if start < 0:
        raise RuntimeError(f"addon marker not found in {html_path}")
    # include opening <script> tag before marker
    script_open = text.rfind("<script>", 0, start)
    if script_open < 0:
        raise RuntimeError("addon <script> tag not found")
    end = text.find("</script>", start)
    if end < 0:
        raise RuntimeError("addon </script> not found")
    return text[script_open : end + len("</script>")]


def build_merged_eval_js() -> list[str]:
    base_lines = read_eval_lines(BASE_HTML)
    sand_lines = read_eval_lines(SAND_HTML)
    foun_lines = read_eval_lines(FOUN_HTML)

    # __emotionApp exposure (required for sandbag addon scripts)
    exposure_anchor = "  window.__scene = scene;"
    if exposure_anchor not in "\n".join(base_lines):
        if exposure_anchor not in "\n".join(sand_lines):
            raise RuntimeError("window exposure block missing in sandbag source")
        start = find_line(sand_lines, exposure_anchor)
        end = find_last_line(sand_lines, "\t//#endregion")
        base_end = find_last_line(base_lines, "\t//#endregion")
        base_lines = base_lines[:base_end] + sand_lines[start:end] + base_lines[base_end:]

    # fountain model + animation for sunny (joy) scene
    start = find_line(base_lines, "function buildFountain()")
    end = find_line(base_lines, "function buildSwing()")
    f_start = find_line(foun_lines, "function buildFountain()")
    f_end = find_line(foun_lines, "function buildSwing()")
    merged = base_lines[:start] + foun_lines[f_start:f_end] + base_lines[end:]
    return merged


def patch_html_eval(html: str, eval_lines: list[str]) -> str:
    encoded = encode_eval_js(eval_lines)
    return re.sub(
        r'eval\(atob\("[^"]+"\)\)',
        f'eval(atob("{encoded}"))',
        html,
        count=1,
    )


def merge_html() -> str:
    base_html = BASE_HTML.read_text(encoding="utf-8")
    merged_eval = build_merged_eval_js()
    html = patch_html_eval(base_html, merged_eval)

    addons = extract_addon_scripts(SAND_HTML)
    if addons in html:
        print("addon scripts already present, skipping insert")
    else:
        html = html.replace("</body>", addons + "\n\n</body>", 1)

    return html


def main() -> None:
    merged_html = merge_html()
    BASE_HTML.write_text(merged_html, encoding="utf-8")
    print(f"Updated {BASE_HTML} ({BASE_HTML.stat().st_size} bytes)")

    patch_script = ROOT / "patch_game.py"
    result = subprocess.run([sys.executable, str(patch_script)], cwd=ROOT, check=False)
    if result.returncode != 0:
        raise SystemExit(f"patch_game.py failed with code {result.returncode}")
    print("patch_game.py completed")


if __name__ == "__main__":
    main()
