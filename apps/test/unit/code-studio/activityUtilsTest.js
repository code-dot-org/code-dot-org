import {
  activityCssClass,
  mergeActivityResult,
} from '@cdo/apps/code-studio/activityUtils';
import {TestResults} from '@cdo/apps/constants';

describe('mergeActivityResult', function () {
  it('returns the result with highest priority', function () {
    expect(mergeActivityResult(100, 200)).toBe(200);
    expect(mergeActivityResult(20, -50)).toBe(20);
    expect(mergeActivityResult(-3, -4)).toBe(-3);
  });
  it('returns the other result when one result is zero', function () {
    expect(mergeActivityResult(0, -2)).toBe(-2);
    expect(mergeActivityResult(-50, 0)).toBe(-50);
    expect(mergeActivityResult(30, 0)).toBe(30);
    expect(mergeActivityResult(0, 0)).toBe(0);
  });
});

describe('activityCssClass', function () {
  it('returns the correct activity CSS class', function () {
    expect(activityCssClass(null)).toBe('not_tried');
    expect(activityCssClass(TestResults.GENERIC_FAIL)).toBe('not_tried');
    expect(activityCssClass(TestResults.EXTRA_FUNCTION_FAIL)).toBe('attempted');
    expect(activityCssClass(TestResults.EXAMPLE_FAILED)).toBe('attempted');
    expect(activityCssClass(TestResults.MINIMUM_PASS_RESULT)).toBe('passed');
    expect(activityCssClass(29)).toBe('passed');
    expect(activityCssClass(31)).toBe('perfect');
    expect(activityCssClass(TestResults.CONTAINED_LEVEL_RESULT)).toBe(
      'perfect'
    );
  });
});
