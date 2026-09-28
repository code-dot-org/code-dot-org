import {ShowToast} from '@code-dot-org/component-library/toast';
import {uniqueFileName} from '@codebridge/utils';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  backpackSaveError,
  notifySaved,
  notifySaving,
  notifyWithToast,
} from '@cdo/apps/sharedComponents/backpack/backpackToasts';
import type UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

interface SaveImageToBackpackParams {
  backpackApi: UnifiedBackpackClientApi;
  /** Image to copy into the backpack. */
  url: string;
  /** Name to save under, before deduplication. */
  fileName: string;
  showToast: ShowToast;
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
}: SaveImageToBackpackParams) => {
  const notify = notifyWithToast(showToast);

  const reportError = (
    toastMessage: string,
    logMessage: string,
    error?: Error
  ) => {
    notify('danger', toastMessage);
    Lab2Registry.getInstance().getMetricsReporter().logError(logMessage, error);
  };

  // Writes go to the universal backpack, so a name taken in any backpack collides.
  let existingFileNames: string[];
  try {
    existingFileNames = Object.values(await backpackApi.getFileLists()).flat();
  } catch (error) {
    reportError(
      backpackSaveError(fileName),
      'Backpack file list fetch error',
      error as Error
    );
    return;
  }

  const targetName = uniqueFileName(fileName, existingFileNames, '-');
  notifySaving(notify, targetName);

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
      backpackSaveError(targetName),
      'Save to backpack error',
      error as Error
    );
    return;
  }

  notifySaved(notify, targetName);
};
