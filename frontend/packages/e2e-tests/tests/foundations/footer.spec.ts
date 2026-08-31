import {type Page} from '@playwright/test';

import {SmallFooterComponent} from '../components/small-footer';
import {expect, test} from '../fixtures';
import {ApplabLab} from '../pages/applab-lab';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {waitForVisualStability} from '../shared/stability';

/** iPhone 6 portrait dimensions, matching the Cucumber @eyes_mobile viewport. */
const MOBILE_VIEWPORT = {width: 375, height: 667};

/**
 * Extract the share URL from the sharing dialog. Both the legacy EJS template
 * and the React ShareAllowedDialog store it in the value attribute of
 * #sharing-dialog-copy-button.
 */
async function getShareUrl(page: Page): Promise<string> {
  const copyButton = page.locator('#sharing-dialog-copy-button');
  await expect(copyButton).toBeVisible({timeout: 30_000});
  const value = await copyButton.getAttribute('value');
  if (!value) {
    throw new Error('#sharing-dialog-copy-button has no value attribute');
  }
  return value;
}

/**
 * Complete the Star Wars level (allthethingscourse lesson 24, level 9) and
 * return its share URL. Used by multiple scenarios that need a share page:
 * the footer renders identically regardless of which lab produced it.
 *
 * The Cucumber source used /courses/starwars/ and /courses/mc/ for mobile and
 * Minecraft scenarios, but those courses are 404 on test-studio. The
 * allthethingscourse Star Wars level produces the same share-page footer.
 */
async function completeStarWarsAndGetShareUrl(page: Page): Promise<string> {
  const lab = new LegacyBlocklyLab(page);
  await lab.gotoLevel({lesson: 24, level: 9});
  await lab.run();
  await expect(page.locator('#finishButton')).toBeVisible({timeout: 30_000});
  await page.locator('#finishButton').click();
  return getShareUrl(page);
}

// Measured against test-studio on chromium; see EXPECTED_VIOLATIONS convention
// in e2e-tests/tests/activities/eyes.spec.ts.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  puzzleLightFooter: {},
  minecraftDarkFooter: {},
  // Share page footers have a color-contrast violation on the "more-link"
  // button text (light gray on dark background).
  shareFooter: {'color-contrast': 1},
  mobileShareFooter: {'color-contrast': 1},
};

test.describe('Checking the footer appearance', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature "Desktop puzzle using light small footer"
   */
  test(
    'Desktop puzzle using light small footer',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const lab = new LegacyBlocklyLab(page);
      const smallFooter = new SmallFooterComponent(page);

      await lab.gotoLevel({lesson: 2, level: 1});
      await expect(smallFooter.root).toBeVisible();

      await waitForVisualStability(page);
      await visualCheck('small footer');

      await smallFooter.openCopyrightFromBase();
      await waitForVisualStability(page);
      await visualCheck('copyright modal');
      await smallFooter.closeCopyrightDialog();
    },
  );

  test('Desktop puzzle light small footer: a11y', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    const smallFooter = new SmallFooterComponent(page);

    await lab.gotoLevel({lesson: 2, level: 1});
    await expect(smallFooter.root).toBeVisible();

    expect(
      await analyze(page, {include: '.small-footer-base', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.puzzleLightFooter);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature "Desktop Minecraft puzzle using dark small footer"
   */
  test(
    'Desktop Minecraft puzzle using dark small footer',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const lab = new LegacyBlocklyLab(page);
      const smallFooter = new SmallFooterComponent(page);

      await lab.gotoLevel({lesson: 25, level: 1});
      await expect(smallFooter.root).toBeVisible();

      await waitForVisualStability(page);
      await visualCheck('small footer');

      await smallFooter.openCopyrightFromBase();
      await waitForVisualStability(page);
      await visualCheck('copyright modal');
    },
  );

  test('Desktop Minecraft dark small footer: a11y', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    const smallFooter = new SmallFooterComponent(page);

    await lab.gotoLevel({lesson: 25, level: 1});
    await expect(smallFooter.root).toBeVisible();

    expect(
      await analyze(page, {include: '.small-footer-base', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.minecraftDarkFooter);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature "Desktop Star Wars share small footer"
   */
  test(
    'Desktop Star Wars share small footer',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const smallFooter = new SmallFooterComponent(page);

      const shareUrl = await completeStarWarsAndGetShareUrl(page);
      await page.goto(shareUrl);
      await expect(smallFooter.root).toBeVisible();

      await waitForVisualStability(page);
      await visualCheck('small footer');

      await smallFooter.openMenu();
      await waitForVisualStability(page);
      await visualCheck('footer menu');

      await smallFooter.openCopyrightFromMenu();
      await waitForVisualStability(page);
      await visualCheck('copyright modal');
      await smallFooter.closeCopyrightDialog();
      await smallFooter.closeMenu();

      // Also check the footer on the "How it Works (View Code)" page.
      await smallFooter.openMenu();
      await smallFooter.menuItem('How it Works (View Code)').click();
      await page.waitForURL(/\/edit/, {waitUntil: 'domcontentloaded'});
      await expect(page.locator('#runButton')).toBeVisible({timeout: 45_000});

      await waitForVisualStability(page);
      await visualCheck('how it works small footer');

      await smallFooter.openCopyrightFromBase();
      await waitForVisualStability(page);
      await visualCheck('how it works copyright modal');
    },
  );

  test('Desktop Star Wars share footer: a11y', async ({page}) => {
    const smallFooter = new SmallFooterComponent(page);

    const shareUrl = await completeStarWarsAndGetShareUrl(page);
    await page.goto(shareUrl);
    await expect(smallFooter.root).toBeVisible();

    expect(
      await analyze(page, {include: '.small-footer-base', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.shareFooter);
  });

  /**
   * Migration status: COMPLETED (was @skip)
   * Source: dashboard/test/ui/features/foundations/footer.feature "Desktop Minecraft share small footer"
   * Restored from @skip. The Cucumber source used /courses/mc/ (404 on
   * test-studio); adapted to allthethingscourse Star Wars share — the share
   * page footer and "How it Works" flow render identically.
   */
  test(
    'Desktop Minecraft share small footer',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const smallFooter = new SmallFooterComponent(page);

      const shareUrl = await completeStarWarsAndGetShareUrl(page);
      await page.goto(shareUrl);
      await expect(smallFooter.root).toBeVisible();

      await waitForVisualStability(page);
      await visualCheck('small footer');

      await smallFooter.openMenu();
      await waitForVisualStability(page);
      await visualCheck('footer menu');

      await smallFooter.openCopyrightFromMenu();
      await waitForVisualStability(page);
      await visualCheck('copyright modal');
      await smallFooter.closeCopyrightDialog();
      await smallFooter.closeMenu();

      // Check the "How it Works" page footer: menu open + close + copyright.
      // This was the distinguishing check in the Minecraft scenario.
      await smallFooter.openMenu();
      await smallFooter.menuItem('How it Works (View Code)').click();
      await page.waitForURL(/\/edit/, {waitUntil: 'domcontentloaded'});
      await expect(page.locator('#runButton')).toBeVisible({timeout: 45_000});

      await waitForVisualStability(page);
      await visualCheck('how it works small footer');

      await smallFooter.openMenu();
      await waitForVisualStability(page);
      await visualCheck('how it works footer menu');
      await smallFooter.closeMenu();

      await smallFooter.openCopyrightFromBase();
      await waitForVisualStability(page);
      await visualCheck('how it works copyright modal');
    },
  );

  test('Desktop Minecraft share footer: a11y', async ({page}) => {
    const smallFooter = new SmallFooterComponent(page);

    const shareUrl = await completeStarWarsAndGetShareUrl(page);
    await page.goto(shareUrl);
    await expect(smallFooter.root).toBeVisible();

    expect(
      await analyze(page, {include: '.small-footer-base', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.shareFooter);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature "Desktop Applab share small footer"
   */
  test(
    'Desktop Applab share small footer',
    {tag: '@visual'},
    async ({page, signInAsNewUser, visualCheck}) => {
      await signInAsNewUser({type: 'student', name: 'Footer Test Student'});
      const applab = new ApplabLab(page);
      const smallFooter = new SmallFooterComponent(page);

      await applab.gotoNewProject();

      // Open the share dialog and navigate to the share page.
      await page.locator('.project_share').click();
      const shareUrl = await getShareUrl(page);
      await page.goto(shareUrl);
      await expect(smallFooter.root).toBeVisible();

      await waitForVisualStability(page);
      await visualCheck('small footer');

      await smallFooter.openMenu();
      await waitForVisualStability(page);
      await visualCheck('footer menu');

      await smallFooter.openCopyrightFromMenu();
      await waitForVisualStability(page);
      await visualCheck('copyright modal');
    },
  );

  test('Desktop Applab share footer: a11y', async ({page, signInAsNewUser}) => {
    await signInAsNewUser({type: 'student', name: 'Footer Test Student'});
    const applab = new ApplabLab(page);
    const smallFooter = new SmallFooterComponent(page);

    await applab.gotoNewProject();
    await page.locator('.project_share').click();
    const shareUrl = await getShareUrl(page);
    await page.goto(shareUrl);
    await expect(smallFooter.root).toBeVisible();

    expect(
      await analyze(page, {include: '.small-footer-base', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.shareFooter);
  });

  /**
   * Migration status: COMPLETED (was @skip)
   * Source: dashboard/test/ui/features/foundations/footer.feature "Mobile Star Wars share small footer"
   * Restored from @skip. The Cucumber source used /courses/starwars/ (404 on
   * test-studio); adapted to allthethingscourse Star Wars share. Uses viewport
   * emulation in place of BrowserStack mobile device rotation.
   */
  test(
    'Mobile Star Wars share small footer',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const smallFooter = new SmallFooterComponent(page);

      // Complete the level at desktop viewport; extract the share URL before
      // switching to mobile — the sharing dialog may not render at 375px.
      const shareUrl = await completeStarWarsAndGetShareUrl(page);
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto(shareUrl);
      await expect(smallFooter.root).toBeVisible();

      await waitForVisualStability(page);
      await visualCheck('small footer');

      await smallFooter.openMenu();
      await waitForVisualStability(page);
      await visualCheck('footer menu');

      await smallFooter.openCopyrightFromMenu();
      await waitForVisualStability(page);
      await visualCheck('copyright modal');
    },
  );

  test('Mobile Star Wars share footer: a11y', async ({page}) => {
    const smallFooter = new SmallFooterComponent(page);

    const shareUrl = await completeStarWarsAndGetShareUrl(page);
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(shareUrl);
    await expect(smallFooter.root).toBeVisible();

    expect(
      await analyze(page, {include: '.small-footer-base', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.mobileShareFooter);
  });

  /**
   * Migration status: COMPLETED (was @skip)
   * Source: dashboard/test/ui/features/foundations/footer.feature "Mobile Minecraft share small footer"
   * Restored from @skip. The Cucumber source used /courses/mc/ (404 on
   * test-studio); adapted to allthethingscourse Star Wars share. Uses viewport
   * emulation.
   */
  test(
    'Mobile Minecraft share small footer',
    {tag: '@visual'},
    async ({page, visualCheck}) => {
      const smallFooter = new SmallFooterComponent(page);

      const shareUrl = await completeStarWarsAndGetShareUrl(page);
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto(shareUrl);
      await expect(smallFooter.root).toBeVisible();

      await waitForVisualStability(page);
      await visualCheck('small footer');

      await smallFooter.openMenu();
      await waitForVisualStability(page);
      await visualCheck('footer menu');

      await smallFooter.openCopyrightFromMenu();
      await waitForVisualStability(page);
      await visualCheck('copyright modal');
    },
  );

  test('Mobile Minecraft share footer: a11y', async ({page}) => {
    const smallFooter = new SmallFooterComponent(page);

    const shareUrl = await completeStarWarsAndGetShareUrl(page);
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(shareUrl);
    await expect(smallFooter.root).toBeVisible();

    expect(
      await analyze(page, {include: '.small-footer-base', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.mobileShareFooter);
  });

  /**
   * Migration status: COMPLETED (was @skip)
   * Source: dashboard/test/ui/features/foundations/footer.feature "Mobile Applab share small footer"
   * Restored from @skip. Uses viewport emulation.
   */
  test(
    'Mobile Applab share small footer',
    {tag: '@visual'},
    async ({page, signInAsNewUser, visualCheck}) => {
      await signInAsNewUser({type: 'student', name: 'Footer Test Student'});
      const applab = new ApplabLab(page);
      const smallFooter = new SmallFooterComponent(page);

      await applab.gotoNewProject();

      // Extract the share URL at desktop viewport before switching to mobile.
      await page.locator('.project_share').click();
      const shareUrl = await getShareUrl(page);

      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto(shareUrl);
      await expect(smallFooter.root).toBeVisible();

      await waitForVisualStability(page);
      await visualCheck('small footer');

      await smallFooter.openMenu();
      await waitForVisualStability(page);
      await visualCheck('footer menu');

      await smallFooter.openCopyrightFromMenu();
      await waitForVisualStability(page);
      await visualCheck('copyright modal');
    },
  );

  test('Mobile Applab share footer: a11y', async ({page, signInAsNewUser}) => {
    await signInAsNewUser({type: 'student', name: 'Footer Test Student'});
    const applab = new ApplabLab(page);
    const smallFooter = new SmallFooterComponent(page);

    await applab.gotoNewProject();
    await page.locator('.project_share').click();
    const shareUrl = await getShareUrl(page);

    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(shareUrl);
    await expect(smallFooter.root).toBeVisible();

    expect(
      await analyze(page, {include: '.small-footer-base', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.mobileShareFooter);
  });
});
