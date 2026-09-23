import {playPlacement} from '@cdo/apps/p5lab/spritelab/lab2/views/Playspace';

// The canvas is 400px; the margin 12px; the guide sits 32px from the right
// edge and 20px from the bottom (Playspace, Guide).
const CANVAS = 400;
const box = (p: {scale: number; x: number; y: number}) => ({
  left: p.x,
  right: p.x + CANVAS * p.scale,
  top: p.y,
  bottom: p.y + CANVAS * p.scale,
});

const GUIDE = {width: 400, height: 196};

describe('playPlacement', () => {
  it('fills and centers the overlay with no guide', () => {
    const p = playPlacement({w: 1000, h: 600});
    expect(box(p)).toEqual({left: 212, right: 788, top: 12, bottom: 588});
  });

  it('sits beside the guide on a landscape window, centered in the room left', () => {
    const p = playPlacement({w: 1300, h: 650}, GUIDE);
    const b = box(p);
    const guideLeft = 1300 - GUIDE.width - 32;
    expect(b.right).toBeLessThanOrEqual(guideLeft - 12);
    expect((b.left + b.right) / 2).toBeCloseTo((guideLeft - 12) / 2);
    expect(b.bottom - b.top).toBe(650 - 24);
  });

  it('sits above the guide on a portrait window, centered across the width', () => {
    const p = playPlacement({w: 750, h: 1000}, GUIDE);
    const b = box(p);
    const guideTop = 1000 - GUIDE.height - 20;
    expect(b.bottom).toBeLessThanOrEqual(guideTop - 12);
    expect((b.left + b.right) / 2).toBe(375);
    expect(b.right - b.left).toBe(750 - 24);
  });

  it('keeps the whole overlay when the box clears a small guide', () => {
    const collapsed = {width: 144, height: 110};
    expect(playPlacement({w: 1300, h: 650}, collapsed)).toEqual(
      playPlacement({w: 1300, h: 650})
    );
  });

  it('never overlaps the guide, whichever stacking it picks', () => {
    for (const size of [
      {w: 1280, h: 620},
      {w: 900, h: 900},
      {w: 700, h: 1100},
      {w: 1920, h: 980},
    ]) {
      const b = box(playPlacement(size, GUIDE));
      const guideLeft = size.w - GUIDE.width - 32;
      const guideTop = size.h - GUIDE.height - 20;
      expect(b.right <= guideLeft || b.bottom <= guideTop).toBe(true);
    }
  });
});
