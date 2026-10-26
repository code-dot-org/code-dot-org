// A picture of a stock actor, for the dialog that offers it.
//
// One canvas, two sources, because a stock actor is one of two things: it
// DRAWS itself (a Label, a bar, a Speech Box) or it WEARS a picture (a Coin, a
// Player). The first is painted by the driver's own painter over commands read
// out of the actor's file (`previewDrawing`); the second is the image the
// import would copy in, drawn as-is.
//
// SCALED TO FIT, never cropped: the drawings are anything from 64 by 8 to 280
// by 96, and a row of previews that each showed a different corner of its actor
// would be worse than useless. Pictures keep their pixels — smoothing a 32 by
// 32 sprite blown up four times turns a coin into a smudge.

import {useEffect, useRef} from 'react';

import {STOCK_SPRITES} from '../../appearance/stock';
import {paintDrawing} from '../../runtime/driver/paintDrawing';
import {ACTOR_DEMO_SIZE} from '../demos';
import {actorAnimations, actorSprites} from '../importStockActor';
import type {StockActor} from '../stock';

import styles from './actorPreview.module.css';
import {previewDrawing} from './previewDrawing';

/**
 * The box every preview is drawn in, in CSS pixels.
 *
 * A demo's frame, so that a row showing a still and a row showing a scene are
 * the same shape and the list does not step in and out as it scrolls. It is
 * the SCENE that fixes the size — 256 by 192 world pixels is what the Player's
 * own jump needs — and a still has no size of its own to defend.
 */
export const PREVIEW_SIZE = ACTOR_DEMO_SIZE;

/** What this actor wears, if it wears something: an image and a cell of it. */
const pictureOf = (
  actor: StockActor,
): {src: string; cell?: {width: number; height: number}} | undefined => {
  const sprite = actorSprites(actor)[0];
  if (sprite) {
    return {src: sprite.dataUrl, cell: sprite.sheet?.cell};
  }
  // An animation is frames OF a sprite, and its picture is that sprite's strip
  // — so the preview is the strip's first cell, which is the actor at rest.
  const animation = actorAnimations(actor)[0];
  const strip = animation && actorStrip(animation.sprites[0]);
  return strip;
};

const actorStrip = (
  id: string | undefined,
): {src: string; cell?: {width: number; height: number}} | undefined => {
  const sprite = STOCK_SPRITES.find(entry => entry.id === id);
  return sprite ? {src: sprite.dataUrl, cell: sprite.sheet?.cell} : undefined;
};

export const ActorPreview = ({actor}: {actor: StockActor}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }
    // Drawn at the device's resolution and shown at the box's, so text is not
    // a blur on the screens most of this is read on.
    const ratio = window.devicePixelRatio || 1;
    canvas.width = PREVIEW_SIZE.width * ratio;
    canvas.height = PREVIEW_SIZE.height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, PREVIEW_SIZE.width, PREVIEW_SIZE.height);

    /**
     * Fit `size` inside the box, centered, and never LARGER than life.
     *
     * Life size because the demos are: a Health Bar's still beside a Progress
     * Bar's scene are two rows about the same 64-pixel bar, and one of them
     * blown up to twice the other reads as two different sizes of thing. Only
     * the drawings too big for the box shrink, which is what a shelf of
     * pictures at one scale means.
     */
    const place = (width: number, height: number) => {
      const scale = Math.min(
        PREVIEW_SIZE.width / width,
        PREVIEW_SIZE.height / height,
        1,
      );
      return {
        scale,
        x: (PREVIEW_SIZE.width - width * scale) / 2,
        y: (PREVIEW_SIZE.height - height * scale) / 2,
      };
    };

    const drawing = previewDrawing(actor);
    if (drawing) {
      const {scale, x, y} = place(drawing.width, drawing.height);
      context.save();
      context.translate(x, y);
      context.scale(scale, scale);
      // The DRIVER's painter, so a preview and the game are one renderer and
      // what can drift is only the reading (`previewDrawing`).
      paintDrawing(context, drawing.commands, () => undefined);
      context.restore();
      return;
    }

    const picture = pictureOf(actor);
    if (!picture) {
      return;
    }
    const image = new Image();
    let canceled = false;
    image.onload = () => {
      if (canceled) {
        return;
      }
      const width = picture.cell?.width ?? image.width;
      const height = picture.cell?.height ?? image.height;
      const {scale, x, y} = place(width, height);
      context.imageSmoothingEnabled = false;
      context.drawImage(
        image,
        0,
        0,
        width,
        height,
        x,
        y,
        width * scale,
        height * scale,
      );
    };
    image.src = picture.src;
    return () => {
      canceled = true;
    };
  }, [actor]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.preview}
      style={{width: PREVIEW_SIZE.width, height: PREVIEW_SIZE.height}}
      // Nothing to announce: the sentence beside it says what the actor is,
      // and a canvas with no accessible name is skipped by a screen reader
      // anyway. A `role` here would be one to argue with rather than remove.
      aria-hidden="true"
    />
  );
};
