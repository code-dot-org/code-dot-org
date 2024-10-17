import {MoveFolderFunction} from '@codebridge/codebridgeContext/types';
import {openMoveFolderPrompt} from '@codebridge/FileBrowser/prompts/openMoveFolderPrompt';
import {ProjectFolder} from '@codebridge/types';
import {getFolderPath} from '@codebridge/utils';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject} from '../../test-files/';
import {getDialogControlMock, getAnalyticsMock} from '../../test_utils';

const getMoveFolderMock = (): [ProjectFolder, MoveFolderFunction] => {
  const MoveFolderData = {} as ProjectFolder;
  const mock: MoveFolderFunction = (folderId, parentId) => {
    MoveFolderData.id = folderId;
    MoveFolderData.parentId = parentId;
  };

  return [MoveFolderData, mock];
};

describe('openMoveFolderPrompt', function () {
  it('can successfully move a folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const destinationFolderId = '3';
    const destinationFolderName = getFolderPath(
      destinationFolderId,
      testProject.folders
    );

    const [MoveFolderData, MoveFolderDataMock] = getMoveFolderMock();

    await openMoveFolderPrompt({
      folderId,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderName),
      moveFolder: MoveFolderDataMock,
      sendCodebridgeAnalyticsEvent,
    });

    expect(MoveFolderData.id).toEqual(folderId);
    expect(MoveFolderData.parentId).toEqual(destinationFolderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_MOVE_FOLDER);
  });

  it('can refuse to move a folder to a non-existent folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '4';
    const destinationFolderName = 'fake-folder';

    const [MoveFolderData, MoveFolderDataMock] = getMoveFolderMock();

    await openMoveFolderPrompt({
      folderId,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderName),
      moveFolder: MoveFolderDataMock,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(MoveFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });

  it('can refuse to move a folder to a directory which has an identically named folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '2';
    const destinationFolderId = '0';
    const destinationFolderName = getFolderPath(
      destinationFolderId,
      testProject.folders
    );

    const [MoveFolderData, MoveFolderDataMock] = getMoveFolderMock();

    await openMoveFolderPrompt({
      folderId,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderName),
      moveFolder: MoveFolderDataMock,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(MoveFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });

  it('can refuse to move a folder to a itself', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '2';
    const destinationFolderId = '2';
    const destinationFolderName = getFolderPath(
      destinationFolderId,
      testProject.folders
    );

    const [MoveFolderData, MoveFolderDataMock] = getMoveFolderMock();

    await openMoveFolderPrompt({
      folderId,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderName),
      moveFolder: MoveFolderDataMock,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(MoveFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });

  it('can refuse to move a folder to a child folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const destinationFolderId = '2';
    const destinationFolderName = getFolderPath(
      destinationFolderId,
      testProject.folders
    );

    const [MoveFolderData, MoveFolderDataMock] = getMoveFolderMock();

    await openMoveFolderPrompt({
      folderId,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderName),
      moveFolder: MoveFolderDataMock,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(MoveFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
