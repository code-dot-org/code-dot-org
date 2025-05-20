import {openSaveToBackpackPrompt} from '@cdo/apps/codebridge/FileBrowser/prompts/openSaveToBackpackPrompt';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

import {getDialogConfirmationMock, getBackpackAPIMock} from '../../test_utils';

describe('openSaveToBackpackPrompt', () => {
  let mockBackpackApi: BackpackClientApi,
    dialogMock: Pick<DialogControlInterface, 'showDialog'>,
    projectFile: ProjectFile;

  beforeEach(() => {
    mockBackpackApi = getBackpackAPIMock(); // getFileList returns empty list.
    dialogMock = getDialogConfirmationMock('confirm');
    projectFile = {
      name: 'project_file.py',
      contents: 'This is project_file.py.',
    } as ProjectFile;
  });

  const runSaveToBackpackPrompt = async () => {
    openSaveToBackpackPrompt({
      dialogControl: dialogMock,
      backpackApi: mockBackpackApi,
      file: projectFile,
    });
  };

  it('should save a file to the backpack', async () => {
    await runSaveToBackpackPrompt();

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).toHaveBeenCalledWith(
      'project_file.py',
      expect.objectContaining({name: 'project_file.py'}),
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('should not save a file when canceled', async () => {
    dialogMock = getDialogConfirmationMock('cancel');

    await runSaveToBackpackPrompt();

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.savePythonlabFile).not.toHaveBeenCalled();
  });

  it('should rename file when duplicate exists and rename (neutral) is selected', async () => {
    mockBackpackApi = getBackpackAPIMock(['project_file.py']); // getFileList returns ['project_file.py'].
    dialogMock = getDialogConfirmationMock('neutral');

    await runSaveToBackpackPrompt();

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
    mockBackpackApi = getBackpackAPIMock(['project_file.py']);

    await runSaveToBackpackPrompt();

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
