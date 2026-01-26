export type CFULevelType = 'Multi' | 'Match' | 'FreeResponse' | 'LevelGroup';

export type CFUMultipleLevelAnswer = {text: string; correct: boolean};

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
}

// LevelGroup level - answers is an array of arrays (or nulls)
export interface CFULevelGroup extends CFULevelBase {
  type: 'LevelGroup';
  answers?: Array<CFUMultipleLevelAnswer[] | null>;
}

// Other level types - answers is a single array
export interface CFULevelOther extends CFULevelBase {
  type: 'Multi' | 'Match' | 'FreeResponse';
  answers?: CFUMultipleLevelAnswer[];
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
  student_result?: unknown;
  level_results?: {
    type: CFULevelType;
    student_result?: unknown;
    status: unknown;
    level_id: number;
  }[];
  status: unknown;
}

export type StatusBucket =
  | 'correct'
  | 'partially_correct'
  | 'incorrect'
  | 'incomplete';
