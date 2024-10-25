import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {findParentStatementInputTypes} from '../../blockly/blockUtils';
import {DEFAULT_CHORD_LENGTH, DEFAULT_PATTERN_LENGTH} from '../../constants';
import {ChordEvent, ChordEventValue} from '../interfaces/ChordEvent';
import {Effects, EffectValue} from '../interfaces/Effects';
import {
  InstrumentEvent,
  InstrumentEventValue,
} from '../interfaces/InstrumentEvent';
import {PlaybackEvent} from '../interfaces/PlaybackEvent';
import MusicLibrary from '../MusicLibrary';

import Sequencer from './Sequencer';

const DEFAULT_START_MEASURE = 1;

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
      parentControlTypes: findParentStatementInputTypes(blockId),
      triggered: false,
      when: measure ?? DEFAULT_START_MEASURE,
      effects: {...this.effects},
    } as PlaybackEvent);
  }

  playPatternAtMeasureById(
    value: InstrumentEventValue,
    measure: number,
    blockId: string
  ) {
    const length = value.length || DEFAULT_PATTERN_LENGTH;

    const event: InstrumentEvent = {
      id: JSON.stringify(value),
      type: 'instrument',
      instrumentType: 'drums',
      length,
      blockId,
      parentControlTypes: findParentStatementInputTypes(blockId),
      triggered: false,
      when: measure ?? DEFAULT_START_MEASURE,
      value,
      effects: {...this.effects},
    };
    this.playbackEvents.push(event);
  }

  playChordAtMeasureById(
    value: ChordEventValue,
    measure: number,
    blockId: string
  ) {
    const event: ChordEvent = {
      id: JSON.stringify(value),
      type: 'chord',
      length: DEFAULT_CHORD_LENGTH,
      blockId,
      parentControlTypes: findParentStatementInputTypes(blockId),
      triggered: false,
      when: measure ?? DEFAULT_START_MEASURE,
      value,
      effects: {...this.effects},
    };
    this.playbackEvents.push(event);
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

  clear(): void {
    this.playbackEvents = [];
    this.effects = {};
  }

  getLastMeasure(): number {
    return 0;
  }
}
