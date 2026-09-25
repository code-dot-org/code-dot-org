import {saveImageToBackpack} from '@cdo/apps/aichat/views/assets/saveImageToBackpack';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import type UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

const mockMetricsReporter = {logError: jest.fn()};

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getMetricsReporter: () => mockMetricsReporter}),
  },
}));

const IMAGE_URL = '/v3/assets/channel-id/image.png';
const FILE_NAME = 'May-6-0930am.png';

// Stand-in for saveFileFromUrl, which reports through callbacks and returns a promise.
const saveFileFromUrlMock = (succeeds: boolean) =>
  jest.fn(
    async (
      filename: string,
      url: string,
      onError?: (error?: Error) => void,
      onSuccess?: () => void
    ) => (succeeds ? onSuccess?.() : onError?.(new Error('upload failed')))
  );

describe('saveImageToBackpack', () => {
  let showToast: jest.Mock;
  let onLegacyError: jest.Mock;

  const toastMessages = () => showToast.mock.calls.map(([message]) => message);

  beforeEach(() => {
    jest.clearAllMocks();
    showToast = jest.fn();
    onLegacyError = jest.fn();
  });

  describe('legacy backpack', () => {
    let backpackApi: {getFileList: jest.Mock; saveFileFromUrl: jest.Mock};

    const runSave = () =>
      saveImageToBackpack({
        backpackApi: backpackApi as unknown as BackpackClientApi,
        url: IMAGE_URL,
        fileName: FILE_NAME,
        showToast,
        onLegacyError,
      });

    beforeEach(() => {
      backpackApi = {
        getFileList: jest.fn().mockResolvedValue([]),
        saveFileFromUrl: saveFileFromUrlMock(true),
      };
    });

    it('saves under the given name and shows no toasts', async () => {
      await runSave();

      expect(backpackApi.saveFileFromUrl).toHaveBeenCalledWith(
        FILE_NAME,
        IMAGE_URL,
        expect.any(Function),
        expect.any(Function)
      );
      expect(showToast).not.toHaveBeenCalled();
      expect(onLegacyError).not.toHaveBeenCalled();
    });

    it('renames around a name the backpack already holds', async () => {
      backpackApi.getFileList.mockResolvedValue([FILE_NAME]);

      await runSave();

      expect(backpackApi.saveFileFromUrl).toHaveBeenCalledWith(
        'May-6-0930am-1.png',
        IMAGE_URL,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('reports a failed save in the chat rather than a toast', async () => {
      backpackApi.saveFileFromUrl = saveFileFromUrlMock(false);

      await runSave();

      expect(onLegacyError).toHaveBeenCalled();
      expect(showToast).not.toHaveBeenCalled();
      expect(mockMetricsReporter.logError).toHaveBeenCalledWith(
        'Save to backpack error',
        expect.any(Error)
      );
    });

    it('reports a failed file list and does not save', async () => {
      backpackApi.getFileList.mockRejectedValue(new Error('list failed'));

      await runSave();

      expect(onLegacyError).toHaveBeenCalled();
      expect(backpackApi.saveFileFromUrl).not.toHaveBeenCalled();
    });
  });

  describe('unified backpack', () => {
    let backpackApi: {getFileLists: jest.Mock; saveFileFromUrl: jest.Mock};

    const runSave = () =>
      saveImageToBackpack({
        backpackApi: backpackApi as unknown as UnifiedBackpackClientApi,
        url: IMAGE_URL,
        fileName: FILE_NAME,
        showToast,
        onLegacyError,
      });

    beforeEach(() => {
      backpackApi = {
        getFileLists: jest.fn().mockResolvedValue({}),
        saveFileFromUrl: saveFileFromUrlMock(true),
      };
    });

    it('saves and reports progress with toasts', async () => {
      await runSave();

      expect(backpackApi.saveFileFromUrl).toHaveBeenCalledWith(
        FILE_NAME,
        IMAGE_URL,
        expect.any(Function),
        expect.any(Function)
      );
      expect(toastMessages()).toEqual([
        `Saving ${FILE_NAME} to your Backpack...`,
        `${FILE_NAME} saved to your Backpack.`,
      ]);
      expect(onLegacyError).not.toHaveBeenCalled();
    });

    it('renames around a name held by any of the backpacks', async () => {
      backpackApi.getFileLists.mockResolvedValue({
        universal: ['other.png'],
        sketchlab: [FILE_NAME],
      });

      await runSave();

      expect(backpackApi.saveFileFromUrl).toHaveBeenCalledWith(
        'May-6-0930am-1.png',
        IMAGE_URL,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('replaces the progress toast when the save fails', async () => {
      backpackApi.saveFileFromUrl = saveFileFromUrlMock(false);

      await runSave();

      expect(toastMessages()).toEqual([
        `Saving ${FILE_NAME} to your Backpack...`,
        `Couldn't save ${FILE_NAME} to your Backpack. Please try again.`,
      ]);
      expect(showToast).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({type: 'danger'})
      );
      expect(onLegacyError).not.toHaveBeenCalled();
    });

    it('reports a failed file list before any progress toast', async () => {
      backpackApi.getFileLists.mockRejectedValue(new Error('list failed'));

      await runSave();

      expect(toastMessages()).toEqual([
        `Couldn't save ${FILE_NAME} to your Backpack. Please try again.`,
      ]);
      expect(backpackApi.saveFileFromUrl).not.toHaveBeenCalled();
      expect(mockMetricsReporter.logError).toHaveBeenCalledWith(
        'Backpack file list fetch error',
        expect.any(Error)
      );
    });
  });
});
