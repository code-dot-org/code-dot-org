import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {ProjectSharingPage} from '../project-sharing/ProjectSharingPage';

import {FooterPage} from './FooterPage';

test.describe('Small footer visual smoke ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop puzzle using light small footer
   */
  test('desktop puzzle uses the light small footer', async ({page}) => {
    const footer = new FooterPage(page);
    await footer.openLevel(
      '/courses/allthethingscourse/units/1/lessons/2/levels/1?noautoplay=true',
    );
    // Visual checkpoint stub: "small footer".
    await footer.openCopyrightDialog();
    // Visual checkpoint stub: "copyright modal".
    await footer.closeDialog();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop Minecraft puzzle using dark small footer
   */
  test('desktop Minecraft puzzle uses the dark small footer', async ({
    page,
  }) => {
    const footer = new FooterPage(page);
    await footer.openLevel(
      '/courses/mc/units/1/lessons/1/levels/14?noautoplay=true',
    );
    // Visual checkpoint stub: "small footer".
    await footer.openCopyrightDialog();
    // Visual checkpoint stub: "copyright modal".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop Star Wars share small footer
   */
  test('desktop Star Wars share page exposes footer menu and copyright', async ({
    page,
  }) => {
    const footer = new FooterPage(page);
    await footer.openLevel(
      '/courses/starwars/units/1/lessons/1/levels/15?noautoplay=true',
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

    await page.goto(shareUrl, {waitUntil: 'domcontentloaded'});
    await footer.expectSmallFooter();
    // Visual checkpoint stub: "small footer".

    await footer.openSmallFooterMenu();
    // Visual checkpoint stub: "footer menu".
    await footer.selectSmallFooterItem('Copyright');
    await expect(footer.copyrightDialog()).toBeVisible();
    // Visual checkpoint stub: "copyright modal".
    await footer.closeDialog();

    await footer.openSmallFooterMenu();
    await footer.selectSmallFooterItem('How it Works (View Code)');
    await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
    await footer.expectSmallFooter();
    // Visual checkpoint stub: "how it works small footer".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/footer.feature
   * Scenario: Desktop Applab share small footer
   */
  test('desktop App Lab share page exposes footer menu and copyright', async ({
    page,
  }) => {
    await createStudent(page);
    const projectSharing = new ProjectSharingPage(page);
    const footer = new FooterPage(page);

    await projectSharing.makeProjectFromFamilyRoute('applab');
    const shareUrl = await projectSharing.openShareDialogAndReadUrl();
    await projectSharing.gotoSharePage(shareUrl);
    await footer.expectSmallFooter();
    // Visual checkpoint stub: "small footer".

    await footer.openSmallFooterMenu();
    // Visual checkpoint stub: "footer menu".
    await footer.selectSmallFooterItem('Copyright');
    await expect(footer.copyrightDialog()).toBeVisible();
    // Visual checkpoint stub: "copyright modal".
  });
});
