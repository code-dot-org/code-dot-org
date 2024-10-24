import {MoveFolderFunction} from '@codebridge/codebridgeContext/types';
import {openMoveFolderPrompt} from '@codebridge/FileBrowser/prompts/openMoveFolderPrompt';
import {ProjectFolder} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {smallProject, testProject} from '../../test-files/';
import {getDialogControlMock, getAnalyticsMock} from '../../test_utils';

const getMoveFolderMock = (): [ProjectFolder, MoveFolderFunction] => {
  const moveFolderData = {} as ProjectFolder;
  const mock: MoveFolderFunction = (folderId, parentId) => {
    moveFolderData.id = folderId;
    moveFolderData.parentId = parentId;
  };

  return [moveFolderData, mock];
};

describe('openMoveFolderPrompt', function () {
  it('can successfully move a folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const destinationFolderId = '3';

    const [moveFolderData, moveFolderDataMock] = getMoveFolderMock();

    await openMoveFolderPrompt({
      folderId,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderId),
      moveFolder: moveFolderDataMock,
      sendCodebridgeAnalyticsEvent,
    });

    expect(moveFolderData.id).toEqual(folderId);
    expect(moveFolderData.parentId).toEqual(destinationFolderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_MOVE_FOLDER);
  });

  it('can refuse to move a folder that cannot be moved', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';
    const destinationFolderId = '0';

    const [moveFolderData, moveFolderDataMock] = getMoveFolderMock();

    await openMoveFolderPrompt({
      folderId,
      projectFolders: smallProject.folders,
      dialogControl: getDialogControlMock(destinationFolderId),
      moveFolder: moveFolderDataMock,
      sendCodebridgeAnalyticsEvent,
    });

    expect(Object.keys(moveFolderData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
