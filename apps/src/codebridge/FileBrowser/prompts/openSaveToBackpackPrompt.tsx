import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFileNameWithNumberSuffix} from '@codebridge/utils';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {
  DialogType,
  DialogControlInterface,
  TypedDialogProps,
} from '@cdo/apps/lab2/views/dialogs';
import {BackpackContextType} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';

import moduleStyles from '@cdo/apps/codebridge/FileBrowser/styles/filebrowser.module.scss';

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
  const handleError = (title: string, message: string) => () => {
    // TODO: send analytics / add logging.
    const bodyComponent = (
      <div className={moduleStyles.backpackErrorContainer}>
        <FontAwesomeV6Icon
          iconName="circle-exclamation"
          iconStyle="regular"
          className={moduleStyles.alertIcon}
        />
        <span className={moduleStyles.backpackErrorMessage}>{message}</span>
      </div>
    );
    dialogControl?.showDialog({
      type: DialogType.GenericAlert,
      title,
      bodyComponent,
    });
  };
  backpackApi.getFileList(
    handleError(
      codebridgeI18n.importFromBackpack(),
      `${codebridgeI18n.getBackpackFileListError()} ${codebridgeI18n.closeWindowTryAgain()}`
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
            title: codebridgeI18n.saveToBackpack(),
            message: codebridgeI18n.saveToBackpackDuplicateMessage({
              newFileName: fileNameCopy,
            }),
            confirmText: codebridgeI18n.replace(),
            neutralText: codebridgeI18n.renameFile(),
          }
        : {
            type: DialogType.GenericConfirmation,
            title: codebridgeI18n.saveToBackpack(),
            message: codebridgeI18n.saveToBackpackMessage({
              fileName: file.name,
            }),
            confirmText: codebridgeI18n.saveToBackpack(),
          };
      const results = await dialogControl?.showDialog(
        dialog as TypedDialogProps
      );

      if (results.type === 'cancel') {
        return;
      }
      const selectedFileName =
        results.type === 'confirm' ? file.name : fileNameCopy;
      const fileContents = {
        name: selectedFileName,
        contents: file.contents,
        folderId: DEFAULT_FOLDER_ID,
        language: 'py',
        open: true,
        active: false,
      } as ProjectFile;
      backpackApi.savePythonlabFile(
        selectedFileName,
        fileContents,
        handleError(
          codebridgeI18n.saveToBackpack(),
          codebridgeI18n.saveToBackpackError({selectedFileName}) +
            ' ' +
            codebridgeI18n.closeWindowTryAgain()
        ),
        () => {}
      );
    }
  );
};
