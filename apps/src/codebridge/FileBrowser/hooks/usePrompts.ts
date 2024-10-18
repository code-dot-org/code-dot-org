import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  openNewFolderPrompt as globalOpenNewFolderPrompt,
  openNewFilePrompt as globalOpenNewFilePrompt,
  openMoveFilePrompt as globalOpenMoveFilePrompt,
  openMoveFolderPrompt as globalOpenMoveFolderPrompt,
  openRenameFilePrompt as globalOpenRenameFilePrompt,
  openRenameFolderPrompt as globalOpenRenameFolderPrompt,
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
 *   - **openRenameFilePrompt:** Opens a prompt for renaming a file within the project.
 *   - **openRenameFolderPrompt:** Opens a prompt for renaming a folder within the project.
 */
export const usePrompts = () => {
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const dialogControl = useDialogControl();

  const {
    project,
    moveFile,
    moveFolder,
    newFolder,
    newFile,
    renameFile,
    renameFolder,
  } = useCodebridgeContext();

  const sendCodebridgeAnalyticsEvent = useCallback(
    (event: string) => globalSendCodebridgeAnalyticsEvent(event, appName),
    [appName]
  );

  const openNewFolderPrompt = usePartialApply(globalOpenNewFolderPrompt, {
    dialogControl,
    newFolder,
    projectFolders: project.folders,
    sendCodebridgeAnalyticsEvent,
  } satisfies PAFunctionArgs<typeof globalOpenNewFolderPrompt>);

  const openNewFilePrompt = usePartialApply(globalOpenNewFilePrompt, {
    dialogControl,
    newFile,
    projectFiles: project.files,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenNewFilePrompt>);

  const openMoveFilePrompt = usePartialApply(globalOpenMoveFilePrompt, {
    dialogControl,
    moveFile,
    projectFiles: project.files,
    projectFolders: project.folders,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenMoveFilePrompt>);

  const openMoveFolderPrompt = usePartialApply(globalOpenMoveFolderPrompt, {
    dialogControl,
    moveFolder,
    projectFolders: project.folders,
    sendCodebridgeAnalyticsEvent,
  } satisfies PAFunctionArgs<typeof globalOpenMoveFolderPrompt>);

  const openRenameFilePrompt = usePartialApply(globalOpenRenameFilePrompt, {
    dialogControl,
    renameFile,
    projectFiles: project.files,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenRenameFilePrompt>);

  const openRenameFolderPrompt = usePartialApply(globalOpenRenameFolderPrompt, {
    dialogControl,
    renameFolder,
    projectFolders: project.folders,
    sendCodebridgeAnalyticsEvent,
  } satisfies PAFunctionArgs<typeof globalOpenRenameFolderPrompt>);

  return useMemo(
    () => ({
      openNewFilePrompt,
      openNewFolderPrompt,
      openMoveFilePrompt,
      openMoveFolderPrompt,
      openRenameFilePrompt,
      openRenameFolderPrompt,
    }),
    [
      openNewFilePrompt,
      openNewFolderPrompt,
      openMoveFilePrompt,
      openMoveFolderPrompt,
      openRenameFilePrompt,
      openRenameFolderPrompt,
    ]
  );
};
