import {SoundLoadCallbacks} from '../types';
import SoundCache from './SoundCache';
import {
  Filter,
  GrainPlayer,
  PingPongDelay,
  Player,
  Sampler,
  ToneAudioNode,
  Transport,
  getContext,
  start,
} from 'tone';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {
  AudioPlayer,
  InstrumentData,
  PlayerEvent,
  SampleEvent,
  SamplerSequence,
} from './types';
import {BarsBeatsSixteenths} from 'tone/build/esm/core/type/Units';
import {Source, SourceOptions} from 'tone/build/esm/source/Source';
import {BUS_EFFECT_COMBINATIONS, DEFAULT_BPM} from '../constants';
import {Effects} from './interfaces/Effects';
import {generateEffectsKeyString} from './utils';

const EMPTY_EFFECTS_KEY = '';

/**
 * An {@link AudioPlayer} implementation using the Tone.js library.
 *
 * TODO:
 * - Effects
 * - Sample sequences
 */
class ToneJSPlayer implements AudioPlayer {
  private samplers: {[instrument: string]: {[effectsKey: string]: Sampler}};
  private activePlayers: Source<SourceOptions>[];
  private currentPreview: {
    url: string;
    player: Source<SourceOptions>;
  } | null;
  private effectBusses: {[key: string]: ToneAudioNode};
  private registeredCallbacks: {
    [event in PlayerEvent]?: ((payload?: string) => void)[];
  };
  private loadingInstruments: {[instrumentName: string]: boolean};

  constructor(
    bpm = DEFAULT_BPM,
    private readonly soundCache: SoundCache = new SoundCache(),
    private readonly metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    Transport.bpm.value = bpm;
    this.activePlayers = [];
    this.samplers = {};
    this.currentPreview = null;
    this.effectBusses = {};
    this.registeredCallbacks = {};
    this.loadingInstruments = {};
    this.generateEffectBusses();
  }

  supportsSamplers(): boolean {
    return true;
  }

  getCurrentPlaybackPosition(): number {
    return this.transportTimeToPlaybackTime(
      Transport.position as BarsBeatsSixteenths
    );
  }

  jumpToPosition(position: number) {
    Transport.position = this.playbackTimeToTransportTime(position);
  }

  setLoopEnabled(enabled: boolean) {
    Transport.loop = enabled;
  }

  setLoopStart(startPosition: number) {
    Transport.loopStart = this.playbackTimeToTransportTime(startPosition);
  }

  setLoopEnd(endPosition: number) {
    Transport.loopEnd = this.playbackTimeToTransportTime(endPosition);
  }

  async loadSounds(
    sampleUrls: string[],
    instruments: InstrumentData[],
    callbacks?: SoundLoadCallbacks
  ) {
    // Combine sound sample URLs and instrument sample URLs to load together.
    const urlsToLoad = [...sampleUrls];
    for (const {instrumentName, sampleMap} of instruments) {
      urlsToLoad.push(...Object.values(sampleMap));
      this.loadingInstruments[instrumentName] = true;
    }
    await this.soundCache.loadSounds(urlsToLoad, callbacks);

    for (const {instrumentName, sampleMap} of instruments) {
      // Instrument loads should now be instantaneous since the samples are already loaded.
      await this.loadInstrument(instrumentName, sampleMap);
    }
  }

  async loadInstrument(
    instrumentName: string,
    sampleMap: {[note: number]: string},
    callbacks?: SoundLoadCallbacks
  ) {
    if (this.samplers[instrumentName]) {
      return;
    }
    this.loadingInstruments[instrumentName] = true;
    const urls: {[note: number]: AudioBuffer} = {};
    await this.soundCache.loadSounds(Object.values(sampleMap), callbacks);
    Object.keys(sampleMap).forEach(note => {
      const buffer = this.soundCache.getSound(sampleMap[parseInt(note)]);
      if (buffer) {
        urls[parseInt(note)] = buffer;
      }
    });

    // Create a separate sampler for each set of effects
    const effectsSamplers: {[effectsKey: string]: Sampler} = {
      // Default Sampler without effects
      [EMPTY_EFFECTS_KEY]: new Sampler(urls).toDestination(),
    };
    for (const keyString of Object.keys(this.effectBusses)) {
      const sampler = new Sampler(urls);
      sampler.connect(this.effectBusses[keyString]);
      effectsSamplers[keyString] = sampler;
    }

    this.samplers[instrumentName] = effectsSamplers;
    for (const callback of this.registeredCallbacks['InstrumentLoaded'] || []) {
      callback(instrumentName);
    }
    this.loadingInstruments[instrumentName] = false;
  }

  isInstrumentLoading(instrumentName: string): boolean {
    return this.loadingInstruments[instrumentName];
  }

  isInstrumentLoaded(instrumentName: string): boolean {
    return this.samplers[instrumentName] !== undefined;
  }

  async playSampleImmediately(sample: SampleEvent, onStop?: () => void) {
    await this.startContextIfNeeded();
    if (this.currentPreview) {
      this.currentPreview.player.stop();
    }

    const buffer = await this.soundCache.loadSound(sample.sampleUrl);
    if (!buffer) {
      this.metricsReporter.logWarning(
        'Could not load sound which should have been in cache: ' +
          sample.sampleUrl
      );
      return;
    }

    const playbackRate = sample.disableTempoAdjustment
      ? 1
      : Transport.bpm.value / sample.originalBpm;

    const player = this.createPlayer(
      buffer,
      playbackRate,
      sample.pitchShift
    ).toDestination();

    player.onstop = () => {
      player.dispose();

      if (this.currentPreview?.url === sample.sampleUrl) {
        this.currentPreview = null;
      }

      onStop?.();
    };

    player.start();
    this.currentPreview = {url: sample.sampleUrl, player};
  }

  async playSamplesImmediately() {
    console.log(
      'Not supported. Use playSequenceImmediately for previewing note sequences.'
    );
  }

  async playSequenceImmediately({instrument, events}: SamplerSequence) {
    if (this.samplers[instrument] === undefined) {
      this.metricsReporter.logError(`Instrument not loaded: ${instrument}`);
      return;
    }

    await this.startContextIfNeeded();
    events.forEach(({notes, playbackPosition}) => {
      this.samplers[instrument][EMPTY_EFFECTS_KEY].triggerAttack(
        notes,
        `+${Transport.toSeconds(
          this.playbackTimeToTransportTime(playbackPosition)
        )}`,
        1
      );
    });
  }

  cancelPreviews() {
    if (this.currentPreview) {
      this.currentPreview.player.stop();
    }

    this.stopAllSamplers();
  }

  setBpm(bpm: number) {
    if (Transport.bpm.value === bpm) {
      return;
    }
    Transport.bpm.value = bpm;
    // We need to regenerate all effect busses when BPM changes as some effects (e.g. delay) are BPM-dependent.
    this.generateEffectBusses();
  }

  scheduleSample(sample: SampleEvent) {
    const buffer = this.soundCache.getSound(sample.sampleUrl);
    if (!buffer) {
      this.metricsReporter.logWarning(
        'Could not load sound which should have been in cache: ' +
          sample.sampleUrl
      );
      return;
    }

    const playbackRate = Transport.bpm.value / sample.originalBpm;
    const player = this.createPlayer(buffer, playbackRate, sample.pitchShift);

    if (sample.effects) {
      this.connectNodeToEffects(player, sample.effects);
      if (sample.effects.volume && sample.effects.volume !== 'normal') {
        player.volume.value = sample.effects.volume === 'low' ? -9 : -4;
      }
    } else {
      player.toDestination();
    }

    player
      .sync()
      .start(this.playbackTimeToTransportTime(sample.playbackPosition));

    this.activePlayers.push(player);
  }

  scheduleSamplerSequence({instrument, events, effects}: SamplerSequence) {
    if (this.samplers[instrument] === undefined) {
      this.metricsReporter.logError(`Instrument not loaded: ${instrument}`);
      return;
    }

    let velocity = 1;
    if (effects?.volume && effects?.volume !== 'normal') {
      velocity = effects.volume === 'low' ? 0.4 : 0.75;
    }

    const effectKeyString = effects
      ? generateEffectsKeyString(effects)
      : EMPTY_EFFECTS_KEY;

    events.forEach(({notes, playbackPosition}) => {
      this.samplers[instrument][effectKeyString]
        .sync()
        .triggerAttack(
          notes,
          this.playbackTimeToTransportTime(playbackPosition),
          velocity
        );
    });
  }

  async start(startPosition = 1) {
    await this.startContextIfNeeded();
    this.cancelPreviews();
    Transport.start(undefined, this.playbackTimeToTransportTime(startPosition));
  }

  pause() {
    Transport.pause();
  }

  stop() {
    Transport.cancel();
    Transport.stop();
    this.stopAllPlayers();
  }

  cancelPendingEvents() {
    this.stopAllPlayers();
    Transport.cancel();
  }

  registerCallback(
    event: PlayerEvent,
    callback: (payload?: string) => void
  ): void {
    if (!this.registeredCallbacks[event]) {
      this.registeredCallbacks[event] = [];
    }
    this.registeredCallbacks[event]?.push(callback);
  }

  private stopAllPlayers() {
    this.activePlayers.forEach(player => player.dispose());
    this.activePlayers = [];
    this.stopAllSamplers();
  }

  private async startContextIfNeeded() {
    if (getContext().state !== 'running') {
      return start();
    }
  }

  private transportTimeToPlaybackTime(
    transportTime: BarsBeatsSixteenths
  ): number {
    const [bar, beat, sixteenths] = transportTime.split(':').map(Number);
    return bar + 1 + beat / 4 + sixteenths / 16;
  }

  private playbackTimeToTransportTime(
    playbackPosition: number
  ): BarsBeatsSixteenths {
    const bar = Math.floor(playbackPosition);
    const beat = Math.floor((playbackPosition - bar) * 4);
    const sixteenths = Math.floor((playbackPosition - bar - beat / 4) * 16);
    return `${bar - 1}:${beat}:${sixteenths}`;
  }

  private createPlayer(
    buffer: AudioBuffer,
    playbackRate: number,
    pitchShift: number
  ): Source<SourceOptions> {
    if (pitchShift === 0 && playbackRate === 1) {
      return new Player(buffer);
    } else {
      const player = new GrainPlayer({
        url: buffer,
        grainSize: playbackRate * 0.1,
      });

      player.detune = pitchShift * 100;
      player.playbackRate = playbackRate;
      return player;
    }
  }

  private stopAllSamplers() {
    Object.values(this.samplers).forEach(samplerList =>
      Object.values(samplerList).forEach(sampler => sampler.releaseAll())
    );
  }

  private generateEffectBusses() {
    BUS_EFFECT_COMBINATIONS.forEach(effects => {
      const {filter, delay} = effects;
      let firstNode, lastNode;
      if (filter) {
        const filterNode = new Filter(filter === 'low' ? 800 : 3000, 'lowpass');
        firstNode = filterNode;
        lastNode = filterNode;
      }

      if (delay) {
        const delayNode = new PingPongDelay('8n', delay === 'low' ? 0.2 : 0.5);
        delayNode.wet.value = delay === 'low' ? 0.1 : 0.25;
        if (!firstNode) {
          firstNode = delayNode;
        } else {
          firstNode.connect(delayNode);
        }
        lastNode = delayNode;
      }

      if (firstNode && lastNode) {
        this.effectBusses[generateEffectsKeyString(effects)] = firstNode;
        lastNode.toDestination();
      }
    });
  }

  private connectNodeToEffects(node: ToneAudioNode, effects: Effects) {
    const key = generateEffectsKeyString(effects);
    if (this.effectBusses[key]) {
      node.connect(this.effectBusses[key]);
    } else {
      node.toDestination();
    }
  }
}

export default ToneJSPlayer;
