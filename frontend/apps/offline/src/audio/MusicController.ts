import type Sound from './Sound';
import type SoundBoard from './SoundBoard';

export interface MusicTrackDefinition {
  /** Corresponds to music filenames */
  name: string;
  /** The 'group' for this music */
  group: string;
  /** On a 0.0 to 1.0 scale. */
  volume: number;
  /**
   * Whether or not an .ogg version of the file should also be available
   * alongside the .mp3.
   */
  hasOgg?: boolean;
}

/**
 * Internal track representation. Includes track metadata and references to
 * loaded sound objects.
 */
export interface MusicTrack {
  name: string;
  assetUrls: string[];
  volume: number;
  sound: Sound;
  isLoaded: boolean;
}

/**
 * The maestro! Manages the background music currently playing.
 *
 * This was originally in `apps/src/MusicController`.
 */
class MusicController {
  private soundBoard: SoundBoard;
  private nowPlaying?: string;
  private muteMusic: boolean = false;
  private currentGroup?: string;
  private trackList: MusicTrack[] = [];

  constructor(soundBoard: SoundBoard) {
    this.soundBoard = soundBoard;
  }

  preload() {
    for (const track in this.trackList) {
      track.sound = this.soundBoard.registerByFilenamesAndId(
        track.assetUrls,
        track.name,
      );

      track.sound.onLoadCallback = () => {
        track.isLoaded = true;
        if (this.playOnLoad === track.name) {
          this.play(track.name);
        }
      };
    }
  }

  setMuteMusic(isBackgroundMusicMuted: boolean, trackName: string) {
    this.muteMusic = isBackgroundMusicMuted;
    if (this.muteMusic) {
      this.stop();
    } else {
      this.play(trackName);
    }
  }

  /**
   * Begins playing a particular piece of music immediately.
   * @param trackName - Name of the track to play (if omited, play a random track)
   */
  play(trackName?: string) {
    if (this.muteMusic) {
      return;
    }

    const track = trackName
      ? this.getTrackByName(trackName)
      : this.getRandomTrack();

    if (track.sound && track.isLoaded) {
      track.sound.play({
        volume: track.volume,
        onEnded: () => {
          this.whenMusicStopped(track.name);
        },
      });
      this.nowPlaying = track.name;
    }
  }

  setGroup(group: string) {
    this.currentGroup = group;
  }

  /**
   * Stops playing whatever music is currently playing, immediately.
   */
  stop() {
    if (this.nowPlaying === undefined) {
      return;
    }

    this.soundBoard.get(this.nowPlaying)?.stop();
  }

  /**
   * Fades music to nothing, then stops it.
   */
  fadeOut(duration: number) {
    if (!this.nowPlaying) {
      return;
    }

    // Trigger a fade
    this.soundBoard.get(this.nowPlaying)?.fadeToGain(0, duration);

    // Stop the audio after the fade.
    // Add a small margin due to poor fade granularity on fallback player.
    window.setTimeout(
      () => {
        this.stop();
      },
      1000 * duration + 100,
    );
  }

  /**
   * Callback for when music stops, to update internal state.
   * @param trackName - Name of track that was playing.  Should be bound when music is started.
   */
  private whenMusicStopped(trackName: string) {
    if (this.nowPlaying === trackName) {
      this.nowPlaying = undefined;
    }

    if (this.loopRandomWithDelay && this.wasPlayingWhenVideoShown) {
      this.betweenTrackTimeout = window.setTimeout(() => {
        this.betweenTrackTimeout_ = null;
        if (!this.nowPlaying && !this.wasPlayingWhenVideoShown) {
          this.play();
        }
      }, this.loopRandomWithDelay);
    }
  }

  /**
   * @param {string} name
   * @private
   */
  private getTrackByName(name: string): MusicTrack | undefined {
    return this.trackList.find(track => track.name === name);
  }

  /**
   */
  private getRandomTrack(): MusicTrack {
    const groupTracks = this.trackList.filter(t => {
      return !this.currentGroup || t.group === this.currentGroup;
    });
    const trackIndex = Math.floor(Math.random() * groupTracks.length);
    return groupTracks[trackIndex];
  }
}

export default MusicController;
