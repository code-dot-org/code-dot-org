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
  test('toggle on multi level', async ({page}) => {
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Daenerys',
    });
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.goto('/');
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const toggle = new TeacherStudentTogglePage(page);

    await toggle.openMultiLevel(pair.sectionId);
    // Visual checkpoint stub: page load.
    await toggle.switchToStudentView();
    // Visual checkpoint stub: view as student.
    await toggle.switchToTeacherView();
    // Visual checkpoint stub: view as teacher.
    await toggle.openProgressDropdown();
    // Visual checkpoint stub: progress dropdown for teacher.

    await toggle.openFirstStudentFromPanel();
    await toggle.openProgressDropdown();
    await expect(
      page.locator('.user-stats-block', {hasText: 'Jigsaw'}),
    ).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: progress dropdown for teacher viewing as student.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_student_toggle.feature
   * Scenario: Toggle on Hidden Maze Level
   */
  test('toggle on hidden maze level', async ({page}) => {
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Arya',
    });
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.goto('/');
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const toggle = new TeacherStudentTogglePage(page);

    await toggle.openHiddenMazeLevel(pair.sectionId);
    // Visual checkpoint stub: page load.
    await toggle.switchToStudentView();
    // Visual checkpoint stub: view as student.
    await toggle.switchToTeacherView();
    // Visual checkpoint stub: view as teacher.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_student_toggle.feature
   * Scenario: Toggle on Lockable Level
   */
  test('toggle on lockable level', async ({page}) => {
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Joffrey',
    });
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.goto('/');
    await assignSectionToCourseAndUnit(page, 0, 'allthethingscourse', 1);
    const toggle = new TeacherStudentTogglePage(page);

    await toggle.openLockableLevel(pair.sectionId);
    // Visual checkpoint stub: page load.
    await toggle.switchToStudentView();
    await expect(toggle.lockedLesson).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: view as student while locked.
    await toggle.switchToTeacherView();
    await expect(toggle.lockedLesson).toBeHidden();
    await expect(toggle.levelGroup).toBeVisible();
    // Visual checkpoint stub: view as teacher while locked.

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
    // Visual checkpoint stub: view as student while unlocked.
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
