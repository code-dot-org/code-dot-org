// This file contains a generic ProgressManager which any lab can include,
// if it wants to make progress without reloading the page.

import {ProjectLevelData, Condition} from '@cdo/apps/lab2/types';

// Abstract class that validates a set of conditions. How
// the validation works is up to the implementor.
export abstract class Validator {
  abstract shouldCheckConditions(): boolean;
  abstract checkConditions(): void;
  abstract conditionsMet(conditions: Condition[]): boolean;
  abstract clear(): void;
}

// The current progress validation state.
export interface ValidationState {
  hasConditions: boolean;
  satisfied: boolean;
  message: string | null;
}

export const getInitialValidationState: () => ValidationState = () => ({
  hasConditions: false,
  satisfied: false,
  message: null,
});

export default class ProgressManager {
  private levelData: ProjectLevelData | undefined;
  private validator: Validator | undefined;
  private onProgressChange: () => void;
  private currentValidationState: ValidationState;

  constructor(onProgressChange: () => void) {
    this.levelData = undefined;
    this.onProgressChange = onProgressChange;
    this.currentValidationState = getInitialValidationState();
  }

  /**
   * Update the ProgressManager with level data for a new level.
   * Resets validation status internally.
   */
  onLevelChange(levelData: ProjectLevelData | undefined) {
    this.levelData = levelData;
    this.resetValidation(
      (levelData?.validations && levelData.validations.length > 0) || false
    );
  }

  setValidator(validator: Validator) {
    this.validator = validator;
  }

  getCurrentState(): ValidationState {
    return this.currentValidationState;
  }

  updateProgress(): void {
    const validations = this.levelData?.validations;

    if (!validations || !this.validator) {
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
          if (!this.currentValidationState.satisfied) {
            this.currentValidationState.satisfied = validation.next;
            this.currentValidationState.message = validation.message;
            this.onProgressChange();
          }
          return;
        }
      } else {
        this.currentValidationState.message = validation.message;
      }
    }

    this.onProgressChange();
  }

  resetValidation(hasConditions: boolean) {
    if (this.validator) {
      // Give the lab the chance to clear accumulated satisfied conditions.
      this.validator.clear();
    }

    this.currentValidationState = {
      hasConditions,
      satisfied: false,
      message: null,
    };

    this.onProgressChange();
  }
}
