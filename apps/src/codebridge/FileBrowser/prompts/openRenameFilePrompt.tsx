import {RenameFileFunction} from '@codebridge/codebridgeContext/types';
import {ProjectFile, ProjectType, FileId} from '@codebridge/types';
import {validateFileName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type RenameNewFilePromptArgsType = {
  fileId: FileId;
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  renameFile: RenameFileFunction;
  projectFiles: ProjectType['files'];
  isStartMode: boolean;
  validationFile: ProjectFile | undefined;
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
};

export const openRenameFilePrompt = async ({
  fileId,
  dialogControl,
  renameFile,
  projectFiles,
  sendCodebridgeAnalyticsEvent,
  isStartMode,
  validationFile,
}: RenameNewFilePromptArgsType) => {
  const file = projectFiles[fileId];
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericPrompt,
    title: codebridgeI18n.renameFile(),
    value: file.name,
    validateInput: (newName: string) => {
      if (!newName.length) {
        return;
      }
      if (newName === file.name) {
        return;
      }

      return validateFileName({
        fileName: newName,
        folderId: file.folderId,
        projectFiles,
        isStartMode,
        validationFile,
      });
    },
  });

  if (results.type !== 'confirm') {
    return;
  }

  const newName = extractUserInput(results);
  renameFile(fileId, newName);
  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_RENAME_FILE);
};
