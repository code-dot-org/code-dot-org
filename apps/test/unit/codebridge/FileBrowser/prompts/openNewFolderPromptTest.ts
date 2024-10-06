import {NewFolderFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {
  validateNewFolderName,
  openNewFolderPrompt,
} from '@codebridge/FileBrowser/prompts/openNewFolderPrompt';
import {FolderId, ProjectFolder} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {GenericPromptProps} from '@cdo/apps/lab2/views/dialogs/GenericPrompt';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import testProject from '../../testProject.json';

/*
type OpenNewFilePromptArgsType = {
  parentId: FolderId;
  appName: string;
  dialogControl: DialogControlInterface;
  newFolder: NewFolderFunction;
  projectFolders: ProjectType['folders'];
};
*/

/*
export interface MultiFileSource {
  folders: Record<FolderId, ProjectFolder>;
  files: Record<FileId, ProjectFile>;
  openFiles?: FileId[];
}

export interface ProjectFile {
  id: FileId;
  name: string;
  language: string;
  contents: string;
  open?: boolean;
  active?: boolean;
  folderId: string;
  type?: ProjectFileType;
}

export enum ProjectFileType {
  STARTER = 'starter',
  SUPPORT = 'support',
  VALIDATION = 'validation',
}

export interface ProjectFolder {
  id: FolderId;
  name: string;
  parentId: string;
  open?: boolean;
}*/

/*
export const openNewFolderPrompt = async ({
  parentId = DEFAULT_FOLDER_ID,
  appName,
  dialogControl,
  newFolder,
  projectFolders,
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
  sendCodebridgeAnalyticsEvent(eventName, appName);
};*/

/*
type OpenNewFilePromptArgsType = {
  parentId: FolderId;
  appName: string;
  dialogControl: DialogControlInterface;
  newFolder: NewFolderFunction;
  projectFolders: ProjectType['folders'];
};*/

/*
export interface DialogControlInterface {
  closeDialog: DialogCloseFunctionType;
  showDialog: (args: TypedDialogProps) => Promise<DialogClosePromiseReturnType>;
  deferredPromiseObject: DeferredPromiseObject;
  promiseArgs: unknown;
  setPromiseArgs: (args: unknown) => void;
}*/

/*export const validateNewFolderName = ({
  folderName,
  parentId,
  projectFolders,
}: ValidateInputArgs) => {
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
}; */

const getDialogControlMock = (
  newFolderName: string
): Pick<DialogControlInterface, 'showDialog'> => ({
  showDialog: ({validateInput}: GenericPromptProps) => {
    const error = validateInput?.(newFolderName);
    if (error) {
      return Promise.resolve({type: 'cancel', args: error});
    } else {
      return Promise.resolve({type: 'confirm', args: newFolderName});
    }
  },
});

const getNewFolderMock = (
  parentId: FolderId
): [ProjectFolder, NewFolderFunction] => {
  const newFolderData = {} as ProjectFolder;
  const mock: NewFolderFunction = ({parentId, folderName, folderId}) => {
    newFolderData.parentId = parentId ?? DEFAULT_FOLDER_ID;
    newFolderData.name = folderName;
    newFolderData.id = folderId;
  };

  return [newFolderData, mock];
};

type AnalyticsDataType = {event: string};
type AnalyticsMockType = (event: string) => void;

const getAnalyticsMock = (): [AnalyticsDataType, AnalyticsMockType] => {
  const analyticsData = {} as AnalyticsDataType;
  const mock = (event: string) => {
    analyticsData.event = event;
  };

  return [analyticsData, mock];
};

const appName = 'Codebridge Unit Test';
const EXPECTED_NEXT_FOLDER_ID = '4';

describe('CodeBrige/FileBrowser/prompts/openNewFolderPrompt', function () {
  it('can validateNewFolderName', function () {
    expect(
      validateNewFolderName({
        folderName: '',
        parentId: DEFAULT_FOLDER_ID,
        projectFolders: testProject.folders,
      })
    ).toEqual(undefined);

    expect(
      validateNewFolderName({
        folderName: '@',
        parentId: DEFAULT_FOLDER_ID,
        projectFolders: testProject.folders,
      })
    ).toEqual(codebridgeI18n.invalidNameError());

    expect(
      validateNewFolderName({
        folderName: 'testfolder1',
        parentId: DEFAULT_FOLDER_ID,
        projectFolders: testProject.folders,
      })
    ).toEqual(codebridgeI18n.folderExistsError());
  });
  it('can successfully add a new folder to root', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFolderName = 'valid_folder_name';
    const parentId = DEFAULT_FOLDER_ID;

    const [newFolderData, newFolderDataMock] = getNewFolderMock(parentId);

    await openNewFolderPrompt({
      parentId,
      appName,
      dialogControl: getDialogControlMock(newFolderName),
      newFolder: newFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(newFolderData.parentId).toEqual(parentId);
    expect(newFolderData.name).toEqual(newFolderName);
    expect(newFolderData.id).toEqual(EXPECTED_NEXT_FOLDER_ID);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FOLDER);
  });

  it('can successfully add a new folder to subfolder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFolderName = 'valid_folder_name';
    const parentId = '1';

    const [newFolderData, newFolderDataMock] = getNewFolderMock(parentId);

    await openNewFolderPrompt({
      parentId,
      appName,
      dialogControl: getDialogControlMock(newFolderName),
      newFolder: newFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(newFolderData.parentId).toEqual(parentId);
    expect(newFolderData.name).toEqual(newFolderName);
    expect(newFolderData.id).toEqual(EXPECTED_NEXT_FOLDER_ID);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_SUBFOLDER);
  });

  it('can refuse to add an invalid folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFolderName = 'invalid folder @';
    const parentId = DEFAULT_FOLDER_ID;

    const [newFolderData, newFolderDataMock] = getNewFolderMock(parentId);

    await openNewFolderPrompt({
      parentId: DEFAULT_FOLDER_ID,
      appName,
      dialogControl: getDialogControlMock(newFolderName),
      newFolder: newFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(newFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });

  it('can refuse to add a duplicate folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFolderName = 'testfolder1';
    const parentId = DEFAULT_FOLDER_ID;

    const [newFolderData, newFolderDataMock] = getNewFolderMock(parentId);

    await openNewFolderPrompt({
      parentId: DEFAULT_FOLDER_ID,
      appName,
      dialogControl: getDialogControlMock(newFolderName),
      newFolder: newFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(newFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
