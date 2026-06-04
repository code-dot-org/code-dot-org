import JavaValidationTracker from '@cdo/apps/javalab/lab2/progress/JavaValidationTracker';
import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
import TestResultValidator from '@cdo/apps/lab2/progress/TestResultValidator';
import {Condition} from '@cdo/apps/lab2/types';

describe('TestResultValidator with a JavaValidationTracker', () => {
  const PASSED_TESTS: ValidationResult[] = [
    {message: 'Test.passOne', result: 'PASS'},
    {message: 'Test.passTwo', result: 'PASS'},
    {message: 'Test.expectedFail', result: 'EXPECTED_FAILURE'},
  ];

  const SOME_FAILED_TESTS: ValidationResult[] = [
    {message: 'Test.passOne', result: 'PASS'},
    {message: 'Test.fail', result: 'FAIL'},
  ];

  const PASSED_TESTS_CONDITION: Condition[] = [
    {
      name: 'PASSED_ALL_TESTS',
    },
  ];

  function trackerWith(results: ValidationResult[]): JavaValidationTracker {
    const tracker = new JavaValidationTracker();
    results.forEach(result => tracker.addValidationResult(result));
    return tracker;
  }

  it('meets the passed condition if all tests pass', () => {
    const validator = new TestResultValidator(trackerWith(PASSED_TESTS));
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(true);
  });

  it('does not meet the passed condition if some tests fail', () => {
    const validator = new TestResultValidator(trackerWith(SOME_FAILED_TESTS));
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('does not meet the passed condition if there are no results', () => {
    const validator = new TestResultValidator(trackerWith([]));
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('returns the tracker results from getValidationResults', () => {
    const validator = new TestResultValidator(trackerWith(PASSED_TESTS));
    expect(validator.getValidationResults()).toEqual(PASSED_TESTS);
  });
});
