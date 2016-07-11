var assert = require('assert');

import { activityCssClass, mergeActivityResult } from '@cdo/apps/code-studio/activityUtils';

describe("mergeActivityResult", function () {
  it('returns the result with highest priority', function () {
    assert.strictEqual(mergeActivityResult(100, 200), 200);
    assert.strictEqual(mergeActivityResult(20, -50), 20);
    assert.strictEqual(mergeActivityResult(-3, -4), -3);
  });
  it('returns the other result when one result is zero', function () {
    assert.strictEqual(mergeActivityResult(0, -2), -2);
    assert.strictEqual(mergeActivityResult(-50, 0), -50);
    assert.strictEqual(mergeActivityResult(30, 0), 30);
    assert.strictEqual(mergeActivityResult(0, 0), 0);
  });
});

describe('activityCssClass', function () {
  it ('returns the correct activity CSS class', function () {
    assert.strictEqual(activityCssClass(null), 'not_tried');
    assert.strictEqual(activityCssClass(0), 'not_tried');
    assert.strictEqual(activityCssClass(-5), 'attempted');
    assert.strictEqual(activityCssClass(19), 'attempted');
    assert.strictEqual(activityCssClass(20), 'passed');
    assert.strictEqual(activityCssClass(29), 'passed');
    assert.strictEqual(activityCssClass(30), 'perfect');
    assert.strictEqual(activityCssClass(101), 'perfect');
  });
});
