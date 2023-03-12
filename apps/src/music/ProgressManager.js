// The two classes in this file handle student progress through levels.

// A list of conditions that we check for.  If not listed here, it might
// still be valid in a progression, but we haven't yet coded the ability to
// check that it's passed.
const KnownConditions = {
  PLAYED_ONE_SOUND: 'played_one_sound',
  PLAYED_TWO_SOUNDS_TOGETHER: 'played_two_sounds_together',
  PLAYED_THREE_SOUNDS_TOGETHER: 'played_three_sounds_together'
};

// A small helper class that accumulates passed conditions, and then evaluates
// whether a set of conditions have all been passed.
class ConditionChecker {
  constructor() {
    this.clear();
  }

  // Reset the accumulated conditions.
  clear() {
    this.currentConditions = {};
  }

  // Accumulate a passed condition.
  addCurrentCondition(id, value) {
    this.currentConditions[id] = value;
  }

  // Checks whether a set of required conditions have all been passed.
  checkRequirementConditions(requirementConditions) {
    return this.checkConditions(this.currentConditions, requirementConditions);
  }

  // Internal: check whether a set of accumulated conditions have all
  // been passed.
  checkConditions(currentConditions, requiredConditions) {
    // Ensure that all conditions in full are achieved in current.
    for (const requiredCondition of requiredConditions) {
      // If we don't yet support a condition, don't check against it for now.
      if (!Object.values(KnownConditions).includes(requiredCondition)) {
        continue;
      }

      // Failing one known condition is a fail.
      if (!currentConditions[requiredCondition]) {
        return false;
      }
    }

    // All conditions passed.
    return true;
  }
}

// Manages progress.  The caller can reuglarly check to see how the user
// is doing against the validation specified in a progression, and might
// receive feedback to give to the user, or the go-ahead to move to the next
// level.
export default class ProgressManager {
  constructor() {
    this.conditionChecker = new ConditionChecker();
  }

  // Called regularly to see how the user is doing against a progression's
  // validation.  Calls back onChange with new information.  Accumulates
  // passed conditions which can be reset with a call to clear() when moving
  // to a new level.
  checkProgress = options => {
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
        this.conditionChecker.addCurrentCondition(
          KnownConditions.PLAYED_ONE_SOUND,
          true
        );
      }

      // get number of sounds currently playing simultaneously?
      let currentNumberSounds = 0;

      player.getPlaybackEvents().forEach(eventData => {
        const length = player.getLengthForId(eventData.id);
        if (
          eventData.when <= currentPlayheadPosition &&
          eventData.when + length > currentPlayheadPosition
        ) {
          currentNumberSounds++;
        }
      });

      if (currentNumberSounds === 3) {
        this.conditionChecker.addCurrentCondition(
          KnownConditions.PLAYED_THREE_SOUNDS_TOGETHER,
          true
        );
      }
      if (currentNumberSounds === 2) {
        this.conditionChecker.addCurrentCondition(
          KnownConditions.PLAYED_TWO_SOUNDS_TOGETHER,
          true
        );
      }

      // next, let's check against each validation for the current step.
      const currentValidations = progression.panels[progressStep].validations;

      if (!currentValidations) {
        // maybe it's a final level with no validations.
        return;
      }

      // go through each validation until one fails.
      for (const validation of currentValidations) {
        if (validation.conditions) {
          const met = this.conditionChecker.checkRequirementConditions(
            validation.conditions
          );
          if (met) {
            onChange({
              progressPassing: validation.next,
              progressMessage: validation.message
            });
            return;
          }
        } else {
          // we've fallen through to a fallback without conditions.
          onChange({progressMessage: validation.message});
        }
      }
    }
  };

  // Clears out the accumulated passed conditions, usually called when
  // moving to a new level.
  clear = () => {
    this.conditionChecker.clear();
  };
}
