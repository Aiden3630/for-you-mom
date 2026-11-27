import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: 'output/playwright/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'edge', use: { browserName: 'chromium', channel: 'msedge' } },
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
    {
      name: 'android',
      testMatch: 'personal-media.spec.ts',
      use: { ...devices['Pixel 7'], browserName: 'chromium' },
    },
    {
      name: 'iphone',
      testMatch: 'personal-media.spec.ts',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
})
