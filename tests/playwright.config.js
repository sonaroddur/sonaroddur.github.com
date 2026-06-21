const { defineConfig, devices } = require('@playwright/test');

// Samsung phones dominate Bangladesh's market — mostly budget Galaxy A / M
// devices at narrow CSS widths. These are standard, well-known Android viewport
// sizes (not pulled from any external source); the 320px profile is a deliberate
// narrow-floor stress test (very old / ultra-budget devices, and the effective
// width once a reader zooms or uses a large system font).
//
// NOTE: emulating a Samsung viewport + UA in headless Chromium reproduces LAYOUT,
// overflow, tap-target and zoom behaviour — it does NOT run Samsung Internet's
// engine, so true Bengali font-shaping / forced dark mode still need a real device.
const SAMSUNG_INTERNET_UA =
  'Mozilla/5.0 (Linux; Android 14; SM-A146P) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36';

const samsungProfiles = [
  { name: 'galaxy-a 360x800', width: 360, height: 800, dpr: 3, ua: SAMSUNG_INTERNET_UA }, // A12/A14/A23/S21 — BD mainstream
  { name: 'galaxy-s8 360x740', width: 360, height: 740, dpr: 4 }, // older flagship class
  { name: 'galaxy-a-large 412x915', width: 412, height: 915, dpr: 2.625 }, // A51/A71 / M-series
  { name: 'narrow-floor 320x640', width: 320, height: 640, dpr: 2 }, // narrow-floor stress test
];

const samsungProjects = samsungProfiles.map((p) => ({
  name: `samsung:${p.name}`,
  testMatch: /mobile-bd\.spec\.js/,
  use: {
    browserName: 'chromium',
    viewport: { width: p.width, height: p.height },
    deviceScaleFactor: p.dpr,
    isMobile: true,
    hasTouch: true,
    ...(p.ua ? { userAgent: p.ua } : {}),
  },
}));

// Serves the repo root (one level up) over a throwaway local server. The general
// suite (site.spec.js) runs on desktop + a generic mobile; the Samsung suite
// (mobile-bd.spec.js) runs only on the Samsung viewport projects above.
module.exports = defineConfig({
  testDir: '.',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8799' },
  projects: [
    { name: 'desktop', testIgnore: /mobile-bd\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', testIgnore: /mobile-bd\.spec\.js/, use: { ...devices['Pixel 5'] } },
    ...samsungProjects,
  ],
  webServer: {
    command: 'python3 -m http.server 8799 --bind 127.0.0.1 --directory ..',
    url: 'http://127.0.0.1:8799/index.html',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
