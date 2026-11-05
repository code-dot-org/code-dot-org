import {
  DEFAULT_EYE_PX,
  drawMono,
  drawStereoPair,
  layerShifts,
  stereoFromQuery,
} from '@cdo/apps/p5lab/spritelab/lab2/stereo';

describe('stereoFromQuery', () => {
  it('is off without the parameter, or with it turned off', () => {
    expect(stereoFromQuery(undefined)).toBeNull();
    expect(stereoFromQuery('')).toBeNull();
    expect(stereoFromQuery('0')).toBeNull();
    expect(stereoFromQuery('false')).toBeNull();
  });

  it('takes the default eye offset for a bare switch', () => {
    expect(stereoFromQuery('1')).toEqual({eye: DEFAULT_EYE_PX});
    expect(stereoFromQuery('true')).toEqual({eye: DEFAULT_EYE_PX});
  });

  it('takes a larger number as the eye offset in px', () => {
    expect(stereoFromQuery('10')).toEqual({eye: 10});
  });
});

describe('layerShifts', () => {
  it('keeps the sprite plane on the screen at zoom 1, the background behind', () => {
    expect(layerShifts(6, 1)).toEqual({background: 6, foreground: -0});
  });

  it('brings the sprite plane forward as the camera zooms in', () => {
    expect(layerShifts(6, 3).foreground).toBeLessThan(0);
    expect(layerShifts(6, 3).background).toBe(6);
  });
});

// A painter that records what it draws where.
function painter() {
  const calls: unknown[][] = [];
  const record =
    (name: string) =>
    (...args: unknown[]) =>
      calls.push([name, ...args]);
  return {
    calls,
    save: record('save'),
    restore: record('restore'),
    setTransform: record('setTransform'),
    clearRect: record('clearRect'),
    beginPath: record('beginPath'),
    rect: record('rect'),
    clip: record('clip'),
    drawImage: record('drawImage'),
  };
}
const background = {} as CanvasImageSource;
const foreground = {} as CanvasImageSource;

describe('drawStereoPair', () => {
  it('draws each eye in its own half with the layers shifted apart', () => {
    const out = painter();
    drawStereoPair(
      out,
      {background, foreground},
      {background: 4, foreground: -2},
      400,
      400
    );
    const images = out.calls.filter(([name]) => name === 'drawImage');
    expect(images).toEqual([
      // Left eye: background left, sprites right, clipped to the left half.
      ['drawImage', background, -8, -4, 408, 408],
      ['drawImage', foreground, 2, 0, 400, 400],
      // Right eye: the reverse, in the right half.
      ['drawImage', background, 400, -4, 408, 408],
      ['drawImage', foreground, 398, 0, 400, 400],
    ]);
    const clips = out.calls.filter(([name]) => name === 'rect');
    expect(clips).toEqual([
      ['rect', 0, 0, 400, 400],
      ['rect', 400, 0, 400, 400],
    ]);
  });
});

describe('drawMono', () => {
  it('lays the layers back over each other unshifted', () => {
    const out = painter();
    drawMono(out, {background, foreground}, 400, 400);
    expect(out.calls.filter(([name]) => name === 'drawImage')).toEqual([
      ['drawImage', background, 0, 0, 400, 400],
      ['drawImage', foreground, 0, 0, 400, 400],
    ]);
  });
});
