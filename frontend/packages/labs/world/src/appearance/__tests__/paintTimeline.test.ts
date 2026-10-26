// One moment of an animation, painted (specs/ANIMATION_PLAN.md).

import {describe, expect, it, vi} from 'vitest';

import {paintMoment, spriteOf} from '../paintTimeline';
import {stockAnimation} from '../stock';

/** A canvas that records what was drawn, with the cell it was cut from. */
const recorder = () => {
  const drawn: number[][] = [];
  const ctx = {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    globalAlpha: 1,
    drawImage: (...args: unknown[]) => drawn.push(args.slice(1, 5) as never),
  } as unknown as CanvasRenderingContext2D;
  return {ctx, drawn};
};

const STRIP = {width: 192, height: 32} as unknown as CanvasImageSource;
const BOX = {width: 64, height: 64};

describe('a moment of an animation', () => {
  const spin = stockAnimation('coinSpin')!.timeline;
  const at = (t: number) => {
    const {ctx, drawn} = recorder();
    paintMoment(ctx, BOX, spin, t, () => STRIP, 2);
    return drawn;
  };

  it('draws one cell of a strip, not the whole strip', () => {
    expect(at(0)).toEqual([[0, 0, 32, 32]]);
  });

  it('moves on to the next cell at the animation’s own rate', () => {
    // Twelve a second, so one lasts a twelfth.
    expect(at(1 / 12 + 0.001)).toEqual([[32, 0, 32, 32]]);
  });

  it('holds its last cell to the end, which is where a loop comes round', () => {
    expect(at(0.499)).toEqual([[160, 0, 32, 32]]);
  });

  it('paints nothing for a picture not to hand', () => {
    const {ctx, drawn} = recorder();
    paintMoment(ctx, BOX, spin, 0, () => undefined, 2);
    expect(drawn).toEqual([]);
  });

  it('reads a key as a file and a rectangle, or as a file', () => {
    expect(spriteOf('ball.png')).toEqual({file: 'ball.png'});
    expect(
      spriteOf({sprite: 'coin.png', cell: {x: 1, y: 2, width: 3, height: 4}}),
    ).toEqual({file: 'coin.png', cell: {x: 1, y: 2, width: 3, height: 4}});
    expect(spriteOf(undefined)).toBeNull();
  });
});
