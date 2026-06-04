import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
import TestResultValidator from '@cdo/apps/lab2/progress/TestResultValidator';
import ValidationResultsTracker from '@cdo/apps/lab2/progress/ValidationResultsTracker';
import {Condition} from '@cdo/apps/lab2/types';

// Minimal concrete tracker so the test exercises TestResultValidator against the
// ValidationResultsTracker contract without depending on a specific lab's tracker.
class TestTracker extends ValidationResultsTracker {
  setValidationResults(results: ValidationResult[]) {
    this.validationResults = results;
  }
}

describe('TestResultValidator', () => {
  const PASSED_TESTS: ValidationResult[] = [
    {message: 'test1', result: 'PASS'},
    {message: 'test2', result: 'PASS'},
    {message: 'test3', result: 'EXPECTED_FAILURE'},
  ];

  const SOME_FAILED_TESTS: ValidationResult[] = [
    {message: 'test1', result: 'PASS'},
    {message: 'test2', result: 'FAIL'},
  ];

  const PASSED_TESTS_CONDITION: Condition[] = [{name: 'PASSED_ALL_TESTS'}];

  function validatorWith(results?: ValidationResult[]): TestResultValidator {
    const tracker = new TestTracker();
    if (results) {
      tracker.setValidationResults(results);
    }
    return new TestResultValidator(tracker);
  }

  it('meets the passed condition if all tests pass', () => {
    expect(validatorWith(PASSED_TESTS).conditionsMet(PASSED_TESTS_CONDITION)).toBe(
      true
    );
  });

  it('does not meet the passed condition if some tests fail', () => {
    expect(
      validatorWith(SOME_FAILED_TESTS).conditionsMet(PASSED_TESTS_CONDITION)
    ).toBe(false);
  });

  it('does not meet the passed condition if results are undefined', () => {
    expect(validatorWith().conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('does not meet the passed condition if results are empty', () => {
    expect(validatorWith([]).conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('returns the tracker results from getValidationResults', () => {
    expect(validatorWith(PASSED_TESTS).getValidationResults()).toEqual(
      PASSED_TESTS
    );
  });
});
