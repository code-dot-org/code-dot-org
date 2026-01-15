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

/** Internal video metadata */
export interface VideoDefinition {
  youtube: string;
  download: string;
  locale: string;
}

/** Describes a video. */
export interface VideoData {
  download: string;
  youTubeId: string;
  locale: string;
}

export enum LevelKind {
  assessment = 'assessment',
  activity = 'activity',
}

/** Describes a level's properties */
export type Level<T extends object = object> = {
  /** Unique incremental id for this level */
  id: number;
  /** Unique incremental id for the parent level */
  parentLevelId?: number;
  /** Unique incremental id for the script level */
  scriptLevelId?: string;
  /** Unique key for this level */
  key: string;
  /** The type of level (Maze, etc) */
  type: string;
  /** The level kind attribute */
  kind: LevelKind;
  /** The filepath of the level definition, if available */
  path?: string;
  /** Whether or not the level is a concept level */
  isConcept?: boolean;
  /** The URL path for the level */
  url: string;
  /** The name for the level */
  name?: string;
  /** The page the level is on, if any */
  pageNumber?: number;
  /** Potentially long description of what to do in the level or what the goal is. */
  longInstructions?: string;
  /** Shorter description of what to do or what the level covers. */
  shortInstructions?: string;
  /** The level keys for contained levels */
  containedLevelNames?: string[];
  /** Whether or not we should highlight the instructions before the student can continue */
  instructionsImportant?: boolean;
  /** Hints to help folks progress within levels. */
  hints?: HintData[];
  /** Whether or not the level can have feedback */
  canHaveFeedback?: boolean;
  /** Whether or not the level is validated */
  isValidated?: boolean;
  /** Whether or not the level is a 'bonus' level*/
  bonus?: boolean;
  /** The shared level template defining a potential 'workspace' */
  template?: Level<T>;
  /** Multiple choice question data. */
  multipleChoice?: MultipleChoiceData;
  /** An optional video that is associated with the level. */
  videoKey?: string;
  /** The metadata about the associated video. */
  videoData?: VideoData;
  /** Sub-levels */
  sublevels?: Level[];
} & T;
