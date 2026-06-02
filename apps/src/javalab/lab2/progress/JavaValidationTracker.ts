import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';

// Holds the per-test validation results for the most recent Java Lab 2
// validation run. Populated from Javabuilder's TEST_RESULT messages (see
// javabuilderRunUtils) and read by JavaValidator and the Lab2 ValidationTable.
// Mirrors pythonlab/progress/PythonValidationTracker.
export default class JavaValidationTracker {
  private validationResults: ValidationResult[] | undefined = undefined;

  private static _instance: JavaValidationTracker;

  public static getInstance(): JavaValidationTracker {
    if (JavaValidationTracker._instance === undefined) {
      JavaValidationTracker.create();
    }
    return JavaValidationTracker._instance;
  }

  public static create() {
    JavaValidationTracker._instance = new JavaValidationTracker();
  }

  getValidationResults(): ValidationResult[] | undefined {
    return this.validationResults;
  }

  setValidationResults(results: ValidationResult[] | undefined) {
    this.validationResults = results;
  }

  reset(isChangingLevels: boolean = false) {
    if (isChangingLevels) {
      this.validationResults = undefined;
    } else {
      // If we are not changing levels, keep the test names but set all results to
      // pending. This lets us show the user the test names in the table while the
      // tests are running. Since tests are defined on the level, they can't change
      // in a single page load.
      this.validationResults = this.validationResults?.map(result => ({
        message: result.message,
        result: 'PENDING',
      }));
    }
  }
}
