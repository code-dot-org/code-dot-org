import {MoveFolderFunction} from '@codebridge/codebridgeContext/types';
import {openMoveFolderPrompt} from '@codebridge/FileBrowser/prompts/openMoveFolderPrompt';
import {ProjectFolder} from '@codebridge/types';

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

    const [MoveFolderData, MoveFolderDataMock] = getMoveFolderMock();

    await openMoveFolderPrompt({
      folderId,
      projectFolders: testProject.folders,
      dialogControl: getDialogControlMock(destinationFolderId),
      moveFolder: MoveFolderDataMock,
      sendCodebridgeAnalyticsEvent,
    });

    expect(MoveFolderData.id).toEqual(folderId);
    expect(MoveFolderData.parentId).toEqual(destinationFolderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_MOVE_FOLDER);
  });
});
