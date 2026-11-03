import {CHARACTER_STRIP_BASE_FRAME} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {
  FRAME_LABELS,
  FRAME_ROW_ORDER,
  frameCount,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/frames';

describe('frames', () => {
  it('names the five frames of a strip, the standing one being the base', () => {
    expect(FRAME_LABELS).toHaveLength(5);
    expect(FRAME_LABELS[CHARACTER_STRIP_BASE_FRAME]).toBe('Standing');
  });

  it('shows the standing frame first in the row, then the rest in order', () => {
    expect(FRAME_ROW_ORDER).toEqual([1, 0, 2, 3, 4]);
  });

  it('counts a strip by its cells, five at most', () => {
    expect(frameCount(320, {x: 64, y: 64})).toBe(5);
    expect(frameCount(192, {x: 64, y: 64})).toBe(3);
    expect(frameCount(640, {x: 64, y: 64})).toBe(5);
    expect(frameCount(10, {x: 64, y: 64})).toBe(1);
  });
});
