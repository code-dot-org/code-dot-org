// Music Lab specific validations.

import MusicPlayer from '../player/MusicPlayer';
import ConditionsChecker, {
  KnownConditionNames,
  KnownCondition,
} from './ConditionsChecker';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {Validator} from './ProgressManager';

export const KnownConditionNamesList: KnownConditionNames = {
  PLAYED_SOUNDS_TOGETHER: 'played_sounds_together',
  USED_BLOCK: 'used_block',
};

export default class MusicValidator extends Validator {
  constructor(
    private readonly getIsPlaying: () => boolean,
    private readonly getPlaybackEvents: () => PlaybackEvent[],
    private readonly player: MusicPlayer,
    private readonly conditionsChecker: ConditionsChecker = new ConditionsChecker(
      KnownConditionNamesList
    )
  ) {
    super();
  }

  shouldCheckConditions() {
    return this.getIsPlaying();
  }

  checkConditions() {
    if (this.getPlaybackEvents().length > 0) {
      this.conditionsChecker.addSatisfiedCondition({
        name: KnownConditionNamesList.PLAYED_SOUNDS_TOGETHER,
        value: 1,
      });
    }

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
      }
    });

    if (currentNumberSounds === 3) {
      this.conditionsChecker.addSatisfiedCondition({
        name: KnownConditionNamesList.PLAYED_SOUNDS_TOGETHER,
        value: 3,
      });
    }
    if (currentNumberSounds === 2) {
      this.conditionsChecker.addSatisfiedCondition({
        name: KnownConditionNamesList.PLAYED_SOUNDS_TOGETHER,
        value: 2,
      });
    }
  }

  conditionsMet(conditions: KnownCondition[]): boolean {
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
