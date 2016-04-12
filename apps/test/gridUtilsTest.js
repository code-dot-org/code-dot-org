var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var gridUtils = require('@cdo/apps/applab/gridUtils');


// var testUtils = require('./util/testUtils');
// testUtils.setupLocales('applab');

describe('snapToGridSize', function () {
  it('rounds to the nearest GRID_SIZE', function () {
    // our GRID_SIZE is 5
    assert.equal(gridUtils.snapToGridSize(0), 0);
    assert.equal(gridUtils.snapToGridSize(1), 0);
    assert.equal(gridUtils.snapToGridSize(5), 5);
    assert.equal(gridUtils.snapToGridSize(6), 5);
    assert.equal(gridUtils.snapToGridSize(9), 10);
  });
});
