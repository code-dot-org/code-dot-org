import {CodebridgeContextType, FileId, FolderId} from '@cdo/apps/codebridge';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import {DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {GenericPromptProps} from '@cdo/apps/lab2/views/dialogs/GenericPrompt';

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
    source: smallProject,
    config: {
      activeLeftNav: '',
      sideBar: [],
      instructions: undefined,
      Instructions: undefined,
      defaultTheme: undefined,
      leftNav: [],
      gridLayout: undefined,
      gridLayoutRows: undefined,
      gridLayoutColumns: undefined,
      editableFileTypes: [],
      previewFileTypes: undefined,
      PreviewComponents: undefined,
      languageMapping: {},
      labeledGridLayouts: undefined,
      activeGridLayout: undefined,
      showFileBrowser: false,
      validMimeTypes: undefined,
    },
    setProject: () => {},
    setConfig: () => {},
    onRun: () => {
      return Promise.resolve();
    },
    onStop: () => {},
    saveFile: (fileId: FileId, contents: string) => {},
    closeFile: (fileId: FileId) => {},
    setActiveFile: (fileId: FileId) => {},
    newFolder: (arg: {folderName: string; parentId?: FolderId}) => {},
    toggleOpenFolder: (folderId: FolderId) => {},
    deleteFolder: (folderId: FolderId) => {},
    openFile: (fileId: FileId) => {},
    deleteFile: (fileId: FileId) => {},
    newFile: (arg: {
      fileName: string;
      folderId?: FolderId;
      contents?: string;
      validationFileId?: string;
    }) => {},
    renameFile: (fileId: FileId, newName: string) => {},
    moveFile: (fileId: FileId, folderId: FolderId) => {},
    moveFolder: (folderId: FolderId, parentId: FolderId) => {},
    renameFolder: (folderId: string, newName: string) => {},
    setFileType: (fileId: FileId, type: ProjectFileType) => {},
    rearrangeFiles: (fileIds: FileId[]) => {},
    startSources: {source: smallProject},
  };
  return context;
};
