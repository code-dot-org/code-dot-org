import {ShowToast} from '@code-dot-org/component-library/toast';
import {uniqueFileName} from '@codebridge/utils';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  isUnifiedApi,
  SaveToBackpackApi,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/saveToBackpackHelper';
import {
  backpackSaveError,
  notifySaved,
  notifySaving,
  notifyWithToast,
} from '@cdo/apps/sharedComponents/backpack/backpackToasts';

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
  const notify = notifyWithToast(showToast);

  // The unified backpack reports failures as toasts; the legacy backpack keeps
  // its notification in the chat.
  const reportError = (
    toastMessage: string,
    logMessage: string,
    error?: Error
  ) => {
    if (unifiedApi) {
      notify('danger', toastMessage);
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
      backpackSaveError(fileName),
      'Backpack file list fetch error',
      error as Error
    );
    return;
  }

  const targetName = uniqueFileName(fileName, existingFileNames, '-');
  if (unifiedApi) {
    notifySaving(notify, targetName);
  }

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

  if (unifiedApi) {
    notifySaved(notify, targetName);
  }
};
