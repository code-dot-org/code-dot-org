import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  openNewFolderPrompt as globalOpenNewFolderPrompt,
  openNewFilePrompt as globalOpenNewFilePrompt,
  openMoveFilePrompt as globalOpenMoveFilePrompt,
  openMoveFolderPrompt as globalOpenMoveFolderPrompt,
} from '@codebridge/FileBrowser/prompts';
import {sendCodebridgeAnalyticsEvent as globalSendCodebridgeAnalyticsEvent} from '@codebridge/utils';
import {useCallback, useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {usePartialApply, PAFunctionArgs} from '@cdo/apps/lab2/hooks';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Provides functions to open new file or folder prompts within the application.
 *
 * @returns An object containing the following functions:
 *   - **openMoveFilePrompt:** Opens a prompt for moving a file within the project.
 *   - **openMoveFolderPrompt:** Opens a prompt for moving a folder within the project.
 *   - **openNewFilePrompt:** Opens a prompt for creating a new file within the project.
 *   - **openNewFolderPrompt:** Opens a prompt for creating a new folder within the project.
 */
export const usePrompts = () => {
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const dialogControl = useDialogControl();

  const {project, moveFile, moveFolder, newFolder, newFile} =
    useCodebridgeContext();

  const sendCodebridgeAnalyticsEvent = useCallback(
    (event: string) => globalSendCodebridgeAnalyticsEvent(event, appName),
    [appName]
  );

  const openNewFolderPrompt = usePartialApply(globalOpenNewFolderPrompt, {
    appName,
    dialogControl,
    newFolder,
    projectFolders: project.folders,
    sendCodebridgeAnalyticsEvent,
  } satisfies PAFunctionArgs<typeof globalOpenNewFolderPrompt>);

  const openNewFilePrompt = usePartialApply(globalOpenNewFilePrompt, {
    appName,
    dialogControl,
    newFile,
    projectFiles: project.files,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenNewFilePrompt>);

  const openMoveFilePrompt = usePartialApply(globalOpenMoveFilePrompt, {
    appName,
    dialogControl,
    moveFile,
    projectFiles: project.files,
    projectFolders: project.folders,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenMoveFilePrompt>);

  const openMoveFolderPrompt = usePartialApply(globalOpenMoveFolderPrompt, {
    appName,
    dialogControl,
    moveFolder,
    projectFolders: project.folders,
    sendCodebridgeAnalyticsEvent,
  } satisfies PAFunctionArgs<typeof globalOpenMoveFolderPrompt>);

  return useMemo(
    () => ({
      openNewFilePrompt,
      openNewFolderPrompt,
      openMoveFilePrompt,
      openMoveFolderPrompt,
    }),
    [
      openNewFilePrompt,
      openNewFolderPrompt,
      openMoveFilePrompt,
      openMoveFolderPrompt,
    ]
  );
};
