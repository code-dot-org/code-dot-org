/** @file Test of progress.js. */

var assert = require('assert');
import { __testonly__ } from '@cdo/apps/code-studio/progressRedux';

describe('bestResultLevelId', function () {
  var progressData;
  const bestResultLevelId = __testonly__.bestResultLevelId;

  before(function () {
    progressData = {
      1: 0,
      2: 0,
      3: -50,
      4: 20,
      5: 100,
      6: 0,
      7: 100
    };
  });
  it('returns the level when there\'s only one', function () {
    assert.strictEqual(bestResultLevelId([1], progressData), 1);
  });
  it('returns the first level when none have progress', function () {
    assert.strictEqual(bestResultLevelId([1, 2], progressData), 1);
  });
  it('returns the passed level', function () {
    assert.strictEqual(bestResultLevelId([1, 4], progressData), 4);
  });
  it('returns the unsubmitted level', function () {
    assert.strictEqual(bestResultLevelId([1, 3], progressData), 3);
  });
  it('returns the perfect level over the passed level', function () {
    assert.strictEqual(bestResultLevelId([4, 5], progressData), 5);
  });
});
