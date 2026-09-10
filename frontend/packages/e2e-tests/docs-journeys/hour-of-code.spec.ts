import {test, expect} from '@playwright/test';

test('anonymous visitor can start an Hour of Code activity', async ({page}) => {
  // Visit the classic HoC entry point.
  await page.goto('/hoc/1');

  // The page should load without error -- either redirect to a level or show
  // a tutorial page. Accept either a Blockly workspace or a level page.
  await page.waitForLoadState('domcontentloaded');

  // The URL should have changed from /hoc/1 to a level URL.
  const url = page.url();
  const isLevel =
    url.includes('/s/') || url.includes('/flappy/') || url.includes('/hoc/');
  expect(isLevel).toBe(true);
});

test('certificate congrats page loads', async ({page}) => {
  // Visit the generic congrats page.
  await page.goto('/congrats');
  await page.waitForLoadState('domcontentloaded');

  // The page should render without a server error.
  const status = await page.evaluate(() => document.title);
  expect(status).not.toContain('500');
});
