import {describe, it, expect, beforeEach, vi} from 'vitest';

import {AppMode} from '../../../../src/oceans/constants';
import {resetState, setState} from '../../../../src/oceans/state';
import {initFishData} from '../../../../src/utils/fishData';

vi.mock('../../../../src/oceans/models/soundLibrary', () => ({
  default: {playSound: vi.fn(), loadSounds: vi.fn(), injectSoundAPIs: vi.fn()},
}));

describe('predict model', () => {
  beforeEach(() => {
    resetState();
    initFishData();
    setState({appMode: AppMode.FishVTrash, loadTrashImages: true});
  });

  it('init resolves without throwing for FishVTrash mode', async () => {
    const mockTrainer = {
      train: vi.fn(),
      predict: vi
        .fn()
        .mockResolvedValue({predictedClassId: 0, confidencesByClassId: {}}),
      clearAll: vi.fn(),
    };
    setState({trainer: mockTrainer});

    const {init} = await import('../../../../src/oceans/models/predict');
    await expect(init()).resolves.not.toThrow();
    expect(mockTrainer.train).toHaveBeenCalledOnce();
  });
});
