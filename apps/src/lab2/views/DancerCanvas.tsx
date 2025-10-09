import React, {useCallback, useEffect, useRef, useState} from 'react';

import LottieDancerRenderer from '@cdo/apps/dance/lottie/LottieDancerRenderer';
import {DanceMoves} from '@cdo/apps/dance/lottie/LottieDancerTypes';
import appConfig from '@cdo/apps/music/appConfig';

type Props = {
  /** Square pixel size for the canvas (width === height). */
  size: number;
  /** When provided, render based on the fractional measure (Timeline mode). */
  measurePosition?: number;
  /** Explicit move to load; if omitted, use appConfig('dance'). */
  move?: string | null;
  /** Frames advanced per RAF tick when measurePosition is not provided. */
  rafSpeed?: number;
  /** Optional style/class so parents control layout/position. */
  style?: React.CSSProperties;
  className?: string;
  ariaLabel?: string;
  onLoadingChange?: (loading: boolean) => void;
};

const DancerCanvas: React.FC<Props> = ({
  size,
  measurePosition,
  move,
  rafSpeed = 0.5,
  style,
  className,
  ariaLabel,
  onLoadingChange,
}) => {
  const resolvedMove =
    (move ?? ((appConfig.getValue('dance') || '') + '').trim().toLowerCase()) ||
    null;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastInitNodeRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<LottieDancerRenderer | null>(null);

  // keep latest values without re-creating callbacks
  const measureRef = useRef<number | undefined>(measurePosition);
  useEffect(() => {
    measureRef.current = measurePosition;
  }, [measurePosition]);

  const moveRef = useRef<string | null>(resolvedMove);
  useEffect(() => {
    moveRef.current = resolvedMove;
  }, [resolvedMove]);

  const [ready, setReady] = useState(false);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  const renderAtMeasure = useCallback((measure: number) => {
    const r = rendererRef.current;
    if (!r) return;
    const total = r.getDurationFrames?.() || r.getTotalFrames?.() || 0;
    if (!total) return;
    const frac = (measure - Math.floor(measure) + 1) % 1;
    const frameIndex = Math.floor(frac * total * 2);
    r.renderFrame(frameIndex);
  }, []);

  const renderAtFrame = useCallback(() => {
    const r = rendererRef.current;
    if (!r) return;
    r.renderFrame(frameRef.current);
  }, []);

  // stable ref callback
  const setCanvasNode = useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      if (!node) return;
      if (lastInitNodeRef.current === node) return;

      lastInitNodeRef.current = node;

      if (!rendererRef.current) {
        rendererRef.current = new LottieDancerRenderer();
      }
      const ctx = node.getContext('2d');
      if (!ctx) return;
      rendererRef.current.init(ctx);

      (async () => {
        try {
          onLoadingChange?.(true);
          if (moveRef.current && rendererRef.current) {
            await rendererRef.current.setSource(
              moveRef.current as DanceMoves | null
            );
          }
          setReady(true);
          if (typeof measureRef.current === 'number') {
            renderAtMeasure(measureRef.current);
          } else {
            frameRef.current = 0;
            renderAtFrame();
          }
        } catch {
          setReady(false);
        } finally {
          onLoadingChange?.(false);
        }
      })();
    },
    [onLoadingChange, renderAtMeasure, renderAtFrame]
  );

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
      rendererRef.current.resize?.();
      if (typeof measureRef.current === 'number') {
        renderAtMeasure(measureRef.current);
      } else {
        renderAtFrame();
      }
    }
  }, [size, ready, renderAtMeasure, renderAtFrame]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (typeof measurePosition !== 'number') {
      return;
    }
    renderAtMeasure(measurePosition);
  }, [measurePosition, ready, renderAtMeasure]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (typeof measurePosition === 'number') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      return;
    }

    let cancelled = false;
    const tick = () => {
      if (cancelled) {
        return;
      }
      renderAtFrame();
      frameRef.current += rafSpeed;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [ready, measurePosition, rafSpeed, renderAtFrame]);

  // Reload move if it changes.
  useEffect(() => {
    if (!ready || !rendererRef.current) {
      return;
    }
    (async () => {
      try {
        onLoadingChange?.(true);
        if (moveRef.current && rendererRef.current) {
          await rendererRef.current.setSource(
            moveRef.current as DanceMoves | null
          );
        }
        if (typeof measureRef.current === 'number') {
          renderAtMeasure(measureRef.current);
        } else {
          frameRef.current = 0;
          renderAtFrame();
        }
      } catch {
      } finally {
        onLoadingChange?.(false);
      }
    })();
  }, [onLoadingChange, ready, resolvedMove, renderAtMeasure, renderAtFrame]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      try {
        rendererRef.current?.destroyAnim?.();
      } catch {}
      rendererRef.current = null;
      lastInitNodeRef.current = null;
      setReady(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
    };
  }, []);

  if (!resolvedMove) {
    return null;
  }

  return (
    <canvas
      ref={setCanvasNode}
      aria-label={ariaLabel}
      className={className}
      style={{display: 'block', background: 'transparent', ...style}}
    />
  );
};

export default DancerCanvas;
