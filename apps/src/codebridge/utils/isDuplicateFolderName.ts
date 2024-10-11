import {ProjectFolder} from '@codebridge/types';

type IsDuplicateFolderNameArgs = {
  folderName: string;
  parentId: string;
  projectFolders: Record<string, ProjectFolder>;
};

/**
 * Checks if a folder name already exists within a specific parent folder.
 *
 * @param args An object containing the following properties:
 *   - **folderName:** The name of the folder to check for duplicates.
 *   - **parentId:** The ID of the parent folder where the new folder would be created.
 *   - **projectFolders:** An array of project folders.
 *
 * @returns `true` if a folder with the same name already exists within the parent folder, otherwise `false`.
 */
export const isDuplicateFolderName = ({
  folderName,
  parentId,
  projectFolders,
}: IsDuplicateFolderNameArgs) =>
  Object.values(projectFolders).some(
    f => f.name === folderName && f.parentId === parentId
  );
