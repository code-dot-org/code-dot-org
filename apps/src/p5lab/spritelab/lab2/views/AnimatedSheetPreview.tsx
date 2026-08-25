import React, {useEffect, useRef} from 'react';

import {AnimationPoses, orderedPoseKeys} from '../characterAnimations';

// How many times each pose plays before the preview moves to the next.
const LOOPS_PER_POSE = 3;
// The sketch's frame rate, which pose frameDelays are counted in.
const TICKS_PER_SECOND = 30;

interface AnimatedSheetPreviewProps {
  /** The sheet image (data URI or URL). */
  src: string;
  frameSize: {x: number; y: number};
  poses: AnimationPoses;
  className?: string;
}

/**
 * Plays a character set's sheet: every pose in turn, each LOOPS_PER_POSE
 * times at its own frame delay, then round again. Frames are cut from the
 * sheet the way the engine cuts them — cells row by row, wrapping at the
 * image width.
 */
const AnimatedSheetPreview: React.FunctionComponent<
  AnimatedSheetPreviewProps
> = ({src, frameSize, poses, className}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    // The show: (pose, frame) per tick, laid end to end.
    const sequence: number[] = [];
    orderedPoseKeys(poses).forEach(key => {
      const range = poses[key]!;
      for (let loop = 0; loop < LOOPS_PER_POSE; loop++) {
        for (let f = 0; f < range.count; f++) {
          for (let d = 0; d < range.frameDelay; d++) {
            sequence.push(range.start + f);
          }
        }
      }
    });
    if (!sequence.length) {
      return;
    }
    const img = new Image();
    let raf = 0;
    let started = 0;
    let lastFrame = -1;
    const draw = (now: number) => {
      if (!started) {
        started = now;
      }
      const tick = Math.floor(((now - started) / 1000) * TICKS_PER_SECOND);
      const frame = sequence[tick % sequence.length];
      if (frame !== lastFrame) {
        lastFrame = frame;
        const columns = Math.max(1, Math.floor(img.naturalWidth / frameSize.x));
        const sx = (frame % columns) * frameSize.x;
        const sy = Math.floor(frame / columns) * frameSize.y;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          sx,
          sy,
          frameSize.x,
          frameSize.y,
          0,
          0,
          frameSize.x,
          frameSize.y
        );
      }
      raf = requestAnimationFrame(draw);
    };
    img.onload = () => {
      raf = requestAnimationFrame(draw);
    };
    img.src = src;
    return () => cancelAnimationFrame(raf);
  }, [src, frameSize.x, frameSize.y, poses]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={frameSize.x}
      height={frameSize.y}
      aria-label="Animation preview"
    />
  );
};

export default AnimatedSheetPreview;
