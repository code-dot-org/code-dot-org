// What a drawing routine says, and how it says it (specs/DRAWING.md).
//
// A drawing is COMMANDS, not pixels. `RenderState` is documented as needing no
// engine internals, only numbers, and a routine that rasterized would put a
// canvas inside the engine — so a routine describes a picture and the driver
// draws it. The split that lets the same world run under a different renderer
// survives, and the description is a plain value, which is what makes it
// hashable and therefore what makes the texture cache possible.
//
// PAINT IS AMBIENT WHILE THE ROUTINE RUNS AND SETTLED WHEN IT STOPS. `set fill`
// changes the pen; every shape captures the pen it was drawn with. So the
// author writes the sequence every drawing language they will ever meet is
// written in, and the driver receives commands that need no state to draw — it
// never has to know what came before.

import {fnv1a} from './hash';

/** How a shape is painted, captured at the moment it is drawn. */
interface Paint {
  /** The interior, or absent for `no fill`. */
  fill?: string;
  /** The edge, or absent for `no outline`. */
  stroke?: string;
  /** Pixels. Meaningless without `stroke`, and carried anyway so the driver
   *  never has to invent one. */
  strokeWidth: number;
}

/** Which part of the text sits at the point it is drawn at. */
export type TextAnchor =
  | 'left'
  | 'centre'
  | 'right'
  | 'top left'
  | 'top'
  | 'top right'
  | 'bottom left'
  | 'bottom'
  | 'bottom right';

export const TEXT_ANCHORS: readonly TextAnchor[] = [
  'top left',
  'top',
  'top right',
  'left',
  'centre',
  'right',
  'bottom left',
  'bottom',
  'bottom right',
];

/**
 * One thing to draw, in the canvas's own pixels with its origin at the top-left.
 *
 * Self-contained: every command carries its own paint, so the driver draws the
 * list in any order it likes and a command read on its own means what it says.
 */
export type DrawCommand =
  | ({
      op: 'rectangle';
      x: number;
      y: number;
      width: number;
      height: number;
    } & Paint)
  | ({op: 'circle'; x: number; y: number; radius: number} & Paint)
  | ({op: 'line'; x1: number; y1: number; x2: number; y2: number} & Paint)
  | ({
      op: 'text';
      text: string;
      x: number;
      y: number;
      size: number;
      anchor: TextAnchor;
    } & Paint)
  | {
      op: 'image';
      sprite: string;
      x: number;
      y: number;
      /** One rectangle of a spritesheet, resolved where the project's `.sheet`
       *  files are known; absent means the whole picture. */
      cell?: {x: number; y: number; width: number; height: number};
    };

/**
 * The pen a drawing routine writes through.
 *
 * Generated code calls one method per block, which is the shape every other
 * statement block in this lab generates — `world.…`, `actor.…`, and now
 * `pen.…`. Nothing here reads: a routine describes and does not ask.
 */
export interface Pen {
  fill(color: string): void;
  outline(color: string, width: number): void;
  noFill(): void;
  noOutline(): void;
  rectangle(x: number, y: number, width: number, height: number): void;
  circle(x: number, y: number, radius: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  text(
    text: string,
    x: number,
    y: number,
    size: number,
    anchor: TextAnchor,
  ): void;
  image(sprite: string, x: number, y: number, cell?: Cell): void;
}

/** One rectangle of a spritesheet. */
export interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** What a routine starts with: something visible, and no edge nobody asked for. */
const DEFAULT_FILL = '#ffffff';

/** How a KIND of actor draws itself — see `ActorBuilder.defineDrawing`. */
export interface ActorDrawing {
  /** The canvas, in pixels. Declared rather than measured: it is also the
   *  actor's `intrinsic size`, which is what its click box and its collision
   *  box are worked out from. */
  readonly width: number;
  readonly height: number;
  /**
   * The routine, given the actor it is drawing, a pen, and the WORLD.
   *
   * The world is here so a drawing can ASK — the health bar reads the health
   * of whatever has some, and a bar that could only see its own actor had to
   * be handed a reference by somebody else, which meant a property and a step
   * to fill it. A drawing stays pure without it: it may read anything and
   * change nothing, and its cache key is the commands it emitted, so a reading
   * that changes is a picture that changes (specs/DRAWING.md).
   */
  readonly run: (actor: unknown, pen: Pen, world: unknown) => void;
}

/** The pen, and the list it fills. */
export class CommandPen implements Pen {
  readonly commands: DrawCommand[] = [];
  private currentFill: string | undefined = DEFAULT_FILL;
  private currentStroke: string | undefined = undefined;
  private currentWidth = 1;

  private paint(): Paint {
    return {
      ...(this.currentFill === undefined ? {} : {fill: this.currentFill}),
      ...(this.currentStroke === undefined ? {} : {stroke: this.currentStroke}),
      strokeWidth: this.currentWidth,
    };
  }

  fill(color: string): void {
    this.currentFill = color;
  }

  outline(color: string, width: number): void {
    this.currentStroke = color;
    this.currentWidth = width;
  }

  noFill(): void {
    this.currentFill = undefined;
  }

  noOutline(): void {
    this.currentStroke = undefined;
  }

  rectangle(x: number, y: number, width: number, height: number): void {
    this.commands.push({op: 'rectangle', x, y, width, height, ...this.paint()});
  }

  circle(x: number, y: number, radius: number): void {
    this.commands.push({op: 'circle', x, y, radius, ...this.paint()});
  }

  /**
   * A line is drawn in the outline colour, FALLING BACK TO THE FILL.
   *
   * A line has no interior, so "the colour" is the only paint it can mean. The
   * fallback is the whole of what stops the commonest first drawing anybody
   * writes — `draw line`, with the pen untouched — from producing nothing at
   * all and no way to find out why.
   */
  line(x1: number, y1: number, x2: number, y2: number): void {
    const paint = this.paint();
    this.commands.push({
      op: 'line',
      x1,
      y1,
      x2,
      y2,
      strokeWidth: paint.strokeWidth,
      ...(paint.stroke === undefined
        ? paint.fill === undefined
          ? {}
          : {stroke: paint.fill}
        : {stroke: paint.stroke}),
    });
  }

  text(
    text: string,
    x: number,
    y: number,
    size: number,
    anchor: TextAnchor,
  ): void {
    this.commands.push({op: 'text', text, x, y, size, anchor, ...this.paint()});
  }

  image(sprite: string, x: number, y: number, cell?: Cell): void {
    this.commands.push({op: 'image', sprite, x, y, ...(cell ? {cell} : {})});
  }
}

/**
 * A drawing's identity: the same commands are the same picture.
 *
 * The lever the whole design turns on (specs/DRAWING.md). The routine runs
 * every frame because running it is a few array pushes; the TEXTURE is made
 * only when this changes. Two consequences fall out rather than being built:
 * nine actors drawn the same way share one texture, and a drawing that never
 * changes is rasterized exactly once for the life of the game.
 *
 * The size is in the key because it is part of the picture — the same commands
 * on a bigger canvas are a different image, and would otherwise collide.
 */
export function drawingKey(
  width: number,
  height: number,
  commands: readonly DrawCommand[],
): string {
  return fnv1a(`${width}x${height}:${JSON.stringify(commands)}`);
}
