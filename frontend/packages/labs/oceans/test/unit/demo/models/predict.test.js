const {initFishData} = require('@ml/utils/fishData');
import {setState, getState, resetState} from '@ml/demo/state';
import {ClassType, Modes, AppMode} from '@ml/demo/constants';
import {init, predictFish} from '@ml/demo/models/predict';
import SimpleTrainer from '@ml/utils/SimpleTrainer';
import {TrashOceanObject} from '@ml/demo/OceanObject';

global.window = {};

describe('Predict test', () => {
  beforeAll(() => {
    initFishData();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
  });

  beforeEach(() => {
    const trainer = new SimpleTrainer();
    trainer.predict = jest.fn(async example => {
      if (example instanceof TrashOceanObject) {
        return {predictedClassId: 1, confidenceByClassId: {0: 0, 1: 1}};
      } else {
        return {predictedClassId: 0, confidenceByClassId: {0: 1, 1: 0}};
      }
    });

    resetState();
    setState({
      trainer
    });
  });

  test('init state without intermediate loading', () => {
    return init().then(() => {
      const state = getState();
      expect(state).toBeTruthy();
      expect(state.currentMode).toBe(Modes.Predicting);
      expect(state.fishData).toBeTruthy();
      expect(state.fishData.length).toBeGreaterThan(0);
    });
  });

  test('init state to intermediate loading', async () => {
    setState({appMode: AppMode.FishShort});
    init();

    const state = getState();
    expect(state).toBeTruthy();
    expect(state.currentMode).toBe(Modes.IntermediateLoading);
  });

  it('fish gets prediction on predict', async () => {
    setState({appMode: AppMode.FishVTrash});
    let state = getState();
    return init().then(() => {
      state = getState();
      return predictFish(state, 0).then(() => {
        expect(
          state.fishData[0].result.predictedClassId
        ).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
