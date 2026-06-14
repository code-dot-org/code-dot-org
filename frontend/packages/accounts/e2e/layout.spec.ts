import {expect, test, type Page} from '@playwright/test';

// Field widths are a layout concern jsdom can't compute, so assert them here.

const controlWidth = (page: Page, selector: string) =>
  page
    .locator(selector)
    .evaluate(el => Math.round(el.getBoundingClientRect().width));

test('inputs and dropdowns share one width, capped on desktop', async ({
  page,
}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/?scenario=student');
  await page.getByRole('heading', {level: 1, name: 'My Account'}).waitFor();

  const input = await controlWidth(page, 'input[name="given_name"]');
  const dropdown = await controlWidth(page, 'select[name="age"]');

  expect(input).toBe(dropdown);
  // Capped on desktop, not stretched to the full content column.
  expect(input).toBeLessThanOrEqual(500);
});

test('fields fill the column on mobile', async ({page}) => {
  await page.setViewportSize({width: 375, height: 800});
  await page.goto('/?scenario=teacher');
  await page.getByRole('heading', {level: 1, name: 'My Account'}).waitFor();

  const input = await controlWidth(page, 'input[name="given_name"]');
  // Fills the 375px viewport (minus side padding); the cap isn't hit.
  expect(input).toBeGreaterThan(300);
});
