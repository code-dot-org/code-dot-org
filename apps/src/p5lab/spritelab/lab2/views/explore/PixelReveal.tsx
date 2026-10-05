// Three overlays for the picture frame: blinking blocks while a picture is
// generated, the picture sharpening from coarse blocks to full detail, and
// a burst of sparks when it appears.

import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {reducedMotion} from '@cdo/apps/p5lab/spritelab/lab2/reducedMotion';

import styles from './pixel-reveal.module.scss';

// Blocks across the picture at each step of the resolve.
const RESOLVE_LEVELS = [6, 12, 24, 48, 96];
const RESOLVE_STEP_MS = 110;

interface PixelRevealProps {
  src: string;
  /** The part of the image to show; the whole image by default. */
  crop?: {x: number; y: number; width: number; height: number};
}

/**
 * Lies over the picture and draws it in ever smaller blocks, then fades
 * away. Under reduced motion it draws nothing.
 */
export const PixelReveal: React.FunctionComponent<PixelRevealProps> = ({
  src,
  crop,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read through a ref: a fresh crop object each render must not restart
  // the resolve.
  const cropRef = useRef(crop);
  cropRef.current = crop;
  const [phase, setPhase] = useState<'blocks' | 'fading' | 'done'>(
    reducedMotion() ? 'done' : 'blocks'
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 'blocks') {
      return;
    }
    const crop = cropRef.current;
    const img = new Image();
    let timer = 0;
    let cancelled = false;
    img.onload = () => {
      if (cancelled) {
        return;
      }
      const box = crop ?? {
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const ctx = canvas.getContext('2d');
      const small = document.createElement('canvas');
      const smallCtx = small.getContext('2d');
      if (!ctx || !smallCtx) {
        setPhase('done');
        return;
      }
      // Scaled like the real picture's object-fit: contain.
      const scale = Math.min(
        canvas.width / box.width,
        canvas.height / box.height
      );
      const dw = box.width * scale;
      const dh = box.height * scale;
      const dx = (canvas.width - dw) / 2;
      const dy = (canvas.height - dh) / 2;
      let step = 0;
      const draw = () => {
        const level = RESOLVE_LEVELS[step];
        small.width = level;
        small.height = Math.max(
          1,
          Math.round((level * box.height) / box.width)
        );
        smallCtx.imageSmoothingEnabled = false;
        smallCtx.clearRect(0, 0, small.width, small.height);
        smallCtx.drawImage(
          img,
          box.x,
          box.y,
          box.width,
          box.height,
          0,
          0,
          small.width,
          small.height
        );
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(small, dx, dy, dw, dh);
        step++;
        if (step < RESOLVE_LEVELS.length) {
          timer = window.setTimeout(draw, RESOLVE_STEP_MS);
        } else {
          timer = window.setTimeout(() => setPhase('fading'), RESOLVE_STEP_MS);
        }
      };
      draw();
    };
    img.onerror = () => setPhase('done');
    img.src = src;
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [src, phase]);

  if (phase === 'done') {
    return null;
  }
  return (
    <canvas
      ref={canvasRef}
      className={classNames(
        styles.reveal,
        phase === 'fading' && styles.revealFading
      )}
      aria-hidden
      onTransitionEnd={() => setPhase('done')}
    />
  );
};

const SPARK_COUNT = 14;
const SPARK_HUES = ['teal', 'yellow', 'purple', 'orange'] as const;
// The spark animation's length plus its longest delay (pixel-reveal.module.scss).
const BURST_MS = 900;

/** Sparks flying out from the middle of the frame, once. */
export const SparkleBurst: React.FunctionComponent = () => {
  const [done, setDone] = useState(reducedMotion());
  useEffect(() => {
    if (done) {
      return;
    }
    const timer = window.setTimeout(() => setDone(true), BURST_MS);
    return () => window.clearTimeout(timer);
  }, [done]);
  if (done) {
    return null;
  }
  return (
    <div className={styles.burst} aria-hidden>
      {Array.from({length: SPARK_COUNT}, (_, i) => {
        const angle = (i / SPARK_COUNT) * Math.PI * 2 + (i % 2) * 0.2;
        const distance = 38 + (i % 3) * 9;
        const style = {
          '--dx': `${Math.cos(angle) * distance}%`,
          '--dy': `${Math.sin(angle) * distance}%`,
          '--delay': `${(i % 4) * 30}ms`,
        } as React.CSSProperties;
        return (
          <span
            key={i}
            className={classNames(
              styles.spark,
              styles[`spark_${SPARK_HUES[i % SPARK_HUES.length]}`]
            )}
            style={style}
          />
        );
      })}
    </div>
  );
};

const SHUFFLE_SIDE = 5;

/** A grid of blocks blinking in the word colors while the picture is made. */
export const PixelShuffle: React.FunctionComponent = () => (
  <div className={styles.shuffle} aria-hidden>
    {Array.from({length: SHUFFLE_SIDE * SHUFFLE_SIDE}, (_, i) => {
      const style = {
        '--delay': `${((i * 7) % (SHUFFLE_SIDE * SHUFFLE_SIDE)) * 60}ms`,
      } as React.CSSProperties;
      return (
        <span
          key={i}
          className={classNames(
            styles.block,
            styles[
              `spark_${
                SPARK_HUES[
                  (i + Math.floor(i / SHUFFLE_SIDE)) % SPARK_HUES.length
                ]
              }`
            ]
          )}
          style={style}
        />
      );
    })}
  </div>
);
