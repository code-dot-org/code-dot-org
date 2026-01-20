import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
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
  });
  if (results.type === 'confirm') {
    await fetchAndSaveFile(
      EVENTS.IMPORT_FROM_BACKPACK_RENAME,
      backpackApi,
      channelId,
      addAlert,
      saveFile,
      createNewFile,
      findIdForFileName,
      selectedFileName,
      newFileName
    );
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
  newFileName?: string
) => {
  // The file name is a duplicate, but not a support file.
  // Give user the choice to replace or import with the new name.
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericConfirmation,
    title: 'A file with this name already exists',
    message: `Would you like to replace the existing file with this file or import this file as ${newFileName}?`,
    confirmText: 'Replace existing file',
    neutralText: `Import as ${newFileName}`,
  });
  if (results.type === 'confirm') {
    // Import as replacement
    await fetchAndSaveFile(
      EVENTS.IMPORT_FROM_BACKPACK_REPLACE,
      backpackApi,
      channelId,
      addAlert,
      saveFile,
      createNewFile,
      findIdForFileName,
      selectedFileName
    );
  } else if (results.type === 'neutral') {
    // Import as new file
    await fetchAndSaveFile(
      EVENTS.IMPORT_FROM_BACKPACK_RENAME,
      backpackApi,
      channelId,
      addAlert,
      saveFile,
      createNewFile,
      findIdForFileName,
      selectedFileName,
      newFileName
    );
  }
};

export const fetchAndSaveFile = async (
  successMetric: string,
  backpackApi: BackpackClientApi,
  channelId: string,
  addAlert: (type: 'success' | 'danger', message: string) => void,
  saveFile: (fileId: string, contents: string, url?: string) => void,
  createNewFile: (fileName: string, contents: string, url?: string) => void,
  findIdForFileName: (fileName: string) => string | undefined,
  selectedFileName: string,
  newFileName?: string
) => {
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
    // Handle image file content as a blob, and upload as an asset.
    // Store the url as the new file contents.
    const blob = await response.blob();
    const uuid = createUuid();
    const fileType = selectedFileName.split('.').pop();
    const uploadUrl = `/v3/assets/${channelId}/${uuid}.${fileType}`;
    try {
      await HttpClient.put(uploadUrl, blob);
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(
          'Backpack could not upload image file to assets channel',
          error as Error
        );
      addAlert('danger', errorMessage);
      return;
    }
    url = uploadUrl;
  } else {
    fileContent = await response.text();
  }
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
