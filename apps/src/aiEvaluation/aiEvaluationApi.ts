import HttpClient from '@cdo/apps/util/HttpClient';
import {AiEvaluationTypes} from '@cdo/generated-scripts/sharedConstants';

import {OpenaiChatCompletionMessage} from '../aiTutor/chatApi';

import {
  logUserLevelEvaluation,
  logUserLevelSkillEvaluations,
} from './studentWorkEvaluationsApi';
import {UserLevelSkillEvaluation} from './types';

export interface StudentAnswer {
  studentId: number;
  studentDisplayName: string;
  studentWork: string;
  updatedAt?: string;
  codeVersion?: string;
  projectId?: string;
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

export async function evaluateFreeResponse(
  studentAnswer: StudentAnswer,
  levelId: number,
  unitId: number
): Promise<AIResponse> {
  return evaluateStudentWorkOverall(studentAnswer, levelId, unitId);
}

export async function evaluateStudentCode(
  studentAnswer: StudentAnswer,
  levelId: number,
  unitId: number,
  evaluateSkills?: boolean
): Promise<AIResponse> {
  if (evaluateSkills) {
    return evaluateStudentWorkSkills(studentAnswer, levelId, unitId);
  } else {
    return evaluateStudentWorkOverall(studentAnswer, levelId, unitId);
  }
}

async function evaluateStudentWorkOverall(
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
    const userLevelEvaluationId = await logUserLevelEvaluation(
      studentWorkSample,
      parsedResponse,
      levelId,
      unitId
    );

    parsedResponse.id = userLevelEvaluationId;
  }
  return parsedResponse;
}

async function evaluateStudentWorkSkills(
  studentWorkSample: StudentAnswer,
  levelId: number,
  unitId: number
): Promise<AIResponse> {
  const response = await evaluationFromOpenAI(
    studentWorkSample.studentWork,
    levelId,
    AiEvaluationTypes.SINGLE_STUDENT,
    true
  );
  let parsedResponse;
  if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
    const skillEvaluations: UserLevelSkillEvaluation[] =
      parsedResponse.skillEvaluations || [];
    await logUserLevelSkillEvaluations(
      skillEvaluations,
      studentWorkSample,
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
    AiEvaluationTypes.SECTION_SUMMARY
  );
  let parsedResponse;
  if (response?.content) {
    parsedResponse = JSON.parse(response?.content);
  }
  return parsedResponse;
}

const EVALUATE_URL = '/openai/evaluate';
// TODO: We'll need to write code to handle this end point
// which will return a skill-based evaluation.
const EVALUATE_SKILL_URL = '/openai/evaluate_skill';

type ValueOf<T> = T[keyof T];
type EvaluationType = ValueOf<typeof AiEvaluationTypes>;

export async function evaluationFromOpenAI(
  studentWork?: string | Record<string, string>,
  levelId?: number,
  evaluationType?: EvaluationType,
  evaluateSkill?: boolean
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

  const url = evaluateSkill ? EVALUATE_SKILL_URL : EVALUATE_URL;

  const response = await HttpClient.post(url, JSON.stringify(payload), true, {
    'Content-Type': 'application/json; charset=UTF-8',
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Error getting evaluation response');
  }
}
