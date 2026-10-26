// `set sprite ⟨player ▾⟩` and `set background to ⟨cave ▾⟩`, with the picture in
// them.
//
// The two dropdowns in the lab whose subject IS a picture, and both said the
// name.
// The actor dropdowns have shown their actors since the thumbnails arrived
// (`moduleOptions.pictured`); this is the same move for the images those are
// made of, and it needs no rendering — a sprite already is the image.
//
// Two things are worth pinning rather than the drawing itself: that the name
// survives as the `alt` (which is what a screen reader hears and what Blockly
// reports as the field's text), and that a CELL of a spritesheet keeps its
// name, because a field image cannot crop one frame out of a strip.

import {beforeEach, describe, expect, it} from 'vitest';

import {
  backgroundOptions,
  setProjectBackgrounds,
  setProjectSprites,
  spriteOptions,
} from '../moduleOptions';
import {setProjectImages} from '../projectImages';

/** A one-pixel PNG, which is all a field image needs to be given. */
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('the sprite dropdown', () => {
  beforeEach(() => {
    setProjectImages({});
    setProjectSprites([]);
    setProjectBackgrounds([]);
  });

  it('offers the picture, with the name as its alt', () => {
    setProjectSprites([['Player', 'player.png']]);
    setProjectImages({'player.png': PIXEL});

    const [[option, value]] = spriteOptions();

    expect(value).toBe('player.png');
    expect(option).toEqual({
      src: PIXEL,
      width: 24,
      height: 24,
      alt: 'Player',
    });
  });

  it('says the name when no picture has arrived', () => {
    // An image still decoding, or a project opened a moment ago. Missing is a
    // fine answer, and the answer the dropdown gave before this existed.
    setProjectSprites([['Player', 'player.png']]);

    expect(spriteOptions()).toEqual([['Player', 'player.png']]);
  });

  it('says the name for one cell of a spritesheet', () => {
    // Drawn whole it would show all six frames squashed into a square; drawn
    // as the first it would be a picture of the wrong frame.
    setProjectSprites([['Switch 3', 'switch.png#2']]);
    setProjectImages({'switch.png': PIXEL, 'switch.png#2': PIXEL});

    expect(spriteOptions()).toEqual([['Switch 3', 'switch.png#2']]);
  });

  it('does the same for the backdrop dropdown', () => {
    // The other one whose subject is a picture, sharing the row and the
    // registry: a backdrop is an image the project holds, like a sprite, and
    // told apart from one only by the folder it is in.
    setProjectBackgrounds([['Cave', 'cave.png']]);
    setProjectImages({'cave.png': PIXEL});

    expect(backgroundOptions()).toEqual([
      [{src: PIXEL, width: 24, height: 24, alt: 'Cave'}, 'cave.png'],
    ]);
  });
});
