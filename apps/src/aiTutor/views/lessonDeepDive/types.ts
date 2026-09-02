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
