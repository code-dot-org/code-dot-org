import {createTeacherAssociatedStudent} from '../../../shared/auth';
import {test} from '../../../shared/fixtures';

import {AiEvaluateStudentCodePage} from './AiEvaluateStudentCodePage';

/**
 * AI Evaluation of Student Code Against Rubrics.
 *
 * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature
 *
 * AI evaluation is stubbed via /api/test/ai_proxy/assessment in test env.
 * Source feature is tagged @no_firefox.
 */

const STUDENT_NAME = 'Aiden';

test.describe(
  'AI Evaluation of Student Code',
  {tag: ['@no_mobile', '@no_firefox']},
  () => {
    test.beforeEach(({browserName}) => {
      test.skip(
        browserName === 'firefox',
        'Source Cucumber feature is @no_firefox: dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature',
      );
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature
     * Scenario: Validate Rubric AI Config
     */
    test('validates rubric AI config', async ({browserName, page}) => {
      test.skip(
        browserName !== 'chromium',
        'Source Cucumber scenario is @chrome: Validate Rubric AI Config',
      );

      const aiEvaluate = new AiEvaluateStudentCodePage(page);
      await aiEvaluate.validateRubricAiConfig();
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature
     * Scenario: Student code is evaluated by AI when student submits project
     */
    test('AI evaluates code automatically on student submit', async ({
      page,
    }) => {
      test.slow();
      const {teacherEmail, teacherPassword, sectionId} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: STUDENT_NAME,
        });

      const aiEvaluate = new AiEvaluateStudentCodePage(page);
      await aiEvaluate.gotoStudentHome();
      await aiEvaluate.gotoRubricLevel();
      await aiEvaluate.expectHeaderProgress(2, 'not_tried');

      await aiEvaluate.appendRubricSampleCode();
      await aiEvaluate.submitGamelabLevel();

      await aiEvaluate.teacherViewStudentWork(
        teacherEmail,
        teacherPassword,
        STUDENT_NAME,
        sectionId,
      );
      await aiEvaluate.dismissProductTourIfPresent();
      await aiEvaluate.openRubricPanel();
      await aiEvaluate.expectAutomaticEvaluationComplete();
      await aiEvaluate.expectSpritesEvaluationResult(STUDENT_NAME);
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature
     * Scenario: Student code is evaluated by AI when teacher requests individual evaluation
     */
    test('teacher triggers individual AI evaluation', async ({page}) => {
      test.slow();
      const {teacherEmail, teacherPassword, sectionId} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: STUDENT_NAME,
        });

      const aiEvaluate = new AiEvaluateStudentCodePage(page);
      await aiEvaluate.gotoStudentHome();
      await aiEvaluate.gotoRubricLevel();
      await aiEvaluate.expectHeaderProgress(2, 'not_tried');

      await aiEvaluate.appendRubricSampleCode();
      await aiEvaluate.runAndWaitForSaved();

      await aiEvaluate.teacherViewStudentWork(
        teacherEmail,
        teacherPassword,
        STUDENT_NAME,
        sectionId,
      );
      await aiEvaluate.dismissProductTourIfPresent();
      await aiEvaluate.openRubricPanel();
      await aiEvaluate.expectManualEvaluationReady();
      await aiEvaluate.runIndividualAiEvaluation();
      await aiEvaluate.expectSpritesEvaluationResult(STUDENT_NAME);
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature
     * Scenario: Student code is evaluated by AI when teacher requests evaluation for entire class
     */
    test('teacher triggers class-wide AI evaluation', async ({page}) => {
      test.slow();
      const {teacherEmail, teacherPassword, sectionId} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: STUDENT_NAME,
        });

      const aiEvaluate = new AiEvaluateStudentCodePage(page);
      await aiEvaluate.gotoStudentHome();
      await aiEvaluate.gotoRubricLevel();
      await aiEvaluate.expectHeaderProgress(2, 'not_tried');

      await aiEvaluate.appendRubricSampleCode();
      await aiEvaluate.runAndWaitForSaved();

      await aiEvaluate.teacherViewStudentWork(
        teacherEmail,
        teacherPassword,
        STUDENT_NAME,
        sectionId,
      );
      await aiEvaluate.dismissProductTourIfPresent();
      await aiEvaluate.openRubricPanel();
      await aiEvaluate.expectManualEvaluationReady();
      await aiEvaluate.runClassWideAiEvaluation();
      await aiEvaluate.expectSpritesEvaluationResult(STUDENT_NAME);
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature
     * Scenario: Alerts are shown when AI scores are available to review
     */
    test('dismissible alert appears when AI scores ready and persists dismissed', async ({
      page,
    }) => {
      test.slow();
      const {teacherEmail, teacherPassword, sectionId} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: STUDENT_NAME,
        });

      const aiEvaluate = new AiEvaluateStudentCodePage(page);
      await aiEvaluate.gotoStudentHome();
      await aiEvaluate.gotoRubricLevel();
      await aiEvaluate.expectHeaderProgress(2, 'not_tried');

      await aiEvaluate.appendRubricSampleCode();
      await aiEvaluate.submitGamelabLevel();

      await aiEvaluate.teacherViewStudentWork(
        teacherEmail,
        teacherPassword,
        STUDENT_NAME,
        sectionId,
      );
      await aiEvaluate.dismissProductTourIfPresent();
      await aiEvaluate.dismissAiScoresReadyAlertAndExpectPersistence();

      // Visual checkpoint from the @eyes duplicate scenario:
      // "Ai alerts on rubrics". Screenshot assertion intentionally stubbed.
    });
  },
);
