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
// effects included — treats like any other. The painting itself is
// `paintDrawing`, which is Phaser-free so the lab can use it too.

import Phaser from 'phaser';

import type {DrawingState} from 'world-lab';

import {paintDrawing} from './paintDrawing';

/** Texture names, kept in one namespace so nothing collides with a project's. */
const KEY_PREFIX = 'drawing:';

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
  // picture goes, not a sheet of paper with a color.
  paintDrawing(context, state.commands, sprite =>
    scene.textures.exists(sprite)
      ? (scene.textures.get(sprite).getSourceImage() as CanvasImageSource)
      : undefined,
  );
  return canvas;
}
