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

export const UNSAVED_QUESTION_REASON = 'You have a new unsaved question';
export const EMPTY_PAGE_REASON = 'You have an empty page';
