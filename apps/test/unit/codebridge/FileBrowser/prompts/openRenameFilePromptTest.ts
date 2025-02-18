import {RenameFileFunction} from '@codebridge/codebridgeContext/types';
import {openRenameFilePrompt} from '@codebridge/FileBrowser/prompts/openRenameFilePrompt';
import {ProjectFolder} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject} from '../../test-files/';
import {getDialogControlMock, getAnalyticsMock} from '../../test_utils';

const getRenameFileMock = (): [ProjectFolder, RenameFileFunction] => {
  const renameFileData = {} as ProjectFolder;
  const mock: RenameFileFunction = (fileId, newName) => {
    renameFileData.name = newName;
    renameFileData.id = fileId;
  };

  return [renameFileData, mock];
};

describe('openRenameFilePrompt', function () {
  it('can successfully rename a file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const newFileName = 'valid_file_name.txt';

    const [renameFileData, renameFileDataMock] = getRenameFileMock();

    await openRenameFilePrompt({
      fileId,
      dialogControl: getDialogControlMock(newFileName),
      renameFile: renameFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(renameFileData.id).toEqual(fileId);
    expect(renameFileData.name).toEqual(newFileName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_RENAME_FILE);
  });

  it('can rename a file to itself', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const newFileName = testProject.files[fileId].name;

    const [renameFileData, renameFileDataMock] = getRenameFileMock();

    await openRenameFilePrompt({
      fileId,
      dialogControl: getDialogControlMock(newFileName),
      renameFile: renameFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(renameFileData.id).toEqual(fileId);
    expect(renameFileData.name).toEqual(newFileName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_RENAME_FILE);
  });

  it('can rename a file to nothing', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const newFileName = '';

    const [renameFileData, renameFileDataMock] = getRenameFileMock();

    await openRenameFilePrompt({
      fileId,
      dialogControl: getDialogControlMock(newFileName),
      renameFile: renameFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(renameFileData.id).toEqual(fileId);
    expect(renameFileData.name).toEqual(newFileName);
    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_RENAME_FILE);
  });

  it('can refuse to rename a file to a duplicate name', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const newFileName = 'testFile3.txt';

    const [renameFileData, renameFileDataMock] = getRenameFileMock();

    await openRenameFilePrompt({
      fileId,
      dialogControl: getDialogControlMock(newFileName),
      renameFile: renameFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(Object.keys(renameFileData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });

  it('can refuse to rename a file to an invalid name', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const newFileName = 'testfolder!';

    const [renameFileData, renameFileDataMock] = getRenameFileMock();

    await openRenameFilePrompt({
      fileId,
      dialogControl: getDialogControlMock(newFileName),
      renameFile: renameFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(Object.keys(renameFileData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });

  it('can refuse to rename a file to not have an extension', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const fileId = '1';
    const newFileName = 'invalidFile';

    const [renameFileData, renameFileDataMock] = getRenameFileMock();

    await openRenameFilePrompt({
      fileId,
      dialogControl: getDialogControlMock(newFileName),
      renameFile: renameFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(Object.keys(renameFileData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
