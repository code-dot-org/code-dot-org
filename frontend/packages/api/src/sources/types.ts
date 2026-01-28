export type LabConfig = {[key: string]: {[key: string]: string}};

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
export const ProjectFileType = {
  STARTER: 'starter',
  SUPPORT: 'support',
  VALIDATION: 'validation',
  LOCKED_STARTER: 'locked_starter',
  SYSTEM_SUPPORT: 'system_support',
} as const;

export type ProjectFileTypeKey =
  (typeof ProjectFileType)[keyof typeof ProjectFileType];

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
  type?: ProjectFileTypeKey;
}

export interface ProjectVersion {
  versionId: string;
  lastModified: string;
  isLatest: boolean;
  comment?: string;
}

// Represents the structure of the full project sources object (i.e. the main.json file)
export interface ProjectSources<T = string> {
  /** The source data */
  source: Source<T>;
  // Optional lab-specific configuration for this project
  labConfig?: LabConfig;
  // Add other properties (animations, html, etc) as needed.
}

// -- SOURCE -- //

export type Source<T> = T extends object ? T : string;

export interface SaveSourceOptions {
  projectType?: string;
}

export interface UpdateSourceOptions extends SaveSourceOptions {
  currentVersion: string;
  replace: boolean;
  firstSaveTimestamp: string;
  tabId: string | null;
}
