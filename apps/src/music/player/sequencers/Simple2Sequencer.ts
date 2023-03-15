import {Effects, EffectValue} from '../interfaces/Effects';
import {PatternEvent, PatternEventValue} from '../interfaces/PatternEvent';
import {PlaybackEvent} from '../interfaces/PlaybackEvent';
import {SkipContext} from '../interfaces/SkipContext';
import {SoundEvent} from '../interfaces/SoundEvent';
import MusicLibrary from '../MusicLibrary';
import Sequencer from './Sequencer';

const DEFAULT_PATTERN_LENGTH = require('../../constants')
  .DEFAULT_PATTERN_LENGTH;

interface StackFrame {
  measure: number;
  together: boolean;
  lastMeasures: number[];
}

interface FunctionContext {
  name: string;
  uniqueInvocationId: number;
  playbackEvents: PlaybackEvent[];
  startMeasure: number;
  endMeasure: number;
}

interface SkipFrame {
  skipSound: boolean;
  currentIndex: number;
  randomIndex: number;
}

export default class Simple2Sequencer extends Sequencer {
  private stack: StackFrame[];
  private functionStack: number[];
  private effectsStack: Effects[];
  private randomStack: SkipFrame[];

  private functionMap: {[id: string]: FunctionContext};
  private uniqueInvocationIdUpTo: number;
  private startMeasure: number;
  private inTrigger: boolean;
  private library: MusicLibrary | null;

  constructor() {
    super();
    this.stack = [];
    this.functionStack = [];
    this.effectsStack = [];
    this.randomStack = [];

    this.functionMap = {};
    this.uniqueInvocationIdUpTo = 0;
    this.startMeasure = 1;
    this.inTrigger = false;
    this.library = null;
  }

  setLibrary(library: MusicLibrary) {
    this.library = library;
  }

  reset(startMeasure = 1, inTrigger = false) {
    this.stack = [];
    this.functionStack = [];
    this.effectsStack = [];
    this.randomStack = [];

    this.functionMap = {};
    this.startMeasure = startMeasure;
    this.inTrigger = inTrigger;
  }

  // Beginning of a play_sequential block.
  playSequential() {
    this.stack.push({
      measure: this.getCurrentMeasure(),
      together: false,
      lastMeasures: []
    });
  }

  // End of a play_sequential block.
  endSequential() {
    this.endBlock(true);
  }

  // Beginning of a play_together block.
  playTogether() {
    const nextMeasure = this.getCurrentMeasure();
    this.stack.push({
      measure: nextMeasure,
      together: true,
      lastMeasures: [nextMeasure]
    });
  }

  // End of an play_together block.
  endTogether() {
    this.endBlock(false);
  }

  startFunctionContext(functionName: string) {
    const uniqueId = this.getUniqueInvocationId();

    this.functionMap[uniqueId] = {
      name: functionName,
      uniqueInvocationId: uniqueId,
      startMeasure: this.getCurrentMeasure(),
      endMeasure: this.getCurrentMeasure(),
      playbackEvents: []
    };

    this.functionStack.push(uniqueId);

    const currentEffects = this.getCurrentEffects();
    if (currentEffects !== null) {
      this.effectsStack.push({...currentEffects});
    }
  }

  endFunctionContext() {
    const lastFunctionId = this.functionStack.pop();
    if (lastFunctionId !== undefined) {
      this.functionMap[lastFunctionId].endMeasure = this.getCurrentMeasure();
    }

    this.effectsStack.pop();
  }

  startRandom(length: number, forceRandomIndex?: number) {
    this.randomStack.push({
      skipSound: this.getCurrentSkipContext().skipSound,
      currentIndex: 0,
      randomIndex:
        forceRandomIndex !== undefined
          ? forceRandomIndex
          : Math.floor(Math.random() * length)
    });
  }

  // Move to the next child of a play_random block.
  nextRandom() {
    if (this.randomStack.length === 0) {
      // weird, warn
      return;
    }
    const currentEntry = this.randomStack[this.randomStack.length - 1];
    currentEntry.currentIndex++;
  }

  endRandom() {
    this.randomStack.pop();
  }

  setEffect(type: keyof Effects, value: EffectValue) {
    const currentEffects = this.getCurrentEffects();
    if (currentEffects === null) {
      this.effectsStack.push({
        [type]: value
      });
    } else {
      currentEffects[type] = value;
    }
  }

  playSound(id: string) {
    const currentFunctionId = this.getCurrentFunctionId();
    if (currentFunctionId === null) {
      // weird, warn?
      return;
    }

    const currentFunction = this.functionMap[currentFunctionId];
    const soundData = this.library && this.library.getSoundForId(id);
    const soundEvent: SoundEvent = {
      id,
      type: 'sound',
      triggered: this.inTrigger,
      when: this.getCurrentMeasure(),
      effects: {...this.getCurrentEffects()} || undefined,
      skipContext: this.getCurrentSkipContext(),
      length: this.getLengthForId(id),
      soundType: (soundData && soundData.type) || undefined
    };

    currentFunction.playbackEvents.push(soundEvent);

    this.updateMeasureForPlayByLength(soundEvent.length);
    currentFunction.endMeasure = this.getCurrentMeasure();
  }

  playPattern(value: PatternEventValue) {
    const currentFunctionId = this.getCurrentFunctionId();
    if (currentFunctionId === null) {
      // weird, warn?
      return;
    }
    const currentFunction = this.functionMap[currentFunctionId];

    const patternEvent: PatternEvent = {
      type: 'pattern',
      value,
      triggered: this.inTrigger,
      when: this.getCurrentMeasure(),
      effects: {...this.getCurrentEffects()} || undefined,
      skipContext: this.getCurrentSkipContext(),
      length: DEFAULT_PATTERN_LENGTH
    };

    currentFunction.playbackEvents.push(patternEvent);
    this.updateMeasureForPlayByLength(DEFAULT_PATTERN_LENGTH);
    currentFunction.endMeasure = this.getCurrentMeasure();
  }

  rest(length: number) {
    this.updateMeasureForPlayByLength(length);
  }

  // Will be used to render timeline
  getOrderedFunctions(): FunctionContext[] {
    return Object.keys(this.functionMap)
      .sort()
      .map(id => this.functionMap[id]);
  }

  getPlaybackEvents(): PlaybackEvent[] {
    // Currently the Timeline still expects a list of PlaybackEvents, each with a reference
    // to their parent FunctionContext. Reconstructing that model here.
    // Going forward, the Timeline could instead render using getOrderedFunctions(), and not have
    // to reconstruct the function mapping itself.

    const events: PlaybackEvent[] = [];
    for (const context of this.getOrderedFunctions()) {
      const functionEvents = [...context.playbackEvents];
      for (const functionEvent of functionEvents) {
        functionEvent.functionContext = {
          name: context.name,
          uniqueInvocationId: context.uniqueInvocationId
        };
      }
      events.push(...functionEvents);
    }

    return events;
  }

  // Internal helper to get the entry at the top of the stack, or null
  // if the stack is empty.
  private getCurrentStackEntry(): StackFrame | null {
    if (this.stack.length > 0) {
      return this.stack[this.stack.length - 1];
    } else {
      return null;
    }
  }

  private getCurrentMeasure(): number {
    const currentEntry = this.getCurrentStackEntry();
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
          currentEntry.randomIndex !== currentEntry.currentIndex
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
    const currentStackEntry = this.getCurrentStackEntry();
    if (currentStackEntry === null) {
      // warning - unexpeected
      return;
    }

    const nextMeasure = isSequential
      ? currentStackEntry.measure
      : Math.max(...currentStackEntry.lastMeasures);

    // We are returning to the previous stack frame.
    this.stack.pop();

    const nextStackEntry = this.getCurrentStackEntry();

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
    const currentStackEntry = this.getCurrentStackEntry();
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

  private getLengthForId(id: string): number {
    if (this.library === null) {
      return 0;
    }

    const soundData = this.library.getSoundForId(id);
    return soundData ? soundData.length : 0;
  }
}
