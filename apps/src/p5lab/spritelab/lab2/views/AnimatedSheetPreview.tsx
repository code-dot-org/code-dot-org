import React, {useEffect, useMemo, useRef, useState} from 'react';

import {
  AnimationPoses,
  CharacterPose,
  orderedPoseKeys,
  poseFrame,
} from '../characterAnimations';

import moduleStyles from './image-details-dialog.module.scss';

// The sketch's frame rate, which pose frameDelays are counted in.
const TICKS_PER_SECOND = 30;

// How many times a pose's cycle plays before the next pose takes the pane.
const CYCLES_PER_POSE = 3;

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
}

/**
 * Plays a character set at full size, one pose at a time: each pose's cycle
 * plays a few times at its own frame delay, then the next pose takes the
 * pane, round and round, with the pose's name in the top left corner.
 * Frames are cut from the sheet the way the engine cuts them — cells row by
 * row, wrapping at the image width.
 */
const AnimatedSheetPreview: React.FunctionComponent<
  AnimatedSheetPreviewProps
> = ({src, frameSize, poses}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Each pose's turn in the rotation: its range, name, and length in ticks.
  const turns = useMemo(
    () =>
      orderedPoseKeys(poses).map(key => {
        const range = poses[key]!;
        return {
          pose: key.split('-')[0] as CharacterPose,
          range,
          ticks: range.frameDelay * range.count * CYCLES_PER_POSE,
        };
      }),
    [poses]
  );
  const [shownPose, setShownPose] = useState<CharacterPose | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const totalTicks = turns.reduce((sum, turn) => sum + turn.ticks, 0);
    if (!canvas || !ctx || !totalTicks) {
      return;
    }
    const img = new Image();
    let raf = 0;
    let started = 0;
    let lastFrame = -1;
    let lastPose: CharacterPose | null = null;
    const draw = (now: number) => {
      if (!started) {
        started = now;
      }
      let tick =
        Math.floor(((now - started) / 1000) * TICKS_PER_SECOND) % totalTicks;
      let turn = turns[0];
      for (const candidate of turns) {
        turn = candidate;
        if (tick < candidate.ticks) {
          break;
        }
        tick -= candidate.ticks;
      }
      // Neighbouring poses share the standing frame, so the caption tracks
      // the pose, not the frame.
      if (turn.pose !== lastPose) {
        lastPose = turn.pose;
        setShownPose(turn.pose);
      }
      const frame = poseFrame(turn.range, tick);
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
    // The load outlives an unmount or src change; a late onload would start
    // an animation loop nothing cancels.
    let cancelled = false;
    img.onload = () => {
      if (!cancelled) {
        raf = requestAnimationFrame(draw);
      }
    };
    // A failed load just leaves the canvas blank.
    img.onerror = () => {};
    img.src = src;
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [src, frameSize.x, frameSize.y, turns]);

  return (
    <div className={moduleStyles.sheetPreview}>
      <canvas
        ref={canvasRef}
        width={frameSize.x}
        height={frameSize.y}
        aria-label="Animation preview"
      />
      {shownPose && (
        <span className={moduleStyles.sheetPreviewCaption}>
          {POSE_TITLES[shownPose]}
        </span>
      )}
    </div>
  );
};

export default AnimatedSheetPreview;
