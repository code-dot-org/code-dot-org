// TODO: other channel properties mentioned in project.js:
// level, frozen, hidden, thumbnailUrl, migratedToS3, sharedWith, libraryName, libraryDescription,
// latestLibraryVersion, publishLibrary, libraryPublishedAt
//
// Do we still want/need these? Should they be on a separate type?
// If the ChannelsApi on the server doesn't care about these, they should
// live elsewhere.
// The library data should definitely live elsewhere.

import * as Blockly from 'blockly/core';

import type {Level} from '@code-dot-org/api/models/levels';
import type {Source} from '@code-dot-org/api/sources';
import type {
  BlockDefinition,
  BlocklySerialization,
} from '@code-dot-org/blockly-workspace';
import type {Theme} from '@code-dot-org/component-library/common/contexts';
import type {ExemplarSettings} from '@code-dot-org/progress';
import type {
  AppName,
  MultiFileSource,
  ProjectSources,
  ProjectVersion,
  Channel,
} from '@code-dot-org/projects';

export type {ProjectVersion, ProjectSources};

import type {LevelPredictSettings} from '@lab-base/levelEditors';

export {Theme, ExemplarSettings};

/// ------ USER APP OPTIONS ------ ///

// Partial definition of the UserAppOptions structure, only defining the
// pieces we need at the moment.
export interface PartialUserAppOptions {
  isInstructor: boolean;
}

/// ------ LEVELS ------ ///

export interface BaseLabProperties {
  appName: AppName;
  isProjectLevel?: boolean;
  hideShareAndRemix?: boolean;
  usesProjects?: boolean;
  startSources?: MultiFileSource;
  templateSources?: MultiFileSource;
  exemplarSources?: ProjectSources | MultiFileSource;
  hideVersionHistory?: boolean;
  aiTutorAvailable?: boolean;
  showRubric?: boolean;
  // Project Template level name for the level if it exists.
  projectTemplateLevelName?: string;
  // For Teachers Only value
  teacherMarkdown?: string;
  predictSettings?: LevelPredictSettings;
  exemplarSettings?: ExemplarSettings;
  submittable?: boolean;
  disableEditRunForSubmission?: boolean;
  skipUrl?: string;
  finishUrl?: string;
  finishDialog?: string;
  offerBrowserTts?: boolean;
  useSecondaryFinishButton?: boolean;
  // Codebridge
  widgetView?: boolean;
}

/**
 * Labs may extend this type to add lab-specific properties.
 */
export type LevelProperties<
  T extends BaseLabProperties = BaseLabProperties,
  U extends object = object,
> = Level<T> & {
  // Other level data
  levelData: U;
};

export type BlocklyLevelProperties<
  T extends BaseLabProperties = BaseLabProperties,
  U extends object = object,
> = LevelProperties<T, U> & {
  toolboxDefinition?: Blockly.utils.toolbox.ToolboxInfo;
  sharedBlocks?: BlockDefinition[];
};

export type LevelPropertiesMap = {[levelId: string]: LevelProperties};

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
  U = string,
> {
  levelProperties: T;
  initialSources?: ProjectSources<U>;
  isShareView?: boolean;
  isReadOnlyWorkspace?: boolean;
  channel?: Channel;
}

export type BlocklySource = Source<BlocklySerialization>;
