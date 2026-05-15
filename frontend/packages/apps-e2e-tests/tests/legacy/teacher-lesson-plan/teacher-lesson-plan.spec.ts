import {createTeacher} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {TeacherLessonPlanPage} from './TeacherLessonPlanPage';

test.describe('Teacher lesson plan', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_lesson_plan.feature
   * Scenario: Viewing Teacher Lesson Plan
   */
  test(
    'content sections and lesson navigation',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'Ms_Frizzle'});
      const lessonPlan = new TeacherLessonPlanPage(page);

      await lessonPlan.openLesson(1);
      await lessonPlan.expectAnnouncements();
      await lessonPlan.expectLessonTitle('Lesson 1: First Lesson');
      await lessonPlan.expectFirstLessonSections();
      // Visual checkpoint stub: teacher lesson plan.

      await lessonPlan.collapseDiscussionGoal();
      await lessonPlan.openLevelDetails(0);
      await lessonPlan.dismissLevelDetails();

      await lessonPlan.navigateToSecondLesson();
      await lessonPlan.navigateToUnitOverview();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_lesson_plan.feature
   * Scenario: Viewing Level Details Dialogs
   */
  test('level details dialogs', {tag: '@no_mobile'}, async ({page}) => {
    await createTeacher(page, {name: 'Prof_Dumbledore'});
    const lessonPlan = new TeacherLessonPlanPage(page);

    await lessonPlan.openLesson(5);
    await lessonPlan.openLevelDetails(0);
    // Visual checkpoint stub: bubble choice preview.
    await lessonPlan.dismissLevelDetails();

    await lessonPlan.openLevelDetails(1);
    // Visual checkpoint stub: standalone video preview.
    await lessonPlan.dismissLevelDetails();

    await lessonPlan.openLevelDetails(2);
    // Visual checkpoint stub: level instructions preview.
    await lessonPlan.dismissLevelDetails();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_show.feature
   * Scenario: Print Mode
   */
  test('print mode renders lesson overview', async ({page}) => {
    const lessonPlan = new TeacherLessonPlanPage(page);
    await lessonPlan.openPrintModeLesson();
    // Visual checkpoint stub: "initial page view".
  });
});
