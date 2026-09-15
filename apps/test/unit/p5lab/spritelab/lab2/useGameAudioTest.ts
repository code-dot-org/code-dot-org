import {act, renderHook} from '@testing-library/react-hooks';

import useGameAudio from '@cdo/apps/p5lab/spritelab/lab2/useGameAudio';

import {FakeVoice, installFakeAudioContext} from './fakeAudioContext';

const EFFECTS = 'spritelab2SoundEffects';
const OBSTACLES = 'spritelab2ProximitySound';

interface Engine {
  onPlayerSound: ((event: 'step' | 'blocked') => void) | null;
  onPlayerHeight: (() => void) | null;
  onPlayerProximity: (() => void) | null;
}

function setup(playing = true) {
  const engine: Engine = {
    onPlayerSound: null,
    onPlayerHeight: null,
    onPlayerProximity: null,
  };
  const view = renderHook(
    ({play}: {play: boolean}) => useGameAudio({current: engine}, play),
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
    // Nothing stored yet: the case that once silenced the whole game.
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
    const {engine, view} = setup(false);
    expect(engine.onPlayerSound).toBeNull();
    view.rerender({play: true});
    expect(engine.onPlayerSound).not.toBeNull();
    expect(engine.onPlayerHeight).not.toBeNull();
  });

  it('leaves proximity unwired so the engine can skip measuring it', () => {
    // Its distances cost the most, and by default nothing listens.
    const {engine} = setup();
    expect(engine.onPlayerProximity).toBeNull();
    expect(engine.onPlayerHeight).not.toBeNull();
  });

  it('wires proximity once its setting is on', () => {
    localStorage.setItem(OBSTACLES, 'on');
    expect(setup().engine.onPlayerProximity).not.toBeNull();
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
    engine.onPlayerSound!(silent as 'step');
    expect(voices).toHaveLength(held);
    engine.onPlayerSound!(heard as 'step');
    expect(voices).toHaveLength(held + 1);
  });

  it('unwires the engine when the game is left', () => {
    const {engine, view} = setup();
    view.rerender({play: false});
    expect(engine.onPlayerSound).toBeNull();
    expect(engine.onPlayerHeight).toBeNull();
    expect(engine.onPlayerProximity).toBeNull();
  });

  it('unwires the engine on unmount', () => {
    const {engine, view} = setup();
    view.unmount();
    expect(engine.onPlayerSound).toBeNull();
    expect(engine.onPlayerHeight).toBeNull();
  });

  it('builds nothing when both switches are off', () => {
    localStorage.setItem(EFFECTS, 'off');
    const {engine} = setup();
    expect(engine.onPlayerSound).toBeNull();
    expect(engine.onPlayerHeight).toBeNull();
    expect(engine.onPlayerProximity).toBeNull();
  });
});
