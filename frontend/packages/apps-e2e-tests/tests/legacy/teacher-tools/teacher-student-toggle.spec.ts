import {
  assignSectionToCourseAndUnit,
  createTeacherAssociatedStudent,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {TeacherStudentTogglePage} from './TeacherStudentTogglePage';

test.describe('Teacher student toggle', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_student_toggle.feature
   * Scenario: Toggle on Multi Level
   */
  test('toggle on multi level', async ({page, eyes}) => {
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Daenerys',
    });
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.goto('/');
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const toggle = new TeacherStudentTogglePage(page);

    await eyes.open('toggle on multi level');
    await toggle.openMultiLevel(pair.sectionId);
    await eyes.check('page load');
    await toggle.switchToStudentView();
    await toggle.expectMultiLevelVisualReady();
    await eyes.check('view as student');
    await toggle.switchToTeacherView();
    await toggle.expectMultiLevelVisualReady();
    await toggle.expectTeacherPanelLevelSummaryReady();
    await eyes.check('view as teacher');
    await toggle.openProgressDropdown();
    await eyes.checkLocator(
      toggle.progressDropdownPanel,
      'progress dropdown for teacher',
    );

    await toggle.openFirstStudentFromPanel();
    await toggle.openProgressDropdown();
    await expect(
      page.locator('.user-stats-block', {hasText: 'Jigsaw'}),
    ).toBeVisible({timeout: 30_000});
    await eyes.checkLocator(
      toggle.progressDropdownPanel,
      'progress dropdown for teacher viewing as student',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_student_toggle.feature
   * Scenario: Toggle on Hidden Maze Level
   */
  test('toggle on hidden maze level', async ({page, eyes}) => {
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Arya',
    });
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.goto('/');
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const toggle = new TeacherStudentTogglePage(page);

    await eyes.open('toggle on hidden maze level');
    await toggle.openHiddenMazeLevel(pair.sectionId);
    await eyes.checkLocator(toggle.teacherPanel, 'page load');
    await toggle.switchToStudentView();
    await eyes.check('view as student');
    await toggle.switchToTeacherView();
    await eyes.checkLocator(toggle.teacherPanel, 'view as teacher');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_student_toggle.feature
   * Scenario: Toggle on Lockable Level
   */
  test('toggle on lockable level', async ({page, eyes}) => {
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Joffrey',
    });
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.goto('/');
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const toggle = new TeacherStudentTogglePage(page);

    await eyes.open('toggle on a lockable level');
    await toggle.openLockableLevel(pair.sectionId);
    await eyes.check('page load');
    await toggle.switchToStudentView();
    await expect(toggle.lockedLesson).toBeVisible({timeout: 30_000});
    await eyes.checkViewport('view as student while locked');
    await toggle.switchToTeacherView();
    await expect(toggle.lockedLesson).toBeHidden();
    await expect(toggle.levelGroup).toBeVisible();
    await eyes.check('view as teacher while locked');

    await toggle.openFirstStudentFromPanel();
    await expect(page.locator('#level-body')).toContainText(
      'This survey is anonymous',
      {timeout: 30_000},
    );
    await expect(toggle.lockedLesson).toBeHidden();
    await expect(toggle.levelGroup).toBeHidden();

    await toggle.unlockLessonForStudents(pair.sectionId);
    await toggle.openLockableLevel(pair.sectionId);
    await toggle.switchToStudentView();
    await expect(toggle.lockedLesson).toBeHidden();
    await expect(page.getByRole('heading', {name: /Pre-survey/})).toBeVisible({
      timeout: 30_000,
    });
    await eyes.check('view as student while unlocked');
    await toggle.switchToTeacherView();
    await expect(toggle.lockedLesson).toBeHidden();

    await toggle.openFirstStudentFromPanel();
    await expect(page.locator('#level-body')).toContainText(
      'This survey is anonymous',
      {timeout: 30_000},
    );
    await expect(toggle.lockedLesson).toBeHidden();
    await expect(toggle.levelGroup).toBeHidden();
  });
});
