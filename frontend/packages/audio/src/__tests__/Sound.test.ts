/**
 * @vitest-environment jsdom
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import Sound from '../Sound';

/** The playback-ending events `Sound` listens for on an `<audio>` element. */
const PLAYBACK_EVENTS = ['ended', 'abort', 'pause', 'error'] as const;

/**
 * The parts of an `<audio>` element `Sound` touches, with a listener registry
 * a test can fire by hand. jsdom's own HTMLAudioElement decodes nothing, so it
 * never emits the events these tests are about.
 */
function fakeAudioElement() {
  const listeners: Record<string, Set<() => void>> = {};
  return {
    volume: 1,
    loop: false,
    currentTime: 0,
    play: vi.fn(),
    pause: vi.fn(),
    addEventListener: vi.fn((name: string, listener: () => void) => {
      (listeners[name] ??= new Set()).add(listener);
    }),
    removeEventListener: vi.fn((name: string, listener: () => void) => {
      listeners[name]?.delete(listener);
    }),
    /** How many listeners are currently registered for an event. */
    countFor: (name: string) => listeners[name]?.size ?? 0,
    /** Deliver an event to whoever is listening for it. */
    emit: (name: string) => {
      for (const listener of [...(listeners[name] ?? [])]) {
        listener();
      }
    },
  };
}

type FakeAudioElement = ReturnType<typeof fakeAudioElement>;

function html5Sound(element: FakeAudioElement) {
  const sound = new Sound({id: 'test'});
  sound.preloadAudioElement(element as unknown as HTMLAudioElement);
  return sound;
}

describe('Sound played through the HTML5 fallback', () => {
  beforeEach(() => {
    // `Sound.isMobile()` tests for `ontouchstart` on the document element,
    // which jsdom defines -- so jsdom reads as a phone, and `play()` refuses
    // to use an <audio> element there. These tests are about the desktop
    // path; say so rather than reaching into jsdom's prototypes.
    vi.spyOn(Sound, 'isMobile').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A sound that stops for any of these reasons has to report that it stopped.
  // One left marked playing is never restarted by a caller that checks first,
  // and is stopped needlessly by SoundBoard.pauseSounds.
  it.each(PLAYBACK_EVENTS)('stops playing and reports it on %s', eventName => {
    const element = fakeAudioElement();
    const sound = html5Sound(element);
    const onEnded = vi.fn();

    sound.play({onEnded});
    expect(sound.isPlaying()).toBe(true);
    expect(onEnded).not.toHaveBeenCalled();

    element.emit(eventName);

    expect(sound.isPlaying()).toBe(false);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it('unregisters every playback listener once one of them fires', () => {
    const element = fakeAudioElement();
    const sound = html5Sound(element);
    // `preloadAudioElement` leaves its own load listeners behind, so count the
    // change rather than the total.
    const before = PLAYBACK_EVENTS.map(name => element.countFor(name));

    sound.play();
    expect(PLAYBACK_EVENTS.map(name => element.countFor(name))).toEqual(
      before.map(count => count + 1),
    );

    element.emit('ended');

    expect(PLAYBACK_EVENTS.map(name => element.countFor(name))).toEqual(before);
  });

  it('does not report a second ending when a later event arrives', () => {
    const element = fakeAudioElement();
    const sound = html5Sound(element);
    const onEnded = vi.fn();

    sound.play({onEnded});
    element.emit('ended');
    element.emit('pause');

    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});

describe('Sound.stop on the Web Audio path', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * A Sound holding one playable buffer whose `stop` behaves as the test asks.
   * Reaching that state means going through `preloadBytes`, the only route
   * that sets the reusable buffer.
   */
  async function webAudioSound(stop: () => void) {
    const bufferSource = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(stop),
      onended: null,
    };
    vi.stubGlobal(
      'AudioBufferSourceNode',
      class {
        constructor() {
          return bufferSource;
        }
      },
    );
    // `getPlayableBytes()` gates on the environment being able to play mp3.
    vi.stubGlobal(
      'Audio',
      class {
        canPlayType() {
          return 'probably';
        }
      },
    );

    const audioContext = {
      createGain: () => ({gain: {value: 1}, connect: vi.fn()}),
      destination: {},
      decodeAudioData: vi.fn(async () => ({}) as AudioBuffer),
    };

    const sound = new Sound(
      {id: 'test', bytes: new ArrayBuffer(8)},
      audioContext as unknown as AudioContext,
    );
    await sound.preloadBytes();
    sound.play();
    return sound;
  }

  // A buffer that was never started throws InvalidStateError when stopped, and
  // callers stop sounds freely without checking, so it has to be survivable.
  it('ignores InvalidStateError from a buffer that never started', async () => {
    const sound = await webAudioSound(() => {
      throw new DOMException('not started', 'InvalidStateError');
    });

    expect(() => sound.stop()).not.toThrow();
    expect(sound.isPlaying()).toBe(false);
  });

  it('rethrows anything else', async () => {
    const sound = await webAudioSound(() => {
      throw new TypeError('something genuinely wrong');
    });

    expect(() => sound.stop()).toThrow(TypeError);
  });
});
