/* eslint-disable import/order */
import {SoundLoadCallbacks} from '../types';
import SoundCache from './SoundCache';
import {GrainPlayer, Player, Sampler, Transport, getContext, start} from 'tone';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {AudioPlayer, SampleEvent, SamplerSequence} from './types';
import {BarsBeatsSixteenths} from 'tone/build/esm/core/type/Units';
import {Source, SourceOptions} from 'tone/build/esm/source/Source';
import {DEFAULT_BPM} from '../constants';

/**
 * An {@link AudioPlayer} implementation using the Tone.js library.
 *
 * TODO:
 * - Effects
 * - Sample sequences
 */
class ToneJSPlayer implements AudioPlayer {
  private samplers: {[instrument: string]: Sampler};
  private activePlayers: Source<SourceOptions>[];
  private currentPreview: {
    url: string;
    player: Source<SourceOptions>;
  } | null;

  constructor(
    bpm = DEFAULT_BPM,
    private readonly soundCache: SoundCache = new SoundCache(),
    private readonly metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    Transport.bpm.value = bpm;
    this.activePlayers = [];
    this.samplers = {};
    this.currentPreview = null;
  }

  supportsSamplers(): boolean {
    return true;
  }

  getCurrentPlaybackPosition(): number {
    return this.transportTimeToPlaybackTime(
      Transport.position as BarsBeatsSixteenths
    );
  }

  goToPosition(position: number) {
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

  async loadSounds(sampleUrls: string[], callbacks?: SoundLoadCallbacks) {
    return this.soundCache.loadSounds(sampleUrls, callbacks);
  }

  async loadInstrument(
    instrumentName: string,
    sampleMap: {[note: number]: string},
    callbacks?: SoundLoadCallbacks
  ) {
    if (this.samplers[instrumentName]) {
      return;
    }
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

    const playbackRate = Transport.bpm.value / sample.originalBpm;
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
      this.samplers[instrument].triggerAttack(
        notes,
        `+${Transport.toSeconds(
          this.playbackTimeToTransportTime(playbackPosition)
        )}`
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
    const buffer = this.soundCache.getSound(sample.sampleUrl);
    if (!buffer) {
      this.metricsReporter.logWarning(
        'Could not load sound which should have been in cache: ' +
          sample.sampleUrl
      );
      return;
    }

    const playbackRate = Transport.bpm.value / sample.originalBpm;
    const player = this.createPlayer(buffer, playbackRate, sample.pitchShift)
      .toDestination()
      .sync()
      .start(this.playbackTimeToTransportTime(sample.playbackPosition));

    this.activePlayers.push(player);
  }

  scheduleSamplerSequence({instrument, events}: SamplerSequence) {
    if (this.samplers[instrument] === undefined) {
      this.metricsReporter.logError(`Instrument not loaded: ${instrument}`);
      return;
    }

    events.forEach(({notes, playbackPosition}) => {
      this.samplers[instrument]
        .sync()
        .triggerAttack(
          notes,
          this.playbackTimeToTransportTime(playbackPosition)
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
    Transport.stop();
    this.stopAllPlayers();
  }

  cancelPendingEvents() {
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
      return new Player(buffer).toDestination();
    } else {
      const player = new GrainPlayer({
        url: buffer,
        grainSize: playbackRate * 0.1,
      }).toDestination();

      player.detune = pitchShift * 100;
      player.playbackRate = playbackRate;
      return player;
    }
  }
}

export default ToneJSPlayer;
