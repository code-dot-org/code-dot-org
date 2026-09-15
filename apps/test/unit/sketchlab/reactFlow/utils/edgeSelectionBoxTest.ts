import {computeEdgeSelectionBox} from '@cdo/apps/sketchlab/reactFlow/utils/edgeSelectionBox';

const BAND_WIDTH = 40;

// jsdom implements neither getTotalLength nor getPointAtLength, so stand in a
// path whose points come from a parametric function of distance along it.
function stubPath(spec: {
  length: number;
  pointAt: (distance: number) => {x: number; y: number};
  d?: string;
}): SVGPathElement {
  return {
    getAttribute: (name: string) => (name === 'd' ? spec.d ?? 'M0,0' : null),
    getTotalLength: () => spec.length,
    getPointAtLength: (distance: number) => spec.pointAt(distance),
  } as unknown as SVGPathElement;
}

function straightPath(
  start: {x: number; y: number},
  end: {x: number; y: number}
): SVGPathElement {
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  return stubPath({
    length,
    pointAt: distance => {
      const fraction = length ? distance / length : 0;
      return {
        x: start.x + (end.x - start.x) * fraction,
        y: start.y + (end.y - start.y) * fraction,
      };
    },
  });
}

describe('computeEdgeSelectionBox', () => {
  it('wraps a horizontal line in a band-tall rectangle', () => {
    const box = computeEdgeSelectionBox(
      straightPath({x: 100, y: 50}, {x: 300, y: 50}),
      BAND_WIDTH
    );

    expect(box).toEqual({
      centerX: 200,
      centerY: 50,
      width: 200 + BAND_WIDTH,
      height: BAND_WIDTH,
      angleDegrees: 0,
    });
  });

  it('orients the rectangle along the line', () => {
    const box = computeEdgeSelectionBox(
      straightPath({x: 0, y: 0}, {x: 100, y: 100}),
      BAND_WIDTH
    );

    expect(box?.angleDegrees).toBeCloseTo(45);
    expect(box?.centerX).toBeCloseTo(50);
    expect(box?.centerY).toBeCloseTo(50);
    expect(box?.height).toBeCloseTo(BAND_WIDTH);
  });

  it('grows the rectangle to cover a bowed line', () => {
    // A path bowing 30px off the straight run from (0,0) to (200,0).
    const bowed = stubPath({
      length: 200,
      pointAt: distance => ({
        x: distance,
        y: -30 * Math.sin((Math.PI * distance) / 200),
      }),
    });

    const box = computeEdgeSelectionBox(bowed, BAND_WIDTH);

    expect(box?.height).toBeCloseTo(30 + BAND_WIDTH);
    expect(box?.centerY).toBeCloseTo(-15);
  });

  // A line dragged down onto itself has no direction to orient by. It still
  // has to show a selection ring, or a keyboard user loses the focus indicator.
  it('rings a line collapsed onto a single point', () => {
    const box = computeEdgeSelectionBox(
      straightPath({x: 70, y: 20}, {x: 70, y: 20}),
      BAND_WIDTH
    );

    expect(box).toEqual({
      centerX: 70,
      centerY: 20,
      width: BAND_WIDTH,
      height: BAND_WIDTH,
      angleDegrees: 0,
    });
  });

  it('rings a curved line whose endpoints coincide', () => {
    // A loop leaving and returning to exactly (0,0), bowing 50px along -y.
    const loop = stubPath({
      length: 300,
      pointAt: distance => ({
        x: 0,
        y: -50 * (1 - Math.abs(1 - (2 * distance) / 300)),
      }),
    });

    const box = computeEdgeSelectionBox(loop, BAND_WIDTH);

    expect(box?.width).toBeCloseTo(BAND_WIDTH);
    expect(box?.height).toBeCloseTo(50 + BAND_WIDTH);
    expect(box?.centerY).toBeCloseTo(-25);
  });

  it('returns null for a path with no path data', () => {
    const empty = stubPath({length: 0, pointAt: () => ({x: 0, y: 0}), d: ''});

    expect(computeEdgeSelectionBox(empty, BAND_WIDTH)).toBeNull();
  });
});
