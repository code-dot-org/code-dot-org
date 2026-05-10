import {
  createAuthorizedTeacher,
  createSection,
  createStudent,
  joinSection,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Cached Level Page — teacher panel renders correctly on a cached (Dance) level.
 *
 * Source: dashboard/test/ui/features/teacher_tools/cached_level_page.feature
 */

test.describe('Cached Level Page', {tag: '@no_mobile'}, () => {
  /**
   * Source: cached_level_page.feature — "View cached level page as teacher"
   *
   * Authorized teacher opens a cached Dance level with ?section_id; the
   * teacher panel loads and shows the enrolled student's name.
   */
  test('teacher panel shows student on cached level page', async ({page}) => {
    const {email: teacherEmail, password: teacherPassword} =
      await createAuthorizedTeacher(page);
    const {sectionCode, sectionId} = await createSection(page);
    const {displayName: studentName} = await createStudent(page);
    await joinSection(page, sectionCode);

    await signIn(page, teacherEmail, teacherPassword);
    // Dance unit 1 lesson 1 level 13, with section_id for teacher panel.
    await page.goto(
      `/courses/dance/units/1/lessons/1/levels/13?section_id=${sectionId}&noautoplay=true`,
    );
    // #teacher-panel-container has no height (its only child has position:fixed).
    // Wait for the inner .teacher-panel to be visible instead.
    await page
      .locator('.teacher-panel')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(
      page.locator('.teacher-panel td').filter({hasText: studentName}),
    ).toBeVisible({timeout: 30_000});
  });
});
