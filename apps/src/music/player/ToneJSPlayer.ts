/**
 * TODO:
 * - sequence playback
 * - Effects
 * - Experiment with loops and (x) skips
 * - (x) Clean up playback event -> tone js events
 * - (x) Rename interfaces
 */

import {SoundLoadCallbacks} from '../types';
import SoundCache from './SoundCache';

const DEFAULT_BPM = 120;

export interface SampleEvent {
  id: string;
  transportTime: string;
  originalBpm: number;
  pitchShift: number;
}

export interface SamplerSequence {
  instrument: string;
  events: {notes: string[]; transportTime: string}[];
}

class ToneJSPlayer {
  private samplers: {[instrument: string]: typeof Tone.Sampler};
  private activePlayers: (typeof Tone.GrainPlayer)[];
  private currentPreview: {id: string; player: typeof Tone.GrainPlayer} | null;

  constructor(
    bpm = DEFAULT_BPM,
    private readonly soundCache: SoundCache = new SoundCache()
  ) {
    Tone.Transport.bpm.value = bpm;
    this.activePlayers = [];
    this.samplers = [];
    this.currentPreview = null;
  }

  getCurrentPosition(): string {
    return Tone.Transport.position;
  }

  goToPosition(position: string) {
    Tone.Transport.position = position;
  }

  async loadSounds(sampleIds: string[], callbacks?: SoundLoadCallbacks) {
    return this.soundCache.loadSounds(sampleIds, callbacks);
  }

  async loadInstrument(
    instrumentName: string,
    sampleMap: {[note: number]: string},
    callbacks?: SoundLoadCallbacks
  ) {
    const urls: {[note: number]: AudioBuffer} = {};
    await this.soundCache.loadSounds(Object.values(sampleMap), callbacks);
    Object.keys(sampleMap).forEach(note => {
      const buffer = this.soundCache.getSound(sampleMap[parseInt(note)]);
      if (buffer) {
        urls[parseInt(note)] = buffer;
      }
    });

    const sampler = new Tone.Sampler(urls).toDestination();
    this.samplers[instrumentName] = sampler;
  }

  async playSampleImmediately(sound: SampleEvent, onStop?: () => void) {
    if (this.currentPreview) {
      this.currentPreview.player.stop();
    }

    const buffer = await this.soundCache.loadSound(sound.id);
    if (!buffer) {
      console.log('not in cache');
      return;
    }

    const playbackRate = Tone.Transport.bpm.value / sound.originalBpm;

    const player = new Tone.GrainPlayer({
      url: buffer,
      grainSize: playbackRate * 0.1,
    }).toDestination();

    player.onstop = () => {
      console.log('stopping ' + sound.id);
      player.dispose();

      if (this.currentPreview?.id === sound.id) {
        this.currentPreview = null;
      }

      onStop?.();
    };

    player.detune = sound.pitchShift * 100;
    player.playbackRate = playbackRate;
    player.start();

    this.currentPreview = {id: sound.id, player};
  }

  playSequenceImmediately(sequence: SamplerSequence) {
    sequence.events.forEach(({notes, transportTime}) => {
      this.samplers[sequence.instrument].triggerAttack(
        notes,
        `+${Tone.Transport.toSeconds(transportTime)}`
      );
    });
  }

  cancelPreviews() {
    if (this.currentPreview) {
      this.currentPreview.player.stop();
    }

    Object.values(this.samplers).forEach(sampler => sampler.releaseAll());
  }

  setBpm(bpm: number) {
    Tone.Transport.bpm.value = bpm;
  }

  scheduleSample(sample: SampleEvent) {
    const buffer = this.soundCache.getSound(sample.id);
    if (!buffer) {
      console.log('not in cache');
      return;
    }

    const playbackRate = Tone.Transport.bpm.value / sample.originalBpm;

    const player = new Tone.GrainPlayer({
      url: buffer,
      grainSize: playbackRate * 0.1,
    }).toDestination();

    player.detune = sample.pitchShift * 100;
    player.playbackRate = playbackRate;
    player.sync().start(sample.transportTime);

    this.activePlayers.push(player);
  }

  scheduleSamplerSequence({instrument, events}: SamplerSequence) {
    events.forEach(({notes, transportTime}) => {
      this.samplers[instrument].sync().triggerAttack(notes, transportTime);
    });
  }

  start(startTime?: string) {
    this.cancelPreviews();
    Tone.Transport.start(undefined, startTime);
  }

  pause() {
    Tone.Transport.pause();
  }

  stop() {
    Tone.Transport.stop();
    this.stopAllPlayers();
  }

  cancelAllEvents() {
    this.stopAllPlayers();
    Tone.Transport.cancel();
  }

  private stopAllPlayers() {
    this.activePlayers.forEach(player => player.dispose());
    this.activePlayers = [];
    Object.values(this.samplers).forEach(sampler =>
      sampler.releaseAll().unsync()
    );
  }
}

export default ToneJSPlayer;
