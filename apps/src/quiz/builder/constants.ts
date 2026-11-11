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
export const QUIZ_LOADING_REASON = 'The quiz is still loading.';
export const QUIZ_LOAD_FAILED_REASON = 'Reload the page to load the quiz.';
export const INVALID_CONFIG_REASON = 'Fix the errors in Configuration first.';
export const editedQuestionsReason = (count: number) =>
  `Save or discard changes to ${pluralize(count, 'question')} first.`;
export const QUESTION_HAS_CHANGES_REASON =
  "Save or discard this question's changes first.";
export const PAGE_HAS_QUESTIONS_REASON =
  "Move or remove this page's questions first.";
export const LAST_PAGE_REASON = 'A quiz needs at least one page.';
export const INTRO_SCREEN_LOCKED_REASON =
  'A timed quiz must have an intro screen, remove the time limit first.';

// Why the configuration can't be saved, as the Configuration panel shows it.
export const TIME_LIMIT_ERROR =
  'Time limit must be a whole number of minutes greater than 0, or left blank for no limit.';
export const INTRO_SCREEN_REQUIRED_ERROR =
  'Show intro screen is required when a time limit is set.';

// The header slot layouts/_header.html.haml renders in builder mode.
export const QUIZ_BUILDER_HEADER_ID = 'quiz_builder_header';
