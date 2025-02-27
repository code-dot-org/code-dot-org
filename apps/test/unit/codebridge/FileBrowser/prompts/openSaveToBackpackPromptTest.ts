import {openSaveToBackpackPrompt} from '@cdo/apps/codebridge/FileBrowser/prompts/openSaveToBackpackPrompt';
import {ProjectFile} from '@cdo/apps/lab2/types';

import {getDialogConfirmationMock, getBackpackAPIMock} from '../../test_utils';

describe('openSaveToBackpackPrompt', () => {
  it('should save a file to the backpack', async () => {
    const mockBackpackApi = getBackpackAPIMock();
    const dialogMock = getDialogConfirmationMock('confirm');
    const projectFile: ProjectFile = {
      name: 'project_file.py',
      contents: 'This is project_file.py.',
    } as ProjectFile;

    await openSaveToBackpackPrompt({
      dialogControl: dialogMock,
      backpackApi: mockBackpackApi,
      file: projectFile,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).toHaveBeenCalledWith(
      'project_file.py',
      expect.objectContaining({name: 'project_file.py'}),
      expect.any(Function),
      expect.any(Function)
    );
  });
  it('should not save a file when canceled', async () => {
    const mockBackpackApi = getBackpackAPIMock();
    const dialogMock = getDialogConfirmationMock('cancel');

    const projectFile: ProjectFile = {
      name: 'project_file.py',
      contents: 'This is project_file.py.',
    } as ProjectFile;

    await openSaveToBackpackPrompt({
      dialogControl: dialogMock,
      backpackApi: mockBackpackApi,
      file: projectFile,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).not.toHaveBeenCalled();
  });
  it('should rename file when duplicate exists and rename (neutral) is selected', async () => {
    const mockBackpackApi = getBackpackAPIMock(['project_file.py']);
    const dialogConfirmationMock = getDialogConfirmationMock('neutral');

    const projectFile: ProjectFile = {
      name: 'project_file.py',
      contents: 'This is project_file.py.',
    } as ProjectFile;

    await openSaveToBackpackPrompt({
      dialogControl: dialogConfirmationMock,
      backpackApi: mockBackpackApi,
      file: projectFile,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).toHaveBeenCalledWith(
      'project_file_1.py',
      expect.objectContaining({
        name: 'project_file_1.py',
        contents: 'This is project_file.py.',
      }),
      expect.any(Function),
      expect.any(Function)
    );
  });
  it('should replace file when duplicate exists and replace (confirm) is selected', async () => {
    const mockBackpackApi = getBackpackAPIMock(['project_file.py']);
    const dialogConfirmationMock = getDialogConfirmationMock('confirm');

    const projectFile: ProjectFile = {
      name: 'project_file.py',
      contents: 'This is project_file.py.',
    } as ProjectFile;

    await openSaveToBackpackPrompt({
      dialogControl: dialogConfirmationMock,
      backpackApi: mockBackpackApi,
      file: projectFile,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).toHaveBeenCalledWith(
      'project_file.py',
      expect.objectContaining({
        name: 'project_file.py',
        contents: 'This is project_file.py.',
      }),
      expect.any(Function),
      expect.any(Function)
    );
  });
});
