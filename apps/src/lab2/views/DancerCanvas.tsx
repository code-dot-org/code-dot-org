/**
 * A lightweight React component that renders a single Lottie dancer animation
 * directly into a <canvas> element using LottieDancerRenderer.
 * The component runs its own requestAnimationFrame loop, advancing
 * by real elapsed time for a continuous preview.
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';

import LottieDancerRenderer from '@cdo/apps/dance/lottie/LottieDancerRenderer';
import {DanceMoves} from '@cdo/apps/dance/lottie/LottieDancerTypes';

type Props = {
  /** Square pixel size for the canvas (width === height). */
  size: number;
  /** Explicit dance move to load. */
  move?: string;
};

const DancerCanvas: React.FC<Props> = ({size, move}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastInitNodeRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<LottieDancerRenderer | null>(null);
  const frameRef = useRef(0);
  const [ready, setReady] = useState(false);

  // Render the current frame (GenerateDancer mode).
  const renderCurrentFrame = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    renderer.renderFrame(frameRef.current);
  }, []);

  // Initialize the renderer when the canvas node is available.
  const setCanvasNode = useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      if (!node) {
        return;
      }
      if (lastInitNodeRef.current === node) {
        return;
      }

      lastInitNodeRef.current = node;

      if (!rendererRef.current) {
        rendererRef.current = new LottieDancerRenderer();
        rendererRef.current.precacheMoves([move as DanceMoves]);
      }
      const context = node.getContext('2d');
      if (!context) {
        return;
      }
      rendererRef.current.init(context);

      (async () => {
        try {
          if (rendererRef.current) {
            await rendererRef.current.setSource(move as DanceMoves);
          }
          setReady(true);

          frameRef.current = 0;
          renderCurrentFrame();
        } catch {
          setReady(false);
        }
      })();
    },
    [move, renderCurrentFrame]
  );

  // Resize the canvas and inform Lottie of the size change.
  useEffect(() => {
    const node = canvasRef.current;
    if (!node) {
      return;
    }
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
    node.width = Math.max(1, Math.floor(size * window.devicePixelRatio));
    node.height = Math.max(1, Math.floor(size * window.devicePixelRatio));
    if (rendererRef.current && ready) {
      rendererRef.current.resize();
      renderCurrentFrame();
    }
  }, [size, ready, renderCurrentFrame]);

  // Render using RAF. Drives animation by real elapsed time.
  useEffect(() => {
    if (!ready) {
      return;
    }

    let rafId: number | null = null;
    const startMs = performance.now();

    const renderer = rendererRef.current;
    const totalFrames = renderer?.getDurationFrames?.() ?? 1;

    // We aim to cycle through the entire animation each second.
    // The animation speed should be similar to with a 120 bpm song.
    const targetFps = 48;

    const tick = (currentMs: number) => {
      const elapsedMs = currentMs - startMs;
      const elapsedFrames = Math.floor((elapsedMs * targetFps) / 1000);
      const frameIndex = elapsedFrames % totalFrames;
      // Every other loop is mirrored.
      const mirror = Math.floor((elapsedFrames / totalFrames) % 2) === 1;
      frameRef.current = frameIndex;
      renderer?.renderFrame(frameIndex, mirror);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [ready]);

  if (!move) {
    return null;
  }
  return <canvas ref={setCanvasNode} />;
};

export default DancerCanvas;
