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

/**
 * Main music player component which handles scheduling sounds for playback and interacting
 * with the underlying audio system.
 */
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
    this.tracksMetadata = {};
    this.uniqueInvocationIdUpto = 0;
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

  playSoundAtMeasureById(
    id,
    measure,
    insideWhenRun,
    trackId,
    functionContext,
    effects
  ) {
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
      when: measure,
      trackId,
      functionContext,
      effects
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
            this.convertPlayheadPositionToSeconds(soundEvent.when);
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
    Object.keys(this.tracksMetadata).forEach(trackId => {
      if (this.tracksMetadata[trackId].insideWhenRun) {
        delete this.tracksMetadata[trackId];
      }
    });
  }

  clearTriggeredEvents() {
    this.soundEvents = this.soundEvents.filter(
      soundEvent => soundEvent.insideWhenRun
    );
    Object.keys(this.tracksMetadata).forEach(trackId => {
      if (!this.tracksMetadata[trackId].insideWhenRun) {
        delete this.tracksMetadata[trackId];
      }
    });
  }

  clearAllSoundEvents() {
    this.soundEvents = [];
    this.clearTracksData();
  }

  stopAndCancelPreviews() {
    StopSound(GROUP_TAG);
    this.playingPreviews = [];
  }

  getSoundEvents() {
    return this.soundEvents;
  }

  // Returns the current playhead position, in floating point for an exact position,
  // 1-based, and scaled to measures.
  // Returns 0 if music is not playing.
  getCurrentPlayheadPosition() {
    const currentAudioTime = GetCurrentAudioTime();
    if (!this.isPlaying || currentAudioTime === null) {
      return 0;
    }

    return this.convertSecondsToPlayheadPosition(
      currentAudioTime - this.startPlayingAudioTime
    );
  }

  playSoundEvent(soundEvent, onStop) {
    if (soundEvent.type === EventType.PLAY) {
      const eventStart =
        this.startPlayingAudioTime +
        this.convertPlayheadPositionToSeconds(soundEvent.when);

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
          eventStart,
          null,
          false,
          soundEvent.effects
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

  // Converts actual seconds used by the audio system into a playhead
  // position, which is 1-based and scaled to measures.
  convertSecondsToPlayheadPosition(seconds) {
    return 1 + seconds / this.secondsPerMeasure();
  }

  // Converts a playhead position, which is 1-based and scaled to measures,
  // into actual seconds used by the audio system.
  convertPlayheadPositionToSeconds(playheadPosition) {
    return this.secondsPerMeasure() * (playheadPosition - 1);
  }

  secondsPerMeasure() {
    return (60 / this.bpm) * BEATS_PER_MEASURE;
  }

  createTrack(id, name, measureStart, insideWhenRun) {
    if (id === null) {
      console.warn(`Invalid track ID`);
      return;
    }

    if (this.tracksMetadata[id]) {
      console.warn(`Track ${id}: ${name} already exists!`);
      return;
    }

    this.tracksMetadata[id] = {
      name,
      insideWhenRun,
      currentMeasure: measureStart,
      maxConcurrentSounds: 0
    };
  }

  addSoundsToTrack(trackId, ...soundIds) {
    if (!this.tracksMetadata[trackId]) {
      console.warn('No track with ID: ' + trackId);
      return;
    }

    const {currentMeasure, insideWhenRun} = this.tracksMetadata[trackId];
    let maxSoundLength = 0;

    for (let soundId of soundIds) {
      this.playSoundAtMeasureById(
        soundId,
        currentMeasure,
        insideWhenRun,
        trackId
      );
      maxSoundLength = Math.max(maxSoundLength, this.getLengthForId(soundId));
    }

    this.tracksMetadata[trackId].currentMeasure += maxSoundLength;
    this.tracksMetadata[trackId].maxConcurrentSounds = Math.max(
      soundIds.length,
      this.tracksMetadata[trackId].maxConcurrentSounds
    );
  }

  addRestToTrack(trackId, lengthMeasures) {
    if (!this.tracksMetadata[trackId]) {
      console.warn('No track with ID: ' + trackId);
      return;
    }

    this.tracksMetadata[trackId].currentMeasure += lengthMeasures;
  }

  clearTracksData() {
    this.tracksMetadata = {};
  }

  getTracksMetadata() {
    return this.tracksMetadata;
  }

  getLengthForId(id) {
    return this.getSoundForId(id).length;
  }

  getTypeForId(id) {
    return this.getSoundForId(id).type;
  }

  getSoundForId(id) {
    const splitId = id.split('/');
    const path = splitId[0];
    const src = splitId[1];

    const folder = this.library.groups[0].folders.find(
      folder => folder.path === path
    );
    const sound = folder.sounds.find(sound => sound.src === src);

    return sound;
  }

  // Called by interpreted code in the simple2 model, this returns
  // a unique value that is used to differentiate each invocation of
  // a function, so that the timeline renderer can group relevant events.
  getUniqueInvocationId() {
    return this.uniqueInvocationIdUpto++;
  }
}
