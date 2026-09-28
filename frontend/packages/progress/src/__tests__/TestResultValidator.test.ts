// Ported from apps/test/unit/lab2/progress/TestResultValidatorTest.ts.

import {describe, expect, it} from 'vitest';

import TestResultValidator from '../TestResultValidator';
import type {Condition, ValidationResult} from '../types';
import ValidationTracker from '../ValidationTracker';

// A minimal concrete tracker, so the validator is tested against the
// ValidationTracker contract rather than one lab's tracker.
class TestTracker extends ValidationTracker {
  setValidationResults(results: ValidationResult[]) {
    this.validationResults = results;
  }
}

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

function validatorWith(results?: ValidationResult[]) {
  const tracker = new TestTracker();
  if (results) {
    tracker.setValidationResults(results);
  }
  return {tracker, validator: new TestResultValidator(tracker)};
}

describe('TestResultValidator', () => {
  it('meets the passed condition if all tests pass', () => {
    const {validator} = validatorWith(PASSED_TESTS);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(true);
  });

  it('does not meet the passed condition if some tests fail', () => {
    const {validator} = validatorWith(SOME_FAILED_TESTS);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('does not meet the passed condition if results are undefined', () => {
    const {validator} = validatorWith();
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('does not meet the passed condition if results are empty', () => {
    const {validator} = validatorWith([]);
    expect(validator.conditionsMet(PASSED_TESTS_CONDITION)).toBe(false);
  });

  it('returns the tracker results from getValidationResults', () => {
    const {validator} = validatorWith(PASSED_TESTS);
    expect(validator.getValidationResults()).toEqual(PASSED_TESTS);
  });

  it('keeps test names pending when cleared on the same level', () => {
    const {validator} = validatorWith(SOME_FAILED_TESTS);
    validator.clear(false);
    expect(validator.getValidationResults()).toEqual([
      {message: 'test1', result: 'PENDING'},
      {message: 'test2', result: 'PENDING'},
    ]);
  });

  it('drops the results when cleared for a level change', () => {
    const {validator} = validatorWith(SOME_FAILED_TESTS);
    validator.clear(true);
    expect(validator.getValidationResults()).toBeUndefined();
  });
});
