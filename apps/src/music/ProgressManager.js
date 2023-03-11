class ConditionChecker {
  constructor() {
    this.clear();
  }

  clear() {
    this.currentConditions = {};
  }

  addCurrentCondition(id, value) {
    this.currentConditions[id] = value;
  }

  checkRequirementConditions(requirementConditions) {
    return this.checkConditions(this.currentConditions, requirementConditions);
  }

  checkConditions(currentConditions, requiredConditions) {
    // Ensure that all conditions in full are achieved in current.
    for (const requiredCondition of requiredConditions) {
      if (!currentConditions[requiredCondition]) {
        return false;
      }
    }
    return true;
  }
}

export default class ProgressManager {
  constructor() {
    this.conditionChecker = new ConditionChecker();
  }

  // Called regularly to see how the user is doing against
  // validation.  Calls back onChange with new information.
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
        this.conditionChecker.addCurrentCondition('played_one_sound', true);
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
          'played_three_sounds_together',
          true
        );
      }
      if (currentNumberSounds === 2) {
        this.conditionChecker.addCurrentCondition(
          'played_two_sounds_together',
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

  clear = () => {
    this.conditionChecker.clear();
  };
}
