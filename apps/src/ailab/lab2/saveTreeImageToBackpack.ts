import {uniqueFileName} from '@codebridge/utils';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {
  BACKPACK_READ_ERROR,
  BackpackNotify,
  backpackSaveError,
  notifySaved,
  notifySaving,
} from '@cdo/apps/sharedComponents/backpack/backpackToasts';
import type UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

const logError = (message: string, error: unknown) =>
  Lab2Registry.getInstance()
    .getMetricsReporter()
    .logError(message, error as Error);

const saveUnderFreeName = async (
  backpackApi: UnifiedBackpackClientApi,
  notify: BackpackNotify,
  image: Blob,
  baseName: string
) => {
  let takenNames: string[];
  try {
    // Writes go to the universal backpack, so a name taken in any backpack collides.
    takenNames = Object.values(await backpackApi.getFileLists()).flat();
  } catch (error) {
    notify('danger', BACKPACK_READ_ERROR);
    logError('Backpack file list fetch error', error);
    return;
  }

  const fileName = uniqueFileName(`${baseName}.png`, takenNames);
  notifySaving(notify, fileName);
  try {
    await new Promise<void>((resolve, reject) => {
      backpackApi
        .saveBlobFile(
          fileName,
          image,
          // A save that fails before it starts reports failure with no error.
          error =>
            reject(
              error ?? new Error(`Could not save ${fileName} to the backpack`)
            ),
          resolve
        )
        .catch(reject);
    });
  } catch (error) {
    notify('danger', backpackSaveError(fileName));
    logError('Save to backpack error', error);
    return;
  }

  notifySaved(notify, fileName);
  sendLab2AnalyticsEvent(EVENTS.SAVE_TO_BACKPACK_NEW, {fileType: 'png'});
};

// A save picks its name from the file list, so it waits for the previous one to land.
let previousSave = Promise.resolve();

export const saveTreeImageToBackpack = (
  ...args: Parameters<typeof saveUnderFreeName>
) => {
  previousSave = previousSave.then(() => saveUnderFreeName(...args));
  return previousSave;
};
