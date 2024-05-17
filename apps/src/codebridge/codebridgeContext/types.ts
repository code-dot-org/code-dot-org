import {ProjectType, FileId, FolderId} from '@codebridge/types';
export type ReplaceProjectFunction = (project: ProjectType) => void;

export type SaveFileFunction = (fileId: FileId, contents: string) => void;
export type CloseFileFunction = (fileId: FileId) => void;
export type SetActiveFileFunction = (fileId: FileId) => void;

export type NewFolderFunction = (arg: {
  folderId: FolderId;
  folderName: string;
  parentId?: FolderId;
}) => void;
export type ToggleOpenFolderFunction = (folderId: FolderId) => void;
export type DeleteFolderFunction = (folderId: FolderId) => void;
export type OpenFileFunction = (fileId: FileId) => void;
export type DeleteFileFunction = (fileId: FileId) => void;
export type NewFileFunction = (arg: {
  fileId: FileId;
  fileName: string;
  folderId?: FolderId;
  contents?: string;
}) => void;
export type RenameFileFunction = (fileId: FileId, newName: string) => void;
export type RenameFolderFunction = (folderId: string, newName: string) => void;
export type MoveFileFunction = (fileId: FileId, folderId: FolderId) => void;
export type SetFileVisibilityFunction = (fileId: FileId, hide: boolean) => void;
