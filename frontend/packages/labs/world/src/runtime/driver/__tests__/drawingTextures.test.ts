// Commands onto a canvas, and one texture per distinct picture.
//
// The engine's half is pinned in `engine/__tests__/drawing`; this is the other
// side of the same claim. What matters here is not that a rectangle is drawn —
// it is that a picture is made ONCE and then found, because that is what makes
// running the routine every frame affordable (specs/DRAWING.md).

import {describe, expect, it, vi} from 'vitest';

import type {DrawCommand, DrawingState} from 'world-lab';

import {DrawingTextures, paintDrawing} from '../drawingTextures';

/** A 2D context that records what was asked of it rather than drawing it. */
function recordingContext() {
  const calls: string[] = [];
  const context = {
    calls,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    beginPath: () => calls.push('beginPath'),
    moveTo: (...a: number[]) => calls.push(`moveTo(${a})`),
    lineTo: (...a: number[]) => calls.push(`lineTo(${a})`),
    arc: (...a: number[]) => calls.push(`arc(${a.slice(0, 3)})`),
    fill: function () {
      calls.push(`fill:${this.fillStyle}`);
    },
    stroke: function () {
      calls.push(`stroke:${this.strokeStyle}@${this.lineWidth}`);
    },
    fillRect: function (...a: number[]) {
      calls.push(`fillRect(${a}):${this.fillStyle}`);
    },
    strokeRect: function (...a: number[]) {
      calls.push(`strokeRect(${a}):${this.strokeStyle}`);
    },
    fillText: function (text: string) {
      calls.push(
        `fillText(${text}):${this.fillStyle}:${this.font}:${this.textAlign}/${this.textBaseline}`,
      );
    },
    strokeText: (text: string) => calls.push(`strokeText(${text})`),
    drawImage: (...a: unknown[]) => calls.push(`drawImage(${a.length - 1})`),
  };
  return context as unknown as CanvasRenderingContext2D & {calls: string[]};
}

const paint = (commands: DrawCommand[], sprite?: CanvasImageSource) => {
  const context = recordingContext();
  paintDrawing(context, commands, () => sprite);
  return (context as unknown as {calls: string[]}).calls;
};

describe('painting a command list', () => {
  it('fills and strokes a rectangle in the paint it carries', () => {
    // Every command is self-contained, so nothing here has to remember what
    // came before — which is also why the list can be drawn at two sizes (the
    // game's texture and the map editor's thumbnail) by the same code.
    expect(
      paint([
        {
          op: 'rectangle',
          x: 1,
          y: 2,
          width: 3,
          height: 4,
          fill: '#ff0000',
          stroke: '#00ff00',
          strokeWidth: 2,
        },
      ]),
    ).toEqual([
      'save',
      'fillRect(1,2,3,4):#ff0000',
      'strokeRect(1,2,3,4):#00ff00',
      'restore',
    ]);
  });

  it('draws only the edge when there is no fill', () => {
    const calls = paint([
      {op: 'circle', x: 4, y: 4, radius: 4, stroke: '#fff', strokeWidth: 1},
    ]);

    expect(calls).toContain('stroke:#fff@1');
    expect(calls.some(call => call.startsWith('fill:'))).toBe(false);
  });

  it('draws nothing for a line with no colour at all', () => {
    // The pen never produces one — it falls back to the fill — so this is the
    // belt to that braces: a command list built by hand cannot make the driver
    // stroke with whatever colour happened to be set last.
    expect(
      paint([{op: 'line', x1: 0, y1: 0, x2: 1, y2: 1, strokeWidth: 1}]),
    ).toEqual(['save', 'restore']);
  });

  it('places text by its anchor rather than by measuring it', () => {
    // What lets a score that counts up stay where it was put, with nothing
    // asking how wide it is — the measurement this design does not have
    // (specs/DRAWING.md).
    const calls = paint([
      {
        op: 'text',
        text: '42',
        x: 10,
        y: 5,
        size: 12,
        anchor: 'bottom right',
        fill: '#fff',
        strokeWidth: 1,
      },
    ]);

    expect(calls[1]).toContain('fillText(42)');
    expect(calls[1]).toContain('right/bottom');
    expect(calls[1]).toContain('12px');
  });

  it('draws a spritesheet cell as a source rectangle, and a whole image plain', () => {
    const image = {} as CanvasImageSource;
    expect(
      paint([{op: 'image', sprite: 'coin.png', x: 0, y: 0}], image),
    ).toContain('drawImage(2)');
    expect(
      paint(
        [
          {
            op: 'image',
            sprite: 'sheet.png',
            x: 0,
            y: 0,
            cell: {x: 32, y: 0, width: 32, height: 32},
          },
        ],
        image,
      ),
    ).toContain('drawImage(8)');
  });

  it('draws nothing for a picture the project no longer holds', () => {
    expect(paint([{op: 'image', sprite: 'gone.png', x: 0, y: 0}])).toEqual([
      'save',
      'restore',
    ]);
  });
});

/** A scene whose texture manager only records what it was told. */
function fakeScene() {
  const textures = new Map<string, unknown>();
  const added: string[] = [];
  return {
    added,
    textures: {
      exists: (key: string) => textures.has(key),
      addCanvas: (key: string, canvas: unknown) => {
        added.push(key);
        textures.set(key, canvas);
      },
      remove: (key: string) => textures.delete(key),
      get: () => ({getSourceImage: () => undefined}),
    },
    live: () => [...textures.keys()],
  };
}

const state = (key: string): DrawingState => ({
  key,
  width: 8,
  height: 8,
  commands: [
    {op: 'rectangle', x: 0, y: 0, width: 8, height: 8, strokeWidth: 1},
  ],
});

describe('the texture cache', () => {
  it('rasterizes a picture once, however many actors draw it', () => {
    // The whole economy of the design. Nine coins drawn by one routine hash
    // identically, so this is one canvas and eight map lookups.
    const scene = fakeScene();
    const cache = new DrawingTextures();
    const holders = Array.from({length: 9}, () => ({}));

    const keys = holders.map(holder =>
      cache.acquire(scene as never, holder, state('abc')),
    );

    expect(new Set(keys).size).toBe(1);
    expect(scene.added).toEqual(['drawing:abc']);
  });

  it('rasterizes again only when the picture changes', () => {
    const scene = fakeScene();
    const cache = new DrawingTextures();
    const holder = {};

    for (let frame = 0; frame < 5; frame++) {
      cache.acquire(scene as never, holder, state('abc'));
    }
    expect(scene.added).toEqual(['drawing:abc']);

    cache.acquire(scene as never, holder, state('def'));
    expect(scene.added).toEqual(['drawing:abc', 'drawing:def']);
    // …and the one nothing draws any more is gone, rather than accumulating for
    // the life of the game as a score's every value would.
    expect(scene.live()).toEqual(['drawing:def']);
  });

  it('keeps a picture while anything is still drawing it', () => {
    const scene = fakeScene();
    const cache = new DrawingTextures();
    const [a, b] = [{}, {}];

    cache.acquire(scene as never, a, state('abc'));
    cache.acquire(scene as never, b, state('abc'));
    cache.release(scene as never, a);
    expect(scene.live()).toEqual(['drawing:abc']);

    cache.release(scene as never, b);
    expect(scene.live()).toEqual([]);
  });

  it('shrugs at releasing an actor that never drew anything', () => {
    const scene = fakeScene();
    expect(() =>
      new DrawingTextures().release(scene as never, {}),
    ).not.toThrow();
  });
});

// A canvas the jsdom environment does not implement is not this file's problem:
// `rasterize` is exercised through the running game, and everything above tests
// the two halves that have logic in them.
vi.mock('phaser', () => ({default: {}}));
