import {RenameFolderFunction} from '@codebridge/codebridgeContext/types';
import {FolderId} from '@codebridge/types';
import {validateFolderName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MultiFileSource} from '@cdo/apps/lab2/types';
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
  projectFolders: MultiFileSource['folders'];
  sendLab2AnalyticsEvent: (eventName: string) => unknown;
};

export const openRenameFolderPrompt = async ({
  folderId,
  dialogControl,
  renameFolder,
  projectFolders,
  sendLab2AnalyticsEvent,
}: RenameNewFilePromptArgsType) => {
  const folder = projectFolders[folderId];
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericPrompt,
    title: codebridgeI18n.renameFolder(),
    value: folder.name,
    validateInput: (newName: string) => {
      if (!newName.length || newName === folder.name) {
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
  sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_RENAME_FOLDER);
};
