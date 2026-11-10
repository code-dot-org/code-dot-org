import type p5 from 'p5';

import {cameraPostDraw, cameraPreDraw} from './camera';
import {getContext} from './context';
import {updateInputStates} from './input';

/**
 * The pre-draw phase, LIF-10. The host calls it after starting a frame
 * (frameCount incremented, matrix reset) and before the draw program.
 */
export function preDraw(p: p5): void {
  const context = getContext(p);
  updateInputStates(p, context.input);
  const allSprites = context.allSprites;
  // LIF-11: the length is read afresh, so the sprite after a removed one is skipped.
  for (let i = 0; i < allSprites.length; i++) {
    allSprites[i].update();
  }
  cameraPreDraw(context.camera);
}

/** The post-draw phase, LIF-15. The host calls it once the draw program has finished. */
export function postDraw(p: p5): void {
  cameraPostDraw(getContext(p).camera);
}

/**
 * Wraps a draw function in preDraw and postDraw, for a host whose draw
 * program finishes when `draw` returns or its promise resolves. Assign the
 * result to `p.draw`. postDraw does not run if `draw` throws or rejects.
 */
export function withSpriteLifecycle(
  p: p5,
  draw: () => void | Promise<void>,
): () => void | Promise<void> {
  return () => {
    preDraw(p);
    const result = draw();
    if (result && typeof (result as Promise<void>).then === 'function') {
      return (result as Promise<void>).then(() => postDraw(p));
    }
    postDraw(p);
  };
}
