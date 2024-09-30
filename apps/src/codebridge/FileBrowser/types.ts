import {FileId, FolderId} from '@codebridge/types';

import {ProjectFileType} from '@cdo/apps/lab2/types';

export enum DragType {
  FILE,
  FOLDER,
}

export type downloadFileType = (fileId: FileId) => void;
export type moveFilePromptType = (fileId: FileId) => void;
export type moveFolderPromptType = (folderId: FolderId) => void;
export type newFilePromptType = (
  folderId?: FolderId,
  fileType?: ProjectFileType
) => void;
export type newFolderPromptType = (parentId?: FolderId) => void;
export type renameFilePromptType = (fileId: FileId) => void;
export type renameFolderPromptType = (folderId: FolderId) => void;
export type setFileType = (fileId: FileId, type: ProjectFileType) => void;
