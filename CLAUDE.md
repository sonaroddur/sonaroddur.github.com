# CLAUDE.md

## Project: সোনা রোদ্দুর · Sona Roddur

A **bilingual (বাংলা / English)** literary portal for the poetry and short stories of
**Dr. Quazi Nazru Islam** (the repo owner's father) — a forest scientist (Bangladesh
Forest Research Institute) and poet. A personal/literary site, not an application.

The signature idea: a forest scientist reads a life in a tree's rings, so his writing is
presented as glowing **growth-rings of light** — each lit ring is a piece, the body of work
growing ring by ring. Golden light (poems) in the forest dark (stories).

## Architecture — static, multi-page, no build

Plain static HTML/CSS/JS: **no framework, no bundler, no build step.** The only external
request is Google Fonts. Served as-is by GitHub Pages.

```
index.html               home: the "Rings of Light" hero + searchable, filterable archive
poems/<slug>.html        one reading page per poem
stories/<slug>.html      one reading page per story
assets/css/site.css      all styles (design tokens + components)
assets/js/site.js        all behaviour (language, search, filter, rings, scroll-reveal)
assets/img/portrait.jpg  optimised baseline JPEG — the social-share / bio image
assets/img/dr-qnislam.jpg  original full-res portrait (archived source)
tests/                   Playwright end-to-end tests
README.md  CLAUDE.md  .gitignore
```

All asset paths and links are **root-absolute** (`/assets/…`, `/poems/…`, `/`) so they work
from any page and map 1:1 to the GitHub Pages site root.

## How the home page works

- **Rings hero** — `site.js` reads the `<script type="application/json" id="pieces">` block in
  `index.html` and draws the SVG rings + one clickable node per featured piece.
- **Archive** — a list of `.entry` links (one per piece, `data-type="poetry|story"`). `site.js`
  powers **search** (`.archive-search input`, matches title/first-line text) and the **type
  filter** (`.filter` chips) together, with a live count (`.filter-count`).

## How to add the poet's work

1. **Reading page** — copy an existing `poems/*.html` (or `stories/*.html`); update the title,
   the per-piece `<meta og:*>` (title/description/url so single-piece sharing works), the
   verse/prose, and the date. Keep both languages for chrome text.
2. **Archive row** — copy an existing `.entry` in `index.html`; set `data-type`, title,
   romanization, first line, type, and date (Bengali numerals in the `.lang-bn` date).
3. **(Optional) feature it on the rings** — add an item to the `#pieces` JSON
   (`t_bn`, `t_en`, `href`, `ring`, `angle`, `type`).
4. Run the tests, then open a PR.

## Bilingual system (বাংলা / English)

- `<html data-lang="en">` is the active language; the header toggle flips it to `bn`.
- Wrap language-specific text in `class="lang-en"` / `class="lang-bn"`; CSS force-hides the
  inactive one (`[data-lang="en"] .lang-bn{ display:none !important }`). **Always provide both.**
- Bengali text also gets `class="bengali"` (font) and `lang="bn"`.

## Design language (keep the metaphor)

- Poems = golden light on warm paper; stories = cool forest green (`body.read-page.forest`).
- Tokens are CSS variables in `:root` of `site.css` (`--paper`, `--gold`, `--forest`;
  `--font-display` Fraunces, `--font-body` Spectral, `--font-bn` Noto Serif Bengali). Reuse them.
- Accessibility is a requirement: `aria-*`, `aria-pressed` on toggle/filter, ≥44px tap targets,
  bilingual `aria-label`s, and the `prefers-reduced-motion` guard. Reveal-on-scroll uses
  IntersectionObserver.

## Scaling (as the collection grows)

- **Highlights stay curated** (a few `#pieces` on the rings); the **archive is the workhorse**.
- The rings are meant to map to **years**, not individual pieces (bounded by a lifetime); busy
  years glow brighter. The **archive is the authoritative way to reach a single piece** — search
  + filter now, plus group-by-year + pagination when the list grows long.

## Social-share image

`assets/img/portrait.jpg` is a **baseline** (not progressive) ~1200px JPEG — WhatsApp can fail
to render progressive JPEGs. Every page's `og:image` points at it. Regenerate from the original:
`magick assets/img/dr-qnislam.jpg -auto-orient -resize 1200x1200 -strip -interlace none -sampling-factor 4:2:0 -quality 86 assets/img/portrait.jpg`

## Tests

Playwright end-to-end tests in `tests/` cover the language toggle, search, type filter + count,
rings rendering, no-404 links, per-page OG tags, and mobile (no horizontal overflow):
`cd tests && npm install && npx playwright test`

## Hosting / deploy

GitHub Pages serves the repo root at **https://sonaroddur.github.io/** (the legacy
`*.github.com` user-site name resolves to the `.github.io` root). Source = `main`, root path;
updating `main` redeploys in ~1 minute.

## Contributing — git workflow (IMPORTANT)

`main` is the **live** branch. **Never commit or push directly to `main`.** Every change:
1. Work on a feature branch.
2. **Get the owner's (nashid) review and approval BEFORE opening a PR.**
3. Then open a PR into `main`; merging it deploys. A local `pre-push` hook also blocks direct
   pushes to `main` (override only in emergencies with `git push --no-verify`).

Don't commit `.DS_Store`, `tests/node_modules/`, or local screenshots (all gitignored).
