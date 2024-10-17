import {RenameFolderFunction} from '@codebridge/codebridgeContext/types';
import {openRenameFolderPrompt} from '@codebridge/FileBrowser/prompts/openRenameFolderPrompt';
import {ProjectFolder} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject} from '../../test-files/';
import {getDialogControlMock, getAnalyticsMock} from '../../test_utils';

const getRenameFolderMock = (): [ProjectFolder, RenameFolderFunction] => {
  const renameFolderData = {} as ProjectFolder;
  const mock: RenameFolderFunction = (folderId, newName) => {
    renameFolderData.name = newName;
    renameFolderData.id = folderId;
  };

  return [renameFolderData, mock];
};

describe('openRenameFolderPrompt', function () {
  it('can successfully rename a folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const newFolderName = 'valid_folder_name';

    const [renameFolderData, renameFolderDataMock] = getRenameFolderMock();

    await openRenameFolderPrompt({
      folderId,
      dialogControl: getDialogControlMock(newFolderName),
      renameFolder: renameFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(renameFolderData.id).toEqual(folderId);
    expect(renameFolderData.name).toEqual(newFolderName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_RENAME_FOLDER);
  });

  it('can rename a folder to itself', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const newFolderName = testProject.folders[folderId].name;

    const [renameFolderData, renameFolderDataMock] = getRenameFolderMock();

    await openRenameFolderPrompt({
      folderId,
      dialogControl: getDialogControlMock(newFolderName),
      renameFolder: renameFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(renameFolderData.id).toEqual(folderId);
    expect(renameFolderData.name).toEqual(newFolderName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_RENAME_FOLDER);
  });

  it('can rename a folder to nothing', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const newFolderName = '';

    const [renameFolderData, renameFolderDataMock] = getRenameFolderMock();

    await openRenameFolderPrompt({
      folderId,
      dialogControl: getDialogControlMock(newFolderName),
      renameFolder: renameFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(renameFolderData.id).toEqual(folderId);
    expect(renameFolderData.name).toEqual(newFolderName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_RENAME_FOLDER);
  });

  it('can refuse to rename a folder to a duplicate name', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const newFolderName = 'testfolder2';

    const [renameFolderData, renameFolderDataMock] = getRenameFolderMock();

    await openRenameFolderPrompt({
      folderId,
      dialogControl: getDialogControlMock(newFolderName),
      renameFolder: renameFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(renameFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });

  it('can refuse to rename a folder to an invalid name', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const newFolderName = 'testfolder!';

    const [renameFolderData, renameFolderDataMock] = getRenameFolderMock();

    await openRenameFolderPrompt({
      folderId,
      dialogControl: getDialogControlMock(newFolderName),
      renameFolder: renameFolderDataMock,
      projectFolders: testProject.folders,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(renameFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
