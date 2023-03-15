import {PlaybackEvent} from '../interfaces/PlaybackEvent';
import {SoundEvent} from '../interfaces/SoundEvent';
import MusicLibrary from '../MusicLibrary';
import Sequencer from './Sequencer';

interface Track {
  name: string;
  triggered: boolean;
  currentMeasure: number;
  maxConcurrentSounds: number;
  playbackEvents: PlaybackEvent[];
}

export default class TracksSequencer extends Sequencer {
  private tracks: {[trackId: string]: Track};
  private library: MusicLibrary | null;

  constructor() {
    super();
    this.tracks = {};
    this.library = null;
  }

  setLibrary(library: MusicLibrary) {
    this.library = library;
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
        triggered: currentTrack.triggered,
        length: this.getLengthForId(soundId)
      };

      currentTrack.playbackEvents.push(soundEvent);

      maxSoundLength = Math.max(maxSoundLength, soundEvent.length || 0);
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

  private getLengthForId(id: string): number {
    if (this.library === null) {
      return 0;
    }

    const soundData = this.library.getSoundForId(id);
    return soundData ? soundData.length : 0;
  }
}
