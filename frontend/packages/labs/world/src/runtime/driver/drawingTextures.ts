// Turning a drawing's commands into a texture, once per distinct picture.
//
// The engine describes (specs/DRAWING.md, `core/drawing`) and this draws. What
// makes it affordable is that a picture is IDENTIFIED BY WHAT IT DESCRIBES: the
// engine hands over a key computed from the commands, so this rasterizes on a
// key it has not seen and reuses the texture on one it has. Nine actors drawn
// the same way cost one texture, and an actor whose picture never changes costs
// one rasterization for the life of the game — neither is a special case here,
// both are what keying by content means.
//
// A 2D CANVAS RATHER THAN PHASER'S `Graphics`. Graphics cannot draw text and
// cannot draw an image, which is two of the five commands; a canvas draws all
// five with the API the command list was designed around, and `addCanvas` hands
// the result to Phaser as an ordinary texture that everything downstream —
// effects included — treats like any other.

import Phaser from 'phaser';

import type {DrawCommand, DrawingState, TextAnchor} from 'world-lab';

/** Texture names, kept in one namespace so nothing collides with a project's. */
const KEY_PREFIX = 'drawing:';

/**
 * The typeface a drawing's text is set in.
 *
 * ONE LINE, deliberately. specs/DRAWING.md records that a bitmap font cut from
 * a sheet the project holds is the right long answer and that it needs an asset
 * pipeline this does not have yet; the blocks name what they want (`size`,
 * a colour) rather than how a browser is asked for it, so replacing this
 * changes this file and no project file.
 */
const FONT_STACK = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

/** How an anchor maps onto the two things a canvas calls the same idea. */
const ALIGNMENT: Record<
  TextAnchor,
  {align: CanvasTextAlign; baseline: CanvasTextBaseline}
> = {
  'top left': {align: 'left', baseline: 'top'},
  top: {align: 'center', baseline: 'top'},
  'top right': {align: 'right', baseline: 'top'},
  left: {align: 'left', baseline: 'middle'},
  centre: {align: 'center', baseline: 'middle'},
  right: {align: 'right', baseline: 'middle'},
  'bottom left': {align: 'left', baseline: 'bottom'},
  bottom: {align: 'center', baseline: 'bottom'},
  'bottom right': {align: 'right', baseline: 'bottom'},
};

/** Draw one command. Every command carries its own paint, so nothing persists. */
function draw(
  context: CanvasRenderingContext2D,
  command: DrawCommand,
  imageFor: (sprite: string) => CanvasImageSource | undefined,
): void {
  if (command.op === 'image') {
    const source = imageFor(command.sprite);
    if (!source) {
      return;
    }
    const cell = command.cell;
    if (cell) {
      // One rectangle of a spritesheet, drawn at its own size: a sheet is an
      // image some things read rectangles out of, which is the same thing
      // `set sprite` means by a cell.
      context.drawImage(
        source,
        cell.x,
        cell.y,
        cell.width,
        cell.height,
        command.x,
        command.y,
        cell.width,
        cell.height,
      );
      return;
    }
    context.drawImage(source, command.x, command.y);
    return;
  }
  if (command.stroke !== undefined) {
    context.strokeStyle = command.stroke;
    context.lineWidth = command.strokeWidth;
  }
  if (command.fill !== undefined) {
    context.fillStyle = command.fill;
  }
  switch (command.op) {
    case 'rectangle':
      if (command.fill !== undefined) {
        context.fillRect(command.x, command.y, command.width, command.height);
      }
      if (command.stroke !== undefined) {
        context.strokeRect(command.x, command.y, command.width, command.height);
      }
      return;
    case 'circle':
      context.beginPath();
      context.arc(
        command.x,
        command.y,
        Math.max(0, command.radius),
        0,
        Math.PI * 2,
      );
      if (command.fill !== undefined) {
        context.fill();
      }
      if (command.stroke !== undefined) {
        context.stroke();
      }
      return;
    case 'line':
      // A line has no interior, so it is drawn only when there is a colour to
      // draw it in — which the pen guarantees by falling back to the fill.
      if (command.stroke === undefined) {
        return;
      }
      context.beginPath();
      context.moveTo(command.x1, command.y1);
      context.lineTo(command.x2, command.y2);
      context.stroke();
      return;
    case 'text': {
      const {align, baseline} = ALIGNMENT[command.anchor] ?? ALIGNMENT.centre;
      context.font = `${command.size}px ${FONT_STACK}`;
      context.textAlign = align;
      context.textBaseline = baseline;
      // Outline first so a stroked letter is read over its own edge rather
      // than under it, which is what an outlined font looks like everywhere.
      if (command.stroke !== undefined) {
        context.strokeText(command.text, command.x, command.y);
      }
      if (command.fill !== undefined) {
        context.fillText(command.text, command.x, command.y);
      }
      return;
    }
  }
}

/**
 * Run a whole command list onto a context.
 *
 * Shared with the map editor's thumbnails (`frameThumbnail`), which draw the
 * same picture at a different size: a palette entry showing something other
 * than what will land on the map would be a picker that lies.
 */
export function paintDrawing(
  context: CanvasRenderingContext2D,
  commands: readonly DrawCommand[],
  imageFor: (sprite: string) => CanvasImageSource | undefined,
): void {
  for (const command of commands) {
    context.save();
    draw(context, command, imageFor);
    context.restore();
  }
}

/**
 * The textures made from drawings, and who is still using each.
 *
 * Refcounted rather than swept: an actor's picture can change every frame, and
 * a sweep would either keep every picture a game ever drew or walk every actor
 * to find out that it need not. A count is one number per texture, and the
 * moment it reaches zero is exactly the moment nothing can draw it again.
 */
export class DrawingTextures {
  /** How many actors are drawing each key right now. */
  private readonly uses = new Map<string, number>();
  /** What each actor drew last, so a change releases what it left. */
  private readonly held = new WeakMap<object, string>();

  /**
   * Make sure `state`'s texture exists, hand back its name, and account for
   * `holder` having moved onto it from whatever it drew before.
   */
  acquire(scene: Phaser.Scene, holder: object, state: DrawingState): string {
    const key = KEY_PREFIX + state.key;
    const previous = this.held.get(holder);
    if (previous === key) {
      return key;
    }
    if (previous !== undefined) {
      this.drop(scene, previous);
    }
    this.held.set(holder, key);
    this.uses.set(key, (this.uses.get(key) ?? 0) + 1);
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, rasterize(scene, state));
    }
    return key;
  }

  /** Account for an actor that has stopped drawing — removed, or gone plain. */
  release(scene: Phaser.Scene, holder: object): void {
    const previous = this.held.get(holder);
    if (previous === undefined) {
      return;
    }
    this.held.delete(holder);
    this.drop(scene, previous);
  }

  private drop(scene: Phaser.Scene, key: string): void {
    const count = (this.uses.get(key) ?? 0) - 1;
    if (count > 0) {
      this.uses.set(key, count);
      return;
    }
    this.uses.delete(key);
    // `remove` also frees the canvas the texture was made from. A texture an
    // object is still pointing at would draw as Phaser's __MISSING, which is
    // why this happens only when the count says nothing points at it.
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
  }
}

/** Run a command list onto a fresh canvas of the declared size. */
function rasterize(
  scene: Phaser.Scene,
  state: DrawingState,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // At least one pixel each way: a zero-sized canvas is a texture Phaser will
  // not accept, and a drawing declared `0 by 0` is an author mid-edit rather
  // than an error worth stopping the game for.
  canvas.width = Math.max(1, Math.round(state.width));
  canvas.height = Math.max(1, Math.round(state.height));
  const context = canvas.getContext('2d');
  if (!context) {
    return canvas;
  }
  // Transparent until something is drawn on it — the canvas is where the
  // picture goes, not a sheet of paper with a colour.
  paintDrawing(context, state.commands, sprite =>
    scene.textures.exists(sprite)
      ? (scene.textures.get(sprite).getSourceImage() as CanvasImageSource)
      : undefined,
  );
  return canvas;
}
