// Cutting the margin off the edges a surface has to join.
//
// THE REASON THIS IS NOT A PROMPT. A learner asked for a mossy platform tiling
// side to side, wrote "do not leave any gaps to the left or right" and "it
// should go to the left and right edges" into the box themselves, and got a
// platform with a transparent margin on both sides — so a row of them stood
// apart. The clause was wrong as well and was fixed (`generate/imagePrompts`),
// but a clause is a request, and this is arithmetic: a column where nothing is
// drawn is not part of the picture.
//
// jsdom gives a canvas no context, so the canvas is stood in for. What is
// being tested is the scanning, which is the part with a decision in it.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {trimToEdges} from '../shrinkPicture';

/** What the picture under test measures — set by `withPixels`. */
let measures = {width: 0, height: 0};

/** An image that decodes at once, at the size the picture was given. */
class Decoding {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = measures.width;
  height = measures.height;
  #src = '';

  set src(value: string) {
    this.#src = value;
    queueMicrotask(() => this.onload?.());
  }

  get src(): string {
    return this.#src;
  }
}

/** What the second canvas was asked to copy out — the crop, in other words. */
let copied: unknown[] | undefined;
/** Whether a canvas can be drawn on at all. */
let canDraw = true;

/**
 * Stand in for the canvas, with `pixels` as what the first one reads back.
 *
 * The alpha channel is all this looks at, so the other three are left at zero.
 */
const withPixels = (width: number, height: number, alpha: number[]) => {
  measures = {width, height};
  const data = new Uint8ClampedArray(width * height * 4);
  alpha.forEach((a, at) => {
    data[at * 4 + 3] = a;
  });
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag !== 'canvas') {
      return Object.create(HTMLElement.prototype) as HTMLElement;
    }
    return {
      width: 0,
      height: 0,
      getContext: () =>
        canDraw
          ? {
              drawImage: (...args: unknown[]) => {
                if (args.length > 3) {
                  copied = args;
                }
              },
              getImageData: () => ({data}),
              imageSmoothingEnabled: false,
            }
          : null,
      toDataURL: () => 'data:image/png;base64,TRIMMED',
    } as unknown as HTMLElement;
  });
};

const PICTURE = {
  dataUrl: 'data:image/png;base64,WHOLE',
  mediaType: 'image/png',
};

beforeEach(() => {
  copied = undefined;
  canDraw = true;
  measures = {width: 0, height: 0};
  vi.stubGlobal('Image', Decoding);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('trimToEdges', () => {
  it('cuts the empty columns off an edge that has to join', async () => {
    // Four wide, two tall; the outer columns are nothing.
    //   . # # .
    //   . # # .
    withPixels(4, 2, [0, 255, 255, 0, 0, 255, 255, 0]);

    const out = await trimToEdges(PICTURE, {across: true, up: false});

    expect(out.dataUrl).toBe('data:image/png;base64,TRIMMED');
    // …and what it copied out is the middle two columns, full height.
    expect(copied?.slice(1, 5)).toEqual([1, 0, 2, 2]);
  });

  it('leaves the other axis alone', async () => {
    // Empty rows top and bottom, empty columns left and right — and only the
    // sides asked for. A surface joining side to side keeps its own top.
    withPixels(4, 3, [0, 0, 0, 0, 0, 255, 255, 0, 0, 0, 0, 0]);

    await trimToEdges(PICTURE, {across: true, up: false});

    expect(copied?.slice(1, 5)).toEqual([1, 0, 2, 3]);
  });

  it('cuts rows where it is the rows that join', async () => {
    withPixels(2, 4, [0, 0, 255, 255, 255, 255, 0, 0]);

    await trimToEdges(PICTURE, {across: false, up: true});

    expect(copied?.slice(1, 5)).toEqual([0, 1, 2, 2]);
  });

  it('reads a nearly-invisible pixel as nothing drawn', async () => {
    // A soft edge is not a drawing, and a provider's anti-aliasing leaves one.
    withPixels(4, 1, [3, 255, 255, 2]);

    await trimToEdges(PICTURE, {across: true, up: false});

    expect(copied?.slice(1, 5)).toEqual([1, 0, 2, 1]);
  });

  it('hands back a picture with nothing to cut, and says what it measures', async () => {
    // The measurement is not a by-product: it is what the `set scale` row is
    // computed from, and nothing else is going to decode the picture to find
    // it (`actors/create/actorLook.withScale`).
    withPixels(2, 1, [255, 255]);

    expect(await trimToEdges(PICTURE, {across: true, up: false})).toEqual({
      ...PICTURE,
      width: 2,
      height: 1,
    });
  });

  it('hands back a picture that joins nothing, without decoding it', async () => {
    const made = vi.spyOn(document, 'createElement');

    expect(await trimToEdges(PICTURE, {across: false, up: false})).toBe(
      PICTURE,
    );
    expect(made).not.toHaveBeenCalled();
  });

  it('hands back a picture where nothing was drawn at all', async () => {
    // An entirely transparent answer is a failure to keep whole rather than
    // one to crop to a single pixel.
    withPixels(4, 2, [0, 0, 0, 0, 0, 0, 0, 0]);

    expect(await trimToEdges(PICTURE, {across: true, up: false})).toBe(PICTURE);
  });

  it('hands back a picture where the browser cannot draw', async () => {
    // The same trade `shrinkToFit` makes: losing a drawing a learner waited
    // half a minute for would be worse than a margin.
    canDraw = false;
    withPixels(4, 2, [0, 255, 255, 0, 0, 255, 255, 0]);

    expect(await trimToEdges(PICTURE, {across: true, up: false})).toBe(PICTURE);
  });
});
