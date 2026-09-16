# Histoveya AI
### Web platform design & build brief

> **Purpose of this file.** This is the single source of truth for the look, structure and
> conventions of the Histoveya AI web front-end. Any future Cowork session should read this
> file **first**, follow it, and update it when a decision changes. Treat it as a living
> style guide, not a one-off spec.

> **Rebrand, 2026-09-10.** The site was previously *NePaL, the Nepal Pathology Atlas*, run
> by CMDN and Intrepid Nepal. It is now **Histoveya AI**, with no CMDN or Intrepid branding
> anywhere. If one of those names turns up in the tree, it is a leftover, not a decision.

---

## 1. What we are building

A public, open‑access **whole‑slide‑image (WSI) database** for a South Asian / Nepali
cancer cohort, the regional analogue of **TCGA / GDC Data Portal**, with an initial
cohort of **1,000+ digitised cancer slides**.

**Who owns what.** One name on the site: **Histoveya AI**. There is no partner strip, no
parent company credit and no second logo. Do not reintroduce one without being asked.

The reporting laboratory is a separate open question. Every slide is scanned and reported
at one laboratory in Kathmandu, but that laboratory has no agreed public name yet, so it is
a **visible placeholder** in the code (see §5a). Do not fill it in with a guess.

**Name & branding**
- Full name and wordmark: **Histoveya AI**
- Strapline, from the logo: *"South Asian histopathology & AI portal"*
- Tagline: *"Whole-slide pathology from South Asia, and the models built on it."*

**Release framing:** the site presents itself as **Release 1.0**, the first public
release. Do not invent a version history; the timeline shows 1.0 as current and 1.1
as planned, and nothing else.

**Current stage:** front‑end mock only. No backend, no real data, no auth.
Everything is static HTML/CSS/JS with client‑side generated dummy records.
Do **not** invest in engineering (build tooling, frameworks, APIs) until the
interface direction is signed off.

---

## 2. Reference platforms

Borrow patterns from these; do not copy their branding.

| Platform | What to borrow |
|---|---|
| **GDC Data Portal** (portal.gdc.cancer.gov) | Faceted left‑rail filters, cohort "cart", summary charts above the results table |
| **cBioPortal** | Study landing pages, clean data tables, query‑first entry point |
| **Digital Slide Archive / HistomicsUI** | WSI viewer chrome, annotation panel, slide metadata sidebar |
| **TCIA** | Data‑access / citation / DUA pages, collection cards |
| **PathologyOutlines / ProteinAtlas** | Readable diagnostic text and image‑forward layouts |

---

## 3. Design system

### 3.1 Colour tokens

The navy base is unchanged. The old CMDN red is gone as a brand colour. The accent is a
**copper**, chosen as the warm complement to the logo's petrol teal. Extending the blue and
teal family would have produced a second base colour rather than a signal colour, and the
accent's whole job is to be the one thing on a navy screen that is not navy. `#b2531f`
clears 4.5:1 against white text, so it still works as a filled button.

The logo ink itself, `--teal-700`, sampled from the wordmark, is the header type colour, so
the drawn logo and the set type are the same colour.

Red survives in exactly one place, `--fail-600`, as the reserved QC "Failed" status colour.
It is never branding. Do not wire it to a button, a rule or a kicker.

```css
--navy-900: #0b1f3a;   /* headers, footer, dark bands            */
--navy-800: #123055;   /* nav hover, dark cards                  */
--navy-700: #1c4373;   /* primary brand blue                     */
--navy-600: #2a5c96;   /* links, active states                   */
--blue-100: #e3ecf6;   /* tinted panel backgrounds               */
--blue-050: #f2f6fb;   /* page background                        */

--teal-700: #194e60;   /* logo ink, header type                  */

--accent-600:#b2531f;  /* copper, accent only                    */
--accent-500:#c9642c;  /* hover on accent                        */
--accent-300:#e08a4a;  /* accent on dark bands                   */
--accent-050:#fbf1ea;  /* accent tint (TODO blocks, gate bar)    */

--fail-600: #cc0000;   /* reserved: QC "Failed" status only      */
--fail-050: #fdecec;

--ink-900:  #10181f;   /* body text                              */
--ink-600:  #4a5763;   /* secondary text                         */
--ink-400:  #7d8894;   /* meta, captions                         */
--line:     #d8e0e9;   /* borders, table rules                   */
--white:    #ffffff;

/* categorical (charts, organ/diagnosis chips) */
--c1:#1c4373; --c2:#b2531f; --c3:#2e8b74; --c4:#c77d0a;
--c5:#6b4c9a; --c6:#0f7fa3; --c7:#8a5a44; --c8:#5a6b7a;
```

**Rule:** blue carries the interface. Copper is used sparingly: one primary CTA per
screen, active tab underlines, the section-index marker, the gate bar and the TODO blocks.
Never large copper fills.

### 3.1b Two themes

The page ships a light and a dark theme. The dark one is a **token swap, never a filter**.
There is no `filter: invert()` anywhere and there must never be: it would wreck the slide
imagery, which is the one thing on the page that has to stay colour-accurate.

**How it is wired.** `:root` holds the light values. `:root[data-theme="dark"]` overrides
that list and nothing else. A new rule themes itself for free as long as it uses the
semantic tokens rather than a raw hex or a brand token.

The tokens split into three kinds, and the split is the whole trick:

- **Brand ramp** (`--navy-*`, `--teal-700`, `--accent-500/300`). Identical in both themes.
  These are fills that carry white text, so they do not need to move.
- **Semantic tokens** (`--bg`, `--surface`, `--surface-2/3`, `--field`, `--line`, `--ink-*`,
  `--grid`, `--band`, `--band-2`, `--on-band*`). These are what the UI actually uses, and
  these are what the dark block moves.
- **Foreground twins.** A navy that works as a *fill* is invisible as *text on navy*, so
  the foreground uses were split out: `--heading`, `--figure`, `--brand-fg`, `--link`,
  `--control`, and `--accent-fg` beside `--accent-600`. `--accent-600` is the fill that
  carries white text and does not move between themes; `--accent-fg` is the accent as text
  or as a rule, and lifts to `#f0a06b` in dark. Same copper, legible on both grounds.

**Dark surfaces deepen the navy rather than going to black.** `--bg` is `#05101c` and
`--surface` is `#0c1e31`, so cards still sit above the page and the product still reads as
itself with the lights off. The permanently-dark bands go deeper still (`--band` `#030b14`)
so they stay separable from the page instead of merging into it.

`color-scheme` is set on `:root` in both themes. Without it the native checkbox ticks,
select menus and scrollbars stay light-mode widgets on a dark page.

**Never themed, in either direction:**

- the slide imagery, the `mock_slides` thumbnails and previews, the hero slideshow
- `elements/histoveya-mark.png` and `elements/histoveya-logo.png`

Two consequences of that, both deliberate and both worth leaving alone:

1. The mark is dark teal ink with no light-on-dark version, so in dark it sits on a light
   plate (`:root[data-theme="dark"] .brand .lg-mark`). The moment a light version of the
   artwork exists, delete that rule and swap the `src` instead.
2. `.aboutlogo` keeps `background:#fff` hard-coded in both themes, for the same reason.

The **wordmark** is the exception, and only because it is set in type rather than being
part of the artwork: it has its own `--wordmark` token and lifts to `#7cbdd2` in dark. At
the brand teal it measured 1.85:1 on the dark header, which is unreadable.

**The theme is applied before first paint.** A short synchronous script in `<head>`, above
the stylesheet, reads `localStorage.theme` and stamps the attribute on `<html>`. Keep it
inline and synchronous. Deferring it, moving it to the end of the body, or folding it into
the main script all reintroduce the flash of the wrong theme on reload. Unset or unreadable
storage means light, which is the first-visit default, and every storage access is wrapped
in try/catch so a browser with site data blocked still works.

The toggle is `#themeBtn`, an icon-only button left of "Enter atlas", with `aria-label`,
`title` and `aria-pressed` kept in step with what the next click will do, and a visible
`:focus-visible` ring.

### 3.2 Typography

- **UI + body:** `"Inter", "Segoe UI", system-ui, sans-serif`
- **Headings:** same family, weight 600–700, tight tracking (`-0.02em`) on large sizes
- **Data / IDs / barcodes:** `"JetBrains Mono", "SF Mono", Consolas, monospace`
- Scale: 12 / 13 / 14 (base) / 16 / 20 / 26 / 34 / 44 px
- Body line‑height 1.6; table line‑height 1.35

### 3.3 Layout

- Max content width **1320px**, gutters 24px (16px < 768px)
- Browse page: **280px filter rail + fluid results area**
- Slide page: **fluid viewer + 360px metadata rail**
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- Radius: 6px (controls, chips), 10px (cards), 0 for tables
- Shadow: `0 1px 2px rgba(16,24,31,.06), 0 4px 16px rgba(16,24,31,.06)`: cards only

### 3.4 Component conventions

- **Cards**: white, 1px `--line` border, 10px radius, no shadow on hover‑less lists
- **Tables**: dense, zebra‑free, 1px bottom rules, sticky header, monospace ID column,
  entire row clickable → slide detail
- **Chips/facets**: pill, `--blue-100` background, count right‑aligned in `--ink-400`
- **Buttons**: primary = `--navy-700` fill / white text; accent = `--red-600` fill;
  secondary = white with `--line` border; all 6px radius, 38px tall
- **Stat tiles**: big number (34px, 700) over an uppercase 12px label in `--ink-400`
- **Badges**: QC status: green `#2e8b74`, amber `#c77d0a`, red `--red-600`
- **No decorative pills.** Rounded, tinted "bubble" backgrounds are reserved for
  things the user can act on: the removable filter chips and the QC badges. Static
  labels (the hero eyebrow, the example queries, the release tag) are set in type
  instead, using letter-spacing, weight, colour or a thin rule. A pill on a label
  that does nothing reads as decoration.

### 3.5 Logo

Files live in `elements/`:

- `elements/histoveya-logo.jpeg`: the **source** artwork as supplied. Wide canvas, mostly
  white margin, dark teal ink on white. Not referenced by the page.
- `elements/histoveya-logo.png`: the full lockup (mark over wordmark over strapline),
  trimmed to the ink and knocked to transparency, ink flattened to `--teal-700`. Used once,
  in the About panel, at 150px tall. It is legible only at about that size.
- `elements/histoveya-mark.png`: the circular mark alone, square, transparent. Used in the
  header and as the favicon.

Both PNGs are derived from the JPEG by script: crop to the ink bounding box, alpha from
darkness, flat ink colour. If the artwork is replaced, regenerate both rather than
hand-editing them.

**Do not** put the ink-coloured PNGs on a navy band. There is no light version. The footer
and other dark surfaces use the wordmark set in type instead.

**Header lockup**, left to right: the circular mark, then the wordmark set in a serif face,
uppercase, in `--teal-700`, with the strapline under it in the sans face. The whole lockup
is one link back to `#home`. "Enter atlas" sits on the right. Navigation is in a second,
tinted strip under the header row, which also carries the release label.

The wordmark is **set in type, not taken from the logo image**, because the strapline goes
illegible below about 60px of lockup height.

**The header is one fixed size and does not react to scroll.** It is sticky at 96px and it
stays 96px. The earlier expand-on-home / collapse-on-scroll behaviour, the `.tall` class,
the `syncHeader()` listener and the height transitions are all gone. Do not bring them back
without being asked: the resize moved the page under the cursor, which is why the old code
needed two hysteresis thresholds to stop it flickering.

| | header |
|---|---|
| logo row height | 96px |
| mark | 60px tall |
| wordmark | 26px |
| strapline | 9.5px / .13em |

The wordmark weight sits between `/*WORDMARK*/` and `/*ENDWORDMARK*/` markers in the
stylesheet, because it is the rule most likely to be nudged again. Georgia has no light
face and the page cannot load a webfont (§6: it must run from `file://`), so weight,
tracking and size are the only levers. It is currently **Medium 500, tracking -0.005em,
26px**, chosen over the original bold and over a Regular 400 variant that read too faint
beside the mark.

Below 1240px the lockup keeps its size. Below 900px and again below 760px it steps down. It
is a single flex row throughout, so nothing has to be hidden.

Header height is 96 + 46px, so sticky offsets elsewhere are `.secindex` 142px, and
`.facets` and `.rail` 158px.

**There is no partners strip.** It went with the rebrand, along with both partner logos.
The band it occupied is now section 02, About.

### 3.6 Slide imagery (`mock_slides/`)

Real slide imagery for the mock lives in `mock_slides/`, currently **CLAM
segmentation outputs** for TCGA breast slides (green tissue contour, blue holes,
white canvas). Filenames are TCGA barcodes.

Two derived sets are generated from them and are what the page actually loads ,
never point the page at the multi‑megabyte originals:

```
mock_slides/<TCGA-BARCODE>.jpg          originals, 2–12 MB   (not loaded)
mock_slides/preview/<SHORT-ID>.jpg      ≤1500px, viewer      (~300 KB)
mock_slides/thumbs/<SHORT-ID>.jpg       ≤440px, table & grid (~30 KB)
```

`<SHORT-ID>` is the filename up to the first dot (e.g. `TCGA-A8-A09N-01Z-00-DX1`).
Both derived sets are **auto‑cropped to the tissue bounding box**, the raw CLAM
output is mostly white margin and looks tiny and lost otherwise.

Regenerate after adding or replacing images (script kept at `~/mkthumbs.py` in the
session, reproduced here):

```python
# crop white margin, write preview/ (1500px) and thumbs/ (440px)
im = Image.open(f); im.draft("RGB", (2200, 2200)); im = im.convert("RGB")
a = np.asarray(im).astype(np.int16)                    # bbox of non-white
rows = np.nonzero((a.sum(2) < 735).any(axis=1))[0]
cols = np.nonzero((a.sum(2) < 735).any(axis=0))[0]
im = im.crop((cols[0], rows[0], cols[-1], rows[-1]))   # + ~2% padding
```

Then re‑inject the manifest into `index.html`, the page cannot `fetch()` a JSON
file over `file://`, so the image list is inlined between markers:

```python
names = sorted(os.path.basename(p) for p in glob.glob("mock_slides/thumbs/*.jpg"))
s = re.sub(r"/\*IMGS\*/.*?/\*ENDIMGS\*/",
           "/*IMGS*/" + json.dumps(names) + "/*ENDIMGS*/", s, flags=re.S)
```

Slides are assigned images round‑robin (`IMGS[idx % IMGS.length]`), so the Histoveya
slide IDs on screen are deliberately unrelated to the barcodes on disk. The imagery
The imagery is downsampled segmentation output standing in for full-resolution slides. The
filenames carry TCGA barcodes, so check provenance and licensing before any of it is
published.

### 3.7 Hero slideshow

The hero backdrop cycles through the images in `mock_slides/preview/`. Two stacked
`.hs-layer` divs cross-fade: the incoming layer is painted, given its pan as a CSS
transform, then faded up while the outgoing one fades down. Timings are three
constants at the top of the slideshow block:

```js
const HERO_HOLD = 5000,   // how long a slide holds
      HERO_FADE = 1100,   // cross-fade duration
      HERO_PAN  = 6600;   // pan duration, longer than hold + fade
```

The pan deliberately runs longer than the hold plus the fade, so movement carries
through the transition instead of stopping dead at the swap. Directions rotate
through the `PANS` table (left, down, right, up) so the motion does not feel
mechanical, and the scale (1.38) both crops the white margin and gives the
translate somewhere to travel. The image order is shuffled with the same seeded RNG
as the cohort, and the next image is preloaded one step ahead.

**Legibility is the constraint that governs this whole feature.** The slides are
mostly white canvas with a bright tissue overview, and the hero text is white. Two
things protect it: `filter: brightness(.52) saturate(1.3)` on the slideshow
container, which darkens every frame regardless of what the image contains, and the
`.hero-scrim` gradient above it, heaviest on the left where the text sits. If you
change either, check against the **brightest** image in the set, not a typical one.

Scale is the other lever worth knowing about. Below about 1.3 the whole slide
outline is visible and the green CLAM contour makes the hero read like a map;
above about 1.8 the crop lands on featureless tissue and the hero goes flat. 1.38
is the compromise.

`prefers-reduced-motion: reduce` holds a single still frame and never rotates.

### 3.8 Charts and the series palette

All charts are hand-rolled SVG in `index.html`. No chart library, because the page
has to run from `file://` with no network. The helpers are `drawDonut`,
`drawHBars` and `drawVBars`, plus `niceMax` for axis rounding and a single shared
tooltip element.

**The categorical palette is validated, not chosen by eye.** These eight hues, in
this order, clear the colour-vision-deficiency and normal-vision separation gates
on every adjacent pair against a white surface:

```css
--s1:#2a5c96;  --s2:#b2531f;  --s3:#1baf7a;  --s4:#eda100;
--s5:#e87ba4;  --s6:#008300;  --s7:#4a3aa7;  --s8:#eb6834;
--s-other:#9aa6b2;                      /* "Other", deliberately recessive */
```

Slots 1 and 2 are the brand blue and the copper accent, so charts sit inside the house
palette rather than beside it.

**Unvalidated since the rebrand:** slot 2 changed from `#cc0000` to `#b2531f` and has not
been through the validator. Its adjacent pairs, s1 blue and s3 green, separate by eye, but
s2 and s8 (`#eb6834`) are now both warm. Re-run the `dataviz` validator before treating the
palette as settled, and move s8 rather than s2 if a pair fails.

**In dark mode the series are lifted** (`--s1` to `--s8` under `[data-theme="dark"]`). Those
values have **not** been through the validator: they are the same hues raised for a dark
ground. Re-run the `dataviz` validator against `--surface` before the dark palette is
treated as settled, the same way the light one was.

Rules that go with the palette:

- **Assign slots in fixed order and never cycle.** A ninth category folds into
  "Other" (as the donut does at seven) or the chart is faceted. Do not generate a
  ninth hue.
- **Colour follows the entity, not its rank.** A filter that changes the series
  count must not repaint the survivors.
- **One category means one hue.** Single-series charts (diagnoses, centres, age)
  use `--s1` alone with no legend; the title names the series.
- **Ordered data gets a single-hue ramp, not categorical hues.** Stage uses
  `--q1` to `--q4` light to dark, with grey for "Not staged", and the subtitle says
  darker means later.
- **Status colours are reserved.** QC uses green/amber/red and always ships the
  status word beside the dot, never colour alone.
- Every chart carries a hover tooltip and a **Table** toggle, so identity and value
  are readable without relying on colour at all.

If you add or change hues, re-run the validator in the `dataviz` skill rather than
judging by eye, and check both the adjacent-pair and normal-vision floors.

---

## 4. Information architecture

```
index.html                 (single file; views switched client-side via #hash)
 ├── #home        Landing, one scroll, sections 00-02   PUBLIC
 │    ├── #s00    Overview (hero + stat band)
 │    ├── #s01    Atlas
 │    └── #s02    About
 ├── #browse      Browse / search the cohort            GATED
 ├── #slide/<id>  Slide detail + viewer                 GATED
 ├── #analytics   Cohort summary charts                 GATED
 ├── #training    Pathology training module             GATED
 ├── #aianalysis  AI analysis (stub)                    GATED
 ├── #access      Registration gate                     PUBLIC
 ├── #docs        Documentation / API           [placeholder]
 └── #contact     Contact                       [placeholder]
```

Views are plain `<main>` blocks toggled by a hash router. Keep it that way
until a real framework is justified.

`#s00` to `#s02` are **anchors on the landing page, not routes**. The router recognises the
`s0N` pattern, shows the home view and scrolls to that section instead of resetting to the
top. Numbered sections carry `scroll-margin-top:190px` so the heading clears the sticky
header and section index. There is no `#about` route. About is `#s02`.

**Removed 2026-09-15:** the landing page had two more sections, Training set and Analysis.
Both are gone, and About was renumbered from `#s04` to `#s02`. The `#analytics` *view* is
untouched and still gated. Only the landing-page section describing it went. If you find a
note referring to `#s03` or `#s04`, it is stale.

### 4.0 The registration gate

The landing page is public. `#browse`, `#slide/…` and `#analytics` are not.

The gate lives **in the router, not on the links**, so every entry point is covered by
construction: nav, hero CTA, organ cards, footer links, table rows, a pasted deep link. Do
not add per-link checks. If a new gated route appears, add its head to `GATED`.

```js
const GATED = {browse:1, slide:1, analytics:1, training:1, aianalysis:1};
let registered = false;      // front end only. No backend, no real auth.
let pending = "";            // where the user was heading
```

`registered` is a plain variable on purpose. It is not in `localStorage`, so a reload puts
the gate back, which is what someone reviewing the flow wants to see. When a gated route is
hit unregistered, `showGate(target)` stores the destination, rewrites the page title, and
shows the `.gatebar` naming where the user will land. On submit the flag flips and the
router sends them to `pending`, defaulting to `#browse`.

Honesty is preserved by `#draftBar`, a navy strip under the header that appears once the
gate is passed and says that no account was made and nothing was stored. It is dismissible.
Do not remove it while the form is fake. A form that looks like it saved something, and did
not, is the one thing here that could actually mislead someone.

**Draft-only bypass.** The gate page also carries a `.bypass` block: a hatched, dashed
panel headed "Draft build" with a "Skip for now (draft)" button that sets `registered` and
goes straight through. It exists so the interface can be clicked around without filling the
form, and it is drawn to look like scaffolding rather than part of the form, so nobody
mistakes it for a real control. It is two pieces, both marked: the `.bypass` markup on the
access view, and the `#skipGate` handler in `initAccess` (search `DRAFT BYPASS`). Delete
them together when the form goes live.

### 4.1 Landing page sections (in order)

The landing page is **one scroll, in numbered sections**, after the structure of
apexbionet.com.au/project-ai-powered-cancer-intelligence.html. The shape was borrowed: the
numbering, the stat callouts, the density. None of its copy, figures or branding was.

1. **Utility bar**: thin navy strip, strapline left, secondary links right
2. **Header**: mark and wordmark left, "Enter atlas" right, nav strip below. The nav strip
   is Home, Browse Slides, Analysis, Docs. There is deliberately no Register entry: Browse
   Slides and Analysis are both gated and land on that page anyway, so a third route to it
   was redundant.
3. **`#s00` Overview**: hero with slideshow backdrop (§3.7), eyebrow reading
   `00 Overview · Release 1.0`, headline, lede, search field with example queries, and the
   "Access the atlas" CTA with the registration note beside it
4. **Stat band**: 4 tiles: Slides · Cases · Cancer types · Total pixels. See §4.1b.
5. **Section index**: navy strip listing `00` to `02`, sticky at `top:142px`, highlighting
   whichever section is within 200px of the top. Static below 760px. The numbers are set in
   the same face as the labels, not in the mono face.
6. **`#s01` Atlas**: organ card grid, then two spec panels, what a slide record carries
   and how to pull the images
7. **`#s02` About**: the logo lockup, the representation argument, four stat callouts, the
   release notes, a "Contribute a case" block, the citation box, and a "Where the slides
   come from" panel. One visible TODO remains there, the contribution contact address.
8. **Footer**: navy, four link columns, licence (CC BY 4.0). The legal strip carries the
   copyright and the draft warning. The BSync IT hosting credit was removed on 2026-09-15.

**The four About callouts do not agree with the generated cohort, and that is not an
oversight.** They read 20x scan standard, 6 primary sites growing, 3 stain workflows,
5 countries represented, and they were supplied as fixed copy. The mock cohort on the same
page shows ten primary sites, a 40x and 20x mix, and one laboratory in one country. Do not
quietly change one to match the other. The callouts describe the real project and the
cohort is synthetic filler, so the generator is the side that should eventually move.

**Numbered section device.** `.snum` is a flex row: a large mono number in `--line` grey,
the heading and standfirst, and an optional right-aligned button, over a 1px rule. It is
the only thing that marks a section. Do not add a kicker on top of it.

**Unresolved figures are shown, not hidden.** `.todo` renders a copper-tinted block with a
mono `TODO` marker, and `.todo-inline` does the same for a missing string mid-sentence. The
rule: the draft never carries an invented number or an invented name. It carries a visible
hole where one is needed, so nobody demos past it by accident.

### 4.1b The stat band, and why the figures are round

The tiles read **1,000+ / 800+ / 5+ / 4+ TP**, not the exact cohort counts. Two
reasons, both worth keeping:

- A precise figure on a landing page goes stale the moment a slide is added, and
  nobody remembers to update the hero. A rounded floor stays true.
- Claiming more precision than the release warrants invites someone to check the
  arithmetic against the repository and find a mismatch.

"5+ cancer types" deliberately understates a cohort that currently spans ten sites.
Understating is the safe direction; do not "correct" it upward without asking.

Each number counts up from zero on an ease-out cubic over 1.5s, fired once by an
`IntersectionObserver` when the band scrolls into view, then settles on the exact
target. `prefers-reduced-motion: reduce` skips straight to the final figures. The
tiles use `font-variant-numeric: tabular-nums` so the digits do not jitter while
counting. Targets live in `data-count` on each span; the `+` is static markup, so
the animation never shows a misleading "+" mid-count.

### 4.2 Browse page

- Left rail facets, each collapsible with counts:
  **Primary site · Diagnosis · Histological grade · Stage · Sex · Age group ·
  Stain (H&E / IHC) · Scanner · Magnification · QC status**
- Top bar: result count, free‑text search, sort dropdown, table/grid toggle,
  "Add all to cart", CSV export button
- Active filters shown as removable chips above results
- Table columns: `Slide ID · Thumbnail · Primary site · Diagnosis · Grade · Sex ·
  Age · Stain · Mag · Size · QC`
- Grid mode: thumbnail cards, 4–5 per row
- Pagination: 25 / 50 / 100 per page

### 4.3 Analytics (`#analytics`)

One filter row above the charts (primary site, centre, stain, reset) plus a live
"in scope" count. Every chart reads the same filtered set, and clicking a mark
opens that subset in the repository, which is what makes the page worth visiting
rather than decorative.

Cards, in order: four KPI tiles, a donut, top-10 diagnoses, age histogram, stage
distribution, stains and special studies, QC summary. Filters are primary site and
stain only.

The donut has one behaviour worth preserving: with no site selected it shows the
split by primary site; select a site and it switches to the diagnosis split
**within** that site, and the title changes to say so. It is capped at six slices
plus "Other" because seven is where a donut stops being readable.

### 4.4 Registration (`#access`)

This page is the gate, see §4.0. It is reached deliberately from "Register", and
involuntarily from any gated route.

**Required:** full name, institution, institutional email, reason for access.
**Optional:** role, country, ORCID. The two DUA checkboxes are required, the release-mail
checkbox is not. Free webmail domains are rejected on the email field.

The sidebar explains what registration opens (public landing page against registered
repository, viewer, analysis and export), the data use agreement in five lines, and the
bulk download command.

On submit the page no longer shows a confirmation panel. It sets `registered` and sends the
user wherever they were going, because the point of the draft is to be clicked through. The
honesty that used to live in the confirmation panel now lives in `#draftBar`, §4.0, which is
shown from that moment on.

### 4.5 Slide detail page

- Breadcrumb, slide ID in monospace, QC badge, download + cite buttons
- **Viewer** (left, ~65%): dark surround, mock deep‑zoom canvas, zoom slider,
  magnification presets (1× 4× 10× 20× 40×), scale bar, thumbnail navigator inset,
  toggles for *AI attention heatmap* and *annotations*
- **Metadata rail** (right): tabs: **Case** (demographics, centre, consent),
  **Diagnosis** (ICD‑O, morphology, grade, stage, IHC panel),
  **Acquisition** (scanner, MPP, dimensions, file size, format),
  and whether an attention heat-map is published. There is no Files tab: see
  §5b on what the release does and does not contain.
- Below: related slides from the same case

### 4.6 Pathology training (`#training`)

Shape borrowed from the training section of
apexbionet.com.au/project-ai-powered-cancer-intelligence.html: a case viewer beside a
scored question set. None of its copy, cases or numbers were taken.

Layout is `.trainlayout`, a two-column grid, viewer left and quiz right, stacking below
1100px. The viewer **reuses the slide page's CSS** (`.viewer`, `.vtop`, `.canvas`,
`.stage`, `.zoomrow`, `.vbtn`) and **none of its JavaScript**. The slide-detail viewer is a
singleton wired to fixed element ids and module-level state (`cur`, `z`, `panX`), so it
cannot take a second instance without being refactored into a factory. Rather than refactor
working code, the training page has its own ~25 lines of pan and zoom on `tv`-prefixed ids
and `tz` / `tpx` / `tpy` state. If a third viewer is ever needed, refactor then, not now.

**The question content is the constrained part, and the constraint is not negotiable.**
`mock_slides` holds CLAM tissue-segmentation overviews, not diagnostic fields, and nothing
in it has been read by a pathologist. So a question may not turn on the morphology,
diagnosis, grade or receptor status of the image on screen: it could not be answered from
the image, and the answer would be invented. Every question in `QUIZ` is instead a general
point about stain reading that holds for any slide. Keep that rule for anything added
before real annotated cases exist.

Two things say so on the page, and both stay until real material replaces them: a
`.gatebar` notice at the top of the module, and a `.note` under the viewer explaining what
a segmentation overview is and why the questions do not ask about it. There is a matching
`TODO` on the `QUIZ` array in the script.

Quiz mechanics: pick an option, Check answer locks the question, the right answer goes green
and a wrong pick goes red, an explanation opens, the score updates. `.q.checked` is the
locked state. It is **not** `.done`: that class already belongs to the registration
confirmation panel, which sets `text-align:center` and its own padding, and reusing it
silently centred every answered question.

### 4.7 AI analysis (`#aianalysis`)

A stub, deliberately. The page exists, sits behind the gate, matches the site styling and
says in as many words that the module is not built. One paragraph covers what it will do:
run a model over a reference case and return a classification, a confidence estimate and a
suggested IHC follow-up panel, with the attention map open alongside it.

**No sample output, no confidence figure, no simulated result.** The page contains no
digits at all, and that is checked rather than assumed. A fabricated classification on a
pathology site is the single most harmful thing this draft could contain: it is the one
screen a reader would take at face value. An empty stub is the safer failure.

`.stub` and its parts are new. The three return values are listed as labels with
descriptions and no values, which describes the shape without simulating an answer.

---

## 5. Mock data model

One slide record (generated client‑side; mirrors the eventual API shape):

```js
{
  slideId:    "HVA-BR-0142",        // HVA-<2-letter site>-<4 digits>
  caseId:     "HVA-CASE-0118",
  primarySite:"Breast",
  diagnosis:  "Invasive ductal carcinoma, NST",
  icdo3:      "8500/3",
  grade:      "G2",
  stage:      "IIB",
  sex:        "Female",
  age:        47,
  ethnicity:  "South Asian",
  stain:      "H&E",
  scanner:    "Leica Aperio GT450",
  magnification: "40x",
  mpp:        0.263,
  dimensions: "94210 x 71680",
  fileSizeMb: 1840,
  lab:        LAB,                  // see §5a, currently a visible TODO
  qc:         "Passed",           // Passed | Review | Failed
  released:   "2026-05-14",
  heat:       true,               // attention heat-map published for this slide
  hasHeatmap: true
}
```

**Naming:** `HVA-` prefix (was `NPA-` before the rebrand), two-letter site code (BR breast, CX cervix, LU lung,
ST stomach, OC oral cavity, CR colorectum, LI liver, OV ovary, TH thyroid, LN lymph node),
zero‑padded serial. Keep this convention, it is what real IDs will look like.

Generate ~1,000 records with a seeded pseudo‑random function so the numbers are
stable between reloads.

---

## 5a. One laboratory

Every slide is scanned and reported at **one laboratory in Kathmandu**. The mock data model
carries this as a single constant, `LAB`, not a list.

**`LAB` is currently a visible TODO**, because the rebrand removed the previous laboratory
name and no replacement has been given:

```js
const LAB = "TODO: name the reporting laboratory";
```

It renders on every slide's Case tab and in the `laboratory` column of the exported CSV.
That is deliberate. Replace the string when the name is settled, and change nothing else.

**As of 2026-09-15 the About panel no longer explains this.** The TODO block that sat under
"Where the slides come from" was removed. The placeholder is still live in the two places
above, so it now reads as a defect rather than as a known gap. Either name the laboratory
or give the string a neutral value; do not leave it as "TODO: ..." on a demo.

Earlier drafts invented seven referring hospitals (Bir, BPKIHS, Manipal, B.P.
Koirala, TU Teaching, Nepal Cancer Hospital) and distributed the cohort across
them. **That was wrong and must not come back.** Naming institutions that did not
contribute slides is a false claim about provenance, and it is the kind of detail a
reader from Kathmandu would notice immediately.

What follows from it, all already done:

- No "Contributing centres" tile in the stat band, facet in the browse rail,
  filter in the analytics bar, or chart on the analytics page. The analytics slot
  where the centres chart used to sit now shows stains and special studies.
- The slide-detail Case tab shows a single **Laboratory** row.
- Copy says "scanned and reported at one laboratory", never "collected from hospitals
  across Nepal".
- The CSV manifest column is `laboratory`, not `centre`.

If the atlas does take slides from other institutions later, add them back as real
named contributors with their agreement, not as plausible-sounding filler.

---

## 5b. What the release contains, and what it does not

**The slide image is the deliverable.** The release is whole-slide images plus the
harmonised metadata table, and possibly an attention heat-map for some slides.

**Do not put these on the site.** Earlier drafts advertised derived files that are
not being provided, which would have promised researchers something the project
cannot deliver:

- patch coordinates (`.h5`)
- foundation-model feature vectors (`.pt`, UNI or otherwise)
- tissue segmentation masks as a downloadable product
- a per-slide Files tab listing any of the above

The slide-detail rail therefore has three tabs, Case, Diagnosis and Acquisition,
and no Files tab. The Acquisition tab ends with a note saying so in as many words.
If a future release does ship derived files, add them back deliberately, in one
place, and update this section rather than scattering claims across the copy.

---

## 6. Build conventions

- **Single file** `index.html` for now: inline `<style>` and `<script>`, no build step,
  no CDN dependencies (must work offline by double-clicking the file).
- **Nothing in the output may read as machine-written.** No generator comments or meta
  tags, no explanatory comments narrating what the obvious line below them does, no lorem,
  no generic gradient hero. A comment earns its place by recording a decision or a trap.
- Logos and slide images referenced by **relative path** (`elements/…`, `mock_slides/…`).
- No `fetch()`, no XHR: the page must run from `file://`. Anything data‑like is
  inlined into the script (see §3.6).
- Vanilla JS only. No React/Vue/Tailwind at this stage.
- Accessible defaults: real `<button>`/`<a>` elements, visible focus rings,
  `aria-label` on icon‑only controls, ≥4.5:1 text contrast.
- Responsive down to 360px. See §6c.
- Keep every fake number plausible and internally consistent: stats in the hero
  must match the generated cohort.

---

## 6c. Mobile

Breakpoints, in the order they cascade: **1240** (centred wordmark drops back into
the flex flow), **1100** (analytics cards go full width, slide layout stacks),
**900** (browse and form columns collapse), **760** (the phone pass), **460**
(single-column cards).

The 760px block is the one that matters. What it does, and why each piece is there:

- **No horizontal scroll anywhere.** This is the acceptance test: at 360, 390, 430
  and 768px, `scrollWidth` must equal `clientWidth` on every route. Do not reach for
  `body{overflow-x:hidden}` to pass it; that hides the bug rather than fixing it,
  and the offending element still eats taps.
- **The grid-track trap.** `.browse{grid-template-columns:1fr}` looks harmless but a
  `1fr` track resolves to its content's min-width, and the results table carries
  `min-width:1150px`. The page was 1176px wide on a phone because of that one line.
  Use `minmax(0,1fr)` for any track containing something wide.
- **Header** wraps to one flexible row and the nav strip scrolls horizontally instead of
  wrapping. The section index goes static and scrolls horizontally too.
- **Filter rail becomes a drawer.** Hidden by default behind a "Filters" button in
  the results bar, and every facet group starts collapsed, so the drawer opens
  short rather than as a two-screen wall of checkboxes.
- **Browse opens in grid mode** below 760px. A 13-column table is not a phone
  interface; the cards are.
- **Bar charts keep their width and scroll inside their card** (`.cw` wrapper plus
  `svg.viz.wide{min-width:540px}`). Squeezing a 680-unit viewBox into 350 makes the
  axis labels about 6px tall. The donut is exempt: it scales down fine.
- **The viewer uses pointer events**, not mouse events, so a finger pans the slide.
  `touch-action:pan-y` on the canvas keeps vertical page scrolling alive, and the
  drag only calls `preventDefault` once zoomed past 1x.
- **Form and search inputs are 16px** on mobile. Anything smaller makes iOS Safari
  zoom the page on focus, and it does not zoom back out.
- The related-slides block is its own grid child (`.relwrap`, spanning both
  columns) rather than living inside the viewer column, so that when the layout
  stacks the metadata rail comes before it instead of after.

---

## 6b. House style for copy

The site is read by pathologists and bioinformaticians. Write the way a research
group writes, not the way a landing page generator writes.

**Never use em dashes.** Use a full stop, a comma, a colon, or brackets. This
applies to prose, alert strings, headings and data placeholders alike. En dashes in
numeric ranges (`40–49`) are fine.

Also avoid, because they read as machine‑written:

- Punchy closing fragments that restate the paragraph: "Histoveya AI exists to fix that."
- Tricolon headings: "Open, cited, and permanent."
- Marketing compounds: "AI‑ready out of the box", "built for the population it
  represents", "seamless", "powerful", "revolutionary".
- "It's not just X, it's Y" and "X isn't merely Y" constructions.
- Empty superlatives about the dataset's importance. State the number instead.

Prefer: concrete figures, plain verbs, and sentences that would survive being read
aloud at a lab meeting. Use `n/a` for missing values, never a bare dash.

---

## 7. Roadmap / next steps

1. ~~Draft 1: landing + browse + slide detail~~ ← **done**, 2026‑08‑26
2. Analytics view: bar chart by primary site, age histogram, stage distribution,
   sunburst of diagnosis hierarchy
3. Data access page: DUA text, request form mock, `gdc-client`‑style CLI download stub
4. About / team / publications page
5. Real WSI viewer integration: **OpenSeadragon** with DZI tiles, or
   Digital Slide Archive / HistomicsUI if a Girder backend is chosen
6. Backend decision: static tile server + JSON index (cheap) vs. Girder/Django + Postgres
7. Attention heat-map overlay, if the team decides to publish it beyond the
   subset shown in the mock

---

## 8. Open questions for the team

- Official domain, and the contact address to print in the footer and the DUA
- Licence for the images: CC BY 4.0 vs. CC BY‑NC 4.0 vs. registered‑access DUA?
- Are slides fully de‑identified, and is a registration wall needed at all?
- Do the attention heat-maps ship with the public release, or stay internal?
- Ethics/IRB statement and consent language to display on every case page
- The name to print for the reporting laboratory (§5a), and the training-set splits and baselines (§4.1 item 7)

---

## 9. What draft 1 actually contains

`index.html`, ~1,170 lines, three working views behind a hash router:

- **`#home`**: utility bar, fixed header, hero with slideshow and search, 4 counting stat
  tiles, sticky section index, and sections 00 to 02 on one scroll
- **`#browse`**: 11 facets with live counts that re‑compute against the current
  filter set, free‑text search, sort, page size, table/grid toggle, removable
  filter chips, pagination, CSV manifest export
- **`#slide/<id>`**: mock viewer with drag‑pan, wheel and slider zoom (1–40×),
  magnification presets, live scale bar, navigator inset with viewport box,
  three overlays (attention heat‑map, segmentation, patch grid), four‑tab
  metadata rail, file list, related slides
- **`#analytics`**: filter row, 4 KPI tiles and 6 charts, all cross-filtered and
  click-through to the repository
- **`#training`**: demonstration image in a reused viewer shell, four generic stain-reading
  questions with explanations and a running score, and two notices saying the content is
  placeholder (§4.6)
- **`#aianalysis`**: stub. What the module will return, and nothing that looks like a
  result (§4.7)
- **`#access`**: the registration gate. Validated form, tier and DUA sidebar, a draft-only
  bypass button, and on submit a hand-off to whichever gated route the user was trying to
  reach
- **`#docs` / `#contact`**: deliberate "not built yet" placeholder view

The cohort is **1,107 synthetic slides across 857 cases**, generated from a fixed
seed so counts are stable between reloads. Diagnoses are skewed toward the first
entry per site (`Math.pow(R(), 1.9)`) so the facet counts look clinically
plausible rather than uniform.

Known rough edges, deliberately left for draft 2: the results table scrolls
horizontally below ~1500px, the "Cases"/"Files"/"Saved cohorts" tabs are inert, and
every download button is an `alert()`.

---

*Last updated: 2026-09-15 (fourth pass). Added two gated pages, Pathology Training (§4.6)
and AI Analysis (§4.7), and two nav entries for them. The existing "Analysis" nav entry was
renamed "Cohort Analytics" to match its own page heading and to free the word for the new
page; its route `#analytics` is unchanged. The 00/01/02 landing strip was not touched.*

*Third pass, same day. Added a light/dark theme: semantic token layer on
`:root`, a dark override block, an icon toggle in the header, and a pre-paint script so a
reload does not flash. Slide imagery and the logo are untouched in both themes. See §3.1b.*

*Known contrast misses, all pre-existing in the light theme and all better in dark, left
alone rather than restyled without being asked: `--ink-400` body-meta text is 3.61:1 on
white (hints, stat-tile labels, table headers), the section-index numbers are 3.72:1, and
the light form-field border is 1.33:1 against the card. The dark equivalents are 6.06, 4.45
and 3.43.*

*Second pass on the rebrand: new hero copy, the header fixed at
one size with the scroll resize removed, a lighter wordmark, the Training set and Analysis
landing sections deleted and the rest renumbered 00 to 02, About rewritten around the
representation gap with four fixed stat callouts and a "Contribute a case" block, a
draft-only bypass on the gate, and the hosting credit dropped from the footer.*

*Previously, 2026-09-10: rebranded to Histoveya AI. CMDN and Intrepid removed throughout,
copper accent in place of the red, landing page rebuilt as one scroll with numbered
sections, and a registration gate in front of browse, slide and analytics.*

*Open and marked TODO in the page itself: the contribution contact address.*

*The reporting-laboratory TODO was removed from the About panel on 2026-09-15, but `LAB`
itself is unchanged (§5a). The placeholder string still renders on every slide's Case tab
and in the `laboratory` column of the CSV export. The note that explained it is gone, so
that string now looks like a bug rather than a deliberate hole. Name the laboratory, or
change the string, before this is shown to anyone.*
