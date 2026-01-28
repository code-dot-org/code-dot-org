export type CFULevelType =
  | 'Multi'
  | 'Match'
  | 'FreeResponse'
  | 'LevelGroup'
  | 'Aichat'
  | 'Panels';

// For Multi CFUs, answers include a correctness flag.
// For Match CFUs, answers only have text and `correct` is omitted.
export type CFUMultipleLevelAnswer = {
  text: string;
  correct?: boolean;
};

// Base level properties shared by all level types
interface CFULevelBase {
  id: number;
  name: string;
  display_name: string;
  level_position: number;
  key?: string;
  script_level_id: number;
  progression?: string;
  progression_display_name?: string;
  question_text: string | string[] | null;
  level_url?: string | null;
  // For Match CFUs, the left-column options (terms). For LevelGroup, this
  // will be an array of per-sublevel options arrays.
  options?: string[] | (string[] | null)[] | null;
}

// LevelGroup level - answers is an array of arrays (or nulls)
export interface CFULevelGroup extends CFULevelBase {
  type: 'LevelGroup';
  answers: Array<CFUMultipleLevelAnswer[] | null>;
}

// Other level types - answers is a single array
export interface CFULevelOther extends CFULevelBase {
  type: 'Multi' | 'Match' | 'FreeResponse';
  answers: CFUMultipleLevelAnswer[] | null;
}

// Discriminated union type
export type CFULevel = CFULevelGroup | CFULevelOther;

export interface CFULevelResponse {
  level_id: number;
  script_level_id: number;
  response: CFULevelResponseResponse;
  submitted?: boolean;
  timestamp?: string;
}

export interface CFULevelResponseResponse {
  type: CFULevelType;
  student_result?: string | number[];
  level_results?: {
    type: CFULevelType;
    student_result?: string | number[];
    status: CFULevelResponseSubmissionStatus;
    level_id: number;
  }[];
  status: CFULevelResponseSubmissionStatus;
}

export type StatusBucket =
  | 'correct'
  | 'partially_correct'
  | 'incorrect'
  | 'incomplete';

export type CFULevelResponseSubmissionStatus = 'submitted' | 'unsubmitted';
