import {FileId, FolderId} from '@codebridge/types';

export type moveFilePromptType = (fileId: FileId) => void;
export type newFilePromptType = (folderId?: FolderId) => void;
export type newFolderPromptType = (parentId?: FolderId) => void;
export type renameFilePromptType = (fileId: FileId) => void;
export type renameFolderPromptType = (folderId: FolderId) => void;
export type setFileVisibilityType = (fileId: FileId, hidden: boolean) => void;
export type setFileIsValidationType = (
  fileId: FileId,
  isValidation: boolean
) => void;
