import {expect, test} from '../../shared/fixtures';
import {labLevelUrl} from '../../shared/urls';
import {Artist} from '../activities/artist/Artist';

/**
 * Artist project — save to project gallery.
 *
 * Source: dashboard/test/ui/features/star_labs/sharepage.feature
 * Scenario: "Share and save an artist level to the project gallery" (@as_student)
 *
 * A student runs a free-play Artist level, clicks Finish, then saves the
 * result to the project gallery.  Navigating to /projects/ shows one row
 * named "Artist Project".
 */

/**
 * Minimal Artist free-play solution: when_run → draw_move_by_constant 100.
 * Source: `I've initialized the workspace with artist project blocks` in
 * blockly_initialization_blocks.rb.
 */
const ARTIST_PROJECT_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'draw_move_by_constant',
            fields: {
              DIR: '<field name="DIR">moveForward</field>',
              VALUE: '100',
            },
          },
        },
      },
    ],
  },
};

test.describe(
  'Sharepage — save artist project to gallery',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/star_labs/sharepage.feature
     * Scenario: Share and save an artist level to the project gallery
     *
     * 1. Student runs Artist lesson 3 / level 10 and clicks Finish.
     * 2. Clicks "Save to Project Gallery" in the congrats dialog.
     * 3. Navigates to /projects/ and verifies 1 row named "Artist Project".
     */
    test('artist project is saved to the project gallery', async ({
      studentPage,
    }) => {
      const artist = new Artist(studentPage);

      // Navigate without gotoLevel (which calls /reset_session and logs out).
      await studentPage.goto(labLevelUrl(3, 10));
      await artist.waitForLabPage();
      await artist.loadBlocks(ARTIST_PROJECT_BLOCKS);

      await artist.runButton.click();

      // #finishButton appears after the program runs on free-play levels.
      await expect(artist.finishButton).toBeVisible({timeout: 15_000});
      await artist.finishButton.click();

      // Wait for the congrats dialog — `.congrats` contains "Congratulations".
      await expect(studentPage.locator('.congrats')).toContainText(
        'Congratulations',
        {timeout: 30_000},
      );

      // If the sharing copy button isn't present, the congrats dialog was
      // dismissed — re-run to re-open it.
      const sharingVisible =
        (await studentPage.locator('#sharing-dialog-copy-button').count()) > 0;
      if (!sharingVisible) {
        await studentPage.locator('#again-button').click();
        await expect(studentPage.locator('.congrats')).not.toBeVisible({
          timeout: 10_000,
        });
        await studentPage.locator('#resetButton').click();
        await artist.runButton.click();
        await expect(artist.finishButton).toBeVisible({timeout: 15_000});
        await artist.finishButton.click();
        await expect(studentPage.locator('.congrats')).toContainText(
          'Congratulations',
          {timeout: 30_000},
        );
      }

      await studentPage.locator('#save-to-project-gallery-button').click();
      await expect(
        studentPage.locator('#save-to-project-gallery-button'),
      ).toContainText('Added', {timeout: 15_000});

      // Close the feedback dialog.
      await studentPage.locator('#x-close').click();
      await expect(studentPage.locator('.modal-body')).not.toBeVisible({
        timeout: 10_000,
      });

      // Verify the project appears in the gallery.
      await studentPage.goto('/projects/');
      await expect(
        studentPage.locator('.ui-personal-projects-table'),
      ).toBeVisible({timeout: 30_000});
      await expect(
        studentPage.locator('.ui-personal-projects-row'),
      ).toHaveCount(1);
      await expect(
        studentPage.locator('.ui-projects-table-project-name').first(),
      ).toContainText('Artist Project', {timeout: 15_000});
    });
  },
);
