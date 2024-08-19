import {Validator} from '@cdo/apps/lab2/progress/ProgressManager';
import {Condition} from '@cdo/apps/lab2/types';

import PythonValidationTracker from './PythonValidationTracker';

export interface TestResult {
  name: string;
  result:
    | 'PASS'
    | 'FAIL'
    | 'ERROR'
    | 'UNEXPECTED_FAILURE'
    | 'EXPECTED_SUCCESS'
    | 'SKIP';
}

// Conditions the Python Validator supports.
export enum ConditionType {
  PASSED_ALL_TESTS = 'PASSED_ALL_TESTS',
}

export default class PythonValidator extends Validator {
  constructor(
    private readonly pythonValidationTracker: PythonValidationTracker
  ) {
    super();
  }

  shouldCheckConditions(): boolean {
    return true;
  }

  shouldCheckNextConditionsOnly(): boolean {
    return true;
  }

  // No-op, conditions are reported to pythonValidationTracker.
  checkConditions(): void {}

  conditionsMet(conditions: Condition[]): boolean {
    for (const condition of conditions) {
      if (condition.name === ConditionType.PASSED_ALL_TESTS) {
        const testResults = this.pythonValidationTracker.getTestResults();
        if (!testResults) {
          return false;
        }
        if (testResults.some(testResult => testResult.result !== 'PASS')) {
          return false;
        }
      }
    }
    return true;
  }

  clear(): void {
    this.pythonValidationTracker.reset();
  }
}
