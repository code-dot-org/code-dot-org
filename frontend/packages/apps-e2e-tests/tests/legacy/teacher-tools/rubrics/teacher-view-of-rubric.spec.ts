import {createTeacherAssociatedStudent} from '../../../shared/auth';
import {test} from '../../../shared/fixtures';

import {TeacherViewOfRubricPage} from './TeacherViewOfRubricPage';

/**
 * Teacher View of Rubric.
 *
 * Source: dashboard/test/ui/features/teacher_tools/rubrics/teacher_view_of_rubric.feature
 */

const FEEDBACK = 'Nice work Lillian!';

test.describe('Teacher View of Rubric', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/rubrics/teacher_view_of_rubric.feature
   * Scenario: Teachers can give and send feedback on the rubric to students.
   */
  test('teacher gives rubric feedback that student receives', async ({
    page,
  }) => {
    test.slow();
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Lillian',
    });

    const teacherRubric = new TeacherViewOfRubricPage(page);
    await teacherRubric.submitStudentWork();
    await teacherRubric.openTeacherViewForStudent(pair, 'Lillian');
    await teacherRubric.openRubricDrawer();
    await teacherRubric.submitFeedback(FEEDBACK);
    await teacherRubric.expectTeacherFeedbackPersists(FEEDBACK);
    await teacherRubric.expectStudentReceivesFeedback(pair, FEEDBACK);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/rubrics/teacher_view_of_rubric.feature
   * Scenario: Teacher views rubric product tour
   */
  test('teacher views rubric product tour', async ({page}) => {
    test.slow();
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Aiden',
    });

    const teacherRubric = new TeacherViewOfRubricPage(page);
    await teacherRubric.openTeacherViewForStudent(pair, 'Aiden');
    await teacherRubric.expectProductTourStep(
      'Getting Started with Your AI Teaching Assistant',
    );
    await teacherRubric.prepareClassDataTourTarget();
    await teacherRubric.advanceTourToLastStep();
    await teacherRubric.finishTour();
    await teacherRubric.expectRestoredRubric();

    await teacherRubric.restartProductTour();
    await teacherRubric.prepareClassDataTourTarget();
    await teacherRubric.advanceTourToLastStep();
    await teacherRubric.backtrackTourToFirstStep();
    await teacherRubric.skipTour();
    await teacherRubric.expectRubricLearningGoal('Code Quality');
    await teacherRubric.expectTourDoesNotReappearAfterReload();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/rubrics/teacher_view_of_rubric.feature
   * Scenario: Teacher views Rubric and Settings tabs
   */
  test('teacher views rubric and settings tabs', async ({page}) => {
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Aiden',
    });

    const teacherRubric = new TeacherViewOfRubricPage(page);
    await teacherRubric.openTeacherViewForStudent(pair, 'Aiden');

    // Visual checkpoint from @eyes source: "floating action button icon".
    // Screenshot assertion intentionally stubbed.
    await teacherRubric.openRubricDrawer();
    // Visual checkpoint from @eyes source:
    // "rubric tab, Code Quality learning goal". Screenshot assertion intentionally stubbed.
    await teacherRubric.goToNextLearningGoal();
    // Visual checkpoint from @eyes source:
    // "rubric tab, Sprites learning goal". Screenshot assertion intentionally stubbed.
    await teacherRubric.openClassDataTab();
    // Visual checkpoint from @eyes source: "rubric settings tab".
    // Screenshot assertion intentionally stubbed.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/rubrics/teacher_view_of_rubric.feature
   * Scenario: Teacher views product tour
   */
  test('teacher views product tour visual checkpoints', async ({page}) => {
    test.slow();
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Aiden',
    });

    const teacherRubric = new TeacherViewOfRubricPage(page);
    await teacherRubric.openTeacherViewForStudent(pair, 'Aiden');

    const stepTitles = [
      'Getting Started with Your AI Teaching Assistant',
      'Class Data',
      'Understanding the AI Assessment',
      'Using Evidence',
      'Understanding AI Confidence',
      'Assigning a Rubric Score',
      'How did Your AI Teaching Assistant do?',
    ];

    await teacherRubric.expectProductTourStep(stepTitles[0]);
    // Visual checkpoint from @eyes @skip source: "product tour step 1".
    // Screenshot assertion intentionally stubbed.
    await teacherRubric.prepareClassDataTourTarget();
    for (const title of stepTitles.slice(1)) {
      await teacherRubric.nextTourStep();
      await teacherRubric.expectProductTourStep(title);
      // Visual checkpoint from @eyes @skip source: current product tour step.
      // Screenshot assertion intentionally stubbed.
    }
  });
});
