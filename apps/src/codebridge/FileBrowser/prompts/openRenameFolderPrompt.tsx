import {RenameFolderFunction} from '@codebridge/codebridgeContext/types';
import {ProjectType, FolderId} from '@codebridge/types';
import {validateFolderName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type RenameNewFilePromptArgsType = {
  folderId: FolderId;
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  renameFolder: RenameFolderFunction;
  projectFolders: ProjectType['folders'];
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
};

export const openRenameFolderPrompt = async ({
  folderId,
  dialogControl,
  renameFolder,
  projectFolders,
  sendCodebridgeAnalyticsEvent,
}: RenameNewFilePromptArgsType) => {
  const folder = projectFolders[folderId];
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericPrompt,
    title: codebridgeI18n.renameFolder(),
    value: folder.name,
    validateInput: (newName: string) => {
      if (!newName.length) {
        return;
      }
      if (newName === folder.name) {
        return;
      }

      return validateFolderName({
        folderName: newName,
        parentId: folder.parentId,
        projectFolders,
      });
    },
  });
  if (results.type !== 'confirm') {
    return;
  }
  const newName = extractUserInput(results);
  renameFolder(folderId, newName);
  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_RENAME_FOLDER);
};
