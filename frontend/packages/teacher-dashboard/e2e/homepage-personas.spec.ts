import {expect, test} from '@playwright/test';

// Pixel-perfect visual baselines for each MSW persona. The frozen clock and
// disabled animations eliminate time-dependent and motion-induced flake.
const SCREENSHOT_OPTIONS = {
  fullPage: true,
  animations: 'disabled',
  maxDiffPixels: 0,
  caret: 'hide',
} as const;

const PERSONAS = [
  'established',
  'new-teacher',
  'archived-only',
  'coteacher-invite',
  'many-sections',
  'degraded',
] as const;

// Personas that render visible section cards on the "teaching" tab.
const PERSONAS_WITH_SECTIONS = new Set([
  'established',
  'coteacher-invite',
  'many-sections',
  'degraded',
]);

async function navigateToPersona(
  page: import('@playwright/test').Page,
  persona: string,
) {
  await page.clock.install({now: new Date('2026-07-22T12:00:00Z')});
  await page.goto(`/?persona=${persona}&devChrome=off`);
  await page.evaluate(() => document.fonts.ready);
}

async function waitForSections(page: import('@playwright/test').Page) {
  await page.locator('#ui-test-section-list li').first().waitFor();
}

for (const persona of PERSONAS) {
  test(`${persona} persona`, async ({page}) => {
    await navigateToPersona(page, persona);
    if (PERSONAS_WITH_SECTIONS.has(persona)) {
      await waitForSections(page);
    }
    // For personas without sections, wait for the welcome heading.
    await page.getByRole('heading', {level: 2}).first().waitFor();
    await expect(page).toHaveScreenshot(`${persona}.png`, SCREENSHOT_OPTIONS);
  });
}

test('archived-only persona — archived tab', async ({page}) => {
  await navigateToPersona(page, 'archived-only');
  // Wait for the page to settle before clicking the tab.
  await page.getByRole('heading', {level: 2}).first().waitFor();
  await page.getByRole('button', {name: /archived/i}).click();
  // Archived sections should appear.
  await page.locator('#ui-test-section-list li').first().waitFor();
  await expect(page).toHaveScreenshot(
    'archived-only-archived-tab.png',
    SCREENSHOT_OPTIONS,
  );
});
