// =============================================================================
// Mobile suite — Samsung phones common in Bangladesh.
//
// Bangladesh's mobile market is dominated by budget Samsung Galaxy A / M phones
// at narrow CSS widths, often on slow connections and the Samsung Internet
// browser. This suite runs the device-agnostic checks below across the Samsung
// viewport PROJECTS defined in playwright.config.js.
//
// HONEST SCOPE: emulating a Samsung viewport + UA in headless Chromium reliably
// catches layout / overflow / tap-target / zoom / clipping issues. It does NOT
// run Samsung Internet's engine, so true Bengali glyph-shaping (tofu vs. real
// conjuncts) and forced dark mode still need a real device / BrowserStack. Tests
// that can't be honestly asserted headlessly are marked as such, not faked.
// =============================================================================
const { test, expect } = require('@playwright/test');

const PAGES = {
  home: '/',
  poem: '/poems/o-sona-byang.html',
  story: '/stories/the-open-window.html',
};

// Wait for web fonts (or their failure) to settle and force scroll-reveal so the
// layout is final before we measure anything.
async function settle(page) {
  await page.evaluate(async () => {
    try { await document.fonts.ready; } catch (e) { /* fonts may be blocked */ }
    document.querySelectorAll('.reveal-up').forEach((el) => el.classList.add('visible'));
  });
}

const overflowPx = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// --- 1. No sideways scroll on any page (the #1 mobile break) --------------------
for (const [name, path] of Object.entries(PAGES)) {
  test(`no horizontal overflow — ${name}`, async ({ page }) => {
    await page.goto(path);
    await settle(page);
    // allow <=1px for sub-pixel / devicePixelRatio rounding
    expect(await overflowPx(page), `${name} scrolls sideways`).toBeLessThanOrEqual(1);
  });
}

// --- 2. Pinch-zoom must stay enabled (older readers enlarge small Bengali type) --
test('viewport meta allows pinch-zoom', async ({ page }) => {
  await page.goto(PAGES.home);
  const content = (await page.locator('meta[name="viewport"]').getAttribute('content')) || '';
  const normalized = content.replace(/\s/g, '');
  expect(content, 'viewport meta missing').toBeTruthy();
  expect(normalized).not.toContain('user-scalable=no');
  expect(normalized).not.toMatch(/maximum-scale=1(\.0)?(,|$)/);
});

// --- 3. The language toggle actually works via touch, with no language leak ------
test('Bengali toggle works via tap with no language leak', async ({ page }) => {
  await page.goto(PAGES.home);
  await settle(page);
  await expect(page.locator('.ring-concept.lang-en')).toBeVisible();
  await page.locator('button[data-set-lang="bn"]').tap();
  await expect(page.locator('.ring-concept.lang-bn')).toBeVisible();
  await expect(page.locator('.ring-concept.lang-en')).toBeHidden();
  expect(await page.getAttribute('html', 'data-lang')).toBe('bn');
});

// --- 4. Bengali text is wired to the Bengali font stack -------------------------
test('Bengali text uses the Bengali font stack and occupies space', async ({ page }) => {
  await page.goto(PAGES.home);
  await page.locator('button[data-set-lang="bn"]').tap();
  await settle(page);
  const title = page.locator('.ring-title'); // "সোনা রোদ্দুর" — always Bengali
  await expect(title).toBeVisible();
  const fontFamily = await title.evaluate((n) => getComputedStyle(n).fontFamily);
  expect(fontFamily, 'Bengali title not wired to --font-bn').toMatch(/Noto Serif Bengali/i);
  const box = await title.boundingBox();
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
});

// --- 5. Primary controls meet the 44px tap-target minimum ----------------------
test('primary touch controls are at least 44px', async ({ page }) => {
  await page.goto(PAGES.home);
  await settle(page);
  const targets = [
    ['button[data-set-lang="en"]', 'EN toggle'],
    ['button[data-set-lang="bn"]', 'বাংলা toggle'],
    ['.filter[data-filter="all"]', 'All filter'],
    ['.filter[data-filter="poetry"]', 'Poetry filter'],
    ['.archive-search input', 'Search box'],
    ['.entry', 'Archive entry'],
  ];
  const tooSmall = [];
  for (const [sel, label] of targets) {
    const box = await page.locator(sel).first().boundingBox();
    if (!box) continue; // hidden at this width (e.g. nav links) — skip
    if (box.width < 44 || box.height < 44) {
      tooSmall.push(`${label} ${Math.round(box.width)}×${Math.round(box.height)}`);
    }
  }
  expect(tooSmall, `below 44px → ${tooSmall.join('; ')}`).toEqual([]);
});

// --- 6. THE KEY ONE: Bengali survives a font-load failure (slow/blocked CDN) -----
// On a poor Bangladeshi connection the Google Fonts request can fail. The page
// must not blank or break its layout when that happens.
test('layout survives if the web fonts fail to load', async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.goto(PAGES.home);
  await page.locator('button[data-set-lang="bn"]').tap();
  await settle(page);

  const title = page.locator('.ring-title');
  await expect(title).toBeVisible();
  const box = await title.boundingBox();
  expect(box.width, 'Bengali title collapsed with fonts blocked').toBeGreaterThan(0);

  // A real fallback chain must exist so the browser has something to fall back to.
  const fontFamily = await title.evaluate((n) => getComputedStyle(n).fontFamily);
  expect(fontFamily.split(',').length, 'no font fallback chain').toBeGreaterThan(1);

  // Fallback font metrics must not introduce sideways scroll.
  expect(await overflowPx(page), 'fallback fonts cause overflow').toBeLessThanOrEqual(1);

  // NOTE: whether the fallback actually SHAPES Bengali conjuncts (vs. tofu boxes)
  // cannot be asserted in headless Chromium — verify on a real device / Samsung
  // Internet. This test guards the layout, not the glyphs.
});

// --- 7. Hero rings and portrait stay inside the viewport -----------------------
test('hero rings and portrait stay within the viewport', async ({ page }) => {
  await page.goto(PAGES.home);
  await settle(page);
  const vw = page.viewportSize().width;
  for (const sel of ['.rings-stage', '.portrait']) {
    const box = await page.locator(sel).boundingBox();
    expect(box, `${sel} missing`).toBeTruthy();
    expect(box.x, `${sel} starts off the left edge`).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, `${sel} extends past the right edge`).toBeLessThanOrEqual(vw + 1);
  }
});

// --- 8. No unexpected console errors (favicon 404 is known + harmless) ----------
test('no unexpected console errors on the home page', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(PAGES.home);
  await settle(page);
  const meaningful = errors.filter((t) => !/favicon\.ico/.test(t));
  expect(meaningful, meaningful.join('\n')).toEqual([]);
});
