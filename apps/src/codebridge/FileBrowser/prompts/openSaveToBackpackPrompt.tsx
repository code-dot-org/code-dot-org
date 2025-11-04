import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFileNameWithNumberSuffix} from '@codebridge/utils';
import React from 'react';

import BackpackErrorAlertBody from '@cdo/apps/codebridge/FileBrowser/BackpackErrorAlertBody';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  DialogType,
  DialogControlInterface,
  TypedDialogProps,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {BackpackContextType} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';

type OpenSaveToBackpackPromptArgsType = {
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  backpackApi: BackpackContextType;
  file: ProjectFile;
};

export const openSaveToBackpackPrompt = async ({
  dialogControl,
  backpackApi,
  file,
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
  backpackApi.getFileList(
    handleError(
      codebridgeI18n.importFromBackpackTitle(),
      `${codebridgeI18n.getBackpackFileListError()} ${codebridgeI18n.closeWindowTryAgain()}`,
      'Backpack file list fetch error'
    ),
    async (filenames: string[]) => {
      // Check if filename is a duplicate of a saved file in backpack.
      const isDuplicateFileName = filenames.includes(file.name);

      let fileNameCopy = file.name;
      while (filenames.includes(fileNameCopy)) {
        fileNameCopy = getFileNameWithNumberSuffix(fileNameCopy);
      }

      const dialog = isDuplicateFileName
        ? {
            type: DialogType.GenericConfirmation,
            title: codebridgeI18n.saveToBackpackTitle(),
            message: codebridgeI18n.saveToBackpackDuplicateMessage({
              newFileName: fileNameCopy,
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
      const results = await dialogControl?.showDialog(
        dialog as TypedDialogProps
      );

      if (results.type === 'cancel') {
        return;
      }

      const selectedFileName =
        results.type === 'confirm' ? file.name : fileNameCopy;

      let successMetric = EVENTS.CODEBRIDGE_SAVE_TO_BACKPACK_NEW;
      if (isDuplicateFileName) {
        successMetric =
          selectedFileName === file.name
            ? EVENTS.CODEBRIDGE_SAVE_TO_BACKPACK_REPLACE
            : EVENTS.CODEBRIDGE_SAVE_TO_BACKPACK_RENAME;
      }
      const successCallback = () => sendLab2AnalyticsEvent(successMetric);

      const fileContents = {
        name: selectedFileName,
        contents: file.contents,
        folderId: DEFAULT_FOLDER_ID,
        language: 'py',
        active: false,
      } as ProjectFile;
      backpackApi.savePythonlabFile(
        selectedFileName,
        fileContents,
        handleError(
          codebridgeI18n.saveToBackpackTitle(),
          codebridgeI18n.saveToBackpackError({selectedFileName}) +
            ' ' +
            codebridgeI18n.closeWindowTryAgain(),
          'Save to backpack error'
        ),
        successCallback
      );
    }
  );
};
