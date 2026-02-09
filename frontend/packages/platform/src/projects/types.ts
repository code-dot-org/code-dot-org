/// ------ PROJECTS ------ ///
import type {Channel} from '@code-dot-org/core/api';

export type {
  AppName,
  LabConfig,
  ProjectFileType,
  ProjectFolder,
  ProjectType,
  FileId,
  FolderId,
  MultiFileSource,
  ProjectFile,
  ProjectVersion,
  ProjectSources,
  ProjectAndSources,
  Source,
  UpdateSourceOptions,
  SaveSourceOptions,
} from '@code-dot-org/core/api';

export type {Channel};
export type DefaultChannel = Pick<Channel, 'name'>;
