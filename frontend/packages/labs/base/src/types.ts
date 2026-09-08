// What a lab is handed, and what it may be told about a level.
//
// SPLIT WITH `@code-dot-org/core/api`, which now owns everything describing a
// LEVEL — upstream moved those types there, and a package that re-declared them
// would be a second definition of a shape the server already fixes. What stays
// here is what describes a LAB: the props one is mounted with, the conditions
// it validates against, the app options it reads.
//
// Re-exported rather than left to be imported from core directly so that
// `@code-dot-org/lab/types` remains one place to look, which is what every lab
// in this workspace already imports.
export type {
  ExtraLinksLevelData,
  ExtraLinksProjectData,
  LevelPropertiesBase,
  LevelPropertiesMap,
  ParentLevelPathLink,
  ScriptLevelPathLink,
} from '@code-dot-org/core/api';

// TODO: other channel properties mentioned in project.js:
// level, frozen, hidden, thumbnailUrl, migratedToS3, sharedWith, libraryName, libraryDescription,
// latestLibraryVersion, publishLibrary, libraryPublishedAt
//
// Do we still want/need these? Should they be on a separate type?
// If the ChannelsApi on the server doesn't care about these, they should
// live elsewhere.
// The library data should definitely live elsewhere.

import type {
  Blockly,
  BlockDefinition,
  BlocklySerialization,
} from '@code-dot-org/blockly';
import type {Theme} from '@code-dot-org/component-library/common/contexts';
import type {ExemplarSettings} from '@code-dot-org/progress';
import type {
  AppName,
  Channel,
  LevelProperties,
  MultiFileSource,
  ProjectSources,
  ProjectVersion,
  Source,
} from '@code-dot-org/core/api';

export type {ProjectVersion, ProjectSources};

import type {LevelPredictSettings} from './levelEditors';

export type {Theme, ExemplarSettings};

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

/**
 * A level whose source is a Blockly workspace.
 *
 * NOT the `BlocklyLevelProperties` in `@code-dot-org/core/api`, which shares
 * the name and means something else: its `sharedBlocks` is a list of block
 * NAMES (`string[]`) for a level to enable, where this one carries the block
 * DEFINITIONS a lab registers, and it has no toolbox at all. Two different
 * facts about a level, so this one stays here rather than being reconciled by
 * whichever import a file happened to reach for.
 */
export type BlocklyLevelProperties = LevelProperties<{
  toolboxDefinition?: Blockly.utils.toolbox.ToolboxInfo;
  sharedBlocks?: BlockDefinition[];
}>;
