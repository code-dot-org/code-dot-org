import {
  isFigure,
  isSolid,
  MAX_FRAME_ATTEMPTS,
  POSE_MATCH_THRESHOLD,
  poseMatch,
  silhouetteBands,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/poseScore';

// RGBA data from rows of 0/1: 1 = an opaque black pixel, 0 = transparent white.
function rgba(rows: number[][]) {
  const h = rows.length;
  const w = rows[0].length;
  const data = new Uint8ClampedArray(w * h * 4);
  rows.forEach((row, y) =>
    row.forEach((on, x) => {
      const i = (y * w + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = on ? 0 : 255;
      data[i + 3] = on ? 255 : 0;
    })
  );
  return {data, w, h};
}

describe('SpriteLab2 poseScore', () => {
  // A 10-row figure: narrow head/torso, arms out in the middle band, legs
  // apart at the bottom.
  const figure = rgba([
    [0, 0, 0, 1, 1, 0, 0, 0], // 0 head
    [0, 0, 0, 1, 1, 0, 0, 0], // 1
    [0, 0, 0, 1, 1, 0, 0, 0], // 2
    [0, 1, 1, 1, 1, 1, 1, 0], // 3 arms band starts at 30%
    [0, 0, 0, 1, 1, 0, 0, 0], // 4
    [0, 0, 0, 1, 1, 0, 0, 0], // 5
    [0, 0, 1, 1, 1, 1, 0, 0], // 6 legs band from 65%
    [0, 1, 1, 0, 0, 1, 1, 0], // 7
    [1, 1, 0, 0, 0, 0, 1, 1], // 8
    [1, 0, 0, 0, 0, 0, 0, 1], // 9
  ]);

  it('measures band widths over the silhouette height, within its own box', () => {
    const bands = silhouetteBands(figure.data, figure.w, figure.h, isSolid)!;
    expect(bands.arms).toBeCloseTo(6 / 10);
    expect(bands.legs).toBeCloseTo(8 / 10);
    // The same rows read as a figure on white give the same widths.
    expect(silhouetteBands(figure.data, figure.w, figure.h, isFigure)).toEqual(
      bands
    );
    expect(silhouetteBands(rgba([[0, 0]]).data, 2, 1, isSolid)).toBeNull();
  });

  it('scores a frame by how much of each band it kept, capped at one', () => {
    const wanted = {arms: 0.6, legs: 0.8};
    // Arms hanging, stride kept: the arms band gives it away.
    expect(poseMatch({arms: 0.3, legs: 0.8}, wanted)).toEqual({
      arms: 0.5,
      legs: 1,
      score: 0.5,
    });
    // Wider than the figure is not a fault.
    expect(poseMatch({arms: 0.9, legs: 0.9}, wanted).score).toBe(1);
    expect(poseMatch({arms: 0.45, legs: 0.6}, wanted).score).toBeCloseTo(0.75);
    // A figure with no width in a band asks nothing of that band.
    expect(poseMatch({arms: 0.1, legs: 0.5}, {arms: 0, legs: 0.5}).arms).toBe(
      1
    );
  });

  it('keeps the worst case inside the gateway rate limit', () => {
    expect(POSE_MATCH_THRESHOLD).toBeGreaterThan(0.5);
    expect(1 + 12 * MAX_FRAME_ATTEMPTS).toBeLessThan(50);
  });
});
