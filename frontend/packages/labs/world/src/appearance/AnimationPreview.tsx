// An animation in the picker, PLAYING.
//
// The row used to show the sprite an animation reads, which for a strip is the
// whole strip: six coins in a row, at 2×, as one wide smear of pictures. That
// is a truthful drawing of the FILE and a useless drawing of the animation —
// what a learner is choosing between is six spins, four strides and a flap,
// and none of those is legible as a contact sheet.
//
// So this plays it, from the very timeline the actor that takes it will keep,
// so a preview and the animation cannot disagree (`TimelineThumb`).

import {useEffect, useMemo, useState} from 'react';

import {spriteFileName, stockSprite, type StockAnimation} from './stock';
import {TimelineThumb} from './TimelineThumb';

/** How tall a row's picture is, matching the sprite rows beside it. */
const PREVIEW = 64;

export interface AnimationPreviewProps {
  animation: StockAnimation;
}

export const AnimationPreview = ({animation}: AnimationPreviewProps) => {
  // The pictures it reads, decoded once each: they are `data:` URLs in the
  // library, and a preview has to wait for them like anything else.
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    let alive = true;
    for (const id of animation.sprites) {
      const sprite = stockSprite(id);
      if (!sprite) {
        continue;
      }
      const image = new Image();
      image.onload = () => {
        if (alive) {
          setImages(held => ({...held, [spriteFileName(id)]: image}));
        }
      };
      image.src = sprite.dataUrl;
    }
    return () => {
      alive = false;
    };
  }, [animation]);
  const imageFor = useMemo(() => (file: string) => images[file], [images]);
  return (
    <span
      // The box a row reserves, so that a picture drawn smaller than the
      // others does not shuffle the text beside it.
      style={{
        display: 'block',
        flex: '0 0 auto',
        width: `${PREVIEW}px`,
        height: `${PREVIEW}px`,
        overflow: 'hidden',
        border: '1px solid var(--borders-neutral-primary, #d4dae1)',
        borderRadius: '4px',
      }}
      aria-hidden="true"
    >
      <TimelineThumb
        timeline={animation.timeline}
        imageFor={imageFor}
        size={PREVIEW}
      />
    </span>
  );
};

export default AnimationPreview;
