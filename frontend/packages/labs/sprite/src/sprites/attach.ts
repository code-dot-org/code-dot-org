import type p5 from 'p5';

import {Animation, SpriteSheet} from './animation';
import {Camera, cameraConstructor} from './camera';
import {installCollision} from './collision';
import {findContext, setContext, type SpriteContext} from './context';
import {createEdgeSprites} from './edges';
import {Group} from './Group';
import {createInputState, installInput} from './input';
import {Sprite} from './Sprite';
import type {SpriteP5} from './types';
import {World} from './World';

const DEFAULT_CANVAS_SIZE = 400;
const DEFAULT_FRAME_RATE = 30;
const CANVAS_FILL_GREY = 127;

/**
 * Attaches the sprite library to `p` (LIF-1, LIF-4). Call it from the
 * sketch function, before setup runs, so that p5's default canvas is made
 * at 400 by 400. Attaching an attached instance returns it unchanged.
 */
export function attachSprites(p: p5): SpriteP5 {
  const instance = p as unknown as SpriteP5;
  if (findContext(p)) {
    return instance;
  }

  p.angleMode(p.DEGREES);
  p.frameRate(DEFAULT_FRAME_RATE);
  installCanvasDefaults(p);

  const allSprites = new Group();
  const startTime = Date.now();
  const camera = new Camera(p, 0, 0, 1);
  const input = createInputState();
  const abort = new AbortController();
  const context: SpriteContext = {
    p: instance,
    allSprites,
    camera,
    input,
    startTime,
    abort,
  };
  setContext(p, context);
  installRemove(p, abort);

  const world = new World(p, allSprites, startTime);
  const members = {
    createSprite(x?: number, y?: number, width?: number, height?: number) {
      const sprite = new Sprite(context, x, y, width, height);
      allSprites.add(sprite);
      return sprite;
    },
    Group,
    createGroup: () => new Group(),
    drawSprites(group?: Group) {
      const target = group || allSprites;
      if (typeof (target as Partial<Group>).draw !== 'function') {
        throw new Error(
          'with drawSprites you can only draw all sprites or a group',
        );
      }
      target.draw();
    },
    drawSprite(sprite?: Sprite) {
      if (sprite) {
        sprite.display();
      }
    },
    createEdgeSprites: () => createEdgeSprites(instance),
    edges: undefined,
    camera,
    Camera: cameraConstructor(p),
    Animation,
    SpriteSheet,
    loadAnimation: (...args: unknown[]) =>
      new Animation(...(args as p5.Image[])),
    loadSpriteSheet: (
      image: p5.Image,
      framesOrWidth: number,
      frameHeight: number,
      frameCount: number,
    ) => new SpriteSheet(image, framesOrWidth, frameHeight, frameCount),
    rgb: (r: number, g: number, b: number, a?: number) =>
      p.color(r, g, b, (a || 1) * 255),
    predefinedAnimations: undefined,
    pauseAnimationsByDefault: false,
    ...installInput(input, abort.signal),
    ...installCollision(p),
  };
  for (const [name, value] of Object.entries(members)) {
    Object.defineProperty(p, name, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  for (const [name, value] of Object.entries({
    allSprites,
    World: world,
    worldStartTime: startTime,
  })) {
    Object.defineProperty(p, name, {
      value,
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }
  return instance;
}

/** LIF-4 item 3 and LIF-6. */
function installCanvasDefaults(p: p5): void {
  const createCanvas = p.createCanvas;
  let first = true;
  Object.defineProperty(p, 'createCanvas', {
    value: function (this: p5, ...args: unknown[]) {
      // p5 makes a default canvas before setup; it is the first one made.
      if (first) {
        first = false;
        args[0] = DEFAULT_CANVAS_SIZE;
        args[1] = DEFAULT_CANVAS_SIZE;
      }
      const result = (createCanvas as (...a: unknown[]) => unknown).apply(
        p,
        args,
      );
      const input = findContext(p)?.input;
      if (input) {
        // INP-19: the renderer's public `elt` is the canvas element.
        input.canvas = (result as {elt?: HTMLElement} | null)?.elt ?? null;
      }
      p.fill(CANVAS_FILL_GREY);
      return result;
    },
    writable: true,
    configurable: true,
  });
}

function installRemove(p: p5, abort: AbortController): void {
  const remove = p.remove;
  Object.defineProperty(p, 'remove', {
    value: function (this: p5, ...args: unknown[]) {
      abort.abort();
      return (remove as (...a: unknown[]) => unknown).apply(p, args);
    },
    writable: true,
    configurable: true,
  });
}
