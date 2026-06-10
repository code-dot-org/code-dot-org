import {expect, test} from '@playwright/test';

/**
 * TEMPORARY — remove after verifying on Drone. An intentional failure to confirm
 * the Drone ui pipeline launches the baked browsers, streams the failure to the
 * build log, uploads the report, and stays green (the suite is non-blocking).
 */
test('drone-check: intentional failure (remove me)', async ({page}) => {
  await page.goto('/');
  expect(1, 'intentional failure to exercise the Drone Playwright path').toBe(2);
});
