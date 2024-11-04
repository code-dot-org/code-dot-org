import {NewFolderFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {openNewFolderPrompt} from '@codebridge/FileBrowser/prompts/openNewFolderPrompt';
import {FolderId, ProjectFolder} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject} from '../../test-files/';
import {getDialogControlMock, getAnalyticsMock} from '../../test_utils';

const getNewFolderMock = (
  parentId: FolderId
): [ProjectFolder, NewFolderFunction] => {
  const newFolderData = {} as ProjectFolder;
  const mock: NewFolderFunction = ({parentId, folderName}) => {
    newFolderData.parentId = parentId ?? DEFAULT_FOLDER_ID;
    newFolderData.name = folderName;
  };

  return [newFolderData, mock];
};

describe('openNewFolderPrompt', function () {
  it('can successfully add a new folder to root', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFolderName = 'valid_folder_name';
    const parentId = DEFAULT_FOLDER_ID;

    const [newFolderData, newFolderDataMock] = getNewFolderMock(parentId);

    await openNewFolderPrompt({
      parentId,
      dialogControl: getDialogControlMock(newFolderName),
      newFolder: newFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(newFolderData.parentId).toEqual(parentId);
    expect(newFolderData.name).toEqual(newFolderName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FOLDER);
  });

  it('can successfully implicitly add a new folder to root', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFolderName = 'valid_folder_name';
    const parentId = DEFAULT_FOLDER_ID;

    const [newFolderData, newFolderDataMock] = getNewFolderMock(parentId);

    await openNewFolderPrompt({
      dialogControl: getDialogControlMock(newFolderName),
      newFolder: newFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(newFolderData.parentId).toEqual(parentId);
    expect(newFolderData.name).toEqual(newFolderName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FOLDER);
  });

  it('can successfully add a new folder to subfolder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFolderName = 'valid_folder_name';
    const parentId = '1';

    const [newFolderData, newFolderDataMock] = getNewFolderMock(parentId);

    await openNewFolderPrompt({
      parentId,
      dialogControl: getDialogControlMock(newFolderName),
      newFolder: newFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(newFolderData.parentId).toEqual(parentId);
    expect(newFolderData.name).toEqual(newFolderName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_SUBFOLDER);
  });

  it('can refuse to add an invalid folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFolderName = 'invalid folder @';
    const parentId = DEFAULT_FOLDER_ID;

    const [newFolderData, newFolderDataMock] = getNewFolderMock(parentId);

    await openNewFolderPrompt({
      parentId: DEFAULT_FOLDER_ID,
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
      dialogControl: getDialogControlMock(newFolderName),
      newFolder: newFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(newFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
