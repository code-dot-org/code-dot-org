import {getNextFolderId} from '@codebridge/codebridgeContext';
import {NewFolderFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectType, FolderId} from '@codebridge/types';
import {validateFolderName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  DialogType,
  DialogControlInterface,
  extractDialogClosePromiseInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenNewFilePromptArgsType = {
  parentId: FolderId;
  appName: string;
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  newFolder: NewFolderFunction;
  projectFolders: ProjectType['folders'];
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
};

export const openNewFolderPrompt = async ({
  parentId = DEFAULT_FOLDER_ID,
  appName,
  dialogControl,
  newFolder,
  projectFolders,
  sendCodebridgeAnalyticsEvent,
}: OpenNewFilePromptArgsType) => {
  const results = await dialogControl.showDialog({
    type: DialogType.GenericPrompt,
    title: codebridgeI18n.newFolderPrompt(),
    validateInput: (folderName: string) => {
      if (!folderName.length) {
        return;
      }
      if (!validateFolderName(folderName)) {
        return codebridgeI18n.invalidNameError();
      }
      const existingFolder = Object.values(projectFolders).some(
        f => f.name === folderName && f.parentId === parentId
      );
      if (existingFolder) {
        return codebridgeI18n.folderExistsError();
      }
    },
  });
  if (results.type !== 'confirm') {
    return;
  }
  const folderName = extractDialogClosePromiseInput(results);

  const folderId = getNextFolderId(Object.values(projectFolders));
  newFolder({parentId, folderName, folderId});

  const eventName =
    parentId === DEFAULT_FOLDER_ID
      ? EVENTS.CODEBRIDGE_NEW_FOLDER
      : EVENTS.CODEBRIDGE_NEW_SUBFOLDER;
  sendCodebridgeAnalyticsEvent(eventName);
};
