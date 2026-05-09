import {expect, test, type Page} from '../shared/fixtures';

import {AppLab} from './AppLab';

/**
 * App Lab — Libraries: publish/unpublish, import/remove, teacher assignment.
 *
 * Source: dashboard/test/ui/features/star_labs/applab/libraries.feature
 *
 * Scenarios 2 and 3 require two coordinated student accounts or a
 * teacher + student pair; deferred as fixme stubs.
 */

/**
 * Open the share dialog, expand advanced options if needed, click the
 * "Share as library" tab, then click the "Share as library" button that
 * dispatches showLibraryCreationDialog().
 *
 * Mirrors `I open the library publish dialog` from settings_cog_steps.rb /
 * droplet_steps.rb:
 *   open share dialog → click "Show advanced options" if exists
 *   → click li "Share as library" → click button "Share as library"
 */
async function openLibraryDialog(page: Page): Promise<void> {
  await page.locator('.project_share').first().click();
  await page
    .locator('#project-share')
    .waitFor({state: 'visible', timeout: 15_000});

  const advancedLink = page.locator('#project-share a', {
    hasText: 'Show advanced options',
  });
  if (await advancedLink.isVisible()) {
    await advancedLink.click();
  }

  await page
    .locator('#project-share li', {hasText: 'Share as library'})
    .waitFor({state: 'visible', timeout: 10_000});
  await page
    .locator('#project-share li', {hasText: 'Share as library'})
    .click();

  await page
    .locator('#project-share button', {hasText: 'Share as library'})
    .waitFor({state: 'visible', timeout: 10_000});
  await page
    .locator('#project-share button', {hasText: 'Share as library'})
    .click();
}

test.describe('App Lab — Libraries', () => {
  /**
   * Source: libraries.feature — "Publishing and unpublishing a library"
   *
   * Creates a new App Lab project, adds a minimal library function, publishes
   * it via the share dialog, verifies it appears on /projects/libraries, then
   * unpublishes and confirms the success message.
   */
  test(
    'publish and unpublish a library',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);

      await studentPage.goto('/projects/applab/new');
      await applab.waitForReady();

      // Wait for initial project save before touching the editor.
      await studentPage.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () =>
          (
            window as any
          ).dashboard?.project?.__TestInterface?.isInitialSaveComplete(),
        {timeout: 60_000},
      );

      await applab.ensureTextMode();

      // Mirrors "I add code for a library function" from droplet_steps.rb.
      await applab.insertCodeAtCursor(
        '// my library function\nfunction myLibrary() {}',
      );

      // Open LibraryCreationDialog.
      await openLibraryDialog(studentPage);

      // Fill in library description and publish.
      await studentPage
        .locator('#ui-test-library-description')
        .waitFor({state: 'visible', timeout: 30_000});
      await studentPage
        .locator('#ui-test-library-description')
        .fill('My library');
      await studentPage
        .locator('label', {hasText: 'Select all functions'})
        .click();
      await studentPage.locator('#ui-test-publish-library').click();
      await expect(
        studentPage.locator('b', {
          hasText: 'Successfully published your library:',
        }),
      ).toBeVisible({timeout: 15_000});

      const libraryUrl = studentPage.url();

      // Verify the library appears on the libraries page.
      await studentPage.goto('/projects/libraries');
      await expect(studentPage.locator('.ui-test-library-table')).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        studentPage
          .locator('.ui-test-library-table td')
          .filter({hasText: 'UntitledProject'}),
      ).toBeVisible({timeout: 15_000});

      // Navigate back to the project and unpublish.
      await studentPage.goto(libraryUrl);
      await applab.waitForReady();

      // Re-open LibraryCreationDialog — now shows Update+Unpublish since
      // alreadyPublished=true after loadLibrary() returns.
      await openLibraryDialog(studentPage);

      await expect(
        studentPage.locator('#ui-test-unpublish-library'),
      ).toBeVisible({timeout: 30_000});
      await studentPage.locator('#ui-test-unpublish-library').click();

      await expect(
        studentPage.locator('b', {
          hasText: 'Successfully unpublished your library',
        }),
      ).toBeVisible({timeout: 15_000});
    },
  );

  /**
   * Source: libraries.feature — "Adding and removing a library from a project"
   *
   * Requires two coordinated student accounts; deferred.
   */
  test.fixme('add and remove a library from a project', async () => {});

  /**
   * Source: libraries.feature — "Assigning a library to a section as a teacher"
   *
   * Requires teacher + student pair; deferred.
   */
  test.fixme(
    'teacher assigns library to section; student sees it',
    async () => {},
  );
});
