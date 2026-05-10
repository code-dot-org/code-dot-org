import {type Page} from '@playwright/test';

import {
  createSection,
  createStudent,
  createTeacher,
  joinSection,
  signOut,
} from '../shared/auth';
import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

/**
 * App Lab — Libraries: publish/unpublish, import/remove, teacher assignment.
 *
 * Source: dashboard/test/ui/features/star_labs/applab/libraries.feature
 * Migration status: see per-scenario comments.
 */

type ProjectTestWindow = Window & {
  dashboard?: {
    project?: {
      __TestInterface?: {isInitialSaveComplete?: () => boolean};
    };
  };
};

/**
 * Click an element that performs a full-page navigation and wait only for the
 * main-frame navigation to reach DOMContentLoaded.  The caller must assert the
 * next user-visible page state.  Some dashboard actions reload the same URL,
 * so URL-change waits are not sufficient here.
 *
 * @param page - Playwright page to observe
 * @param click - action that triggers the navigation
 */
async function clickAndWaitForMainFrameNavigation(
  page: Page,
  click: () => Promise<unknown>,
): Promise<void> {
  await Promise.all([
    page.waitForEvent('framenavigated', {
      predicate: frame => frame === page.mainFrame(),
      timeout: 30_000,
    }),
    click(),
  ]);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Wait until the fresh project has completed its first save.
 *
 * @param page - page with a new project loaded
 */
async function waitForInitialProjectSave(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const pageWindow = window as ProjectTestWindow;
      return pageWindow.dashboard?.project?.__TestInterface?.isInitialSaveComplete?.();
    },
    {timeout: 60_000},
  );
}

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

/**
 * Open the App Lab Manage Libraries dialog from the settings cog.
 * Mirrors `I open the Manage Libraries dialog` from settings_cog_steps.rb.
 *
 * @param page - page with an App Lab project loaded
 */
async function openManageLibrariesDialog(page: Page): Promise<void> {
  await page
    .locator('.settings-cog:visible')
    .waitFor({state: 'visible', timeout: 15_000});
  await page.locator('.settings-cog:visible').click();
  await page
    .locator(
      '.ui-test-settings-cog-menu:visible .ui-test-settings-cog-menu-item',
      {
        hasText: 'Manage Libraries',
      },
    )
    .click();
  await expect(page.locator('.modal')).toContainText(
    'Manage libraries in this project',
    {timeout: 15_000},
  );
}

/**
 * Create a new App Lab project and publish a minimal library from it.
 * Mirrors the Cucumber `I publish a basic library in Applab` helper.
 *
 * @param page - authenticated page
 * @returns edit URL and channel id for the published project
 */
async function publishBasicLibrary(
  page: Page,
): Promise<{libraryUrl: string; channelId: string}> {
  const applab = new AppLab(page);

  await page.goto('/projects/applab/new');
  await applab.waitForReady();
  await waitForInitialProjectSave(page);
  await applab.ensureTextMode();

  await applab.insertCodeAtCursor(
    '// my library function\nfunction myLibrary() {}',
  );

  await openLibraryDialog(page);
  await page
    .locator('#ui-test-library-description')
    .waitFor({state: 'visible', timeout: 30_000});
  await page.locator('#ui-test-library-description').fill('My library');
  await page.locator('label', {hasText: 'Select all functions'}).click();
  await page.locator('#ui-test-publish-library').click();
  await expect(
    page.locator('b', {
      hasText: 'Successfully published your library:',
    }),
  ).toBeVisible({timeout: 15_000});

  const libraryUrl = page.url();
  const channelId = libraryUrl.match(/\/projects\/applab\/([^/]+)/)?.[1];
  if (!channelId) {
    throw new Error(`Could not read App Lab channel id from ${libraryUrl}`);
  }
  await page.keyboard.press('Escape');
  await page
    .locator('#project-share')
    .waitFor({state: 'hidden', timeout: 10_000});
  return {libraryUrl, channelId};
}

test.describe('App Lab — Libraries', () => {
  /**
   * Migration status: COMPLETED
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

      const {libraryUrl} = await publishBasicLibrary(studentPage);

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
   * Migration status: COMPLETED
   * Source: libraries.feature — "Adding and removing a library from a project"
   *
   * Student1 publishes a library. Student2 imports it by channel id, sees it
   * in the current project library list, removes it, then sees the empty-state
   * message. The library title visible in the dialog is the readiness signal
   * replacing Cucumber's load-page wait.
   */
  test(
    'add and remove a library from a project',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page, {name: 'Student1'});
      const {channelId} = await publishBasicLibrary(page);

      await createStudent(page, {name: 'Student2'});
      await page.goto('/projects/applab/new');
      const applab = new AppLab(page);
      await applab.waitForReady();

      await openManageLibrariesDialog(page);
      await expect(
        page.locator('h2', {hasText: 'Import library from ID'}),
      ).toBeVisible();
      await page.locator('#ui-test-import-library > input').fill(channelId);
      await clickAndWaitForMainFrameNavigation(page, () =>
        page.locator('#ui-test-import-library > button').click(),
      );
      await applab.waitForReady();

      await openManageLibrariesDialog(page);
      await expect(page.locator('a', {hasText: 'UntitledProject'})).toBeVisible(
        {timeout: 30_000},
      );

      await clickAndWaitForMainFrameNavigation(page, () =>
        page.locator('.ui-test-remove-library').first().click(),
      );
      await applab.waitForReady();

      await openManageLibrariesDialog(page);
      await expect(
        page
          .getByText('You have no libraries in your project.', {exact: false})
          .first(),
      ).toBeVisible({timeout: 15_000});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: libraries.feature — "Assigning a library to a section as a teacher"
   *
   * A teacher publishes a library and assigns it to a section. A student joins
   * that section and sees the assigned class library in App Lab's Manage
   * Libraries dialog.
   */
  test(
    'teacher assigns library to section; student sees it',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'Library_Teacher'});
      const {sectionCode} = await createSection(page);
      await publishBasicLibrary(page);

      await openLibraryDialog(page);
      await page
        .locator('#ui-test-manage-libraries')
        .waitFor({state: 'visible', timeout: 30_000});
      await page.locator('#ui-test-manage-libraries').click();
      await page
        .locator('.ui-test-sortable-table-select')
        .waitFor({state: 'visible', timeout: 30_000});

      await page
        .locator('select[name="selectOption"]')
        .selectOption({index: 1});
      await page
        .locator('.ui-test-sortable-table-select table input')
        .first()
        .click();
      const assignDone = page.waitForResponse(
        response =>
          /\/v3\/channels\//.test(response.url()) &&
          response.request().method() === 'POST',
        {timeout: 30_000},
      );
      await page.locator('div', {hasText: 'Assign library'}).last().click();
      await assignDone;
      await expect(
        page.locator('p', {
          hasText: 'This library is assigned to the following sections:',
        }),
      ).toBeVisible({timeout: 30_000});

      await signOut(page);
      await createStudent(page, {name: 'Library_Student'});
      await joinSection(page, sectionCode);
      await page.goto('/projects/applab/new');
      const applab = new AppLab(page);
      await applab.waitForReady();

      await openManageLibrariesDialog(page);
      await expect(page.locator('a', {hasText: 'UntitledProject'})).toBeVisible(
        {timeout: 30_000},
      );
      await expect(
        page.getByText('Author: Library_Teacher', {exact: true}),
      ).toBeVisible();
    },
  );
});
