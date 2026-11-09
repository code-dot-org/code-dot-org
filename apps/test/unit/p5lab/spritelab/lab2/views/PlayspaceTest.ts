import {
  playLayout,
  playPlacement,
} from '@cdo/apps/p5lab/spritelab/lab2/views/Playspace';

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

  it('sits beside the guide on a landscape window, as near the center as it can', () => {
    const p = playPlacement({w: 1300, h: 650}, GUIDE);
    const b = box(p);
    const guideLeft = 1300 - GUIDE.width - 32;
    expect(b.right).toBeCloseTo(guideLeft - 12);
    expect(b.bottom - b.top).toBe(650 - 24);
  });

  it('clears a guide hung from the left on its right, as near the center as it can', () => {
    const p = playPlacement({w: 1300, h: 650}, GUIDE, 0, 0, 'left');
    const b = box(p);
    const guideRight = 32 + GUIDE.width;
    expect(b.left).toBeCloseTo(guideRight + 12);
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

  it('leaves the reserved room under the box, and centers box plus room', () => {
    const p = playPlacement({w: 1000, h: 600}, null, 52);
    expect(box(p)).toEqual({left: 238, right: 762, top: 12, bottom: 536});
  });

  it('keeps room to the left of the box, centering box plus room', () => {
    // 80px kept left in a 1000x600 overlay: the box centers in the 920
    // to its right, so it sits 40px right of where it would otherwise.
    const p = playPlacement({w: 1000, h: 600}, null, 0, 80);
    expect(box(p)).toEqual({left: 252, right: 828, top: 12, bottom: 588});
    expect(p.x - 80).toBeGreaterThanOrEqual(0);
  });

  it('keeps the reserved room clear of the guide too', () => {
    const b = box(playPlacement({w: 750, h: 1000}, GUIDE, 52));
    const guideTop = 1000 - GUIDE.height - 20;
    expect(b.bottom + 52).toBeLessThanOrEqual(guideTop - 12);
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

describe('playLayout', () => {
  // Three 34px keys and two 6px gaps across, two rows high.
  const CROSS = {w: 114, h: 74};
  const HALF_KEY = 17;

  it('centers the box on a wide stage, the cross in the room to its right, half a key left', () => {
    const {box: p, cross} = playLayout(
      {w: 1200, h: 600},
      null,
      'right',
      41,
      CROSS
    );
    const b = box(p);
    // The box fills the height less the bar, centered across the width.
    expect(b.bottom - b.top).toBe(600 - 41 - 24);
    expect(b.left).toBeCloseTo(1200 - b.right);
    expect(cross).not.toBeNull();
    expect(cross!.x + CROSS.w / 2).toBeCloseTo((b.right + 1200) / 2 - HALF_KEY);
    // Centered on the box's height.
    expect(cross!.y + CROSS.h / 2).toBeCloseTo((b.top + b.bottom) / 2);
  });

  it('narrows the box on both sides when the cross would not fit beside it', () => {
    const {box: p, cross} = playLayout(
      {w: 750, h: 600},
      null,
      'right',
      41,
      CROSS
    );
    const b = box(p);
    // A centered box filling the height leaves (750 - 535) / 2 right of
    // it, short of the cross and its margins: the box gives up that room
    // on both sides and stays centered.
    expect(b.right - b.left).toBe(750 - 2 * (CROSS.w + 24) - 24);
    expect(b.left).toBeCloseTo(750 - b.right);
    expect(b.right + CROSS.w + 2 * 12).toBeLessThanOrEqual(750);
    // Half a key left of center would touch the box: a margin off it instead.
    expect(cross!.x).toBeCloseTo(b.right + 12);
  });

  it('puts the cross under the box on a tall stage when that leaves it bigger', () => {
    const {box: p, cross} = playLayout(
      {w: 500, h: 1000},
      null,
      'right',
      41,
      CROSS
    );
    const b = box(p);
    expect(b.right - b.left).toBe(500 - 24);
    expect(cross!.y).toBeCloseTo(b.bottom + 12);
    expect(cross!.x + CROSS.w / 2).toBeCloseTo((b.left + b.right) / 2);
  });

  it('drops the box below the restart buttons when it would reach under them', () => {
    const corner = {w: 120, h: 70};
    const size = {w: 700, h: 850};
    const clear = playLayout(size, null, 'right', 41, CROSS, null).box;
    // Alone, the box fills the width and starts over the buttons' foot.
    expect(box(clear).top).toBeLessThan(8 + 70 + 12);
    const {box: p, cross} = playLayout(size, null, 'right', 41, CROSS, corner);
    const b = box(p);
    expect(b.top).toBeGreaterThanOrEqual(8 + 70 + 12);
    // Under them the height binds: the box, the cross and the bar share it.
    expect(b.right - b.left).toBe(850 - 90 - (CROSS.h + 12) - 41 - 24);
    expect(cross!.y).toBeCloseTo(b.bottom + 12);
    // A box with room to the right of it is left where it was.
    const wide = playLayout(
      {w: 1400, h: 600},
      null,
      'right',
      41,
      CROSS,
      corner
    );
    expect(box(wide.box)).toEqual(
      box(playLayout({w: 1400, h: 600}, null, 'right', 41, CROSS, null).box)
    );
  });

  it('places the box alone when there is no cross', () => {
    const {box: p, cross} = playLayout(
      {w: 1000, h: 600},
      null,
      'right',
      41,
      null
    );
    expect(cross).toBeNull();
    expect(box(p)).toEqual(box(playPlacement({w: 1000, h: 600}, null, 41)));
  });
});
