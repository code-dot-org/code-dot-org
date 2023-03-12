// The two classes in this file handle student progress through steps.

// A list of conditions that we check for.  If not listed here, it might
// still be valid in a progression, but we haven't yet coded the ability to
// check that it's satisfied.
const KnownConditions = {
  PLAYED_ONE_SOUND: 'played_one_sound',
  PLAYED_TWO_SOUNDS_TOGETHER: 'played_two_sounds_together',
  PLAYED_THREE_SOUNDS_TOGETHER: 'played_three_sounds_together'
};

// A small helper class that accumulates satisfied conditions, and then evaluates
// whether a set of conditions have all been satisfied.
class ConditionChecker {
  private currentSatisfiedConditions: { [key: string]: boolean };

  constructor() {
    this.currentSatisfiedConditions = {};
  }

  // Reset the accumulated conditions.
  clear() {
    this.currentSatisfiedConditions = {};
  }

  // Accumulate a satisfied condition.
  addSatisfiedCondition(id:string, value:boolean) {
    this.currentSatisfiedConditions[id] = value;
  }

  // Check whether the current set of satisfied conditions satisfy the given
  // required conditions.
  checkRequirementConditions(requiredConditions:[string]) {
    for (const requiredCondition of requiredConditions) {
      // If we don't yet support a condition, don't check against it for now.
      if (!Object.values(KnownConditions).includes(requiredCondition)) {
        continue;
      }

      // Not satisfying a required condition is a fail.
      if (!this.currentSatisfiedConditions[requiredCondition]) {
        return false;
      }
    }

    // All conditions are satisfied.
    return true;
  }
}

// Manages progress.  The caller can reuglarly check to see how the user
// is doing against a step's validations specified in a progression, and might
// receive feedback to give to the user, or the go-ahead to move to the next
// step.
export default class ProgressManager {
  private conditionChecker: ConditionChecker;

  constructor() {
    this.conditionChecker = new ConditionChecker();
  }

  // Called regularly to see how the user is doing against a progression's
  // validations.  Calls back onChange with new information.  Accumulates
  // satisfied conditions which can be reset with a call to clear() when moving
  // to a new step.
  checkProgress = (options:{[key: string]: any}) => {
    const {
      progression,
      progressStep,
      isPlaying,
      currentPlayheadPosition,
      player,
      onChange
    } = options;

    if (isPlaying) {
      if (player.getPlaybackEvents().length > 0) {
        this.conditionChecker.addSatisfiedCondition(
          KnownConditions.PLAYED_ONE_SOUND,
          true
        );
      }

      // Get number of sounds currently playing simultaneously.
      let currentNumberSounds = 0;

      player.getPlaybackEvents().forEach((eventData: { id: string; when: number; }) => {
        const length = player.getLengthForId(eventData.id);
        if (
          eventData.when <= currentPlayheadPosition &&
          eventData.when + length > currentPlayheadPosition
        ) {
          currentNumberSounds++;
        }
      });

      if (currentNumberSounds === 3) {
        this.conditionChecker.addSatisfiedCondition(
          KnownConditions.PLAYED_THREE_SOUNDS_TOGETHER,
          true
        );
      }
      if (currentNumberSounds === 2) {
        this.conditionChecker.addSatisfiedCondition(
          KnownConditions.PLAYED_TWO_SOUNDS_TOGETHER,
          true
        );
      }

      // Next, let's check against each validation for the current step.
      const currentValidations = progression.panels[progressStep].validations;

      if (!currentValidations) {
        // Maybe it's a final step with no validations.
        return;
      }

      // Go through each validation until one fails.
      for (const validation of currentValidations) {
        if (validation.conditions) {
          const met = this.conditionChecker.checkRequirementConditions(
            validation.conditions
          );
          if (met) {
            onChange({
              progressSatisfied: validation.next,
              progressMessage: validation.message
            });
            return;
          }
        } else {
          // we've fallen through to a validation without conditions.
          onChange({progressMessage: validation.message});
        }
      }
    }
  };

  // Clears out the accumulated satisfied conditions; usually called when
  // moving to a new step.
  clear = () => {
    this.conditionChecker.clear();
  };
}
