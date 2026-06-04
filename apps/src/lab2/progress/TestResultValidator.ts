import {Condition} from '@cdo/apps/lab2/types';

import {Validator, ValidationResult} from './ProgressManager';

// Conditions a TestResultValidator supports.
export enum ConditionType {
  PASSED_ALL_TESTS = 'PASSED_ALL_TESTS',
}

// Test statuses that count as passing for PASSED_ALL_TESTS. EXPECTED_FAILURE
// is a test the level author marked as expected to fail, so it counts.
const PASSED_STATUSES: ValidationResult['result'][] = [
  'PASS',
  'EXPECTED_FAILURE',
];

// The minimal tracker a TestResultValidator reads from. A lab's runner
// reports per-test results into the tracker; the validator only reads them.
export interface ValidationResultTracker {
  getValidationResults(): ValidationResult[] | undefined;
  reset(isChangingLevels?: boolean): void;
}

// Validates a level by checking the per-test validation results reported into
// a tracker by the lab's runner. The PASSED_ALL_TESTS condition is met only
// when there is at least one result and every result has a passing status.
// Shared by Java Lab 2 and Python Lab.
export default class TestResultValidator extends Validator {
  constructor(private readonly tracker: ValidationResultTracker) {
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
