import {Condition} from '@cdo/apps/lab2/types';
import PythonValidationTracker from '@cdo/apps/pythonlab/progress/PythonValidationTracker';
import PythonValidator from '@cdo/apps/pythonlab/progress/PythonValidator';

describe('PythonValidator', () => {
  const PASSED_TESTS = [
    new Map<string, string>([
      ['name', 'test1'],
      ['result', 'PASS'],
    ]),
    new Map<string, string>([
      ['name', 'test2'],
      ['result', 'PASS'],
    ]),
  ];

  const SOME_FAILED_TESTS = [
    new Map<string, string>([
      ['name', 'test1'],
      ['result', 'PASS'],
    ]),
    new Map<string, string>([
      ['name', 'test2'],
      ['result', 'FAIL'],
    ]),
  ];

  const PASSED_TESTS_CONDITION: Condition[] = [
    {
      name: 'PASSED_ALL_TESTS',
    },
  ];

  it('should meet all passed condition if all tests pass', () => {
    const validationTracker = new PythonValidationTracker();
    const validator = new PythonValidator(validationTracker);
    validationTracker.setValidationResults(PASSED_TESTS);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(true);
  });

  it('should not meet all passed condition if some tests failed', () => {
    const validationTracker = new PythonValidationTracker();
    const validator = new PythonValidator(validationTracker);
    validationTracker.setValidationResults(SOME_FAILED_TESTS);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('should not meet all passed condition if tests results are null', () => {
    const validationTracker = new PythonValidationTracker();
    const validator = new PythonValidator(validationTracker);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('should meet all passed condition if test results are an empty list', () => {
    const validationTracker = new PythonValidationTracker();
    const validator = new PythonValidator(validationTracker);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });
});
