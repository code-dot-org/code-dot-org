import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
import {PythonValidationResult} from '@cdo/apps/pythonlab/types';

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

  setValidationResults(results: PythonValidationResult[]) {
    if (results) {
      this.validationResults = results.map(result => ({
        message: result.name || 'unknown',
        result: result.result as ValidationResult['result'],
      }));
    } else {
      this.validationResults = undefined;
    }
  }

  reset(isChangingLevels: boolean = false) {
    if (isChangingLevels) {
      this.validationResults = undefined;
    } else {
      // If we are not changing levels, keep the test names but set all results to pending.
      // This lets us show the user the test names in the table while the tests are running.
      // Since tests are defined on the level, they can't change in a single page load.
      this.validationResults = this.validationResults?.map(result => ({
        message: result.message,
        result: 'PENDING',
      }));
    }
  }
}
