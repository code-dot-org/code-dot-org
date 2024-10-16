import {MoveFileFunction} from '@codebridge/codebridgeContext/types';
import {ProjectFile, ProjectType, FileId} from '@codebridge/types';
import {findFolder, getErrorMessage, validateFileName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenMoveFilePromptArgsType = {
  fileId: FileId;
  projectFiles: ProjectType['files'];
  projectFolders: ProjectType['folders'];
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  moveFile: MoveFileFunction;
  isStartMode: boolean;
  validationFile: ProjectFile | undefined;
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
};

export const openMoveFilePrompt = async ({
  fileId,
  projectFiles,
  projectFolders,
  dialogControl,
  moveFile,
  isStartMode,
  validationFile,
  sendCodebridgeAnalyticsEvent,
}: OpenMoveFilePromptArgsType) => {
  const file = projectFiles[fileId];
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericPrompt,
    title: codebridgeI18n.moveFilePrompt(),
    placeholder: codebridgeI18n.rootFolder(),
    requiresPrompt: false,

    validateInput: (destinationFolderName: string) => {
      try {
        const folderId = findFolder(destinationFolderName.split('/'), {
          folders: Object.values(projectFolders),
          required: true,
        });

        return validateFileName({
          fileName: file.name,
          folderId,
          projectFiles,
          isStartMode,
          validationFile,
        });
      } catch (e) {
        return getErrorMessage(e);
      }
    },
  });

  if (results.type !== 'confirm') {
    return;
  }

  const destinationFolderName = extractUserInput(results) || '';
  try {
    const folderId = findFolder(destinationFolderName.split('/'), {
      folders: Object.values(projectFolders),
      required: true,
    });
    moveFile(fileId, folderId);
  } catch (e) {
    dialogControl?.showDialog({
      type: DialogType.GenericAlert,
      title: getErrorMessage(e),
    });
  }
  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_FILE);
};
