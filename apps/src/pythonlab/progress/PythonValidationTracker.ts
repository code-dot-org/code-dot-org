import {TestResult} from './PythonValidator';

export default class PythonValidationTracker {
  private testResults: TestResult[] | null = null;

  private static _instance: PythonValidationTracker;

  public static getInstance(): PythonValidationTracker {
    if (PythonValidationTracker._instance === undefined) {
      PythonValidationTracker.create();
    }
    return PythonValidationTracker._instance;
  }

  public static create() {
    PythonValidationTracker._instance = new PythonValidationTracker();
  }

  getTestResults(): TestResult[] | null {
    return this.testResults;
  }

  setTestResults(results: Map<string, string>[]) {
    if (results) {
      this.testResults = results.map(result => ({
        name: result.get('name') || 'unknown',
        result: result.get('result') as TestResult['result'],
      }));
    } else {
      this.testResults = null;
    }
  }

  reset() {
    this.testResults = null;
  }
}
