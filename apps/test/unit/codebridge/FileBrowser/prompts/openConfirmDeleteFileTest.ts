import {DeleteFileFunction} from '@codebridge/codebridgeContext/types';
import {openConfirmDeleteFile} from '@codebridge/FileBrowser/prompts/openConfirmDeleteFile';
import {ProjectFile} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject} from '../../test-files/';
import {getDialogAlertMock, getAnalyticsMock} from '../../test_utils';

const getDeleteFileMock = (): [ProjectFile, DeleteFileFunction] => {
  const deleteFileData = {} as ProjectFile;
  const mock: DeleteFileFunction = ({fileId}) => {
    deleteFileData.id = fileId;
  };

  return [deleteFileData, mock];
};

describe('openConfirmDeleteFile', function () {
  it('can successfully delete a file', async function () {
    const [analyticsData, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const fileId = '4';

    const [deleteFileData, deleteFileDataMock] = getDeleteFileMock();

    await openConfirmDeleteFile({
      file: testProject.files[fileId],
      dialogControl: getDialogAlertMock('confirm'),
      deleteFile: deleteFileDataMock,
      sendLab2AnalyticsEvent,
    });

    expect(deleteFileData.id).toEqual(fileId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_DELETE_FILE);
  });

  it('can successfully delete a validation file', async function () {
    const [analyticsData, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const fileId = '7';

    const [deleteFileData, deleteFileDataMock] = getDeleteFileMock();

    await openConfirmDeleteFile({
      file: testProject.files[fileId],
      dialogControl: getDialogAlertMock('confirm'),
      deleteFile: deleteFileDataMock,
      sendLab2AnalyticsEvent,
    });

    expect(deleteFileData.id).toEqual(fileId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_DELETE_FILE);
  });

  it('can cancel deleting a file', async function () {
    const [analyticsData, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';

    const [deleteFileData, deleteFileDataMock] = getDeleteFileMock();

    await openConfirmDeleteFile({
      file: testProject.files[fileId],
      dialogControl: getDialogAlertMock('cancel'),
      deleteFile: deleteFileDataMock,
      sendLab2AnalyticsEvent,
    });

    expect(deleteFileData.id).toBeUndefined();

    expect(analyticsData.event).toBeUndefined();
  });

  it('calls onFileDelete with the deleted file on confirm', async function () {
    const [, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const fileId = '4';
    const [, deleteFileDataMock] = getDeleteFileMock();
    const onFileDelete = jest.fn();

    await openConfirmDeleteFile({
      file: testProject.files[fileId],
      dialogControl: getDialogAlertMock('confirm'),
      deleteFile: deleteFileDataMock,
      sendLab2AnalyticsEvent,
      onFileDelete,
    });

    expect(onFileDelete).toHaveBeenCalledWith(testProject.files[fileId]);
  });

  it('does not call onFileDelete on cancel', async function () {
    const [, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const [, deleteFileDataMock] = getDeleteFileMock();
    const onFileDelete = jest.fn();

    await openConfirmDeleteFile({
      file: testProject.files[fileId],
      dialogControl: getDialogAlertMock('cancel'),
      deleteFile: deleteFileDataMock,
      sendLab2AnalyticsEvent,
      onFileDelete,
    });

    expect(onFileDelete).not.toHaveBeenCalled();
  });
});
