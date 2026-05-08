import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Level Group Activity Guide level type — lesson 53 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/level_group_activity_guide.feature
 */

const LESSON_53_L1 =
  '/courses/allthethingscourse/units/1/lessons/53/levels/1?noautoplay=true';
const LESSON_53_L2 =
  '/courses/allthethingscourse/units/1/lessons/53/levels/2?noautoplay=true';

// ─── Scenario 1 — @as_student: submit activity guide and advance ──────────────

test.describe('Level group activity guide — submit and advance', () => {
  test('submit activity guide navigates to next level', async ({
    studentPage,
  }) => {
    // Source: "Submit activity guide and go to next level."
    await studentPage.goto(LESSON_53_L1);
    await studentPage
      .locator('.submitButton')
      .waitFor({state: 'visible', timeout: 30_000});

    const urlBefore = studentPage.url();
    await Promise.all([
      studentPage.waitForNavigation(),
      studentPage.locator('.submitButton').first().click(),
    ]);
    expect(studentPage.url()).not.toBe(urlBefore);
  });
});

// ─── Scenarios 2–3 — teacher-associated student: teacher views summary ────────

test.describe('Level group activity guide — teacher views summary', () => {
  async function studentSubmitAndTeacherViewSummary(
    page: import('@playwright/test').Page,
    levelUrl: string,
  ): Promise<void> {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page);

    // Student fills in the activity guide and submits.
    await page.goto(levelUrl);
    await page
      .locator('.progress-bubble.enabled')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#unchecked_0').first().click();
    await page.locator('.free-response > textarea').fill('sample response');
    await Promise.all([
      page.waitForNavigation(),
      page.locator('.submitButton').first().click(),
    ]);

    // Teacher signs in and views the student response summary.
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto(levelUrl);
    await page
      .locator('a', {hasText: 'View student responses'})
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('a', {hasText: 'View student responses'}).click();
    await expect(page).toHaveURL(/\/summary/, {timeout: 15_000});
    await page
      .locator('#summary-container')
      .waitFor({state: 'visible', timeout: 15_000});
  }

  test(
    'teacher can view student summary of responses on standard level',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Source: "Teacher can view student summary of responses."
      await studentSubmitAndTeacherViewSummary(page, LESSON_53_L1);
    },
  );

  test(
    'teacher can view student summary of responses on assessment-marked level',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Source: "Teacher can view student summary of responses on level marked as assessment"
      await studentSubmitAndTeacherViewSummary(page, LESSON_53_L2);
    },
  );
});

// ─── Scenario 4 — teacher-associated student: numbered bubbles in header ──────

test.describe('Level group activity guide — numbered header bubbles', () => {
  test('student sees level numbers for activity guide levels in header', async ({
    page,
  }) => {
    // Source: "Student can see level numbers for level group levels in header."
    await createTeacherAssociatedStudent(page);

    await page.goto(LESSON_53_L1);
    // Progress bubble numbered "1" should be enabled/visible.
    await expect(
      page.locator('.progress-bubble.enabled').filter({hasText: /^1$/}),
    ).toBeVisible({timeout: 30_000});

    await page.goto(LESSON_53_L2);
    // Progress bubble numbered "2" should be enabled/visible.
    await expect(
      page.locator('.progress-bubble.enabled').filter({hasText: /^2$/}),
    ).toBeVisible({timeout: 30_000});
  });
});
