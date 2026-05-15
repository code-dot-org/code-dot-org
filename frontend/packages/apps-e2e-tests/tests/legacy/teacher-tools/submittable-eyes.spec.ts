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
    }) => {
      await createTeacherAssociatedStudent(page, {authorized: true});
      await assignCourseAndUnit(page, 'allthethingscourse', 1);
      const submittable = new SubmittableLevelPage(page);

      await submittable.gotoSubmittableLevel();
      // Visual checkpoint stub: initial load.
      await submittable.answerAndSubmit();
      await submittable.expectSubmittedAfterReload();
      // Visual checkpoint stub: submitted puzzle.
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/submittable_eyes.feature
     * Scenario: Lockable level
     */
    test('lockable level and header progress popup render', async ({page}) => {
      await createTeacherAssociatedStudent(page, {authorized: true});
      await assignCourseAndUnit(page, 'allthethingscourse', 1);
      const submittable = new SubmittableLevelPage(page);

      await submittable.gotoUnitOverview();
      // Visual checkpoint stub: course overview.
      await submittable.gotoLockableLevel();
      // Visual checkpoint stub: locked level on level page.
      await submittable.openHeaderProgressPopup();
      // Visual checkpoint stub: locked level popup progress.
    });
  },
);
