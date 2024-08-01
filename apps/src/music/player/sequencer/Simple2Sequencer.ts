import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {
  DEFAULT_CHORD_LENGTH,
  DEFAULT_PATTERN_LENGTH,
  DEFAULT_TUNE_LENGTH,
} from '../../constants';
import {ChordEvent, ChordEventValue} from '../interfaces/ChordEvent';
import {Effects, EffectValue} from '../interfaces/Effects';
import {FunctionEvents} from '../interfaces/FunctionEvents';
import {PatternEvent, PatternEventValue} from '../interfaces/PatternEvent';
import {PlaybackEvent} from '../interfaces/PlaybackEvent';
import {SkipContext} from '../interfaces/SkipContext';
import {SoundEvent} from '../interfaces/SoundEvent';
import {TuneEvent, TuneEventValue} from '../interfaces/TuneEvent';
import MusicLibrary from '../MusicLibrary';

import Sequencer from './Sequencer';

interface SequenceFrame {
  measure: number;
  together: boolean;
  lastMeasures: number[];
}

interface SkipFrame {
  skipSound: boolean;
  currentIndex: number;
  randomIndex: number;
}

/**
 * A {@link Sequencer} used in the Simple2 (functions) block mode.
 */
export default class Simple2Sequencer extends Sequencer {
  private sequenceStack: SequenceFrame[];
  private functionStack: number[];
  private effectsStack: Effects[];
  private randomStack: SkipFrame[];

  private functionMap: {[id: string]: FunctionEvents};
  private uniqueInvocationIdUpTo: number;
  private startMeasure: number;
  private inTrigger: boolean;

  constructor(
    private readonly metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    super();
    this.sequenceStack = [];
    this.functionStack = [];
    this.effectsStack = [];
    this.randomStack = [];

    this.functionMap = {};
    this.uniqueInvocationIdUpTo = 0;
    this.startMeasure = 1;
    this.inTrigger = false;
  }

  /**
   * Resets to the default new sequence and clears all sequenced events
   */
  clear() {
    this.newSequence();
    this.functionMap = {};
  }

  getLastMeasure(): number {
    return this.getCurrentMeasure();
  }

  /**
   * Set up for a new sequence with a new set of blocks (e.g. at the start
   * of a trigger or when_run block)
   * @param startMeasure measure to start the sequence
   * @param inTrigger if the sequence is occurring in a trigger block
   */
  newSequence(startMeasure = 1, inTrigger = false) {
    this.resetStacks();

    this.startMeasure = startMeasure;
    this.inTrigger = inTrigger;
  }

  // Beginning of a play_sequential block.
  playSequential() {
    this.sequenceStack.push({
      measure: this.getCurrentMeasure(),
      together: false,
      lastMeasures: [],
    });
  }

  // End of a play_sequential block.
  endSequential() {
    this.endBlock(true);
  }

  // Beginning of a play_together block.
  playTogether() {
    const nextMeasure = this.getCurrentMeasure();
    this.sequenceStack.push({
      measure: nextMeasure,
      together: true,
      lastMeasures: [nextMeasure],
    });
  }

  // End of an play_together block.
  endTogether() {
    this.endBlock(false);
  }

  /**
   * Starts a new function context.
   */
  startFunctionContext(functionName: string) {
    const uniqueId = this.getUniqueInvocationId();

    this.functionMap[uniqueId] = {
      name: functionName,
      uniqueInvocationId: uniqueId,
      startMeasure: this.getCurrentMeasure(),
      endMeasure: this.getCurrentMeasure(),
      playbackEvents: [],
      calledFunctionIds: [],
    };

    this.functionStack.push(uniqueId);

    const currentEffects = this.getCurrentEffects();
    if (currentEffects !== null) {
      this.effectsStack.push({...currentEffects});
    }
  }

  /**
   * Ends the current function context.
   */
  endFunctionContext() {
    const lastFunctionId = this.functionStack.pop();
    if (lastFunctionId !== undefined) {
      this.functionMap[lastFunctionId].endMeasure = this.getCurrentMeasure();

      if (this.functionStack.length > 0) {
        // Add the called function to the list of functions that its caller called.
        this.functionMap[
          this.functionStack[this.functionStack.length - 1]
        ].calledFunctionIds.push(lastFunctionId);
      }
    }

    this.effectsStack.pop();
  }

  /**
   * Start of a random block; the sequencer will randomly choose a sound from
   * within this block to be played.
   *
   * @param length
   * @param forceRandomIndex
   */
  startRandom(length: number, forceRandomIndex?: number) {
    this.randomStack.push({
      skipSound: this.getCurrentSkipContext().skipSound,
      currentIndex: 0,
      randomIndex:
        forceRandomIndex !== undefined
          ? forceRandomIndex
          : Math.floor(Math.random() * length),
    });
  }

  // Move to the next child of a play_random block.
  nextRandom() {
    if (this.randomStack.length === 0) {
      this.metricsReporter.logWarning(
        'Invalid state; tried to call nextRandom() without active random context'
      );
      return;
    }
    const currentEntry = this.randomStack[this.randomStack.length - 1];
    currentEntry.currentIndex++;
  }

  /**
   * Ends the current random block.
   */
  endRandom() {
    this.randomStack.pop();
  }

  setEffect(type: keyof Effects, value: EffectValue) {
    const currentEffects = this.getCurrentEffects();
    if (currentEffects === null) {
      this.effectsStack.push({
        [type]: value,
      });
    } else {
      currentEffects[type] = value;
    }
  }

  /**
   * Play a sound at the current location.
   */
  playSound(id: string, blockId: string) {
    const soundData = MusicLibrary.getInstance()?.getSoundForId(id);
    if (!soundData) {
      this.metricsReporter.logWarning('Could not find sound with ID: ' + id);
      return;
    }

    this.addNewEvent<SoundEvent>({
      id,
      type: 'sound',
      length: soundData.length,
      soundType: soundData.type,
      blockId,
      ...this.getCommonEventFields(),
    });
  }

  /**
   * Play a pattern event at the current location.
   */
  playPattern(value: PatternEventValue, blockId: string) {
    this.addNewEvent<PatternEvent>({
      type: 'pattern',
      id: JSON.stringify(value),
      value,
      blockId,
      length: DEFAULT_PATTERN_LENGTH,
      ...this.getCommonEventFields(),
    });
  }

  /**
   * Play a chord event at the current location.
   */
  playChord(value: ChordEventValue, blockId: string) {
    this.addNewEvent<ChordEvent>({
      type: 'chord',
      id: JSON.stringify(value),
      value,
      length: DEFAULT_CHORD_LENGTH,
      blockId,
      ...this.getCommonEventFields(),
    });
  }

  /**
   * Play a tune event at the current location.
   */
  playTune(value: TuneEventValue, blockId: string) {
    this.addNewEvent<TuneEvent>({
      type: 'tune',
      id: JSON.stringify(value),
      value,
      length: DEFAULT_TUNE_LENGTH,
      blockId,
      ...this.getCommonEventFields(),
    });
  }

  rest(length: number) {
    this.updateMeasureForPlayByLength(length);
  }

  // Can be used to render timeline
  getOrderedFunctions(): FunctionEvents[] {
    return Object.keys(this.functionMap)
      .sort()
      .map(id => this.functionMap[id]);
  }

  getPlaybackEvents(): PlaybackEvent[] {
    // Currently the Timeline still expects a list of PlaybackEvents, each with a reference
    // to their parent FunctionContext. We are reconstructing that model here.
    // Going forward, the Timeline could instead render using getOrderedFunctions(), and not have
    // to reconstruct the function mapping itself.
    return this.getOrderedFunctions()
      .map(functionEvent => {
        return functionEvent.playbackEvents.map(playbackEvent => {
          return {
            ...playbackEvent,
            functionContext: {
              name: functionEvent.name,
              uniqueInvocationId: functionEvent.uniqueInvocationId,
            },
          };
        });
      })
      .flat();
  }

  private getCommonEventFields() {
    const effects = this.getCurrentEffects();
    return {
      triggered: this.inTrigger,
      when: this.getCurrentMeasure(),
      // Snapshot the current value of effects
      effects: effects ? {...effects} : undefined,
      skipContext: this.getCurrentSkipContext(),
    };
  }

  private addNewEvent<T extends PlaybackEvent>(event: T) {
    const currentFunctionId = this.getCurrentFunctionId();
    if (currentFunctionId === null) {
      this.metricsReporter.logWarning('Invalid state: no current function ID');
      return;
    }
    const currentFunction = this.functionMap[currentFunctionId];

    currentFunction.playbackEvents.push(event);
    this.updateMeasureForPlayByLength(event.length);
  }

  // Internal helper to get the entry at the top of the stack, or null
  // if the stack is empty.
  private getCurrentSequenceFrame(): SequenceFrame | null {
    if (this.sequenceStack.length > 0) {
      return this.sequenceStack[this.sequenceStack.length - 1];
    } else {
      return null;
    }
  }

  private getCurrentMeasure(): number {
    const currentEntry = this.getCurrentSequenceFrame();
    if (currentEntry === null) {
      return this.startMeasure;
    }

    return currentEntry.measure;
  }

  private getCurrentFunctionId(): number | null {
    if (this.functionStack.length > 0) {
      return this.functionStack[this.functionStack.length - 1];
    }
    return null;
  }

  // Gets the current context for playing a sound, specifically whether
  // we are somewhere inside any play_random block, and whether we should
  // play this specific sound.
  private getCurrentSkipContext(): SkipContext {
    if (this.randomStack.length > 0) {
      const currentEntry = this.randomStack[this.randomStack.length - 1];
      return {
        insideRandom: true,
        skipSound:
          currentEntry.skipSound ||
          currentEntry.randomIndex !== currentEntry.currentIndex,
      };
    } else {
      return {insideRandom: false, skipSound: false};
    }
  }

  private getCurrentEffects(): Effects | null {
    if (this.effectsStack.length > 0) {
      return this.effectsStack[this.effectsStack.length - 1];
    }
    return null;
  }

  // Internal function for the end of a play_sequential or play_together block.
  private endBlock(isSequential: boolean) {
    const currentStackEntry = this.getCurrentSequenceFrame();
    if (currentStackEntry === null) {
      // warning - unexpeected
      return;
    }

    const nextMeasure = isSequential
      ? currentStackEntry.measure
      : Math.max(...currentStackEntry.lastMeasures);

    // We are returning to the previous stack frame.
    this.sequenceStack.pop();

    const nextStackEntry = this.getCurrentSequenceFrame();

    if (nextStackEntry) {
      // Now the frame we are returning to has to absorb this information.
      if (nextStackEntry.together) {
        nextStackEntry.lastMeasures.push(nextMeasure);
      } else {
        nextStackEntry.measure = nextMeasure;
      }
    }
  }

  private updateMeasureForPlayByLength(length: number) {
    const currentStackEntry = this.getCurrentSequenceFrame();
    if (currentStackEntry === null) {
      return;
    }

    if (currentStackEntry.together) {
      currentStackEntry.lastMeasures.push(currentStackEntry.measure + length);
    } else {
      currentStackEntry.measure += length;
    }
  }

  private getUniqueInvocationId(): number {
    return this.uniqueInvocationIdUpTo++;
  }

  private resetStacks() {
    this.sequenceStack = [];
    this.functionStack = [];
    this.effectsStack = [];
    this.randomStack = [];
  }
}
