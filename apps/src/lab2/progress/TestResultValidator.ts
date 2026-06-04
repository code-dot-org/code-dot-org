import {Condition} from '@cdo/apps/lab2/types';

import {Validator, ValidationResult} from './ProgressManager';
import ValidationResultsTracker from './ValidationResultsTracker';

// Conditions a TestResultValidator supports.
export enum ConditionType {
  PASSED_ALL_TESTS = 'PASSED_ALL_TESTS',
}

const PASSED_STATUSES: ValidationResult['result'][] = [
  'PASS',
  'EXPECTED_FAILURE',
];

// Validates a level by checking the per-test validation results reported into
// a tracker by the lab's runner. The PASSED_ALL_TESTS condition is met only
// when there is at least one result and every result has a passing status.
export default class TestResultValidator extends Validator {
  constructor(private readonly tracker: ValidationResultsTracker) {
    super();
  }

  shouldCheckConditions(): boolean {
    return true;
  }

  shouldCheckNextConditionsOnly(): boolean {
    return true;
  }

  // No-op, results are reported into the tracker by the lab's runner.
  checkConditions(): void {}

  conditionsMet(conditions: Condition[]): boolean {
    for (const condition of conditions) {
      if (condition.name === ConditionType.PASSED_ALL_TESTS) {
        const validationResults = this.tracker.getValidationResults();
        if (!validationResults || validationResults.length === 0) {
          return false;
        }
        if (
          validationResults.some(
            validationResult =>
              !PASSED_STATUSES.includes(validationResult.result)
          )
        ) {
          return false;
        }
      }
    }
    return true;
  }

  clear(isChangingLevels: boolean): void {
    this.tracker.reset(isChangingLevels);
  }

  getValidationResults() {
    return this.tracker.getValidationResults();
  }
}
