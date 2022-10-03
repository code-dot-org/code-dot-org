import {GetCurrentAudioTime, InitSound, PlaySound, StopSound} from './sound';

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
    this.soundList = [];
    this.library = {};
    this.groupPrefix = 'all';
    this.isInitialized = false;
  }

  initialize(library) {
    this.library = library;
    this.soundList = library.groups
      .map(group => {
        return group.folders?.map(folder => {
          return folder.sounds.map(sound => {
            return group.path + '/' + folder.path + '/' + sound.src;
          });
        });
      })
      .flat(2);
    InitSound(this.soundList);
    this.isInitialized = true;
  }

  playSoundAtMeasureById(id, measure) {
    if (!this.isInitialized) {
      console.log('MusicPlayer not initialized');
      return;
    }
    if (
      !id ||
      this.soundList.indexOf(`${this.groupPrefix}/${id}`) === -1 ||
      !measure
    ) {
      console.log(`Invalid input. id: ${id} measure: ${measure}`);
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

  playSoundAtMeasureByName(name, measure) {
    this.playSoundAtMeasureById(this.getIdForSoundName(name), measure);
  }

  getIdForSoundName(name) {
    for (let group of this.library.groups) {
      for (let folder of group.folders) {
        const sound = folder.sounds.find(sound => sound.name === name);
        if (sound) {
          return `${folder.path}/${sound.src}`;
        }
      }
    }

    return null;
  }

  playSoundImmediately(id) {
    if (!this.isInitialized) {
      console.log('MusicPlayer not initialized');
      return;
    }
    this.stopSong();

    this.playSoundEvent({type: 'play', id, when: 0}, true);
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
      PlaySound(this.groupPrefix + '/' + sound.id, GROUP_TAG, eventStart);
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
