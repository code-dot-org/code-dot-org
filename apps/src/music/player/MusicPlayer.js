import SamplePlayer from './SamplePlayer';
import {LoadSoundFromBuffer} from './sound';

// Default to 4/4 time
const BEATS_PER_MEASURE = 4;
const DEFAULT_BPM = 120;
const EventType = {
  SOUND: 'sound'
};

/**
 * Main music player component which maintains the list of playback events and
 * uses a {@link SamplePlayer} to play sounds.
 */
export default class MusicPlayer {
  constructor(bpm) {
    this.bpm = bpm || DEFAULT_BPM;
    this.playbackEvents = [];
    this.tracksMetadata = {};
    this.uniqueInvocationIdUpto = 0;
    this.samplePlayer = new SamplePlayer();
  }

  initialize(library) {
    this.library = library;
    this.samplePlayer.initialize(library);
  }

  loadSoundFromBuffer(id, buffer) {
    LoadSoundFromBuffer(id, buffer);
  }

  playSoundAtMeasureById(id, measure, insideWhenRun, trackId, functionContext, skipContext) {
    if (!this.samplePlayer.initialized()) {
      console.log('MusicPlayer not initialized');
      return;
    }
    if (!id || !this.getSoundForId(id) || !measure) {
      console.log(`Invalid input. id: ${id} measure: ${measure}`);
      return;
    }

    const soundEvent = {
      type: EventType.SOUND,
      id,
      triggered: !insideWhenRun,
      when: measure,
      trackId,
      functionContext,
      skipContext
    };

    this.playbackEvents.push(soundEvent);

    if (this.samplePlayer.playing()) {
      this.samplePlayer.playSamples(this.convertEventToSamples(soundEvent));
    }
  }

  previewSound(id, onStop) {
    this.samplePlayer.previewSample(id, onStop);
  }

  cancelPreviews() {
    this.samplePlayer.cancelPreviews();
  }

  playSong() {
    const sampleEvents = [];
    for (const event of this.playbackEvents) {
      sampleEvents.push(...this.convertEventToSamples(event));
    }

    this.samplePlayer.startPlayback(sampleEvents);
  }

  stopSong() {
    this.samplePlayer.stopPlayback();
  }

  stopAllSoundsStillToPlay() {
    this.samplePlayer.stopAllSamplesStillToPlay();
  }

  clearWhenRunEvents() {
    this.playbackEvents = this.playbackEvents.filter(
      playbackEvent => playbackEvent.triggered
    );
    Object.keys(this.tracksMetadata).forEach(trackId => {
      if (this.tracksMetadata[trackId].insideWhenRun) {
        delete this.tracksMetadata[trackId];
      }
    });
  }

  clearTriggeredEvents() {
    this.playbackEvents = this.playbackEvents.filter(
      playbackEvent => !playbackEvent.triggered
    );

    Object.keys(this.tracksMetadata).forEach(trackId => {
      if (!this.tracksMetadata[trackId].insideWhenRun) {
        delete this.tracksMetadata[trackId];
      }
    });
  }

  getPlaybackEvents() {
    return this.playbackEvents;
  }

  // Returns the current playhead position, in floating point for an exact position,
  // 1-based, and scaled to measures.
  // Returns 0 if music is not playing.
  getCurrentPlayheadPosition() {
    const elapsedTime = this.samplePlayer.getElapsedPlaybackTimeSeconds();
    if (elapsedTime === -1) {
      return 0;
    }
    return this.convertSecondsToPlayheadPosition(elapsedTime);
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

  convertEventToSamples(event) {
    if (event.type === EventType.SOUND) {
      return [
        {
          sampleId: event.id,
          offsetSeconds: this.convertPlayheadPositionToSeconds(event.when),
          triggered: event.triggered
        }
      ];
    }
  }
}
