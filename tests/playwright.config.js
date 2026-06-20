const { defineConfig, devices } = require('@playwright/test');

// Serves the repo root (one level up) over a throwaway local server and runs
// the suite on both a desktop and a mobile viewport.
module.exports = defineConfig({
  testDir: '.',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8799' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'python3 -m http.server 8799 --bind 127.0.0.1 --directory ..',
    url: 'http://127.0.0.1:8799/index.html',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
