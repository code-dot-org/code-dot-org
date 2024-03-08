import {DEFAULT_BEATS_PER_MEASURE, DEFAULT_BPM} from '../constants';
import {SoundLoadCallbacks} from '../types';
import SamplePlayer from './SamplePlayer';
import {AudioPlayer, SampleEvent} from './types';

/**
 * An {@link AudioPlayer} implementation that wraps the {@link SamplePlayer}.
 */
class SamplePlayerWrapper implements AudioPlayer {
  constructor(
    private readonly samplePlayer: SamplePlayer,
    private bpm = DEFAULT_BPM,
    private beatsPerMeasure = DEFAULT_BEATS_PER_MEASURE,
    private samplesToPlay: SampleEvent[] = []
  ) {}

  supportsSamplers(): boolean {
    return false;
  }

  setBpm(bpm: number) {
    this.samplePlayer.setBpm(bpm);
    this.bpm = bpm;
  }

  getCurrentPlaybackPosition(): number {
    const elapsedTime = this.samplePlayer.getElapsedPlaybackTimeSeconds();
    if (elapsedTime === -1) {
      return 0;
    }
    return this.convertSecondsToPlayheadPosition(elapsedTime);
  }

  async loadSounds(
    sampleUrls: string[],
    callbacks?: SoundLoadCallbacks
  ): Promise<void> {
    return this.samplePlayer.loadSounds(sampleUrls, callbacks);
  }

  async loadInstrument(): Promise<void> {
    console.log('Not supported');
  }

  isInstrumentLoaded(): boolean {
    return false;
  }

  async playSampleImmediately(
    sample: SampleEvent,
    onStop?: () => void
  ): Promise<void> {
    return this.samplePlayer.previewSample(sample.sampleUrl, onStop);
  }

  async playSamplesImmediately(
    samples: SampleEvent[],
    onStop?: () => void
  ): Promise<void> {
    return this.samplePlayer.previewSamples(
      samples.map(sample => this.getSampleWithOffset(sample)),
      onStop
    );
  }

  async playSequenceImmediately(): Promise<void> {
    console.log('Not supported');
  }

  cancelPreviews(): void {
    this.samplePlayer.cancelPreviews();
  }

  scheduleSample(sample: SampleEvent): void {
    if (this.samplePlayer.playing()) {
      this.samplePlayer.playSamples([this.getSampleWithOffset(sample)]);
    } else {
      this.samplesToPlay.push(sample);
    }
  }

  scheduleSamplerSequence(): void {
    console.log('Not supported');
  }

  async start(startPosition = 1) {
    this.samplePlayer.startPlayback(
      this.samplesToPlay.map(sample => this.getSampleWithOffset(sample)),
      this.convertPlayheadPositionToSeconds(startPosition)
    );

    this.samplesToPlay = [];
  }

  stop() {
    this.samplePlayer.stopPlayback();
  }

  cancelPendingEvents(): void {
    this.samplePlayer.stopAllSamplesStillToPlay();
  }

  // Converts actual seconds used by the audio system into a playhead
  // position, which is 1-based and scaled to measures.
  private convertSecondsToPlayheadPosition(seconds: number): number {
    return 1 + seconds / this.secondsPerMeasure();
  }

  // Converts a playhead position, which is 1-based and scaled to measures,
  // into actual seconds used by the audio system.
  private convertPlayheadPositionToSeconds(playheadPosition: number): number {
    return this.secondsPerMeasure() * (playheadPosition - 1);
  }

  private secondsPerMeasure() {
    return (60 / this.bpm) * this.beatsPerMeasure;
  }

  private getSampleWithOffset(sample: SampleEvent) {
    return {
      ...sample,
      offsetSeconds: this.convertPlayheadPositionToSeconds(
        sample.playbackPosition
      ),
    };
  }
}

export default SamplePlayerWrapper;
