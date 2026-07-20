/**
 * Implements a simple bridge to the player interfaces for use within the
 * generated Blockly JavaScript code.
 *
 * We need this because the current interpreter only will transform ES5 class
 * structures.
 */

import type {ExecutionInfo} from '@code-dot-org/lab/interpreter';

import type {ChordEventValue} from './player/interfaces/ChordEvent';
import type {Effects, EffectValue} from './player/interfaces/Effects';
import type {InstrumentEventValue} from './player/interfaces/InstrumentEvent';
import type Simple2Sequencer from './player/sequencer/Simple2Sequencer';

/**
 * A description of the global space of the interpreted program.
 */
export interface APIGlobals {
  executionInfo: ExecutionInfo;
  Sequencer: typeof SequencerAPI;
}

export const SequencerAPI: {
  sequencer: Simple2Sequencer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} = {
  clear(existingEventCount: number = 0) {
    this.sequencer.clear(existingEventCount);
  },
  getLastMeasure() {
    return this.sequencer.getLastMeasure();
  },
  newSequence() {
    this.sequencer.newSequence();
  },
  playSequential() {
    this.sequencer.playSequential();
  },
  endSequential() {
    this.sequencer.endSequential();
  },
  playTogether() {
    this.sequencer.playTogether();
  },
  endTogether() {
    this.sequencer.endTogether();
  },
  startFunctionContext(functionName: string, procedureId?: string) {
    this.sequencer.startFunctionContext(functionName, procedureId);
  },
  endFunctionContext() {
    this.sequencer.endFunctionContext();
  },
  startRandom(length: number, forceRandomIndex?: number) {
    this.sequencer.startRandom(length, forceRandomIndex);
  },
  nextRandom() {
    this.sequencer.nextRandom();
  },
  endRandom() {
    this.sequencer.endRandom();
  },
  setEffect(type: keyof Effects, value: EffectValue) {
    this.sequencer.setEffect(type, value);
  },
  playSound(id: string, blockId: string) {
    this.sequencer.playSound(id, blockId);
  },
  playPattern(value: InstrumentEventValue, blockId: string) {
    this.sequencer.playPattern(value, blockId);
  },
  playChord(value: ChordEventValue, blockId: string) {
    this.sequencer.playChord(value, blockId);
  },
  playTune(value: InstrumentEventValue, blockId: string) {
    this.sequencer.playTune(value, blockId);
  },
  rest(length: number) {
    this.sequencer.rest(length);
  },
} as Omit<typeof SequencerAPI, 'sequencer'> as typeof SequencerAPI;
