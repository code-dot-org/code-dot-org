import {
  createSection,
  createStudent,
  createTeacher,
  joinSection,
  signOut,
} from '../../../shared/auth';
import {expect, test} from '../../../shared/fixtures';

import {GameLab} from './GameLab';

/**
 * Game Lab — Libraries: publish/unpublish, import/remove, teacher assignment.
 *
 * Source: dashboard/test/ui/features/star_labs/gamelab/libraries.feature
 * Migration status: see per-scenario comments.
 */

test.describe('Game Lab — Libraries', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/gamelab/libraries.feature
   * Scenario: Publishing and unpublishing a library
   * @as_student @no_mobile
   *
   * Creates a new Game Lab project, adds a minimal library function, publishes
   * it via the share dialog, verifies it appears on /projects/libraries, then
   * unpublishes and confirms the success message.
   */
  test(
    'publish and unpublish a library',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const gamelab = new GameLab(studentPage);
      const {libraryUrl} = await gamelab.publishBasicLibrary();

      await studentPage.goto('/projects/libraries');
      await expect(studentPage.locator('.ui-test-library-table')).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        studentPage
          .locator('.ui-test-library-table td')
          .filter({hasText: 'UntitledProject'}),
      ).toBeVisible({timeout: 15_000});

      await studentPage.goto(libraryUrl);
      await gamelab.waitForLabPage();
      await gamelab.openLibraryDialog();

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
   * Source: dashboard/test/ui/features/star_labs/gamelab/libraries.feature
   * Scenario: Adding and removing a library from a project
   * @no_mobile
   *
   * Student1 publishes a library. Student2 imports it by channel id, sees it
   * in the project library list, removes it, then sees the empty-state message.
   */
  test(
    'add and remove a library from a project',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page, {name: 'Student1'});
      const gamelab = new GameLab(page);
      const {channelId} = await gamelab.publishBasicLibrary();

      await createStudent(page, {name: 'Student2'});
      await gamelab.gotoNewProject();
      await gamelab.importLibraryByChannelId(channelId);

      await gamelab.openManageLibrariesDialog();
      await expect(page.locator('a', {hasText: 'UntitledProject'})).toBeVisible(
        {timeout: 30_000},
      );

      await gamelab.removeFirstLibrary();

      await gamelab.openManageLibrariesDialog();
      await expect(
        page
          .getByText('You have no libraries in your project.', {exact: false})
          .first(),
      ).toBeVisible({timeout: 15_000});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/gamelab/libraries.feature
   * Scenario: Assigning a library to a section as a teacher
   * @no_mobile
   *
   * A teacher publishes a library and assigns it to a section. A student joins
   * that section and sees the assigned class library in Game Lab's Manage
   * Libraries dialog.
   */
  test(
    'teacher assigns library to section; student sees it',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'Library_Teacher'});
      const {sectionCode} = await createSection(page);
      const gamelab = new GameLab(page);
      await gamelab.publishBasicLibrary();

      await gamelab.assignLibraryToFirstSection();

      await signOut(page);
      await createStudent(page, {name: 'Library_Student'});
      await joinSection(page, sectionCode);
      await gamelab.gotoNewProject();

      await gamelab.openManageLibrariesDialog();
      await expect(page.locator('a', {hasText: 'UntitledProject'})).toBeVisible(
        {timeout: 30_000},
      );
      await expect(
        page.getByText('Author: Library_Teacher', {exact: true}),
      ).toBeVisible();
    },
  );
});
