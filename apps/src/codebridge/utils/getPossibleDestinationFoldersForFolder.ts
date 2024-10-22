import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectFolder, ProjectType} from '@codebridge/types';

import {validateFolderName} from './validateFolderName';

type GetPossibleDestinationFoldersForFolderArgs = {
  folder: ProjectFolder;
  projectFolders: ProjectType['folders'];
};

/**
 * Determines a list of possible destination folders for a given folder.
 *
 * Call it with a folder + the project.folders object, and it will return a list of folders that the folder could be moved into.
 *
 * @param args An object containing information about the folder and project.
 *
 * @property args.folder - The ProjectFolder object representing the folder in question.
 * @property args.projectFolders - An object representing the available folders in the project.
 *                                  The structure should match the `ProjectType['folders']` type from `@codebridge/types`.
 *
 * @returns An array of folder objects that this folder could be placed into
 *
 */
export const getPossibleDestinationFoldersForFolder = ({
  folder,
  projectFolders,
}: GetPossibleDestinationFoldersForFolderArgs) =>
  [{id: DEFAULT_FOLDER_ID}, ...Object.values(projectFolders)].filter(
    f =>
      f.id !== folder.id &&
      !Boolean(
        validateFolderName({
          folderName: folder.name,
          parentId: f.id,
          projectFolders,
        })
      )
  );
