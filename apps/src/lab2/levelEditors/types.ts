export interface LevelPredictSettings {
  is_predict_level: boolean;
  placeholder_text?: string;
  solution?: string | string[];
  question_type?: PredictQuestionType;
  multiple_choice_options?: string[];
  multiple_choice_answers?: string[];
  allow_multiple_attempts?: boolean;
  free_response_height?: number;
}

export enum PredictQuestionType {
  FreeResponse = 'free_response',
  MultipleChoice = 'multiple_choice',
}
