import {openSaveToBackpackPrompt} from '@cdo/apps/codebridge/FileBrowser/prompts/openSaveToBackpackPrompt';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {DialogControlInterface, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

import {
  getDialogConfirmationMock,
  getBackpackAPIMock,
  getUnifiedBackpackAPIMock,
} from '../../test_utils';

describe('openSaveToBackpackPrompt', () => {
  let dialogMock: Pick<DialogControlInterface, 'showDialog'>,
    projectFile: ProjectFile,
    analyticsMock: jest.Mock;

  beforeEach(() => {
    dialogMock = getDialogConfirmationMock('confirm');
    analyticsMock = jest.fn();
    projectFile = {
      name: 'project_file.py',
      contents: 'This is project_file.py.',
    } as ProjectFile;
  });

  const runSaveToBackpackPrompt = (
    backpackApi: BackpackClientApi | UnifiedBackpackClientApi
  ) =>
    openSaveToBackpackPrompt({
      dialogControl: dialogMock,
      backpackApi,
      file: projectFile,
      sendLab2AnalyticsEvent: analyticsMock,
    });

  describe('with a per-lab backpack api', () => {
    let mockBackpackApi: BackpackClientApi;

    beforeEach(() => {
      mockBackpackApi = getBackpackAPIMock(); // getFileList returns empty list.
    });

    it('should save a file to the backpack', async () => {
      await runSaveToBackpackPrompt(mockBackpackApi);

      expect(mockBackpackApi.getFileList).toHaveBeenCalled();
      expect(mockBackpackApi.saveFile).toHaveBeenCalledWith(
        'project_file.py',
        'This is project_file.py.',
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should not save a file when canceled', async () => {
      dialogMock = getDialogConfirmationMock('cancel');

      await runSaveToBackpackPrompt(mockBackpackApi);

      expect(mockBackpackApi.getFileList).toHaveBeenCalled();
      expect(mockBackpackApi.saveFile).not.toHaveBeenCalled();
    });

    it('should rename file when duplicate exists and rename (neutral) is selected', async () => {
      mockBackpackApi = getBackpackAPIMock(['project_file.py']); // getFileList returns ['project_file.py'].
      dialogMock = getDialogConfirmationMock('neutral');

      await runSaveToBackpackPrompt(mockBackpackApi);

      expect(mockBackpackApi.getFileList).toHaveBeenCalled();
      expect(mockBackpackApi.saveFile).toHaveBeenCalledWith(
        'project_file_1.py',
        'This is project_file.py.',
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should replace file when duplicate exists and replace (confirm) is selected', async () => {
      mockBackpackApi = getBackpackAPIMock(['project_file.py']);

      await runSaveToBackpackPrompt(mockBackpackApi);

      expect(mockBackpackApi.getFileList).toHaveBeenCalled();
      expect(mockBackpackApi.saveFile).toHaveBeenCalledWith(
        'project_file.py',
        'This is project_file.py.',
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should not delete anything, since the per-lab api replaces in place', async () => {
      mockBackpackApi = getBackpackAPIMock(['project_file.py']);

      await runSaveToBackpackPrompt(mockBackpackApi);

      expect(mockBackpackApi.deleteFiles).not.toHaveBeenCalled();
    });
  });

  describe('with the unified backpack api', () => {
    it('should save a new file to the universal backpack', async () => {
      const mockApi = getUnifiedBackpackAPIMock({
        universal: ['other.py'],
        javalab: ['Other.java'],
      });

      await runSaveToBackpackPrompt(mockApi);

      expect(mockApi.getFileLists).toHaveBeenCalled();
      expect(mockApi.deleteFromLegacyBackpacks).not.toHaveBeenCalled();
      expect(mockApi.saveFile).toHaveBeenCalledWith(
        'project_file.py',
        'This is project_file.py.',
        expect.any(Function),
        expect.any(Function)
      );
      expect(analyticsMock).toHaveBeenCalledWith(EVENTS.SAVE_TO_BACKPACK_NEW, {
        fileType: 'py',
      });
    });

    it('should clear the legacy backpacks of the name after saving', async () => {
      const fileLists = {
        universal: [],
        javalab: ['project_file.py'],
      };
      const mockApi = getUnifiedBackpackAPIMock(fileLists);

      await runSaveToBackpackPrompt(mockApi);

      expect(mockApi.deleteFromLegacyBackpacks).toHaveBeenCalledWith(
        'project_file.py',
        fileLists
      );
      expect(mockApi.saveFile).toHaveBeenCalledWith(
        'project_file.py',
        'This is project_file.py.',
        expect.any(Function),
        expect.any(Function)
      );
      const saveOrder = (mockApi.saveFile as jest.Mock).mock
        .invocationCallOrder[0];
      const deleteOrder = (mockApi.deleteFromLegacyBackpacks as jest.Mock).mock
        .invocationCallOrder[0];
      expect(saveOrder).toBeLessThan(deleteOrder);
    });

    it('should treat a name taken only in another backpack as a duplicate', async () => {
      const mockApi = getUnifiedBackpackAPIMock({
        universal: [],
        javalab: ['project_file.py'],
      });

      await runSaveToBackpackPrompt(mockApi);

      expect(analyticsMock).toHaveBeenCalledWith(
        EVENTS.SAVE_TO_BACKPACK_REPLACE,
        {fileType: 'py'}
      );
    });

    it('should suggest a rename that is unique across every backpack', async () => {
      dialogMock = getDialogConfirmationMock('neutral');
      const mockApi = getUnifiedBackpackAPIMock({
        universal: ['project_file.py'],
        javalab: ['project_file_1.py'],
      });

      await runSaveToBackpackPrompt(mockApi);

      expect(mockApi.deleteFromLegacyBackpacks).not.toHaveBeenCalled();
      expect(mockApi.saveFile).toHaveBeenCalledWith(
        'project_file_2.py',
        'This is project_file.py.',
        expect.any(Function),
        expect.any(Function)
      );
      expect(analyticsMock).toHaveBeenCalledWith(
        EVENTS.SAVE_TO_BACKPACK_RENAME,
        {fileType: 'py'}
      );
    });

    it('should keep the save and alert when clearing the legacy backpacks fails', async () => {
      const mockApi = getUnifiedBackpackAPIMock({
        universal: [],
        javalab: ['project_file.py'],
      });
      (mockApi.deleteFromLegacyBackpacks as jest.Mock).mockRejectedValue(
        new Error('delete boom')
      );

      await runSaveToBackpackPrompt(mockApi);

      expect(mockApi.saveFile).toHaveBeenCalledWith(
        'project_file.py',
        'This is project_file.py.',
        expect.any(Function),
        expect.any(Function)
      );
      expect(analyticsMock).toHaveBeenCalledWith(
        EVENTS.SAVE_TO_BACKPACK_REPLACE,
        {fileType: 'py'}
      );
      expect(dialogMock.showDialog).toHaveBeenCalledWith(
        expect.objectContaining({type: DialogType.GenericAlert})
      );
    });

    it('should not clear the legacy backpacks when the save fails', async () => {
      const mockApi = getUnifiedBackpackAPIMock({
        universal: [],
        javalab: ['project_file.py'],
      });
      (mockApi.saveFile as jest.Mock).mockImplementation(
        async (filename, contents, onError) => onError(new Error('save boom'))
      );

      await runSaveToBackpackPrompt(mockApi);

      expect(mockApi.deleteFromLegacyBackpacks).not.toHaveBeenCalled();
      expect(analyticsMock).not.toHaveBeenCalled();
      expect(dialogMock.showDialog).toHaveBeenCalledWith(
        expect.objectContaining({type: DialogType.GenericAlert})
      );
    });

    it('should alert and not save when the file lists cannot be fetched', async () => {
      const mockApi = getUnifiedBackpackAPIMock();
      (mockApi.getFileLists as jest.Mock).mockRejectedValue(
        new Error('list boom')
      );

      await runSaveToBackpackPrompt(mockApi);

      expect(mockApi.saveFile).not.toHaveBeenCalled();
      expect(dialogMock.showDialog).toHaveBeenCalledTimes(1);
      expect(dialogMock.showDialog).toHaveBeenCalledWith(
        expect.objectContaining({type: DialogType.GenericAlert})
      );
    });

    it('should not save or delete when canceled', async () => {
      dialogMock = getDialogConfirmationMock('cancel');
      const mockApi = getUnifiedBackpackAPIMock({
        javalab: ['project_file.py'],
      });

      await runSaveToBackpackPrompt(mockApi);

      expect(mockApi.deleteFromLegacyBackpacks).not.toHaveBeenCalled();
      expect(mockApi.saveFile).not.toHaveBeenCalled();
    });

    it('should save a file with a url from its url, then clear the legacy backpacks', async () => {
      projectFile = {
        name: 'project_file.py',
        contents: '',
        url: '/v3/assets/channel/project_file.py',
      } as ProjectFile;
      const fileLists = {javalab: ['project_file.py']};
      const mockApi = getUnifiedBackpackAPIMock(fileLists);

      await runSaveToBackpackPrompt(mockApi);

      expect(mockApi.deleteFromLegacyBackpacks).toHaveBeenCalledWith(
        'project_file.py',
        fileLists
      );
      expect(mockApi.saveFileFromUrl).toHaveBeenCalledWith(
        'project_file.py',
        '/v3/assets/channel/project_file.py',
        expect.any(Function),
        expect.any(Function)
      );
      expect(mockApi.saveFile).not.toHaveBeenCalled();
    });
  });
});
