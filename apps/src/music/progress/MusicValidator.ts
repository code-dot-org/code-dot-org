// Music Lab specific validations.

import MusicPlayer from '../player/MusicPlayer';
import {Condition, ConditionType} from '@cdo/apps/lab2/types';
import ConditionsChecker from '@cdo/apps/lab2/progress/ConditionsChecker';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {Validator} from '@cdo/apps/lab2/progress/ProgressManager';

export interface ConditionNames {
  [key: string]: ConditionType;
}

export const MusicConditions: ConditionNames = {
  PLAYED_SOUNDS_TOGETHER: {name: 'played_sounds_together', valueType: 'number'},
  PLAYED_SOUND_TRIGGERED: {name: 'played_sound_triggered'},
  PLAYED_SOUNDS: {name: 'played_sounds', valueType: 'number'},
  PLAYED_SOUND_ID: {name: 'played_sound_id', valueType: 'string'},
  PLAYED_CHORDS: {name: 'played_chords', valueType: 'number'},
  PLAYED_PATTERNS: {name: 'played_patterns', valueType: 'number'},
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

  checkConditions() {
    // Get number of sounds currently playing simultaneously.
    let currentNumberSounds = 0;

    // Get number of sounds that have been started.
    let playedNumberSounds = 0;

    // Get number of patterns that have been started.
    let playedNumberPatterns = 0;

    // Get number of chords that have been started.
    let playedNumberChords = 0;

    const currentPlayheadPosition = this.player.getCurrentPlayheadPosition();
    this.getPlaybackEvents().forEach((eventData: PlaybackEvent) => {
      const length = eventData.length;

      if (eventData.type === 'sound') {
        if (
          eventData.when <= currentPlayheadPosition &&
          eventData.when + length > currentPlayheadPosition
        ) {
          currentNumberSounds++;

          if (eventData.triggered) {
            this.conditionsChecker.addSatisfiedCondition({
              name: MusicConditions.PLAYED_SOUND_TRIGGERED.name,
            });
          }

          this.conditionsChecker.addSatisfiedCondition({
            name: MusicConditions.PLAYED_SOUND_ID.name,
            value: eventData.id,
          });
        }

        if (eventData.when <= currentPlayheadPosition) {
          playedNumberSounds++;
        }
      } else if (eventData.type === 'pattern') {
        if (eventData.when <= currentPlayheadPosition) {
          playedNumberPatterns++;
        }
      } else if (eventData.type === 'chord') {
        if (eventData.when <= currentPlayheadPosition) {
          playedNumberChords++;
        }
      }
    });

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

    // Check for up to a certain number of sounds played.
    for (
      let numberSounds = playedNumberSounds;
      numberSounds >= 1;
      numberSounds--
    ) {
      this.conditionsChecker.addSatisfiedCondition({
        name: MusicConditions.PLAYED_SOUNDS.name,
        value: numberSounds,
      });
    }

    // Check for up to a certain number of patterns played.
    for (
      let numberPatterns = playedNumberPatterns;
      numberPatterns >= 1;
      numberPatterns--
    ) {
      this.conditionsChecker.addSatisfiedCondition({
        name: MusicConditions.PLAYED_PATTERNS.name,
        value: numberPatterns,
      });
    }

    // Check for up to a certain number of chords played.
    for (
      let numberChords = playedNumberChords;
      numberChords >= 1;
      numberChords--
    ) {
      this.conditionsChecker.addSatisfiedCondition({
        name: MusicConditions.PLAYED_CHORDS.name,
        value: numberChords,
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
}
