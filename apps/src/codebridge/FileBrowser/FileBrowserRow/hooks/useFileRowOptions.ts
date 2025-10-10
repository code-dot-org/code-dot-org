import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {usePrompts} from '@codebridge/FileBrowser/hooks';
import {ProjectFile} from '@codebridge/types';
import {
  enableUserAddedSelectionContext,
  getFolderPath,
  getPossibleDestinationFoldersForFile,
  sendCodebridgeAnalyticsEvent,
} from '@codebridge/utils';
import fileDownload from 'js-file-download';
import {useMemo} from 'react';

import {addItemToUserAddedSelectionContext} from '@cdo/apps/aichat/redux/slice';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useStartModeFileRowOptions} from './useStartModeFileRowOptions';

/**
 * Handles downloading a file and sending an analytics event.
 * @param file - The ProjectFile object representing the file to download.
 * @param appName - (optional) The name of the application triggering the download, used for analytics.
 * @returns Nothing (void)
 */
const handleFileDownload = (file: ProjectFile, appName: string | undefined) => {
  fileDownload(file.contents, file.name);
  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DOWNLOAD_FILE, appName);
};

/**
 * Generates options for the context menu displayed for a file row in the file browser.
 * @param file - The ProjectFile object representing the file for which options are generated.
 * @param hasValidationFile - Whether the file has a corresponding validation file.
 * @returns An array of objects representing the context menu options.
 *   Each object has the following properties:
 *     - `condition`:  A boolean that determines if the option should be displayed.
 *     - `iconName`: The name of the icon to display for the option.
 *     - `labelText`: The text label to display for the option.
 *     - `clickHandler`: The function to be called when the option is clicked.
 */
export const useFileRowOptions = (
  file: ProjectFile,
  hasValidationFile: boolean
) => {
  const {
    config: {editableFileTypes},
    levelProperties,
  } = useCodebridgeContext();
  const {files: projectFiles, folders: projectFolders} = useAppSelector(
    state => state.lab2Project.projectSources?.source as MultiFileSource
  );
  const dispatch = useAppDispatch();

  const backpackApi = useBackpackAPIContext();

  const {
    openConfirmDeleteFile,
    openMoveFilePrompt,
    openRenameFilePrompt,
    openSaveToBackpackPrompt,
  } = usePrompts();

  const appName = levelProperties.appName;
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const isLocked = !isStartMode && file.type === ProjectFileType.LOCKED_STARTER;

  const dropdownOptions = useMemo(
    () => [
      {
        condition:
          !isLocked &&
          Boolean(
            getPossibleDestinationFoldersForFile({
              file,
              projectFiles,
              projectFolders,
              isStartMode,
              validationFile: undefined,
            }).length
          ),
        iconName: 'arrow-right',
        labelText: codebridgeI18n.moveFile(),
        clickHandler: () => openMoveFilePrompt({fileId: file.id}),
      },
      {
        condition: !isLocked,
        iconName: 'pencil',
        labelText: codebridgeI18n.renameFile(),
        clickHandler: () => openRenameFilePrompt({fileId: file.id}),
      },
      {
        condition: enableUserAddedSelectionContext(appName, file.url),
        iconName: 'message-code',
        labelText: codebridgeI18n.addToAiTutorContext(),
        clickHandler: () => {
          const folderPath = getFolderPath(file.folderId, projectFolders);
          let fullFilename = file.name;
          if (folderPath !== '/') {
            fullFilename = (folderPath + '/' + file.name).substring(1); // remove leading slash
          }
          dispatch(
            addItemToUserAddedSelectionContext({
              displayName: fullFilename,
              sourceCode: file.contents,
              filename: fullFilename,
            })
          );
        },
      },
      {
        condition: editableFileTypes.includes(file.language),
        iconName: 'download',
        labelText: codebridgeI18n.downloadFile(),
        clickHandler: () => handleFileDownload(file, appName),
      },
      {
        condition: !isLocked,
        iconName: 'trash',
        labelText: codebridgeI18n.deleteFile(),
        clickHandler: () => openConfirmDeleteFile({file}),
      },
      {
        condition: true,
        iconName: 'backpack',
        labelText: codebridgeI18n.saveToBackpackTitle(),
        clickHandler: () => openSaveToBackpackPrompt({file, backpackApi}),
      },
    ],
    [
      appName,
      backpackApi,
      dispatch,
      editableFileTypes,
      file,
      isLocked,
      isStartMode,
      openConfirmDeleteFile,
      openMoveFilePrompt,
      openRenameFilePrompt,
      openSaveToBackpackPrompt,
      projectFiles,
      projectFolders,
    ]
  );

  const startModeFileOptions = useStartModeFileRowOptions(
    file,
    hasValidationFile
  );

  const allFileDropdownOptions = useMemo(
    () => [...dropdownOptions, ...startModeFileOptions],
    [dropdownOptions, startModeFileOptions]
  );

  return allFileDropdownOptions;
};
