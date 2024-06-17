export interface LevelPredictSettings {
  is_predict_level: boolean;
  placeholder_text?: string;
  solution?: string | string[];
  question_type?: 'free_response' | 'multiple_choice';
  multiple_choice_options?: string[];
  single_correct_answer?: boolean;
  allow_multiple_tries?: boolean;
}
