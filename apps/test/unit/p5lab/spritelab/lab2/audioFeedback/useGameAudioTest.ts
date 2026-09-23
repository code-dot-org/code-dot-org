import {act, renderHook} from '@testing-library/react-hooks';

import {PlayerObserver} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/playerObserver';
import useGameAudio from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/useGameAudio';

import {FakeVoice, installFakeAudioContext} from './fakeAudioContext';

const CUES = 'spritelab2ProximitySound';

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
  const setting = () => view.result.current[0];
  return {engine, view, setting};
}

describe('SpriteLab2 useGameAudio', () => {
  let voices: FakeVoice[];
  beforeEach(() => {
    localStorage.clear();
    ({voices} = installFakeAudioContext());
  });

  it('offers one setting, off until chosen', () => {
    const {setting, view} = setup();
    expect(view.result.current).toHaveLength(1);
    expect(setting().label).toBe('Obstacle sounds');
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

  it('unwires the engine when the game is left', () => {
    localStorage.setItem(CUES, 'on');
    const {engine, view} = setup();
    view.rerender({play: false});
    expect(engine.observer).toBeNull();
  });

  it('unwires the engine on unmount', () => {
    localStorage.setItem(CUES, 'on');
    const {engine, view} = setup();
    view.unmount();
    expect(engine.observer).toBeNull();
  });

  it('offers nothing on a level with no platformer to hear', () => {
    localStorage.setItem(CUES, 'on');
    const {engine, view} = setup({hasPlatformer: false});
    expect(view.result.current).toEqual([]);
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
});
