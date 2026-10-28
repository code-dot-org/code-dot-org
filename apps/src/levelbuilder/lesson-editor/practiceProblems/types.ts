import {PracticeProblemTypes} from '@cdo/generated-scripts/sharedConstants';

export type SolutionEntry = {
  option: string;
  correct: boolean | number | string;
};

// Editor/preview/panel working shape. Mirrors the server's
// PracticeProblem#summarize_for_lesson_edit (camelCase) plus in-flight
// candidates that have no id/key until accepted.
export interface PracticeProblemData {
  id?: number;
  key?: string;
  problemType: string;
  problemText: string;
  solution: SolutionEntry[];
  objectiveIds: number[];
  active?: boolean;
}

export interface LessonObjective {
  id?: number;
  description: string;
  key?: string;
}

export const PROBLEM_TYPE_LABELS: Record<string, string> = {
  [PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE]: 'Multiple choice (single)',
  [PracticeProblemTypes.MULTIPLE_CHOICE_MULTI]: 'Multiple choice (multiple)',
  [PracticeProblemTypes.MATCH]: 'Match',
  [PracticeProblemTypes.SORT]: 'Sort',
  [PracticeProblemTypes.SCRAMBLE]: 'Scramble',
};

export const problemTypeLabel = (type: string): string =>
  PROBLEM_TYPE_LABELS[type] ?? type;
