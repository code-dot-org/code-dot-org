// One moment of an animation, painted into a box (specs/ANIMATION_PLAN.md).
//
// What the engine draws for an actor playing a timeline, done by hand on a
// canvas for the places that show an animation without a game: the shelf's
// preview, the Actor Creator's tiles, and the Actor Editor's timeline. The
// sprite track says which picture, the drawn offset, scale and turn where it
// sits against the actor, and the opacity how solid it is. Effects are not
// drawn; they are shaders, and only the game runs those.

import {parseSpriteRef, spriteCell} from '../blockly/spriteCells';
import {valueAt, type Timeline} from '../engine/core/keyframes';

/** A picture, by the file name a sprite key names. */
export type ImageFor = (file: string) => CanvasImageSource | undefined;

/** A rectangle within an image. */
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The size of an image, however it is held. */
const sizeOf = (image: CanvasImageSource): {width: number; height: number} => {
  const sized = image as {
    naturalWidth?: number;
    naturalHeight?: number;
    width?: number;
    height?: number;
  };
  return {
    width: Number(sized.naturalWidth || sized.width) || 0,
    height: Number(sized.naturalHeight || sized.height) || 0,
  };
};

/**
 * The file and rectangle a sprite key names: `{sprite, cell}` as the stock
 * writes one, or `coin.png#3`, a cell of a sheet the project cuts.
 */
export function spriteOf(value: unknown): {file: string; cell?: Rect} | null {
  if (typeof value === 'string' && value) {
    const cell = spriteCell(value);
    return {file: parseSpriteRef(value).sprite, ...(cell ? {cell} : {})};
  }
  if (value && typeof value === 'object' && 'sprite' in value) {
    const held = value as {sprite: unknown; cell?: Rect};
    return typeof held.sprite === 'string'
      ? {file: held.sprite, ...(held.cell ? {cell: held.cell} : {})}
      : null;
  }
  return null;
}

/**
 * Paint `timeline` at `t` seconds into a `box`-sized context, centred, at
 * `zoom` screen pixels to a world pixel. Nothing is painted where the sprite
 * track says nothing yet or names a picture not to hand.
 */
export function paintMoment(
  ctx: CanvasRenderingContext2D,
  box: {width: number; height: number},
  timeline: Timeline,
  t: number,
  imageFor: ImageFor,
  zoom: number,
): void {
  const sprite = spriteOf(valueAt(timeline.tracks.sprite ?? [], t));
  const image = sprite && imageFor(sprite.file);
  if (!sprite || !image) {
    return;
  }
  const whole = sizeOf(image);
  const cell = sprite.cell ?? {x: 0, y: 0, ...whole};
  if (cell.width <= 0 || cell.height <= 0) {
    return;
  }
  const offset = valueAt(timeline.tracks.drawnOffset ?? [], t) as
    | {x: number; y: number}
    | undefined;
  const scale = (valueAt(timeline.tracks.drawnScale ?? [], t) as number) ?? 1;
  const turn = (valueAt(timeline.tracks.drawnTurn ?? [], t) as number) ?? 0;
  const opacity = (valueAt(timeline.tracks.opacity ?? [], t) as number) ?? 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  ctx.translate(
    box.width / 2 + (offset?.x ?? 0) * zoom,
    box.height / 2 + (offset?.y ?? 0) * zoom,
  );
  ctx.rotate((turn * Math.PI) / 180);
  const w = cell.width * zoom * scale;
  const h = cell.height * zoom * scale;
  ctx.drawImage(
    image,
    cell.x,
    cell.y,
    cell.width,
    cell.height,
    -w / 2,
    -h / 2,
    w,
    h,
  );
  ctx.restore();
}

/**
 * The largest picture a timeline draws, as a rectangle's size: what a box
 * that holds every moment of it is fitted to.
 */
export function largestCell(
  timeline: Timeline,
  imageFor: ImageFor,
): {width: number; height: number} {
  let width = 0;
  let height = 0;
  for (const key of timeline.tracks.sprite ?? []) {
    const sprite = spriteOf(key.value);
    const image = sprite && imageFor(sprite.file);
    if (!sprite || !image) {
      continue;
    }
    const cell = sprite.cell ?? sizeOf(image);
    width = Math.max(width, cell.width);
    height = Math.max(height, cell.height);
  }
  return {width, height};
}
