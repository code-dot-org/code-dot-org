import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiFeatures} from '@cdo/generated-scripts/sharedConstants';

import {OpenaiChatCompletionMessage} from '../aiTutor/chatApi';

import {logUserLevelEvaluation} from './userLevelEvaluations/userLevelEvaluationsApi';

interface StudentWorkSample {
  studentId: number;
  studentDisplayName: string;
  studentWork: string;
  levelId: number;
  unitId: number;
}

interface AIResponse {
  ai_evaluation: string;
  ai_reasoning: string;
}

export async function evaluateStudentWork(
  studentWorkSample: StudentWorkSample
): Promise<AIResponse> {
  const response = await evaluationFromOpenAI(
    studentWorkSample.studentWork,
    studentWorkSample.levelId,
    studentWorkSample.unitId
  );
  let parsedResponse;

  console.log('response', response);

  if (response?.safety_status) {
    parsedResponse = {
      ai_evaluation: 'Error',
      ai_reasoning: response.safety_status,
    };
  } else if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
    logUserLevelEvaluation({
      userId: studentWorkSample.studentId,
      levelId: studentWorkSample.levelId,
      unitId: studentWorkSample.unitId,
      evaluationCriteria: parsedResponse.evaluation_criteria,
      aiEvaluation: parsedResponse.ai_evaluation,
      aiReasoning: parsedResponse.ai_reasoning,
    });
  }
  return parsedResponse;
}

const CHAT_COMPLETION_URL = '/openai/chat_completion';

export async function evaluationFromOpenAI(
  studentWork?: string,
  levelId?: number,
  unitId?: number
): Promise<OpenaiChatCompletionMessage | null> {
  const payload = {
    messages: [{role: Role.USER, content: studentWork}],
    levelId: levelId,
    unitId: unitId,
    feature: AiFeatures.EVALUATION,
  };

  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Error getting evaluation response');
  }
}
