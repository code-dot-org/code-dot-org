import {MoveFileFunction} from '@codebridge/codebridgeContext/types';
import {openMoveFilePrompt} from '@codebridge/FileBrowser/prompts/openMoveFilePrompt';
import {ProjectFile} from '@codebridge/types';
import {getFolderPath} from '@codebridge/utils';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject} from '../../test-files/';
import {getDialogControlMock, getAnalyticsMock} from '../../test_utils';

const getMoveFileMock = (): [ProjectFile, MoveFileFunction] => {
  const moveFileData = {} as ProjectFile;
  const mock: MoveFileFunction = (fileId, folderId) => {
    moveFileData.id = fileId;
    moveFileData.folderId = folderId;
  };

  return [moveFileData, mock];
};

describe('openMoveFilePrompt', function () {
  it('can successfully move a file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '4';
    const destinationFolderId = '1';
    const destinationFolderName = getFolderPath(
      destinationFolderId,
      testProject.folders
    );

    const [moveFileData, moveFileDataMock] = getMoveFileMock();

    await openMoveFilePrompt({
      fileId,
      projectFiles: testProject.files,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderName),
      moveFile: moveFileDataMock,
      isStartMode: false,
      validationFile: undefined,
      sendCodebridgeAnalyticsEvent,
    });

    expect(moveFileData.id).toEqual(fileId);
    expect(moveFileData.folderId).toEqual(destinationFolderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_MOVE_FILE);
  });

  it('can refuse to move a file to a non-existent folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '4';
    const destinationFolderName = 'fake-folder';

    const [moveFileData, moveFileDataMock] = getMoveFileMock();

    await openMoveFilePrompt({
      fileId,
      projectFiles: testProject.files,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderName),
      moveFile: moveFileDataMock,
      isStartMode: false,
      validationFile: undefined,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(moveFileData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });

  it('can refuse to move a file to a directory which has an identically named file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const destinationFolderId = '1';
    const destinationFolderName = getFolderPath(
      destinationFolderId,
      testProject.folders
    );

    const [moveFileData, moveFileDataMock] = getMoveFileMock();

    await openMoveFilePrompt({
      fileId,
      projectFiles: testProject.files,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderName),
      moveFile: moveFileDataMock,
      isStartMode: false,
      validationFile: undefined,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(moveFileData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
