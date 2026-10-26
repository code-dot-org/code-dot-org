import type {ValidationResult} from './types';

// Holds the per-test results of a lab's most recent validation run.
export default abstract class ValidationTracker {
  protected validationResults: ValidationResult[] | undefined = undefined;

  getValidationResults(): ValidationResult[] | undefined {
    return this.validationResults;
  }

  reset(isChangingLevels: boolean = false) {
    if (isChangingLevels) {
      this.validationResults = undefined;
    } else {
      // Tests are defined on the level, so on a re-run the names still hold;
      // keep them, pending, so the table shows them while the tests run.
      this.validationResults = this.validationResults?.map(result => ({
        message: result.message,
        result: 'PENDING',
      }));
    }
  }
}
