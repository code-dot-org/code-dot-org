import {uniqueFileName} from '@codebridge/utils';
import React from 'react';

import BackpackErrorAlertBody from '@cdo/apps/codebridge/FileBrowser/BackpackErrorAlertBody';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {
  DialogType,
  DialogControlInterface,
  TypedDialogProps,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {FilenamesByAppType} from '@cdo/apps/sharedComponents/backpack/types';
import type UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

type SaveToBackpackApi = BackpackClientApi | UnifiedBackpackClientApi;

type OpenSaveToBackpackPromptArgsType = {
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  backpackApi: SaveToBackpackApi;
  file: ProjectFile;
  sendLab2AnalyticsEvent: (
    eventName: string,
    payload?: Record<string, string>
  ) => void;
};

// The unified client is the only one that can list across backpacks. Duck-typed
// rather than `instanceof` so the plain-object test mocks are recognized.
const isUnifiedApi = (
  api: SaveToBackpackApi
): api is UnifiedBackpackClientApi =>
  typeof (api as UnifiedBackpackClientApi).getFileLists === 'function';

export const openSaveToBackpackPrompt = async ({
  dialogControl,
  backpackApi,
  file,
  sendLab2AnalyticsEvent,
}: OpenSaveToBackpackPromptArgsType) => {
  const handleError =
    (title: string, message: string, errorMessage: string) =>
    (error?: Error) => {
      const bodyComponent = <BackpackErrorAlertBody message={message} />;
      dialogControl?.showDialog({
        type: DialogType.GenericAlert,
        title,
        bodyComponent,
      });
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(errorMessage, error);
    };

  const unifiedApi = isUnifiedApi(backpackApi) ? backpackApi : undefined;

  let filenamesByAppType: FilenamesByAppType;
  try {
    filenamesByAppType = isUnifiedApi(backpackApi)
      ? await backpackApi.getFileLists()
      : {[backpackApi.appType]: await backpackApi.getFileList()};
  } catch (error) {
    handleError(
      codebridgeI18n.saveToBackpackTitle(),
      `${codebridgeI18n.getBackpackFileListError()} ${codebridgeI18n.closeWindowTryAgain()}`,
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
    codebridgeI18n.saveToBackpackTitle(),
    codebridgeI18n.saveToBackpackError({selectedFileName}) +
      ' ' +
      codebridgeI18n.closeWindowTryAgain(),
    'Save to backpack error'
  );

  const saved = await new Promise<boolean>(resolve => {
    const onSuccess = () => {
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
  });

  const replacedLegacyCopy =
    saved && isDuplicateFileName && selectedFileName === file.name;
  if (!unifiedApi || !replacedLegacyCopy) {
    return;
  }

  // Writes go to the universal backpack, so a name replaced in a legacy backpack is
  // still there. Deleting it after the save keeps a failed save non-destructive.
  try {
    await unifiedApi.deleteFromLegacyBackpacks(file.name, filenamesByAppType);
  } catch (error) {
    handleError(
      codebridgeI18n.saveToBackpackTitle(),
      "We saved your new file, but couldn't delete your old one. You can retry the delete in the Backpack.",
      'Backpack duplicate delete error'
    )(error as Error);
  }
};
