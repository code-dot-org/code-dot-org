const {initFishData} = require('@ml/utils/fishData');
import {setState, getState, resetState} from '@ml/demo/state';
import {ClassType, Modes} from '@ml/demo/constants';
import {init, predictFish} from '@ml/demo/models/predict';
import SimpleTrainer from '@ml/utils/SimpleTrainer';

describe('Model quality test', () => {
  beforeAll(() => {
    initFishData();
  });

  beforeEach(() => {
    resetState();
    setState({
      trainer: new SimpleTrainer()
    });
  });

  jest.useFakeTimers();

  test('init state without intermediate loading', () => {
    init();
    // There's a setTimeout in the predict init. Ideally this would be
    // refactored to use promises if possible but until then, wait 100 ms.
    setTimeout(async () => {
      const state = getState();
      expect(state).toBeTruthy();
      expect(state.mode).toBe(Modes.Predicting);
      expect(state.fishData).toBeTruthy();
      expect(state.fishData.length).toBeGreaterThan(0);
    }, 100);
  });

  test('fish gets prediction on predict', async () => {
    init();
    // There's a setTimeout in the predict init. Ideally this would be
    // refactored to use promises if possible but until then, wait 100 ms.
    setTimeout(async () => {
      const state = getState();
      await predictFish(state, 0);
      expect(state.trainer.predict).toBeCalled();
      expect(state.fishData[0].result).toBeInstanceOf(Number);
    }, 100);
  });
});
