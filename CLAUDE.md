# CLAUDE.md

## Project: সোনা রোদ্দুর · Sona Roddur

A single-page, static, **bilingual (বাংলা / English)** web portal presenting the
poetry and short stories of **Dr. Quazi Nazru Islam** (the repo owner's father) —
a forest scientist (Bangladesh Forest Research Institute) and poet. This is a
personal/literary site, not an application.

## The whole site is one file

- `index.html` **is** the entire website — self-contained, with **no build step,
  no dependencies, and no framework**. All CSS is in one `<style>` block; all JS
  is one inline `<script>` at the bottom. To work on it: edit the file and open
  it in a browser.
- The only external requests are Google Fonts (Fraunces, Spectral, Noto Serif
  Bengali). Everything else — including the portrait, embedded as a base64
  `data:` URI — is inline so the page never has a broken link.
- Two image files exist **only** for social-share link previews (Open Graph
  crawlers cannot read the inline base64 portrait):
  - `images/dr-qnislam.jpg` — the original full-resolution portrait (archived source).
  - `portrait.jpg` — a derived, optimized **baseline** JPEG (~1200px) that the
    `og:image` / `twitter:image` tags point to. It is baseline (not progressive)
    on purpose: WhatsApp's preview generator can fail to render progressive JPEGs.
  - To regenerate after changing the portrait:
    `magick images/dr-qnislam.jpg -auto-orient -resize 1200x1200 -strip -interlace none -sampling-factor 4:2:0 -quality 86 portrait.jpg`
    then update the `og:image:width`/`height` tags to the new dimensions.

## Hosting / deploy

- Hosted on **GitHub Pages**. The repo is named `sonaroddur.github.com` (the
  legacy GitHub user-site convention); GitHub serves it at the clean root URL
  **https://sonaroddur.github.io/**.
- Pages source = **`main` branch, root path**. Updating `main` (via a merged PR)
  auto-rebuilds and redeploys (~1 minute). Only `main` is published — feature
  branches never affect the live site.
- After a deploy, hard-refresh to bypass the browser/CDN cache.

## Contributing — git workflow (IMPORTANT)

`main` is the **live** branch: GitHub Pages publishes it automatically (see
*Hosting / deploy* above). To protect the live site, **every** change — content
or code, however small — follows this flow:

1. **Never commit or push directly to `main`.** No exceptions, not even a
   one-line fix or a typo.
2. **Work on a feature branch** (e.g. `add-poem-<slug>`, `fix/...`, `docs/...`).
3. **Get the owner's review and approval BEFORE opening a PR.** Prepare the
   change on the branch, show the diff and a short summary, and wait for an
   explicit go-ahead. Do **not** run `gh pr create` until then.
4. **Then open a Pull Request into `main`.** Merging the PR is what deploys to
   the live site.

Two gates stand before anything goes live: the owner reviews the change *before*
the PR is opened, and the PR merge is the final gate.

## How to add the poet's work

Edit `index.html` and find these comment markers — each sits next to a working
example that shows the exact pattern to copy:

- `[ADD A POEM]` — Poetry section (`#poetry`). Bengali poem: keep
  `class="bengali"` + `lang="bn"` on the title and verse. English poem: drop
  them. Separate lines with `<br>`.
- `[ADD A STORY]` — Short Stories section (`#stories`). A short teaser, then the
  full text inside `.story-body`; **keep the `hidden` attribute** (the Read/Close
  button toggles it).
- `[OPENING LINE]` — the large epigraph verse near the top.
- `[THE POET]` — portrait + biography.
- Dates in `.piece-meta` use Bengali numerals (e.g. ১৯ জুন ২০২৬).

## Bilingual system (বাংলা / English)

- `<html data-lang="en">` holds the active language; the header toggle flips it
  to `bn`.
- Mark language-specific content with `class="lang-en"` / `class="lang-bn"`. CSS
  shows the one matching `data-lang` and hides the other. **Always provide both**
  for any new user-facing text.
- Bengali text also needs `class="bengali"` (the Bengali font) and `lang="bn"`.

## Design language (keep the metaphor intact)

- Two worlds meet on the page: **poems sit in golden light on warm paper;
  stories sit in cool forest green.** Forest sections use `class="section forest"`.
- The palette and fonts are CSS variables in `:root` (`--paper`, `--gold`,
  `--forest`; `--font-display` = Fraunces, `--font-body` = Spectral, `--font-bn`
  = Noto Serif Bengali). Reuse them rather than hardcoding values.
- Preserve accessibility: keep the `aria-*` labels, the `prefers-reduced-motion`
  guard, and `lang` attributes. Reveal-on-scroll uses an IntersectionObserver.

## Conventions

- Keep it a **single self-contained `index.html`** — no external JS/CSS deps
  beyond Google Fonts, no framework, no bundler.
- Changes reach the live site only through a reviewed PR into `main` (see
  *Contributing — git workflow*) — never commit to `main` directly. Do **not**
  commit `.DS_Store` (gitignored).
- The social-share meta tags (Open Graph / Twitter) live in `<head>`; their
  absolute URLs must stay `https://sonaroddur.github.io/...`.
