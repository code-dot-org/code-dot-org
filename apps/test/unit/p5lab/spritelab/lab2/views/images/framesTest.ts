import {
  BASE_FRAME,
  FRAME_LABELS,
  frameCount,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/frames';

describe('frames', () => {
  it('names the five frames of a strip, the standing one being the base', () => {
    expect(FRAME_LABELS).toHaveLength(5);
    expect(FRAME_LABELS[BASE_FRAME]).toBe('Standing');
  });

  it('counts a strip by its cells, five at most', () => {
    expect(frameCount({naturalWidth: 320}, {x: 64, y: 64})).toBe(5);
    expect(frameCount({width: 192}, {x: 64, y: 64})).toBe(3);
    expect(frameCount({width: 640}, {x: 64, y: 64})).toBe(5);
    expect(frameCount({width: 10}, {x: 64, y: 64})).toBe(1);
  });
});
