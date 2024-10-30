import {NewFileFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {openNewFilePrompt} from '@codebridge/FileBrowser/prompts/openNewFilePrompt';
import {FolderId, ProjectFile} from '@codebridge/types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {testProject, validationFile} from '../../test-files/';
import {getDialogControlMock, getAnalyticsMock} from '../../test_utils';

const getNewFileMock = (parentId: FolderId): [ProjectFile, NewFileFunction] => {
  const newFileData = {} as ProjectFile;
  const mock: NewFileFunction = ({fileName, folderId}) => {
    newFileData.name = fileName;
    if (folderId) {
      newFileData.folderId = folderId;
    }
  };

  return [newFileData, mock];
};

describe('openNewFilePrompt', function () {
  it('can successfully add a new file to root w/o validation file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFileName = 'valid_file.txt';
    const folderId = DEFAULT_FOLDER_ID;

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      folderId,
      dialogControl: getDialogControlMock(newFileName),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(newFileData.name).toEqual(newFileName);
    expect(newFileData.folderId).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FILE);
  });

  it('can successfully implicitly add a new file to root w/o validation file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFileName = 'valid_file.txt';
    const folderId = DEFAULT_FOLDER_ID;

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      dialogControl: getDialogControlMock(newFileName),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(newFileData.name).toEqual(newFileName);
    expect(newFileData.folderId).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FILE);
  });

  it('can successfully add a new file to a subfolder  w/o validation file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFileName = 'valid_file.txt';
    const folderId = '1';

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      folderId,
      dialogControl: getDialogControlMock(newFileName),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(newFileData.name).toEqual(newFileName);
    expect(newFileData.folderId).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FILE);
  });

  it('can successfully add a new file to root w/ validation file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFileName = 'valid_file.txt';
    const folderId = DEFAULT_FOLDER_ID;

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      folderId,
      dialogControl: getDialogControlMock(newFileName),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile,
    });

    expect(newFileData.name).toEqual(newFileName);
    expect(newFileData.folderId).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FILE);
  });

  it('can refuse to add an invalid file', async function () {
    const [analyticsData, sendCodebridgeAnalyticsEvent] = getAnalyticsMock();
    const newFileName = 'invalid_file';
    const folderId = DEFAULT_FOLDER_ID;

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      folderId,
      dialogControl: getDialogControlMock(newFileName),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendCodebridgeAnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
    });

    expect(Object.keys(newFileData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
