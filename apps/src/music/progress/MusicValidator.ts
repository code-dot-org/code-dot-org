// Music Lab specific validations.

import MusicPlayer from '../player/MusicPlayer';
import ConditionsChecker, {KnownConditions} from './ConditionsChecker';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {Validator} from './ProgressManager';

const KnownConditions: KnownConditions = {
  PLAYED_ONE_SOUND: 'played_one_sound',
  PLAYED_TWO_SOUNDS_TOGETHER: 'played_two_sounds_together',
  PLAYED_THREE_SOUNDS_TOGETHER: 'played_three_sounds_together',
};

export default class MusicValidator extends Validator {
  constructor(
    private readonly getIsPlaying: () => boolean,
    private readonly getPlaybackEvents: () => PlaybackEvent[],
    private readonly player: MusicPlayer,
    private readonly conditionsChecker: ConditionsChecker = new ConditionsChecker(
      KnownConditions
    )
  ) {
    super();
  }

  shouldCheckConditions() {
    return this.getIsPlaying();
  }

  checkConditions() {
    if (this.getPlaybackEvents().length > 0) {
      this.conditionsChecker.addSatisfiedCondition(
        KnownConditions.PLAYED_ONE_SOUND
      );
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
      this.conditionsChecker.addSatisfiedCondition(
        KnownConditions.PLAYED_THREE_SOUNDS_TOGETHER
      );
    }
    if (currentNumberSounds === 2) {
      this.conditionsChecker.addSatisfiedCondition(
        KnownConditions.PLAYED_TWO_SOUNDS_TOGETHER
      );
    }
  }

  conditionsMet(conditions: string[]): boolean {
    return this.conditionsChecker.checkRequirementConditions(conditions);
  }

  clear() {
    this.conditionsChecker.clear();
  }
}
