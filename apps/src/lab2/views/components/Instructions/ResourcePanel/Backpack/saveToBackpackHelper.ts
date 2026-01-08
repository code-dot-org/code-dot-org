import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

export const fetchAndSaveFile = async (
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
  } else {
    const fileId = findIdForFileName(selectedFileName);
    if (fileId) {
      saveFile(fileId, fileContent, url);
      addAlert('success', successMessage);
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
