import MusicPlayer, {PlaybackEvent, SoundEvent} from '../MusicPlayer';
import Sequencer from './Sequencer';

interface Track {
  name: string;
  triggered: boolean;
  currentMeasure: number;
  maxConcurrentSounds: number;
  playbackEvents: PlaybackEvent[];
}

export default class TracksSequencer extends Sequencer {
  private player: MusicPlayer;
  private tracks: {[trackId: string]: Track};

  constructor(player: MusicPlayer) {
    super();
    this.player = player;
    this.tracks = {};
  }

  reset() {
    this.tracks = {};
  }

  createTrack(
    trackId: string,
    name: string,
    measureStart: number,
    triggered: boolean
  ) {
    if (this.tracks[trackId] !== undefined) {
      console.warn(`Track ${trackId}: ${name} already exists!`);
      return;
    }

    this.tracks[trackId] = {
      name,
      triggered,
      currentMeasure: measureStart,
      maxConcurrentSounds: 0,
      playbackEvents: []
    };
  }

  addSoundsToTrack(trackId: string, ...soundIds: string[]) {
    if (!this.tracks[trackId]) {
      console.warn('No track with ID: ' + trackId);
      return;
    }

    const currentTrack = this.tracks[trackId];
    let maxSoundLength = 0;

    for (let soundId of soundIds) {
      const soundEvent: SoundEvent = {
        id: soundId,
        type: 'sound',
        when: currentTrack.currentMeasure,
        triggered: currentTrack.triggered
      };

      currentTrack.playbackEvents.push(soundEvent);

      maxSoundLength = Math.max(
        maxSoundLength,
        this.getLengthForId(soundId) || 0
      );
    }

    currentTrack.currentMeasure += maxSoundLength;
    currentTrack.maxConcurrentSounds = Math.max(
      soundIds.length,
      currentTrack.maxConcurrentSounds
    );
  }

  addRestToTrack(trackId: string, lengthMeasures: number) {
    if (!this.tracks[trackId]) {
      console.warn('No track with ID: ' + trackId);
      return;
    }

    this.tracks[trackId].currentMeasure += lengthMeasures;
  }

  getPlaybackEvents(): PlaybackEvent[] {
    return Object.values(this.tracks)
      .map(track => track.playbackEvents)
      .flat();
  }

  getLengthForId(id: string): number {
    return this.player.getLengthForId(id) || 0;
  }
}
