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
          const selectedBackpackFileNameCopy =
            newFileName !== selectedBackpackFileName ? newFileName : undefined;

          backpackApi.fetchFile(
            selectedBackpackFileName,
            () => {
              console.log('Error in fetching file.');
            },
            (fileContent: string) => {
              newFile({
                fileName:
                  selectedBackpackFileNameCopy || selectedBackpackFileName,
                contents: fileContent,
              });
            }
          );
        } else if (results.type === 'neutral') {
          console.log('delete file from backpack');
          backpackApi.deleteFiles(
            [selectedBackpackFileName],
            () =>
              console.log(`Error in deleting file ${selectedBackpackFileName}`),
            () => console.log(`Deleted file ${selectedBackpackFileName}`)
          );
        }
      }
    }
  );
};
