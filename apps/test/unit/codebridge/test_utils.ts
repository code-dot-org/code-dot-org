import {CodebridgeContextType} from '@cdo/apps/codebridge';
import {DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {GenericPromptProps} from '@cdo/apps/lab2/views/dialogs/GenericPrompt';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

import {smallProject} from './test-files';

export const getDialogControlMock = (
  dialogInput: string
): Pick<DialogControlInterface, 'showDialog'> => ({
  showDialog: ({validateInput}: GenericPromptProps) => {
    const error = validateInput?.(dialogInput);
    if (error) {
      return Promise.resolve({type: 'cancel', args: error});
    } else {
      return Promise.resolve({type: 'confirm', args: dialogInput});
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
  showDialog: () => {
    if (type === 'confirm') {
      return Promise.resolve({type: 'confirm'});
    } else if (type === 'neutral') {
      return Promise.resolve({type: 'neutral'});
    } else {
      return Promise.resolve({type: 'cancel'});
    }
  },
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
      previewFileTypes: undefined,
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
  fileList: string[] = []
): BackpackClientApi => {
  return {
    hasBackpack: jest.fn(() => true),
    fetchChannelId: jest.fn(callback => callback()),
    fetchFile: jest.fn((filename, onError, onSuccess) => {
      onSuccess(`Mock contents of backpack file ${filename}`);
    }),
    getFileList: jest.fn((onError, onSuccess) => {
      onSuccess(fileList);
    }),
    saveFiles: jest.fn(),
    savePythonlabFile: jest.fn(),
    deleteFiles: jest.fn(),
    updateFilesHelper: jest.fn(),
    saveFilesHelper: jest.fn(),
    writeSingleFileToBackpack: jest.fn(),
    deleteFilesHelper: jest.fn(),
    deleteSingleFileFromBackpack: jest.fn(),
    onRequestComplete: jest.fn(),
  } as unknown as BackpackClientApi;
};
