import {test, expect} from '@playwright/test';

test('signed-out visitor can browse the curriculum catalog', async ({page}) => {
  await page.goto('/catalog');

  // The page heading is visible.
  await expect(
    page.getByRole('heading', {name: 'Curriculum Catalog', level: 1}),
  ).toBeVisible();

  // Filter controls are present.
  await expect(
    page.getByRole('heading', {name: 'Filter by:', level: 6}),
  ).toBeVisible();

  // At least one course card heading is visible.
  await expect(page.getByRole('heading', {level: 4}).first()).toBeVisible();
});
