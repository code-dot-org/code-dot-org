import {DeleteFolderFunction} from '@codebridge/codebridgeContext/types';
import {openConfirmDeleteFolder} from '@codebridge/FileBrowser/prompts/openConfirmDeleteFolder';
import {ProjectFolder} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject} from '../../test-files/';
import {getDialogAlertMock, getAnalyticsMock} from '../../test_utils';

const getDeleteFolderMock = (): [ProjectFolder, DeleteFolderFunction] => {
  const deleteFolderData = {} as ProjectFolder;
  const mock: DeleteFolderFunction = FolderId => {
    deleteFolderData.id = FolderId;
  };

  return [deleteFolderData, mock];
};

describe('openConfirmDeleteFolder', function () {
  it('can successfully delete a Folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '4';

    const [deleteFolderData, deleteFolderDataMock] = getDeleteFolderMock();

    await openConfirmDeleteFolder({
      folder: testProject.folders[folderId],
      dialogControl: getDialogAlertMock('confirm'),
      deleteFolder: deleteFolderDataMock,
      sendCodebridgeAnalyticsEvent,
      projectFiles: testProject.files,
      projectFolders: testProject.folders,
    });

    expect(deleteFolderData.id).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_DELETE_FOLDER);
  });

  it('can cancel deleting a folder', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const folderId = '1';

    const [deleteFolderData, deleteFolderDataMock] = getDeleteFolderMock();

    await openConfirmDeleteFolder({
      folder: testProject.folders[folderId],
      dialogControl: getDialogAlertMock('cancel'),
      deleteFolder: deleteFolderDataMock,
      sendCodebridgeAnalyticsEvent,
      projectFiles: testProject.files,
      projectFolders: testProject.folders,
    });

    expect(deleteFolderData.id).toBeUndefined();

    expect(analyticsData.event).toBeUndefined();
  });
});
