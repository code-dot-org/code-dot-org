// The pixel editor, drawn on.
//
// It had no tests, and the reason is the same one the map stage had: jsdom
// implements no canvas at all. This editor needs more of one than the stage
// did, because its canvas is not a view of a document — it IS the document,
// and every tool reads and writes its pixels. So the harness below is a small
// 2D context that keeps a real buffer and answers `getImageData` /
// `putImageData` faithfully; everything else it is asked to do, it records
// and ignores. Four more stubs go with it, each for something jsdom does not
// have: `ImageData`, an `Image` that loads, a rectangle for the display
// canvas (`getBoundingClientRect` is all zeros, and a zero-width canvas maps
// every pointer to NaN), and pointer capture.
//
// What that buys is the three behaviours nothing was checking, all of which
// are about WHEN a file is written: opening one must not write it, a burst of
// strokes must write once, and an undo is an edit like any other.

import {act, fireEvent, render, screen} from '@testing-library/react';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {RGBA} from '../tools';

/** The rectangle the display canvas reports, so a pointer maps to a pixel. */
const DISPLAY_RECT = {left: 0, top: 0, width: 256, height: 256};

/** A stand-in for the browser's `ImageData`: the shape a `Raster` is. */
class ImageDataStub {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}

/**
 * A 2D context that keeps its pixels.
 *
 * Faithful for the two calls the editor's correctness rests on —
 * `getImageData` hands back a copy, `putImageData` takes one — and a
 * deliberate no-op for the rest. `drawImage` fills from the source's own
 * buffer when it has one (the load path draws the decoded image into the
 * backing), which is what makes the loaded picture something a test can
 * recognise afterwards.
 */
const contextFor = (
  canvas: HTMLCanvasElement & {pixels?: Uint8ClampedArray},
) => {
  const size = () => canvas.width * canvas.height * 4;
  if (!canvas.pixels || canvas.pixels.length !== size()) {
    canvas.pixels = new Uint8ClampedArray(size());
  }
  return {
    canvas,
    imageSmoothingEnabled: false,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    getImageData: (_x: number, _y: number, w: number, h: number) =>
      new ImageDataStub(
        new Uint8ClampedArray(canvas.pixels!.subarray(0, w * h * 4)),
        w,
        h,
      ),
    putImageData: (image: ImageDataStub) => {
      canvas.pixels!.set(image.data.subarray(0, canvas.pixels!.length));
    },
    drawImage: (source: {pixels?: Uint8ClampedArray}) => {
      if (source.pixels) {
        canvas.pixels!.set(source.pixels.subarray(0, canvas.pixels!.length));
      }
    },
    clearRect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    setTransform: () => {},
    setLineDash: () => {},
  } as unknown as CanvasRenderingContext2D;
};

/** A picture's pixels as a short digest, which is what `toDataURL` returns. */
const digest = (pixels: Uint8ClampedArray): string => {
  let hash = 0;
  for (let i = 0; i < pixels.length; i++) {
    hash = (hash * 31 + pixels[i]) >>> 0;
  }
  return `data:image/png;base64,${hash.toString(16)}`;
};

/** What the loaded image is made of: a field one colour, 16×16. */
const LOADED: RGBA = [10, 20, 30, 255];
const IMAGE_SIDE = 16;

const originals = {
  getContext: HTMLCanvasElement.prototype.getContext,
  toDataURL: HTMLCanvasElement.prototype.toDataURL,
  rect: Element.prototype.getBoundingClientRect,
  setPointerCapture: HTMLElement.prototype.setPointerCapture,
  Image: globalThis.Image,
  ImageData: (globalThis as {ImageData?: unknown}).ImageData,
};

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
    return contextFor(this);
  } as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.toDataURL = function (
    this: HTMLCanvasElement & {pixels?: Uint8ClampedArray},
  ) {
    return digest(this.pixels ?? new Uint8ClampedArray());
  };
  Element.prototype.getBoundingClientRect = function (this: Element) {
    return this instanceof HTMLCanvasElement
      ? ({...DISPLAY_RECT, right: 256, bottom: 256} as DOMRect)
      : ({left: 0, top: 0, width: 0, height: 0} as DOMRect);
  };
  HTMLElement.prototype.setPointerCapture = () => {};
  (globalThis as {ImageData?: unknown}).ImageData = ImageDataStub;
  // An image that loads: the editor decodes through an `<img>` on purpose
  // (the URL is one the project holds, not an endpoint), so this is the seam.
  class LoadingImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    crossOrigin = '';
    naturalWidth = IMAGE_SIDE;
    naturalHeight = IMAGE_SIDE;
    pixels = new Uint8ClampedArray(IMAGE_SIDE * IMAGE_SIDE * 4);
    set src(_value: string) {
      for (let i = 0; i < IMAGE_SIDE * IMAGE_SIDE; i++) {
        this.pixels.set(LOADED, i * 4);
      }
      queueMicrotask(() => this.onload?.());
    }
  }
  globalThis.Image = LoadingImage as unknown as typeof Image;
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = originals.getContext;
  HTMLCanvasElement.prototype.toDataURL = originals.toDataURL;
  Element.prototype.getBoundingClientRect = originals.rect;
  HTMLElement.prototype.setPointerCapture = originals.setPointerCapture;
  globalThis.Image = originals.Image;
  (globalThis as {ImageData?: unknown}).ImageData = originals.ImageData;
});

beforeEach(() => {
  vi.useRealTimers();
});

const {default: PixelEditor} = await import('../PixelEditor');

/** Mount the editor and wait for the image to have loaded into the backing. */
const open = async (props: Partial<Parameters<typeof PixelEditor>[0]> = {}) => {
  const onCommit = vi.fn();
  const view = render(
    <PixelEditor
      title="coin.png"
      imageUrl="data:image/png;base64,iVBORw0KGgo="
      onCommit={onCommit}
      {...props}
    />,
  );
  // The load resolves in a microtask, and `setLoaded` is the state it sets.
  await act(async () => {
    await Promise.resolve();
  });
  const canvas = view.container.querySelector('canvas') as HTMLCanvasElement;
  return {onCommit, canvas, ...view};
};

/** A pointer event, as a mouse event of that name (jsdom has no pointers). */
const pointer = (
  target: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  x: number,
  y: number,
  init: MouseEventInit = {},
) =>
  fireEvent(
    target,
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      buttons: type === 'pointerup' ? 0 : 1,
      ...init,
    }),
  );

/** One complete stroke: press, move, release. */
const stroke = (canvas: Element, from = 8, to = 40) => {
  pointer(canvas, 'pointerdown', from, from);
  pointer(canvas, 'pointermove', to, to);
  pointer(canvas, 'pointerup', to, to);
};

/** Run the commit debounce out. */
const settle = async () => {
  await act(async () => {
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
  });
};

describe('opening a picture', () => {
  it('loads it without writing it back', async () => {
    // THE TRAP THIS GUARDS. Loading rewrote the file on open in the Blockly
    // editor for months, and the same shape is here: a commit keyed on
    // anything that changes at mount would save every picture a learner
    // merely looked at, which is a modified file, a recompile, and a diff
    // nobody made.
    vi.useFakeTimers();
    const {onCommit} = await open();
    await settle();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('says so when the picture will not load', async () => {
    const failing = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      crossOrigin = '';
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    };
    const kept = globalThis.Image;
    globalThis.Image = failing as unknown as typeof Image;
    try {
      await open();
      expect(
        screen.getByText(/image couldn.t be loaded for editing/i),
      ).toBeInTheDocument();
    } finally {
      globalThis.Image = kept;
    }
  });
});

describe('drawing', () => {
  it('writes the file once the drawing settles', async () => {
    vi.useFakeTimers();
    const {canvas, onCommit} = await open();

    stroke(canvas);
    expect(onCommit).not.toHaveBeenCalled(); // not yet — it is debounced
    await settle();

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0][0]).toMatch(/^data:image\/png;base64,/);
  });

  it('coalesces a burst of strokes into one save', async () => {
    // Writing the file recompiles the game, so a drawing hand must not
    // trigger one per stroke — and the last stroke must still be in it.
    vi.useFakeTimers();
    const {canvas, onCommit} = await open();

    stroke(canvas, 8, 24);
    stroke(canvas, 24, 40);
    stroke(canvas, 40, 56);
    await settle();

    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('actually changes the pixels, so the saves differ', async () => {
    vi.useFakeTimers();
    const {canvas, onCommit} = await open();

    stroke(canvas, 8, 24);
    await settle();
    const first = onCommit.mock.calls[0][0];

    stroke(canvas, 100, 160);
    await settle();
    const second = onCommit.mock.calls[1][0];

    expect(second).not.toBe(first);
  });

  it('never writes the file when the workspace is locked', async () => {
    // Worth stating precisely, because it is narrower than it sounds:
    // read-only gates the COMMIT and one toolbar control, and the pointer
    // handlers draw regardless. So a learner on a locked level can scribble
    // on the canvas and have every mark silently dropped when they leave.
    // Nothing is written either way, which is the property that matters
    // here; whether the marks should be refused at the pointer is a
    // question for whoever owns the locked-level experience.
    vi.useFakeTimers();
    const {canvas, onCommit} = await open({isReadOnly: true});

    stroke(canvas);
    await settle();

    expect(onCommit).not.toHaveBeenCalled();
  });
});

describe('undo and redo', () => {
  /** The buttons, by the label they carry. */
  const undoButton = () => screen.getByRole('button', {name: /undo/i});
  const redoButton = () => screen.getByRole('button', {name: /redo/i});

  it('has nothing to undo before anything is drawn', async () => {
    await open();
    expect(undoButton()).toBeDisabled();
    expect(redoButton()).toBeDisabled();
  });

  it('takes a stroke back, and puts it forward again', async () => {
    const {canvas} = await open();

    stroke(canvas);
    expect(undoButton()).toBeEnabled();

    fireEvent.click(undoButton());
    expect(redoButton()).toBeEnabled();

    fireEvent.click(redoButton());
    expect(undoButton()).toBeEnabled();
  });

  it('saves an undo, because an undo is an edit', async () => {
    // The bargain the whole editor makes: it is a file editor, and a file
    // editor saves what you did. Taking something back is something you did.
    vi.useFakeTimers();
    const {canvas, onCommit} = await open();

    stroke(canvas);
    await settle();
    expect(onCommit).toHaveBeenCalledTimes(1);

    fireEvent.click(undoButton());
    await settle();
    expect(onCommit).toHaveBeenCalledTimes(2);
  });

  it('forgets the redo once a new stroke replaces it', async () => {
    // A branch nobody can reach: after undoing and drawing something else,
    // the thing that was undone is not on any path forward.
    const {canvas} = await open();

    stroke(canvas, 8, 24);
    fireEvent.click(undoButton());
    expect(redoButton()).toBeEnabled();

    stroke(canvas, 40, 56);
    expect(redoButton()).toBeDisabled();
  });
});
