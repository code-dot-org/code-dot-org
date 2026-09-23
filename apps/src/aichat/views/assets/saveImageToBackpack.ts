import {ShowToast} from '@code-dot-org/component-library/toast';
import {uniqueFileName} from '@codebridge/utils';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  isUnifiedApi,
  SaveToBackpackApi,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/saveToBackpackHelper';
import {toastOptionsFor} from '@cdo/apps/sharedComponents/backpack/backpackToasts';

interface SaveImageToBackpackParams {
  backpackApi: SaveToBackpackApi;
  /** Image to copy into the backpack. */
  url: string;
  /** Name to save under, before deduplication. */
  fileName: string;
  showToast: ShowToast;
  /** Error reporting for the legacy backpack, which does not use toasts. */
  onLegacyError: () => void;
}

/**
 * Copy an image from a chat message into the user's backpack, under a name no file
 * there already holds.
 */
export const saveImageToBackpack = async ({
  backpackApi,
  url,
  fileName,
  showToast,
  onLegacyError,
}: SaveImageToBackpackParams) => {
  const unifiedApi = isUnifiedApi(backpackApi) ? backpackApi : undefined;

  // The unified backpack reports failures as toasts; the legacy backpack keeps
  // its notification in the chat.
  const reportError = (
    toastMessage: string,
    logMessage: string,
    error?: Error
  ) => {
    if (unifiedApi) {
      showToast(toastMessage, toastOptionsFor('danger'));
    } else {
      onLegacyError();
    }
    Lab2Registry.getInstance().getMetricsReporter().logError(logMessage, error);
  };

  // The unified backpack writes to the universal backpack, so a name taken in any
  // backpack collides.
  let existingFileNames: string[];
  try {
    existingFileNames = isUnifiedApi(backpackApi)
      ? Object.values(await backpackApi.getFileLists()).flat()
      : await backpackApi.getFileList();
  } catch (error) {
    reportError(
      `Couldn't save ${fileName} to your Backpack. Please try again.`,
      'Backpack file list fetch error',
      error as Error
    );
    return;
  }

  const targetName = uniqueFileName(fileName, existingFileNames, '-');
  if (unifiedApi) {
    showToast(
      `Saving ${targetName} to your Backpack...`,
      toastOptionsFor('info')
    );
  }

  // The progress toast above never expires on its own, so every path from here has
  // to end in a toast that replaces it.
  try {
    await new Promise<void>((resolve, reject) => {
      backpackApi
        .saveFileFromUrl(
          targetName,
          url,
          // A save that fails before it starts reports failure with no error.
          error =>
            reject(
              error ?? new Error(`Could not save ${targetName} to the backpack`)
            ),
          resolve
        )
        .catch(reject);
    });
  } catch (error) {
    reportError(
      `Couldn't save ${targetName} to your Backpack. Please try again.`,
      'Save to backpack error',
      error as Error
    );
    return;
  }

  if (unifiedApi) {
    showToast(
      `${targetName} saved to your Backpack.`,
      toastOptionsFor('success')
    );
  }
};
