import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';

export default class PythonValidationTracker {
  private validationResults: ValidationResult[] | undefined = undefined;

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

  getValidationResults(): ValidationResult[] | undefined {
    return this.validationResults;
  }

  setValidationResults(results: Map<string, string>[]) {
    if (results) {
      this.validationResults = results.map(result => ({
        message: result.get('name') || 'unknown',
        result: result.get('result') as ValidationResult['result'],
      }));
    } else {
      this.validationResults = undefined;
    }
  }

  reset() {
    this.validationResults = undefined;
  }
}
