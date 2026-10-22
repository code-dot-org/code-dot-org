import {
  activeCallout,
  calloutHolds,
  LevelCallout,
} from '@cdo/apps/p5lab/spritelab/lab2/callouts';

const state = {
  done: new Set([0]),
  tab: 'World' as const,
  scenesSeen: new Set(['platform-scene']),
};

describe('callouts', () => {
  it('holds while the done, not-done, tab and scene conditions all hold', () => {
    const toCode: LevelCallout = {
      target: 'code-tab',
      when: {done: [0], notDone: [1], tabNot: 'Code'},
    };
    expect(calloutHolds(toCode, state)).toBe(true);
    expect(calloutHolds(toCode, {...state, done: new Set([0, 1])})).toBe(false);
    expect(calloutHolds(toCode, {...state, done: new Set()})).toBe(false);
    expect(calloutHolds(toCode, {...state, tab: 'Code'})).toBe(false);
    const toScenes: LevelCallout = {
      target: 'scene-dropdown',
      direction: 'down',
      when: {sceneNever: 'story-scene'},
    };
    expect(calloutHolds(toScenes, state)).toBe(true);
    expect(
      calloutHolds(toScenes, {...state, scenesSeen: new Set(['story-scene'])})
    ).toBe(false);
  });

  it('shows the first callout whose condition holds, and one with no condition always', () => {
    const always: LevelCallout = {target: 'scene-dropdown'};
    const later: LevelCallout = {target: 'code-tab', when: {done: [5]}};
    expect(activeCallout([later, always], state)).toBe(always);
    expect(activeCallout([later], state)).toBeUndefined();
    expect(activeCallout(undefined, state)).toBeUndefined();
  });
});
