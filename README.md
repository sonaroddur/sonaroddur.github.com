# সোনা রোদ্দুর · Sona Roddur

The poetry and short stories of **Dr. Quazi Nazrul Islam** — forest scientist and poet.
A bilingual (বাংলা / English) literary site. Live at **https://sonaroddur.github.io/**.

## What it is

A static site with **no build step**. The home page presents his writing as glowing tree
**growth-rings of light** — each lit ring is a piece — above a **searchable, filterable**
archive. Every poem and story has its own page and its own shareable link preview.

## Structure

```
index.html            Home — rings hero + searchable archive
poems/  stories/      One reading page per piece
assets/css/site.css   Styles (design tokens + components)
assets/js/site.js     Behaviour (language, search, filter, rings)
assets/img/           portrait.jpg (share image) + original portrait
tests/                Playwright end-to-end tests
```

## Run locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Add a poem or story

See **`CLAUDE.md` → How to add the poet's work**: copy a reading page, add an archive row, and
optionally feature it on the rings.

## Test

```sh
cd tests && npm install && npx playwright test
```

## Contributing

`main` is the live site (GitHub Pages). **Never commit to `main` directly** — branch, get the
owner's review, then open a PR. Details in `CLAUDE.md`.
