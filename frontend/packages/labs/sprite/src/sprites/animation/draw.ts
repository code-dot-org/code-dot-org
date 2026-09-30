import type p5 from 'p5';

import {Animation, type Frame} from './Animation';
import type {FrameRect} from './SpriteSheet';
import {type RGBA, tintedImage} from './tint';

function isRect(frame: Frame): frame is FrameRect {
  return !('canvas' in frame) && typeof (frame as {x?: unknown}).x === 'number';
}

/**
 * Draws the current frame centred on (offX, offY) in the current transform
 * (ANI-30..ANI-34). `tint` is 8-bit RGBA or undefined.
 */
export function drawAnimationFrame(
  p: p5,
  animation: Animation,
  tint: RGBA | undefined,
): void {
  if (!animation.visible) {
    return;
  }
  const frame = animation.getFrameImage();
  if (!frame) {
    console.log('Warning undefined frame ' + animation.getFrame());
    return;
  }
  const sheet = animation.spriteSheet;
  if (sheet && isRect(frame)) {
    const image = tint ? tintedImage(p, sheet.image, tint) : sheet.image;
    p.image(
      image,
      animation.offX,
      animation.offY,
      frame.width,
      frame.height,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
    );
  } else {
    const image = frame as p5.Image;
    p.image(
      tint ? tintedImage(p, image, tint) : image,
      animation.offX,
      animation.offY,
      image.width,
      image.height,
    );
  }
}
