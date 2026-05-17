import {
  assignCourseAndUnit,
  createTeacherAssociatedStudent,
} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {SubmittableLevelPage} from './SubmittableLevelPage';

test.describe(
  'Submittable level visual readiness ports',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/submittable_eyes.feature
     * Scenario: Submittable level
     */
    test('submittable multiple-choice level preserves submitted state', async ({
      page,
      eyes,
    }) => {
      await createTeacherAssociatedStudent(page, {authorized: true});
      await assignCourseAndUnit(page, 'allthethingscourse', 1);
      const submittable = new SubmittableLevelPage(page);

      await eyes.open('submittable level');
      await submittable.gotoSubmittableLevel();
      await eyes.check('initial load');
      await submittable.answerAndSubmit();
      await submittable.expectSubmittedAfterReload();
      await eyes.check('submitted puzzle');
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/submittable_eyes.feature
     * Scenario: Lockable level
     */
    test('lockable level and header progress popup render', async ({
      page,
      eyes,
    }) => {
      await createTeacherAssociatedStudent(page, {authorized: true});
      await assignCourseAndUnit(page, 'allthethingscourse', 1);
      const submittable = new SubmittableLevelPage(page);

      await eyes.open('lockable level');
      await submittable.gotoUnitOverview();
      await eyes.check('course overview');
      await submittable.gotoLockableLevel();
      await eyes.check('locked level on level page');
      await submittable.openHeaderProgressPopup();
      await eyes.check('locked level popup progress');
    });
  },
);
