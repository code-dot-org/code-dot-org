import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {usePrompts} from '@codebridge/FileBrowser/hooks';
import {ProjectFile} from '@codebridge/types';
import {
  enableUserAddedSelectionContext,
  getFolderPath,
  getPossibleDestinationFoldersForFile,
} from '@codebridge/utils';
import fileDownload from 'js-file-download';
import {useMemo} from 'react';

import {sendAnalytics} from '@cdo/apps/aichat/redux';
import {
  addItemToUserAddedSelectionContext,
  addStagedFile,
} from '@cdo/apps/aichat/redux/slice';
import {AssetSource} from '@cdo/apps/aichat/types/assets';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {WEBLAB2_IMAGE_FILE_TYPES} from '@cdo/apps/weblab2/constants';

import {useStartModeFileRowOptions} from './useStartModeFileRowOptions';

/**
 * Handles downloading a file and sending an analytics event.
 * @param file - The ProjectFile object representing the file to download.
 * @returns Nothing (void)
 */
const handleFileDownload = async (file: ProjectFile) => {
  try {
    if (WEBLAB2_IMAGE_FILE_TYPES.includes(file.language) && file.url) {
      // File is an image and has a url, so download from browser
      const image = await fetch(file.url);
      if (!image.ok) {
        console.error(
          `Failed to fetch image: ${image.status} ${image.statusText}`
        );
        alert('Image retrieval failed. Please try again.');
      }
      const blob = await image.blob();
      fileDownload(blob, file.name);
    } else {
      fileDownload(file.contents, file.name);
    }
    sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_DOWNLOAD_FILE, {
      fileType: file.language?.toLowerCase() || '',
    });
  } catch (error) {
    console.error('File download failed:', error);
    alert('File download failed. Please try again.');
  }
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
    config: {supportedFileTypes},
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
        condition: enableUserAddedSelectionContext(appName),
        iconName: 'message-code',
        labelText: codebridgeI18n.addToAiTutorContext(),
        clickHandler: () => {
          const folderPath = getFolderPath(file.folderId, projectFolders);
          let fullFilename = file.name;
          if (folderPath !== '/') {
            fullFilename = (folderPath + '/' + file.name).substring(1); // remove leading slash
          }
          dispatch(
            sendAnalytics(EVENTS.AI_TUTOR_FILE_ADDED_TO_CONTEXT, {
              file: fullFilename,
              codingLanguage:
                fullFilename?.split('.').pop()?.toLowerCase() || '',
            })
          );

          // Files with URLs are non-text files.
          if (file.url) {
            // Files with a type are provided by a levelbuilder.
            const assetSource = file.type
              ? AssetSource.LEVEL_UUID
              : AssetSource.PROJECT;
            const stagedFilename = file.url.split('/').slice(-1)[0];
            dispatch(
              addStagedFile({
                key: `${stagedFilename}-${Date.now()}`,
                asset: {
                  filename: stagedFilename,
                  source: assetSource,
                },
                loaded: true,
              })
            );
          } else {
            dispatch(
              addItemToUserAddedSelectionContext({
                displayName: fullFilename,
                filename: fullFilename,
                sourceCode: file.contents,
              })
            );
          }
        },
      },
      {
        condition: supportedFileTypes.includes(file.language),
        iconName: 'download',
        labelText: codebridgeI18n.downloadFile(),
        clickHandler: () => handleFileDownload(file),
      },
      {
        condition: !isLocked,
        iconName: 'trash',
        labelText: codebridgeI18n.deleteFile(),
        clickHandler: () => openConfirmDeleteFile({file}),
      },
      {
        condition: backpackApi !== null,
        iconName: 'backpack',
        labelText: codebridgeI18n.saveToBackpackTitle(),
        clickHandler: () =>
          backpackApi
            ? openSaveToBackpackPrompt({file, backpackApi})
            : undefined,
      },
    ],
    [
      appName,
      backpackApi,
      dispatch,
      supportedFileTypes,
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
