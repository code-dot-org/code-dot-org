import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';

import {PlaybackEvent} from '../interfaces/PlaybackEvent';
import MusicLibrary from '../MusicLibrary';

import Sequencer from './Sequencer';

/**
 * A {@link Sequencer} used in the Advanced (programming with variables) block mode.
 */
export default class AdvancedSequencer extends Sequencer {
  private playbackEvents: PlaybackEvent[];
  private handlers: any;

  constructor(
    private readonly metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    super();
    this.playbackEvents = [];
    this.handlers = [];
  }

  addEventHandler(type: string, callback: string) {
    console.log('addeventHandler', type, callback);

    const call: any =
      CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction;

    if (call) {
      const nativeCallback = call(callback);
      this.handlers[type] = nativeCallback;
    }
  }

  getHandlers() {
    return this.handlers;
  }

  playSoundAtMeasureById(
    id: string,
    measure: number,
    isBlockInsideWhenRun: boolean,
    blockId: string
  ) {
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
    } as PlaybackEvent);
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
  }

  getLastMeasure(): number {
    return 0;
  }
}
