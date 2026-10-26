// Ported from apps/test/unit/code-studio/activityUtilsTest.js; the functions
// live in the progress slice here.

import {describe, expect, it} from 'vitest';

import {TestResults} from '../../constants';
import type {TestResult} from '../../types';
import {
  activityCssClass,
  mergeActivityResult,
  resultFromStatus,
} from '../progressSlice';

const r = (n: number) => n as TestResult;

describe('mergeActivityResult', () => {
  it('returns the result with highest priority', () => {
    expect(mergeActivityResult(r(100), r(200))).toBe(200);
    expect(mergeActivityResult(r(20), r(-50))).toBe(20);
    expect(mergeActivityResult(r(-3), r(-4))).toBe(-3);
  });

  it('returns the other result when one result is zero', () => {
    expect(mergeActivityResult(r(0), r(-2))).toBe(-2);
    expect(mergeActivityResult(r(-50), r(0))).toBe(-50);
    expect(mergeActivityResult(r(30), r(0))).toBe(30);
    expect(mergeActivityResult(r(0), r(0))).toBe(0);
  });
});

describe('activityCssClass', () => {
  it('returns the correct activity CSS class', () => {
    expect(activityCssClass(null as unknown as TestResult)).toBe('not_tried');
    expect(activityCssClass(TestResults.GENERIC_FAIL)).toBe('not_tried');
    expect(activityCssClass(TestResults.EXTRA_FUNCTION_FAIL)).toBe('attempted');
    expect(activityCssClass(TestResults.EXAMPLE_FAILED)).toBe('attempted');
    expect(activityCssClass(TestResults.TOO_MANY_BLOCKS_FAIL)).toBe('passed');
    expect(activityCssClass(r(29))).toBe('passed');
    expect(activityCssClass(r(31))).toBe('perfect');
    expect(activityCssClass(TestResults.CONTAINED_LEVEL_RESULT)).toBe(
      'perfect',
    );
    expect(activityCssClass(TestResults.SUBMITTED_RESULT)).toBe('submitted');
    expect(activityCssClass(TestResults.REVIEW_ACCEPTED_RESULT)).toBe(
      'review_accepted',
    );
    expect(activityCssClass(TestResults.REVIEW_REJECTED_RESULT)).toBe(
      'review_rejected',
    );
  });
});

describe('resultFromStatus', () => {
  it('inverts activityCssClass for the statuses it can', () => {
    for (const result of [
      TestResults.ALL_PASS,
      TestResults.SUBMITTED_RESULT,
      TestResults.REVIEW_ACCEPTED_RESULT,
      TestResults.REVIEW_REJECTED_RESULT,
    ]) {
      expect(resultFromStatus(activityCssClass(result))).toBe(result);
    }
    expect(resultFromStatus('free_play_complete')).toBe(TestResults.FREE_PLAY);
    expect(resultFromStatus(undefined)).toBe(TestResults.NO_TESTS_RUN);
  });
});
