import {saveTreeImageToBackpack} from '@cdo/apps/ailab/lab2/saveTreeImageToBackpack';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {BACKPACK_READ_ERROR} from '@cdo/apps/sharedComponents/backpack/backpackToasts';
import type UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

const mockMetricsReporter = {logError: jest.fn()};

jest.mock('@cdo/apps/lab2/utils', () => ({sendLab2AnalyticsEvent: jest.fn()}));
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getMetricsReporter: () => mockMetricsReporter}),
  },
}));

type SaveOutcome = 'success' | 'error' | 'reject';

const saveBlobFileMock = (outcome: SaveOutcome) =>
  jest.fn(
    async (
      fileName: string,
      image: Blob,
      onError: (error?: Error) => void,
      onSuccess: () => void
    ) => {
      if (outcome === 'reject') {
        throw new Error('network down');
      }
      return outcome === 'success'
        ? onSuccess()
        : onError(new Error('upload failed'));
    }
  );

describe('saveTreeImageToBackpack', () => {
  const image = new Blob(['png'], {type: 'image/png'});
  let notify: jest.Mock;
  let backpackApi: {getFileLists: jest.Mock; saveBlobFile: jest.Mock};

  const save = () =>
    saveTreeImageToBackpack(
      backpackApi as unknown as UnifiedBackpackClientApi,
      notify,
      image,
      'zoo-tree'
    );

  beforeEach(() => {
    notify = jest.fn();
    backpackApi = {
      getFileLists: jest.fn().mockResolvedValue({
        universal: ['zoo-tree.png'],
        sketchlab: ['zoo-tree_1.png'],
      }),
      saveBlobFile: saveBlobFileMock('success'),
    };
  });

  it('saves under a name no backpack holds yet', async () => {
    await save();

    expect(backpackApi.saveBlobFile).toHaveBeenCalledWith(
      'zoo-tree_2.png',
      image,
      expect.any(Function),
      expect.any(Function)
    );
    expect(notify.mock.calls).toEqual([
      ['gray', 'Saving zoo-tree_2.png to your Backpack...'],
      ['success', 'zoo-tree_2.png saved to your Backpack.'],
    ]);
    expect(sendLab2AnalyticsEvent).toHaveBeenCalledWith(
      EVENTS.SAVE_TO_BACKPACK_NEW,
      {fileType: 'png'}
    );
  });

  it('keeps both trees when a second save starts before the first lands', async () => {
    const saved = ['zoo-tree.png'];
    backpackApi.getFileLists = jest.fn(async () => ({universal: [...saved]}));
    backpackApi.saveBlobFile = jest.fn(
      async (fileName: string, image: Blob, onError, onSuccess: () => void) => {
        saved.push(fileName);
        onSuccess();
      }
    );

    await Promise.all([save(), save()]);

    expect(saved).toEqual(['zoo-tree.png', 'zoo-tree_1.png', 'zoo-tree_2.png']);
  });

  it('saves nothing when it cannot read the Backpack', async () => {
    backpackApi.getFileLists.mockRejectedValue(new Error('offline'));

    await save();

    expect(backpackApi.saveBlobFile).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith('danger', BACKPACK_READ_ERROR);
    expect(mockMetricsReporter.logError).toHaveBeenCalled();
  });

  it.each<SaveOutcome>(['error', 'reject'])(
    'replaces the progress toast and logs when the save fails (%s)',
    async outcome => {
      backpackApi.saveBlobFile = saveBlobFileMock(outcome);

      await save();

      expect(notify).toHaveBeenLastCalledWith(
        'danger',
        "Couldn't save zoo-tree_2.png to your Backpack. Please try again."
      );
      expect(mockMetricsReporter.logError).toHaveBeenCalledWith(
        'Save to backpack error',
        expect.any(Error)
      );
      expect(sendLab2AnalyticsEvent).not.toHaveBeenCalled();
    }
  );
});
