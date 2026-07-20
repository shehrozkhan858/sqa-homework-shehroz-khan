// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Suite targets the LIVE pre-login app at ask.permission.ai.
 * Single Chromium project keeps the count honest: 8 test cases, not 8 x N browsers.
 * The mobile test emulates iPhone 13 inline (test.use) instead of a second project.
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // AI streaming is slow + occasionally flaky at the network layer, not the assertion
  // layer. One retry (CI only) absorbs cold-start/latency blips without hiding real
  // failures locally.
  retries: process.env.CI ? 1 : 0,
  // Deliberately low: this suite hits a shared LIVE AI backend. Fanning out 8+
  // browsers overloads it and produces false failures. 2 keeps runs stable.
  workers: 2,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/report', open: 'never' }],
  ],
  use: {
    baseURL: 'https://ask.permission.ai',
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
