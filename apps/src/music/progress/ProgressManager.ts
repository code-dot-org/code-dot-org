// This file contains a generic ProgressManager which any lab can include,
// if it wants to make progress without reloading the page.

// Abstract class that validates a set of conditions. How
// the validation works is up to the implementor.
export abstract class Validator {
  abstract shouldCheckConditions(): boolean;
  abstract checkConditions(): void;
  abstract conditionsMet(conditions: string[]): boolean;
  abstract clear(): void;
}

// A validation inside the progression step.
interface Validation {
  conditions: string[];
  message: string;
  next: boolean;
}

// The definition of a progression step.
interface ProgressionStep {
  text: string;
  toolbox: {
    [key: string]: string;
  };
  sounds: {
    [key: string]: string;
  };
  validations: Validation[];
}

// The current progress state.
export interface ProgressState {
  step: number;
  satisfied: boolean;
  message: string | null;
}

export const initialProgressState: ProgressState = {
  step: 0,
  satisfied: false,
  message: null,
};

export default class ProgressManager {
  private progressionStep: ProgressionStep | undefined;
  private validator: Validator;
  private onProgressChange: () => void;
  private currentProgressState: ProgressState;

  constructor(
    initialStep: number | undefined,
    validator: Validator,
    onProgressChange: () => void
  ) {
    this.progressionStep = undefined;
    this.validator = validator;
    this.onProgressChange = onProgressChange;
    this.currentProgressState = initialProgressState;
    if (initialStep !== undefined) {
      this.currentProgressState.step = initialStep;
    }
  }

  setProgressionStep(progressionStep: ProgressionStep) {
    this.progressionStep = progressionStep;
  }

  getProgressionStep(): ProgressionStep | undefined {
    return this.progressionStep;
  }

  getCurrentState(): ProgressState {
    return this.currentProgressState;
  }

  getCurrentStepDetails() {
    return this.progressionStep;
  }

  updateProgress(): void {
    const validations = this.progressionStep?.validations;

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

  // Advance to the next step.  Advances the state internally and calls
  // the change handler.
  next(): void {
    this.goToStep(this.currentProgressState.step + 1);
  }

  // Go to a specific step.  Adjusts the state internally and calls the
  // change handler.
  goToStep(specificStep: number): void {
    // Give the lab the chance to clear accumulated satisfied conditions.
    this.validator.clear();

    this.currentProgressState.step = specificStep;
    this.currentProgressState.satisfied = false;
    this.currentProgressState.message = null;

    this.onProgressChange();
  }
}
