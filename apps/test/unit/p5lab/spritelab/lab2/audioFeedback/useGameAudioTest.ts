import {act, renderHook} from '@testing-library/react-hooks';

import {PlayerObserver} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/playerObserver';
import useGameAudio from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/useGameAudio';

import {FakeVoice, installFakeAudioContext} from './fakeAudioContext';

const CUES = 'spritelab2NavigationSounds';

interface Engine {
  observer: PlayerObserver | null;
  setPlayerObserver(observer: PlayerObserver | null): void;
}

function setup({playing = true, hasPlatformScene = true} = {}) {
  const engine: Engine = {
    observer: null,
    setPlayerObserver(observer) {
      this.observer = observer;
    },
  };
  const view = renderHook(
    ({play}: {play: boolean}) =>
      useGameAudio({current: engine}, {hasPlatformScene, playing: play}),
    {initialProps: {play: playing}}
  );
  const setting = () => view.result.current.settings[0];
  return {engine, view, setting};
}

/** Counts contexts built through `new AudioContext()`. */
function countContexts() {
  const w = window as unknown as {AudioContext: () => unknown};
  const build = w.AudioContext;
  const count = {built: 0};
  w.AudioContext = function () {
    count.built++;
    return build();
  };
  return count;
}

describe('SpriteLab2 useGameAudio', () => {
  let voices: FakeVoice[];
  beforeEach(() => {
    localStorage.clear();
    ({voices} = installFakeAudioContext());
  });

  it('offers one setting, off until chosen', () => {
    const {setting, view} = setup();
    expect(view.result.current.settings).toHaveLength(1);
    expect(setting().label).toBe('Navigation sounds');
    expect(setting().selectedValue).toBe('off');
  });

  it('takes a remembered choice over the default', () => {
    localStorage.setItem(CUES, 'on');
    expect(setup().setting().selectedValue).toBe('on');
  });

  it('remembers a change', () => {
    const {setting} = setup();
    act(() => setting().onChange('on'));
    expect(localStorage.getItem(CUES)).toBe('on');
    expect(setting().selectedValue).toBe('on');
  });

  it('wires the engine only while the game is played with cues on', () => {
    localStorage.setItem(CUES, 'on');
    const {engine, view} = setup({playing: false});
    expect(engine.observer).toBeNull();
    view.rerender({play: true});
    expect(engine.observer?.listeners.onSound).toBeDefined();
    expect(engine.observer?.listeners.onHeight).toBeDefined();
    expect(engine.observer?.listeners.onProximity).toBeDefined();
  });

  it('plays a step and a bump alike once on', () => {
    localStorage.setItem(CUES, 'on');
    const {engine} = setup();
    const held = voices.length;
    const onSound = engine.observer!.listeners.onSound!;
    onSound('step');
    onSound('blocked');
    expect(voices).toHaveLength(held + 2);
  });

  it('unwires the engine and suspends the context when the game is left', () => {
    localStorage.setItem(CUES, 'on');
    const {context} = installFakeAudioContext();
    const {engine, view} = setup();
    view.rerender({play: false});
    expect(engine.observer).toBeNull();
    expect(context.state).toBe('suspended');
    expect(context.closed).toBe(0);
  });

  it('resumes the same context when the game is played again', () => {
    localStorage.setItem(CUES, 'on');
    const {context} = installFakeAudioContext();
    const count = countContexts();
    const {engine, view} = setup();
    view.rerender({play: false});
    view.rerender({play: true});
    expect(count.built).toBe(1);
    expect(context.state).toBe('running');
    expect(engine.observer).not.toBeNull();
  });

  it('closes the context when the setting is turned off', () => {
    localStorage.setItem(CUES, 'on');
    const {context} = installFakeAudioContext();
    const {engine, setting} = setup();
    act(() => setting().onChange('off'));
    expect(engine.observer).toBeNull();
    expect(context.closed).toBe(1);
  });

  it('unwires the engine and closes the context on unmount', () => {
    localStorage.setItem(CUES, 'on');
    const {context} = installFakeAudioContext();
    const {engine, view} = setup();
    view.unmount();
    expect(engine.observer).toBeNull();
    expect(context.closed).toBe(1);
  });

  it('offers nothing on a level with no platformer to hear', () => {
    localStorage.setItem(CUES, 'on');
    const {engine, view} = setup({hasPlatformScene: false});
    expect(view.result.current.settings).toEqual([]);
    expect(engine.observer).toBeNull();
  });

  it('survives a browser that refuses another audio context', () => {
    localStorage.setItem(CUES, 'on');
    (window as unknown as {AudioContext: unknown}).AudioContext = function () {
      throw new Error('no more contexts');
    };
    expect(setup().engine.observer).toBeNull();
  });

  it('builds nothing while the setting is off', () => {
    const {engine} = setup();
    expect(engine.observer).toBeNull();
  });

  it('unlock makes and wakes the context, which the run then reuses', () => {
    localStorage.setItem(CUES, 'on');
    const {context} = installFakeAudioContext();
    const count = countContexts();
    const {view} = setup({playing: false});
    act(() => view.result.current.unlock());
    expect(count.built).toBe(1);
    expect(context.resumed).toBe(1);
    view.rerender({play: true});
    expect(count.built).toBe(1);
  });

  it('unlock does nothing while the setting is off', () => {
    const {context} = installFakeAudioContext();
    const count = countContexts();
    const {view} = setup({playing: false});
    act(() => view.result.current.unlock());
    expect(count.built).toBe(0);
    expect(context.resumed).toBe(0);
  });

  it('turning the setting on wakes the context in that gesture', () => {
    const {context} = installFakeAudioContext();
    const {setting} = setup({playing: false});
    act(() => setting().onChange('on'));
    expect(context.resumed).toBe(1);
  });
});
