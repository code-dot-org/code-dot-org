import {DeleteFileFunction} from '@codebridge/codebridgeContext/types';
import {openConfirmDeleteFile} from '@codebridge/FileBrowser/prompts/openConfirmDeleteFile';
import {ProjectFile} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject} from '../../test-files/';
import {getDialogAlertMock, getAnalyticsMock} from '../../test_utils';

const getDeleteFileMock = (): [ProjectFile, DeleteFileFunction] => {
  const deleteFileData = {} as ProjectFile;
  const mock: DeleteFileFunction = fileId => {
    deleteFileData.id = fileId;
  };

  return [deleteFileData, mock];
};

const getCleaupValidationMock = (): [{called: boolean}, () => void] => {
  const cleanupValidationFileData = {called: false};
  const mock = () => {
    cleanupValidationFileData.called = true;
  };

  return [cleanupValidationFileData, mock];
};

describe('openConfirmDeleteFile', function () {
  it('can successfully delete a file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '4';

    const [deleteFileData, deleteFileDataMock] = getDeleteFileMock();
    const [cleanupValidationFileData, cleanupValidationFile] =
      getCleaupValidationMock();

    await openConfirmDeleteFile({
      file: testProject.files[fileId],
      dialogControl: getDialogAlertMock('confirm'),
      deleteFile: deleteFileDataMock,
      sendCodebridgeAnalyticsEvent,
      cleanupValidationFile,
    });

    expect(deleteFileData.id).toEqual(fileId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_DELETE_FILE);
    expect(cleanupValidationFileData.called).toEqual(false);
  });

  it('can successfully delete a validation file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '7';

    const [deleteFileData, deleteFileDataMock] = getDeleteFileMock();
    const [cleanupValidationFileData, cleanupValidationFile] =
      getCleaupValidationMock();

    await openConfirmDeleteFile({
      file: testProject.files[fileId],
      dialogControl: getDialogAlertMock('confirm'),
      deleteFile: deleteFileDataMock,
      sendCodebridgeAnalyticsEvent,
      cleanupValidationFile,
    });

    expect(deleteFileData.id).toEqual(fileId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_DELETE_FILE);
    expect(cleanupValidationFileData.called).toEqual(true);
  });

  it('can cancel deleting a file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';

    const [deleteFileData, deleteFileDataMock] = getDeleteFileMock();
    const [cleanupValidationFileData, cleanupValidationFile] =
      getCleaupValidationMock();

    await openConfirmDeleteFile({
      file: testProject.files[fileId],
      dialogControl: getDialogAlertMock('cancel'),
      deleteFile: deleteFileDataMock,
      sendCodebridgeAnalyticsEvent,
      cleanupValidationFile,
    });

    expect(deleteFileData.id).toBeUndefined();

    expect(analyticsData.event).toBeUndefined();
    expect(cleanupValidationFileData.called).toEqual(false);
  });
});
