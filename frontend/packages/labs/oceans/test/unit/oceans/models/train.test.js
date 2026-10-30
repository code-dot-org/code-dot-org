import {describe, it, expect, beforeEach, vi} from 'vitest';

import {AppMode, ClassType} from '../../../../src/oceans/constants';
import {resetState, setState, getState} from '../../../../src/oceans/state';
import {initFishData} from '../../../../src/utils/fishData';

vi.mock('../../../../src/oceans/models/soundLibrary', () => ({
  default: {playSound: vi.fn(), loadSounds: vi.fn(), injectSoundAPIs: vi.fn()},
}));

describe('train model — onClassifyFish', () => {
  let mockTrainer;

  beforeEach(async () => {
    resetState();
    initFishData();
    mockTrainer = {
      addTrainingExample: vi.fn(),
      train: vi.fn(),
      clearAll: vi.fn(),
      predict: vi.fn().mockResolvedValue({predictedClassId: ClassType.Like}),
    };
    setState({
      appMode: AppMode.FishVTrash,
      trainer: mockTrainer,
      trainingIndex: 0,
      yesCount: 0,
      noCount: 0,
      loadTrashImages: true,
    });
    // generateOcean will be called by onClassifyFish when the training index
    // nears the end of the fish array — ensure a non-empty fish list is ready.
    const {generateOcean} = await import('../../../../src/utils/generateOcean');
    setState({fishData: generateOcean(20, 0, true, false, false)});
  });

  it('calls addTrainingExample with ClassType.Like on yes', async () => {
    const {default: train} = await import(
      '../../../../src/oceans/models/train'
    );
    train.onClassifyFish(true);
    expect(mockTrainer.addTrainingExample).toHaveBeenCalledWith(
      expect.anything(),
      ClassType.Like,
    );
  });

  it('calls addTrainingExample with ClassType.Dislike on no', async () => {
    const {default: train} = await import(
      '../../../../src/oceans/models/train'
    );
    train.onClassifyFish(false);
    expect(mockTrainer.addTrainingExample).toHaveBeenCalledWith(
      expect.anything(),
      ClassType.Dislike,
    );
  });

  it('increments yesCount on yes', async () => {
    const {default: train} = await import(
      '../../../../src/oceans/models/train'
    );
    train.onClassifyFish(true);
    expect(getState().yesCount).toBe(1);
  });

  it('increments noCount on no', async () => {
    const {default: train} = await import(
      '../../../../src/oceans/models/train'
    );
    train.onClassifyFish(false);
    expect(getState().noCount).toBe(1);
  });
});
