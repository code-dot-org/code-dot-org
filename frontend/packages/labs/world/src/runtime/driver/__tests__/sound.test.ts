// What a tick's sound comes to, as calls (specs/SOUND.md).
//
// The two halves are tested for opposite properties, which is the whole design:
// a one-shot fires EVERY time it is raised, and a track fires only when it
// CHANGES. Getting the second wrong is sixty copies of the theme a second, and
// it is the kind of wrong that a browser tells you about and a test does not —
// unless the decision is pulled out of the browser, which is what this is.

import {describe, expect, it, vi} from 'vitest';

import {SoundChannel, type SoundOutput} from '../sound';

/** A port that writes down what it was asked to do. */
const output = () => {
  const calls: string[] = [];
  const out: SoundOutput = {
    play: name => calls.push(`play ${name}`),
    startMusic: name => calls.push(`start ${name}`),
    stopMusic: () => calls.push('stop'),
  };
  return {out, calls};
};

describe('one-shots', () => {
  it('plays each one raised, in order', () => {
    const {out, calls} = output();

    new SoundChannel(out).sync(['jump', 'land'], undefined);

    expect(calls).toEqual(['play jump', 'play land']);
  });

  it('plays repeats as repeats', () => {
    // Two coins in one tick are two pops. The engine keeps them; so does this.
    const {out, calls} = output();

    new SoundChannel(out).sync(['pop', 'pop'], undefined);

    expect(calls).toEqual(['play pop', 'play pop']);
  });

  it('does nothing for a tick that raised none', () => {
    const {out, calls} = output();

    new SoundChannel(out).sync([], undefined);

    expect(calls).toEqual([]);
  });
});

describe('music', () => {
  it('starts when a track first appears', () => {
    const {out, calls} = output();

    new SoundChannel(out).sync([], 'theme');

    expect(calls).toEqual(['start theme']);
  });

  it('does not start again on the next tick', () => {
    // The reason this class has a field at all. The world reports its track
    // every frame; starting it every frame is sixty overlapping copies a
    // second, and each one sounds like the game is broken because it is.
    const {out, calls} = output();
    const channel = new SoundChannel(out);

    channel.sync([], 'theme');
    channel.sync([], 'theme');
    channel.sync([], 'theme');

    expect(calls).toEqual(['start theme']);
  });

  it('stops the old one before starting the new', () => {
    // Unconditionally, and in that order: two tracks playing because nobody
    // stopped the first is not a crossfade, it is a bug. A crossfade is a thing
    // to want later and to say then.
    const {out, calls} = output();
    const channel = new SoundChannel(out);
    channel.sync([], 'theme');
    calls.length = 0;

    channel.sync([], 'boss');

    expect(calls).toEqual(['stop', 'start boss']);
  });

  it('stops on silence, and stays stopped', () => {
    const {out, calls} = output();
    const channel = new SoundChannel(out);
    channel.sync([], 'theme');
    calls.length = 0;

    channel.sync([], undefined);
    channel.sync([], undefined);

    expect(calls).toEqual(['stop']);
  });

  it('does not stop a track that was never started', () => {
    // A silent world ticking is not a world stopping its music every frame.
    const {out, calls} = output();

    new SoundChannel(out).sync([], undefined);

    expect(calls).toEqual([]);
  });

  it('starts again after being stopped', () => {
    const {out, calls} = output();
    const channel = new SoundChannel(out);
    channel.sync([], 'theme');
    channel.sync([], undefined);
    calls.length = 0;

    channel.sync([], 'theme');

    expect(calls).toEqual(['start theme']);
  });
});

describe('a game going away', () => {
  it('stops the track it started', () => {
    // "The music kept going after I pressed Restart" is what this prevents: a
    // restart builds a second scene, and a track nobody stopped plays under it.
    const {out, calls} = output();
    const channel = new SoundChannel(out);
    channel.sync([], 'theme');
    calls.length = 0;

    channel.stop();

    expect(calls).toEqual(['stop']);
  });

  it('stops nothing when nothing was playing', () => {
    const {out, calls} = output();

    new SoundChannel(out).stop();

    expect(calls).toEqual([]);
  });

  it('is safe to stop twice', () => {
    const {out, calls} = output();
    const channel = new SoundChannel(out);
    channel.sync([], 'theme');
    channel.stop();
    calls.length = 0;

    channel.stop();

    expect(calls).toEqual([]);
  });

  it('starts fresh afterwards rather than believing it is still playing', () => {
    const {out, calls} = output();
    const channel = new SoundChannel(out);
    channel.sync([], 'theme');
    channel.stop();
    calls.length = 0;

    channel.sync([], 'theme');

    expect(calls).toEqual(['start theme']);
  });
});

describe('the two together', () => {
  it('plays the one-shots of the tick that changed the track', () => {
    // They are independent, and a tick can carry both — the coin that ends the
    // level pops as the music changes.
    const {out, calls} = output();

    new SoundChannel(out).sync(['pop'], 'victory');

    expect(calls).toEqual(['play pop', 'start victory']);
  });
});

describe('the port', () => {
  it('is the only thing that touches a browser', () => {
    // Stated as a test because it is the point of the seam: everything above
    // decided what should happen without an AudioContext existing.
    const play = vi.fn();
    new SoundChannel({play, startMusic: vi.fn(), stopMusic: vi.fn()}).sync(
      ['pop'],
      undefined,
    );

    expect(play).toHaveBeenCalledWith('pop');
  });
});
