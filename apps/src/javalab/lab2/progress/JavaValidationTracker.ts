import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';

// Holds the per-test validation results for the most recent Java Lab 2
// validation run. Populated from Javabuilder's TEST_RESULT messages (see
// javabuilderRunUtils) and read by JavaValidator and the Lab2 ValidationTable.
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

  // Record a single test's result. On a re-run, `reset` leaves the prior
  // rows in place as PENDING (so the table keeps showing the test names),
  // so update the matching row rather than appending a duplicate. Tests not
  // seen before (or a first run) are appended.
  //
  // Builds a new array/objects rather than mutating in place: the array is
  // handed to Redux (via ProgressManager.getValidationResults) where Immer
  // deep-freezes it, so mutating it would throw.
  addValidationResult(result: ValidationResult) {
    if (!this.validationResults) {
      this.validationResults = [result];
      return;
    }
    const index = this.validationResults.findIndex(
      r => r.message === result.message
    );
    if (index >= 0) {
      this.validationResults = this.validationResults.map((r, i) =>
        i === index ? {...r, result: result.result} : r
      );
    } else {
      this.validationResults = [...this.validationResults, result];
    }
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
