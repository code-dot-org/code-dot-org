import {ValidationResult} from './ProgressManager';

// Holds the per-test validation results for the most recent validation run of
// a lab. Subclasses add the lab-specific way results arrive (incrementally vs.
// in bulk) and the singleton accessor. Read by TestResultValidator and the
// Lab2 ValidationTable.
export default abstract class ValidationResultsTracker {
  protected validationResults: ValidationResult[] | undefined = undefined;

  getValidationResults(): ValidationResult[] | undefined {
    return this.validationResults;
  }

  reset(isChangingLevels: boolean = false) {
    if (isChangingLevels) {
      this.validationResults = undefined;
    } else {
      // If we are not changing levels, keep the test names but set all results
      // to pending. This lets us show the user the test names in the table
      // while the tests are running. Since tests are defined on the level, they
      // can't change in a single page load.
      this.validationResults = this.validationResults?.map(result => ({
        message: result.message,
        result: 'PENDING',
      }));
    }
  }
}
