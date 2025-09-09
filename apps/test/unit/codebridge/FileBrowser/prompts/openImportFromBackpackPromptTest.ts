import {waitFor} from '@testing-library/react';

import {openImportFromBackpackPrompt} from '@cdo/apps/codebridge/FileBrowser/prompts/openImportFromBackpackPrompt';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {extractUserInput} from '@cdo/apps/lab2/views/dialogs';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

import {getBackpackAPIMock} from '../../test_utils';

jest.mock('@cdo/apps/lab2/views/dialogs', () => ({
  ...jest.requireActual('@cdo/apps/lab2/views/dialogs'),
  extractUserInput: jest.fn(),
  DialogType: {
    GenericConfirmation: 'GenericConfirmation',
    GenericAlert: 'GenericAlert',
    GenericDropdown: 'GenericDropdown',
    PendingDialog: 'PendingDialog',
  },
}));

describe('openImportFromBackpackPrompt', () => {
  let mockBackpackApi: BackpackClientApi,
    dialogControl: {showDialog: jest.Mock},
    newFileFunction: jest.Mock,
    saveFileFunction: jest.Mock,
    projectFiles: MultiFileSource['files'];

  beforeEach(() => {
    mockBackpackApi = getBackpackAPIMock(); // getFileList returns empty list.
    dialogControl = {
      showDialog: jest.fn(),
    };
    newFileFunction = jest.fn();
    saveFileFunction = jest.fn();
    projectFiles = {
      '1': {
        id: '1',
        name: 'project_file1.py',
        language: 'py',
        contents: 'This is project_file1.py',
        folderId: '0',
      },
    };
  });

  const runImportFromBackpackPrompt = async (extraArgs = {}) => {
    await openImportFromBackpackPrompt({
      dialogControl,
      backpackApi: mockBackpackApi,
      newFile: newFileFunction,
      saveFile: saveFileFunction,
      projectFiles,
      ...extraArgs,
    });
  };

  it('shows an alert when there are no files in the backpack', async () => {
    dialogControl.showDialog.mockResolvedValue({
      type: 'confirm',
    });

    await runImportFromBackpackPrompt();

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(dialogControl.showDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GenericAlert',
        title: expect.any(String),
        message: expect.any(String),
      })
    );
  });

  it('imports a backpack file when user confirms', async () => {
    mockBackpackApi = getBackpackAPIMock(['backpack_file.py']); // getFileList returns ['backpack_file.py'].
    (extractUserInput as jest.Mock).mockReturnValue('backpack_file.py');
    // Mock the dialog responses
    dialogControl.showDialog
      .mockResolvedValueOnce({}) // Pending dialog.
      .mockResolvedValueOnce({type: 'confirm'}); // User confirms import.

    await runImportFromBackpackPrompt();

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.fetchFile).toHaveBeenCalledWith(
      'backpack_file.py',
      expect.any(Function),
      expect.any(Function)
    );
    expect(newFileFunction).toHaveBeenCalledWith({
      contents: 'Mock contents of backpack file backpack_file.py',
      fileName: 'backpack_file.py',
    });
  });

  it('renames imported backpack file if duplicate exists and user selects to rename', async () => {
    mockBackpackApi = getBackpackAPIMock(['test_file.py']);
    projectFiles = {
      '1': {
        id: '1',
        name: 'test_file.py',
        language: 'py',
        contents: 'This is project test_file.py',
        folderId: '0',
      },
    };
    dialogControl.showDialog
      .mockResolvedValueOnce({}) // Pending dialog.
      .mockResolvedValueOnce({type: 'confirm'}) // User confirms import.
      .mockResolvedValueOnce({type: 'neutral'}); // User chooses to rename.

    (extractUserInput as jest.Mock).mockReturnValue('test_file.py');

    await runImportFromBackpackPrompt();

    await waitFor(() => {
      expect(mockBackpackApi.getFileList).toHaveBeenCalled();
      expect(dialogControl.showDialog).toHaveBeenCalledTimes(3);
      expect(newFileFunction).toHaveBeenCalledWith({
        contents: 'Mock contents of backpack file test_file.py',
        fileName: 'test_file_1.py', // Renamed file with numeric suffix.
      });
      expect(saveFileFunction).not.toHaveBeenCalled();
    });
  });

  it('replaces existing project file with imported backpack file if user selects replace', async () => {
    mockBackpackApi = getBackpackAPIMock(['test_file.py']);
    projectFiles = {
      '1': {
        id: '1',
        name: 'test_file.py',
        language: 'py',
        contents: 'This is project test_file.py',
        folderId: '0',
      },
    };
    dialogControl.showDialog
      .mockResolvedValueOnce({}) // Pending dialog.
      .mockResolvedValueOnce({type: 'confirm'}) // User confirms import.
      .mockResolvedValueOnce({type: 'confirm'}); // User chooses to replace.

    (extractUserInput as jest.Mock).mockReturnValue('test_file.py');

    await runImportFromBackpackPrompt();

    await waitFor(() => {
      expect(mockBackpackApi.getFileList).toHaveBeenCalled();
      expect(dialogControl.showDialog).toHaveBeenCalledTimes(3);
      expect(newFileFunction).not.toHaveBeenCalled();
      expect(saveFileFunction).toHaveBeenCalledTimes(1);
    });
  });

  it('deletes the backpack file if user selects to delete', async () => {
    mockBackpackApi = getBackpackAPIMock(['backpack_file.py']);
    dialogControl.showDialog
      .mockResolvedValueOnce({}) // Pending dialog.
      .mockResolvedValueOnce({type: 'neutral'}) // User selects to delete backpack file.
      .mockResolvedValueOnce({type: 'confirm'}); // User confirms to delete.

    (extractUserInput as jest.Mock).mockReturnValue('backpack_file.py');

    await runImportFromBackpackPrompt();

    await waitFor(() => {
      expect(mockBackpackApi.getFileList).toHaveBeenCalled();
      expect(dialogControl.showDialog).toHaveBeenCalledTimes(3);
      expect(newFileFunction).not.toHaveBeenCalled();
      expect(saveFileFunction).not.toHaveBeenCalled();
      expect(mockBackpackApi.deleteFiles).toHaveBeenCalled();
    });
  });

  it('renames imported file if backpack file name duplicates hidden validation file', async () => {
    mockBackpackApi = getBackpackAPIMock(['test_file.py']);
    const validationFile = {
      id: '2',
      name: 'test_file.py',
      language: 'py',
      contents: 'This is a validation file.',
      folderId: '0',
    };
    dialogControl.showDialog
      .mockResolvedValueOnce({}) // Pending dialog.
      .mockResolvedValueOnce({type: 'confirm'}) // User confirms import.
      .mockResolvedValueOnce({type: 'confirm'}); // User confirms to rename backpack file that duplicates hidden support file.

    (extractUserInput as jest.Mock).mockReturnValue('test_file.py');

    await runImportFromBackpackPrompt({validationFile});

    await waitFor(() => {
      expect(mockBackpackApi.getFileList).toHaveBeenCalled();
      expect(dialogControl.showDialog).toHaveBeenCalledTimes(3);
      expect(newFileFunction).toHaveBeenCalledWith({
        contents: 'Mock contents of backpack file test_file.py',
        fileName: 'test_file_1.py', // Renamed file with numeric suffix.
      });
      expect(saveFileFunction).not.toHaveBeenCalled();
    });
  });
});
