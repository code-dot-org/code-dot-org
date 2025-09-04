import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {
  AiEvaluationTypes,
  AiInteractionStatus,
} from '@cdo/generated-scripts/sharedConstants';

import {logStudentWorkEvaluations} from './studentWorkEvaluationsApi';

export interface StudentAnswer {
  studentId: number;
  studentDisplayName: string;
  studentWork: string | Record<string, string>;
  codeVersion?: string;
  projectId?: string;
  updatedAt?: string;
}

export interface AIResponse {
  aiEvaluation: string;
  aiReasoning: string;
  evaluationCriteria: string;
  skillEvaluations?: [SkillBasedAIResponse];
  id: number;
}

export interface SkillBasedAIResponse extends AIResponse {
  skillId: number;
  skillKey: string;
}

export interface StudentWorkEvaluation extends StudentAnswer, AIResponse {
  levelId: number;
  unitId: number;
  id: number;
}

export async function evaluateStudentWork(
  studentWorkSample: StudentAnswer,
  levelId: number,
  unitId: number
): Promise<AIResponse> {
  const response = await evaluationFromOpenAI(
    studentWorkSample.studentWork,
    levelId,
    AiEvaluationTypes.SINGLE_STUDENT
  );
  let parsedResponse;
  if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
    const userLevelEvaluationId = await logStudentWorkEvaluations(
      studentWorkSample,
      parsedResponse,
      levelId,
      unitId
    );

    parsedResponse.id = userLevelEvaluationId;
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
// These are the possible statuses returned by ShareFiltering.find_failure
enum ShareFilterStatus {
  Email = 'email',
  Phone = 'phone',
  Address = 'address',
  Profanity = 'profanity',
}
type OpenaiChatCompletionMessage = {
  status?: ValueOf<typeof AiInteractionStatus>;
  role: Role;
  content: string;
  // Only used in case of PII or profanity violation
  flagged_content?: string;
  safety_status?: ShareFilterStatus;
};

export async function evaluationFromOpenAI(
  studentWork?: string | Record<string, string>,
  levelId?: number,
  evaluationType?: EvaluationType
): Promise<OpenaiChatCompletionMessage | null> {
  const payload = {
    studentWork:
      typeof studentWork === 'string'
        ? studentWork
        : Object.entries(studentWork || {})
            .map(([filename, contents]) => `${filename}:\n${contents}`)
            .join('\n\n'),
    levelId: levelId,
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
