const { test, expect } = require('@playwright/test');

test.describe('Home — rings + archive', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('loads with the right title and the rings render', async ({ page }) => {
    await expect(page).toHaveTitle(/সোনা রোদ্দুর/);
    await expect(page.locator('#ringGroup .ring')).toHaveCount(16);
    await expect(page.locator('#nodeGroup .node-link')).toHaveCount(3);
  });

  test('ring nodes are bilingually labelled and link to real pages', async ({ page }) => {
    const first = page.locator('.node-link').first();
    await expect(first).toHaveAttribute('aria-label', /·/); // "বাংলা · English"
    await expect(first).toHaveAttribute('href', /\/(poems|stories)\//);
  });

  test('language toggle swaps বাংলা / English with no leak', async ({ page }) => {
    await expect(page.locator('.ring-concept.lang-en')).toBeVisible();
    await expect(page.locator('.ring-concept.lang-bn')).toBeHidden();
    await page.locator('button[data-set-lang="bn"]').click();
    await expect(page.locator('.ring-concept.lang-bn')).toBeVisible();
    await expect(page.locator('.ring-concept.lang-en')).toBeHidden();
  });

  test('type filter narrows the archive and updates the count', async ({ page }) => {
    await expect(page.locator('.entry:visible')).toHaveCount(3);
    await page.locator('.filter[data-filter="poetry"]').click();
    await expect(page.locator('.entry[data-type="story"]')).toBeHidden();
    await expect(page.locator('.entry:visible')).toHaveCount(2);
    await expect(page.locator('.filter-count')).toContainText('2');
    await page.locator('.filter[data-filter="story"]').click();
    await expect(page.locator('.entry:visible')).toHaveCount(1);
    await page.locator('.filter[data-filter="all"]').click();
    await expect(page.locator('.entry:visible')).toHaveCount(3);
  });

  test('search filters the archive instantly', async ({ page }) => {
    await page.locator('.archive-search input').fill('window');
    await expect(page.locator('.entry:visible')).toHaveCount(1);
    await expect(page.locator('.entry[data-type="story"]')).toBeVisible();
    await page.locator('.archive-search input').fill('');
    await expect(page.locator('.entry:visible')).toHaveCount(3);
  });

  test('every archive / ring / featured link resolves (no 404)', async ({ page, request }) => {
    const hrefs = await page.locator('.entry, .node-link, .fp-cta').evaluateAll(
      els => els.map(e => e.getAttribute('href')).filter(h => h && !h.startsWith('#'))
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of new Set(hrefs)) {
      const res = await request.get(href);
      expect(res.status(), `${href} should be 200`).toBe(200);
    }
  });
});

test.describe('Reading pages', () => {
  test('a poem page loads with its own share image', async ({ page }) => {
    await page.goto('/poems/o-sona-byang.html');
    await expect(page.locator('h1.read-title')).toHaveText('ও সোনা ব্যাঙ');
    await expect(page.locator('meta[property="og:image"]'))
      .toHaveAttribute('content', /assets\/img\/portrait\.jpg/);
  });

  test('the share image is served as a real image', async ({ request }) => {
    const res = await request.get('/assets/img/portrait.jpg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/jpeg');
  });
});

test.describe('Responsive', () => {
  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
