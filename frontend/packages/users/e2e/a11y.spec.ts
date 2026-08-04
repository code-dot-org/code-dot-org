import {AxeBuilder} from '@axe-core/playwright';
import {expect, test, type Locator, type Page} from '@playwright/test';

// Real-browser axe scans, where (unlike the jsdom pass) color-contrast is
// computed.
const SCENARIOS = [
  'teacher',
  'student',
  'sso-teacher',
  'sso-student',
  'minimal',
] as const;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const analyze = (page: Page) =>
  new AxeBuilder({page}).withTags(WCAG_TAGS).analyze();

// MUI fades in the dialog's wrapper, not the paper, so a scan mid-flight
// composites it against the darkened backdrop and reports contrast failures that
// do not exist once it settles (measured: 3.27:1 mid-transition, none after).
// prefers-reduced-motion does not disable the transition, so wait it out.
const expectDialogSettled = (dialog: Locator) =>
  expect(dialog.locator('xpath=..')).toHaveCSS('opacity', '1');

for (const scenario of SCENARIOS) {
  test(`no axe violations on the loaded page (${scenario})`, async ({page}) => {
    await page.goto(`/?scenario=${scenario}`);
    await page.getByRole('heading', {level: 1, name: 'My Account'}).waitFor();

    const {violations} = await analyze(page);
    expect(violations).toEqual([]);
  });
}

test('no axe violations with the update-email modal open', async ({page}) => {
  await page.goto('/?scenario=teacher');
  await page.getByRole('button', {name: 'Update email'}).click();
  const dialog = page.getByRole('dialog', {name: /update email/i});
  await expect(dialog).toBeVisible();
  await expectDialogSettled(dialog);

  const {violations} = await analyze(page);
  expect(violations).toEqual([]);
});

test('no axe violations with the delete-account alertdialog open', async ({
  page,
}) => {
  await page.goto('/?scenario=teacher');
  await page.getByRole('button', {name: /delete my account/i}).click();
  const dialog = page.getByRole('alertdialog', {name: /delete/i});
  await expect(dialog).toBeVisible();
  await expectDialogSettled(dialog);

  const {violations} = await analyze(page);
  expect(violations).toEqual([]);
});
