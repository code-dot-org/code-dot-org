import {expect, test, type Page} from '@playwright/test';

// Field widths are a layout concern (jsdom has none), so they're asserted in a
// real browser: inputs and dropdowns share one width, capped on desktop.

const controlWidth = (page: Page, selector: string) =>
  page
    .locator(selector)
    .evaluate(el => Math.round(el.getBoundingClientRect().width));

test('inputs and dropdowns share one width, capped on desktop', async ({
  page,
}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/?scenario=student'); // has both text inputs and dropdowns
  await page.getByRole('heading', {level: 1, name: 'My Account'}).waitFor();

  const input = await controlWidth(page, 'input[name="given_name"]');
  const dropdown = await controlWidth(page, 'select[name="age"]');

  // Consistent: a text input and a dropdown render at the same width.
  expect(input).toBe(dropdown);
  // Capped on desktop — not stretched to the full content column.
  expect(input).toBeLessThanOrEqual(500);
});

test('fields fill the column on mobile', async ({page}) => {
  await page.setViewportSize({width: 375, height: 800});
  await page.goto('/?scenario=teacher');
  await page.getByRole('heading', {level: 1, name: 'My Account'}).waitFor();

  const input = await controlWidth(page, 'input[name="given_name"]');
  // Fills the narrow viewport (375 minus the page's side padding), no cap hit.
  expect(input).toBeGreaterThan(300);
});
