import {assert} from '../util/deprecatedChai';

var gridUtils = require('@cdo/apps/applab/gridUtils');

describe('snapToGridSize', function() {
  it('rounds to the nearest GRID_SIZE', function() {
    // our GRID_SIZE is 5
    assert.equal(gridUtils.snapToGridSize(0), 0);
    assert.equal(gridUtils.snapToGridSize(1), 0);
    assert.equal(gridUtils.snapToGridSize(5), 5);
    assert.equal(gridUtils.snapToGridSize(6), 5);
    assert.equal(gridUtils.snapToGridSize(9), 10);
  });
});

describe('isPointInBounds', function() {
  it('determines if a coordinate is in bounds or not', function() {
    assert.equal(
      gridUtils.isPointInBounds(1, 1, 100, 100),
      true,
      '(1, 1) is in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(0, 0, 100, 100),
      true,
      '(0, 0) is in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(0, 100, 100, 100),
      true,
      '(0, 100) is in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(100, 0, 100, 100),
      true,
      '(100, 0) is in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(100, 100, 100, 100),
      true,
      '(100, 100) is in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(-1, 1, 100, 100),
      false,
      '(-1, 1) is not in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(1, -1, 100, 100),
      false,
      '(1, -1) is not in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(-1, -1, 100, 100),
      false,
      '(-1, -1) is not in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(1, 101, 100, 100),
      false,
      '(1, 101) is not in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(101, 1, 100, 100),
      false,
      '(101, 1) is not in bounds of a 100x100 container'
    );
    assert.equal(
      gridUtils.isPointInBounds(101, 101, 100, 100),
      false,
      '(101, 101) is not in bounds of a 100x100 container'
    );
  });
});
