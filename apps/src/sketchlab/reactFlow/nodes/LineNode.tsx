import {useReactFlow} from '@xyflow/react';
import React, {memo, useCallback, useEffect, useRef} from 'react';

import {MIN_LINE_HEIGHT, MIN_LINE_WIDTH} from '../constants';
import {useSketchLabReadOnly} from '../context';

import styles from './line-node.module.scss';

interface LineNodeProps {
  id: string;
  data: Record<string, string | number | boolean>;
  selected: boolean;
}

type DragEndpoint = 'start' | 'end';
const MIN_DIMENSION_PX = 1;

function getNumberOrFallback(
  value: string | number | undefined,
  fallback: number
): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function getEndpointRatios(data: Record<string, string | number | boolean>) {
  const startX = getNumberOrFallback(data.startRatioX as string | number, 0);
  const startY = getNumberOrFallback(data.startRatioY as string | number, 0.5);
  const endX = getNumberOrFallback(data.endRatioX as string | number, 1);
  const endY = getNumberOrFallback(data.endRatioY as string | number, 0.5);
  return {startX, startY, endX, endY};
}

function LineNode({id, data, selected}: LineNodeProps) {
  const readOnly = useSketchLabReadOnly();
  const {getNode, setNodes, screenToFlowPosition} = useReactFlow();
  const dragEndpointRef = useRef<DragEndpoint | null>(null);
  const fixedPointRef = useRef<{x: number; y: number} | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const dragging = dragEndpointRef.current;
      const fixedPoint = fixedPointRef.current;
      if (
        !dragging ||
        !fixedPoint ||
        activePointerIdRef.current !== event.pointerId
      ) {
        return;
      }

      const movingPoint = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const startPoint = dragging === 'start' ? movingPoint : fixedPoint;
      const endPoint = dragging === 'end' ? movingPoint : fixedPoint;

      const newX = Math.min(startPoint.x, endPoint.x);
      const newY = Math.min(startPoint.y, endPoint.y);
      const newWidth = Math.max(
        Math.abs(endPoint.x - startPoint.x),
        MIN_DIMENSION_PX
      );
      const newHeight = Math.max(
        Math.abs(endPoint.y - startPoint.y),
        MIN_DIMENSION_PX
      );
      const startRatioX = (startPoint.x - newX) / newWidth;
      const startRatioY = (startPoint.y - newY) / newHeight;
      const endRatioX = (endPoint.x - newX) / newWidth;
      const endRatioY = (endPoint.y - newY) / newHeight;

      setNodes(currentNodes =>
        currentNodes.map(node =>
          node.id === id
            ? {
                ...node,
                position: {x: newX, y: newY},
                style: {
                  ...node.style,
                  width: newWidth,
                  height: newHeight,
                },
                data: {
                  ...node.data,
                  startRatioX,
                  startRatioY,
                  endRatioX,
                  endRatioY,
                },
              }
            : node
        )
      );
    },
    [id, screenToFlowPosition, setNodes]
  );

  const stopDragging = useCallback(() => {
    dragEndpointRef.current = null;
    fixedPointRef.current = null;
    activePointerIdRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopDragging);
    window.removeEventListener('pointercancel', stopDragging);
  }, [handlePointerMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [handlePointerMove, stopDragging]);

  const startDragging = useCallback(
    (endpoint: DragEndpoint, event: React.PointerEvent<HTMLDivElement>) => {
      if (readOnly) {
        return;
      }
      if (dragEndpointRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const node = getNode(id);
      if (!node) {
        return;
      }

      const width = getNumberOrFallback(node.style?.width, MIN_LINE_WIDTH);
      const height = getNumberOrFallback(node.style?.height, MIN_LINE_HEIGHT);
      const ratios = getEndpointRatios(
        (node.data || {}) as Record<string, string | number | boolean>
      );
      const startPoint = {
        x: node.position.x + width * ratios.startX,
        y: node.position.y + height * ratios.startY,
      };
      const endPoint = {
        x: node.position.x + width * ratios.endX,
        y: node.position.y + height * ratios.endY,
      };

      dragEndpointRef.current = endpoint;
      fixedPointRef.current = endpoint === 'start' ? endPoint : startPoint;
      activePointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', stopDragging);
      window.addEventListener('pointercancel', stopDragging);
    },
    [getNode, handlePointerMove, id, readOnly, stopDragging]
  );

  const ratios = getEndpointRatios(data);

  return (
    <div className={styles.lineNode} aria-label="Line">
      <svg
        className={styles.line}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1={ratios.startX * 100}
          y1={ratios.startY * 100}
          x2={ratios.endX * 100}
          y2={ratios.endY * 100}
          className={styles.lineStroke}
        />
      </svg>
      {selected && !readOnly && (
        <>
          <div
            className={`${styles.lineHandle} nodrag nopan`}
            onPointerDown={event => startDragging('start', event)}
            style={{
              left: `${ratios.startX * 100}%`,
              top: `${ratios.startY * 100}%`,
            }}
            aria-hidden="true"
          />
          <div
            className={`${styles.lineHandle} nodrag nopan`}
            onPointerDown={event => startDragging('end', event)}
            style={{
              left: `${ratios.endX * 100}%`,
              top: `${ratios.endY * 100}%`,
            }}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}

export default memo(LineNode);
