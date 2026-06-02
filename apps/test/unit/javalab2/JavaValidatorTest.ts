import JavaValidationTracker from '@cdo/apps/javalab/lab2/progress/JavaValidationTracker';
import JavaValidator from '@cdo/apps/javalab/lab2/progress/JavaValidator';
import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
import {Condition} from '@cdo/apps/lab2/types';

describe('JavaValidator', () => {
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

  it('meets the passed condition if all tests pass', () => {
    const tracker = new JavaValidationTracker();
    const validator = new JavaValidator(tracker);
    tracker.setValidationResults(PASSED_TESTS);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(true);
  });

  it('does not meet the passed condition if some tests fail', () => {
    const tracker = new JavaValidationTracker();
    const validator = new JavaValidator(tracker);
    tracker.setValidationResults(SOME_FAILED_TESTS);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('does not meet the passed condition if results are undefined', () => {
    const tracker = new JavaValidationTracker();
    const validator = new JavaValidator(tracker);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('does not meet the passed condition if results are an empty list', () => {
    const tracker = new JavaValidationTracker();
    const validator = new JavaValidator(tracker);
    tracker.setValidationResults([]);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('returns the tracker results from getValidationResults', () => {
    const tracker = new JavaValidationTracker();
    const validator = new JavaValidator(tracker);
    tracker.setValidationResults(PASSED_TESTS);
    expect(validator.getValidationResults()).toEqual(PASSED_TESTS);
  });
});
