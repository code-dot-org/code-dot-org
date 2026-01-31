import {z} from 'zod';
import {
  FileIdSchema,
  FolderIdSchema,
  MultiFileSourceSchema,
  ProjectFileSchema,
  ProjectFolderSchema,
  ProjectSourcesSchema,
  ProjectVersionSchema,
} from './sources.schemata';

export type FileId = z.infer<typeof FileIdSchema>;
export type FolderId = z.infer<typeof FolderIdSchema>;
export type MultiFileSource = z.infer<typeof MultiFileSourceSchema>;
export type ProjectFile = z.infer<typeof ProjectFileSchema>;
export type ProjectFolder = z.infer<typeof ProjectFolderSchema>;
export type ProjectSources = z.infer<typeof ProjectSourcesSchema>;
export type ProjectVersion = z.infer<typeof ProjectVersionSchema>;
export type LabConfig = ProjectSources['labConfig'];

export interface SaveSourceOptions {
  projectType?: string;
}

export interface UpdateSourceOptions extends SaveSourceOptions {
  currentVersion: string;
  replace: boolean;
  firstSaveTimestamp: string;
  tabId: string | null;
}
