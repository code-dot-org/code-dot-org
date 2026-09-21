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

import {cssColor, type ColorValue} from './color';
import {fnv1a} from './hash';
import type {ResolvedStyle} from './theme';

/** A shape lifted off what is behind it — see `Pen.shadow`. */
export interface Shadow {
  color: string;
  /** How soft, in pixels. Zero is a hard offset copy, which is also a look. */
  blur: number;
  /** How far DOWN, which is the only direction interfaces ever cast one. */
  offsetY: number;
}

/** How a shape is painted, captured at the moment it is drawn. */
interface Paint {
  /** The interior, or absent for `no fill`. */
  fill?: string;
  /** The edge, or absent for `no outline`. */
  stroke?: string;
  /** Pixels. Meaningless without `stroke`, and carried anyway so the driver
   *  never has to invent one. */
  strokeWidth: number;
  /**
   * What it casts, or absent for none.
   *
   * ABSENT RATHER THAN A ZEROED ONE, which is the rule every optional field
   * here follows and the reason is `drawingKey`: the command list IS the
   * drawing's identity, so a shadow of zero carried on every command would
   * differ from every command made before this existed and re-rasterize the
   * whole lab for a picture nobody changed.
   */
  shadow?: Shadow;
}

/** Which part of the text sits at the point it is drawn at. */
export type TextAnchor =
  | 'left'
  | 'center'
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
  'center',
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
      /**
       * How round the corners are, or absent for square.
       *
       * ON THE RECTANGLE AND NOT IN `Paint`, because it is the only shape
       * that can mean anything by it: a circle is already round and a line
       * has no corner. Putting it in the paint would carry a number every
       * circle and line had to ignore, and change their keys to say it.
       */
      radius?: number;
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
      /**
       * Break the words to fit this many pixels, drawing one line under
       * another. Absent means one line however long it is, which is what
       * every drawing did before and what a score or a name wants.
       *
       * A WIDTH AND NOT THE BREAKS THEMSELVES. Where a line ends depends on
       * the font, and the engine has no font — it has no canvas to ask. So it
       * says how wide, and the driver, which is holding the measuring tape,
       * decides where the words fall (specs/DRAWING.md).
       */
      wrapWidth?: number;
      /**
       * Heavier letters, or absent for the ordinary ones.
       *
       * The one thing that tells a caption from a title when everything is
       * the same family at the same size (specs/STYLES_PLAN.md). On the text
       * command for the reason `radius` is on the rectangle: no other shape
       * has letters.
       */
      weight?: 'bold';
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
  fill(color: ColorValue): void;
  outline(color: ColorValue, width: number): void;
  noFill(): void;
  noOutline(): void;
  /** Round the corners of every rectangle after this. Zero squares them. */
  corner(radius: number): void;
  /** Cast a shadow under every shape after this. */
  shadow(color: ColorValue, blur: number, offsetY: number): void;
  noShadow(): void;
  /** Draw the letters after this heavier, or ordinary again. */
  weight(bold: boolean): void;
  /**
   * Set everything a named style says at once — `use style ⟨button face⟩`.
   *
   * VALUES, NOT A NAME. What is handed over is already resolved against the
   * world's theme (`core/theme`), so the commands this produces carry colours
   * and numbers and the cache key means what it says.
   */
  useStyle(style: ResolvedStyle | undefined): void;
  rectangle(x: number, y: number, width: number, height: number): void;
  circle(x: number, y: number, radius: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  text(
    text: string,
    x: number,
    y: number,
    size: number,
    anchor: TextAnchor,
    wrapWidth?: number,
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
  /**
   * The canvas, in pixels, GIVEN THE ACTOR.
   *
   * Declared rather than measured: it is also the actor's `intrinsic size`,
   * which is what its click box and its collision box are worked out from.
   *
   * A FUNCTION, because the size is per-INSTANCE. It was two numbers on the
   * kind, so five Labels of one kind were five boxes of one size and resizing
   * one was not a thing that could be said — which is the first thing somebody
   * arranging a dialog reaches for (specs/UI_ACTORS.md). An interface actor
   * declares its own `width` and `height` and hands them here; a drawing whose
   * size is two literals is the same function returning the same pair, and
   * costs nothing to call.
   *
   * AND THE WORLD, for the same reason `run` is given one: a size may ask a
   * question the actor alone cannot answer. `⟨width of ⟨what it says⟩ at size
   * ⟨12⟩⟩` is a box that fits its own words, and how wide words are is the
   * world's to say (`World.textWidth`).
   */
  readonly size: (
    actor: unknown,
    world: unknown,
  ) => {width: number; height: number};
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
  private currentRadius = 0;
  private currentShadow: Shadow | undefined = undefined;
  private currentBold = false;

  private paint(): Paint {
    return {
      ...(this.currentFill === undefined ? {} : {fill: this.currentFill}),
      ...(this.currentStroke === undefined ? {} : {stroke: this.currentStroke}),
      strokeWidth: this.currentWidth,
      ...(this.currentShadow === undefined ? {} : {shadow: this.currentShadow}),
    };
  }

  // SETTLED HERE, not in the driver. A color arrives as a hex string or as
  // four floats depending on which block produced it (`core/color`), and a
  // command carries the paint it was drawn with — so the command list, which
  // is also the cache key, should hold one spelling of a color rather than
  // two spellings of the same one.
  /**
   * AN UNSET COLOUR LEAVES WHAT THE PEN HAD, which is the third state a colour
   * needs and did not have.
   *
   * `text color` is a per-instance property, so a Button's caption reads it —
   * and its default was `#ffffff`, which is not a choice anybody made and
   * which overrode whatever the actor's style had just set. Classic's dark
   * caption therefore never landed, and a white caption sat on a light grey
   * face (specs/STYLES_PLAN.md).
   *
   * So that default is now EMPTY, and painting with an empty colour keeps
   * what was there. It is the same absent-leaves-alone rule a style field
   * already follows, one level down, and it needs no branch in any drawing:
   * every text row is preceded by its `use style`, so there is always a
   * class-provided fill underneath. A project with no theme is unchanged,
   * because the pen's own default fill is `#ffffff` — exactly what the
   * property's default was.
   *
   * `no fill` remains how a drawing says NONE. Empty is "I have no opinion";
   * none is an opinion.
   */
  fill(color: ColorValue): void {
    const settled = cssColor(color);
    if (settled === '') {
      return;
    }
    this.currentFill = settled;
  }

  outline(color: ColorValue, width: number): void {
    this.currentStroke = cssColor(color);
    this.currentWidth = width;
  }

  noFill(): void {
    this.currentFill = undefined;
  }

  noOutline(): void {
    this.currentStroke = undefined;
  }

  /**
   * Round corners, from here on.
   *
   * NO `noCorner()` TO GO WITH IT, where fill and outline each have their
   * absence as a block. A radius of zero IS square and reads as square; an
   * absent fill is not a fill of nothing, which is why those two needed a
   * word of their own and this does not.
   *
   * Clamped at zero because a negative radius is not a shape — `roundRect`
   * throws on one, and a drawing that computed its corner from the box would
   * take the whole picture down for a box briefly smaller than nothing.
   */
  corner(radius: number): void {
    this.currentRadius = Math.max(0, radius);
  }

  shadow(color: ColorValue, blur: number, offsetY: number): void {
    this.currentShadow = {
      color: cssColor(color),
      blur: Math.max(0, blur),
      offsetY,
    };
  }

  noShadow(): void {
    this.currentShadow = undefined;
  }

  weight(bold: boolean): void {
    this.currentBold = bold;
  }

  /**
   * Take a style, field by field.
   *
   * A STYLE THAT IS NOT THERE CHANGES NOTHING. Naming a style the active
   * theme lacks leaves the pen exactly as it was — which draws the control in
   * whatever came before, usually the pen's own white. That is on purpose:
   * the alternative is a control that vanishes, and a learner cannot act on a
   * thing that is not on the screen. The theme keeps the name so a sandbox
   * can say which one was missing (`ResolvedTheme.unresolved`).
   *
   * ABSENT LEAVES ALONE, NULL CLEARS. A style that says nothing about the
   * outline keeps whatever outline the pen had, so `use style ⟨chosen row⟩`
   * can change a fill and keep a corner; one that says `"stroke": null` means
   * no outline and says so.
   */
  useStyle(style: ResolvedStyle | undefined): void {
    if (!style) {
      return;
    }
    if (style.fill !== undefined) {
      this.currentFill = style.fill ?? undefined;
    }
    if (style.stroke !== undefined) {
      this.currentStroke = style.stroke ?? undefined;
    }
    if (style.strokeWidth !== undefined) {
      this.currentWidth = style.strokeWidth;
    }
    if (style.corner !== undefined) {
      this.currentRadius = Math.max(0, style.corner);
    }
    if (style.shadow !== undefined) {
      this.currentShadow = style.shadow ?? undefined;
    }
    if (style.weight !== undefined) {
      this.currentBold = style.weight === 'bold';
    }
  }

  rectangle(x: number, y: number, width: number, height: number): void {
    this.commands.push({
      op: 'rectangle',
      x,
      y,
      width,
      height,
      // Never wider than the box can hold: two corners of half the width
      // each meet in the middle, and asking for more draws a shape the
      // canvas has no room for. Said here rather than in the driver so the
      // KEY says what was drawn.
      ...(this.currentRadius > 0
        ? {radius: Math.min(this.currentRadius, width / 2, height / 2)}
        : {}),
      ...this.paint(),
    });
  }

  circle(x: number, y: number, radius: number): void {
    this.commands.push({op: 'circle', x, y, radius, ...this.paint()});
  }

  /**
   * A line is drawn in the outline color, FALLING BACK TO THE FILL.
   *
   * A line has no interior, so "the color" is the only paint it can mean. The
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
      ...(paint.shadow === undefined ? {} : {shadow: paint.shadow}),
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
    wrapWidth?: number,
  ): void {
    this.commands.push({
      op: 'text',
      text,
      x,
      y,
      size,
      anchor,
      // Absent rather than zero when there is no wrapping, because the command
      // list is a drawing's IDENTITY (`drawingKey`): a key carrying `0` for
      // every unwrapped line would differ from every drawing made before this
      // existed, and re-rasterize the lot.
      ...(wrapWidth !== undefined && wrapWidth > 0 ? {wrapWidth} : {}),
      ...(this.currentBold ? {weight: 'bold' as const} : {}),
      ...this.paint(),
    });
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
