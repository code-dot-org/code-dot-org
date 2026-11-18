import {
  checkerCellFraction,
  checkerCellSize,
  displayScale,
  pixelGridFor,
} from '@cdo/apps/pixelEditor/displayGrid';

describe('displayGrid', () => {
  it('scales a backing image up by a whole number, to at most 640 pixels', () => {
    expect(displayScale(64, 64)).toBe(10);
    expect(displayScale(90, 60)).toBe(7);
    expect(displayScale(1024, 1024)).toBe(1);
  });

  it('makes a checkerboard cell one art pixel, or several when they are small', () => {
    expect(checkerCellSize(10, true)).toBe(10);
    expect(checkerCellSize(3, true)).toBe(6);
    expect(checkerCellSize(1, true)).toBe(4);
  });

  it('makes a checkerboard cell 16 display pixels outside pixel mode', () => {
    expect(checkerCellSize(1, false)).toBe(16);
  });

  it("gives a cell's side as a fraction of the picture's longer side", () => {
    expect(checkerCellFraction(64, 64, true)).toBeCloseTo(1 / 64, 10);
    expect(checkerCellFraction(90, 60, true)).toBeCloseTo(1 / 90, 10);
    expect(checkerCellFraction(320, 320, true)).toBeCloseTo(2 / 320, 10);
    expect(checkerCellFraction(1024, 512, false)).toBeCloseTo(16 / 1024, 10);
  });

  it('takes a known grid only when it divides the picture cleanly', () => {
    expect(pixelGridFor(640, 640, 10)).toBe(10);
    expect(pixelGridFor(64, 64, 1)).toBe(1);
    expect(pixelGridFor(645, 640, 10)).toBeNull();
    expect(pixelGridFor(640, 640)).toBeNull();
    expect(pixelGridFor(640, 640, 0)).toBeNull();
  });
});
