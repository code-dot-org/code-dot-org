import {ShowToast} from '@code-dot-org/component-library/toast';
import {uniqueFileName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {
  DialogType,
  DialogControlInterface,
  TypedDialogProps,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {
  backpackDuplicateDeleteError,
  backpackSaveError,
  notifySaved,
  notifySaving,
  notifyWithToast,
} from '@cdo/apps/sharedComponents/backpack/backpackToasts';
import {FilenamesByAppType} from '@cdo/apps/sharedComponents/backpack/types';
import type UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

type OpenSaveToBackpackPromptArgsType = {
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  backpackApi: UnifiedBackpackClientApi;
  file: ProjectFile;
  showToast: ShowToast;
  sendLab2AnalyticsEvent: (
    eventName: string,
    payload?: Record<string, string>
  ) => void;
};

export const openSaveToBackpackPrompt = async ({
  dialogControl,
  backpackApi,
  file,
  showToast,
  sendLab2AnalyticsEvent,
}: OpenSaveToBackpackPromptArgsType) => {
  const notify = notifyWithToast(showToast);

  const handleError =
    (toastMessage: string, errorMessage: string) => (error?: Error) => {
      notify('danger', toastMessage);
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(errorMessage, error);
    };

  let filenamesByAppType: FilenamesByAppType;
  try {
    filenamesByAppType = await backpackApi.getFileLists();
  } catch (error) {
    handleError(
      backpackSaveError(file.name),
      'Backpack file list fetch error'
    )(error as Error);
    return;
  }

  const existingFilenames = Object.values(filenamesByAppType).flat();
  const isDuplicateFileName = existingFilenames.includes(file.name);
  const newFileName = uniqueFileName(file.name, existingFilenames);

  const dialog = isDuplicateFileName
    ? {
        type: DialogType.GenericConfirmation,
        title: codebridgeI18n.saveToBackpackTitle(),
        message: codebridgeI18n.saveToBackpackDuplicateMessage({
          newFileName: newFileName,
        }),
        confirmText: codebridgeI18n.replace(),
        neutralText: codebridgeI18n.renameFile(),
      }
    : {
        type: DialogType.GenericConfirmation,
        title: codebridgeI18n.saveToBackpackTitle(),
        message: codebridgeI18n.saveToBackpackMessage({
          fileName: file.name,
        }),
        confirmText: codebridgeI18n.saveToBackpackTitle(),
      };
  const results = await dialogControl?.showDialog(dialog as TypedDialogProps);

  if (results.type === 'cancel') {
    return;
  }

  // Confirm means the user is replacing the existing file; neutral means they are using
  // the suggested rename.
  const selectedFileName = results.type === 'confirm' ? file.name : newFileName;

  let successMetric = EVENTS.SAVE_TO_BACKPACK_NEW;
  if (isDuplicateFileName) {
    successMetric =
      selectedFileName === file.name
        ? EVENTS.SAVE_TO_BACKPACK_REPLACE
        : EVENTS.SAVE_TO_BACKPACK_RENAME;
  }

  const successCallback = () =>
    sendLab2AnalyticsEvent(successMetric, {
      fileType: selectedFileName.split('.').pop()?.toLowerCase() || '',
    });

  const errorCallback = handleError(
    backpackSaveError(selectedFileName),
    'Save to backpack error'
  );

  notifySaving(notify, selectedFileName);

  const saved = await new Promise<boolean>(resolve => {
    const onSuccess = () => {
      notifySaved(notify, selectedFileName);
      successCallback();
      resolve(true);
    };
    const onError = (error?: Error) => {
      errorCallback(error);
      resolve(false);
    };
    if (file.url) {
      backpackApi.saveFileFromUrl(
        selectedFileName,
        file.url,
        onError,
        onSuccess
      );
    } else {
      backpackApi.saveFile(selectedFileName, file.contents, onError, onSuccess);
    }
  }).catch(error => {
    errorCallback(error as Error);
    return false;
  });

  const replacedLegacyCopy =
    saved && isDuplicateFileName && selectedFileName === file.name;
  if (!replacedLegacyCopy) {
    return;
  }

  // Writes go to the universal backpack, so a name replaced in a legacy backpack is
  // still there. Deleting it after the save keeps a failed save non-destructive.
  try {
    await backpackApi.deleteFromLegacyBackpacks(file.name, filenamesByAppType);
  } catch (error) {
    handleError(
      backpackDuplicateDeleteError(selectedFileName),
      'Backpack duplicate delete error'
    )(error as Error);
  }
};
