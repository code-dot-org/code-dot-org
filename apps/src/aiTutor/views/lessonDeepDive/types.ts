import {type VocabularyItem} from '@code-dot-org/lesson-deep-dive';

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
  vocabulary: VocabularyItem[];
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
  // Presigned S3 URL. Absent right after create, when the bytes have not
  // been uploaded yet.
  download_url: string | null;
};

type ServerChallengeResponseAsset = {
  id: number;
  asset_type: string;
  download_url?: string;
};

// The student-facing shape of a response. student_feedback carries the
// constructive AI feedback (null until evaluation completes) and
// evaluation_status its lifecycle; the scored evaluation_result is
// teacher-only, so the server omits it here.
export type ChallengeResponse = {
  id: number;
  challenge_id: number;
  user_id: number;
  student_text: string | null;
  transcript: string | null;
  student_feedback: string | null;
  evaluation_status: string | null;
  is_final: boolean;
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
  evaluation_status: string | null;
  is_final: boolean;
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
    evaluation_status: r.evaluation_status ?? null,
    is_final: r.is_final,
    created_at: r.created_at,
    assets: r.assets.map(a => ({
      id: a.id,
      asset_type: a.asset_type as ChallengeResponseAsset['asset_type'],
      download_url: a.download_url ?? null,
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
