// Music Lab specific validations.

import ConditionsChecker from '@cdo/apps/lab2/progress/ConditionsChecker';
import {
  ValidationResult,
  Validator,
} from '@cdo/apps/lab2/progress/ProgressManager';
import {Condition, ConditionType, Validation} from '@cdo/apps/lab2/types';

import {ChordEvent} from '../player/interfaces/ChordEvent';
import {PatternEvent} from '../player/interfaces/PatternEvent';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import MusicPlayer from '../player/MusicPlayer';

export interface ConditionNames {
  [key: string]: ConditionType;
}

export const MusicConditions: ConditionNames = {
  PLAYED_SOUNDS_TOGETHER: {name: 'played_sounds_together', valueType: 'number'},
  PLAYED_DIFFERENT_SOUNDS_TOGETHER: {
    name: 'played_different_sounds_together',
    valueType: 'number',
  },
  PLAYED_SOUND_TRIGGERED: {name: 'played_sound_triggered'},
  PLAYED_SOUND_IN_FUNCTION: {
    name: 'played_sound_in_function',
    valueType: 'string',
  },
  PLAYED_SOUNDS: {name: 'played_sounds', valueType: 'number'},
  PLAYED_SOUND_ID: {name: 'played_sound_id', valueType: 'string'},
  PLAYED_EMPTY_CHORDS: {name: 'played_empty_chords', valueType: 'number'},
  PLAYED_CHORDS: {name: 'played_chords', valueType: 'number'},
  PLAYED_EMPTY_PATTERNS: {name: 'played_empty_patterns', valueType: 'number'},
  PLAYED_PATTERNS: {name: 'played_patterns', valueType: 'number'},
  PLAYED_EMPTY_PATTERNS_AI: {
    name: 'played_empty_patterns_ai',
    valueType: 'number',
  },
  PLAYED_PATTERNS_AI: {name: 'played_patterns_ai', valueType: 'number'},
  PLAYED_DIFFERENT_SOUNDS_TOGETHER_MULTIPLE_TIMES: {
    name: 'played_different_sounds_together_multiple_times',
    valueType: 'number',
  },
};

export default class MusicValidator extends Validator {
  constructor(
    private readonly getIsPlaying: () => boolean,
    private readonly getPlaybackEvents: () => PlaybackEvent[],
    private readonly getValidationTimeout: () => number,
    private readonly player: MusicPlayer,
    private readonly conditionsChecker: ConditionsChecker = new ConditionsChecker(
      Object.values(MusicConditions).map(condition => condition.name)
    )
  ) {
    super();
  }

  shouldCheckConditions() {
    return this.getIsPlaying();
  }

  shouldCheckNextConditionsOnly() {
    return (
      this.player.getCurrentPlayheadPosition() < this.getValidationTimeout()
    );
  }

  checkConditions(validations: Validation[]) {
    const conditions = validations.flatMap(
      validation => validation.conditions || []
    );
    const validationConditions = new Set(conditions.map(cond => cond.name));
    const soundConditions = new Set([
      MusicConditions.PLAYED_SOUNDS_TOGETHER.name,
      MusicConditions.PLAYED_DIFFERENT_SOUNDS_TOGETHER.name,
      MusicConditions.PLAYED_SOUNDS.name,
      MusicConditions.PLAYED_SOUND_ID.name,
      MusicConditions.PLAYED_SOUND_TRIGGERED.name,
      MusicConditions.PLAYED_SOUND_IN_FUNCTION.name,
    ]);
    const patternConditions = new Set([
      MusicConditions.PLAYED_EMPTY_PATTERNS.name,
      MusicConditions.PLAYED_PATTERNS.name,
      MusicConditions.PLAYED_EMPTY_PATTERNS_AI.name,
      MusicConditions.PLAYED_PATTERNS_AI.name,
    ]);
    const chordConditions = new Set([
      MusicConditions.PLAYED_EMPTY_CHORDS.name,
      MusicConditions.PLAYED_CHORDS.name,
    ]);

    // Check if there are any relevant conditions before processing sounds, patterns, or chords.
    const shouldCheckSounds = [...soundConditions].some(condition =>
      validationConditions.has(condition)
    );
    const shouldCheckPatterns = [...patternConditions].some(condition =>
      validationConditions.has(condition)
    );
    const shouldCheckChords = [...chordConditions].some(condition =>
      validationConditions.has(condition)
    );

    if (!shouldCheckSounds && !shouldCheckPatterns && !shouldCheckChords) {
      return;
    }

    // Get number of sounds currently playing simultaneously.
    let currentNumberSounds = 0;

    // Get number of different sounds currently playing simultaneously.
    let currentNumberDifferentSounds = 0;

    // Get number of sounds that have been started.
    let playedNumberSounds = 0;

    // Get number of patterns that have been started, separately counting those
    // that are empty and those with events.
    let playedNumberEmptyPatterns = 0;
    let playedNumberPatterns = 0;

    // And the same for patterns made with AI.
    let playedNumberEmptyPatternsAi = 0;
    let playedNumberPatternsAi = 0;

    // Get number of chords that have been started, separately counting those
    // that are empty and those with notes.
    let playedNumberEmptyChords = 0;
    let playedNumberChords = 0;

    const uniqueCurrentSounds: string[] = [];

    const currentPlayheadPosition = this.player.getCurrentPlayheadPosition();
    this.getPlaybackEvents().forEach((eventData: PlaybackEvent) => {
      // Skip events that we haven't gotten to yet.
      if (eventData.when > currentPlayheadPosition) {
        return;
      }

      const length = eventData.length;

      if (eventData.type === 'sound' && shouldCheckSounds) {
        if (eventData.when + length > currentPlayheadPosition) {
          currentNumberSounds++;

          if (!uniqueCurrentSounds.includes(eventData.id)) {
            currentNumberDifferentSounds++;
            uniqueCurrentSounds.push(eventData.id);
          }

          if (
            eventData.triggered &&
            validationConditions.has(
              MusicConditions.PLAYED_SOUND_TRIGGERED.name
            )
          ) {
            this.conditionsChecker.addSatisfiedCondition({
              name: MusicConditions.PLAYED_SOUND_TRIGGERED.name,
            });
          }

          if (
            eventData.functionContext &&
            validationConditions.has(
              MusicConditions.PLAYED_SOUND_IN_FUNCTION.name
            )
          ) {
            this.conditionsChecker.addSatisfiedCondition({
              name: MusicConditions.PLAYED_SOUND_IN_FUNCTION.name,
              value: eventData.functionContext.name,
            });
          }
          if (validationConditions.has(MusicConditions.PLAYED_SOUND_ID.name)) {
            this.conditionsChecker.addSatisfiedCondition({
              name: MusicConditions.PLAYED_SOUND_ID.name,
              value: eventData.id,
            });
          }
        }

        playedNumberSounds++;
      } else if (eventData.type === 'pattern' && shouldCheckPatterns) {
        const patternEvent = eventData as PatternEvent;
        if (patternEvent.value.events.length === 0) {
          if (patternEvent.value.ai) {
            playedNumberEmptyPatternsAi++;
          } else {
            playedNumberEmptyPatterns++;
          }
        } else {
          if (patternEvent.value.ai) {
            playedNumberPatternsAi++;
          } else {
            playedNumberPatterns++;
          }
        }
      } else if (eventData.type === 'chord' && shouldCheckChords) {
        const chordEvent = eventData as ChordEvent;
        if (chordEvent.value.notes.length === 0) {
          playedNumberEmptyChords++;
        } else {
          playedNumberChords++;
        }
      }
    });

    if (
      validationConditions.has(
        MusicConditions.PLAYED_DIFFERENT_SOUNDS_TOGETHER_MULTIPLE_TIMES.name
      )
    ) {
      this.checkConditionPlayedDifferentSoundsTogetherMultipleTimes(
        currentPlayheadPosition
      );
    }

    // Check for up to a certain number of sounds playing simultaneously.
    // Note that if, for example, 3 sounds are playing, then we'll consider
    // that 2 sounds and 1 sound have also been played together.
    if (validationConditions.has(MusicConditions.PLAYED_SOUNDS_TOGETHER.name)) {
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
    }

    // Check for up to a certain number of different sounds playing simultaneously.
    // Note that if, for example, 3 different sounds are playing, then we'll consider
    // that 2 different sounds and 1 different sound have also been played together.
    if (
      validationConditions.has(
        MusicConditions.PLAYED_DIFFERENT_SOUNDS_TOGETHER.name
      )
    ) {
      for (
        let numberDifferentSounds = currentNumberDifferentSounds;
        numberDifferentSounds >= 1;
        numberDifferentSounds--
      ) {
        this.conditionsChecker.addSatisfiedCondition({
          name: MusicConditions.PLAYED_DIFFERENT_SOUNDS_TOGETHER.name,
          value: numberDifferentSounds,
        });
      }
    }

    // Add satisfied conditions for the played sounds.
    if (validationConditions.has(MusicConditions.PLAYED_SOUNDS.name)) {
      this.addPlayedConditions(
        MusicConditions.PLAYED_SOUNDS.name,
        playedNumberSounds
      );
    }

    // Add satisfied conditions for the played patterns.
    if (validationConditions.has(MusicConditions.PLAYED_EMPTY_PATTERNS.name)) {
      this.addPlayedConditions(
        MusicConditions.PLAYED_EMPTY_PATTERNS.name,
        playedNumberEmptyPatterns
      );
    }
    if (validationConditions.has(MusicConditions.PLAYED_PATTERNS.name)) {
      this.addPlayedConditions(
        MusicConditions.PLAYED_PATTERNS.name,
        playedNumberPatterns
      );
    }

    // And the same for patterns made with AI.

    if (
      validationConditions.has(MusicConditions.PLAYED_EMPTY_PATTERNS_AI.name)
    ) {
      this.addPlayedConditions(
        MusicConditions.PLAYED_EMPTY_PATTERNS_AI.name,
        playedNumberEmptyPatternsAi
      );
    }
    if (validationConditions.has(MusicConditions.PLAYED_PATTERNS_AI.name)) {
      this.addPlayedConditions(
        MusicConditions.PLAYED_PATTERNS_AI.name,
        playedNumberPatternsAi
      );
    }

    // Add satisfied conditions for the played chords.
    if (validationConditions.has(MusicConditions.PLAYED_EMPTY_CHORDS.name)) {
      this.addPlayedConditions(
        MusicConditions.PLAYED_EMPTY_CHORDS.name,
        playedNumberEmptyChords
      );
    }
    if (validationConditions.has(MusicConditions.PLAYED_CHORDS.name)) {
      this.addPlayedConditions(
        MusicConditions.PLAYED_CHORDS.name,
        playedNumberChords
      );
    }
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
      .forEach((eventData: PlaybackEvent) => {
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
}
