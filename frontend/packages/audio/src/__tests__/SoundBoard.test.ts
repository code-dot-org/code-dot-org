/**
 * @vitest-environment jsdom
 */

import {afterEach, describe, expect, it, vi} from 'vitest';

import SoundBoard from '../SoundBoard';

/**
 * A board holding two registered sounds, one of which reports itself playing.
 *
 * jsdom can play nothing, so `isPlaying` is stubbed rather than reached by
 * actually starting a sound.
 */
function boardWithOnePlayingSound() {
  const board = new SoundBoard();
  const playing = board.register({id: 'playing', mp3: 'playing.mp3'});
  const idle = board.register({id: 'idle', mp3: 'idle.mp3'});
  vi.spyOn(playing, 'isPlaying').mockReturnValue(true);
  vi.spyOn(idle, 'isPlaying').mockReturnValue(false);
  return {board, playing, idle};
}

describe('SoundBoard.pauseSounds', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // `isPlaying` is a method here and was a boolean field in the code this was
  // ported from. Testing the method object for truth instead of calling it
  // reads as "everything is playing", which stops sounds that were not.
  it('stops only the sounds that are playing', () => {
    const {board, playing, idle} = boardWithOnePlayingSound();
    const playingStop = vi.spyOn(playing, 'stop');
    const idleStop = vi.spyOn(idle, 'stop');

    board.pauseSounds();

    expect(playingStop).toHaveBeenCalledTimes(1);
    expect(idleStop).not.toHaveBeenCalled();
  });

  it('restarts only the sounds it paused', () => {
    const {board, playing, idle} = boardWithOnePlayingSound();
    board.pauseSounds();

    // Neither sound ever loaded, so a replay is queued rather than started.
    const playingReplay = vi.spyOn(playing, 'playAfterLoad');
    const idleReplay = vi.spyOn(idle, 'playAfterLoad');

    board.restartPausedSounds();

    expect(playingReplay).toHaveBeenCalledTimes(1);
    expect(idleReplay).not.toHaveBeenCalled();
  });

  it('forgets the paused set once it has been restarted', () => {
    const {board, playing} = boardWithOnePlayingSound();
    board.pauseSounds();
    board.restartPausedSounds();

    const playingReplay = vi.spyOn(playing, 'playAfterLoad');
    board.restartPausedSounds();

    expect(playingReplay).not.toHaveBeenCalled();
  });

  it('pauses nothing when nothing is playing', () => {
    const board = new SoundBoard();
    const sound = board.register({id: 'idle', mp3: 'idle.mp3'});
    const stop = vi.spyOn(sound, 'stop');

    board.pauseSounds();

    expect(stop).not.toHaveBeenCalled();
  });
});
