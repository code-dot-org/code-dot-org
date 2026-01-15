import {
  GenericPromptArgs,
  NewFileFunction,
} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {FolderId, ProjectFile} from '@codebridge/types';
import {validateFileNameForModal} from '@codebridge/utils';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {DialogType, DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenNewFilePromptArgsType = {
  folderId?: FolderId;
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  newFile: NewFileFunction;
  projectFiles: MultiFileSource['files'];
  sendLab2AnalyticsEvent: (
    eventName: string,
    payload?: Record<string, string>
  ) => void;
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
    title: 'Create a new file',
    message: 'Give your new file a name and type.',
    messageMargin: true,
    textFieldProps: {
      label: 'File name',
    },
    dropdownProps: {
      labelText: 'File type',
      items: validFileTypes
        ? validFileTypes.map(fileType => {
            return {
              key: fileType,
              text: fileType.toUpperCase(),
              value: fileType,
            };
          })
        : [],
      selectedValue: validFileTypes ? validFileTypes[0] : '',
      styleAsFormField: true,
    },
    buttons: {
      confirm: {
        text: 'Create file',
      },
    },
    validateInput: (fileName: string, dropdownValue?: string) =>
      validateFileNameForModal({
        fileName,
        folderId,
        projectFiles,
        isStartMode,
        validationFile,
        validFileTypes,
        selectedFileType: dropdownValue,
      }),
    useModal: true,
  });
  if (results.type !== 'confirm') {
    return;
  }

  const {textField: baseFileName, dropdown: selectedExtension} =
    results.args as GenericPromptArgs;
  const fileName = selectedExtension
    ? `${baseFileName}.${selectedExtension}`
    : baseFileName;

  newFile({
    fileName,
    folderId,
  });

  sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_NEW_FILE, {
    fileType:
      selectedExtension || fileName.split('.').pop()?.toLowerCase() || '',
  });
};
