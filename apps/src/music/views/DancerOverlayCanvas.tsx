import React, {useCallback, useEffect, useRef, useState} from 'react';

import LottieDancerRenderer from '@cdo/apps/dance/lottie/LottieDancerRenderer';
import {DanceMoves} from '@cdo/apps/dance/lottie/LottieDancerTypes';

import appConfig from '../appConfig';

type Props = {
  height: number;
  measurePosition: number; // fractional measures
  zIndex?: number;
};

const DancerOverlayCanvas: React.FC<Props> = ({
  height,
  measurePosition,
  zIndex = 2000,
}) => {
  // Read dance on each render (no memo), but mirror into a ref so the ref-callback stays stable
  const danceMove = ((appConfig.getValue('dance') || '') + '')
    .trim()
    .toLowerCase() as DanceMoves;
  const danceMoveRef = useRef(danceMove);
  useEffect(() => {
    danceMoveRef.current = danceMove;
  }, [danceMove]);

  const measureRef = useRef(measurePosition);
  useEffect(() => {
    measureRef.current = measurePosition;
  }, [measurePosition]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastInitNodeRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<LottieDancerRenderer | null>(null);
  const readyRef = useRef(false);
  const [, force] = useState(0); // tiny state to reflect "ready" if you want, optional

  const renderAt = useCallback((measure: number) => {
    const r = rendererRef.current;
    if (!r) return;
    const total = r.getDurationFrames?.() || 0;
    if (!total) return;
    const frac = (measure - Math.floor(measure) + 1) % 1;
    const frameIndex = Math.floor(frac * total * 2);
    r.renderFrame(frameIndex);
  }, []);

  // 🔒 STABLE ref callback — does not change between renders
  const setCanvasNode = useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      if (!node) return; // detach
      if (lastInitNodeRef.current === node) return; // already bound to this node

      lastInitNodeRef.current = node;

      if (!rendererRef.current) {
        rendererRef.current = new LottieDancerRenderer();
      }
      const ctx = node.getContext('2d');
      if (!ctx) return;
      rendererRef.current.init(ctx);

      // Load current move once on attach
      (async () => {
        try {
          await rendererRef.current!.setSource(danceMoveRef.current);
          readyRef.current = true;
          force(x => x + 1); // optional: reflect "ready"
          renderAt(measureRef.current); // paint immediately
        } catch {
          readyRef.current = false;
          force(x => x + 1);
        }
      })();
    },
    [renderAt]
  );

  // Size backing store + repaint on height change
  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const dpr = window.devicePixelRatio || 1;
    node.style.width = `${Math.max(0, height)}px`;
    node.style.height = `${Math.max(0, height)}px`;
    node.width = Math.max(1, Math.floor(Math.max(1, height) * dpr));
    node.height = Math.max(1, Math.floor(Math.max(1, height) * dpr));
    if (rendererRef.current && readyRef.current) {
      rendererRef.current.resize();
      renderAt(measureRef.current);
    }
  }, [height, renderAt]);

  // Advance frames as the playhead moves (no re-init)
  useEffect(() => {
    if (readyRef.current) renderAt(measureRef.current);
  }, [measurePosition, renderAt]);

  // If the move changes at runtime, reload it (no ref churn)
  useEffect(() => {
    if (!readyRef.current || !rendererRef.current) return;
    (async () => {
      try {
        await rendererRef.current!.setSource(danceMoveRef.current);
        renderAt(measureRef.current);
      } catch {}
    })();
  }, [danceMove, renderAt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        rendererRef.current?.destroyAnim();
      } catch {}
      rendererRef.current = null;
      lastInitNodeRef.current = null;
      readyRef.current = false;
    };
  }, []);

  if (!danceMove) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: height,
        height,
      }}
    >
      <canvas
        ref={setCanvasNode}
        style={{display: 'block', background: 'transparent'}}
      />
    </div>
  );
};

export default DancerOverlayCanvas;
