import {ProjectFile} from '@codebridge/types';
import {useMemo} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {setFileTypeThunk} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {setShowLockedFilesBanner} from '../../../redux/workspaceRedux';

/**
 * Dropdown options for the file dropdown in start mode.
 * In start mode levelbuilders can set the file type to starter, locked starter,
 * support, or validation.
 * @param file - The ProjectFile object representing the file for which options are generated.
 * @param projectHasValidationFile - Whether the project has a corresponding validation file.
 * @param allowMultipleValidationFiles - Whether to allow multiple validation files in the project.
 * @returns In start mode, an array of objects representing the context menu options.
 *   If not in start mode, returns an empty array.
 *   Each object has the following properties:
 *     - `condition`:  A boolean that determines if the option should be displayed.
 *     - `iconName`: The name of the icon to display for the option.
 *     - `labelText`: The text label to display for the option.
 *     - `clickHandler`: The function to be called when the option is clicked.
 */
export const useStartModeFileRowOptions = (
  file: ProjectFile,
  projectHasValidationFile: boolean,
  allowMultipleValidationFiles?: boolean
) => {
  const dispatch = useAppDispatch();
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const handleSetFileType = useMemo(
    () => (type: ProjectFileType) => {
      if (type === ProjectFileType.VALIDATION) {
        // Remind levelbuilders to lock any relevant start files. We only show
        // the banner for a few seconds.
        dispatch(setShowLockedFilesBanner(true));
        setTimeout(() => dispatch(setShowLockedFilesBanner(false)), 8000);
      }
      dispatch(setFileTypeThunk({fileId: file.id, type}));
    },
    [dispatch, file]
  );

  const dropdownOptions = useMemo(
    () =>
      !isStartMode
        ? []
        : [
            {
              condition:
                file.type !== ProjectFileType.VALIDATION &&
                (!projectHasValidationFile ||
                  (allowMultipleValidationFiles ?? false)),
              iconName: 'flask',
              labelText: codebridgeI18n.makeValidation(),
              clickHandler: () => handleSetFileType(ProjectFileType.VALIDATION),
              id: 'uitest-make-validation',
            },
            {
              condition:
                file.type !== ProjectFileType.STARTER && Boolean(file.type),
              iconName: 'eye',
              labelText: codebridgeI18n.makeStarter(),
              clickHandler: () => handleSetFileType(ProjectFileType.STARTER),
              id: 'uitest-make-starter',
            },
            {
              condition: file.type !== ProjectFileType.SUPPORT,
              iconName: 'eye-slash',
              labelText: codebridgeI18n.makeSupport(),
              clickHandler: () => handleSetFileType(ProjectFileType.SUPPORT),
              id: 'uitest-make-support',
            },
            {
              condition: file.type !== ProjectFileType.LOCKED_STARTER,
              iconName: 'lock',
              labelText: codebridgeI18n.makeLockedStarter(),
              clickHandler: () =>
                handleSetFileType(ProjectFileType.LOCKED_STARTER),
              id: 'uitest-make-locked-starter',
            },
          ],
    [
      isStartMode,
      projectHasValidationFile,
      allowMultipleValidationFiles,
      file.type,
      handleSetFileType,
    ]
  );

  return dropdownOptions;
};
