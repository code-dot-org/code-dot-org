// What the two appearance pickers offer, and what a row draws.
//
// Both were showing the wrong thing about the same files. The picture picker
// listed every stock image, strips included — and a strip is a truthful
// picture of a FILE and a useless one to place, because an actor given
// `coinSpin.png` draws six coins at once. The animation picker drew the strip
// too, as its description of the animation, which is a contact sheet where a
// learner wanted to see a spin.

import {render, screen} from '@testing-library/react';
import {act} from 'react';
import {describe, expect, it, vi} from 'vitest';

import {AnimationPreview} from '../AnimationPreview';
import {ImportAppearanceDialog} from '../ImportAppearanceDialog';
import {
  pictureSprites,
  stockAnimation,
  STOCK_ANIMATIONS,
  STOCK_SPRITES,
} from '../stock';

describe('what the picture picker offers', () => {
  it('leaves out the strips that exist only as animation frames', () => {
    const offered = new Set(pictureSprites().map(sprite => sprite.id));

    for (const animation of STOCK_ANIMATIONS) {
      for (const frame of animation.sprites) {
        expect(offered.has(frame), `${frame} is a strip`).toBe(false);
      }
    }
  });

  it('still offers every image that is a picture in its own right', () => {
    // The filter is subtraction, not a list: a picture is anything no
    // animation is made of, so a new drawing appears without being named here.
    const frames = new Set(
      STOCK_ANIMATIONS.flatMap(animation => animation.sprites),
    );
    const expected = STOCK_SPRITES.filter(one => !frames.has(one.id));

    expect(pictureSprites()).toEqual(expected);
  });

  it('offers the coin but not the coin spin', () => {
    // The case in one line, because the general claims above are both true of
    // an empty list.
    const offered = pictureSprites().map(sprite => sprite.id);

    expect(offered).toContain('coin');
    expect(offered).not.toContain('coinSpin');
  });
});

describe('the dialog itself', () => {
  const open = (kind: 'sprite' | 'animation') =>
    render(
      <ImportAppearanceDialog
        kind={kind}
        onImport={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

  /**
   * The name of each row, which is the first line of its label.
   *
   * A row's accessible name is its whole label — the name, the description and
   * the files it writes — so matching on the name alone means taking the first
   * line rather than searching the lot: "coin" appears in the coin's
   * description and in the coin spin's.
   */
  const rowNames = () =>
    screen
      .getAllByRole('button')
      .map(button => button.textContent?.trim() ?? '')
      .filter(Boolean);

  it('does not offer a strip among the pictures', () => {
    open('sprite');
    const names = rowNames();

    expect(names.some(name => name.startsWith('Coin'))).toBe(true);
    expect(names.some(name => name.startsWith('Coin Spin'))).toBe(false);
  });

  it('draws an animation as itself rather than as an image of the strip', () => {
    // The rows are the same buttons either way; what changes is the picture,
    // and an `<img>` in an animation row is the strip coming back.
    const {container} = open('animation');

    expect(rowNames().some(name => name.startsWith('Coin Spin'))).toBe(true);
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });

  it('DOES offer strips when frames are being cut from them', () => {
    // The one caller for which a spritesheet is the answer: the animation
    // editor, giving a frame its source. Giving an actor its picture and
    // giving a frame its source are the same dialog and opposite questions,
    // and hiding strips from both would have taken the sheet away from the
    // one place it belongs.
    render(
      <ImportAppearanceDialog
        kind="sprite"
        forFrames
        onImport={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(rowNames().some(name => name.startsWith('Coin Spin'))).toBe(true);
  });

  it('still draws a picture as an image', () => {
    const {container} = open('sprite');

    expect(container.querySelectorAll('img').length).toBeGreaterThan(0);
  });
});

describe('an animation row', () => {
  it('draws one frame at a time, not the whole strip', () => {
    // A strip is six cells wide. What a row shows is one cell of it, which is
    // the difference between a contact sheet and an animation.
    const spin = stockAnimation('coinSpin')!;
    const {container} = render(<AnimationPreview animation={spin} />);

    const cell = container.querySelector('span > span') as HTMLElement;
    expect(cell.style.width).toBe('32px');
    expect(cell.style.backgroundPosition).toBe('0px 0px');
  });

  it('moves on to the next frame at the document’s own rate', () => {
    // The rate comes out of the file the import writes, so the preview and the
    // imported animation cannot run at different speeds.
    vi.useFakeTimers();
    try {
      const spin = stockAnimation('coinSpin')!;
      const {container} = render(<AnimationPreview animation={spin} />);
      const cell = () => container.querySelector('span > span') as HTMLElement;
      expect(cell().style.backgroundPosition).toBe('0px 0px');

      // Twelve frames a second, so one lasts a twelfth.
      act(() => {
        vi.advanceTimersByTime(1000 / 12 + 1);
      });

      expect(cell().style.backgroundPosition).toBe('-32px 0px');
    } finally {
      vi.useRealTimers();
    }
  });

  it('comes back round to the first frame', () => {
    vi.useFakeTimers();
    try {
      const spin = stockAnimation('coinSpin')!;
      const {container} = render(<AnimationPreview animation={spin} />);
      const cell = () => container.querySelector('span > span') as HTMLElement;

      // Six frames at twelve a second: half a second is the whole loop.
      act(() => {
        vi.advanceTimersByTime(6 * (1000 / 12) + 6);
      });

      expect(cell().style.backgroundPosition).toBe('0px 0px');
    } finally {
      vi.useRealTimers();
    }
  });
});
