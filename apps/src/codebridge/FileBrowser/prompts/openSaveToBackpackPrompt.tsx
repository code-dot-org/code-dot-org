import {getFileNameWithNumberSuffix} from '@codebridge/utils';

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
  backpackApi.getFileList(
    () => {
      console.log('onError');
    },
    async (filenames: string[]) => {
      // Check if filename is a duplicate of a saved file in backpack.
      const isDuplicateFileName = filenames.includes(file.name);
      const fileNameCopy = getFileNameWithNumberSuffix(file.name);
      const dialog = isDuplicateFileName
        ? {
            type: DialogType.GenericConfirmation,
            title: 'Save to backpack',
            message: `This project file has the same name as an existing saved file in your backpack. Do you want to rename to ${fileNameCopy} or replace the existing backpack file?`,
            confirmText: 'Replace',
            neutralText: 'Rename',
          }
        : {
            type: DialogType.GenericConfirmation,
            title: 'Save to backpack',
            message: `You are about to save ${file.name} to your backpack.`,
            confirmText: 'Save to backpack',
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
        folderId: '0',
        language: 'py',
        open: true,
        active: false,
      } as ProjectFile;
      backpackApi.savePythonlabFile(selectedFileName, fileContents);
    }
  );
};
