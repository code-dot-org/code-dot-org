import HttpClient from '@cdo/apps/util/HttpClient';
import {AiEvaluationTypes} from '@cdo/generated-scripts/sharedConstants';

import {OpenaiChatCompletionMessage} from '../aiTutor/chatApi';

import {logStudentWorkEvaluations} from './studentWorkEvaluationsApi';

export interface StudentAnswer {
  studentId: number;
  studentDisplayName: string;
  studentWork: string;
  codeVersion?: string;
}

export interface AIResponse {
  aiEvaluation: string;
  aiReasoning: string;
  evaluationCriteria: string;
  skillEvaluations?: [AIResponse];
}

export interface StudentWorkEvaluation extends StudentAnswer, AIResponse {}

export async function evaluateStudentWork(
  studentWorkSample: StudentAnswer,
  levelId: number,
  unitId: number
): Promise<AIResponse> {
  const response = await evaluationFromOpenAI(
    studentWorkSample.studentWork,
    levelId,
    unitId,
    AiEvaluationTypes.SINGLE_STUDENT
  );
  let parsedResponse;
  if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
    logStudentWorkEvaluations(
      studentWorkSample,
      parsedResponse,
      levelId,
      unitId
    );
  }
  return parsedResponse;
}

export async function summarizeEvaluations(
  studentWorkEvaluations: StudentWorkEvaluation[],
  levelId: number,
  unitId: number
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
    AiEvaluationTypes.SECTION_SUMMARY
  );
  let parsedResponse;
  if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
  }
  return parsedResponse;
}

const EVALUATE_URL = '/openai/evaluate';

type ValueOf<T> = T[keyof T];
type EvaluationType = ValueOf<typeof AiEvaluationTypes>;

async function evaluationFromOpenAI(
  studentWork?: string,
  levelId?: number,
  unitId?: number,
  evaluationType?: EvaluationType
): Promise<OpenaiChatCompletionMessage | null> {
  const payload = {
    studentWork: studentWork,
    levelId: levelId,
    unitId: unitId,
    evaluationType: evaluationType,
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
