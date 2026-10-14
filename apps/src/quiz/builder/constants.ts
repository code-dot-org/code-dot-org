import {QuizQuestionType} from '../types';

export const QUESTION_TYPE_LABELS_ICONS: Record<
  QuizQuestionType,
  {label: string; iconName: string}
> = {
  MultipleChoiceQuestion: {label: 'Multiple choice', iconName: 'list-check'},
  FreeResponseQuestion: {label: 'Free response', iconName: 'pen-field'},
};
