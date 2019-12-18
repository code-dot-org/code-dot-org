const {initFishData} = require('@ml/utils/fishData');
import {setState, getState, resetState} from '@ml/oceans/state';
import {ClassType, Modes} from '@ml/oceans/constants';
import train from '@ml/oceans/models/train.js';

describe('Model quality test', () => {
  beforeAll(() => {
    // TODO think about removing this assumption
    initFishData();
  });

  beforeEach(() => {
    resetState();
    setState({
      mode: Modes.Training
    });
  });

  test('init state', () => {
    train.init();
    const state = getState();
    expect(state).toBeTruthy();
    expect(state.trainer).toBeTruthy();
    expect(state.fishData).toBeTruthy();
    expect(state.fishData.length).toBeGreaterThan(0);
  });

  test('state changes on classify', () => {
    train.init();
    // Set isRunning to false to simulate animation ending
    setState({isRunning: false});
    const previousState = getState();
    expect(train.onClassifyFish(true)).toBe(true);
    const newState = getState();
    expect(newState.trainingIndex).toBe(previousState.trainingIndex + 1);
    expect(newState.yesCount).toBe(previousState.yesCount + 1);
  });
});
