import {FileId, FolderId} from '@codebridge/types';

import {ProjectFileType} from '@cdo/apps/lab2/types';

export type downloadFileType = (fileId: FileId) => void;
export type moveFilePromptType = (fileId: FileId) => void;
export type moveFileType = (
  fileId: FileId,
  destinationFolderName: string
) => void;
export type newFilePromptType = (folderId?: FolderId) => void;
export type newFileType = (folderId: FolderId, fileName: string) => void;
export type newFolderPromptType = (parentId?: FolderId) => void;
export type newFolderType = (parentId: FolderId, folderName: string) => void;
export type renameFilePromptType = (fileId: FileId) => void;
export type renameFileType = (fileId: FileId, newName: string) => void;
export type renameFolderPromptType = (folderId: FolderId) => void;
export type renameFolderType = (folderId: FolderId, newName: string) => void;
export type setFileType = (fileId: FileId, type: ProjectFileType) => void;
