import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
import ValidationTracker from '@cdo/apps/lab2/progress/ValidationTracker';

// Populated from Javabuilder's TEST_RESULT messages,
// one test at a time via addValidationResult.
export default class JavaValidationTracker extends ValidationTracker {
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
}
