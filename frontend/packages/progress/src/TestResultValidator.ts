import type ValidationTracker from './ValidationTracker';
import type {Condition, ValidationResult} from './types';
import {Validator} from './types';

// Conditions a TestResultValidator supports.
export const TestResultConditionTypes = {
  PASSED_ALL_TESTS: 'PASSED_ALL_TESTS',
} as const;

const PASSED_STATUSES: ValidationResult['result'][] = [
  'PASS',
  'EXPECTED_FAILURE',
];

// Validates a level by the per-test results the lab's runner reports into a
// tracker. PASSED_ALL_TESTS is met only when there is at least one result and
// every result passed.
export default class TestResultValidator extends Validator {
  private readonly tracker: ValidationTracker;

  constructor(tracker: ValidationTracker) {
    super();
    this.tracker = tracker;
  }

  shouldCheckConditions(): boolean {
    return true;
  }

  shouldCheckNextConditionsOnly(): boolean {
    return true;
  }

  // The lab's runner reports results into the tracker; nothing to do here.
  checkConditions(): void {}

  conditionsMet(conditions: Condition[]): boolean {
    for (const condition of conditions) {
      if (condition.name === TestResultConditionTypes.PASSED_ALL_TESTS) {
        const validationResults = this.tracker.getValidationResults();
        if (!validationResults || validationResults.length === 0) {
          return false;
        }
        if (
          validationResults.some(
            validationResult =>
              !PASSED_STATUSES.includes(validationResult.result),
          )
        ) {
          return false;
        }
      }
    }
    return true;
  }

  clear(isChangingLevels: boolean = false): void {
    this.tracker.reset(isChangingLevels);
  }

  getValidationResults() {
    return this.tracker.getValidationResults();
  }
}
