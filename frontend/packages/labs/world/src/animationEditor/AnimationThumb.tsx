// One animation, playing, at whatever size the caller draws it.
//
// Lifted out of `AnimationPickerDialog` so a second surface can show the same
// thing: the Actor Creator's picture step offers the project's animations
// beside its pictures, and an animation that did not move there would be the
// first frame of something, which is the one reading a still cannot give
// (specs/ACTOR_CREATION_WIZARD.md).

import {useEffect, useMemo, useRef, useState} from 'react';

import type {AnimDef} from './animDocument';
import {drawFrame} from './drawFrame';
import {frameAt} from './playback';
import {durations} from './timing';

/** How big a thumbnail is drawn, square. */
export const BOX = 64;

/**
 * One animation, playing.
 *
 * Playing rather than still, and playing on its own rather than on hover: what
 * distinguishes two animations of the same sprite IS the motion, and a grid
 * where you have to hover each one to tell them apart is a grid you have to
 * search. Held for a reader who has asked for less motion — the first frame is
 * still the picture, so what they lose is the animation and not the tile.
 */
export const AnimationThumb = ({
  animation,
  images,
}: {
  animation: AnimDef;
  images: Record<string, HTMLImageElement>;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [at, setAt] = useState(0);
  const times = useMemo(() => durations(animation), [animation]);
  const total = times.reduce((sum, ms) => sum + ms, 0);

  useEffect(() => {
    const still =
      total <= 0 ||
      animation.frames.length < 2 ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      return;
    }
    const started = performance.now();
    let raf = 0;
    const step = () => {
      // Only when the FRAME changes, not on every animation frame: React bails
      // out of a state write that changes nothing, so a ten-frame animation
      // re-renders ten times a second rather than sixty.
      const now = frameAt(times, (performance.now() - started) % total);
      setAt(was => (was === now ? was : now));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animation, times, total]);

  const frame = animation.frames[Math.min(at, animation.frames.length - 1)];
  useEffect(() => {
    if (canvas.current && frame) {
      drawFrame(canvas.current, BOX, frame, images);
    }
  }, [frame, images]);

  return <canvas ref={canvas} style={{width: BOX, height: BOX}} />;
};
