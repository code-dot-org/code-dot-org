import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {DEFAULT_CHORD_LENGTH, DEFAULT_PATTERN_LENGTH} from '../../constants';
import {Effects, EffectValue} from '../interfaces/Effects';
import {PatternEventValue} from '../interfaces/PatternEvent';
import {PlaybackEvent} from '../interfaces/PlaybackEvent';
import MusicLibrary from '../MusicLibrary';

import Sequencer from './Sequencer';

/**
 * A {@link Sequencer} used in the Advanced (programming with variables) block mode.
 */
export default class AdvancedSequencer extends Sequencer {
  private playbackEvents: PlaybackEvent[];
  private effects: Effects;

  constructor(
    private readonly metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    super();
    this.playbackEvents = [];
    this.effects = {};
  }

  playSoundAtMeasureById(id: string, measure: number, blockId: string) {
    const soundData = MusicLibrary.getInstance()?.getSoundForId(id);
    if (!soundData) {
      this.metricsReporter.logWarning('Could not find sound with ID: ' + id);
      return;
    }

    this.playbackEvents.push({
      id,
      type: 'sound',
      length: soundData.length,
      soundType: soundData.type,
      blockId,
      triggered: false,
      when: measure,
      effects: {...this.effects},
    } as PlaybackEvent);
  }

  playPatternAtMeasureById(
    value: PatternEventValue,
    measure: number,
    blockId: string
  ) {
    const length = value.length || DEFAULT_PATTERN_LENGTH;

    this.playbackEvents.push({
      id: JSON.stringify(value),
      type: 'pattern',
      length: length,
      blockId,
      triggered: false,
      when: measure,
      value,
      effects: {...this.effects},
    } as PlaybackEvent);
  }

  playChordAtMeasureById(
    value: PatternEventValue,
    measure: number,
    blockId: string
  ) {
    this.playbackEvents.push({
      id: JSON.stringify(value),
      type: 'chord',
      length: DEFAULT_CHORD_LENGTH,
      blockId,
      triggered: false,
      when: measure,
      value,
      effects: {...this.effects},
    } as PlaybackEvent);
  }

  setEffect(type: keyof Effects, value: EffectValue) {
    this.effects[type] = value;
  }

  createTrack() {
    console.log('Not implemented');
  }

  addSoundsToTrack() {
    console.log('Not implemented');
  }

  addRestToTrack() {
    console.log('Not implemented');
  }

  getPlaybackEvents(): PlaybackEvent[] {
    return this.playbackEvents;
  }

  clear(preserveEvents?: boolean): void {
    if (!preserveEvents) {
      this.playbackEvents = [];
    }
    this.effects = {};
  }

  getLastMeasure(): number {
    return 0;
  }
}
