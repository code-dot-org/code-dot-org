export interface LevelPredictSettings {
  isPredictLevel: boolean;
  solution?: string;
  questionType?: PredictQuestionType;
  allowMultipleAttempts?: boolean;
  editableAfterSubmit?: boolean;
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
