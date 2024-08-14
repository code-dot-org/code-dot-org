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

  checkConditions(): void {}

  conditionsMet(conditions: Condition[]): boolean {
    if (!conditions) {
      return true;
    }
    let hasPassedAllTests = true;
    conditions.forEach(condition => {
      if (condition.name === ConditionType.PASSED_ALL_TESTS) {
        const testResults = this.pythonValidationTracker.getTestResults();
        hasPassedAllTests &&= !!testResults?.every(
          testResult => testResult.result === 'PASS'
        );
      }
    });
    return hasPassedAllTests;
  }

  clear(): void {
    this.pythonValidationTracker.reset();
  }
}
