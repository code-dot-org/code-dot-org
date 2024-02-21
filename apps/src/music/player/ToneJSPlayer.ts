/**
 * TODO:
 * - sequence playback
 * - Effects
 */

import {SoundLoadCallbacks} from '../types';
import SoundCache from './SoundCache';
import {GrainPlayer, Player, Sampler, Transport, getContext, start} from 'tone';

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
  private samplers: {[instrument: string]: Sampler};
  private activePlayers: (Player | GrainPlayer)[];
  private currentPreview: {
    id: string;
    player: Player | GrainPlayer;
  } | null;

  constructor(
    bpm = DEFAULT_BPM,
    private readonly soundCache: SoundCache = new SoundCache()
  ) {
    Transport.bpm.value = bpm;
    this.activePlayers = [];
    this.samplers = {};
    this.currentPreview = null;

    start().then(() => {
      console.log('TONE: context started');
    });
  }

  getCurrentPosition(): string {
    return Transport.position as string;
  }

  goToPosition(position: string) {
    Transport.position = position;
  }

  setLoopEnabled(enabled: boolean) {
    Transport.loop = enabled;
  }

  setLoopStart(startPosition: string) {
    Transport.loopStart = startPosition;
  }

  setLoopEnd(endPosition: string) {
    Transport.loopEnd = endPosition;
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

    const sampler = new Sampler(urls).toDestination();
    this.samplers[instrumentName] = sampler;
  }

  async playSampleImmediately(sound: SampleEvent, onStop?: () => void) {
    await this.startContextIfNeeded();
    if (this.currentPreview) {
      this.currentPreview.player.stop();
    }

    const buffer = await this.soundCache.loadSound(sound.id);
    if (!buffer) {
      console.log('not in cache');
      return;
    }

    const playbackRate = Transport.bpm.value / sound.originalBpm;

    const player = new GrainPlayer({
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

  async playSequenceImmediately(sequence: SamplerSequence) {
    await this.startContextIfNeeded();
    sequence.events.forEach(({notes, transportTime}) => {
      this.samplers[sequence.instrument].triggerAttack(
        notes,
        `+${Transport.toSeconds(transportTime)}`
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
    Transport.bpm.value = bpm;
  }

  scheduleSample(sample: SampleEvent) {
    const buffer = this.soundCache.getSound(sample.id);
    if (!buffer) {
      console.log('not in cache');
      return;
    }

    const playbackRate = Transport.bpm.value / sample.originalBpm;

    let player;
    if (sample.pitchShift === 0 && playbackRate === 1) {
      player = new Player(buffer).toDestination();
    } else {
      player = new GrainPlayer({
        url: buffer,
        grainSize: playbackRate * 0.1,
      }).toDestination();

      player.detune = sample.pitchShift * 100;
      player.playbackRate = playbackRate;
    }

    player.sync().start(sample.transportTime);

    this.activePlayers.push(player);
  }

  scheduleSamplerSequence({instrument, events}: SamplerSequence) {
    events.forEach(({notes, transportTime}) => {
      this.samplers[instrument].sync().triggerAttack(notes, transportTime);
    });
  }

  async start(startTime?: string) {
    await this.startContextIfNeeded();
    this.cancelPreviews();
    Transport.start(undefined, startTime);
  }

  pause() {
    Transport.pause();
  }

  stop() {
    Transport.stop();
    this.stopAllPlayers();
  }

  cancelAllEvents() {
    this.stopAllPlayers();
    Transport.cancel();
  }

  private stopAllPlayers() {
    this.activePlayers.forEach(player => player.dispose());
    this.activePlayers = [];
    Object.values(this.samplers).forEach(sampler =>
      sampler.releaseAll().unsync()
    );
  }

  private async startContextIfNeeded() {
    if (getContext().state !== 'running') {
      return start();
    }
  }
}

export default ToneJSPlayer;
