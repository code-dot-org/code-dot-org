import {NewFileFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectType, FolderId, ProjectFile} from '@codebridge/types';
import {validateFileName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenNewFilePromptArgsType = {
  folderId?: FolderId;
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  newFile: NewFileFunction;
  projectFiles: ProjectType['files'];
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
  isStartMode: boolean;
  validationFile: ProjectFile | undefined;
};

export const openNewFilePrompt = async ({
  folderId = DEFAULT_FOLDER_ID,
  dialogControl,
  newFile,
  projectFiles,
  sendCodebridgeAnalyticsEvent,
  isStartMode,
  validationFile,
}: OpenNewFilePromptArgsType) => {
  const results = await dialogControl.showDialog({
    type: DialogType.GenericPrompt,
    title: codebridgeI18n.newFilePrompt(),
    validateInput: (fileName: string) =>
      validateFileName({
        fileName,
        folderId,
        projectFiles,
        isStartMode,
        validationFile,
      }),
  });
  if (results.type !== 'confirm') {
    return;
  }
  const fileName = extractUserInput(results);

  newFile({
    fileName,
    folderId,
    validationFileId: validationFile?.id,
  });

  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_NEW_FILE);
};
