// TODO: other channel properties mentioned in project.js:
// level, frozen, hidden, thumbnailUrl, migratedToS3, sharedWith, libraryName, libraryDescription,
// latestLibraryVersion, publishLibrary, libraryPublishedAt
//
// Do we still want/need these? Should they be on a separate type?
// If the ChannelsApi on the server doesn't care about these, they should
// live elsewhere.
// The library data should definitely live elsewhere.

import {BlockDefinition} from '@cdo/apps/blockly/types';
import {PanelsLevelData} from '@cdo/apps/panels/types';

export interface Channel {
  id: string;
  name: string;
  isOwner: boolean;
  projectType: ProjectType;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DefaultChannel = Pick<Channel, 'name'>;

// Represents the structure of the full project sources object (i.e. the main.json file)
export interface ProjectSources {
  // Source code can either be a string or a nested JSON object (for multi-file).
  source: string | NestedSourceCode;
  // Optional lab-specific configuration for this project
  labConfig?: {[key: string]: object};
  // Add other properties (animations, html, etc) as needed.
}

// We will eventually make this a union type to include other source types.
export type Source = BlocklySource;

export interface SourceUpdateOptions {
  currentVersion: string;
  replace: boolean;
  firstSaveTimestamp: string;
  tabId: string | null;
}

export interface Project {
  // When projects are loaded for the first time, sources may not be present
  sources?: ProjectSources;
  channel: Channel;
}

export interface BlocklySource {
  blocks: {
    languageVersion: number;
    blocks: BlocklyBlock[];
  };
  variables: BlocklyVariable[];
}

// A potentially deeply nested object of source code, where keys are file or folder names
// and values are folders or individual file contents. This is used in labs with multi-file.
export type NestedSourceCode = {
  [key: string]: SourceFileData | NestedSourceCode;
};
// TODO: There may be more properties that we want to track in the future. For example, Java Lab uses tabOrder
// and isVisible.
export type SourceFileData = {
  text: string;
};

export interface BlocklyBlock {
  type: string;
  id: string;
  x: number;
  y: number;
  next: {
    block: BlocklyBlock;
  };
}

export interface BlocklyVariable {
  name: string;
  id: string;
}

// TODO: these are not all the properties of the level.
// Fill this in as we need them.
export interface Level {
  projectType: ProjectType;
  isK1: boolean;
  standaloneAppName: StandaloneAppName;
  useContractEditor: boolean;
  // Minecraft specific properties
  isAgentLevel: boolean;
  isEventLevel: boolean;
  isConnectionLevel: boolean;
  isAquaticLevel: boolean;
}

/**
 * Labs may extend this type to add lab-specific properties.
 */
export interface LevelProperties {
  // Not a complete list; add properties as needed.
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
  sharedBlocks?: BlockDefinition[];
}

// Level configuration data used by project-backed labs that don't require
// reloads between levels. Labs may define more specific fields.
export interface ProjectLevelData {
  text?: string;
  validations?: Validation[];
  startSources: Source;
}

// The level data for a standalone_video level that doesn't require
// reloads between levels.
export interface VideoLevelData {
  src: string;
  download: string;
}

// TODO: Add AichatLevelData.

export type LevelData = ProjectLevelData | VideoLevelData | PanelsLevelData;

// A validation condition.
export interface Condition {
  name: string;
  value?: string | number;
}

export interface ConditionType {
  name: string;
  hasValue: boolean;
  valueType?: 'string' | 'number';
}

// Validation in the level.
export interface Validation {
  conditions: Condition[];
  message: string;
  next: boolean;
  key: string;
}

// TODO: these are not all the properties of app options.
// Fill this in as we need them.
export interface AppOptions {
  app: AppName;
  level: Level;
  skinId: string;
  droplet: boolean;
  channel: string;
}

export type ProjectType =
  | AppName
  | StandaloneAppName
  | 'artist'
  | 'artist_k1'
  | 'frozen'
  | 'minecraft_adventurer'
  | 'minecraft_hero'
  | 'minecraft_designer'
  | 'minecraft_codebuilder'
  | 'minecraft_aquatic'
  | 'algebra_game'
  | 'starwars'
  | 'starwarsblocks_hour'
  | 'iceage'
  | 'infinity'
  | 'gumball'
  | 'playlab'
  | 'playlab_k1'
  | 'sports'
  | 'basketball';

export type AppName =
  | 'aichat'
  | 'applab'
  | 'calc'
  | 'dance'
  | 'eval'
  | 'flappy'
  | 'gamelab'
  | 'javalab'
  | 'music'
  | 'thebadguys'
  | 'weblab'
  | 'turtle'
  | 'craft'
  | 'studio'
  | 'bounce'
  | 'poetry'
  | 'pythonlab'
  | 'spritelab'
  | 'standalone_video'
  | 'panels'
  | 'weblab2';

export type StandaloneAppName =
  | 'spritelab'
  | 'story'
  | 'science'
  | 'poetry_hoc'
  | 'poetry'
  | 'time_capsule'
  | 'dance';

export enum ProjectManagerStorageType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}
