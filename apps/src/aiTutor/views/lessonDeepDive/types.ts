import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

import {ResponseValidator} from '../../../util/HttpClient';

export type AssessmentQuestionResult = {
  level_id: number;
  script_level_id: number;
  attempts: number;
  correct: boolean;
  evaluation?: string;
};

export type LessonProgressCounts = {
  levelsTotalCount: number;
  levelsAttemptedCount: number;
  validatedLevelsTotalCount: number;
  validatedLevelsCorrectCount: number;
  validatedLevelsIncorrectCount: number;
};

export type ReflectionValue =
  (typeof LessonObjectiveReflectionValues)[keyof typeof LessonObjectiveReflectionValues];

export type ReflectionData = {
  objectiveReflections: Record<string, ReflectionValue>;
  success: string;
  struggle: string;
};

export type JsonVideoData = {
  key: string;
  url: string;
  description: string;
};

export type LessonDeepDiveData = {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: {id: string; word: string; definition: string}[];
  objectives: {id: string; description: string}[];
  assessmentAnalysis: AssessmentQuestionResult[];
  jsonVideos: JsonVideoData[];
  practiceProblems: PracticeProblem[];
  progressCounts: LessonProgressCounts;
  timeSpentSeconds: number;
  unitLabel: string | null;
  nextLessonUrl: string | null;
};

export type MultiSolution = {
  option: string;
  correct: boolean;
};

export type ScrambleSolution = {
  option: string;
  correct: number;
};

export type MatchSolution = {
  option: string;
  correct: string;
};

export type PracticeProblem = {
  id: number;
  type: string;
  active: boolean;
  problem_text: string;
  solution: (MultiSolution | ScrambleSolution | MatchSolution)[];
};

type ServerPracticeProblem = {
  id: number;
  key: string;
  problem_type: string;
  active: boolean;
  problem_text: string;
  solution: (MultiSolution | ScrambleSolution | MatchSolution)[];
  objectives: {id: number; description: string}[];
  created_at: string;
  updated_at: string;
};

export type UserPracticeProblemAttempt = {
  id: number;
  practice_problem_id: number;
};

export const userPracticeProblemAttemptValidator: ResponseValidator<
  UserPracticeProblemAttempt[]
> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of user practice problem attempts');
  }
  return (bodyJson as UserPracticeProblemAttempt[]).map(a => ({
    id: a.id,
    practice_problem_id: a.practice_problem_id,
  }));
};

export type ChallengeResponseAsset = {
  id: number;
  asset_type: 'whiteboard_image' | 'video' | 'audio';
  upload_url: string;
};

type ServerChallengeResponseAsset = {
  id: number;
  asset_type: string;
  upload_url: string;
};

export type ChallengeResponse = {
  id: number;
  challenge_id: number;
  user_id: number;
  student_text: string | null;
  transcript: string | null;
  student_feedback: string | null;
  evaluation_result: Record<string, unknown> | null;
  is_final: boolean;
  evaluated_at: string | null;
  created_at: string;
  assets: ChallengeResponseAsset[];
};

type ServerChallengeResponse = {
  id: number;
  challenge_id: number;
  user_id: number;
  student_text: string | null;
  transcript: string | null;
  student_feedback: string | null;
  evaluation_result: Record<string, unknown> | null;
  is_final: boolean;
  evaluated_at: string | null;
  created_at: string;
  assets: ServerChallengeResponseAsset[];
};

export const challengeResponseValidator: ResponseValidator<
  ChallengeResponse
> = bodyJson => {
  const r = bodyJson as ServerChallengeResponse;
  if (r.id === undefined) {
    throw new Error('ChallengeResponse missing id');
  }
  return {
    id: r.id,
    challenge_id: r.challenge_id,
    user_id: r.user_id,
    student_text: r.student_text ?? null,
    transcript: r.transcript ?? null,
    student_feedback: r.student_feedback ?? null,
    evaluation_result: r.evaluation_result ?? null,
    is_final: r.is_final,
    evaluated_at: r.evaluated_at ?? null,
    created_at: r.created_at,
    assets: r.assets.map(a => ({
      id: a.id,
      asset_type: a.asset_type as ChallengeResponseAsset['asset_type'],
      upload_url: a.upload_url,
    })),
  };
};

export type Challenge = {
  id: number;
  lesson_id: number;
  question: string;
  default_modality: 'whiteboard' | 'video' | null;
  whiteboard_starter_image_alt_text: string | null;
};

type ServerChallenge = {
  id: number;
  lesson_id: number;
  question: string;
  default_modality: 'whiteboard' | 'video' | null;
  whiteboard_starter_image_alt_text: string | null;
  created_at: string;
  updated_at: string;
};

export const challengeValidator: ResponseValidator<Challenge[]> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of challenges');
  }
  const challenges = bodyJson as ServerChallenge[];
  for (const c of challenges) {
    if (c.id === undefined) {
      throw new Error('Challenge missing id');
    }
    if (!c.question) {
      throw new Error('Challenge missing question');
    }
  }
  return challenges.map(c => ({
    id: c.id,
    lesson_id: c.lesson_id,
    question: c.question,
    default_modality: c.default_modality ?? null,
    whiteboard_starter_image_alt_text:
      c.whiteboard_starter_image_alt_text ?? null,
  }));
};

export const practiceProblemValidator: ResponseValidator<
  PracticeProblem[]
> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of practice problems');
  }

  const problems = bodyJson as ServerPracticeProblem[];

  for (const p of problems) {
    if (p.id === undefined) {
      throw new Error('Practice problem missing id');
    }
  }

  return problems.map(p => ({
    id: p.id,
    type: p.problem_type,
    active: p.active,
    problem_text: p.problem_text,
    solution: p.solution,
  }));
};
