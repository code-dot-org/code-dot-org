var assert = require('assert');
import {TestResults} from '@cdo/apps/constants';

import {
  activityCssClass,
  mergeActivityResult
} from '@cdo/apps/code-studio/activityUtils';

describe('mergeActivityResult', function() {
  it('returns the result with highest priority', function() {
    assert.strictEqual(mergeActivityResult(100, 200), 200);
    assert.strictEqual(mergeActivityResult(20, -50), 20);
    assert.strictEqual(mergeActivityResult(-3, -4), -3);
  });
  it('returns the other result when one result is zero', function() {
    assert.strictEqual(mergeActivityResult(0, -2), -2);
    assert.strictEqual(mergeActivityResult(-50, 0), -50);
    assert.strictEqual(mergeActivityResult(30, 0), 30);
    assert.strictEqual(mergeActivityResult(0, 0), 0);
  });
});

describe('activityCssClass', function() {
  it('returns the correct activity CSS class', function() {
    assert.strictEqual(activityCssClass(null), 'not_tried');
    assert.strictEqual(activityCssClass(TestResults.GENERIC_FAIL), 'not_tried');
    assert.strictEqual(
      activityCssClass(TestResults.EXTRA_FUNCTION_FAIL),
      'attempted'
    );
    assert.strictEqual(
      activityCssClass(TestResults.EXAMPLE_FAILED),
      'attempted'
    );
    assert.strictEqual(
      activityCssClass(TestResults.MINIMUM_PASS_RESULT),
      'passed'
    );
    assert.strictEqual(activityCssClass(29), 'passed');
    assert.strictEqual(activityCssClass(31), 'perfect');
    assert.strictEqual(
      activityCssClass(TestResults.CONTAINED_LEVEL_RESULT),
      'perfect'
    );
  });
});
