import {
  GetCurrentAudioTime,
  InitSound,
  LoadSoundFromBuffer,
  PlaySound,
  StopSound,
  StopSoundByUniqueId
} from './sound';

// Default to 4/4 time
const BEATS_PER_MEASURE = 4;
const DEFAULT_BPM = 120;
const GROUP_TAG = 'mainaudio';
const EventType = {
  PLAY: 'play',
  PREVIEW: 'preview'
};

export default class MusicPlayer {
  constructor(bpm) {
    this.bpm = bpm || DEFAULT_BPM;
    this.soundEvents = [];
    this.playingPreviews = [];
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

  loadSoundFromBuffer(id, buffer) {
    LoadSoundFromBuffer(id, buffer);
  }

  playSoundAtMeasureById(id, measure, insideWhenRun) {
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
      type: EventType.PLAY,
      id,
      insideWhenRun,
      when: measure - 1
    };

    this.soundEvents.push(soundEvent);

    if (this.isPlaying) {
      this.playSoundEvent(soundEvent);
    }
  }

  playSoundAtMeasureByName(name, measure, insideWhenRun) {
    this.playSoundAtMeasureById(
      this.getIdForSoundName(name),
      measure,
      insideWhenRun
    );
  }

  previewSound(id, onStop) {
    this.stopAndCancelPreviews();

    const previewEvent = {
      type: EventType.PREVIEW,
      id
    };

    this.playSoundEvent(previewEvent, onStop);
  }

  isPreviewPlaying(id) {
    return this.playingPreviews.includes(id);
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

  playSong() {
    this.stopAndCancelPreviews();

    this.startPlayingAudioTime = GetCurrentAudioTime();

    for (const sound of this.soundEvents) {
      this.playSoundEvent(sound);
    }

    this.isPlaying = true;
  }

  stopSong() {
    this.stopAndCancelPreviews();
    this.isPlaying = false;
  }

  stopAllSoundsStillToPlay() {
    // If we are actively playing, then go through all events that were
    // triggered under when_run and that have a timestamp in the future,
    // and stop them preemptively.  This is usually because the code
    // changed and these future sound events might no longer be valid,
    // or if they are valid, they will be scheduled again.
    if (this.isPlaying) {
      for (let soundEvent of this.soundEvents) {
        if (soundEvent.insideWhenRun) {
          const eventStart =
            this.startPlayingAudioTime +
            this.convertMeasureToSeconds(soundEvent.when);
          if (eventStart > GetCurrentAudioTime()) {
            StopSoundByUniqueId(GROUP_TAG, soundEvent.uniqueId);
          }
        }
      }
    }
  }

  clearWhenRunEvents() {
    this.soundEvents = this.soundEvents.filter(
      soundEvent => !soundEvent.insideWhenRun
    );
  }

  clearTriggeredEvents() {
    this.soundEvents = this.soundEvents.filter(
      soundEvent => soundEvent.insideWhenRun
    );
  }

  clearAllSoundEvents() {
    this.soundEvents = [];
  }

  stopAndCancelPreviews() {
    StopSound(GROUP_TAG);
    this.playingPreviews = [];
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

  playSoundEvent(soundEvent, onStop) {
    if (soundEvent.type === EventType.PLAY) {
      const eventStart =
        this.startPlayingAudioTime +
        this.convertMeasureToSeconds(soundEvent.when);

      const currentAudioTime = GetCurrentAudioTime();

      // Triggered sounds might have a target play time that is very slightly in
      // the past, specificially when they use the currentTime passed (slightly
      // earlier) into the event handler code as the target play time.
      // To compensate for this delay, if the target play time is within a tenth of
      // a second of the current play time, then play it.
      // Note that we still don't play sounds older than that, because they might
      // have been scheduled for some time ago, and Web Audio will play a
      // sound immediately if its target time is in the past.
      const delayCompensation = soundEvent.insideWhenRun ? 0 : 0.1;

      if (eventStart >= currentAudioTime - delayCompensation) {
        soundEvent.uniqueId = PlaySound(
          this.groupPrefix + '/' + soundEvent.id,
          GROUP_TAG,
          eventStart
        );
      }
    }

    if (soundEvent.type === EventType.PREVIEW) {
      PlaySound(this.groupPrefix + '/' + soundEvent.id, GROUP_TAG, 0, () => {
        const index = this.playingPreviews.indexOf(soundEvent.id);
        if (index > -1) {
          this.playingPreviews.splice(index, 1);
        }
        onStop();
      });

      this.playingPreviews.push(soundEvent.id);
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
