/** @file Test of consoleShim.js which makes console functions safer to use
 *  on older browsers by filling in no-op functions. */
'use strict';

var assert = require('assert');
var progress = require('../../src/js/progress');

describe('progress', function () {
  it ('returns the correct activity CSS class', function () {
    assert(progress.activityCssClass(null), 'not_tried');
    assert(progress.activityCssClass(0), 'not_tried');
    assert(progress.activityCssClass(-5), 'attempted');
    assert(progress.activityCssClass(19), 'attempted');
    assert(progress.activityCssClass(20), 'passed');
    assert(progress.activityCssClass(29), 'passed');
    assert(progress.activityCssClass(30), 'perfect');
    assert(progress.activityCssClass(101), 'perfect');
  });
});

describe('bestResultLevelId', function() {
  var serverProgress;
  before(function() {
    serverProgress = {
      1: 0,
      2: 0,
      3: -50,
      4: 20,
      5: 100,
    };
  });
  it('returns the level when there\'s only one', function () {
    assert(progress.bestResultLevelId([1], serverProgress), 1);
  });
  it('returns the first level when none have progress', function () {
    assert(progress.bestResultLevelId([1, 2], serverProgress), 1);
  });
  it('returns the passed level', function () {
    assert(progress.bestResultLevelId([1, 4], serverProgress), 4);
  });
  it('returns the unsubmitted level', function () {
    assert(progress.bestResultLevelId([1, 3], serverProgress), 3);
  });
  it('returns the perfect level over the passed level', function () {
    assert(progress.bestResultLevelId([5, 4], serverProgress), 5);
  });
});
