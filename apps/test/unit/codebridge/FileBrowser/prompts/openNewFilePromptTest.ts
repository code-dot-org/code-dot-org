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
    const [analyticsData, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const baseFileName = 'valid_file';
    const fileExtension = 'txt';
    const folderId = DEFAULT_FOLDER_ID;

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      folderId,
      dialogControl: getDialogControlMock(baseFileName, fileExtension),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendLab2AnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
      validFileTypes: [fileExtension],
    });

    expect(newFileData.name).toEqual(`${baseFileName}.${fileExtension}`);
    expect(newFileData.folderId).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FILE);
  });

  it('can successfully implicitly add a new file to root w/o validation file', async function () {
    const [analyticsData, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const baseFileName = 'valid_file';
    const fileExtension = 'txt';
    const folderId = DEFAULT_FOLDER_ID;

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      dialogControl: getDialogControlMock(baseFileName, fileExtension),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendLab2AnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
      validFileTypes: [fileExtension],
    });

    expect(newFileData.name).toEqual(`${baseFileName}.${fileExtension}`);
    expect(newFileData.folderId).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FILE);
  });

  it('can successfully add a new file to a subfolder  w/o validation file', async function () {
    const [analyticsData, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const baseFileName = 'valid_file';
    const fileExtension = 'txt';
    const folderId = '1';

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      folderId,
      dialogControl: getDialogControlMock(baseFileName, fileExtension),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendLab2AnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
      validFileTypes: [fileExtension],
    });

    expect(newFileData.name).toEqual(`${baseFileName}.${fileExtension}`);
    expect(newFileData.folderId).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FILE);
  });

  it('can successfully add a new file to root w/ validation file', async function () {
    const [analyticsData, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const baseFileName = 'valid_file';
    const fileExtension = 'txt';
    const folderId = DEFAULT_FOLDER_ID;

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      folderId,
      dialogControl: getDialogControlMock(baseFileName, fileExtension),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendLab2AnalyticsEvent,
      isStartMode: false,
      validationFile,
      validFileTypes: [fileExtension],
    });

    expect(newFileData.name).toEqual(`${baseFileName}.${fileExtension}`);
    expect(newFileData.folderId).toEqual(folderId);

    expect(analyticsData.event).toEqual(EVENTS.CODEBRIDGE_NEW_FILE);
  });

  it('can refuse to add an invalid file', async function () {
    const [analyticsData, sendLab2AnalyticsEvent] = getAnalyticsMock();
    const invalidFileName = 'invalid file';
    const folderId = DEFAULT_FOLDER_ID;

    const [newFileData, newFileDataMock] = getNewFileMock(folderId);

    await openNewFilePrompt({
      folderId,
      dialogControl: getDialogControlMock(invalidFileName, 'txt'),
      newFile: newFileDataMock,
      projectFiles: testProject.files,
      sendLab2AnalyticsEvent,
      isStartMode: false,
      validationFile: undefined,
      validFileTypes: ['txt'],
    });

    expect(Object.keys(newFileData).length).toEqual(0);
    expect(Object.keys(analyticsData).length).toEqual(0);
  });
});
