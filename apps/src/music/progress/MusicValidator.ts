// Music Lab specific validations.

import ConditionsChecker from '@cdo/apps/lab2/progress/ConditionsChecker';
import {
  ValidationResult,
  Validator,
} from '@cdo/apps/lab2/progress/ProgressManager';
import {Condition, ConditionType} from '@cdo/apps/lab2/types';

import {
  BlockTypes,
  FunctionDefinitionBlockTypes,
  LoopBlockTypes,
} from '../blockly/blockTypes';
import {PATTERN_AI_NUM_SEED_EVENTS, Triggers} from '../constants';
import {isChordEvent} from '../player/interfaces/ChordEvent';
import {isInstrumentEvent} from '../player/interfaces/InstrumentEvent';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {PlayingTrigger} from '../player/interfaces/PlayingTrigger';
import {isSoundEvent, SoundEvent} from '../player/interfaces/SoundEvent';
import MusicPlayer from '../player/MusicPlayer';
import {ExemplarValidationMode} from '../types';

import {MusicConditions} from './MusicConditions';

export interface ConditionNames {
  [key: string]: ConditionType;
}

export default class MusicValidator extends Validator {
  constructor(
    private readonly getIsPlaying: () => boolean,
    private readonly getPlaybackEvents: () => PlaybackEvent[],
    private readonly getExemplarPlaybackEvents: () => PlaybackEvent[],
    private readonly getValidationTimeout: () => number,
    private readonly player: MusicPlayer,
    private readonly getPlayingTriggers: () => PlayingTrigger[],
    private readonly getExemplarValidationMode: () => ExemplarValidationMode,
    private readonly conditionsChecker: ConditionsChecker = new ConditionsChecker(
      Object.values(MusicConditions).map(condition => condition.name)
    )
  ) {
    super();
  }

  didPassExemplarValidation(): boolean {
    return this.validatePlaybackEventsEquivalent();
  }

  shouldCheckConditions() {
    return this.getIsPlaying();
  }

  shouldCheckNextConditionsOnly() {
    return (
      this.player.getCurrentPlayheadPosition() < this.getValidationTimeout()
    );
  }

  checkConditions() {
    // Get number of sounds currently playing simultaneously.
    let currentNumberSounds = 0;

    // Get number of different sounds currently playing simultaneously.
    let currentNumberDifferentSoundsTogether = 0;

    // Get number of sounds that have been started.
    let playedNumberSounds = 0;

    // Get number of different sounds that have been started.
    let playedNumberDifferentSounds = 0;

    // A list of unique invocated ids associated with played trigger sounds.
    const playedTriggerSoundUniqueInvocationIds: number[] = [];

    // A map of ids for blocks in functions and the count of playback events associated with them.
    const blockIdFunctionRepetitions: {[key: string]: number} = {};

    // A map of ids for blocks in loops and the count of playback events associated with them.
    const blockIdLoopRepetitions: {[key: string]: number} = {};

    // A map of ids for blocks in nested loops and the count of playback events associated with them.
    const blockIdNestedLoopRepetitions: {[key: string]: number} = {};

    // A map of sound types and the count of playback events associated with them.
    const soundTypeRepetitions: {[key: string]: number} = {};

    // Get number of patterns that have been started, separately counting those
    // that are empty and those with events.
    let playedNumberEmptyPatterns = 0;
    let playedNumberPatterns = 0;

    // And the same for patterns made with AI.
    let playedNumberEmptyPatternsAi = 0;
    let playedNumberPatternsAi = 0;
    let playedNumberGeneratedPatternsAi = 0;

    // Get number of chords that have been started, separately counting those
    // that are empty and those with notes.
    let playedNumberEmptyChords = 0;
    let playedNumberChords = 0;

    // This is a list of unique sound IDs that have been played.
    const uniqueSounds: string[] = [];

    // This is a list of unique sound IDs that are currently playing.
    const uniqueCurrentSounds: string[] = [];

    // This is a list of unique function contexts that have been used to play sounds.
    const uniqueFunctionContexts: string[] = [];

    // This is a list of unique sound lengths that have been played.
    const uniqueSoundLengths: number[] = [];

    const currentPlayheadPosition = this.player.getCurrentPlayheadPosition();
    this.getPlaybackEvents().forEach(eventData => {
      // Skip events that we haven't gotten to yet.
      if (eventData.when > currentPlayheadPosition) {
        return;
      }

      const blockId = eventData.blockId;
      const length = eventData.length;

      if (isSoundEvent(eventData)) {
        if (eventData.when + length > currentPlayheadPosition) {
          currentNumberSounds++;

          if (!uniqueCurrentSounds.includes(eventData.id)) {
            currentNumberDifferentSoundsTogether++;
            uniqueCurrentSounds.push(eventData.id);
          }

          // Simple2 only
          if (eventData.triggered) {
            this.conditionsChecker.addSatisfiedCondition({
              name: MusicConditions.PLAYED_SOUND_TRIGGERED.name,
            });
          }

          if (eventData.functionContext) {
            if (
              // Exclude 'when run' and trigger contexts.
              eventData.functionContext.name !== 'when_run' &&
              !Triggers.map(trigger => trigger.id).includes(
                eventData.functionContext.name
              )
            ) {
              this.conditionsChecker.addSatisfiedCondition({
                name: MusicConditions.PLAYED_SOUND_IN_ANY_FUNCTION.name,
              });
            }
            this.conditionsChecker.addSatisfiedCondition({
              name: MusicConditions.PLAYED_SOUND_IN_FUNCTION.name,
              value: eventData.functionContext.name,
            });
            this.conditionsChecker.addSatisfiedCondition({
              name: MusicConditions.PLAYED_SOUND_IN_FUNCTION.name,
              value: eventData.functionContext.procedureID,
            });
          }

          this.conditionsChecker.addSatisfiedCondition({
            name: MusicConditions.PLAYED_SOUND_ID.name,
            value: eventData.id,
          });

          this.conditionsChecker.addSatisfiedCondition({
            name: MusicConditions.PLAYED_SOUND_TYPE.name,
            value: eventData.soundType,
          });
        }

        playedNumberSounds++;
        if (!uniqueSoundLengths.includes(eventData.length)) {
          uniqueSoundLengths.push(eventData.length);
          this.conditionsChecker.addSatisfiedCondition({
            name: MusicConditions.PLAYED_DIFFERENT_LENGTH_SOUNDS.name,
            value: uniqueSoundLengths.length,
          });
        }
        if (
          eventData.functionContext &&
          !uniqueFunctionContexts.includes(eventData.functionContext.name)
        ) {
          uniqueFunctionContexts.push(eventData.functionContext.name);
          this.conditionsChecker.addSatisfiedCondition({
            name: MusicConditions.PLAYED_SOUNDS_IN_DIFFERENT_FUNCTIONS.name,
            value: uniqueFunctionContexts.length,
          });
        }
        // In order to check that the user has pressed the beat map buttons multiple times,
        // we look at the unique invocation id. (Simple2 only)
        if (eventData.triggered) {
          const invocationId = eventData.functionContext?.uniqueInvocationId;
          if (
            invocationId &&
            !playedTriggerSoundUniqueInvocationIds.includes(invocationId)
          ) {
            playedTriggerSoundUniqueInvocationIds.push(invocationId);
          }
        }

        if (!uniqueSounds.includes(eventData.id)) {
          playedNumberDifferentSounds++;
          if (soundTypeRepetitions[eventData.soundType]) {
            soundTypeRepetitions[eventData.soundType]++;
          } else {
            soundTypeRepetitions[eventData.soundType] = 1;
          }
          this.conditionsChecker.addSatisfiedCondition({
            name: MusicConditions.PLAYED_SOUND_TYPE_MULTIPLE_TIMES.name,
            value: `${eventData.soundType}:${
              soundTypeRepetitions[eventData.soundType]
            }`,
          });
          uniqueSounds.push(eventData.id);
        }
      } else if (
        isInstrumentEvent(eventData) &&
        eventData.instrumentType === 'drums'
      ) {
        if (eventData.value.events.length === 0) {
          if (eventData.value.ai) {
            playedNumberEmptyPatternsAi++;
          } else {
            playedNumberEmptyPatterns++;
          }
        } else {
          if (eventData.value.ai) {
            playedNumberPatternsAi++;

            if (
              eventData.value.events.some(
                event => event.tick > PATTERN_AI_NUM_SEED_EVENTS
              )
            ) {
              playedNumberGeneratedPatternsAi++;
            }
          } else {
            playedNumberPatterns++;
          }
        }
      } else if (isChordEvent(eventData)) {
        if (eventData.value.notes.length === 0) {
          playedNumberEmptyChords++;
        } else {
          playedNumberChords++;
        }
      }

      if (eventData.effects) {
        this.conditionsChecker.addSatisfiedCondition({
          name: MusicConditions.USED_EFFECT.name,
        });
        const effectValues = Object.values(eventData.effects);
        if (effectValues.includes('low') || effectValues.includes('medium')) {
          this.conditionsChecker.addSatisfiedCondition({
            name: MusicConditions.USED_EFFECT_NON_DEFAULT.name,
          });
        }
      }
      const validationInfo = eventData.validationInfo;
      if (validationInfo) {
        // Check for a block nested within an if/else block causing something to play.
        if (validationInfo.parentControlTypes?.includes(BlockTypes.IF_ELSE)) {
          this.conditionsChecker.addSatisfiedCondition({
            name: MusicConditions.PLAYED_ANYTHING_IN_CONDITIONAL.name,
          });
        }

        // Check for a block nested within a function block causing something to play.
        if (
          validationInfo.parentControlTypes?.some(type =>
            FunctionDefinitionBlockTypes.includes(type)
          )
        ) {
          if (!blockIdFunctionRepetitions[blockId]) {
            blockIdFunctionRepetitions[blockId] = 1;
          } else {
            blockIdFunctionRepetitions[blockId]++;
          }
          this.addPlayedConditions(
            MusicConditions.PLAYED_ANYTHING_IN_SAME_FUNCTION.name,
            Math.max(...Object.values(blockIdFunctionRepetitions))
          );
        }

        // Check for a block nested within a loop block causing something to play.
        if (
          validationInfo.parentControlTypes?.some(type =>
            LoopBlockTypes.includes(type)
          )
        ) {
          if (!blockIdLoopRepetitions[blockId]) {
            blockIdLoopRepetitions[blockId] = 1;
          } else {
            blockIdLoopRepetitions[blockId]++;
          }
          this.addPlayedConditions(
            MusicConditions.PLAYED_ANYTHING_IN_SAME_LOOP.name,
            Math.max(...Object.values(blockIdLoopRepetitions))
          );
        }

        // Check for a block within a nested loop block causing something to play.
        if (
          validationInfo.parentControlTypes?.filter(type =>
            LoopBlockTypes.includes(type)
          ).length >= 2
        ) {
          if (!blockIdNestedLoopRepetitions[blockId]) {
            blockIdNestedLoopRepetitions[blockId] = 1;
          } else {
            blockIdNestedLoopRepetitions[blockId]++;
          }
          this.addPlayedConditions(
            MusicConditions.PLAYED_ANYTHING_IN_SAME_NESTED_LOOP.name,
            Math.max(...Object.values(blockIdNestedLoopRepetitions))
          );
        }
      }
    });

    this.checkConditionPlayedDifferentSoundsTogetherMultipleTimes(
      currentPlayheadPosition
    );

    // Check for up to a certain number of sounds playing simultaneously.
    // Note that if, for example, 3 sounds are playing, then we'll consider
    // that 2 sounds and 1 sound have also been played together.
    for (
      let numberSounds = currentNumberSounds;
      numberSounds >= 1;
      numberSounds--
    ) {
      this.conditionsChecker.addSatisfiedCondition({
        name: MusicConditions.PLAYED_SOUNDS_TOGETHER.name,
        value: numberSounds,
      });
    }

    // Check for up to a certain number of different sounds playing simultaneously.
    // Note that if, for example, 3 different sounds are playing, then we'll consider
    // that 2 different sounds and 1 different sound have also been played together.
    for (
      let numberDifferentSounds = currentNumberDifferentSoundsTogether;
      numberDifferentSounds >= 1;
      numberDifferentSounds--
    ) {
      this.conditionsChecker.addSatisfiedCondition({
        name: MusicConditions.PLAYED_DIFFERENT_SOUNDS_TOGETHER.name,
        value: numberDifferentSounds,
      });
    }

    // Add satisfied conditions for the played sounds.
    this.addPlayedConditions(
      MusicConditions.PLAYED_SOUNDS.name,
      playedNumberSounds
    );

    // Add satisfied conditions for the played different sounds.
    this.addPlayedConditions(
      MusicConditions.PLAYED_DIFFERENT_SOUNDS.name,
      playedNumberDifferentSounds
    );

    this.addPlayedConditions(
      MusicConditions.PLAYED_SOUND_TRIGGERED_MULTIPLE_TIMES.name,
      playedTriggerSoundUniqueInvocationIds.length
    );

    // Add satisfied conditions for the played patterns.
    this.addPlayedConditions(
      MusicConditions.PLAYED_EMPTY_PATTERNS.name,
      playedNumberEmptyPatterns
    );
    this.addPlayedConditions(
      MusicConditions.PLAYED_PATTERNS.name,
      playedNumberPatterns
    );

    // And the same for patterns made with AI.
    this.addPlayedConditions(
      MusicConditions.PLAYED_EMPTY_PATTERNS_AI.name,
      playedNumberEmptyPatternsAi
    );
    this.addPlayedConditions(
      MusicConditions.PLAYED_PATTERNS_AI.name,
      playedNumberPatternsAi
    );
    this.addPlayedConditions(
      MusicConditions.PLAYED_GENERATED_PATTERNS_AI.name,
      playedNumberGeneratedPatternsAi
    );

    // Add satisfied conditions for the played chords.
    this.addPlayedConditions(
      MusicConditions.PLAYED_EMPTY_CHORDS.name,
      playedNumberEmptyChords
    );
    this.addPlayedConditions(
      MusicConditions.PLAYED_CHORDS.name,
      playedNumberChords
    );

    // Add satisfied condition for playing triggers. This does not require a playback event.
    const playingTriggers = this.getPlayingTriggers();
    playingTriggers.forEach((trigger: PlayingTrigger) => {
      this.setSatisfiedCondition(
        MusicConditions.TRIGGER_ID_PRESSED.name,
        parseInt(trigger.id.replace('trigger', ''))
      );
    });
  }

  // Check for PLAYED_DIFFERENT_SOUNDS_TOGETHER_MULTIPLE_TIMES.
  private checkConditionPlayedDifferentSoundsTogetherMultipleTimes(
    currentPlayheadPosition: number
  ) {
    // An array of arrays of unique sound starts.
    // The outer array is sparsely indexed by start time in measures.
    // Each inner array is a list of unique sound IDs that start at
    // that measure.
    // This means that the same sound started at the same time will
    // only be recorded once, even if played multiple times.
    const uniqueStarts: Array<Array<string>> = [];

    this.getPlaybackEvents()
      .filter(playbackEvent => playbackEvent.when <= currentPlayheadPosition)
      .forEach(eventData => {
        if (!uniqueStarts[eventData.when]) {
          uniqueStarts[eventData.when] = [];
        }
        if (!uniqueStarts[eventData.when].includes(eventData.id)) {
          uniqueStarts[eventData.when].push(eventData.id);
        }
      });

    // At least 2 sounds must be played together at the same time to be
    // counted.
    const numSoundsForPlayTogether = 2;

    let playTogetherStarts = 0;
    Object.keys(uniqueStarts).forEach(when => {
      if (uniqueStarts[Number(when)].length >= numSoundsForPlayTogether) {
        playTogetherStarts++;
      }
    });

    this.addPlayedConditions(
      MusicConditions.PLAYED_DIFFERENT_SOUNDS_TOGETHER_MULTIPLE_TIMES.name,
      playTogetherStarts
    );
  }

  // Add satisfied conditions for a given played condition, for the number of times
  // it was played.
  private addPlayedConditions(conditionName: string, playedNumber: number) {
    for (let numberSounds = playedNumber; numberSounds >= 1; numberSounds--) {
      this.conditionsChecker.addSatisfiedCondition({
        name: conditionName,
        value: numberSounds,
      });
    }
  }

  conditionsMet(conditions: Condition[]): boolean {
    this.addSatisfiedBlockCountConditions(conditions);
    return this.conditionsChecker.checkRequirementConditions(conditions);
  }

  clear() {
    this.conditionsChecker.clear();
  }

  setSatisfiedCondition(name: string, value: string | number) {
    this.conditionsChecker.addSatisfiedCondition({
      name,
      value,
    });
  }

  getValidationResults(): ValidationResult[] | undefined {
    return undefined;
  }

  // Validates that both playback event arrays are equivalent based on id, type, and starting measure.
  validatePlaybackEventsEquivalent(): boolean {
    const mode = this.getExemplarValidationMode();
    const studentEvents = [...this.getPlaybackEvents()];
    const exemplarEvents = this.getExemplarPlaybackEvents();

    const studentMatchesExemplar = studentEvents.every(studentEvent =>
      this.eventMatchFound(studentEvent, exemplarEvents, mode)
    );
    const exemplarMatchesStudent = exemplarEvents.every(exemplarEvent =>
      this.eventMatchFound(exemplarEvent, studentEvents, mode)
    );

    return studentMatchesExemplar && exemplarMatchesStudent;
  }

  private eventMatchFound(
    currentEvent: PlaybackEvent,
    comparisonEvents: PlaybackEvent[],
    mode: ExemplarValidationMode = 'default'
  ): boolean {
    switch (mode) {
      case 'type':
        return comparisonEvents.some(event => {
          if (
            event.type !== currentEvent.type ||
            event.when !== currentEvent.when
          ) {
            return false;
          }

          // If both events are sound events, compare soundType too
          if (event.type === 'sound' && currentEvent.type === 'sound') {
            return (
              (event as SoundEvent).soundType ===
              (currentEvent as SoundEvent).soundType
            );
          }

          // For other event types, matching type + when is sufficient
          return true;
        });
      default:
        return comparisonEvents.some(
          event =>
            event.id === currentEvent.id &&
            event.type === currentEvent.type &&
            event.when === currentEvent.when
        );
    }
  }

  private addSatisfiedBlockCountConditions(conditions: Condition[]) {
    const blockCountConditions = conditions.filter(
      ({name}) => name === MusicConditions.BLOCK_COUNT_BY_TYPE.name
    );
    if (blockCountConditions.length === 0) {
      return;
    }

    const blocks = Blockly.getMainWorkspace()
      .getAllBlocks()
      .filter(block => block.isEnabled());

    blockCountConditions.forEach(({value}) => {
      const [blockType, countStr] = (value as string).split(':');
      const expectedCount = parseInt(countStr);

      const blockCountByType = blocks.filter(
        block => block.type === blockType
      ).length;

      if (blockCountByType >= expectedCount) {
        this.conditionsChecker.addSatisfiedCondition({
          name: MusicConditions.BLOCK_COUNT_BY_TYPE.name,
          value: `${blockType}:${expectedCount}`,
        });
      }
    });
  }
}
