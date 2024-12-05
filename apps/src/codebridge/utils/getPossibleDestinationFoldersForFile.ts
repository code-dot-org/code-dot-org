import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectFile, ProjectType} from '@codebridge/types';

import {validateFileName} from './validateFileName';

type GetPossibleDestinationFoldersForFileArgs = {
  file: ProjectFile;
  projectFiles: ProjectType['files'];
  projectFolders: ProjectType['folders'];
  isStartMode: boolean;
  validationFile: ProjectFile | undefined;
};

/**
 * Determines a list of possible destination folders for a given project file.
 *
 * Call it with a file + various support data, and it will return a list of folders that the file could be moved into.
 *
 * @param args An object containing information about the file and project.
 *
 * @property args.file - The ProjectFile object representing the file in question.
 * @property args.projectFiles - An object representing the existing files in the project.
 *                                  The structure should match the `ProjectType['files']` type from `@codebridge/types`.
 * @property args.projectFolders - An object representing the available folders in the project.
 *                                  The structure should match the `ProjectType['folders']` type from `@codebridge/types`.
 * @property args.isStartMode - A boolean indicating whether the project is in start mode (initial creation).
 * @property args.validationFile - An optional ProjectFile object representing a file used for validation purposes.
 *
 * @returns An array of folder objects that this file could be placed into
 *
 */
export const getPossibleDestinationFoldersForFile = ({
  file,
  projectFiles,
  projectFolders,
  isStartMode,
  validationFile,
}: GetPossibleDestinationFoldersForFileArgs) =>
  [{id: DEFAULT_FOLDER_ID}, ...Object.values(projectFolders)].filter(
    f =>
      !Boolean(
        validateFileName({
          fileName: file.name,
          folderId: f.id,
          projectFiles,
          isStartMode,
          validationFile,
        })
      )
  );
