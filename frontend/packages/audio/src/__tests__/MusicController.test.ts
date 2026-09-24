/**
 * @vitest-environment jsdom
 */

import {afterEach, describe, expect, it, vi} from 'vitest';

import MusicController from '../MusicController';
import SoundBoard from '../SoundBoard';

/** A track name with a path in it -- the case the id derivation got wrong. */
const TRACK_NAME = 'music/background';

function controllerWithTrack() {
  const board = new SoundBoard();
  const controller = new MusicController(board);
  const track = controller.register({name: TRACK_NAME, volume: 1});
  return {board, controller, track};
}

describe('MusicController.register', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The controller remembers what is playing by track name and looks the sound
  // back up by that name, so the sound has to be registered under the same
  // name. Registering under a basename left stop() and fadeOut() unable to
  // find anything for a track whose name had a path in it.
  it('registers a track under its full name', () => {
    const {board, track} = controllerWithTrack();

    expect(board.get(TRACK_NAME)).toBe(track.sound);
  });

  it('honours an explicit id when given one', () => {
    const board = new SoundBoard();
    const controller = new MusicController(board);
    const track = controller.register({name: TRACK_NAME, volume: 1}, 'custom');

    expect(board.get('custom')).toBe(track.sound);
    expect(board.get(TRACK_NAME)).toBeUndefined();
  });
});

describe('MusicController.stop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stops the track it started', () => {
    const {controller, track} = controllerWithTrack();
    // Pretend the sound finished loading, so play() starts it for real.
    track.isLoaded = true;
    const stop = vi.spyOn(track.sound, 'stop');

    controller.play(TRACK_NAME);
    controller.stop();

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no track is playing', () => {
    const {controller, track} = controllerWithTrack();
    const stop = vi.spyOn(track.sound, 'stop');

    controller.stop();

    expect(stop).not.toHaveBeenCalled();
  });
});

describe('MusicController.play on a track that is still loading', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Asking for a track before its sound arrives has to be remembered, or the
  // request is dropped and the track never plays at all.
  it('plays the track once its sound loads', () => {
    const {controller, track} = controllerWithTrack();
    const play = vi.spyOn(track.sound, 'play');

    controller.play(TRACK_NAME);
    expect(play).not.toHaveBeenCalled();

    // What Sound does when its data finishes loading.
    track.sound.onSoundLoaded();

    expect(track.isLoaded).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('does not play a track that was never asked for', () => {
    const {track} = controllerWithTrack();
    const play = vi.spyOn(track.sound, 'play');

    track.sound.onSoundLoaded();

    expect(track.isLoaded).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });
});
