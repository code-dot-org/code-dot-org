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
const ENDPOINT_KEYBOARD_STEP_PX = 8;
type LinePoint = {x: number; y: number};

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

function getEndpointPixels(
  data: Record<string, string | number | boolean>,
  width: number,
  height: number
) {
  const hasPixelEndpoints =
    typeof data.startX !== 'undefined' &&
    typeof data.startY !== 'undefined' &&
    typeof data.endX !== 'undefined' &&
    typeof data.endY !== 'undefined';

  if (hasPixelEndpoints) {
    return {
      startX: getNumberOrFallback(data.startX as string | number, 0),
      startY: getNumberOrFallback(data.startY as string | number, height / 2),
      endX: getNumberOrFallback(data.endX as string | number, width),
      endY: getNumberOrFallback(data.endY as string | number, height / 2),
    };
  }

  // Backward compatibility for already-saved ratio-based lines.
  const startRatioX = getNumberOrFallback(
    data.startRatioX as string | number,
    0
  );
  const startRatioY = getNumberOrFallback(
    data.startRatioY as string | number,
    0.5
  );
  const endRatioX = getNumberOrFallback(data.endRatioX as string | number, 1);
  const endRatioY = getNumberOrFallback(data.endRatioY as string | number, 0.5);
  return {
    startX: startRatioX * width,
    startY: startRatioY * height,
    endX: endRatioX * width,
    endY: endRatioY * height,
  };
}

function LineNode({id, data, selected}: LineNodeProps) {
  const readOnly = useSketchLabReadOnly();
  const {getNode, setNodes, screenToFlowPosition} = useReactFlow();
  const dragEndpointRef = useRef<DragEndpoint | null>(null);
  const fixedPointRef = useRef<{x: number; y: number} | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

  const applyLinePoints = useCallback(
    (startPoint: LinePoint, endPoint: LinePoint) => {
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
      const startLocalX = startPoint.x - newX;
      const startLocalY = startPoint.y - newY;
      const endLocalX = endPoint.x - newX;
      const endLocalY = endPoint.y - newY;

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
                  startX: startLocalX,
                  startY: startLocalY,
                  endX: endLocalX,
                  endY: endLocalY,
                },
              }
            : node
        )
      );
    },
    [id, setNodes]
  );

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
      applyLinePoints(startPoint, endPoint);
    },
    [applyLinePoints, screenToFlowPosition]
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
    (endpoint: DragEndpoint, event: React.PointerEvent<HTMLButtonElement>) => {
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
      const endpoints = getEndpointPixels(
        (node.data || {}) as Record<string, string | number | boolean>,
        width,
        height
      );
      const startPoint: LinePoint = {
        x: node.position.x + endpoints.startX,
        y: node.position.y + endpoints.startY,
      };
      const endPoint: LinePoint = {
        x: node.position.x + endpoints.endX,
        y: node.position.y + endpoints.endY,
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

  const nudgeEndpointWithKeyboard = useCallback(
    (endpoint: DragEndpoint, event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (readOnly) {
        return;
      }

      let deltaX = 0;
      let deltaY = 0;
      const step = event.shiftKey
        ? ENDPOINT_KEYBOARD_STEP_PX * 2
        : ENDPOINT_KEYBOARD_STEP_PX;
      if (event.key === 'ArrowLeft') deltaX = -step;
      if (event.key === 'ArrowRight') deltaX = step;
      if (event.key === 'ArrowUp') deltaY = -step;
      if (event.key === 'ArrowDown') deltaY = step;

      if (!deltaX && !deltaY) {
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
      const endpoints = getEndpointPixels(
        (node.data || {}) as Record<string, string | number | boolean>,
        width,
        height
      );

      const startPoint: LinePoint = {
        x: node.position.x + endpoints.startX,
        y: node.position.y + endpoints.startY,
      };
      const endPoint: LinePoint = {
        x: node.position.x + endpoints.endX,
        y: node.position.y + endpoints.endY,
      };

      if (endpoint === 'start') {
        startPoint.x += deltaX;
        startPoint.y += deltaY;
      } else {
        endPoint.x += deltaX;
        endPoint.y += deltaY;
      }

      applyLinePoints(startPoint, endPoint);
    },
    [applyLinePoints, getNode, id, readOnly]
  );

  const node = getNode(id);
  const width = getNumberOrFallback(node?.style?.width, MIN_LINE_WIDTH);
  const height = getNumberOrFallback(node?.style?.height, MIN_LINE_HEIGHT);
  const endpoints = getEndpointPixels(data, width, height);
  const lineWidth = Math.max(width, MIN_DIMENSION_PX);
  const lineHeight = Math.max(height, MIN_DIMENSION_PX);

  return (
    <div className={styles.lineNode} aria-label="Line">
      <svg
        className={styles.line}
        viewBox={`0 0 ${lineWidth} ${lineHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1={endpoints.startX}
          y1={endpoints.startY}
          x2={endpoints.endX}
          y2={endpoints.endY}
          className={styles.lineStroke}
        />
      </svg>
      {selected && !readOnly && (
        <>
          <button
            type="button"
            className={`${styles.lineHandle} nodrag nopan`}
            onPointerDown={event => startDragging('start', event)}
            onKeyDown={event => nudgeEndpointWithKeyboard('start', event)}
            data-line-endpoint="true"
            data-focus-on-enter="true"
            aria-label="Line start point"
            style={{
              left: `${endpoints.startX}px`,
              top: `${endpoints.startY}px`,
            }}
          />
          <button
            type="button"
            className={`${styles.lineHandle} nodrag nopan`}
            onPointerDown={event => startDragging('end', event)}
            onKeyDown={event => nudgeEndpointWithKeyboard('end', event)}
            data-line-endpoint="true"
            data-focus-on-enter="true"
            aria-label="Line end point"
            style={{
              left: `${endpoints.endX}px`,
              top: `${endpoints.endY}px`,
            }}
          />
        </>
      )}
    </div>
  );
}

export default memo(LineNode);
