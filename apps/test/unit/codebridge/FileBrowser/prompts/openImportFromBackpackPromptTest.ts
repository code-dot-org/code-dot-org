import {openImportFromBackpackPrompt} from '@cdo/apps/codebridge/FileBrowser/prompts/openImportFromBackpackPrompt';
import {extractUserInput} from '@cdo/apps/lab2/views/dialogs';

import {getBackpackAPIMock} from '../../test_utils';

jest.mock('@cdo/apps/lab2/views/dialogs', () => ({
  ...jest.requireActual('@cdo/apps/lab2/views/dialogs'),
  extractUserInput: jest.fn(), // Mock extractUserInput.
  DialogType: {
    GenericConfirmation: 'GenericConfirmation',
    GenericAlert: 'GenericAlert',
    GenericDropdown: 'GenericDropdown',
    PendingDialog: 'PendingDialog',
  },
}));

describe('openImportFromBackpackPrompt', () => {
  it('should show an alert when there are no files in the backpack', async () => {
    const mockBackpackApi = getBackpackAPIMock(true); // getFileList called with arg `true` will return empty list.
    const dialogControl = {
      showDialog: jest.fn(),
    };
    (dialogControl.showDialog as jest.Mock).mockResolvedValue({
      type: 'confirm',
      args: '',
    });
    const projectFiles = {
      '1': {
        id: '1',
        name: 'project_file1.py',
        language: 'py',
        contents: 'This is project_file1.py',
        folderId: '0',
      },
    };
    const NewFileFunction = jest.fn();
    const SaveFileFunction = jest.fn();

    await openImportFromBackpackPrompt({
      dialogControl,
      backpackApi: mockBackpackApi,
      newFile: NewFileFunction,
      saveFile: SaveFileFunction,
      projectFiles,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(dialogControl.showDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GenericAlert',
        title: expect.any(String),
        message: expect.any(String),
      })
    );
  });

  it('should import a file when user confirms', async () => {
    const mockBackpackApi = getBackpackAPIMock(); // getFileList returns list ['test1.py', 'test2.py'].
    const dialogControl = {
      showDialog: jest.fn(),
    };
    const projectFiles = {
      '1': {
        id: '1',
        name: 'project_file1.py',
        language: 'py',
        contents: 'This is project_file1.py',
        folderId: '0',
      },
      '2': {
        id: '2',
        name: 'project_file2.py',
        language: 'py',
        contents: 'This is project_file2.py',
        folderId: '0',
      },
    };
    const NewFileFunction = jest.fn();
    const SaveFileFunction = jest.fn();
    // Mock extractUserInput to return 'test1.py'
    (extractUserInput as jest.Mock).mockReturnValue('test1.py');
    // Mock the dialog responses
    dialogControl.showDialog
      .mockResolvedValueOnce({type: 'confirm', value: ''}) // First dialog is a pending dialog.
      .mockResolvedValueOnce({type: 'confirm', value: 'test1.py'}); // Second dialog: user confirms import

    await openImportFromBackpackPrompt({
      dialogControl,
      backpackApi: mockBackpackApi,
      newFile: NewFileFunction,
      saveFile: SaveFileFunction,
      projectFiles,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(mockBackpackApi.fetchFile).toHaveBeenCalledWith(
      'test1.py',
      expect.any(Function),
      expect.any(Function)
    );
    expect(NewFileFunction).toHaveBeenCalledWith({
      contents: 'Mock contents of test1.py',
      fileName: 'test1.py',
    });
  });

  it('should rename imported file if duplicate exists and user selects to rename', async () => {
    const mockBackpackApi = getBackpackAPIMock(); // getFileList returns list ['test1.py', 'test2.py'].
    const projectFiles = {
      '1': {
        id: '1',
        name: 'test1.py',
        language: 'py',
        contents: 'This is test1.py',
        folderId: '0',
      },
      '3': {
        id: '3',
        name: 'test3.py',
        language: 'py',
        contents: 'This is test3.py',
        folderId: '0',
      },
    };
    const dialogControl = {
      showDialog: jest.fn(),
    };
    // Mock the dialog responses
    dialogControl.showDialog
      .mockResolvedValueOnce({}) // First dialog is a pending dialog.
      .mockResolvedValueOnce({type: 'confirm'}) // Second dialog: user confirms import
      .mockResolvedValueOnce({type: 'neutral'}); // Third dialog: user chooses to rename

    // Mock extractUserInput to return 'test1.py'
    (extractUserInput as jest.Mock).mockReturnValue('test1.py');

    const NewFileFunction = jest.fn();
    const SaveFileFunction = jest.fn();

    await openImportFromBackpackPrompt({
      dialogControl,
      backpackApi: mockBackpackApi,
      newFile: NewFileFunction,
      saveFile: SaveFileFunction,
      projectFiles,
    });
    // Ensure async calls complete before assertions
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(dialogControl.showDialog).toHaveBeenCalledTimes(3);
    expect(NewFileFunction).toHaveBeenCalledTimes(1);
    expect(SaveFileFunction).not.toHaveBeenCalled();
  });

  it('should replace existing project file with same name if user selects replace', async () => {
    const mockBackpackApi = getBackpackAPIMock(); // getFileList returns list ['test1.py', 'test2.py'].
    const projectFiles = {
      '1': {
        id: '1',
        name: 'test1.py',
        language: 'py',
        contents: 'This is test1.py',
        folderId: '0',
      },
      '3': {
        id: '3',
        name: 'test3.py',
        language: 'py',
        contents: 'This is test3.py',
        folderId: '0',
      },
    };
    const dialogControl = {
      showDialog: jest.fn(),
    };
    // Mock the dialog responses
    dialogControl.showDialog
      .mockResolvedValueOnce({}) // First dialog is a pending dialog.
      .mockResolvedValueOnce({type: 'confirm'}) // Second dialog: user confirms import
      .mockResolvedValueOnce({type: 'confirm'}); // Third dialog: user chooses to replace

    // Mock extractUserInput to return 'test1.py'
    (extractUserInput as jest.Mock).mockReturnValue('test1.py');

    const NewFileFunction = jest.fn();
    const SaveFileFunction = jest.fn();

    await openImportFromBackpackPrompt({
      dialogControl,
      backpackApi: mockBackpackApi,
      newFile: NewFileFunction,
      saveFile: SaveFileFunction,
      projectFiles,
    });
    // Ensure async calls complete before assertions
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(dialogControl.showDialog).toHaveBeenCalledTimes(3);
    expect(NewFileFunction).not.toHaveBeenCalled();
    expect(SaveFileFunction).toHaveBeenCalledTimes(1);
  });

  it('should delete the backpack file if user selects to delete', async () => {
    const mockBackpackApi = getBackpackAPIMock(); // getFileList returns list ['test1.py', 'test2.py'].
    const projectFiles = {
      '1': {
        id: '1',
        name: 'test1.py',
        language: 'py',
        contents: 'This is test1.py',
        folderId: '0',
      },
      '3': {
        id: '3',
        name: 'test3.py',
        language: 'py',
        contents: 'This is test3.py',
        folderId: '0',
      },
    };
    const dialogControl = {
      showDialog: jest.fn(),
    };
    // Mock the dialog responses
    dialogControl.showDialog
      .mockResolvedValueOnce({}) // First dialog is a pending dialog.
      .mockResolvedValueOnce({type: 'neutral'}) // Second dialog: user selects to delete backpack file.
      .mockResolvedValueOnce({type: 'confirm'}); // Third dialog: user confirms to delete.

    // Mock extractUserInput to return 'test1.py'
    (extractUserInput as jest.Mock).mockReturnValue('test1.py');

    const NewFileFunction = jest.fn();
    const SaveFileFunction = jest.fn();

    await openImportFromBackpackPrompt({
      dialogControl,
      backpackApi: mockBackpackApi,
      newFile: NewFileFunction,
      saveFile: SaveFileFunction,
      projectFiles,
    });
    // Ensure async calls complete before assertions
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(dialogControl.showDialog).toHaveBeenCalledTimes(3);
    expect(NewFileFunction).not.toHaveBeenCalled();
    expect(SaveFileFunction).not.toHaveBeenCalled();
    expect(mockBackpackApi.deleteFiles).toHaveBeenCalled();
  });
});
