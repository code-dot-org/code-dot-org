// TODO: other channel properties mentioned in project.js:
// level, frozen, hidden, thumbnailUrl, migratedToS3, sharedWith, libraryName, libraryDescription,
// latestLibraryVersion, publishLibrary, libraryPublishedAt
//
// Do we still want/need these? Should they be on a separate type?
// If the ChannelsApi on the server doesn't care about these, they should
// live elsewhere.
// The library data should definitely live elsewhere.

import type {ComponentType, LazyExoticComponent} from 'react';

import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import type {Theme} from '@code-dot-org/component-library/common/contexts';
import type {ExemplarSettings} from '@code-dot-org/progress';
import type {AppName, MultiFileSource, Source, ProjectFile, ProjectSources, Channel} from '@code-dot-org/projects';

import type {LevelPredictSettings} from '@lab-base/levelEditors';

export {Theme, ExemplarSettings};

/// ------ USER APP OPTIONS ------ ///

// Partial definition of the UserAppOptions structure, only defining the
// pieces we need at the moment.
export interface PartialUserAppOptions {
  isInstructor: boolean;
}

/// ------ LEVELS ------ ///

/**
 * Labs may extend this type to add lab-specific properties.
 */
export interface LevelProperties {
  // Not a complete list; add properties as needed.
  id: number;
  name: string;
  isProjectLevel?: boolean;
  hideShareAndRemix?: boolean;
  usesProjects?: boolean;
  levelData?: LevelData;
  appName: AppName;
  longInstructions?: string;
  freePlay?: boolean;
  edit_blocks?: string;
  isK1?: boolean;
  skin?: string;
  toolboxBlocks?: string;
  startSources?: MultiFileSource;
  templateSources?: MultiFileSource;
  sharedBlocks?: BlockDefinition[];
  validations?: Validation[];
  baseAssetUrl?: string;
  // An optional URL that allows the user to skip the progression.
  skipUrl?: string;
  // Project Template level name for the level if it exists.
  projectTemplateLevelName?: string;
  // Help and Tips values
  mapReference?: string;
  referenceLinks?: string[];
  helpVideos?: VideoData[];
  // Exemplars
  exampleSolutions?: string[];
  exemplarSources?: Source;
  exemplarSettings?: ExemplarSettings;
  // For Teachers Only value
  teacherMarkdown?: string;
  predictSettings?: LevelPredictSettings;
  submittable?: boolean;
  finishUrl?: string;
  finishDialog?: string;
  offerBrowserTts?: boolean;
  useSecondaryFinishButton?: boolean;
  // Python Lab/Codebridge specific properties
  validationFile?: ProjectFile;
  enableMicroBit?: boolean;
  miniApp?: string;
  serializedMaze?: MazeCell[][];
  startDirection?: number;
  widgetView?: boolean;
  widgetViewAllowShowCode?: boolean;
  aiTutor2Available?: boolean;
  // Properties added for parity with non-lab2 AI Tutor levels
  aiTutorAvailable?: boolean;
  isAssessment?: boolean;
  progressionType?: string;
  type?: string;
  starterAssets?: {[key: string]: string};
}

// Level configuration data used by project-backed labs that don't require
// reloads between levels. Labs may define more specific fields.
export interface ProjectLevelData {
  startSources: Source;
}

// The level data for a standalone_video level that doesn't require
// reloads between levels.
export interface VideoLevelData {
  src: string;
  download: string;
  thumbnail: string;
}

// The level data for a bubble_choice level that doesn't require
// reloads between levels.
export interface BubbleChoiceLevelData {
  displayName: string;
  description: string;
  sublevels: BubbleChoiceSublevel[];
}

// Bubble Choice specific property
export interface BubbleChoiceSublevel {
  display_name: string;
  description?: string;
  level_id: string;
  thumbnail_url: string;
  url: string;
}

// Addtional fields for videos that are linked as references in the
// Help & Tips tab of Instructions.
interface VideoData extends VideoLevelData {
  name?: string;
  key?: string;
  enable_fallback?: boolean;
  autoplay?: boolean;
}

// Python Lab specific property
export interface MazeCell {
  tileType: number;
  value: number;
  assetId: number;
}

// Configuration for how a Lab should be rendered
export interface Lab2EntryPoint {
  /**
   * A lazy loaded view for the lab. This should be a lazy-loaded react
   * component using a dynamic import. See `pythonlab/entrypoint.tsx` for an
   * example.
   */
  view: LazyExoticComponent<ComponentType<LabProps>>;
  /**
   * An array of themes that the lab supports.
   */
  themes: Theme[];
}

export type LevelData =
  | ProjectLevelData
  | VideoLevelData
  | BubbleChoiceLevelData;


export type StandaloneAppName =
  | 'spritelab'
  | 'story'
  | 'science'
  | 'poetry_hoc'
  | 'poetry'
  | 'time_capsule'
  | 'dance';

/// ------ VALIDATIONS ------ ///

// A validation condition.
export interface Condition {
  name: string;
  value?: string | number;
}

type ValueType = 'string' | 'number';
type ConditionValueType = `${ValueType}:${ValueType}` | ValueType;
export interface ConditionType {
  name: string;
  valueType?: ConditionValueType;
  description: string;
  valueOptions?: string[];
}

// Validation in the level.
export interface Validation {
  conditions: Condition[];
  message: string;
  callout?: string;
  next: boolean;
  key: string;
  comment?: string;
}

/// ------ MISC ------ ///

export interface ExtraLinksLevelData {
  links: {[key: string]: {text: string; url: string; access_key?: string}[]};
  can_clone: boolean;
  can_delete: boolean;
  level_name: string;
  script_level_path_links: ScriptLevelPathLink[];
  parent_level_path_links: ParentLevelPathLink[];
  is_standalone_project: boolean;
}
export interface ExtraLinksProjectData {
  owner_info?: {storage_id: number; name: string};
  project_info?: {
    id: number;
    sources_link: string;
    is_featured_project: boolean;
    featured_status: string;
    remix_ancestry: string[];
    is_published_project: 'yes' | 'no';
    abuse_score: number;
  };
  meesage?: string;
}

export interface ProjectVersion {
  versionId: string;
  lastModified: string;
  isLatest: boolean;
}

export interface ScriptLevelPathLink {
  script: string;
  path: string;
}

export interface ParentLevelPathLink {
  level_name: string;
  path: string;
  kind: string;
  position: string;
}

export interface LabProps<
  T extends LevelProperties = LevelProperties,
  U extends ProjectSources = ProjectSources
> {
  levelProperties: T;
  initialSources?: U;
  isShareView?: boolean;
  isReadOnlyWorkspace?: boolean;
  channel?: Channel;
}
