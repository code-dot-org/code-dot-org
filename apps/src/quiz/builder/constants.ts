import {QuizQuestionType} from '../types';

export const QUESTION_TYPE_LABELS_ICONS: Record<
  QuizQuestionType,
  {label: string; iconName: string}
> = {
  MultipleChoiceQuestion: {label: 'Multiple choice', iconName: 'circle-dot'},
  MultipleSelectQuestion: {label: 'Multiple select', iconName: 'square-check'},
  FreeResponseQuestion: {label: 'Free response', iconName: 'pen-field'},
  MatchQuestion: {label: 'Matching', iconName: 'diagram-next'},
};

export const UNSAVED_QUESTION_REASON =
  'Save or remove your new question first.';
export const EMPTY_PAGE_REASON = 'Create a question on the empty page first.';
