export interface CFULevel {
  id: number;
  name: string;
  display_name: string;
  type: string;
  key?: string;
  script_level_id: number;
  progression?: string;
  progression_display_name?: string;
  // Optional fields populated by the backend for question content.
  question_text?: string | null;
  answers?: unknown;
}

export interface CFULevelResponse {
  level_id: number;
  script_level_id: number;
  response: {
    type: string;
    student_result?: unknown;
    status: unknown;
  };
  submitted?: boolean;
  timestamp?: string;
}
