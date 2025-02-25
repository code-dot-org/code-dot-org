import {openImportFromBackpackPrompt} from '@cdo/apps/codebridge/FileBrowser/prompts/openImportFromBackpackPrompt';

import {smallProject} from '../../test-files';
import {
  getDialogAlertMock,
  getBackpackAPIMock,
  getNewFileMock,
  getSaveFileMock,
} from '../../test_utils';

describe('openImportFromBackpackPrompt', () => {
  it('should show an alert when there are no files in the backpack', async () => {
    const mockBackpackApi = getBackpackAPIMock(true); // getFileList will return empty list.
    const dialogMock = getDialogAlertMock('confirm');
    const projectFiles = smallProject['files'];
    const SaveFileFunction = getSaveFileMock()[1];
    const NewFileFunction = getNewFileMock()[1];

    await openImportFromBackpackPrompt({
      dialogControl: dialogMock,
      backpackApi: mockBackpackApi,
      newFile: NewFileFunction,
      saveFile: SaveFileFunction,
      projectFiles,
    });

    expect(mockBackpackApi.getFileList).toHaveBeenCalled();
    expect(dialogMock.showDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GenericAlert',
        title: expect.any(String),
        message: expect.any(String),
      })
    );
    expect(dialogMock.showDialog).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GenericConfirmation',
        title: expect.any(String),
        message: expect.any(String),
      })
    );
  });
});
