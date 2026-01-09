import Sound, {SoundConfig} from './Sound';
import type SoundBoard from './SoundBoard';

export interface MusicTrackDefinition {
  /** Corresponds to music filenames */
  name: string;
  /** The 'group' for this music */
  group?: string;
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
export interface MusicTrack extends MusicTrackDefinition {
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
  private playOnLoad?: string;
  private loopRandomWithDelay: number = 0;
  private betweenTrackTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Constructs the music controller to play with the provided audio mixer.
   *
   * If provided, a list of tracks can be preloaded all at once.
   *
   * @param soundBoard - The audio device to use.
   * @param preloadTrackList - The optional list of tracks to preload.
   * @param loopRandomWithDelay - If specified, after a song is completed, will
   *        play a random track from the list after the given duration (in ms).
   */
  constructor(
    soundBoard: SoundBoard,
    preloadTrackList?: MusicTrackDefinition[],
    loopRandomWithDelay?: number,
  ) {
    this.soundBoard = soundBoard;
    this.loopRandomWithDelay = loopRandomWithDelay || 0;

    // Preload this provided track list
    (preloadTrackList || []).forEach(track => this.register(track));
  }

  /**
   * Registers the sound information as a music track with the given unique id.
   *
   * If no `id` is given, the `id` is the `track.name` provided.
   *
   * IDs need to be unique across all sounds in the provided SoundBoard given
   * when constructing this MusicController. If a provided `id` is already
   * registered in the SoundBoard, that sound will be used for this music track.
   */
  register(track: MusicTrackDefinition, id?: string): MusicTrack {
    const parts = track.name.split('/');
    id ||= parts[parts.length - 1];
    const soundConfig: SoundConfig = {
      id: id,
      mp3: track.name + '.mp3',
      ogg: track.hasOgg ? track.name + '.ogg' : undefined,
    };
    const sound = this.soundBoard.register(soundConfig);
    const realized: MusicTrack = {
      ...track,
      sound,
      isLoaded: false,
    };

    realized.sound.onLoad = () => {
      realized.isLoaded = true;
      if (this.playOnLoad === realized.name) {
        this.play(realized.name);
      }
    };

    this.trackList.push(realized);
    return realized;
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

    if (track?.sound && track?.isLoaded) {
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
    setTimeout(
      () => {
        this.stop();
      },
      1000 * duration + 100,
    );
  }

  /**
   * Callback for when music stops, to update internal state.
   * @param trackName - Name of track that was playing. Should be bound when music is started.
   */
  private whenMusicStopped(trackName: string) {
    if (this.nowPlaying === trackName) {
      this.nowPlaying = undefined;
    }

    if (this.loopRandomWithDelay > 0) {
      this.betweenTrackTimeout = setTimeout(() => {
        this.betweenTrackTimeout = undefined;
        if (!this.nowPlaying) {
          this.play();
        }
      }, this.loopRandomWithDelay);
    }
  }

  private getTrackByName(name: string): MusicTrack | undefined {
    return this.trackList.find(track => track.name === name);
  }

  private getRandomTrack(): MusicTrack {
    const groupTracks = this.trackList.filter(t => {
      return !this.currentGroup || t.group === this.currentGroup;
    });
    const trackIndex = Math.floor(Math.random() * groupTracks.length);
    return groupTracks[trackIndex];
  }
}

export default MusicController;
