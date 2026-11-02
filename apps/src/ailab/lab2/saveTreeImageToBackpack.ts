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

// Never replaces a file: a student comparing trees keeps every one they save.
export const freeFileName = (
  baseName: string,
  takenNames: string[]
): string => {
  const taken = new Set(takenNames);
  let fileName = `${baseName}.png`;
  for (let copy = 1; taken.has(fileName); copy++) {
    fileName = `${baseName}_${String(copy).padStart(2, '0')}.png`;
  }
  return fileName;
};

export const saveTreeImageToBackpack = async (
  backpackApi: UnifiedBackpackClientApi,
  notify: BackpackNotify,
  image: Blob,
  baseName: string
) => {
  const logError = (message: string, error: unknown) =>
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError(message, error as Error);

  let takenNames: string[];
  try {
    // Writes go to the universal backpack, so a name taken in any backpack collides.
    takenNames = Object.values(await backpackApi.getFileLists()).flat();
  } catch (error) {
    notify('danger', BACKPACK_READ_ERROR);
    logError('Backpack file list fetch error', error);
    return;
  }

  const fileName = freeFileName(baseName, takenNames);
  const saveError = backpackSaveError(fileName);
  notifySaving(notify, fileName);
  await new Promise<void>(resolve => {
    backpackApi
      .saveBlobFile(
        fileName,
        image,
        () => {
          notify('danger', saveError);
          resolve();
        },
        () => {
          notifySaved(notify, fileName);
          sendLab2AnalyticsEvent(EVENTS.SAVE_TO_BACKPACK_NEW, {
            fileType: 'png',
          });
          resolve();
        }
      )
      .catch(error => {
        notify('danger', saveError);
        logError('Save to backpack error', error);
        resolve();
      });
  });
};
