import {describe, it, expect, beforeEach} from 'vitest';

import {Modes} from '../../../src/oceans/constants';
import {
  $time,
  backgroundPathForMode,
  clamp,
  currentRunTime,
  filterFishComponents,
  finishMovement,
  generateColorPalette,
  randomInt,
} from '../../../src/oceans/helpers';
import {getState, resetState, setState} from '../../../src/oceans/state';

beforeEach(() => {
  resetState();
});

describe('$time', () => {
  it('returns a positive integer', () => {
    expect($time()).toBeGreaterThan(0);
  });
});

describe('randomInt', () => {
  it('returns a value within [min, max]', () => {
    for (let i = 0; i < 50; i++) {
      const v = randomInt(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });

  it('can return min and max', () => {
    const values = new Set(Array.from({length: 200}, () => randomInt(0, 1)));
    expect(values.has(0)).toBe(true);
    expect(values.has(1)).toBe(true);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('backgroundPathForMode', () => {
  it('returns a string URL for training mode', () => {
    const path = backgroundPathForMode(Modes.Training);
    expect(typeof path).toBe('string');
    expect(path).not.toBeNull();
  });

  it('returns a string URL for pond mode', () => {
    const path = backgroundPathForMode(Modes.Pond);
    expect(typeof path).toBe('string');
    expect(path).not.toBeNull();
  });

  it('returns null for loading mode', () => {
    expect(backgroundPathForMode(Modes.Loading)).toBeNull();
  });
});

describe('filterFishComponents', () => {
  const components = {
    bodies: {
      a: {knnData: [1]},
      b: {knnData: [2], exclusions: ['short']},
      c: {knnData: [3], exclusions: ['long']},
    },
  };

  it('removes excluded entries for the given appMode', () => {
    const result = filterFishComponents(components, 'short');
    expect(result.bodies).toHaveLength(2);
    expect(result.bodies.find(e => e === components.bodies.b)).toBeUndefined();
  });

  it('keeps all entries when appMode is null', () => {
    const result = filterFishComponents(components, null);
    expect(Object.keys(result.bodies)).toHaveLength(3);
  });
});

describe('generateColorPalette', () => {
  const colors = [
    {rgb: [255, 0, 0], knnData: [1, 0, 0], fieldInfos: ['r']},
    {rgb: [0, 255, 0], knnData: [0, 1, 0], fieldInfos: ['g']},
    {rgb: [0, 0, 255], knnData: [0, 0, 1], fieldInfos: ['b']},
  ];

  it('returns bodyRgb and finRgb', () => {
    const palette = generateColorPalette(colors);
    expect(palette.bodyRgb).toHaveLength(3);
    expect(palette.finRgb).toHaveLength(3);
  });

  it('body and fin colors are different', () => {
    const palette = generateColorPalette(colors);
    expect(palette.bodyRgb).not.toEqual(palette.finRgb);
  });

  it('uses bodyIndex when provided', () => {
    const palette = generateColorPalette(colors, 0);
    expect(palette.bodyRgb).toEqual([255, 0, 0]);
  });

  it('merges knnData and fieldInfos from both colors', () => {
    const palette = generateColorPalette(colors, 0);
    expect(palette.knnData).toHaveLength(6);
    expect(palette.fieldInfos).toHaveLength(2);
  });
});

describe('currentRunTime', () => {
  it('returns 0 when not running', () => {
    const state = getState();
    expect(currentRunTime(state)).toBe(0);
  });

  it('returns elapsed time when running', () => {
    const now = $time();
    setState({isRunning: true, lastStartTime: now - 100});
    const state = getState();
    expect(currentRunTime(state)).toBeGreaterThanOrEqual(100);
  });

  it('clamps to moveTime when clampTime is true', () => {
    const now = $time();
    setState({isRunning: true, lastStartTime: now - 9999, moveTime: 500});
    const state = getState();
    expect(currentRunTime(state, true)).toBe(500);
  });
});

describe('finishMovement', () => {
  it('stops running and records lastPauseTime', () => {
    setState({isRunning: true});
    finishMovement(1234);
    const state = getState();
    expect(state.isRunning).toBe(false);
    expect(state.lastPauseTime).toBe(1234);
    expect(state.isPaused).toBe(true);
  });

  it('does not mark paused when pause=false', () => {
    setState({isRunning: true});
    finishMovement(0, false);
    expect(getState().isPaused).toBe(false);
  });
});
