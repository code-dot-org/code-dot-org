/** Describes a single level hint. */
export interface HintData {
  class: string;
  id: string;
  type: string;
  markdown: string;
  video?: string;
  path?: [number, number][];
}

/** Describes a multiple-choice question. */
export interface MultipleChoiceData {
  question: string;
  choices: {
    text: string;
    feedback: string;
    correct: boolean;
  }[];
}

/** Describes a level's properties */
export interface LevelData<T extends object = object> {
  /** Unique key for this level */
  key: string;
  /** The type of level (Maze, etc) */
  type: string;
  /** Potentially long description of what to do in the level or what the goal is. */
  longInstructions?: string;
  /** Shorter description of what to do or what the level covers. */
  shortInstructions?: string;
  /** Whether or not we should highlight the instructions before the student can continue */
  instructionsImportant?: boolean;
  /** Hints to help folks progress within levels. */
  hints?: HintData[];
  /** The shared level template defining a potential 'workspace' */
  template?: LevelData<T>;
  /** Multiple choice question data. */
  multipleChoice?: MultipleChoiceData;
  /** Specific level data. */
  subData?: T;
}
