// An animation in the picker, PLAYING.
//
// The row used to show the sprite an animation reads, which for a strip is the
// whole strip: six coins in a row, at 2×, as one wide smear of pictures. That
// is a truthful drawing of the FILE and a useless drawing of the animation —
// what a learner is choosing between is six spins, four strides and a flap,
// and none of those is legible as a contact sheet.
//
// So this plays it. Which is also the only description that cannot go stale:
// the frames come out of the very document the import writes, so a preview and
// the thing imported cannot disagree.
//
// IT READS THE DOCUMENT rather than assuming a strip, because not every stock
// animation is one — `pulse` holds one picture at several scales, with no
// rectangle to cut. A frame says where to cut (`position`) or does not, and
// says how big to draw it (`scale`) or does not, and both are honoured here
// exactly as the engine honours them.

import {useEffect, useState} from 'react';

import {spriteFileName, stockSprite, STOCK_CELL} from './stock';
import type {StockAnimation} from './stock';

/** How tall a row's picture is, matching the sprite rows beside it. */
const PREVIEW = 64;

/** A still, for a frame nothing can be drawn for. */
const BLANK = {} as const;

export interface AnimationPreviewProps {
  animation: StockAnimation;
}

export const AnimationPreview = ({animation}: AnimationPreviewProps) => {
  // One document, one animation in it — but taken by iteration rather than by
  // name, because the name is the author's and this does not need to know it.
  const [entry] = Object.values(animation.document.animations);
  const frames = entry?.frames ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (frames.length < 2) {
      return;
    }
    // The document's own rate, so the preview runs at the speed the imported
    // animation will. A rate of nothing would divide by zero; eight a second
    // is the engine's own fallback.
    const period = 1000 / (entry?.frameRate || 8);
    const timer = setInterval(
      () => setIndex(current => (current + 1) % frames.length),
      period,
    );
    return () => clearInterval(timer);
  }, [entry?.frameRate, frames.length]);

  const frame = frames[index] ?? frames[0];
  if (!frame) {
    return <span style={BLANK} />;
  }

  // The picture this frame cuts from, by the file name the document uses —
  // looked up among the sprites the import brings with it, which is the same
  // list `addedFiles` promises.
  const source = animation.sprites
    .map(id => stockSprite(id))
    .find(sprite => sprite && spriteFileName(sprite.id) === frame.sprite);
  const cell = frame.position ?? {
    x: 0,
    y: 0,
    width: STOCK_CELL,
    height: STOCK_CELL,
  };
  const zoom = (PREVIEW / cell.height) * (frame.scale ?? 1);

  return (
    <span
      // The box a row reserves, so that a frame drawn smaller than the others
      // does not shuffle the text beside it every time it plays.
      style={{
        display: 'block',
        flex: '0 0 auto',
        width: `${PREVIEW}px`,
        height: `${PREVIEW}px`,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--borders-neutral-primary, #d4dae1)',
        borderRadius: '4px',
      }}
      aria-hidden="true"
    >
      <span
        style={{
          display: 'block',
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${cell.width}px`,
          height: `${cell.height}px`,
          // Scaled about its middle, so a `pulse` frame grows from the center
          // the way it will in the game rather than from a corner.
          transform: `translate(-50%, -50%) scale(${zoom})`,
          backgroundImage: source ? `url(${source.dataUrl})` : undefined,
          backgroundPosition: `-${cell.x}px -${cell.y}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />
    </span>
  );
};

export default AnimationPreview;
