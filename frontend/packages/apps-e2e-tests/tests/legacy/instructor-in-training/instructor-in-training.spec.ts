import {
  createTeacher,
  createTeacherAssociatedStudent,
  grantUniversalInstructorAccess,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {InstructorInTrainingPage} from './InstructorInTrainingPage';

/**
 * Self-Paced PL Instructor in Training visibility.
 *
 * Source features:
 *   dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature
 *   dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature
 *   dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature
 */

test.describe('Instructor in Training — universal instructor', () => {
  test.beforeEach(async ({page}) => {
    await createTeacher(page, {name: 'Universal Instructor'});
    await grantUniversalInstructorAccess(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature
   * Scenario: View Instructor In Training Applab Level as Universal Instructor
   */
  test('App Lab level shows teacher-only content without instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 1);
    await iit.waitForAppLab();
    await iit.expectTeacherOnlyLabContent('Teacher Only Content Yay!', true);
    await iit.expectNoInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature
   * Scenario: View Instructor In Training Dance Level as Universal Instructor
   */
  test('Dance level shows teacher-only content without instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 2);
    await iit.waitForDance();
    await iit.expectTeacherOnlyLabContent(
      'Some teacher only content yay!',
      false,
    );
    await iit.expectNoInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature
   * Scenario: View Instructor In Training Free Response Level as Universal Instructor
   */
  test('free-response level shows teacher-only content without instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 3);
    await iit.expectTeacherOnlyLevelContent(iit.freeResponse, [
      'The variables days, weekends, and months have the primitive data type int.',
    ]);
    await iit.expectNoInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature
   * Scenario: View Instructor In Training External Level as Universal Instructor
   */
  test('external level shows teacher-only content without instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 6);
    await iit.expectTeacherOnlyLevelContent(iit.externalLevel, [
      'Teacher only markdown content yay!',
    ]);
    await iit.expectNoInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature
   * Scenario: View Instructor In Training Bubble Choice Level as Universal Instructor
   */
  test('bubble-choice level shows teacher-only content without instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 7);
    await iit.expectTeacherOnlyLevelContent(iit.bubbleChoice, [
      'Teacher only markdown for bubble choice yay!',
    ]);
    await iit.expectNoInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature
   * Scenario: View Instructor In Training LevelGroup Level as Universal Instructor
   */
  test('level-group level shows teacher-only content without instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(2, 1);
    await iit.expectTeacherOnlyLevelContent(iit.levelGroup, [
      'Answer',
      'This assessment is designed to be used in conjunction with the unit project to assess student learning of the objectives in this unit.',
    ]);
    await iit.expectNoInstructorTag();
  });
});

test.describe('Instructor in Training — verified teacher', () => {
  test.beforeEach(async ({page}) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {
        studentName: 'Manuel',
        authorized: true,
      });
    await signIn(page, teacherEmail, teacherPassword);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature
   * Scenario: View Instructor In Training Applab Level as Verified Teacher
   */
  test('App Lab level shows teacher-only content and instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 1);
    await iit.waitForAppLab();
    await iit.expectTeacherOnlyLabContent('Teacher Only Content Yay!', true);
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature
   * Scenario: View Instructor In Training Dance Level as Verified Teacher
   */
  test('Dance level shows teacher-only content and instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 2);
    await iit.waitForDance();
    await iit.expectTeacherOnlyLabContent(
      'Some teacher only content yay!',
      false,
    );
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature
   * Scenario: View Instructor In Training Free Response Level as Verified Teacher
   */
  test('free-response level shows teacher-only content and instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 3);
    await iit.expectTeacherOnlyLevelContent(iit.freeResponse, [
      'The variables days, weekends, and months have the primitive data type int.',
    ]);
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature
   * Scenario: View Instructor In Training External Level as Verified Teacher
   */
  test('external level shows teacher-only content and instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 6);
    await iit.expectTeacherOnlyLevelContent(iit.externalLevel, [
      'Teacher only markdown content yay!',
    ]);
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature
   * Scenario: View Instructor In Training Bubble Choice Level as Verified Teacher
   */
  test('bubble-choice level shows teacher-only content and instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 7);
    await iit.expectTeacherOnlyLevelContent(iit.bubbleChoice, [
      'Teacher only markdown for bubble choice yay!',
    ]);
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature
   * Scenario: View Instructor In Training LevelGroup Level as Verified Teacher
   */
  test('level-group level shows teacher-only content and instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(2, 1);
    await iit.expectTeacherOnlyLevelContent(iit.levelGroup, [
      'Answer',
      'This assessment is designed to be used in conjunction with the unit project to assess student learning of the objectives in this unit.',
    ]);
    await iit.expectInstructorTag();
  });
});

test.describe('Instructor in Training — unverified teacher', () => {
  test.beforeEach(async ({page}) => {
    await createTeacher(page, {name: 'Ms_Frizzle'});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature
   * Scenario: View Instructor In Training Applab Level as Unverified Teacher
   */
  test('App Lab level hides teacher-only content and shows instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 1);
    await iit.waitForAppLab();
    await iit.expectNoTeacherOnlyLabTab();
    await iit.expectInstructorTag();
    await expect(
      page.getByRole('link', {name: 'Example Solution 1'}),
    ).toBeHidden();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature
   * Scenario: View Instructor In Training Dance Level as Unverified Teacher
   */
  test('Dance level hides teacher-only content and shows instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 2);
    await iit.waitForDance();
    await iit.expectNoTeacherOnlyLabTab();
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature
   * Scenario: View Instructor In Training Free Response Level as Unverified Teacher
   */
  test('free-response level hides teacher-only content and shows instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 3);
    await expect(iit.submitButton).toBeVisible({timeout: 45_000});
    await iit.expectNoTeacherOnlyLevelContent(iit.freeResponse);
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature
   * Scenario: View Instructor In Training External Level as Unverified Teacher
   */
  test('external level hides teacher-only content and shows instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 6);
    await expect(iit.submitButton).toBeVisible({timeout: 45_000});
    await iit.expectNoTeacherOnlyLevelContent(iit.externalLevel);
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature
   * Scenario: View Instructor In Training Bubble Choice Level as Unverified Teacher
   */
  test('bubble-choice level hides teacher-only content and shows instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(1, 7);
    await iit.expectNoTeacherOnlyLevelContent(iit.bubbleChoicePrompt);
    await iit.expectInstructorTag();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature
   * Scenario: View Instructor In Training LevelGroup Level as Unverified Teacher
   */
  test('level-group level hides teacher-only content and shows instructor tag', async ({
    page,
  }) => {
    const iit = new InstructorInTrainingPage(page);

    await iit.gotoLevel(2, 1);
    await iit.expectNoTeacherOnlyLevelContent(iit.levelGroup);
    await iit.expectInstructorTag();
  });
});
