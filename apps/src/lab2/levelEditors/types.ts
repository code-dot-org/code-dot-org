export interface LevelPredictSettings {
  isPredictLevel: boolean;
  solution?: string;
  questionType?: PredictQuestionType;
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

export type AiTutorMode =
  | 'ask'
  | 'buildCSS'
  | 'buildHTML'
  | 'buildJavaScript'
  | 'debug'
  | 'documentation'
  | 'example'
  | 'explainCode'
  | 'hint'
  | 'pseudocode'
  | 'refusal'
  | 'refusalJavaScriptSnippets'
  | 'testCase';
