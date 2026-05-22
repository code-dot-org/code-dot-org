import {z} from 'zod';
import {
  FileIdSchema,
  FolderIdSchema,
  MultiFileSourceSchema,
  ProjectFileSchema,
  ProjectFileTypes,
  ProjectFolderSchema,
  ProjectSourcesSchema,
  ProjectVersionSchema,
  SourcesRestoreResponseSchema,
  SourcesUpdateResponseSchema,
} from './sources.schemata';

export type FileId = z.infer<typeof FileIdSchema>;
export type FolderId = z.infer<typeof FolderIdSchema>;
export type MultiFileSource = z.infer<typeof MultiFileSourceSchema>;
export type ProjectFile = z.infer<typeof ProjectFileSchema>;
export type ProjectFolder = z.infer<typeof ProjectFolderSchema>;
export type ProjectSourcesAny = z.infer<typeof ProjectSourcesSchema>;
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

export type SourcesUpdateResponse = z.infer<typeof SourcesUpdateResponseSchema>;
export type SourcesRestoreResponse = z.infer<
  typeof SourcesRestoreResponseSchema
>;

export type Source<T> = T extends object ? T : string;

/** The project sources, optionally typed with specific source data */
export type ProjectSources<T = undefined> = T extends undefined
  ? ProjectSourcesAny
  : Omit<ProjectSourcesAny, 'source'> & {
      /** The source data */
      source: Source<T>;
    };

export type ProjectFileType =
  (typeof ProjectFileTypes)[keyof typeof ProjectFileTypes];
