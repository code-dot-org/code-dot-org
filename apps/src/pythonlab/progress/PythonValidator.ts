import {Validator} from '@cdo/apps/lab2/progress/ProgressManager';
import {Condition} from '@cdo/apps/lab2/types';

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
}

export default class PythonValidator extends Validator {
  private testResults: TestResult[] | null = null;
  constructor() {
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
    if (
      conditions.length > 0 &&
      conditions[0].name === ConditionType.PASSED_ALL_TESTS
    ) {
      console.log('has condition');
      if (!this.testResults) {
        console.log('does not have test results');
        return false;
      }
      console.log(
        'conditions met is ' +
          this.testResults.every(testResult => testResult.result === 'PASS')
      );
      return this.testResults.every(testResult => testResult.result === 'PASS');
    } else {
      // If there's no conditions to check, the user passes by default.
      return true;
    }
  }

  clear(): void {
    this.testResults = null;
  }

  reportTestResults(results: Map<string, string>[]) {
    if (results) {
      this.testResults = results.map(result => ({
        name: result.get('name') || 'unknown',
        result: result.get('result') as TestResult['result'],
      }));
    } else {
      this.testResults = null;
    }
  }
}
