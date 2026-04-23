import {
  ScreenRect,
  getCanvasBounds,
} from '@cdo/apps/sketchlab/reactFlow/utils/getCanvasBounds';

function rect(
  left: number,
  top: number,
  width: number,
  height: number
): ScreenRect {
  return {left, top, right: left + width, bottom: top + height, width, height};
}

describe('getCanvasBounds', () => {
  const ROOT = {left: 0, top: 0};
  const IDENTITY_VIEWPORT = {x: 0, y: 0, zoom: 1};

  it('returns null when no rects are supplied', () => {
    expect(getCanvasBounds([], ROOT, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('returns null when every rect has zero width and height', () => {
    const rects = [rect(10, 10, 0, 0), rect(100, 100, 0, 0)];
    expect(getCanvasBounds(rects, ROOT, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('returns the single rect when only one contributes', () => {
    const rects = [rect(10, 20, 100, 50)];
    expect(getCanvasBounds(rects, ROOT, IDENTITY_VIEWPORT)).toEqual({
      minX: 10,
      minY: 20,
      maxX: 110,
      maxY: 70,
    });
  });

  it('returns the bounding box for multiple non-overlapping rects', () => {
    const rects = [rect(0, 0, 50, 50), rect(200, 300, 50, 50)];
    expect(getCanvasBounds(rects, ROOT, IDENTITY_VIEWPORT)).toEqual({
      minX: 0,
      minY: 0,
      maxX: 250,
      maxY: 350,
    });
  });

  it('ignores zero-size rects but still encloses the rest', () => {
    const rects = [
      rect(10, 10, 0, 0),
      rect(0, 0, 50, 50),
      rect(200, 300, 0, 0),
    ];
    expect(getCanvasBounds(rects, ROOT, IDENTITY_VIEWPORT)).toEqual({
      minX: 0,
      minY: 0,
      maxX: 50,
      maxY: 50,
    });
  });

  it('subtracts the root-rect offset so rects are relative to the canvas', () => {
    const root = {left: 100, top: 200};
    const rects = [rect(150, 250, 40, 40)];
    expect(getCanvasBounds(rects, root, IDENTITY_VIEWPORT)).toEqual({
      minX: 50,
      minY: 50,
      maxX: 90,
      maxY: 90,
    });
  });

  it('subtracts the viewport pan offset', () => {
    const viewport = {x: 100, y: 50, zoom: 1};
    const rects = [rect(200, 150, 100, 100)];
    expect(getCanvasBounds(rects, ROOT, viewport)).toEqual({
      minX: 100,
      minY: 100,
      maxX: 200,
      maxY: 200,
    });
  });

  it('divides by the viewport zoom to recover flow-space distances', () => {
    const viewport = {x: 0, y: 0, zoom: 2};
    const rects = [rect(0, 0, 200, 200)];
    expect(getCanvasBounds(rects, ROOT, viewport)).toEqual({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });
  });

  it('handles root offset, pan, and zoom together', () => {
    const root = {left: 50, top: 50};
    const viewport = {x: 100, y: 100, zoom: 0.5};
    // Screen-space rect at (250, 250) with size 100x100. Subtract root (50, 50)
    // → (200, 200); subtract pan (100, 100) → (100, 100); divide by zoom (0.5)
    // → flow-space (200, 200) with size 200x200.
    const rects = [rect(250, 250, 100, 100)];
    expect(getCanvasBounds(rects, root, viewport)).toEqual({
      minX: 200,
      minY: 200,
      maxX: 400,
      maxY: 400,
    });
  });
});
