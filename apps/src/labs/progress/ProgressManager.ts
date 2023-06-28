// This file contains a generic ProgressManager which any lab can include,
// if it wants to make progress without reloading the page.

import {LevelData} from '@cdo/apps/labs/types';

// Abstract class that validates a set of conditions. How
// the validation works is up to the implementor.
export abstract class Validator {
  abstract shouldCheckConditions(): boolean;
  abstract checkConditions(): void;
  abstract conditionsMet(conditions: string[]): boolean;
  abstract clear(): void;
}

// The current progress state.
export interface ProgressState {
  satisfied: boolean;
  message: string | null;
}

export const initialProgressState: ProgressState = {
  satisfied: false,
  message: null,
};

export default class ProgressManager {
  private levelData: LevelData | undefined;
  private validator: Validator;
  private onProgressChange: () => void;
  private currentProgressState: ProgressState;

  constructor(validator: Validator, onProgressChange: () => void) {
    this.levelData = undefined;
    this.validator = validator;
    this.onProgressChange = onProgressChange;
    this.currentProgressState = initialProgressState;
  }

  /**
   * Update the ProgressManager with level data for a new level.
   * Resets validation status internally.
   */
  onLevelChange(levelData: LevelData) {
    this.levelData = levelData;
    this.resetValidation();
  }

  getCurrentState(): ProgressState {
    return this.currentProgressState;
  }

  updateProgress(): void {
    const validations = this.levelData?.validations;

    if (!validations) {
      return;
    }

    // Find out from the lab-specific code whether we should be trying to
    // check conditions at the moment.  Otherwise, we might get a fail
    // when we shouldn't have even been checking.
    if (!this.validator.shouldCheckConditions()) {
      return;
    }

    // Give the lab-specific code a chance to check conditions.  We do
    // it once each update in case it's expensive, and since conditions
    // can be used by multiple validations.
    this.validator.checkConditions();

    // Go through each validation to see if we have a match.
    for (const validation of validations) {
      if (validation.conditions) {
        // Ask the lab-specific validator if this validation's
        // conditions are met.
        if (this.validator.conditionsMet(validation.conditions)) {
          if (!this.currentProgressState.satisfied) {
            this.currentProgressState.satisfied = validation.next;
            this.currentProgressState.message = validation.message;
            this.onProgressChange();
          }
          return;
        }
      } else {
        this.currentProgressState.message = validation.message;
      }
    }

    this.onProgressChange();
  }

  private resetValidation() {
    // Give the lab the chance to clear accumulated satisfied conditions.
    this.validator.clear();

    this.currentProgressState.satisfied = false;
    this.currentProgressState.message = null;

    this.onProgressChange();
  }
}
