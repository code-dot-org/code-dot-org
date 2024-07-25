export interface LevelPredictSettings {
  isPredictLevel: boolean;
  solution?: string;
  questionType?: PredictQuestionType;
  allowMultipleAttempts?: boolean;
  codeEditableAfterSubmit?: boolean;
  // Free Response settings
  freeResponseHeight?: number;
  placeholderText?: string;
  // Multiple choice settings
  multipleChoiceOptions?: string[];
  isMultiSelect?: boolean;
}

export enum PredictQuestionType {
  FreeResponse = 'freeResponse',
  MultipleChoice = 'multipleChoice',
}
