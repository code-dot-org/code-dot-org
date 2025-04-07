import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {AIResponse, StudentAnswer} from './aiEvaluationApi';
import {UserLevelEvaluation, UserLevelSkillEvaluation} from './types';

export async function logStudentWorkEvaluations(
  studentWorkSample: StudentAnswer,
  parsedResponse: AIResponse,
  levelId: number,
  unitId: number
) {
  logStudentWorkEvaluation({
    type: 'UserLevelEvaluation',
    studentId: studentWorkSample.studentId,
    codeVersion: studentWorkSample.codeVersion,
    levelId: levelId,
    unitId: unitId,
    evaluator: 'AI',
    evaluationCriteria: parsedResponse.evaluationCriteria,
    evaluation: parsedResponse.aiEvaluation,
    reasoning: parsedResponse.aiReasoning,
  });
  // For each specific skill-based evaluation, log a UserLevelSkillEvaluation
  if (parsedResponse.skillEvaluations) {
    parsedResponse.skillEvaluations.forEach((skillEvaluation: AIResponse) => {
      logStudentWorkEvaluation({
        type: 'UserLevelSkillEvaluation',
        studentId: studentWorkSample.studentId,
        levelId: levelId,
        unitId: unitId,
        evaluator: 'AI',
        evaluationCriteria: skillEvaluation.evaluationCriteria,
        evaluation: skillEvaluation.aiEvaluation,
        reasoning: skillEvaluation.aiReasoning,
      });
    });
    // TODO: Log an EvaulationSummary associating the UserLevelSkillEvaluation with the UserLevelEvaluation
  }
}

type StudentWorkEvaluation = UserLevelEvaluation | UserLevelSkillEvaluation;

export async function logStudentWorkEvaluation(
  evaluationData: StudentWorkEvaluation
) {
  try {
    const response = await fetch('/student_work_evaluations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(evaluationData),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to save StudentWorkEvaluation of type ${evaluationData.type}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.STUDENT_WORK_EVALUATION_SAVE_FAIL,
      errorMessage:
        (error as Error).message ||
        `Failed to save StudentWorkEvaluation of type ${evaluationData.type}`,
    });
  }
}
