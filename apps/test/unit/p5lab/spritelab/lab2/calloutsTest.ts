import {
  activeCallout,
  calloutHolds,
  calloutSelector,
  LevelCallout,
} from '@cdo/apps/p5lab/spritelab/lab2/callouts';

const state = {done: new Set([0]), tab: 'Images' as const};

describe('callouts', () => {
  it('holds while the done, not-done and tab conditions all hold', () => {
    const toCode: LevelCallout = {
      target: 'code-tab',
      when: {done: [0], notDone: [1], tabNot: 'Code'},
    };
    expect(calloutHolds(toCode, state)).toBe(true);
    expect(calloutHolds(toCode, {...state, done: new Set([0, 1])})).toBe(false);
    expect(calloutHolds(toCode, {...state, done: new Set()})).toBe(false);
    expect(calloutHolds(toCode, {...state, tab: 'Code'})).toBe(false);
    expect(calloutHolds({target: 'world-tab'}, state)).toBe(true);
  });

  it('holds while the editor is not on the named scene', () => {
    const toScene: LevelCallout = {
      target: 'scene-menu',
      when: {sceneNot: 'second-scene'},
    };
    expect(calloutHolds(toScene, state)).toBe(true);
    expect(calloutHolds(toScene, {...state, scene: 'scene-1'})).toBe(true);
    expect(calloutHolds(toScene, {...state, scene: 'second-scene'})).toBe(
      false
    );
  });

  it('shows the first callout that holds', () => {
    const callouts: LevelCallout[] = [
      {target: 'code-tab', when: {done: [1]}},
      {target: 'world-tab', when: {done: [0]}},
    ];
    expect(activeCallout(callouts, state)?.target).toBe('world-tab');
    expect(
      activeCallout(callouts, {...state, done: new Set()})
    ).toBeUndefined();
    expect(activeCallout(undefined, state)).toBeUndefined();
  });

  it('names the switch button for each tab', () => {
    expect(calloutSelector({target: 'code-tab'})).toBe('#editor-switch-code');
    expect(calloutSelector({target: 'world-tab'})).toBe('#editor-switch-world');
    expect(calloutSelector({target: 'images-tab'})).toBe(
      '#editor-switch-images'
    );
  });

  it('names the scene menu button and a scene entry in the open menu', () => {
    expect(calloutSelector({target: 'scene-menu'})).toBe(
      '#scene-dropdown-dropdown-button'
    );
    expect(
      calloutSelector({target: 'scene-option', scene: 'second-scene'})
    ).toBe('#scene-option-second-scene');
  });

  it('warns of a scene entry callout that names no scene', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    calloutSelector({target: 'scene-option'});
    expect(warn).toHaveBeenCalledWith('scene-option callout names no scene');
    warn.mockRestore();
  });
});
