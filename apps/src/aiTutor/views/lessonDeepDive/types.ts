import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

export type ReflectionValue =
  (typeof LessonObjectiveReflectionValues)[keyof typeof LessonObjectiveReflectionValues];

export type ReflectionData = {
  objectiveReflections: Record<string, ReflectionValue>;
  success: string;
  struggle: string;
};

export type LessonDeepDiveData = {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: {id: string; word: string; definition: string}[];
  objectives: {id: string; description: string}[];
};

export type PracticeProblem = {
  id: number;
  type: string;
  active: boolean;
  problem_text: string;
  solution: {option: string; correct: string | number | boolean}[];
};

export const PracticeProblemTypes = {
  MULTI_SINGLE: 'multiple_choice_single_select',
  MULTI_MULTI: 'multiple_choice_multi_select',
  SCRAMBLE: 'scramble',
  SORT: 'sort',
  MATCH: 'match',
} as const;
