import {NewFileFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {FolderId, ProjectFile} from '@codebridge/types';
import {validateFileName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MultiFileSource} from '@cdo/apps/lab2/types';
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
  projectFiles: MultiFileSource['files'];
  sendLab2AnalyticsEvent: (eventName: string) => unknown;
  isStartMode: boolean;
  validationFile: ProjectFile | undefined;
  validFileTypes?: string[];
};

export const openNewFilePrompt = async ({
  folderId = DEFAULT_FOLDER_ID,
  dialogControl,
  newFile,
  projectFiles,
  sendLab2AnalyticsEvent,
  isStartMode,
  validationFile,
  validFileTypes,
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
        validFileTypes,
      }),
  });
  if (results.type !== 'confirm') {
    return;
  }
  const fileName = extractUserInput(results);

  newFile({
    fileName,
    folderId,
  });

  sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_NEW_FILE);
};
