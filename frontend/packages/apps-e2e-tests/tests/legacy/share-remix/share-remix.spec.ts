import {expect, test} from '../../shared/fixtures';
import {Artist} from '../activities/artist/Artist';

/**
 * Remixing a legacy /c/ share link produces a /projects/artist/ edit URL.
 *
 * Source: dashboard/test/ui/features/star_labs/legacy_share_remix.feature
 * Scenario: "Remixing a legacy /c/ share link"
 *
 * @no_mobile @as_student
 *
 * Level 3/10 is a free-play Artist level.  After running and finishing,
 * the project acquires a share URL.  Navigating to that URL and remixing
 * via the "How it Works" footer link and the Remix button must redirect
 * to a /projects/artist/<id>/edit URL owned by the current student.
 */
test.describe('Legacy share remix — Artist', () => {
  test(
    'remixing a legacy share link lands on /projects/artist/.../edit',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const artist = new Artist(studentPage);
      await studentPage.goto(
        '/courses/allthethingscourse/units/1/lessons/3/levels/10?noautoplay=true',
      );
      await artist.waitForLabPage();

      await artist.run();
      await artist.finishButton.click();
      await expect(artist.congratsMessage).toBeVisible({timeout: 15_000});

      // Get the share URL from the share dialog.
      // JS click bypasses the congrats-dialog backdrop that intercepts pointer
      // events when the dialog is still open over the header.
      await studentPage.evaluate(() =>
        (document.querySelector('.project_share') as HTMLElement)?.click(),
      );
      const copyButton = studentPage.locator('#sharing-dialog-copy-button');
      await expect(copyButton).toBeVisible({timeout: 15_000});
      const shareUrl = await copyButton.getAttribute('value');
      if (!shareUrl)
        throw new Error('share URL not found in #sharing-dialog-copy-button');

      // Navigate to the share page.
      await studentPage.goto(shareUrl);
      await studentPage
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Open the small-footer "more" menu and click "How it Works (View Code)".
      await studentPage
        .locator('div.small-footer-base button.more-link')
        .click();
      await studentPage
        .locator('ul#more-menu')
        .getByText('How it Works (View Code)')
        .click();

      // Wait for the workspace page (contains /edit in URL).
      await studentPage.waitForURL('**/edit**', {timeout: 30_000});

      // Remix button appears in the workspace view.
      await studentPage
        .locator('.project_remix')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      // Click Remix — navigates to a new forked project.
      await studentPage.locator('.project_remix').first().click();
      await studentPage.waitForURL(/\/projects\/artist\/.+\/edit/, {
        timeout: 30_000,
      });
      expect(studentPage.url()).toContain('/projects/artist/');
      expect(studentPage.url()).toContain('/edit');
    },
  );
});
