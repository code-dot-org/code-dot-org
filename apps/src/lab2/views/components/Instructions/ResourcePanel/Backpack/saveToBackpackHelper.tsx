import React from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {moderateImage} from '@cdo/apps/lab2/utils/moderateImage';
import {DialogControlInterface, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

export const handleSaveSupportFile = async (
  dialogControl: DialogControlInterface,
  backpackApi: BackpackClientApi,
  channelId: string,
  addAlert: (type: 'success' | 'danger', message: string) => void,
  saveFile: (fileId: string, contents: string, url?: string) => void,
  createNewFile: (fileName: string, contents: string, url?: string) => void,
  findIdForFileName: (fileName: string) => string | undefined,
  selectedFileName: string,
  newFileName?: string
) => {
  // The user wants to import a file that has the same name as a hidden support file.
  // Give the user a choice to import with a new name or cancel the import.
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericConfirmation,
    title: 'A file with this name already exists',
    message: `This file already exists in the level's support code. Would you like to import it as ${newFileName}?`,
    confirmText: `Import as ${newFileName}`,
    icon: {iconName: 'exclamation-circle', iconStyle: 'solid'},
  });
  if (results.type === 'confirm') {
    await fetchAndSaveFile({
      successMetric: EVENTS.IMPORT_FROM_BACKPACK_RENAME,
      backpackApi,
      channelId,
      addAlert,
      saveFile,
      createNewFile,
      findIdForFileName,
      selectedFileName,
      newFileName,
    });
  }
};

export const handleSaveDuplicateFile = async (
  dialogControl: DialogControlInterface,
  backpackApi: BackpackClientApi,
  channelId: string,
  addAlert: (type: 'success' | 'danger', message: string) => void,
  saveFile: (fileId: string, contents: string, url?: string) => void,
  createNewFile: (fileName: string, contents: string, url?: string) => void,
  findIdForFileName: (fileName: string) => string | undefined,
  selectedFileName: string,
  newFileName?: string,
  onImageFlagged?: (
    file: File,
    fileType: string,
    uploadFunction: () => Promise<void>
  ) => void,
  isSecondaryBackpack?: boolean
) => {
  // The file name is a duplicate, but not a support file.
  // Give user the choice to replace or import with the new name.
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericConfirmation,
    title: 'A file with this name already exists',
    bodyComponent: (
      <>
        A file with the same name already exists in your project, would you like
        to replace the existing file with this file or import this file as{' '}
        <strong>{newFileName}</strong>?
      </>
    ),
    confirmText: `Import as ${newFileName}`,
    neutralText: 'Replace existing file',
    icon: {iconName: 'exclamation-circle', iconStyle: 'solid'},
  });
  if (results.type === 'confirm') {
    // Import as replacement
    await fetchAndSaveFile({
      successMetric: EVENTS.IMPORT_FROM_BACKPACK_REPLACE,
      backpackApi,
      channelId,
      addAlert,
      saveFile,
      createNewFile,
      findIdForFileName,
      selectedFileName,
      newFileName,
      onImageFlagged,
      isSecondaryBackpack,
    });
  } else if (results.type === 'neutral') {
    // Import as new file
    await fetchAndSaveFile({
      successMetric: EVENTS.IMPORT_FROM_BACKPACK_RENAME,
      backpackApi,
      channelId,
      addAlert,
      saveFile,
      createNewFile,
      findIdForFileName,
      selectedFileName,
      onImageFlagged,
      isSecondaryBackpack,
    });
  }
};

export interface FetchAndSaveFileParams {
  successMetric: string;
  backpackApi: BackpackClientApi;
  channelId: string;
  addAlert: (type: 'success' | 'danger', message: string) => void;
  saveFile: (fileId: string, contents: string, url?: string) => void;
  createNewFile: (fileName: string, contents: string, url?: string) => void;
  findIdForFileName: (fileName: string) => string | undefined;
  selectedFileName: string;
  newFileName?: string;
  isSecondaryBackpack?: boolean;
  onImageFlagged?: (
    file: File,
    fileType: string,
    uploadFunction: () => Promise<void>
  ) => void;
}

export const fetchAndSaveFile = async ({
  successMetric,
  backpackApi,
  channelId,
  addAlert,
  saveFile,
  createNewFile,
  findIdForFileName,
  selectedFileName,
  newFileName,
  isSecondaryBackpack,
  onImageFlagged,
}: FetchAndSaveFileParams) => {
  const errorMessage = `An error occurred while adding ${
    newFileName || selectedFileName
  } to your project, please try again.`;
  const successMessage = `${
    newFileName || selectedFileName
  } has been added to your project.`;
  const response = await backpackApi.fetchFileResponse(selectedFileName);
  if (!response || response instanceof Error) {
    const responseError = response instanceof Error ? response : undefined;
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Backpack file fetch error', responseError);
    addAlert('danger', errorMessage);
    return;
  }
  let fileContent = '';
  let url: string | undefined = undefined;
  if (response?.headers.get('Content-Type')?.startsWith('image/')) {
    const fileType = selectedFileName.split('.').pop();
    const blob = await response.blob();
    const uuid = createUuid();
    const uploadUrl = `/v3/assets/${channelId}/${uuid}.${fileType}`;

    // Moderate image if file is from a secondary backpack.
    if (isSecondaryBackpack && fileType) {
      // Convert blob to File object for moderation
      const contentType = response.headers.get('Content-Type') || 'image/*';
      const file = new File([blob], selectedFileName, {type: contentType});
      const appName = Lab2Registry.getInstance().getAppName();

      const moderationStatus = await moderateImage(
        file,
        fileType,
        appName || undefined
      );
      console.log('moderationStatus', moderationStatus);
      if (moderationStatus === 'flagged') {
        const saveBackpackImageFileToProjectFunction = async () => {
          const uploadedUrl = await handleSaveImageToChannelAssets(
            uploadUrl,
            blob,
            errorMessage,
            addAlert
          );
          if (uploadedUrl) {
            await handleSaveFileToProject(
              newFileName,
              selectedFileName,
              createNewFile,
              findIdForFileName,
              saveFile,
              fileContent,
              uploadedUrl,
              errorMessage,
              addAlert,
              successMetric,
              successMessage
            );
          }
        };
        // FlagedImageModal will be shown to the user and user can choose to add the image file to the project or not.
        onImageFlagged &&
          onImageFlagged(
            file,
            fileType,
            saveBackpackImageFileToProjectFunction
          );
        return;
      }
    }

    // Upload image to assets channel without moderation because image was already moderated when uploaded to project (for primary backpack files).
    const uploadedUrl = await handleSaveImageToChannelAssets(
      uploadUrl,
      blob,
      errorMessage,
      addAlert
    );
    if (uploadedUrl) {
      url = uploadedUrl;
    } else {
      return; // Exit if upload failed
    }
  } else {
    fileContent = await response.text();
  }
  await handleSaveFileToProject(
    newFileName,
    selectedFileName,
    createNewFile,
    findIdForFileName,
    saveFile,
    fileContent,
    url,
    errorMessage,
    addAlert,
    successMetric,
    successMessage
  );
};

// Handle image file content as a blob, and upload as an asset.
// Return the url for the new file contents.
const handleSaveImageToChannelAssets = async (
  uploadUrl: string,
  blob: Blob,
  errorMessage: string,
  addAlert: (type: 'success' | 'danger', message: string) => void
): Promise<string | undefined> => {
  try {
    await HttpClient.put(uploadUrl, blob);
    return uploadUrl;
  } catch (error) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError(
        'Backpack could not upload image file to assets channel',
        error as Error
      );
    addAlert('danger', errorMessage);
    return undefined;
  }
};

// Save backpack file to project.
const handleSaveFileToProject = async (
  newFileName: string | undefined,
  selectedFileName: string,
  createNewFile: (fileName: string, contents: string, url?: string) => void,
  findIdForFileName: (fileName: string) => string | undefined,
  saveFile: (fileId: string, contents: string, url?: string) => void,
  fileContent: string,
  url: string | undefined,
  errorMessage: string,
  addAlert: (type: 'success' | 'danger', message: string) => void,
  successMetric: string,
  successMessage: string
) => {
  if (newFileName) {
    createNewFile(newFileName, fileContent, url);
    addAlert('success', successMessage);
    sendLab2AnalyticsEvent(successMetric, {
      fileType: newFileName.split('.').pop()?.toLowerCase() || '',
    });
  } else {
    const fileId = findIdForFileName(selectedFileName);
    if (fileId) {
      saveFile(fileId, fileContent, url);
      addAlert('success', successMessage);
      sendLab2AnalyticsEvent(successMetric, {
        fileType: selectedFileName.split('.').pop()?.toLowerCase() || '',
      });
    } else {
      // If for some reason we can't find the file to replace, show an error.
      // This should not happen, but could theoretically happen if the project was updated while
      // we were importing the backpack file.
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Backpack could not find file to replace in project');
      addAlert('danger', errorMessage);
      return;
    }
  }
};
