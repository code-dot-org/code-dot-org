import {GetCurrentAudioTime, PlaySound, StopSound} from './sound';

// Default to 4/4 time
const BEATS_PER_MEASURE = 4;
const DEFAULT_BPM = 120;
const GROUP_TAG = 'mainaudio';

export default class MusicPlayer {
  constructor(bpm) {
    this.bpm = bpm || DEFAULT_BPM;
    this.soundEvents = [];
    this.isPlaying = false;
    this.startPlayingAudioTime = -1;
    this.groupPath = 'all';
  }

  setGroupPath(path) {
    this.groupPath = path;
  }

  playSoundAtMeasure(id, measure) {
    if (!measure) {
      console.log('invalid measure ' + measure);
      return;
    }

    const soundEvent = {
      type: 'play',
      id,
      when: measure - 1
    };

    this.soundEvents.push(soundEvent);

    if (this.isPlaying) {
      this.playSoundEvent(soundEvent);
    }
  }

  playSoundImmediately(id) {
    this.stopSong();

    this.playSoundEvent({type: 'play', id, when: 0});
  }

  playSong() {
    StopSound(GROUP_TAG);

    this.startPlayingAudioTime = GetCurrentAudioTime();

    for (const sound of this.soundEvents) {
      this.playSoundEvent(sound);
    }

    this.isPlaying = true;
  }

  stopSong() {
    StopSound(GROUP_TAG);
    this.isPlaying = false;
  }

  clearQueue() {
    this.soundEvents = [];
  }

  getSoundEvents() {
    return this.soundEvents;
  }

  getCurrentAudioElapsedTime() {
    if (!this.isPlaying) {
      return 0;
    }

    return GetCurrentAudioTime() - this.startPlayingAudioTime;
  }

  getPlayheadPosition() {
    if (!this.isPlaying) {
      return 0;
    }

    // Playhead time is 1-based (user-facing)
    return 1 + this.getCurrentAudioElapsedTime() / this.secondsPerMeasure();
  }

  getCurrentMeasure() {
    const currentAudioTime = GetCurrentAudioTime();
    if (!this.isPlaying || currentAudioTime === null) {
      return -1;
    }

    return this.convertSecondsToMeasure(
      currentAudioTime - this.startPlayingAudioTime
    );
  }

  playSoundEvent(sound, isImmediate) {
    const eventStart =
      this.startPlayingAudioTime + this.convertMeasureToSeconds(sound.when);
    if (!isImmediate && eventStart < GetCurrentAudioTime()) {
      // Don't play if we've already passed this measure unless we're playing immediately (e.g. preview)
      return;
    }
    if (sound.type === 'play') {
      PlaySound(this.groupPath + '/' + sound.id, GROUP_TAG, eventStart);
    }
  }

  convertSecondsToMeasure(seconds) {
    return Math.floor(seconds / this.secondsPerMeasure());
  }

  convertMeasureToSeconds(measure) {
    return this.secondsPerMeasure() * measure;
  }

  secondsPerMeasure() {
    return (60 / this.bpm) * BEATS_PER_MEASURE;
  }
}
