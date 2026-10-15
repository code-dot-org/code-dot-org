import {expect, test, type Locator, type Page} from '@playwright/test';

// Field widths are a layout concern jsdom can't compute, so assert them here.
// boundingBox auto-waits for the element, unlike a raw evaluate on a CSS match.
async function controlWidth(control: Locator): Promise<number> {
  const box = await control.boundingBox();
  if (!box) throw new Error('control has no bounding box');
  return Math.round(box.width);
}

async function gotoLoaded(page: Page, scenario: string): Promise<void> {
  await page.goto(`/?scenario=${scenario}`);
  await page.getByRole('heading', {level: 1, name: 'My Account'}).waitFor();
}

test('inputs and dropdowns share one width, capped on desktop', async ({
  page,
}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await gotoLoaded(page, 'student');

  // Display name and Age share the Field wrapper; given_name is teacher-only.
  const input = await controlWidth(
    page.getByRole('textbox', {name: 'Display name'}),
  );
  const dropdown = await controlWidth(
    page.getByRole('combobox', {name: 'Age'}),
  );

  expect(input).toBe(dropdown);
  // Capped on desktop, not stretched to the full content column.
  expect(input).toBeLessThanOrEqual(500);
});

test('fields fill the column on mobile', async ({page}) => {
  await page.setViewportSize({width: 375, height: 800});
  await gotoLoaded(page, 'teacher');

  const input = await controlWidth(
    page.getByRole('textbox', {name: 'First name'}),
  );
  // Fills the 375px viewport (minus side padding); the cap isn't hit.
  expect(input).toBeGreaterThan(300);
});

test('the delete-account modal does not overflow horizontally', async ({
  page,
}) => {
  await gotoLoaded(page, 'teacher');
  await page.getByRole('button', {name: /delete my account/i}).click();
  await expect(page.getByRole('alertdialog', {name: /delete/i})).toBeVisible();

  // Anchored on the scroll container, not the dialog: measured, the paper reports
  // 0 overflow while the content region reports the full 1604px, so a role-scoped
  // locator here would assert nothing. The acknowledge checkbox row is what
  // overflows — a full-width control with a non-zero horizontal margin.
  const overflow = await page
    .locator('.MuiDialogContent-root')
    .evaluate(el => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('long names and addresses do not scroll the page sideways (long-strings)', async ({
  page,
}) => {
  await gotoLoaded(page, 'long-strings');

  for (const width of [1280, 320]) {
    await page.setViewportSize({width, height: 900});
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(
      1,
    );
  }
});
