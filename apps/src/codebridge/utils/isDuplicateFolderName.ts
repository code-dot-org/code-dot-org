import {ProjectFolder} from '@codebridge/types';

type IsDuplicateFolderNameArgs = {
  folderName: string;
  parentId: string;
  projectFolders: Record<string, ProjectFolder>;
};

// Check if the foldername is already in use in the given folder.
// If it is, alert the user and return true, otherwise return false.
export const isDuplicateFolderName = ({
  folderName,
  parentId,
  projectFolders,
}: IsDuplicateFolderNameArgs) =>
  Object.values(projectFolders).some(
    f => f.name === folderName && f.parentId === parentId
  );
