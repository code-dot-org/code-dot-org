import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import HttpClient from '@cdo/apps/util/HttpClient';

import {OpenaiChatCompletionMessage} from '../aiTutor/chatApi';

import {logUserLevelEvaluation} from './userLevelEvaluations/userLevelEvaluationsApi';

export interface StudentAnswer {
  studentId: number;
  studentDisplayName: string;
  studentWork: string;
  codeVersion?: string;
}

export interface AIResponse {
  aiEvaluation: string;
  aiReasoning: string;
}

export interface StudentWorkEvaluation extends StudentAnswer, AIResponse {}

export async function evaluateStudentWork(
  studentWorkSample: StudentAnswer,
  levelId: number,
  unitId: number,
  systemPrompt?: string
): Promise<AIResponse> {
  const response = await evaluationFromOpenAI(
    studentWorkSample.studentWork,
    levelId,
    unitId,
    systemPrompt
  );
  let parsedResponse;
  if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
    logUserLevelEvaluation({
      userId: studentWorkSample.studentId,
      levelId: levelId,
      unitId: unitId,
      evaluationCriteria: parsedResponse.evaluationCriteria,
      aiEvaluation: parsedResponse.aiEvaluation,
      aiReasoning: parsedResponse.aiReasoning,
      codeVersion: studentWorkSample.codeVersion,
    });
  }
  return parsedResponse;
}

export async function summarizeEvaluations(
  studentWorkEvaluations: StudentWorkEvaluation[],
  levelId: number,
  unitId: number,
  systemPrompt?: string
): Promise<AIResponse> {
  const formattedStudentWork = studentWorkEvaluations
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

const EVALUATE_URL = '/openai/evaluate';

async function evaluationFromOpenAI(
  studentWork?: string,
  levelId?: number,
  unitId?: number,
  systemPrompt?: string
): Promise<OpenaiChatCompletionMessage | null> {
  const payload = {
    studentWork: [{role: Role.USER, content: studentWork}],
    levelId: levelId,
    unitId: unitId,
    systemPrompt: systemPrompt,
  };

  const response = await HttpClient.post(
    EVALUATE_URL,
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
