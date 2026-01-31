/// ------ PROJECTS ------ ///
import type {Channel, ProjectAndSources} from '@code-dot-org/api/channels';
import type {AppName, ProjectType} from '@code-dot-org/api/projects';

export type {AppName, ProjectType};
export type {Channel, ProjectAndSources};

export type {
  LabConfig,
  ProjectFileType,
  ProjectFolder,
  FileId,
  FolderId,
  MultiFileSource,
  ProjectFile,
  ProjectVersion,
  ProjectSources,
  Source,
  UpdateSourceOptions,
  SaveSourceOptions,
} from '@code-dot-org/core/api';

export type DefaultChannel = Pick<Channel, 'name'>;
