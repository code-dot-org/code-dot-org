import {saveImageToBackpack} from '@cdo/apps/aichat/views/assets/saveImageToBackpack';
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
  let backpackApi: {getFileLists: jest.Mock; saveFileFromUrl: jest.Mock};

  const toastMessages = () => showToast.mock.calls.map(([message]) => message);

  const runSave = () =>
    saveImageToBackpack({
      backpackApi: backpackApi as unknown as UnifiedBackpackClientApi,
      url: IMAGE_URL,
      fileName: FILE_NAME,
      showToast,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    showToast = jest.fn();
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
