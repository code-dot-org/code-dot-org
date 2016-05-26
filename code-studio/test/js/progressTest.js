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
