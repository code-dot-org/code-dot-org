import {assert} from '../util/reconfiguredChai';

import {isPointInBounds, snapToGridSize} from '@cdo/apps/applab/gridUtils';

describe('snapToGridSize', function () {
  it('rounds to the nearest GRID_SIZE', function () {
    // our GRID_SIZE is 5
    assert.equal(snapToGridSize(0), 0);
    assert.equal(snapToGridSize(1), 0);
    assert.equal(snapToGridSize(5), 5);
    assert.equal(snapToGridSize(6), 5);
    assert.equal(snapToGridSize(9), 10);
  });
});

describe('isPointInBounds', function () {
  it('determines if a coordinate is in bounds or not', function () {
    assert.equal(
      isPointInBounds(1, 1, 100, 100),
      true,
      '(1, 1) is in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(0, 0, 100, 100),
      true,
      '(0, 0) is in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(0, 100, 100, 100),
      true,
      '(0, 100) is in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(100, 0, 100, 100),
      true,
      '(100, 0) is in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(100, 100, 100, 100),
      true,
      '(100, 100) is in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(-1, 1, 100, 100),
      false,
      '(-1, 1) is not in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(1, -1, 100, 100),
      false,
      '(1, -1) is not in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(-1, -1, 100, 100),
      false,
      '(-1, -1) is not in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(1, 101, 100, 100),
      false,
      '(1, 101) is not in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(101, 1, 100, 100),
      false,
      '(101, 1) is not in bounds of a 100x100 container'
    );
    assert.equal(
      isPointInBounds(101, 101, 100, 100),
      false,
      '(101, 101) is not in bounds of a 100x100 container'
    );
  });
});
