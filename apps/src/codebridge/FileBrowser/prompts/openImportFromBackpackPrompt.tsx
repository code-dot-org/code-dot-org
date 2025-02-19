import {
  NewFileFunction,
  SaveFileFunction,
} from '@codebridge/codebridgeContext/types';
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
  saveFile: SaveFileFunction;
  projectFiles: MultiFileSource['files'];
  validationFile?: ProjectFile;
};

export const openImportFromBackpackPrompt = async ({
  dialogControl,
  backpackApi,
  newFile,
  saveFile,
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
              handleConfirm: () =>
                fetchFileContentSaveFile(
                  selectedBackpackFileName,
                  projectFiles
                ),
              handleNeutral: () =>
                fetchFileContentCreateNewFile(
                  selectedBackpackFileName,
                  newFileName
                ),
            });
          } else {
            fetchFileContentCreateNewFile(
              selectedBackpackFileName,
              selectedBackpackFileName
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
  const handleDelete = async (filename: string) => {
    backpackApi.deleteFiles(
      [filename],
      () => console.log(`Error in deleting file ${filename}`),
      () => console.log(`Deleted file ${filename}`)
    );
  };

  const fetchFileContentCreateNewFile = (
    fileName: string,
    newFileName: string
  ) => {
    backpackApi.fetchFile(
      fileName,
      () => {
        console.log('Error in fetching file.');
      },
      (fileContent: string) => {
        newFile({
          fileName: newFileName,
          contents: fileContent,
        });
      }
    );
  };

  const fetchFileContentSaveFile = (
    fileName: string,
    projectFiles: MultiFileSource['files']
  ) => {
    backpackApi.fetchFile(
      fileName,
      () => {
        console.log('Error in fetching file.');
      },
      (fileContent: string) => {
        // Get file id of original file.
        let selectedFileId;
        for (const fileId in projectFiles) {
          if (projectFiles[fileId].name === fileName) {
            selectedFileId = fileId;
          }
        }
        if (selectedFileId) {
          saveFile(selectedFileId, fileContent);
        }
      }
    );
  };
};
