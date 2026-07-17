import {
  computeRotatedResize,
  resizeCursorForHandle,
  ResizeHandlePosition,
  RotatedResizeStart,
  RESIZE_HANDLE_POSITIONS,
} from '@cdo/apps/sketchlab/reactFlow/utils/rotatedResize';

const MIN_WIDTH = 80;
const MIN_HEIGHT = 60;

function makeStart(rotationDeg: number): RotatedResizeStart {
  return {position: {x: 100, y: 200}, width: 160, height: 120, rotationDeg};
}

function resize(
  start: RotatedResizeStart,
  handle: ResizeHandlePosition,
  pointerDelta: {x: number; y: number}
) {
  return computeRotatedResize({
    start,
    handle,
    pointerDelta,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
  });
}

// Axis factors per handle, mirrored from the implementation to compute
// expected anchors independently in tests.
const FACTORS: Record<ResizeHandlePosition, {x: number; y: number}> = {
  'top-left': {x: -1, y: -1},
  top: {x: 0, y: -1},
  'top-right': {x: 1, y: -1},
  right: {x: 1, y: 0},
  'bottom-right': {x: 1, y: 1},
  bottom: {x: 0, y: 1},
  'bottom-left': {x: -1, y: 1},
  left: {x: -1, y: 0},
};

// World position of the anchor (the point opposite the handle) for a box
// rotated about its center.
function anchorWorldPosition(
  box: {position: {x: number; y: number}; width: number; height: number},
  rotationDeg: number,
  handle: ResizeHandlePosition
) {
  const theta = (rotationDeg * Math.PI) / 180;
  const factors = FACTORS[handle];
  const center = {
    x: box.position.x + box.width / 2,
    y: box.position.y + box.height / 2,
  };
  const localX = (-factors.x * box.width) / 2;
  const localY = (-factors.y * box.height) / 2;
  return {
    x: center.x + localX * Math.cos(theta) - localY * Math.sin(theta),
    y: center.y + localX * Math.sin(theta) + localY * Math.cos(theta),
  };
}

describe('computeRotatedResize', () => {
  describe('rotation 0 behaves like plain axis-aligned resize', () => {
    it('bottom-right grows width and height without moving the node', () => {
      const result = resize(makeStart(0), 'bottom-right', {x: 30, y: 20});
      expect(result.position).toEqual({x: 100, y: 200});
      expect(result.width).toBe(190);
      expect(result.height).toBe(140);
    });

    it('top-left grows size and shifts position to pin the bottom-right', () => {
      const result = resize(makeStart(0), 'top-left', {x: -30, y: -20});
      expect(result.position).toEqual({x: 70, y: 180});
      expect(result.width).toBe(190);
      expect(result.height).toBe(140);
    });

    it('right edge changes only width', () => {
      const result = resize(makeStart(0), 'right', {x: 25, y: 999});
      expect(result.position).toEqual({x: 100, y: 200});
      expect(result.width).toBe(185);
      expect(result.height).toBe(120);
    });

    it('top edge changes only height and shifts y', () => {
      const result = resize(makeStart(0), 'top', {x: 999, y: -10});
      expect(result.position).toEqual({x: 100, y: 190});
      expect(result.width).toBe(160);
      expect(result.height).toBe(130);
    });
  });

  it('at rotation 90, dragging the bottom handle outward grows height', () => {
    // After a 90° rotation the node's bottom edge faces screen-left, so
    // dragging that handle further left grows the node's height.
    const result = resize(makeStart(90), 'bottom', {x: -15, y: 0});
    expect(result.height).toBeCloseTo(135);
    expect(result.width).toBeCloseTo(160);
  });

  describe.each([45, 90, 180, 30])('rotation %s', rotationDeg => {
    it.each(RESIZE_HANDLE_POSITIONS.map(handle => [handle] as const))(
      '%s handle keeps the opposite point fixed',
      handle => {
        const start = makeStart(rotationDeg);
        const anchorBefore = anchorWorldPosition(start, rotationDeg, handle);
        const result = resize(start, handle, {x: 23, y: -17});
        const anchorAfter = anchorWorldPosition(result, rotationDeg, handle);
        expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 9);
        expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 9);
      }
    );
  });

  it('matches hand-computed local deltas at rotation 45', () => {
    const pointerDelta = {x: 10, y: 20};
    const cos = Math.cos(Math.PI / 4);
    const sin = Math.sin(Math.PI / 4);
    const localDeltaX = pointerDelta.x * cos + pointerDelta.y * sin;
    const localDeltaY = -pointerDelta.x * sin + pointerDelta.y * cos;
    const result = resize(makeStart(45), 'bottom-right', pointerDelta);
    expect(result.width).toBeCloseTo(160 + localDeltaX);
    expect(result.height).toBeCloseTo(120 + localDeltaY);
  });

  describe('minimum size clamping', () => {
    it('pins dimensions at the minimum', () => {
      const result = resize(makeStart(0), 'bottom-right', {x: -500, y: -500});
      expect(result.width).toBe(MIN_WIDTH);
      expect(result.height).toBe(MIN_HEIGHT);
    });

    it('keeps the anchor fixed even when clamped, on a rotated node', () => {
      const rotationDeg = 30;
      const start = makeStart(rotationDeg);
      const anchorBefore = anchorWorldPosition(start, rotationDeg, 'top-left');
      const result = resize(start, 'top-left', {x: 500, y: 500});
      expect(result.width).toBe(MIN_WIDTH);
      expect(result.height).toBe(MIN_HEIGHT);
      const anchorAfter = anchorWorldPosition(result, rotationDeg, 'top-left');
      expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 9);
      expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 9);
    });
  });

  it('edge handles ignore pointer motion perpendicular to their axis', () => {
    const start = makeStart(45);
    const alongPerpendicular = resize(start, 'right', {
      // Perpendicular to the rotated x-axis (cos45, sin45) is (-sin45, cos45).
      x: -Math.SQRT1_2 * 40,
      y: Math.SQRT1_2 * 40,
    });
    expect(alongPerpendicular.width).toBeCloseTo(160);
    expect(alongPerpendicular.height).toBeCloseTo(120);
    expect(alongPerpendicular.position.x).toBeCloseTo(100);
    expect(alongPerpendicular.position.y).toBeCloseTo(200);
  });

  it('handles rotations outside 0-359', () => {
    const wrapped = resize(makeStart(360 + 45), 'bottom-right', {x: 10, y: 20});
    const canonical = resize(makeStart(45), 'bottom-right', {x: 10, y: 20});
    expect(wrapped.width).toBeCloseTo(canonical.width);
    expect(wrapped.height).toBeCloseTo(canonical.height);
    expect(wrapped.position.x).toBeCloseTo(canonical.position.x);
    expect(wrapped.position.y).toBeCloseTo(canonical.position.y);
  });
});

describe('resizeCursorForHandle', () => {
  it('matches the standard axis-aligned cursors at rotation 0', () => {
    expect(resizeCursorForHandle('top', 0)).toBe('ns-resize');
    expect(resizeCursorForHandle('bottom', 0)).toBe('ns-resize');
    expect(resizeCursorForHandle('left', 0)).toBe('ew-resize');
    expect(resizeCursorForHandle('right', 0)).toBe('ew-resize');
    expect(resizeCursorForHandle('top-left', 0)).toBe('nwse-resize');
    expect(resizeCursorForHandle('bottom-right', 0)).toBe('nwse-resize');
    expect(resizeCursorForHandle('top-right', 0)).toBe('nesw-resize');
    expect(resizeCursorForHandle('bottom-left', 0)).toBe('nesw-resize');
  });

  it('shifts cursors two slots at rotation 90', () => {
    expect(resizeCursorForHandle('top', 90)).toBe('ew-resize');
    expect(resizeCursorForHandle('right', 90)).toBe('ns-resize');
    expect(resizeCursorForHandle('top-right', 90)).toBe('nwse-resize');
    expect(resizeCursorForHandle('bottom-right', 90)).toBe('nesw-resize');
  });

  it('quantizes to the nearest 45 degrees', () => {
    expect(resizeCursorForHandle('top', 22)).toBe('ns-resize');
    expect(resizeCursorForHandle('top', 23)).toBe('nesw-resize');
    expect(resizeCursorForHandle('top', 338)).toBe('ns-resize');
    expect(resizeCursorForHandle('top', 337)).toBe('nwse-resize');
  });

  it('handles negative rotations', () => {
    expect(resizeCursorForHandle('top', -90)).toBe('ew-resize');
  });
});
