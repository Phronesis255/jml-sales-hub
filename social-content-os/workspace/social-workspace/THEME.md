# Account theme roles

Generated from theme.js. Exact source primary/accent colors are preserved. Supporting interface colors are derived in OKLCH; chroma is reduced only when a derived role falls outside sRGB. WCAG contrast is then measured on final hex values.

| Account | Primary | Accent | Chrome | Canvas | Text | Lowest text contrast | Lowest essential UI contrast |
|---|---|---|---|---|---|---:|---:|
| demo | #4c0099 | #b1eb1e | #13111c | #f8f7fc | #22202a | 4.53:1 | 3.10:1 |
| brand_jml | #4c0099 | #b1eb1e | #13111c | #f8f7fc | #22202a | 4.53:1 | 3.10:1 |
| brand_b4k | #007cc6 | #f7c332 | #0a141c | #f4f8fc | #1b232a | 4.50:1 | 3.14:1 |
| brand_nn | #303133 | #fcc23b | #131311 | #f9f8f5 | #22211f | 4.55:1 | 3.17:1 |
| brand_mlb | #002451 | #db121a | #0c131c | #f5f8fd | #1c222a | 4.52:1 | 3.15:1 |
| brand_jay | #3b0764 | #a81070 | #15101b | #f9f7fc | #232029 | 4.52:1 | 3.18:1 |
| brand_zees | #030303 | #f8c521 | #131311 | #f9f8f5 | #22221f | 4.56:1 | 3.17:1 |
| brand_northstar | #623c2c | #d8b17c | #1b0f0b | #fcf6f4 | #291f1b | 4.54:1 | 3.10:1 |

All checks meet 4.5:1 for small text and 3:1 for essential controls/icons. The JSON companion contains each hex token and measured foreground/background pair. Decorative dividers intentionally use a lighter role and are not the sole indicator of control boundaries.

B4K primary blue against white measures 4.47:1. Its primary-button label therefore uses black, while link text uses a darker same-hue role. Very light, white, black and saturated custom palettes are covered by automated tests.

Semantic variables: --chrome, --chrome-raised, --canvas, --surface, --surface-raised, --brand, --accent, --border, --text, --text-secondary, --text-tertiary. Compatibility variables remain available to every existing view. Success, warning, error and information roles keep stable meanings across accounts.

Local typography: DM Sans for body and controls; DM Serif Display for page headings; JetBrains Mono for identifiers and compact metadata. Font files and OFL licenses are in fonts/. No runtime font service is required. Body emphasis is limited to 600; controls are 36px desktop and 44px mobile.

Original Content Planner receives the same role values only in embedded mode. Creative Brief Studio receives a validated hex-only token map through its existing same-origin bridge. Both standalone tools retain their original behavior.
