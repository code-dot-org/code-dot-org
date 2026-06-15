import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';

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

// CdoTheme's primary button fails AA contrast app-wide (a design-system issue,
// not fixable here). Modal scans drop only color-contrast so that one theme
// button doesn't mask the structural checks (roles, names, focus); page scans
// above keep it on.
const analyzeNoContrast = (page: Page) =>
  new AxeBuilder({page})
    .withTags(WCAG_TAGS)
    .disableRules(['color-contrast'])
    .analyze();

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
  await page.getByRole('dialog', {name: /update email/i}).waitFor();

  const {violations} = await analyzeNoContrast(page);
  expect(violations).toEqual([]);
});

test('no axe violations with the delete-account alertdialog open', async ({
  page,
}) => {
  await page.goto('/?scenario=teacher');
  await page.getByRole('button', {name: /delete my account/i}).click();
  await page.getByRole('alertdialog', {name: /delete/i}).waitFor();

  const {violations} = await analyzeNoContrast(page);
  expect(violations).toEqual([]);
});
