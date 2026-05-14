import {createTeacherAssociatedStudent} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {MultiSubmittablePage} from './MultiSubmittablePage';

/**
 * Submittable multi-choice level — lesson 9 level 3 of allthethingscourse.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/multi_submittable.feature
 *
 * All scenarios tagged @no_mobile and @as_taught_student.
 */

test.describe('Submittable multi-choice — lesson 9 level 3', () => {
  test.beforeEach(async ({page}) => {
    await createTeacherAssociatedStudent(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/multi_submittable.feature
   * Scenario: Loading the level
   */
  test(
    'loading the level shows the question',
    {tag: '@no_mobile'},
    async ({page}) => {
      const level = new MultiSubmittablePage(page);
      await level.goto();
      await level.expectQuestion();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/multi_submittable.feature
   * Scenario: Submit anything, unsubmit, be able to resubmit.
   */
  test(
    'submit, unsubmit, and resubmit cycle restores editable state',
    {tag: '@no_mobile'},
    async ({page}) => {
      const level = new MultiSubmittablePage(page);
      await level.goto();
      await level.expectSubmitDisabled();
      await level.selectAnswer(2);
      await level.submit();
      await level.reloadAndExpectUnsubmitState();
      await level.unsubmit();
      await level.expectEditableSubmitState();
    },
  );
});
