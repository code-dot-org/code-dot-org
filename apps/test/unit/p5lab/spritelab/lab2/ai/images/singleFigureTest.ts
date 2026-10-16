import {
  findFigureCells,
  keepLargestFigure,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/singleFigure';

// Opaque rectangles on a transparent 100x100 canvas.
function picture(...boxes: [number, number, number, number][]) {
  const w = 100;
  const h = 100;
  const data = new Uint8ClampedArray(w * h * 4);
  for (const [left, top, right, bottom] of boxes) {
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        data[(y * w + x) * 4 + 3] = 255;
      }
    }
  }
  return {data, w, h};
}
const cells = (p: ReturnType<typeof picture>) =>
  findFigureCells(p.data, p.w, p.h, 64);

describe('singleFigure', () => {
  it('sees one figure in one shape, even with a speck or a detached part beside it', () => {
    expect(cells(picture([20, 10, 60, 90]))).toHaveLength(1);
    expect(cells(picture([20, 10, 60, 90], [80, 40, 82, 42]))).toHaveLength(1);
    // A floating hand a third the body's size is the same character.
    expect(cells(picture([20, 10, 60, 90], [75, 20, 95, 60]))).toHaveLength(1);
  });

  it('sees two figures side by side, and four in a two-by-two sheet', () => {
    const pair = cells(picture([5, 10, 40, 90], [60, 10, 95, 90]));
    expect(pair.map(c => [c.left, c.right])).toEqual([
      [5, 40],
      [60, 95],
    ]);
    const grid = cells(
      picture(
        [5, 5, 40, 45],
        [60, 5, 95, 45],
        [5, 55, 40, 95],
        [60, 55, 95, 95]
      )
    );
    expect(grid).toHaveLength(4);
  });

  it('does not split a figure across a gap narrower than the minimum', () => {
    expect(cells(picture([5, 10, 40, 90], [46, 10, 95, 90]))).toHaveLength(1);
  });

  it('keeps the largest figure and clears the rest', () => {
    const p = picture([5, 10, 30, 90], [50, 10, 95, 90]);
    const kept = keepLargestFigure(p.data, p.w, p.h, cells(p));
    expect(kept && [kept.left, kept.right]).toEqual([50, 95]);
    expect(p.data[(50 * p.w + 10) * 4 + 3]).toBe(0);
    expect(p.data[(50 * p.w + 70) * 4 + 3]).toBe(255);
    expect(cells(p)).toHaveLength(1);
  });
});
