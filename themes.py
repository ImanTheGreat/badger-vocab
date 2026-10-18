"""
Badger Vocab: color theme generator
Copyright (c) 2026 Iman Lloyd. Licensed under the PolyForm Noncommercial License 1.0.0 (see LICENSE.md).
Required Notice: Copyright (c) 2026 Iman Lloyd. Badger Vocab was made by Iman Lloyd as a gift to the University of Wisconsin-Madison Language Department.

Writes every color theme (light and dark) into style.css and the theme list into app.js.

To add a theme, add one line to AUTO below: (id, name shown in the picker, hue 0-360, saturation 0-100).
  Hue: 0 red, 30 orange, 50 yellow, 120 green, 180 teal, 210 blue, 270 purple, 320 pink.
Then run:
    python3 themes.py
    python3 build.py

Every generated color is checked against the WCAG readability rules
(4.5:1 contrast for text), and adjusted until it passes.
Uses only Python's standard library.
"""
import colorsys
import re
from pathlib import Path

ROOT = Path(__file__).parent

# ---- Hand-made themes: (id, name, light colors, dark colors) ----
# Keys: bg surface soft ink muted line accent ai (text on accent) as (soft accent)
#       deep (headings, links) sel st (selected button + its text) h1 h2 (header gradient)
HAND = [
    ("red", "Badger Red",
     dict(bg="#FBF5F5", surface="#FFFFFF", soft="#FCEBEC", ink="#2B1A1D", muted="#7A5E63", line="#EFD5D7", accent="#D50032", ai="#FFFFFF", **{"as": "#F7C6C7"}, deep="#A50034", sel="#A50034", st="#FFFFFF", h1="#A50034", h2="#D50032"),
     dict(bg="#170E10", surface="#24161A", soft="#331A20", ink="#F7ECEE", muted="#C4A6AC", line="#43282E", accent="#FF5470", ai="#2A0009", **{"as": "#5C2230"}, deep="#FF5470", sel="#F7C6C7", st="#3A0A16", h1="#5E0020", h2="#8A0029")),
    ("blue", "Lake Blue",
     dict(bg="#F4F7FB", surface="#FFFFFF", soft="#E8F0FA", ink="#17222F", muted="#5A6B7E", line="#D3DEEB", accent="#1F5FBF", ai="#FFFFFF", **{"as": "#C6D8F2"}, deep="#123E80", sel="#123E80", st="#FFFFFF", h1="#123E80", h2="#1F5FBF"),
     dict(bg="#0D131B", surface="#16202C", soft="#172A40", ink="#E9F0F8", muted="#9DB0C5", line="#26384D", accent="#6EA8FF", ai="#07203F", **{"as": "#1F3B60"}, deep="#6EA8FF", sel="#C6D8F2", st="#0B2240", h1="#0E2A57", h2="#184A95")),
    ("teal", "Teal",
     dict(bg="#F3F8F7", surface="#FFFFFF", soft="#E3F2F0", ink="#152624", muted="#566F6B", line="#CFE2DF", accent="#0F7C78", ai="#FFFFFF", **{"as": "#BFE3DF"}, deep="#0A5653", sel="#0A5653", st="#FFFFFF", h1="#0A5653", h2="#0F7C78"),
     dict(bg="#0C1514", surface="#14211F", soft="#16302C", ink="#E6F3F1", muted="#98B6B1", line="#24403B", accent="#4FD1C5", ai="#04302C", **{"as": "#1D4A45"}, deep="#4FD1C5", sel="#BFE3DF", st="#08302C", h1="#08413E", h2="#0D6662")),
    ("purple", "Purple",
     dict(bg="#F8F5FB", surface="#FFFFFF", soft="#F0E9F8", ink="#231A2E", muted="#6B5E7C", line="#E2D6EE", accent="#6B3FA0", ai="#FFFFFF", **{"as": "#DCCBF0"}, deep="#4B2775", sel="#4B2775", st="#FFFFFF", h1="#4B2775", h2="#6B3FA0"),
     dict(bg="#130E1A", surface="#1E1627", soft="#2A1D3A", ink="#F1EBF8", muted="#B6A7C9", line="#3A2C4C", accent="#B48CF2", ai="#25103F", **{"as": "#40285F"}, deep="#B48CF2", sel="#DCCBF0", st="#2A1245", h1="#36195A", h2="#58308C")),
    ("orange", "Autumn Orange",
     dict(bg="#FCF7F2", surface="#FFFFFF", soft="#FBEBDD", ink="#2B1E14", muted="#7A6352", line="#F0DCC9", accent="#B94E0A", ai="#FFFFFF", **{"as": "#F7D3B5"}, deep="#8A3A06", sel="#8A3A06", st="#FFFFFF", h1="#8A3A06", h2="#B04D0E"),
     dict(bg="#17110C", surface="#231A13", soft="#33231A", ink="#F8EEE6", muted="#C9B09C", line="#45321F", accent="#FF9F5A", ai="#3A1A04", **{"as": "#5A3418"}, deep="#FF9F5A", sel="#F7D3B5", st="#3A1A04", h1="#5C2706", h2="#94420C")),
    ("slate", "Slate",
     dict(bg="#F5F6F8", surface="#FFFFFF", soft="#ECEFF3", ink="#1C2128", muted="#5E6875", line="#DADFE6", accent="#3F5466", ai="#FFFFFF", **{"as": "#CDD6E0"}, deep="#2A3947", sel="#2A3947", st="#FFFFFF", h1="#2A3947", h2="#4A6175"),
     dict(bg="#111418", surface="#1A1F25", soft="#232A33", ink="#ECEFF3", muted="#A3ADB9", line="#2F3742", accent="#9DB4CC", ai="#14202C", **{"as": "#33414F"}, deep="#9DB4CC", sel="#CDD6E0", st="#18222D", h1="#20282F", h2="#33404C")),
    ("terrace", "Terrace Sunburst",  # Memorial Union terrace chairs: orange and sunny yellow
     dict(bg="#FFFBEF", surface="#FFFFFF", soft="#FFF1C2", ink="#2A1F0E", muted="#76613F", line="#F3DE9A", accent="#C2410C", ai="#FFFFFF", **{"as": "#FFD98A"}, deep="#9A3412", sel="#9A3412", st="#FFFFFF", h1="#9A3412", h2="#C2410C"),
     dict(bg="#16110A", surface="#211A0F", soft="#33260F", ink="#FFF6E0", muted="#D6BE8E", line="#4A3A1A", accent="#FFC233", ai="#2E1C00", **{"as": "#5A4210"}, deep="#FFC233", sel="#FFE08A", st="#2E1C00", h1="#7A2E06", h2="#A8410C")),
    ("graphite", "Graphite",
     dict(bg="#F6F6F6", surface="#FFFFFF", soft="#EDEDED", ink="#151515", muted="#5C5C5C", line="#DCDCDC", accent="#2B2B2B", ai="#FFFFFF", **{"as": "#D4D4D4"}, deep="#1A1A1A", sel="#1A1A1A", st="#FFFFFF", h1="#1A1A1A", h2="#3A3A3A"),
     dict(bg="#0E0E0E", surface="#191919", soft="#242424", ink="#F0F0F0", muted="#ABABAB", line="#323232", accent="#E6E6E6", ai="#111111", **{"as": "#3A3A3A"}, deep="#E6E6E6", sel="#E6E6E6", st="#111111", h1="#1E1E1E", h2="#333333")),
    ("contrast", "High Contrast",  # strongest contrast, for low vision or bright sunlight
     dict(bg="#FFFFFF", surface="#FFFFFF", soft="#F1F1F1", ink="#000000", muted="#2E2E2E", line="#000000", accent="#0033CC", ai="#FFFFFF", **{"as": "#C9D6FF"}, deep="#001F7A", sel="#000000", st="#FFFFFF", h1="#000000", h2="#000000"),
     dict(bg="#000000", surface="#000000", soft="#141414", ink="#FFFFFF", muted="#E0E0E0", line="#FFFFFF", accent="#FFE14D", ai="#000000", **{"as": "#3D3500"}, deep="#FFE14D", sel="#FFE14D", st="#000000", h1="#000000", h2="#000000")),
]

# ---- Generated themes: (id, name, hue, saturation) ----
AUTO = [
    ("forest", "Forest Green", 145, 55),
    ("turquoise", "Turquoise", 188, 90),
    ("sky", "Sky Blue", 199, 85),
    ("indigo", "Indigo", 238, 55),
    ("rose", "Rose", 345, 65),
    ("berry", "Berry", 322, 60),
    ("coral", "Coral", 9, 75),
    ("sunflower", "Sunflower", 40, 90),
    ("moss", "Moss", 78, 42),
    ("mint", "Mint", 160, 50),
    ("lavender", "Lavender", 266, 48),
    ("cocoa", "Cocoa", 24, 38),
    ("plum", "Plum", 295, 40),
]


# ---- color math ----
def hx(h, s, l):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, max(0, min(1, l / 100)), max(0, min(1, s / 100)))
    return "#%02X%02X%02X" % (round(r * 255), round(g * 255), round(b * 255))


def lum(c):
    def ch(v):
        v = int(v, 16) / 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * ch(c[1:3]) + 0.7152 * ch(c[3:5]) + 0.0722 * ch(c[5:7])


def contrast(a, b):
    x, y = sorted((lum(a), lum(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


def fit(h, s, l, against, need, step):
    """Move lightness by `step` until the color reaches `need` contrast against `against`."""
    while contrast(hx(h, s, l), against) < need and 0 <= l <= 100:
        l += step
    return hx(h, s, l)


def generate(h, s):
    light = dict(bg=hx(h, s * .45, 97.2), surface="#FFFFFF", soft=hx(h, s * .7, 93.5),
                 line=hx(h, s * .45, 86), **{"as": hx(h, s * .75, 85)}, ai="#FFFFFF", st="#FFFFFF")
    light["ink"] = fit(h, 25, 14, light["bg"], 12, -1)
    light["muted"] = fit(h, 14, 46, light["bg"], 5, -1)
    # Accent: white text must be readable on it, and it must be readable on white and on the soft tint.
    light["accent"] = min(fit(h, s, 50, "#FFFFFF", 4.8, -1), fit(h, s, 50, light["soft"], 4.5, -1), key=lum)
    light["deep"] = fit(h, s, 30, light["bg"], 7, -1)
    light["sel"] = light["deep"]
    light["h1"], light["h2"] = light["deep"], light["accent"]

    dark = dict(bg=hx(h, s * .3, 7), surface=hx(h, s * .25, 11), soft=hx(h, s * .35, 16),
                line=hx(h, s * .25, 24), **{"as": hx(h, s * .4, 26)},
                sel=hx(h, s * .75, 86), st=hx(h, s, 14), ai=hx(h, s, 12))
    dark["ink"] = fit(h, 30, 90, dark["bg"], 13, 1)
    dark["muted"] = fit(h, 16, 62, dark["surface"], 6, 1)
    dark["accent"] = fit(h, min(100, s * 1.05), 55, dark["surface"], 6, 1)
    dark["deep"] = dark["accent"]
    dark["h1"] = hx(h, s * .8, 17)
    dark["h2"] = fit(h, s * .8, 30, "#FFFFFF", 7, -1)
    return light, dark


def check(name, kind, d):
    """Every text-on-background pair the app uses must pass 4.5:1."""
    pairs = [("ink", "bg"), ("ink", "surface"), ("muted", "bg"), ("accent", "surface"),
             ("deep", "bg"), ("ai", "accent"), ("st", "sel")]
    for fg, bg in pairs:
        r = contrast(d[fg], d[bg])
        assert r >= 4.5, f"{name} ({kind}): {fg} on {bg} is only {r:.2f}:1"
    assert contrast("#FFFFFF", d["h2"]) >= 4.5 and contrast("#FFFFFF", d["h1"]) >= 4.5, f"{name} ({kind}): header text"


def decl(d):
    return (f"--bg:{d['bg']};--surface:{d['surface']};--soft:{d['soft']};--ink:{d['ink']};--muted:{d['muted']};--line:{d['line']};"
            f"--accent:{d['accent']};--accent-ink:{d['ai']};--accent-soft:{d['as']};--crimson:{d['deep']};--sel:{d['sel']};--seltxt:{d['st']};"
            f"--hd1:{d['h1']};--hd2:{d['h2']}")


def main():
    themes = list(HAND) + [(k, n, *generate(h, s)) for k, n, h, s in AUTO]
    for k, n, l, d in themes:
        check(n, "light", l)
        check(n, "dark", d)

    fixed_dark = "--ok:#6FCB9C;--okbg:#173628;--bad:#FF6B7D;--semi:#F2A0AD;--semi-ink:#3A0A16;color-scheme:dark"
    css = ['/* THEMES START: generated by themes.py. Edit themes.py, not this block. */',
           ':root{--ok:#2F7A57;--okbg:#E2F1E8;--bad:#B22234;--semi:#E7909C;--semi-ink:#4A0D1A;'
           '--ui:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans",Arial,sans-serif;'
           '--arabic:"Noto Naskh Arabic","Geeza Pro","Sakkal Majalla","Traditional Arabic","Arabic Typesetting","Noto Sans Arabic","Segoe UI",serif;'
           '--tf:var(--ui);color-scheme:light}',
           ':root[data-look="dark"]{' + fixed_dark + '}',
           '@media (prefers-color-scheme:dark){:root:not([data-look="light"]):not([data-look="dark"]){' + fixed_dark + '}}']
    for k, n, l, d in themes:
        nd = ',:root:not([data-theme])' if k == "red" else ''
        css.append(f':root[data-theme="{k}"]{nd}{{{decl(l)}}} /* {n} */')
        css.append(f':root[data-theme="{k}"][data-look="dark"]' + (',:root:not([data-theme])[data-look="dark"]' if k == "red" else '') + f'{{{decl(d)}}}')
        css.append(f'@media (prefers-color-scheme:dark){{:root[data-theme="{k}"]:not([data-look="light"])'
                   + (',:root:not([data-theme]):not([data-look="light"])' if k == "red" else '') + f'{{{decl(d)}}}}}')
    css.append('/* THEMES END */')

    style = (ROOT / "style.css").read_text(encoding="utf-8")
    style = re.sub(r"/\* THEMES START.*?/\* THEMES END \*/", lambda m: "\n".join(css), style, flags=re.S)
    (ROOT / "style.css").write_text(style, encoding="utf-8")

    js_list = ",".join(f'["{k}","{n}","{l["h1"]}","{l["h2"]}"]' for k, n, l, d in themes)
    js = f"// THEMES START: generated by themes.py\nconst THEMES=[{js_list}];\n// THEMES END"
    app = (ROOT / "app.js").read_text(encoding="utf-8")
    app = re.sub(r"// THEMES START.*?// THEMES END", lambda m: js, app, flags=re.S)
    (ROOT / "app.js").write_text(app, encoding="utf-8")
    print(f"Wrote {len(themes)} themes (each with a light and dark version). All pass the 4.5:1 contrast check.")


if __name__ == "__main__":
    main()
