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

import codebridgeI18n from '@cdo/apps/codebridge/locale';
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

  dialogControl?.showDialog({
    type: DialogType.PendingDialog,
    title: codebridgeI18n.filesInBackpackTitle(),
  });
  backpackApi.getFileList(
    handleError('Error in getting backpack file list.'),
    async (filenames: string[]) => {
      if (filenames.length === 0) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: codebridgeI18n.filesInBackpackTitle(),
          message: codebridgeI18n.filesInBackpackMessage(),
        });
      } else {
        const savedFilesInBackpack: GenericDropdownProps['items'] =
          filenames.map(filename => ({value: filename, text: filename}));

        const results = await dialogControl?.showDialog({
          type: DialogType.GenericDropdown,
          title: codebridgeI18n.filesInBackpackTitle(),
          dropdownLabel: '',
          confirmText: codebridgeI18n.importToProject(),
          items: savedFilesInBackpack,
          selectedValue: savedFilesInBackpack[0].value,
          neutralText: codebridgeI18n.deleteFileBackpack(),
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
            // Give the user to import with a new name or cancel the import.
            dialogControl?.showDialog({
              type: DialogType.GenericConfirmation,
              title: codebridgeI18n.importFromBackpack(),
              message: codebridgeI18n.importFromBackpackDuplicateSupportMessage(
                {
                  newFileName,
                }
              ),
              confirmText: codebridgeI18n.importAsNewName({newFileName}),
              handleConfirm: () =>
                fetchFileContentAndProcess(
                  selectedBackpackFileName,
                  newFileName
                ), // Fetch backpack file content and import new file with numeric suffix.
            });
            return;
          }
          // If the backpack file has the same name as an existing project file, show a second
          // dialog that prompts user to replace/overwrite or import the backpack
          // file with a different name (newFileName).
          if (newFileName !== selectedBackpackFileName) {
            dialogControl?.showDialog({
              type: DialogType.GenericConfirmation,
              title: codebridgeI18n.importFromBackpack(),
              message: codebridgeI18n.importFromBackpackDuplicateMessage({
                newFileName,
              }),
              confirmText: codebridgeI18n.replaceFile(),
              neutralText: codebridgeI18n.importAsNewName({newFileName}),
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
            title: codebridgeI18n.deleteFromBackpack(),
            message: codebridgeI18n.deleteFromBackpackConfirm({
              selectedBackpackFileName,
            }),
            confirmText: codebridgeI18n.delete(),
            handleConfirm: () => handleDelete(selectedBackpackFileName),
          });
        }
      }
    }
  );
};
