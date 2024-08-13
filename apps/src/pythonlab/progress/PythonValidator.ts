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

export enum ConditionType {
  PASSED_ALL_TESTS = 'PASSED_ALL_TESTS',
  HAS_RUN_CODE = 'HAS_RUN_CODE',
}

export default class PythonValidator extends Validator {
  private testResults: TestResult[] | null = null;
  private hasRunCode: boolean = false;
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
    console.log('checking conditions');
    if (!conditions) {
      return true;
    }
    let hasPassedAllTests = true;
    conditions.forEach(condition => {
      if (condition.name === ConditionType.PASSED_ALL_TESTS) {
        const testResults = this.pythonValidationTracker.getTestResults();
        if (!testResults) {
          hasPassedAllTests = false;
        } else if (
          !testResults.every(testResult => testResult.result === 'PASS')
        ) {
          hasPassedAllTests = false;
        }
      } else if (condition.name === ConditionType.HAS_RUN_CODE) {
        if (!this.pythonValidationTracker.getHasRunCode()) {
          hasPassedAllTests = false;
        }
      }
    });
    return hasPassedAllTests;
  }

  clear(): void {
    this.pythonValidationTracker.reset();
  }
}
