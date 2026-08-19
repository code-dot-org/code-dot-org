// Listening to a sound before choosing it (specs/SOUND.md).
//
// One rule, and it is the one a shelf gets wrong: playing a second sound stops
// the first. Three overlapping previews is what happens to anyone browsing
// quickly, and it is exactly the case a real AudioContext would be needed to
// SEE and is not needed to decide — so the player is a seam over `Audio` and
// these test the decision.

import {describe, expect, it, vi} from 'vitest';

import {SoundPreview, type Playable} from '../soundPreview';

/** A player that writes down what it was asked to do. */
const fake = () => {
  const made: Array<{url: string; calls: string[]; time: () => number}> = [];
  const make = (url: string): Playable => {
    const calls: string[] = [];
    const player = {
      currentTime: 3,
      play: () => calls.push('play'),
      pause: () => calls.push('pause'),
    };
    made.push({url, calls, time: () => player.currentTime});
    return player;
  };
  return {make, made};
};

describe('SoundPreview', () => {
  it('plays the one it was given', () => {
    const {make, made} = fake();

    new SoundPreview(make).play('coin', '/sounds/coin.mp3');

    expect(made).toHaveLength(1);
    expect(made[0].url).toBe('/sounds/coin.mp3');
    expect(made[0].calls).toEqual(['play']);
  });

  it('says what is playing', () => {
    const {make} = fake();
    const preview = new SoundPreview(make);

    preview.play('coin', '/sounds/coin.mp3');

    expect(preview.playing()).toBe('coin');
  });

  it('stops the first when a second starts', () => {
    // The rule. Without it, browsing a shelf quickly plays everything at once.
    const {make, made} = fake();
    const preview = new SoundPreview(make);

    preview.play('coin', '/a.mp3');
    preview.play('jump', '/b.mp3');

    expect(made[0].calls).toEqual(['play', 'pause']);
    expect(made[1].calls).toEqual(['play']);
    expect(preview.playing()).toBe('jump');
  });

  it('rewinds what it stops', () => {
    // So the next play of the same row starts it again rather than resuming it
    // three seconds in — which is what comparing two similar sounds does.
    const {make, made} = fake();
    const preview = new SoundPreview(make);
    preview.play('coin', '/a.mp3');

    preview.stop();

    expect(made[0].time()).toBe(0);
  });

  it('is silent after stopping', () => {
    const {make} = fake();
    const preview = new SoundPreview(make);
    preview.play('coin', '/a.mp3');

    preview.stop();

    expect(preview.playing()).toBeUndefined();
  });

  it('stops nothing when nothing is playing', () => {
    const {make, made} = fake();

    new SoundPreview(make).stop();

    expect(made).toEqual([]);
  });

  it('is safe to stop twice', () => {
    const {make, made} = fake();
    const preview = new SoundPreview(make);
    preview.play('coin', '/a.mp3');
    preview.stop();

    preview.stop();

    expect(made[0].calls).toEqual(['play', 'pause']);
  });

  it('plays the same one again after stopping', () => {
    const {make, made} = fake();
    const preview = new SoundPreview(make);
    preview.play('coin', '/a.mp3');
    preview.stop();

    preview.play('coin', '/a.mp3');

    expect(made).toHaveLength(2);
    expect(preview.playing()).toBe('coin');
  });

  it('uses a real Audio when nobody says otherwise', () => {
    // The default exists so the dialog does not have to know about `Audio`, and
    // a constructor that quietly did nothing would be a shelf that never made a
    // noise. jsdom has the constructor and refuses to play, which is enough to
    // show the wiring.
    const play = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());

    new SoundPreview().play('coin', '/sounds/coin.mp3');

    expect(play).toHaveBeenCalled();
    play.mockRestore();
  });
});
