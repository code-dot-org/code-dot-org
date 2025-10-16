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
import React from 'react';

import BackpackErrorAlertBody from '@cdo/apps/codebridge/FileBrowser/BackpackErrorAlertBody';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {GenericDropdownProps} from '@cdo/apps/lab2/views/dialogs/GenericDropdown';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
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
  // Delete a file from the backpack.
  const handleDelete = async (selectedFileName: string) => {
    backpackApi.deleteFiles(
      [selectedFileName],
      handleError(
        codebridgeI18n.deleteFromBackpackTitle(),
        codebridgeI18n.deleteFromBackpackError({selectedFileName}) +
          ' ' +
          codebridgeI18n.closeWindowTryAgain(),
        'Backpack file delete error'
      ),
      () => sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_DELETE_FROM_BACKPACK)
    );
  };

  // Fetch file content from backpack and then update or create a project file.
  const fetchFileContentAndProcess = (
    selectedFileName: string,
    successMetric: string,
    newFileName?: string
  ) => {
    backpackApi.fetchFile(
      selectedFileName,
      handleError(
        codebridgeI18n.importFromBackpackTitle(),
        codebridgeI18n.getBackpackFileError({selectedFileName}) +
          ' ' +
          codebridgeI18n.closeWindowTryAgain(),
        'Backpack file fetch error'
      ),
      (fileContent: string) => {
        if (newFileName) {
          newFile({fileName: newFileName, contents: fileContent});
        } else {
          const fileId = Object.keys(projectFiles).find(
            id =>
              projectFiles[id].name === selectedFileName &&
              projectFiles[id].folderId === DEFAULT_FOLDER_ID
          );
          if (fileId) saveFile(fileId, fileContent);
        }
        sendLab2AnalyticsEvent(successMetric);
      }
    );
  };

  dialogControl?.showDialog({
    type: DialogType.PendingDialog,
    title: codebridgeI18n.filesInBackpackTitle(),
  });
  backpackApi.getFileList(
    handleError(
      codebridgeI18n.filesInBackpackTitle(),
      `${codebridgeI18n.getBackpackFileListError()} ${codebridgeI18n.closeWindowTryAgain()}`,
      'Backpack file list fetch error'
    ),
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
          neutralDestructive: true,
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
            // Give the user a choice to import with a new name or cancel the import.
            const results = await dialogControl?.showDialog({
              type: DialogType.GenericConfirmation,
              title: codebridgeI18n.importFromBackpackTitle(),
              message: codebridgeI18n.importFromBackpackDuplicateSupportMessage(
                {
                  newFileName,
                }
              ),
              confirmText: codebridgeI18n.importAsNewName({newFileName}),
            });
            if (results.type === 'confirm') {
              fetchFileContentAndProcess(
                selectedBackpackFileName,
                EVENTS.CODEBRIDGE_IMPORT_FROM_BACKPACK_RENAME,
                newFileName
              ); // Fetch backpack file content and import new file with numeric suffix.
            }
            return;
          }
          // If the backpack file has the same name as an existing project file, show a second
          // dialog that prompts user to replace/overwrite or import the backpack
          // file with a different name (newFileName).
          if (newFileName !== selectedBackpackFileName) {
            const results = await dialogControl?.showDialog({
              type: DialogType.GenericConfirmation,
              title: codebridgeI18n.importFromBackpackTitle(),
              message: codebridgeI18n.importFromBackpackDuplicateMessage({
                newFileName,
              }),
              confirmText: codebridgeI18n.replaceFile(),
              neutralText: codebridgeI18n.importAsNewName({newFileName}),
            });
            if (results.type === 'confirm') {
              fetchFileContentAndProcess(
                selectedBackpackFileName,
                EVENTS.CODEBRIDGE_IMPORT_FROM_BACKPACK_REPLACE
              ); // Update existing project file.
            } else if (results.type === 'neutral') {
              fetchFileContentAndProcess(
                selectedBackpackFileName,
                EVENTS.CODEBRIDGE_IMPORT_FROM_BACKPACK_RENAME,
                newFileName
              ); // Fetch backpack file content and import new file with numeric suffix.
            }
          } else {
            // Fetch backpack file content and import new file to project - not a duplicate file name.
            fetchFileContentAndProcess(
              selectedBackpackFileName,
              EVENTS.CODEBRIDGE_IMPORT_FROM_BACKPACK_NEW,
              selectedBackpackFileName
            );
          }
        } else if (results.type === 'neutral') {
          // User selects to delete file from backpack. Open confirm delete dialog.
          const results = await dialogControl?.showDialog({
            type: DialogType.GenericConfirmation,
            title: codebridgeI18n.deleteFromBackpackTitle(),
            message: codebridgeI18n.deleteFromBackpackConfirm({
              selectedBackpackFileName,
            }),
            confirmText: codebridgeI18n.delete(),
            destructive: true,
          });
          if (results.type === 'confirm') {
            handleDelete(selectedBackpackFileName);
          }
        }
      }
    }
  );
};
