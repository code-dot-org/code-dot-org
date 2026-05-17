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
    async ({page, eyes}) => {
      await createTeacher(page, {name: 'Ms_Frizzle'});
      const lessonPlan = new TeacherLessonPlanPage(page);

      await eyes.open('teacher lesson plan');
      await lessonPlan.openLesson(1);
      await lessonPlan.expectAnnouncements();
      await lessonPlan.expectLessonTitle('Lesson 1: First Lesson');
      await lessonPlan.expectFirstLessonSections();
      await eyes.check('teacher lesson plan');

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
  test('level details dialogs', {tag: '@no_mobile'}, async ({page, eyes}) => {
    await createTeacher(page, {name: 'Prof_Dumbledore'});
    const lessonPlan = new TeacherLessonPlanPage(page);

    await eyes.open('level details dialog');
    await lessonPlan.openLesson(5);
    await lessonPlan.openLevelDetails(0);
    await eyes.check('bubble choice preview');
    await lessonPlan.dismissLevelDetails();

    await lessonPlan.openLevelDetails(1);
    await eyes.check('standalone video preview');
    await lessonPlan.dismissLevelDetails();

    await lessonPlan.openLevelDetails(2);
    await eyes.check('level instructions preview');
    await lessonPlan.dismissLevelDetails();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/lesson_show.feature
   * Scenario: Print Mode
   */
  test('print mode renders lesson overview', async ({page, eyes}) => {
    const lessonPlan = new TeacherLessonPlanPage(page);
    await eyes.open('printed lesson plan');
    await lessonPlan.openPrintModeLesson();
    await eyes.check('initial page view');
  });
});
