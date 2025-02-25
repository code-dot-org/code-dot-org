import {openSaveToBackpackPrompt} from '@cdo/apps/codebridge/FileBrowser/prompts/openSaveToBackpackPrompt';
import {ProjectFile} from '@cdo/apps/lab2/types';

import {getDialogConfirmationMock, getBackpackAPIMock} from '../../test_utils';

describe('openSaveToBackpackPrompt', () => {
  it('should save a file to the backpack', async () => {
    const mockBackpackApi = getBackpackAPIMock();
    const dialogMock = getDialogConfirmationMock('confirm');
    const testFile: ProjectFile = {
      name: 'new_file.py',
      contents: 'print("Hello, world!")',
    } as ProjectFile;

    await openSaveToBackpackPrompt({
      dialogControl: dialogMock,
      backpackApi: mockBackpackApi,
      file: testFile,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).toHaveBeenCalledWith(
      'new_file.py',
      expect.objectContaining({name: 'new_file.py'}),
      expect.any(Function),
      expect.any(Function)
    );
  });
  it('should not save a file when canceled', async () => {
    const mockBackpackApi = getBackpackAPIMock();
    const dialogMock = getDialogConfirmationMock('cancel');

    const testFile: ProjectFile = {
      name: 'test_file.py',
      contents: 'print("Hello, world!")',
    } as ProjectFile;

    await openSaveToBackpackPrompt({
      dialogControl: dialogMock,
      backpackApi: mockBackpackApi,
      file: testFile,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).not.toHaveBeenCalled();
  });
  it('should rename file when duplicate exists and rename (neutral) is selected', async () => {
    const mockBackpackApi = getBackpackAPIMock();
    const dialogConfirmationMock = getDialogConfirmationMock('neutral');

    const testFile: ProjectFile = {
      name: 'test1.py',
      contents: 'print("Hello, world!")',
    } as ProjectFile;

    await openSaveToBackpackPrompt({
      dialogControl: dialogConfirmationMock,
      backpackApi: mockBackpackApi,
      file: testFile,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled(); // The mocked getFileList returns ['test1.py', 'test2.py'].
    expect(mockBackpackApi.savePythonlabFile).toHaveBeenCalledWith(
      'test1_1.py',
      expect.objectContaining({
        name: 'test1_1.py',
        contents: 'print("Hello, world!")',
      }),
      expect.any(Function),
      expect.any(Function)
    );
  });
  it('should replace file when duplicate exists and replace (confirm) is selected', async () => {
    const mockBackpackApi = getBackpackAPIMock();
    const dialogConfirmationMock = getDialogConfirmationMock('confirm');

    const testFile: ProjectFile = {
      name: 'test1.py',
      contents: 'print("Hello, world!")',
    } as ProjectFile;

    await openSaveToBackpackPrompt({
      dialogControl: dialogConfirmationMock,
      backpackApi: mockBackpackApi,
      file: testFile,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).toHaveBeenCalledWith(
      'test1.py',
      expect.objectContaining({
        name: 'test1.py',
        contents: 'print("Hello, world!")',
      }),
      expect.any(Function),
      expect.any(Function)
    );
  });
});
