import {act, renderHook} from '@testing-library/react-hooks';

import {PlayerObserver} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/playerObserver';
import useGameAudio from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/useGameAudio';

import {FakeVoice, installFakeAudioContext} from './fakeAudioContext';

const EFFECTS = 'spritelab2SoundEffects';
const OBSTACLES = 'spritelab2ProximitySound';

interface Engine {
  observer: PlayerObserver | null;
  setPlayerObserver(observer: PlayerObserver | null): void;
}

function setup({playing = true, hasPlatformer = true} = {}) {
  const engine: Engine = {
    observer: null,
    setPlayerObserver(observer) {
      this.observer = observer;
    },
  };
  const view = renderHook(
    ({play}: {play: boolean}) =>
      useGameAudio({current: engine}, {hasPlatformer, playing: play}),
    {initialProps: {play: playing}}
  );
  const setting = (id: string) =>
    view.result.current.find(entry => entry.id === id)!;
  return {engine, view, setting};
}

describe('SpriteLab2 useGameAudio', () => {
  let voices: FakeVoice[];
  beforeEach(() => {
    localStorage.clear();
    ({voices} = installFakeAudioContext());
  });

  it('starts sound effects on and obstacle sounds off', () => {
    // With nothing stored, the fallbacks decide.
    const {setting} = setup();
    expect(setting(EFFECTS).selectedValue).toBe('on');
    expect(setting(OBSTACLES).selectedValue).toBe('off');
  });

  it('takes a remembered choice over the default', () => {
    localStorage.setItem(EFFECTS, 'off');
    localStorage.setItem(OBSTACLES, 'on');
    const {setting} = setup();
    expect(setting(EFFECTS).selectedValue).toBe('off');
    expect(setting(OBSTACLES).selectedValue).toBe('on');
  });

  it('remembers a change', () => {
    const {setting} = setup();
    act(() => setting(EFFECTS).onChange('off'));
    expect(localStorage.getItem(EFFECTS)).toBe('off');
    expect(setting(EFFECTS).selectedValue).toBe('off');
  });

  it('wires the engine only while the game is being played', () => {
    const {engine, view} = setup({playing: false});
    expect(engine.observer).toBeNull();
    view.rerender({play: true});
    expect(engine.observer?.listeners.onSound).toBeDefined();
    expect(engine.observer?.listeners.onHeight).toBeDefined();
  });

  it('leaves proximity unwired so the observer can skip measuring it', () => {
    const {engine} = setup();
    expect(engine.observer?.listeners.onProximity).toBeUndefined();
    expect(engine.observer?.listeners.onHeight).toBeDefined();
  });

  it('wires proximity once its setting is on', () => {
    localStorage.setItem(OBSTACLES, 'on');
    expect(setup().engine.observer?.listeners.onProximity).toBeDefined();
  });

  // Both blips arrive on one callback, so which setting lets each through
  // is the whole rule. A blip that plays adds a voice to the held tones'.
  it.each([
    {settings: {}, heard: 'step', silent: 'blocked'},
    {
      settings: {[OBSTACLES]: 'on', [EFFECTS]: 'off'},
      heard: 'blocked',
      silent: 'step',
    },
  ])('plays $heard but not $silent', ({settings, heard, silent}) => {
    Object.entries(settings).forEach(([key, value]) =>
      localStorage.setItem(key, value)
    );
    const {engine} = setup();
    const held = voices.length;
    const onSound = engine.observer!.listeners.onSound!;
    onSound(silent as 'step');
    expect(voices).toHaveLength(held);
    onSound(heard as 'step');
    expect(voices).toHaveLength(held + 1);
  });

  it('unwires the engine when the game is left', () => {
    const {engine, view} = setup();
    view.rerender({play: false});
    expect(engine.observer).toBeNull();
  });

  it('unwires the engine on unmount', () => {
    const {engine, view} = setup();
    view.unmount();
    expect(engine.observer).toBeNull();
  });

  it('offers nothing on a level with no platformer to hear', () => {
    const {engine, view} = setup({hasPlatformer: false});
    expect(view.result.current).toEqual([]);
    expect(engine.observer).toBeNull();
  });

  it('survives a browser that refuses another audio context', () => {
    (window as unknown as {AudioContext: unknown}).AudioContext = function () {
      throw new Error('no more contexts');
    };
    const {engine} = setup();
    expect(engine.observer).toBeNull();
  });

  it('builds nothing when both switches are off', () => {
    localStorage.setItem(EFFECTS, 'off');
    const {engine} = setup();
    expect(engine.observer).toBeNull();
  });
});
