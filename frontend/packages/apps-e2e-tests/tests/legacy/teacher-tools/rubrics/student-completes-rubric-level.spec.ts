import {
  addUserToExperiment,
  createTeacherAssociatedStudent,
} from '../../../shared/auth';
import {test} from '../../../shared/fixtures';

import {AiEvaluateStudentCodePage} from './AiEvaluateStudentCodePage';

/**
 * Student Completing a Rubric-Enabled Level.
 *
 * Source: dashboard/test/ui/features/teacher_tools/rubrics/student_completes_rubric_level.feature
 */

test.describe('Student Completing Rubric Level', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/rubrics/student_completes_rubric_level.feature
   * Scenario: Student of verified teacher can complete rubric-enabled level
   */
  test('student of verified teacher can complete rubric-enabled level', async ({
    page,
  }) => {
    test.slow();
    await createTeacherAssociatedStudent(page, {authorized: true});

    const rubricLevel = new AiEvaluateStudentCodePage(page);
    await rubricLevel.gotoStudentHome();
    await rubricLevel.gotoRubricLevel();
    await rubricLevel.expectHeaderProgress(2, 'not_tried');

    await rubricLevel.appendRubricSampleCode();
    await rubricLevel.submitGamelabLevel();

    await rubricLevel.gotoRubricLevel();
    await rubricLevel.expectHeaderProgress(2, 'perfect_assessment');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/rubrics/student_completes_rubric_level.feature
   * Scenario: Student of unverified teacher can complete rubric-enabled level
   */
  test('student in non-ai-rubrics experiment can complete rubric-enabled level', async ({
    page,
  }) => {
    test.slow();
    await createTeacherAssociatedStudent(page);
    await addUserToExperiment(page, 'non-ai-rubrics');

    const rubricLevel = new AiEvaluateStudentCodePage(page);
    await rubricLevel.gotoStudentHome();
    await rubricLevel.gotoRubricLevel();
    await rubricLevel.expectHeaderProgress(2, 'not_tried');

    await rubricLevel.appendRubricSampleCode();
    await rubricLevel.submitGamelabLevel();

    await rubricLevel.gotoRubricLevel();
    await rubricLevel.expectHeaderProgress(2, 'perfect_assessment');
  });
});
