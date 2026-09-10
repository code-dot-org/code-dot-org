import {CodebridgeContextType} from '@cdo/apps/codebridge';
import {
  DialogControlInterface,
  DialogType,
  TypedDialogProps,
} from '@cdo/apps/lab2/views/dialogs';
import {GenericPromptProps} from '@cdo/apps/lab2/views/dialogs/GenericPrompt';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

import {smallProject} from './test-files';

export const getDialogControlMock = (
  dialogInput: string,
  dropdownValue?: string
): Pick<DialogControlInterface, 'showDialog'> => ({
  showDialog: (props: TypedDialogProps) => {
    const {validateInput, dropdownProps} = props as GenericPromptProps;
    const error = validateInput?.(dialogInput, dropdownValue);
    if (error) {
      return Promise.resolve({type: 'cancel', args: error});
    } else {
      // GenericPrompt with both text field and dropdown returns structured args
      // GenericDropdown returns dropdown value (or dialogInput for backwards compatibility)
      // GenericPrompt without dropdown returns just the text field value
      let args;
      if (props.type === DialogType.GenericPrompt && dropdownProps) {
        args = {textField: dialogInput, dropdown: dropdownValue};
      } else if (props.type === DialogType.GenericDropdown) {
        args = dropdownValue ?? dialogInput;
      } else {
        args = dialogInput;
      }
      return Promise.resolve({
        type: 'confirm',
        args,
      });
    }
  },
});

export const getDialogAlertMock = (
  type: 'cancel' | 'confirm'
): Pick<DialogControlInterface, 'showDialog'> => ({
  showDialog: () => {
    if (type === 'confirm') {
      return Promise.resolve({type: 'confirm'});
    } else {
      return Promise.resolve({type: 'cancel'});
    }
  },
});

export const getDialogConfirmationMock = (
  type: 'confirm' | 'neutral' | 'cancel'
): Pick<DialogControlInterface, 'showDialog'> => ({
  showDialog: jest.fn(() => {
    if (type === 'confirm') {
      return Promise.resolve({type: 'confirm'});
    } else if (type === 'neutral') {
      return Promise.resolve({type: 'neutral'});
    } else {
      return Promise.resolve({type: 'cancel'});
    }
  }),
});

type AnalyticsDataType = {event: string};
type AnalyticsMockType = (event: string) => void;

export const getAnalyticsMock = (): [AnalyticsDataType, AnalyticsMockType] => {
  const analyticsData = {} as AnalyticsDataType;
  const mock = (event: string) => {
    analyticsData.event = event;
  };

  return [analyticsData, mock];
};

export const getDefaultCodebridgeContext = () => {
  const context: CodebridgeContextType = {
    config: {
      defaultTheme: undefined,
      editableFileTypes: [],
      supportedFileTypes: [],
      PreviewComponents: undefined,
      languageMapping: {},
      activeLayout: undefined,
      validMimeTypes: undefined,
      layoutComponents: {
        horizontal: () => null,
        vertical: () => null,
      },
    },
    setConfig: () => {},
    onRun: () => {
      return Promise.resolve();
    },
    onStop: () => {},
    startSources: {source: smallProject},
    levelProperties: {
      id: 0,
      name: '',
      appName: 'pythonlab',
    },
  };
  return context;
};

export const mockAppOptions = (innerAppOptions: Record<string, unknown>) => {
  jest.spyOn(document, 'querySelector').mockReturnValue({
    dataset: {
      appoptions: JSON.stringify(innerAppOptions),
    },
  } as unknown as Element);
};

export const getBackpackAPIMock = (
  fileList: string[] = [],
  headerValue: string = 'text/plain'
): BackpackClientApi => {
  return {
    appType: 'pythonlab',
    hasBackpack: jest.fn(() => true),
    fetchChannelId: jest.fn(callback => callback()),
    fetchFile: jest.fn((filename, onError, onSuccess) => {
      onSuccess(`Mock contents of backpack file ${filename}`);
    }),
    fetchFileResponse: jest.fn(async (filename: string) => {
      return Promise.resolve({
        headers: {
          get: jest.fn().mockReturnValue(headerValue),
        },
        text: async () => {
          return Promise.resolve(`Mock contents of backpack file ${filename}`);
        },
        blob: async () => {
          return new Blob([`Mock contents of backpack file ${filename}`], {
            type: headerValue,
          });
        },
      });
    }),
    // Callers may either pass callbacks or await the returned list.
    getFileList: jest.fn(async (onError, onSuccess) => {
      onSuccess?.(fileList);
      return fileList;
    }),
    saveFiles: jest.fn(),
    saveFile: jest.fn((filename, contents, onError, onSuccess) =>
      onSuccess?.()
    ),
    saveFileFromUrl: jest.fn(async (filename, url, onError, onSuccess) =>
      onSuccess?.()
    ),
    deleteFiles: jest.fn(),
    updateFilesHelper: jest.fn(),
    saveFilesHelper: jest.fn(),
    writeSingleFileToBackpack: jest.fn(),
    deleteFilesHelper: jest.fn(),
    deleteSingleFileFromBackpack: jest.fn(),
    onRequestComplete: jest.fn(),
  } as unknown as BackpackClientApi;
};

// Mirrors getBackpackAPIMock for the unified client. Callers distinguish the two
// by the presence of getFileLists, so this must have it and the other must not.
export const getUnifiedBackpackAPIMock = (
  fileLists: {[appType: string]: string[]} = {}
): UnifiedBackpackClientApi => {
  return {
    channelId: 'universal_channel_id',
    channelIdsByAppType: Object.fromEntries(
      Object.keys(fileLists).map(appType => [appType, `${appType}_channel_id`])
    ),
    hasBackpack: jest.fn(() => true),
    fetchChannels: jest.fn(async () => {}),
    getFileLists: jest.fn(async () => fileLists),
    getClientForAppType: jest.fn(),
    fetchFile: jest.fn((appType, filename, onError, onSuccess) => {
      onSuccess(`Mock contents of backpack file ${filename}`);
    }),
    fetchFileResponse: jest.fn(),
    getFileFetchUrl: jest.fn(),
    saveFile: jest.fn(async (filename, contents, onError, onSuccess) =>
      onSuccess?.()
    ),
    saveFileFromUrl: jest.fn(async (filename, url, onError, onSuccess) =>
      onSuccess?.()
    ),
    saveBlobFile: jest.fn(),
    deleteFiles: jest.fn(async (appType, filenames, onError, onSuccess) =>
      onSuccess()
    ),
    deleteFromLegacyBackpacks: jest.fn(async () => {}),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  } as unknown as UnifiedBackpackClientApi;
};
