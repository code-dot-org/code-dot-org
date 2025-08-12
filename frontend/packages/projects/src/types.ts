/// ------ PROJECTS ------ ///

export type AppName = 'aichat' | 'bubble_choice' | 'dance' | 'music' | 'panels' | 'pythonlab' | 'standalone_video' | 'weblab2';

export type StandaloneAppName =
  | 'spritelab'
  | 'story'
  | 'science'
  | 'poetry_hoc'
  | 'poetry'
  | 'time_capsule'
  | 'dance';

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

/** Identifies a project. Corresponds to the "value" JSON column for the entry in the projects table. */
export interface Channel {
  id: string;
  name: string;
  isOwner: boolean;
  projectType: ProjectType;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hidden?: boolean;
  thumbnailUrl?: string;
  frozen?: boolean;
  // Optional lab-specific configuration for this project.  If provided, this will be saved
  // to the Project model in the database along with the other entries in this interface,
  // inside the value field JSON.
  labConfig?: {[key: string]: {[key: string]: string}};
}

export type DefaultChannel = Pick<Channel, 'name'>;

/** A project and its corresponding sources if present, fetched together when loading a level. */
export interface ProjectAndSources {
  // When projects are loaded for the first time, sources may not be present
  sources?: ProjectSources;
  channel: Channel;
  abuseScore?: number;
  sharingDisabled?: boolean;
}

/// ------ SOURCES ------ ///

// Represents the structure of the full project sources object (i.e. the main.json file)
export interface ProjectSources {
  // Source code can either be a string or a nested JSON object (for multi-file).
  source: string | MultiFileSource;
  // Optional lab-specific configuration for this project
  labConfig?: LabConfig;
  // Add other properties (animations, html, etc) as needed.
}

export type LabConfig = {[key: string]: {[key: string]: string}};

// -- BLOCKLY -- //

export interface BlocklySource {
  blocks: {
    languageVersion: number;
    blocks: BlocklyBlock[];
  };
  variables: BlocklyVariable[];
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

// We will eventually make this a union type to include other source types.
export type Source = BlocklySource | MultiFileSource;

export interface SaveSourceOptions {
  projectType?: string;
}

export interface UpdateSourceOptions extends SaveSourceOptions {
  currentVersion: string;
  replace: boolean;
  firstSaveTimestamp: string;
  tabId: string | null;
}

/**
 * Project file types are as follows:
 * Starter: Files that come from level start code that are editable by the user.
 * Support: Files that come from level start code that are hidden and not editable by the user.
 * Validation: The file that contain the level's validation code, which is a code file that will be
 * run by the lab. This file is hidden from users.
 * Locked Starter: Files that come from level start code that are editable by the user, but cannot be
 *  deleted or renamed.
 * System Support: Files that are used for running code and for share/remix, but are hidden from the user.
 *  For example, the serialized maze for a neighborhood level.
 */
export enum ProjectFileType {
  STARTER = 'starter',
  SUPPORT = 'support',
  VALIDATION = 'validation',
  LOCKED_STARTER = 'locked_starter',
  SYSTEM_SUPPORT = 'system_support',
}

export interface ProjectFolder {
  id: FolderId;
  name: string;
  parentId: string;
  open?: boolean;
}

// -- MULTI-FILE -- //

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
  openFiles?: FileId[];
}

export interface ProjectFile {
  id: FileId;
  name: string;
  language: string;
  contents: string;
  open?: boolean;
  active?: boolean;
  folderId: string;
  type?: ProjectFileType;
}

export interface ProjectVersion {
  versionId: string;
  lastModified: string;
  isLatest: boolean;
}
