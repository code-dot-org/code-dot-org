import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Teacher panel on the lesson extras overview and individual puzzle pages.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/lesson_extras_teacher_panel.feature
 *
 * Tagged @no_mobile.
 */

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/teacher_tools/lesson_extras_teacher_panel.feature
 * Scenario: View student lesson extras progress
 */
test(
  'teacher can view student progress on lesson extras page',
  {tag: '@no_mobile'},
  async ({page}) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {
        authorized: true,
        studentName: 'Sally',
      });
    await signIn(page, teacherEmail, teacherPassword);

    // Retrieve the teacher's first section ID from the API.
    const sectionsResp = await page.request.get('/dashboardapi/sections');
    const sections = (await sectionsResp.json()) as Array<{id: number}>;
    const sectionId = sections[0]?.id;

    // Lesson extras overview page.
    await page.goto(
      `/courses/ui-test-csf/units/1/lessons/1/extras?section_id=${sectionId}`,
    );
    await page
      .locator('#teacher-panel-container')
      .waitFor({state: 'attached', timeout: 30_000});

    expect(page.url()).toContain('section_id=');

    await page
      .locator('.uitest-sectionselect')
      .filter({hasText: 'Untitled Section'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page
      .locator('.student-table')
      .waitFor({state: 'visible', timeout: 15_000});

    // Click the first student row to navigate to their puzzle page.
    await page.locator('#teacher-panel-container tr').nth(1).click();

    // Individual puzzle page: click a sublevel card to go to the level.
    await page
      .locator('.sublevel-card-title-uitest')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('.sublevel-card-title-uitest').first().click(),
    ]);

    await page
      .locator('#teacher-panel-container')
      .waitFor({state: 'attached', timeout: 30_000});

    expect(page.url()).toContain('section_id=');
    expect(page.url()).toContain('user_id=');

    await page
      .locator('.uitest-sectionselect')
      .filter({hasText: 'Untitled Section'})
      .waitFor({state: 'visible', timeout: 15_000});

    await expect(page.locator('td').nth(1)).toContainText('Sally', {
      timeout: 15_000,
    });
  },
);
