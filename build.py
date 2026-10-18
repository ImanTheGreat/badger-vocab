"""
Badger Vocab: build script
Copyright (c) 2026 Iman Lloyd. Licensed under the PolyForm Noncommercial License 1.0.0 (see LICENSE.md).
Required Notice: Copyright (c) 2026 Iman Lloyd. Badger Vocab was made by Iman Lloyd as a gift to the University of Wisconsin-Madison Language Department.

Bundles the app into single shareable files in the dist/ folder:

  dist/Badger Vocab.html                  everything, including the Arabic word list
                                          (only built if data/arabic-words.js is present)
  dist/Badger Vocab (no word list).html   the same app without the Arabic list,
                                          safe to post publicly

Why: the folder version is easiest to read and edit, but a single file is easiest
to email, AirDrop or put on a USB stick. This script copies index.html and pastes
the CSS, the JavaScript, the word list and the icon straight into it.

Run it after you change anything:
    python3 build.py

Uses only Python's standard library, so there is nothing to install.
"""
import base64
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
WORDS = "data/arabic-words.js"


def read(name):
    return (ROOT / name).read_text(encoding="utf-8")


def inline_script(code):
    # "</script" inside the code would end the tag early, so escape it.
    return "<script>\n" + code.replace("</script", "<\\/script") + "\n</script>"


def build(include_words, out_name):
    html = read("index.html")

    html = html.replace('<link rel="stylesheet" href="style.css">',
                        "<style>\n" + read("style.css") + "\n</style>")

    words_tag = f'<script src="{WORDS}"></script>'
    assert words_tag in html, f"missing {words_tag} in index.html"
    html = html.replace(words_tag, inline_script(read(WORDS)) if include_words else "")

    for js in ("chess-puzzles.js", "app.js", "free.js", "break.js"):
        tag = f'<script src="{js}"></script>'
        assert tag in html, f"missing {tag} in index.html"
        html = html.replace(tag, inline_script(read(js)))

    # Icons become data URLs; the manifest only works on a website, so drop it here.
    svg = "data:image/svg+xml;base64," + base64.b64encode((ROOT / "icon.svg").read_bytes()).decode()
    png = "data:image/png;base64," + base64.b64encode((ROOT / "icon-180.png").read_bytes()).decode()
    html = html.replace('"icon.svg"', f'"{svg}"').replace('"icon-180.png"', f'"{png}"')
    html = html.replace('<link rel="manifest" href="manifest.webmanifest">\n', "")

    DIST.mkdir(exist_ok=True)
    out = DIST / out_name
    out.write_text(html, encoding="utf-8")
    print(f"Built {out.relative_to(ROOT)} ({out.stat().st_size / 1024:.0f} KB)")


def main():
    if (ROOT / WORDS).exists():
        build(True, "Badger Vocab.html")
    else:
        print(f"Skipped the full version: {WORDS} isn't in this folder.")
    build(False, "Badger Vocab (no word list).html")


if __name__ == "__main__":
    main()
