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

import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

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
  nextLessonUrl: string | null;
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

export const PracticeProblemTypes = {
  MULTI_SINGLE: 'multiple_choice_single_select',
  MULTI_MULTI: 'multiple_choice_multi_select',
  SCRAMBLE: 'scramble',
  SORT: 'sort',
  MATCH: 'match',
} as const;
