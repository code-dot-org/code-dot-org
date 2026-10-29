export const PredictQuestionType = {
  FreeResponse: 'freeResponse',
  MultipleChoice: 'multipleChoice',
} as const;

export type PredictQuestionTypeType =
  (typeof PredictQuestionType)[keyof typeof PredictQuestionType];

export interface LevelPredictSettings {
  isPredictLevel: boolean;
  solution?: string;
  questionType?: PredictQuestionTypeType;
  allowMultipleAttempts?: boolean;
  codeEditableAfterSubmit?: boolean;
  // Free Response settings
  freeResponseHeight?: number;
  placeholderText?: string;
  // Multiple choice settings
  multipleChoiceOptions?: string[];
  isMultiSelect?: boolean;
}
