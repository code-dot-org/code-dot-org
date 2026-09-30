import 'vitest-canvas-mock';

import p5 from 'p5';
import {afterEach} from 'vitest';

import {attachSprites} from '../attach';
import {withSpriteLifecycle} from '../lifecycle';
import type {SpriteP5} from '../types';

// The sketch checker fetches the page's last <script>, which jsdom lacks.
(p5 as unknown as {disableFriendlyErrors: boolean}).disableFriendlyErrors =
  true;

const live: SpriteP5[] = [];

afterEach(() => {
  for (const p of live.splice(0)) {
    p.remove();
  }
});

/**
 * An attached instance whose setup has run, with no frame drawn yet.
 * `setup` runs inside p5's setup, after the default canvas exists.
 */
export function makeInstance(setup?: (p: SpriteP5) => void): Promise<SpriteP5> {
  return new Promise(resolve => {
    new p5((sketch: p5) => {
      const p = attachSprites(sketch);
      live.push(p);
      sketch.setup = () => {
        sketch.noLoop();
        setup?.(p);
        // p5 tries one draw after setup; draw is still unset then.
        setTimeout(() => resolve(p), 0);
      };
    });
  });
}

/** Runs one whole frame (LIF-9..LIF-15) with `program` as the draw program. */
export async function frame(
  p: SpriteP5,
  program: () => void = () => {},
): Promise<void> {
  (p as unknown as p5).draw = withSpriteLifecycle(p as unknown as p5, program);
  await (p as unknown as p5).redraw();
}

export async function frames(p: SpriteP5, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await frame(p);
  }
}

export type Call = [string, ...unknown[]];

const RECORDED = [
  'push',
  'pop',
  'colorMode',
  'noStroke',
  'stroke',
  'strokeWeight',
  'rectMode',
  'ellipseMode',
  'imageMode',
  'translate',
  'rotate',
  'scale',
  'fill',
  'noFill',
  'tint',
  'noTint',
  'rect',
  'image',
  'line',
  'text',
  'textSize',
  'textAlign',
] as const;

/**
 * Records calls to p5 drawing methods on the instance until the returned
 * function is called; it returns the calls.
 */
export function recordP5(p: SpriteP5): () => Call[] {
  const calls: Call[] = [];
  const target = p as unknown as Record<
    string,
    (...args: unknown[]) => unknown
  >;
  const originals = new Map<string, (...args: unknown[]) => unknown>();
  for (const name of RECORDED) {
    const original = target[name];
    originals.set(name, original);
    target[name] = function (this: unknown, ...args: unknown[]) {
      calls.push([name, ...args]);
      return original.apply(p, args);
    };
  }
  return () => {
    for (const [name] of originals) {
      delete target[name];
    }
    return calls;
  };
}

interface DrawImageEvent {
  type: string;
  props: Record<string, number>;
  transform: number[];
}

/** Recorded canvas drawImage calls since the last clear. */
export function drawImageCalls(p: SpriteP5): DrawImageEvent[] {
  const context = p.drawingContext as unknown as {
    __getDrawCalls(): DrawImageEvent[];
  };
  return context.__getDrawCalls().filter(call => call.type === 'drawImage');
}

export function clearCanvasEvents(p: SpriteP5): void {
  const context = p.drawingContext as unknown as {
    __clearDrawCalls(): void;
    __clearEvents(): void;
  };
  context.__clearDrawCalls();
  context.__clearEvents();
}

/** Sets p5's mouse position as its event handlers would. */
export function setMouse(p: SpriteP5, x: number, y: number): void {
  const target = p as unknown as {mouseX: number; mouseY: number};
  target.mouseX = x;
  target.mouseY = y;
}

export function makeImage(
  p: SpriteP5,
  width: number,
  height: number,
): p5.Image {
  return (p as unknown as p5).createImage(width, height);
}

export function context2d(p: SpriteP5): CanvasRenderingContext2D {
  return p.drawingContext as CanvasRenderingContext2D;
}
