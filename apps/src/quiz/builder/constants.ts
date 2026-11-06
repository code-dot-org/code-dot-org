import {QuizQuestionType} from '../types';
import {pluralize} from '../utils';

export const QUESTION_TYPE_LABELS_ICONS: Record<
  QuizQuestionType,
  {label: string; iconName: string}
> = {
  MultipleChoiceQuestion: {label: 'Multiple choice', iconName: 'circle-dot'},
  MultipleSelectQuestion: {label: 'Multiple select', iconName: 'square-check'},
  FreeResponseQuestion: {label: 'Free response', iconName: 'pen-field'},
  MatchQuestion: {label: 'Matching', iconName: 'diagram-next'},
};

// Why a builder button is off, as its tooltip shows it.
export const UNSAVED_QUESTION_REASON =
  'Save or remove your new question first.';
export const EMPTY_PAGE_REASON = 'Create a question on the empty page first.';
export const NO_CHANGES_REASON = 'No changes to save.';
export const editedQuestionsReason = (count: number) =>
  `Save or discard changes to ${pluralize(count, 'question')} first.`;

// The header slot layouts/_header.html.haml renders in builder mode.
export const QUIZ_BUILDER_HEADER_ID = 'quiz_builder_header';
