import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  openConfirmDeleteFile as globalOpenConfirmDeleteFile,
  openConfirmDeleteFolder as globalOpenConfirmDeleteFolder,
  openNewFolderPrompt as globalOpenNewFolderPrompt,
  openNewFilePrompt as globalOpenNewFilePrompt,
  openMoveFilePrompt as globalOpenMoveFilePrompt,
  openMoveFolderPrompt as globalOpenMoveFolderPrompt,
  openRenameFilePrompt as globalOpenRenameFilePrompt,
  openRenameFolderPrompt as globalOpenRenameFolderPrompt,
  openImportFromBackpackPrompt as globalOpenImportFromBackpackPrompt,
  openSaveToBackpackPrompt as globalOpenSaveToBackpackPrompt,
} from '@codebridge/FileBrowser/prompts';
import {sendCodebridgeAnalyticsEvent as globalSendCodebridgeAnalyticsEvent} from '@codebridge/utils';
import {useCallback, useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {usePartialApply, PAFunctionArgs} from '@cdo/apps/lab2/hooks';
import {setOverrideValidations} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {
  createNewFileThunk,
  createNewFolderThunk,
  deleteFileThunk,
  deleteFolderThunk,
  moveFileThunk,
  moveFolderThunk,
  renameFileThunk,
  renameFolderThunk,
  saveFileThunk,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {FolderId, MultiFileSource} from '@cdo/apps/lab2/types';
import {useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Provides functions to open new file or folder prompts within the application.
 *
 * @returns An object containing the following functions:
 *   - **openMoveFilePrompt:** Opens a prompt for moving a file within the source.
 *   - **openMoveFolderPrompt:** Opens a prompt for moving a folder within the source.
 *   - **openNewFilePrompt:** Opens a prompt for creating a new file within the source.
 *   - **openNewFolderPrompt:** Opens a prompt for creating a new folder within the source.
 *   - **openRenameFilePrompt:** Opens a prompt for renaming a file within the source.
 *   - **openRenameFolderPrompt:** Opens a prompt for renaming a folder within the source.
 *   - **openImportFromBackpackPrompt:** Opens a prompt for importing a file from the user's backpack.
 *   - **openSaveToBackpackPrompt:** Opens a prompt for saving a file to the user's backpack.
 */
export const usePrompts = () => {
  const {levelProperties} = useCodebridgeContext();
  const {appName, validationFile} = levelProperties;
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const dialogControl = useDialogControl();
  const dispatch = useAppDispatch();
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source as MultiFileSource
  );

  const sendCodebridgeAnalyticsEvent = useCallback(
    (event: string) => globalSendCodebridgeAnalyticsEvent(event, appName),
    [appName]
  );

  const cleanupValidationFile = useCallback(
    () => dispatch(setOverrideValidations([])),
    [dispatch]
  );

  const deleteFile = (arg: {fileId: string}) =>
    dispatch(deleteFileThunk({fileId: arg.fileId}));
  const deleteFolder = (folderId: string) =>
    dispatch(deleteFolderThunk({folderId}));
  const newFolder = (arg: {folderName: string; parentId?: FolderId}) =>
    dispatch(
      createNewFolderThunk({folderName: arg.folderName, parentId: arg.parentId})
    );
  const newFile = (arg: {
    fileName: string;
    folderId?: FolderId;
    contents?: string;
  }) =>
    dispatch(
      createNewFileThunk({
        fileName: arg.fileName,
        folderId: arg.folderId,
        contents: arg.contents,
      })
    );
  const moveFile = (fileId: string, folderId: FolderId) =>
    dispatch(moveFileThunk({fileId, folderId}));
  const moveFolder = (folderId: FolderId, parentId: FolderId) =>
    dispatch(moveFolderThunk({folderId, parentId}));
  const renameFile = (fileId: string, newName: string) =>
    dispatch(renameFileThunk({fileId, newName}));
  const renameFolder = (folderId: FolderId, newName: string) =>
    dispatch(renameFolderThunk({folderId, newName}));
  const saveFile = (fileId: string, contents: string) =>
    dispatch(saveFileThunk({fileId, contents}));

  const openConfirmDeleteFile = usePartialApply(globalOpenConfirmDeleteFile, {
    dialogControl,
    deleteFile,
    sendCodebridgeAnalyticsEvent,
    cleanupValidationFile,
  } satisfies PAFunctionArgs<typeof globalOpenConfirmDeleteFile>);

  const openConfirmDeleteFolder = usePartialApply(
    globalOpenConfirmDeleteFolder,
    {
      dialogControl,
      deleteFolder,
      sendCodebridgeAnalyticsEvent,
      projectFiles: source.files,
      projectFolders: source.folders,
    } satisfies PAFunctionArgs<typeof globalOpenConfirmDeleteFolder>
  );

  const openNewFolderPrompt = usePartialApply(globalOpenNewFolderPrompt, {
    dialogControl,
    newFolder,
    projectFolders: source.folders,
    sendCodebridgeAnalyticsEvent,
  } satisfies PAFunctionArgs<typeof globalOpenNewFolderPrompt>);

  const openNewFilePrompt = usePartialApply(globalOpenNewFilePrompt, {
    dialogControl,
    newFile,
    projectFiles: source.files,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenNewFilePrompt>);

  const openMoveFilePrompt = usePartialApply(globalOpenMoveFilePrompt, {
    dialogControl,
    moveFile,
    projectFiles: source.files,
    projectFolders: source.folders,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenMoveFilePrompt>);

  const openMoveFolderPrompt = usePartialApply(globalOpenMoveFolderPrompt, {
    dialogControl,
    moveFolder,
    projectFolders: source.folders,
    sendCodebridgeAnalyticsEvent,
  } satisfies PAFunctionArgs<typeof globalOpenMoveFolderPrompt>);

  const openRenameFilePrompt = usePartialApply(globalOpenRenameFilePrompt, {
    dialogControl,
    renameFile,
    projectFiles: source.files,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenRenameFilePrompt>);

  const openRenameFolderPrompt = usePartialApply(globalOpenRenameFolderPrompt, {
    dialogControl,
    renameFolder,
    projectFolders: source.folders,
    sendCodebridgeAnalyticsEvent,
  } satisfies PAFunctionArgs<typeof globalOpenRenameFolderPrompt>);

  const openImportFromBackpackPrompt = usePartialApply(
    globalOpenImportFromBackpackPrompt,
    {
      newFile,
      saveFile,
      dialogControl,
    } satisfies PAFunctionArgs<typeof globalOpenImportFromBackpackPrompt>
  );

  const openSaveToBackpackPrompt = usePartialApply(
    globalOpenSaveToBackpackPrompt,
    {
      dialogControl,
    } satisfies PAFunctionArgs<typeof globalOpenSaveToBackpackPrompt>
  );

  return useMemo(
    () => ({
      openConfirmDeleteFile,
      openConfirmDeleteFolder,
      openNewFilePrompt,
      openNewFolderPrompt,
      openMoveFilePrompt,
      openMoveFolderPrompt,
      openRenameFilePrompt,
      openRenameFolderPrompt,
      openImportFromBackpackPrompt,
      openSaveToBackpackPrompt,
    }),
    [
      openConfirmDeleteFile,
      openConfirmDeleteFolder,
      openNewFilePrompt,
      openNewFolderPrompt,
      openMoveFilePrompt,
      openMoveFolderPrompt,
      openRenameFilePrompt,
      openRenameFolderPrompt,
      openImportFromBackpackPrompt,
      openSaveToBackpackPrompt,
    ]
  );
};
