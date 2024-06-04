import {FileId, FolderId} from '@codebridge/types';

export type moveFilePromptType = (fileId: FileId) => void;
export type newFilePromptType = (folderId?: FolderId) => void;
export type newFolderPromptType = (parentId?: FolderId) => void;
export type renameFilePromptType = (fileId: FileId) => void;
export type renameFolderPromptType = (folderId: FolderId) => void;
export type toggleFileVisibilityType = (fileId: FileId) => void;
