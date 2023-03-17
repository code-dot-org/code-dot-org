// Music Lab specific validations.

import MusicPlayer from '../player/MusicPlayer';
import ConditionsChecker from './ConditionsChecker';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {Validator} from './ProgressManager';

const KnownConditions = {
  PLAYED_ONE_SOUND: 'played_one_sound',
  PLAYED_TWO_SOUNDS_TOGETHER: 'played_two_sounds_together',
  PLAYED_THREE_SOUNDS_TOGETHER: 'played_three_sounds_together'
};

export default class MusicValidator extends Validator {
  private player: MusicPlayer;
  private getIsPlaying: Function;
  private conditionsChecker: ConditionsChecker;

  constructor(getIsPlaying: Function, player: MusicPlayer) {
    super();

    this.getIsPlaying = getIsPlaying;
    this.player = player;
    this.conditionsChecker = new ConditionsChecker(KnownConditions);
  }

  shouldCheckConditions() {
    return this.getIsPlaying();
  }

  checkConditions() {
    if (this.player.getPlaybackEvents().length > 0) {
      this.conditionsChecker.addSatisfiedCondition(
        KnownConditions.PLAYED_ONE_SOUND,
        true
      );
    }

    // Get number of sounds currently playing simultaneously.
    let currentNumberSounds = 0;

    const currentPlayheadPosition = this.player.getCurrentPlayheadPosition();

    this.player.getPlaybackEvents().forEach((eventData: PlaybackEvent) => {
      let length = eventData.length;

      if (
        eventData.when <= currentPlayheadPosition &&
        eventData.when + length > currentPlayheadPosition
      ) {
        currentNumberSounds++;
      }
    });

    if (currentNumberSounds === 3) {
      this.conditionsChecker.addSatisfiedCondition(
        KnownConditions.PLAYED_THREE_SOUNDS_TOGETHER,
        true
      );
    }
    if (currentNumberSounds === 2) {
      this.conditionsChecker.addSatisfiedCondition(
        KnownConditions.PLAYED_TWO_SOUNDS_TOGETHER,
        true
      );
    }
  }

  conditionsMet(conditions: [string]): boolean {
    return this.conditionsChecker.checkRequirementConditions(conditions);
  }

  clear() {
    this.conditionsChecker.clear();
  }
}
