// Music Lab specific validations.

import MusicPlayer from '../player/MusicPlayer';
import {Condition} from '@cdo/apps/lab2/types';
import ConditionsChecker from '@cdo/apps/lab2/progress/ConditionsChecker';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {Validator} from '@cdo/apps/lab2/progress/ProgressManager';

export interface ConditionNames {
  [key: string]: string;
}

export const ConditionNamesList: ConditionNames = {
  PLAYED_SOUNDS_TOGETHER: 'played_sounds_together',
  PLAYED_SOUND_TRIGGERED: 'played_sound_triggered',
};

export default class MusicValidator extends Validator {
  constructor(
    private readonly getIsPlaying: () => boolean,
    private readonly getPlaybackEvents: () => PlaybackEvent[],
    private readonly player: MusicPlayer,
    private readonly conditionsChecker: ConditionsChecker = new ConditionsChecker(
      Object.values(ConditionNamesList)
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
            name: ConditionNamesList.PLAYED_SOUND_TRIGGERED,
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
          name: ConditionNamesList.PLAYED_SOUNDS_TOGETHER,
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
