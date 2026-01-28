import SoundBoard from './SoundBoard';

export const PlaybackState = {
  NONE: 'none',
  BEGIN: 'begin',
  LOOP: 'loop',
  END: 'end',
} as const;

export type PlaybackStateKey =
  (typeof PlaybackState)[keyof typeof PlaybackState];

export interface ThreeSliceAudioDefinition {
  /** Audio clip name for the start of sound. */
  begin?: string;
  /** Audio clip name for the loopable part of sound. */
  loop?: string;
  /** Audio clip name for the end of sound. */
  end?: string;
  /**
   * Playback volume for the whole effect. (applied to each individual clip).
   * Default: 1 (which is normal gain)
   */
  volume?: number;
}

/**
 * A loopable audio effect defined with three parts (start, middle, end) so that
 * you can get a smooth start/finish effect.
 *
 * Assumes the audio clips in question have already been preloaded by another
 * system.
 */
class ThreeSliceAudio {
  protected state: PlaybackStateKey = PlaybackState.NONE;
  protected soundBoard: SoundBoard;
  protected beginClipName?: string;
  protected loopClipName?: string;
  protected endClipName?: string;
  protected volume: number;

  constructor(soundBoard: SoundBoard, options?: ThreeSliceAudioDefinition) {
    options ||= {};

    this.soundBoard = soundBoard;
    this.beginClipName = options.begin;
    this.loopClipName = options.loop;
    this.endClipName = options.end;
    this.volume = options.volume === undefined ? 1 : options.volume;
  }

  /**
   * Turn on the audio effect, causing it to begin and then transition to the loop.
   * Will do nothing if the effect is already playing, so safe to call often (on
   * a key-repeat, for example).
   */
  on() {
    if (this.state === PlaybackState.NONE || this.state === PlaybackState.END) {
      this.enterState(PlaybackState.BEGIN);
    }
  }

  /**
   * Turn off the audio effect.  If the loop has not started yet (the sound is
   * still starting up) then it will just stop immediately.  If the loop has
   * started, the end effect will be played and then the audio will stop.
   */
  off() {
    if (
      this.state === PlaybackState.BEGIN ||
      this.state === PlaybackState.LOOP
    ) {
      this.enterState(PlaybackState.END);
    }
  }

  protected enterState(state: PlaybackStateKey) {
    this.exitState(this.state);
    this.state = state;
    const callback = this.whenSoundStopped.bind(this, state);

    if (state === PlaybackState.BEGIN) {
      if (this.beginClipName) {
        this.soundBoard.play(this.beginClipName, {
          volume: this.volume,
          onEnded: callback,
        });
      } else {
        this.enterState(PlaybackState.LOOP);
      }
    } else if (state === PlaybackState.LOOP) {
      if (this.loopClipName) {
        this.soundBoard.play(this.loopClipName, {
          volume: this.volume,
          loop: true,
          onEnded: callback,
        });
      } else {
        this.enterState(PlaybackState.END);
      }
    } else if (state === PlaybackState.END) {
      if (this.endClipName) {
        this.soundBoard.play(this.endClipName, {
          volume: this.volume,
          onEnded: callback,
        });
      } else {
        this.enterState(PlaybackState.NONE);
      }
    }
  }

  protected exitState(state: PlaybackStateKey) {
    if (state === PlaybackState.BEGIN && this.beginClipName) {
      this.soundBoard.stopLoopingAudio(this.beginClipName);
    } else if (state === PlaybackState.LOOP && this.loopClipName) {
      this.soundBoard.stopLoopingAudio(this.loopClipName);
    } else if (state === PlaybackState.END && this.endClipName) {
      this.soundBoard.stopLoopingAudio(this.endClipName);
    }
  }

  protected whenSoundStopped(stoppedState: PlaybackStateKey) {
    if (
      stoppedState === PlaybackState.BEGIN &&
      this.state === PlaybackState.BEGIN
    ) {
      this.enterState(PlaybackState.LOOP);
    } else if (
      stoppedState === PlaybackState.END &&
      this.state === PlaybackState.END
    ) {
      this.enterState(PlaybackState.NONE);
    }
  }
}

export default ThreeSliceAudio;
