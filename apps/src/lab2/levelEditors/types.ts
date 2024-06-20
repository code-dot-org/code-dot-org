export interface LevelPredictSettings {
  is_predict_level: boolean;
  placeholder_text?: string;
  solution?: string | string[];
  question_type?: PredictQuestionType;
  multiple_choice_options?: string[];
  single_correct_answer?: boolean;
  allow_multiple_attempts?: boolean;
  free_response_height?: number;
}

export enum PredictQuestionType {
  FreeResponse = 'free_response',
  MultipleChoice = 'multiple_choice',
}
