import {expect, test} from '@playwright/test';

const targetHost = new URL(
  process.env.TARGET_URL ?? 'https://test-studio.code.org',
).hostname;

/**
 * Smoke test for the e2e-tests harness. Confirms Playwright can reach the
 * configured target host, launch a browser, navigate, and assert.
 * Not a product test — it proves the foundation works end to end.
 */
test('test-studio responds and renders a titled page', async ({page}) => {
  const response = await page.goto('/');
  expect(
    response?.ok(),
    'navigation to baseURL should return 2xx',
  ).toBeTruthy();
  expect(
    response?.url(),
    'response should come from the configured host',
  ).toContain(targetHost);
  await expect(page).toHaveTitle(/code\.org|code studio|codeai/i);
});
