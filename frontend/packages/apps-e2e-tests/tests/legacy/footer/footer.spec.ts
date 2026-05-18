import {createStudent} from '../../shared/auth';
import type {EyesFixture} from '../../shared/eyes';
import {expect, test} from '../../shared/fixtures';
import {ProjectSharingPage} from '../project-sharing/ProjectSharingPage';

import {FooterPage} from './FooterPage';

/**
 * Create a Star Wars share URL from the source level.
 *
 * @param page - Playwright page
 */
async function createStarWarsShareUrl(
  page: import('@playwright/test').Page,
): Promise<string> {
  const footer = new FooterPage(page);
  await footer.openLevel(
    '/courses/starwars/units/1/lessons/1/levels/15?noautoplay=true',
    {waitForBlocklyWorkspace: false},
  );
  await page
    .locator('#runButton')
    .evaluate(element => (element as HTMLElement).click());
  await expect(page.locator('#finishButton')).toBeVisible({timeout: 15_000});
  await page.locator('#finishButton').click();
  const copyButton = page.locator('#sharing-dialog-copy-button');
  await expect(copyButton).toBeVisible({timeout: 30_000});
  const shareUrl = await copyButton.getAttribute('value');
  if (!shareUrl) throw new Error('share URL not found');
  return shareUrl;
}

/**
 * Create a Minecraft share URL from the source level.
 *
 * @param page - Playwright page
 */
async function createMinecraftShareUrl(
  page: import('@playwright/test').Page,
): Promise<string> {
  const footer = new FooterPage(page);
  await footer.openLevel(
    '/courses/mc/units/1/lessons/1/levels/14?noautoplay=true',
  );
  await page
    .locator('#runButton')
    .evaluate(element => (element as HTMLElement).click());
  await page.getByRole('button', {name: 'Finish'}).click();
  const copyButton = page.locator('#sharing-dialog-copy-button');
  await expect(copyButton).toBeVisible({timeout: 30_000});
  const shareUrl = await copyButton.getAttribute('value');
  if (!shareUrl) throw new Error('share URL not found');
  return shareUrl;
}

/**
 * Assert a share page footer exposes its menu and copyright dialog.
 *
 * @param page - Playwright page
 * @param shareUrl - share URL from the level completion dialog
 * @param eyes - Eyes fixture for visual checkpoints
 */
async function expectShareFooter(
  page: import('@playwright/test').Page,
  shareUrl: string,
  eyes: EyesFixture,
): Promise<void> {
  const footer = new FooterPage(page);
  await page.goto(shareUrl, {waitUntil: 'domcontentloaded'});
  await footer.expectSmallFooter();
  const runtimeRegion = page.locator('#visualizationColumn');
  await eyes.check('small footer', {ignoreRegions: [runtimeRegion]});

  await footer.openSmallFooterMenu();
  await eyes.check('footer menu', {ignoreRegions: [runtimeRegion]});
  await footer.selectSmallFooterItem('Copyright');
  await expect(footer.copyrightDialog()).toBeVisible();
  await eyes.check('copyright modal', {ignoreRegions: [runtimeRegion]});
}

test.describe('Small footer visual smoke ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop puzzle using light small footer
   */
  test('desktop puzzle uses the light small footer', async ({page, eyes}) => {
    await eyes.open('Desktop puzzle using light small footer');
    const footer = new FooterPage(page);
    await footer.openLevel(
      '/courses/allthethingscourse/units/1/lessons/2/levels/1?noautoplay=true',
    );
    await eyes.check('small footer', {
      ignoreRegions: [page.locator('#visualizationColumn')],
    });
    await footer.openCopyrightDialog();
    await eyes.check('copyright modal');
    await footer.closeDialog();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop Minecraft puzzle using dark small footer
   */
  test('desktop Minecraft puzzle uses the dark small footer', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Desktop Minecraft puzzle using dark small footer');
    const footer = new FooterPage(page);
    await footer.openLevel(
      '/courses/mc/units/1/lessons/1/levels/14?noautoplay=true',
    );
    await eyes.check('small footer');
    await footer.openCopyrightDialog();
    await eyes.check('copyright modal');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop Star Wars share small footer
   */
  test('desktop Star Wars share page exposes footer menu and copyright', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Desktop Star Wars share small footer');
    const footer = new FooterPage(page);
    const shareUrl = await createStarWarsShareUrl(page);
    await page.goto(shareUrl, {waitUntil: 'domcontentloaded'});
    await footer.expectSmallFooter();
    await eyes.check('small footer');

    await footer.openSmallFooterMenu();
    await eyes.check('footer menu');
    await footer.selectSmallFooterItem('Copyright');
    await expect(footer.copyrightDialog()).toBeVisible();
    await eyes.check('copyright modal');
    await footer.closeDialog();

    await footer.openSmallFooterMenu();
    await footer.selectSmallFooterItem('How it Works (View Code)');
    await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
    await footer.expectSmallFooter();
    await eyes.checkRegion('.small-footer-base', 'how it works small footer');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop Applab share small footer
   */
  test('desktop App Lab share page exposes footer menu and copyright', async ({
    page,
    eyes,
  }) => {
    await createStudent(page);
    await eyes.open('Desktop Applab share small footer');
    const projectSharing = new ProjectSharingPage(page);
    const footer = new FooterPage(page);

    await projectSharing.makeProjectFromFamilyRoute('applab');
    const shareUrl = await projectSharing.openShareDialogAndReadUrl();
    await projectSharing.gotoSharePage(shareUrl);
    await footer.expectSmallFooter();
    await eyes.check('small footer');

    await footer.openSmallFooterMenu();
    await eyes.check('footer menu');
    await footer.selectSmallFooterItem('Copyright');
    await expect(footer.copyrightDialog()).toBeVisible();
    await eyes.check('copyright modal');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop Minecraft share small footer
   */
  test('desktop Minecraft share page exposes footer menu and copyright', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Desktop Minecraft share small footer');
    const shareUrl = await createMinecraftShareUrl(page);
    await expectShareFooter(page, shareUrl, eyes);

    const footer = new FooterPage(page);
    await footer.closeDialog();
    await footer.openSmallFooterMenu();
    await footer.selectSmallFooterItem('How it Works (View Code)');
    await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
    await footer.expectSmallFooter();
    await eyes.checkRegion('.small-footer-base', 'how it works small footer');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Mobile Star Wars share small footer
   * @eyes_mobile
   */
  test('mobile Star Wars share page exposes footer menu and copyright', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Mobile Star Wars share small footer');
    const shareUrl = await createStarWarsShareUrl(page);
    await page.setViewportSize({width: 390, height: 844});
    await expectShareFooter(page, shareUrl, eyes);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Mobile Minecraft share small footer
   * @eyes_mobile
   */
  test('mobile Minecraft share page exposes footer menu and copyright', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Mobile Minecraft share small footer');
    const shareUrl = await createMinecraftShareUrl(page);
    await page.setViewportSize({width: 390, height: 844});
    await expectShareFooter(page, shareUrl, eyes);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Mobile Applab share small footer
   * @eyes_mobile
   */
  test('mobile App Lab share page exposes footer menu and copyright', async ({
    page,
    eyes,
  }) => {
    await createStudent(page);
    await eyes.open('Mobile Applab share small footer');
    const projectSharing = new ProjectSharingPage(page);

    await projectSharing.makeProjectFromFamilyRoute('applab');
    const shareUrl = await projectSharing.openShareDialogAndReadUrl();
    await page.setViewportSize({width: 390, height: 844});
    await expectShareFooter(page, shareUrl, eyes);
  });
});
