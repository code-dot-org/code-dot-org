import {getNextFolderId} from '@codebridge/codebridgeContext';
import {NewFolderFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectType, FolderId} from '@codebridge/types';
import {
  checkForDuplicateFoldername,
  isValidFolderName,
} from '@codebridge/utils';

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

type ValidateNewFolderNameArgs = {
  folderName: string;
  parentId: FolderId;
  projectFolders: ProjectType['folders'];
};

export const validateNewFolderName = ({
  folderName,
  parentId,
  projectFolders,
}: ValidateNewFolderNameArgs) => {
  if (!folderName.length) {
    return;
  }
  if (!isValidFolderName(folderName)) {
    return codebridgeI18n.invalidNameError();
  }

  const duplicate = checkForDuplicateFoldername({
    folderName,
    parentId,
    projectFolders,
  });
  if (duplicate) {
    return duplicate;
  }
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
    validateInput: (folderName: string) =>
      validateNewFolderName({folderName, parentId, projectFolders}),
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
