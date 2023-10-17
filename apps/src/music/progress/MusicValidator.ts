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
  PLAYED_SOUNDS_TOGETHER: {
    name: 'played_sounds_together',
    hasValue: true,
    valueType: 'number',
  },
  PLAYED_SOUND_TRIGGERED: {name: 'played_sound_triggered', hasValue: false},
};

export default class MusicValidator extends Validator {
  constructor(
    private readonly getIsPlaying: () => boolean,
    private readonly getPlaybackEvents: () => PlaybackEvent[],
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

  checkConditions() {
    // Get number of sounds currently playing simultaneously.
    let currentNumberSounds = 0;
    const currentPlayheadPosition = this.player.getCurrentPlayheadPosition();
    this.getPlaybackEvents().forEach((eventData: PlaybackEvent) => {
      const length = eventData.length;
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
      }
    });

    // Check for up to a certain number of sounds playing simultaneously.
    // Not that if, for example, 3 sounds are playing, then we'll consider
    // that 2 sounds and 1 sound have also been played together.
    const maxNumberSounds = 3;
    for (
      let numberSounds = maxNumberSounds;
      numberSounds >= 1;
      numberSounds--
    ) {
      if (currentNumberSounds >= numberSounds) {
        this.conditionsChecker.addSatisfiedCondition({
          name: MusicConditions.PLAYED_SOUNDS_TOGETHER.name,
          value: currentNumberSounds,
        });
      }
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
