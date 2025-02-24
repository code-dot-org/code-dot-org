import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFileNameWithNumberSuffix} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {
  DialogType,
  DialogControlInterface,
  TypedDialogProps,
} from '@cdo/apps/lab2/views/dialogs';
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
  const handleError = (message: string) => () => {
    // TODO: send analytics / add logging.
    console.error(message);
  };
  backpackApi.getFileList(
    handleError('Error in getting backpack file list.'),
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
        handleError(`Error in saving pythonlab file ${selectedFileName}`),
        () => {}
      );
    }
  );
};
