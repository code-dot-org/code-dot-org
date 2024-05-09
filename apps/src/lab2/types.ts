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
  // Optional lab-specific configuration for this project.  If provided, this will be saved
  // to the Project model in the database along with the other entries in this interface,
  // inside the value field JSON.
  labConfig?: {[key: string]: {[key: string]: string}};
}

export type DefaultChannel = Pick<Channel, 'name'>;

// Represents the structure of the full project sources object (i.e. the main.json file)
export interface ProjectSources {
  // Source code can either be a string or a nested JSON object (for multi-file).
  source: string | MultiFileSource;
  // Optional lab-specific configuration for this project
  labConfig?: {[key: string]: {[key: string]: string}};
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

export type FileId = string;
export type FolderId = string;

// This structure (as well as ProjectFolder and ProjectFile) is still in flux
// and may change going forward. It should only be used for labs that are not released
// yet.
// Note that if it changes files_api.has_valid_encoding? may need to be updated to correctly validate
// the new structure.
export interface MultiFileSource {
  folders: Record<FolderId, ProjectFolder>;
  files: Record<FileId, ProjectFile>;
}

export interface ProjectFile {
  id: FileId;
  name: string;
  language: string;
  contents: string;
  open?: boolean;
  active?: boolean;
  folderId: string;
  hidden?: boolean;
}

export interface ProjectFolder {
  id: FolderId;
  name: string;
  parentId: string;
  open?: boolean;
}

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
  id: number;
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
  source?: MultiFileSource;
  sharedBlocks?: BlockDefinition[];
  // We are moving level validations out of level data and into level properties.
  // Temporarily keeping them in both places to avoid breaking existing code.
  validations?: Validation[];
  // An optional URL that allows the user to skip the progression.
  skipUrl?: string;
  // Project Template level name for the level if it exists.
  projectTemplateLevelName?: string;
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

export interface ExtraLinksData {
  links: {[key: string]: {text: string; url: string; access_key?: string}[]};
  can_clone: boolean;
  can_delete: boolean;
  level_name: string;
  script_level_path_links: {
    script: string;
    path: string;
  }[];
}
