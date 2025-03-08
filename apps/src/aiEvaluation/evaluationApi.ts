import HttpClient from '@cdo/apps/util/HttpClient';
import {OpenaiChatCompletionMessage} from '../aiTutor/chatApi';
import {logUserLevelEvaluation} from './userLevelEvaluations/userLevelEvaluationsApi';
import {AiFeatures} from '@cdo/generated-scripts/sharedConstants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

const EVALUATE_URL = '/openai/evaluate';

interface StudentWorkSample {
  studentId: number;
  studentDisplayName: string;
  studentWork: string;
  levelId: number;
  unitId: number;
}
export async function evaluateStudentWork(
  studentWorkSample: StudentWorkSample
): Promise<string> {
  const response = await evaluationFromOpenAI(
    studentWorkSample.studentWork,
    studentWorkSample.levelId,
    studentWorkSample.unitId
  );
  const aiEvaluation = response?.content;
  console.log('from evaluationApi', aiEvaluation);
  if (aiEvaluation) {
    logUserLevelEvaluation({
      userId: studentWorkSample.studentId,
      levelId: studentWorkSample.levelId,
      unitId: 1,
      evaluationCriteria: 'AI evaluation',
      aiEvaluation: aiEvaluation,
      aiReasoning: 'AI evaluation',
    });
    return aiEvaluation;
  }
  return '';
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
    throw new Error('Error getting chat completion response');
  }
}
