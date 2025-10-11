var gridUtils = require('@cdo/apps/applab/gridUtils');

describe('snapToGridSize', function () {
  it('rounds to the nearest GRID_SIZE', function () {
    // our GRID_SIZE is 5
    expect(gridUtils.snapToGridSize(0)).toBe(0);
    expect(gridUtils.snapToGridSize(1)).toBe(0);
    expect(gridUtils.snapToGridSize(5)).toBe(5);
    expect(gridUtils.snapToGridSize(6)).toBe(5);
    expect(gridUtils.snapToGridSize(9)).toBe(10);
  });
});

describe('isPointInBounds', function () {
  it('determines if a coordinate is in bounds or not', function () {
    expect(gridUtils.isPointInBounds(1, 1, 100, 100)).toBe(true);
    expect(gridUtils.isPointInBounds(0, 0, 100, 100)).toBe(true);
    expect(gridUtils.isPointInBounds(0, 100, 100, 100)).toBe(true);
    expect(gridUtils.isPointInBounds(100, 0, 100, 100)).toBe(true);
    expect(gridUtils.isPointInBounds(100, 100, 100, 100)).toBe(true);
    expect(gridUtils.isPointInBounds(-1, 1, 100, 100)).toBe(false);
    expect(gridUtils.isPointInBounds(1, -1, 100, 100)).toBe(false);
    expect(gridUtils.isPointInBounds(-1, -1, 100, 100)).toBe(false);
    expect(gridUtils.isPointInBounds(1, 101, 100, 100)).toBe(false);
    expect(gridUtils.isPointInBounds(101, 1, 100, 100)).toBe(false);
    expect(gridUtils.isPointInBounds(101, 101, 100, 100)).toBe(false);
  });
});
