import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiFeatures} from '@cdo/generated-scripts/sharedConstants';

import {OpenaiChatCompletionMessage} from '../aiTutor/chatApi';

import {logUserLevelEvaluation} from './userLevelEvaluations/userLevelEvaluationsApi';

export interface StudentAnswer {
  studentId: number;
  studentDisplayName: string;
  studentWork: string;
}

interface AIResponse {
  aiEvaluation: string;
  aiReasoning: string;
}

export interface StudentWorkEvaluation extends StudentAnswer, AIResponse {}

export async function evaluateStudentWork(
  studentWorkSample: StudentAnswer,
  levelId: number,
  unitId: number
): Promise<AIResponse> {
  console.log('evaluateStudentWork was called from the API');
  const response = await evaluationFromOpenAI(
    studentWorkSample.studentWork,
    levelId,
    unitId
  );
  console.log('response in evaluateStudentWork', response);
  let parsedResponse;
  if (response?.safety_status) {
    parsedResponse = {
      aiEvaluation: 'Error',
      aiReasoning: response.safety_status,
    };
  } else if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
    logUserLevelEvaluation({
      userId: studentWorkSample.studentId,
      levelId: levelId,
      unitId: unitId,
      evaluationCriteria: parsedResponse.evaluationCriteria,
      aiEvaluation: parsedResponse.aiEvaluation,
      aiReasoning: parsedResponse.aiReasoning,
    });
  }
  return parsedResponse;
}

export async function summarizeSectionEvaluations(
  studentWorkEvaluations: StudentWorkEvaluation[],
  levelId: number,
  unitId: number,
  systemPrompt?: string
): Promise<AIResponse> {
  const cleanStudentWork = studentWorkEvaluations.filter(
    evaluation => evaluation.aiEvaluation !== 'Error'
  );
  const formattedStudentWork = cleanStudentWork
    .map(
      evaluation =>
        `${evaluation.studentDisplayName} answered ${evaluation.studentWork}. The AI evaluated this as ${evaluation.aiEvaluation}, because ${evaluation.aiReasoning}.`
    )
    .join(' ');
  const response = await evaluationFromOpenAI(
    formattedStudentWork,
    levelId,
    unitId,
    systemPrompt
  );
  let parsedResponse;
  if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
  }
  return parsedResponse;
}

const CHAT_COMPLETION_URL = '/openai/chat_completion';

async function evaluationFromOpenAI(
  studentWork?: string,
  levelId?: number,
  unitId?: number,
  systemPrompt?: string
): Promise<OpenaiChatCompletionMessage | null> {
  console.log('studentWork in evaluationFromOpenAI', studentWork);
  console.log('evaluationFromOpenAI was called');
  const payload = {
    messages: [{role: Role.USER, content: studentWork}],
    levelId: levelId,
    unitId: unitId,
    feature: AiFeatures.EVALUATION,
    systemPrompt: systemPrompt,
  };

  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  console.log('response in evaluationApi.ts', response);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Error getting evaluation response');
  }
}
