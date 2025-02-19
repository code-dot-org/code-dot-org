import {NewFileFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {validateFileName, getFileNameWithNumberSuffix} from '@codebridge/utils';

import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {GenericDropdownProps} from '@cdo/apps/lab2/views/dialogs/GenericDropdown';
import {BackpackContextType} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';

type OpenImportFromBackpackPromptArgsType = {
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  backpackApi: BackpackContextType;
  newFile: NewFileFunction;
  projectFiles: MultiFileSource['files'];
  validationFile?: ProjectFile;
};

export const openImportFromBackpackPrompt = async ({
  dialogControl,
  backpackApi,
  newFile,
  projectFiles,
  validationFile,
}: OpenImportFromBackpackPromptArgsType) => {
  backpackApi.getFileList(
    () => {
      console.log('Error in getting backpack file list.');
    },
    async (filenames: string[]) => {
      if (filenames.length === 0) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: 'Files Saved in Backpack',
          message: 'Files saved to your backpack will appear here.',
        });
      } else {
        const savedFilesInBackpack: GenericDropdownProps['items'] =
          filenames.map(filename => ({value: filename, text: filename}));
        const results = await dialogControl?.showDialog({
          type: DialogType.GenericDropdown,
          title: 'Files Saved in Backpack',
          dropdownLabel: '',
          confirmText: 'Import to project',
          items: savedFilesInBackpack,
          selectedValue: savedFilesInBackpack[0].value,
          neutralText: 'Delete file from backpack',
        });

        if (results.type === 'cancel') {
          return;
        }
        const selectedBackpackFileName = extractUserInput(results, true);
        if (results.type === 'confirm') {
          let newFileName = selectedBackpackFileName;
          while (
            validateFileName({
              fileName: newFileName,
              folderId: DEFAULT_FOLDER_ID,
              projectFiles,
              isStartMode: false,
              validationFile,
            })
          ) {
            newFileName = getFileNameWithNumberSuffix(newFileName);
          }
          const isDuplicateFileName = newFileName !== selectedBackpackFileName;

          // If duplicate, show another dialog to either replace or rename.
          // If not a duplicate file name, fetch file.
          if (isDuplicateFileName) {
            dialogControl?.showDialog({
              type: DialogType.GenericConfirmation,
              title: 'Import from backpack',
              message: `This backpack file has the same name as an existing file in the root folder of your project. Would you like to replace ${selectedBackpackFileName} with the file from your backpack or import the backpack file as ${newFileName}?`,
              confirmText: 'Replace existing file',
              neutralText: `Import as ${newFileName}`,
              handleConfirm: () => {},
              handleNeutral: () => {},
            });
          } else {
            backpackApi.fetchFile(
              selectedBackpackFileName,
              () => {
                console.log('Error in fetching file.');
              },
              (fileContent: string) => {
                newFile({
                  fileName: selectedBackpackFileName,
                  contents: fileContent,
                });
              }
            );
          }
        } else if (results.type === 'neutral') {
          // Open confirm delete dialog.
          dialogControl?.showDialog({
            type: DialogType.GenericConfirmation,
            title: 'Delete from backpack',
            message: `You are about to delete ${selectedBackpackFileName} to your backpack.`,
            confirmText: 'Delete',
            handleConfirm: () => handleDelete(selectedBackpackFileName),
          });
        }
      }
    }
  );
  const handleDelete = async (selectedBackpackFileName: string) => {
    backpackApi.deleteFiles(
      [selectedBackpackFileName],
      () => console.log(`Error in deleting file ${selectedBackpackFileName}`),
      () => console.log(`Deleted file ${selectedBackpackFileName}`)
    );
  };
};
