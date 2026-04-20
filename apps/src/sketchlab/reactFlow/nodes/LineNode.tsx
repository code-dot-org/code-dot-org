import {useReactFlow} from '@xyflow/react';
import React, {memo, useCallback, useEffect, useRef} from 'react';

import {MIN_LINE_HEIGHT, MIN_LINE_WIDTH} from '../constants';
import {useSketchLabReadOnly} from '../context';

import styles from './line-node.module.scss';

interface LineNodeProps {
  id: string;
  selected: boolean;
}

type DragEndpoint = 'start' | 'end';

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

function LineNode({id, selected}: LineNodeProps) {
  const readOnly = useSketchLabReadOnly();
  const {getNode, setNodes, screenToFlowPosition} = useReactFlow();
  const dragEndpointRef = useRef<DragEndpoint | null>(null);
  const fixedPointRef = useRef<{x: number; y: number} | null>(null);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const dragging = dragEndpointRef.current;
      const fixedPoint = fixedPointRef.current;
      if (!dragging || !fixedPoint) {
        return;
      }

      const movingPoint = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newX: number;
      let newY: number;
      let newWidth: number;
      let newHeight: number;

      if (dragging === 'start') {
        const clampedX = Math.min(movingPoint.x, fixedPoint.x - MIN_LINE_WIDTH);
        const clampedY = Math.min(
          movingPoint.y,
          fixedPoint.y - MIN_LINE_HEIGHT
        );
        newX = clampedX;
        newY = clampedY;
        newWidth = fixedPoint.x - clampedX;
        newHeight = fixedPoint.y - clampedY;
      } else {
        const clampedX = Math.max(movingPoint.x, fixedPoint.x + MIN_LINE_WIDTH);
        const clampedY = Math.max(
          movingPoint.y,
          fixedPoint.y + MIN_LINE_HEIGHT
        );
        newX = fixedPoint.x;
        newY = fixedPoint.y;
        newWidth = clampedX - fixedPoint.x;
        newHeight = clampedY - fixedPoint.y;
      }

      setNodes(currentNodes =>
        currentNodes.map(node =>
          node.id === id
            ? {
                ...node,
                position: {x: newX, y: newY},
                style: {...node.style, width: newWidth, height: newHeight},
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
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopDragging);
  }, [handlePointerMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
    };
  }, [handlePointerMove, stopDragging]);

  const startDragging = useCallback(
    (endpoint: DragEndpoint, event: React.PointerEvent<HTMLDivElement>) => {
      if (readOnly) {
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
      const startPoint = {x: node.position.x, y: node.position.y};
      const endPoint = {
        x: node.position.x + width,
        y: node.position.y + height,
      };

      dragEndpointRef.current = endpoint;
      fixedPointRef.current = endpoint === 'start' ? endPoint : startPoint;

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', stopDragging);
    },
    [getNode, handlePointerMove, id, readOnly, stopDragging]
  );

  return (
    <div className={styles.lineNode} aria-label="Line">
      <svg
        className={styles.line}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line x1="0" y1="0" x2="100" y2="100" className={styles.lineStroke} />
      </svg>
      {selected && !readOnly && (
        <>
          <div
            className={`${styles.lineHandle} ${styles.startHandle} nodrag nopan`}
            onPointerDown={event => startDragging('start', event)}
            aria-hidden="true"
          />
          <div
            className={`${styles.lineHandle} ${styles.endHandle} nodrag nopan`}
            onPointerDown={event => startDragging('end', event)}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}

export default memo(LineNode);
