import {MoveFileFunction} from '@codebridge/codebridgeContext/types';
import {openMoveFilePrompt} from '@codebridge/FileBrowser/prompts/openMoveFilePrompt';
import {ProjectFile} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject, smallProject} from '../../test-files/';
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

    const [moveFileData, moveFileDataMock] = getMoveFileMock();

    await openMoveFilePrompt({
      fileId,
      projectFiles: testProject.files,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderId),
      moveFile: moveFileDataMock,
      isStartMode: false,
      validationFile: undefined,
      sendCodebridgeAnalyticsEvent,
    });

    expect(moveFileData.id).toEqual(fileId);
    expect(moveFileData.folderId).toEqual(destinationFolderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_MOVE_FILE);
  });

  it('can refuse to move a file that cannot be moved', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const destinationFolderId = '1';

    const [moveFileData, moveFileDataMock] = getMoveFileMock();

    await openMoveFilePrompt({
      fileId,
      projectFiles: smallProject.files,
      projectFolders: smallProject.folders,
      dialogControl: getDialogControlMock(destinationFolderId),
      moveFile: moveFileDataMock,
      isStartMode: false,
      validationFile: undefined,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(moveFileData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
