import {RenameFolderFunction} from '@codebridge/codebridgeContext/types';
import {FolderId} from '@codebridge/types';
import {validateFolderNameForModal} from '@codebridge/utils';

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
    title: 'Rename folder',
    message: 'Give your folder a new name.',
    textFieldProps: {
      label: 'New folder name',
    },
    confirmButtonText: 'Rename folder',
    value: folder.name,
    validateInput: (newName: string) => {
      if (!newName.length || newName === folder.name) {
        return;
      }

      return validateFolderNameForModal({
        folderName: newName,
        parentId: folder.parentId,
        projectFolders,
      });
    },
    useModal: true,
  });

  if (results.type !== 'confirm') {
    return;
  }

  const newName = extractUserInput(results);
  renameFolder(folderId, newName);
  sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_RENAME_FOLDER);
};
