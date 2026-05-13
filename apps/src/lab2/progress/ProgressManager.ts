// This file contains a generic ProgressManager which any lab can include,
// if it wants to make progress without reloading the page.

import {Condition, ExemplarSettings, Validation} from '@cdo/apps/lab2/types';

import {getAppOptionsEditingExemplar} from '../projects/utils';

// Abstract class that validates a set of conditions. How
// the validation works is up to the implementor.
export abstract class Validator {
  abstract shouldCheckConditions(): boolean;
  abstract shouldCheckNextConditionsOnly(): boolean;
  abstract checkConditions(): void;
  abstract conditionsMet(conditions: Condition[]): boolean;
  abstract clear(isChangingLevels?: boolean): void;
  abstract getValidationResults(): ValidationResult[] | undefined;
  didPassExemplarValidation(): boolean {
    return false;
  }
}

// The current progress validation state.
export interface ValidationState {
  hasConditions: boolean;
  satisfied: boolean;
  message: string | null;
  callout?: string;
  index: number;
  validationResults?: ValidationResult[];
}

export interface ValidationResult {
  message: string;
  result: TestStatus;
}

// Test results for upper-grade labs (labs that use levelbuilder-written unit tests for validation)
export type TestStatus =
  | 'PASS'
  | 'FAIL'
  | 'SKIP'
  | 'ERROR'
  | 'EXPECTED_FAILURE'
  | 'UNEXPECTED_SUCCESS'
  | 'PENDING';

export const getInitialValidationState: () => ValidationState = () => ({
  hasConditions: false,
  satisfied: false,
  message: null,
  callout: undefined,
  index: 0,
});

export default class ProgressManager {
  private currentValidations: Validation[] | undefined;
  private validator: Validator | undefined;
  private onProgressChange: () => void;
  private currentValidationState: ValidationState;
  private exemplarSettings: ExemplarSettings | undefined;

  constructor(onProgressChange: () => void) {
    this.currentValidations = undefined;
    this.onProgressChange = onProgressChange;
    this.currentValidationState = getInitialValidationState();
  }

  /**
   * Update the ProgressManager with level data for a new level.
   * Resets validation status internally.
   */
  onLevelChange(
    validations?: Validation[],
    exemplarSettings?: ExemplarSettings
  ) {
    this.currentValidations = validations;
    this.exemplarSettings = exemplarSettings;
    this.resetValidation(true);
  }

  setValidator(validator: Validator) {
    this.validator = validator;
  }

  getCurrentState(): ValidationState {
    return this.currentValidationState;
  }

  updateProgress(): void {
    if (!this.validator) {
      return;
    }
    const exemplarSettings = this.exemplarSettings;
    const shouldValidateExemplar =
      !getAppOptionsEditingExemplar() && exemplarSettings?.validationEnabled;

    // Compute exemplar validation result and message only once if needed.
    let passedExemplar = false;
    let exemplarMessage = '';
    if (shouldValidateExemplar) {
      passedExemplar = this.validator.didPassExemplarValidation();
      exemplarMessage = passedExemplar
        ? exemplarSettings!.validationSuccessMessage!
        : exemplarSettings!.validationFailureMessage!;
    }

    // If there are no validations, we still might run the exemplar validation.
    if (!this.currentValidations?.length && shouldValidateExemplar) {
      this.setValidationStateWithExemplar(passedExemplar, exemplarMessage);
      this.onProgressChange();
      return;
    }

    if (!this.currentValidations) {
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
    for (const validation of this.currentValidations) {
      // If it's a non-successful validation (i.e. validation.next is false), then
      // make sure the lab-specific validator is ready for it.
      if (this.validator.shouldCheckNextConditionsOnly() && !validation.next) {
        continue;
      }

      if (validation.conditions) {
        this.currentValidationState.validationResults =
          this.validator.getValidationResults();
        // Ask the lab-specific validator if this validation's
        // conditions are met.
        if (this.validator.conditionsMet(validation.conditions)) {
          if (!this.currentValidationState.satisfied) {
            this.currentValidationState.satisfied = validation.next;
            this.currentValidationState.message = validation.message;
            this.currentValidationState.callout = validation.callout;
            if (this.currentValidationState.satisfied && validation.next) {
              if (shouldValidateExemplar) {
                this.setValidationStateWithExemplar(
                  passedExemplar,
                  exemplarMessage
                );
              }
            }
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

  resetValidation(isChangingLevels: boolean = false) {
    if (this.validator) {
      // Give the lab the chance to clear accumulated satisfied conditions.
      this.validator.clear(isChangingLevels);
    }

    const hasConditions =
      (this.currentValidations && this.currentValidations.length > 0) || false;

    this.currentValidationState = {
      hasConditions,
      satisfied: false,
      message: null,
      callout: undefined,
      // Ensure that the validation feedback UI is rendered fresh.  This index is
      // used as part of the key for that React component; having a unique value
      // ensures that the UI is rendered fresh, and any apperance animation is
      // played again, even if it's the same message as last time.
      index: this.currentValidationState.index + 1,
    };

    this.onProgressChange();
  }

  // Set exemplar validation status using precomputed exemplar values.
  private setValidationStateWithExemplar(
    passedExemplar: boolean,
    exemplarMessage: string
  ): void {
    this.currentValidationState = {
      ...this.currentValidationState,
      satisfied: passedExemplar,
      message: exemplarMessage,
    };
  }
}
