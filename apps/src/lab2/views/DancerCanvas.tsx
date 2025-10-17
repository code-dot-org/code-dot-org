/**
 * A lightweight React component that renders a single Lottie dancer animation
 * directly into a <canvas> element using LottieDancerRenderer.
 *
 * It supports two mutually exclusive modes:
 *   • Timeline mode – when `measurePosition` is provided.
 *       The parent (e.g. MusicLab Timeline) drives animation timing by
 *       supplying a fractional measure position, and this component renders
 *       the corresponding frame on each update.
 *
 *   • GenerateDancer mode – when `measurePosition` is not provided.
 *       The component runs its own requestAnimationFrame loop, advancing
 *       by `rafSpeed` frames per tick for a continuous preview.
 *
 * The component automatically initializes the renderer, handles resize
 * events, and notifies the parent via `onLoadingChange` while assets load.
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';

import LottieDancerRenderer from '@cdo/apps/dance/lottie/LottieDancerRenderer';
import {DanceMoves} from '@cdo/apps/dance/lottie/LottieDancerTypes';

type Props = {
  /** Square pixel size for the canvas (width === height). */
  size: number;
  /** When provided (e.g. Timeline), render based on the fractional measure. */
  measurePosition?: number;
  /** Explicit dance move to load. */
  move?: string;
  /** Frames advanced per RAF tick when measurePosition is not provided. */
  rafSpeed?: number;
  onLoadingChange?: (loading: boolean) => void;
};

const DancerCanvas: React.FC<Props> = ({
  size,
  measurePosition,
  move,
  rafSpeed = 0.5,
  onLoadingChange,
}) => {
  const isTimelineMode = typeof measurePosition === 'number';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastInitNodeRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<LottieDancerRenderer | null>(null);

  // Measure position is provided by the Timeline only.
  const measureRef = useRef<number | undefined>(measurePosition);

  // Animation using RAF when measurePosition is not provided.
  const animationFrameId = useRef<number | null>(null);
  const frameRef = useRef(0);

  const [ready, setReady] = useState(false);

  // Render at the specified fractional measure position (Timeline mode).
  const renderAtMeasure = useCallback((measure: number) => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    const totalFrames = renderer.getDurationFrames() || 0;
    if (!totalFrames) {
      return;
    }
    const animationStep = measure % 1;
    const frameIndex = Math.floor(animationStep * totalFrames * 2);
    renderer.renderFrame(frameIndex);
  }, []);

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
      }
      const context = node.getContext('2d');
      if (!context) {
        return;
      }
      rendererRef.current.init(context);

      (async () => {
        try {
          // Communicate with GeneratedDancer that the preview is still loading.
          onLoadingChange?.(true);

          if (rendererRef.current) {
            await rendererRef.current.setSource(move as DanceMoves);
          }
          setReady(true);

          // Draw the first frame.
          if (isTimelineMode) {
            renderAtMeasure(measureRef.current!);
          } else {
            frameRef.current = 0;
            renderCurrentFrame();
          }
        } catch {
          setReady(false);
        } finally {
          // Communicate with GeneratedDancer that the preview is done loading.
          onLoadingChange?.(false);
        }
      })();
    },
    [isTimelineMode, move, onLoadingChange, renderAtMeasure, renderCurrentFrame]
  );

  useEffect(() => {
    measureRef.current = measurePosition;
  }, [measurePosition]);

  // Resize the canvas and inform Lottie of the size change.
  useEffect(() => {
    const node = canvasRef.current;
    if (!node) {
      return;
    }
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
    node.width = Math.max(1, Math.floor(size));
    node.height = Math.max(1, Math.floor(size));
    if (rendererRef.current && ready) {
      rendererRef.current.resize();
      if (isTimelineMode) {
        renderAtMeasure(measureRef.current!);
      } else {
        renderCurrentFrame();
      }
    }
  }, [isTimelineMode, size, ready, renderAtMeasure, renderCurrentFrame]);

  // Render using the provided measure position (e.g. Timeline mode).
  useEffect(() => {
    if (!ready || typeof measurePosition !== 'number') {
      return;
    }
    renderAtMeasure(measurePosition);
  }, [isTimelineMode, measurePosition, ready, renderAtMeasure]);

  // Render using RAF when no measure position is provided (e.g. GenerateDancer mode).
  // Advances frameRef by rafSpeed on each tick.
  useEffect(() => {
    if (!ready || isTimelineMode) {
      return;
    }

    const tick = () => {
      renderCurrentFrame();
      frameRef.current += rafSpeed;
      animationFrameId.current = requestAnimationFrame(tick);
    };
    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = null;
    };
  }, [isTimelineMode, ready, rafSpeed, renderCurrentFrame]);

  if (!move) {
    return null;
  }
  return <canvas ref={setCanvasNode} />;
};

export default DancerCanvas;
