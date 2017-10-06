/** @file Test of progress.js. */

var assert = require('assert');
import { __testonly__ } from '@cdo/apps/code-studio/progressRedux';

describe('bestResultLevel', function () {
  var progressData;
  const bestResultLevel = __testonly__.bestResultLevel;

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
    assert.deepEqual(bestResultLevel([stubLevel(1)], progressData), stubLevel(1));
  });
  it('returns the first level when none have progress', function () {
    assert.deepEqual(bestResultLevel([stubLevel(1), stubLevel(2)], progressData), stubLevel(1));
  });
  it('returns the passed level', function () {
    assert.deepEqual(bestResultLevel([stubLevel(1), stubLevel(4)], progressData), stubLevel(4));
  });
  it('returns the unsubmitted level', function () {
    assert.deepEqual(bestResultLevel([stubLevel(1), stubLevel(3)], progressData), stubLevel(3));
  });
  it('returns the perfect level over the passed level', function () {
    assert.deepEqual(bestResultLevel([stubLevel(4), stubLevel(5)], progressData), stubLevel(5));
  });
});

function stubLevel(id) {
  return {
    id,
    contained_level_ids: [],
  };
}
