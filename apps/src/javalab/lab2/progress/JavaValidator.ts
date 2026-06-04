import {Validator} from '@cdo/apps/lab2/progress/ProgressManager';
import {Condition} from '@cdo/apps/lab2/types';

import JavaValidationTracker from './JavaValidationTracker';

// Conditions the Java Validator supports.
export enum ConditionType {
  PASSED_ALL_TESTS = 'PASSED_ALL_TESTS',
}

const PASSED_STATUSES = ['PASS'];

// Validates a Java Lab 2 level by checking the results of the level's
// validation tests, which are run by Javabuilder and reported into the
// JavaValidationTracker. Mirrors pythonlab/progress/PythonValidator.
export default class JavaValidator extends Validator {
  constructor(private readonly javaValidationTracker: JavaValidationTracker) {
    super();
  }

  shouldCheckConditions(): boolean {
    return true;
  }

  shouldCheckNextConditionsOnly(): boolean {
    return true;
  }

  // No-op, results are reported into javaValidationTracker by the runner.
  checkConditions(): void {}

  conditionsMet(conditions: Condition[]): boolean {
    for (const condition of conditions) {
      if (condition.name === ConditionType.PASSED_ALL_TESTS) {
        const validationResults =
          this.javaValidationTracker.getValidationResults();
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
    this.javaValidationTracker.reset(isChangingLevels);
  }

  getValidationResults() {
    return this.javaValidationTracker.getValidationResults();
  }
}
