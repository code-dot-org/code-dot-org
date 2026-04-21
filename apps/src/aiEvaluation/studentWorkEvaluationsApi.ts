import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {AIResponse, StudentAnswer} from './aiEvaluationApi';
import {UserLevelEvaluation, UserLevelSkillEvaluation} from './types';

export async function logUserLevelEvaluation(
  studentWorkSample: StudentAnswer,
  parsedResponse: AIResponse,
  levelId: number,
  unitId: number
) {
  const ule = await logStudentWorkEvaluation({
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
  return ule;
}

export async function logUserLevelSkillEvaluations(
  skillEvaluations: UserLevelSkillEvaluation[],
  studentWorkSample: StudentAnswer,
  levelId: number,
  unitId: number
) {
  await Promise.all(
    skillEvaluations.map(async skillEvaluation => {
      try {
        await logStudentWorkEvaluation({
          type: 'UserLevelSkillEvaluation',
          studentId: studentWorkSample.studentId,
          codeVersion: studentWorkSample.codeVersion,
          levelId: levelId,
          unitId: unitId,
          skillId: skillEvaluation.skillId,
          evaluator: 'AI',
          evaluationCriteria: skillEvaluation.evaluationCriteria,
          evaluation: skillEvaluation.evaluation,
          reasoning: skillEvaluation.reasoning,
        });
      } catch (error) {
        MetricsReporter.logError({
          event: MetricEvent.STUDENT_WORK_EVALUATION_SAVE_FAIL,
          errorMessage:
            (error as Error).message ||
            `Failed to save UserLevelSkillEvaluation for student ${studentWorkSample.studentId}, level ${levelId}, unit ${unitId}, skill ${skillEvaluation.skillId}`,
        });
      }
    })
  );
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

/**
 * Fetches existing StudentWorkEvaluations for a given user, level, and unit.
 * @param userId - The ID of the user/student.
 * @param levelId - The ID of the level.
 * @param unitId - The ID of the unit.
 * @returns A promise resolving to the most recent UserLevelEvaluation.
 */
export async function fetchMostRecentUserLevelEvaluation(
  userId: number,
  levelId: number,
  unitId: number
) {
  const response = await fetch(
    `/student_work_evaluations/${userId}/${levelId}/${unitId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
    }
  );
  if (!response.ok) {
    console.info(
      `No StudentWorkEvaluations found for user ${userId}, level ${levelId}, unit ${unitId}.`
    );
    return;
  }
  return await response.json();
}
