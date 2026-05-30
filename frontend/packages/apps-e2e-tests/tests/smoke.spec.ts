import {expect, test} from '@playwright/test';

/**
 * Smoke test for the apps-e2e-tests harness. Confirms Playwright can reach
 * test-studio.code.org (baseURL), launch a browser, navigate, and assert.
 * Not a product test — it proves the foundation works end to end.
 */
test('test-studio responds and renders a titled page', async ({page}) => {
  const response = await page.goto('/');
  expect(
    response?.ok(),
    'navigation to baseURL should return 2xx',
  ).toBeTruthy();
  await expect(page).toHaveTitle(/code\.org|code studio/i);
});
