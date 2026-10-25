// An animation, playing, in a square (specs/ANIMATION_PLAN.md).
//
// Playing rather than still, and playing on its own rather than on hover:
// what distinguishes two animations of the same picture IS the motion, and a
// grid where you have to hover each one to tell them apart is a grid you have
// to search. Held at its first moment for a reader who has asked for less
// motion — the picture is still there, and what they lose is the animation
// and not the tile.

import {useEffect, useRef} from 'react';

import {endOf, timeIn, type Timeline} from '../engine/core/keyframes';

import {largestCell, paintMoment, type ImageFor} from './paintTimeline';

/** How big a thumbnail is drawn, square, unless asked otherwise. */
export const THUMB = 64;

export interface TimelineThumbProps {
  timeline: Timeline;
  imageFor: ImageFor;
  /** Its edge, in CSS pixels. */
  size?: number;
  /** Whether it plays, or shows its first moment and holds it. */
  playing?: boolean;
}

export const TimelineThumb = ({
  timeline,
  imageFor,
  size = THUMB,
  playing = true,
}: TimelineThumbProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const target = canvas.current;
    const ctx = target?.getContext('2d');
    if (!target || !ctx) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    target.width = size * dpr;
    target.height = size * dpr;
    // Fitted to its largest picture, with room for a pulse to grow, so no
    // moment of it is cut off and two tiles of one size compare.
    const cell = largestCell(timeline, imageFor);
    const zoom =
      cell.width && cell.height
        ? (size * 0.8) / Math.max(cell.width, cell.height)
        : 1;
    const paint = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = false;
      paintMoment(
        ctx,
        {width: size, height: size},
        timeline,
        t,
        imageFor,
        zoom,
      );
    };
    const still =
      !playing ||
      endOf(timeline) <= 0 ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    paint(0);
    if (still) {
      return;
    }
    // Played as a loop here whatever it does in a game: a tile that played
    // once and stopped would show a switch only to whoever looked first.
    const looping = {...timeline, loop: true};
    const started = performance.now();
    let raf = 0;
    const step = () => {
      paint(timeIn(looping, (performance.now() - started) / 1000).t);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [timeline, imageFor, size, playing]);
  return (
    <canvas
      ref={canvas}
      style={{width: size, height: size}}
      aria-hidden="true"
    />
  );
};

export default TimelineThumb;
