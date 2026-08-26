import React, {useEffect, useRef} from 'react';

import {
  AnimationPoses,
  CharacterPose,
  orderedPoseKeys,
  PoseRange,
  poseForFrame,
} from '../characterAnimations';

import moduleStyles from './image-details-dialog.module.scss';

// The sketch's frame rate, which pose frameDelays are counted in.
const TICKS_PER_SECOND = 30;

const POSE_TITLES: Record<CharacterPose, string> = {
  stand: 'Idle',
  walk: 'Walk',
  jump: 'Jump',
};

interface AnimatedSheetPreviewProps {
  /** The sheet image (data URI or URL). */
  src: string;
  frameSize: {x: number; y: number};
  poses: AnimationPoses;
  className?: string;
}

/**
 * Plays a character set's sheet: each pose in its own pane, side by side and
 * looping at its own frame delay, so the whole set is visible at once.
 * Frames are cut from the sheet the way the engine cuts them — cells row by
 * row, wrapping at the image width.
 */
const AnimatedSheetPreview: React.FunctionComponent<
  AnimatedSheetPreviewProps
> = ({src, frameSize, poses, className}) => {
  const keys = orderedPoseKeys(poses);
  return (
    <div className={moduleStyles.posePreviews}>
      {keys.map(key => {
        const at = poseForFrame(poses, poses[key]!.start);
        return (
          <figure key={key} className={moduleStyles.posePreview}>
            <PoseLoop
              src={src}
              frameSize={frameSize}
              range={poses[key]!}
              className={className}
            />
            <figcaption>{at ? POSE_TITLES[at.pose] : key}</figcaption>
          </figure>
        );
      })}
    </div>
  );
};

/** One pose of the sheet, looping. */
const PoseLoop: React.FunctionComponent<{
  src: string;
  frameSize: {x: number; y: number};
  range: PoseRange;
  className?: string;
}> = ({src, frameSize, range, className}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    const img = new Image();
    let raf = 0;
    let started = 0;
    let lastFrame = -1;
    const ticksPerFrame = Math.max(1, range.frameDelay);
    const draw = (now: number) => {
      if (!started) {
        started = now;
      }
      const tick = Math.floor(((now - started) / 1000) * TICKS_PER_SECOND);
      const frame =
        range.start + (Math.floor(tick / ticksPerFrame) % range.count);
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
  }, [src, frameSize.x, frameSize.y, range]);

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
