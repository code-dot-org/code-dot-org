import {
  NewFileFunction,
  SaveFileFunction,
} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {
  getFileNameWithNumberSuffix,
  isDuplicateFileName,
  DuplicateFileError,
} from '@codebridge/utils';

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
  const handleError = (message: string) => () => {
    // TODO: send analytics / add logging.
    console.error(message);
  };
  // Delete a file from the backpack.
  const handleDelete = async (filename: string) => {
    backpackApi.deleteFiles(
      [filename],
      handleError(`Error in deleting file ${filename}`),
      () => console.log(`Deleted file ${filename}`)
    );
  };

  // Fetch file content from backpack and then update or create a project file.
  const fetchFileContentAndProcess = (
    fileName: string,
    newFileName?: string
  ) => {
    backpackApi.fetchFile(
      fileName,
      handleError(`Error in fetching file ${fileName}`),
      (fileContent: string) => {
        if (newFileName) {
          newFile({fileName: newFileName, contents: fileContent});
        } else {
          const fileId = Object.keys(projectFiles).find(
            id =>
              projectFiles[id].name === fileName &&
              projectFiles[id].folderId === DEFAULT_FOLDER_ID
          );
          if (fileId) saveFile(fileId, fileContent);
        }
      }
    );
  };

  // TODO: Adding a waiting UI (spinner) while waiting for backpack list retrieval.
  backpackApi.getFileList(
    handleError('Error in getting backpack file list.'),
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

        if (results.type === 'cancel') return;

        const selectedBackpackFileName = extractUserInput(results, true);
        // Import backpack file to project.
        if (results.type === 'confirm') {
          let isDuplicateName = isDuplicateFileName({
            fileName: selectedBackpackFileName,
            folderId: DEFAULT_FOLDER_ID,
            projectFiles,
            isStartMode: false,
            validationFile,
          });
          const isSupportFileName =
            isDuplicateName === DuplicateFileError.DUPLICATE_SUPPORT_FILE;
          let newFileName = selectedBackpackFileName;
          while (isDuplicateName) {
            newFileName = getFileNameWithNumberSuffix(newFileName);
            isDuplicateName = isDuplicateFileName({
              fileName: newFileName,
              folderId: DEFAULT_FOLDER_ID,
              projectFiles,
              isStartMode: false,
              validationFile,
            });
          }
          if (isSupportFileName) {
            // The user wants to import a file that has the same name as a hidden support file.
            // Automatically import file renamed with numeric suffix.
            // TODO: display message that file was renamed because it duplicated a support file.
            fetchFileContentAndProcess(selectedBackpackFileName, newFileName);
            return;
          }
          // If the backpack file has the same name as an existing project file, show a second
          // dialog that prompts user to replace/overwrite or import the backpack
          // file with a different name (newFileName).
          if (newFileName !== selectedBackpackFileName) {
            dialogControl?.showDialog({
              type: DialogType.GenericConfirmation,
              title: 'Import from backpack',
              message: `Would you like to replace the current file with this file or import this file as ${newFileName}?`,
              confirmText: 'Replace existing file',
              neutralText: `Import as ${newFileName}`,
              handleConfirm: () =>
                fetchFileContentAndProcess(selectedBackpackFileName), // Update existing project file.
              handleNeutral: () =>
                fetchFileContentAndProcess(
                  selectedBackpackFileName,
                  newFileName
                ), // Fetch backpack file content and import new file with numeric suffix.
            });
          } else {
            // Fetch backpack file content and import new file to project - not a duplicate file name.
            fetchFileContentAndProcess(
              selectedBackpackFileName,
              selectedBackpackFileName
            );
          }
        } else if (results.type === 'neutral') {
          // User selects to delete file from backpack. Open confirm delete dialog.
          dialogControl?.showDialog({
            type: DialogType.GenericConfirmation,
            title: 'Delete from backpack',
            message: `You are about to delete ${selectedBackpackFileName} from your backpack.`,
            confirmText: 'Delete',
            handleConfirm: () => handleDelete(selectedBackpackFileName),
          });
        }
      }
    }
  );
};
