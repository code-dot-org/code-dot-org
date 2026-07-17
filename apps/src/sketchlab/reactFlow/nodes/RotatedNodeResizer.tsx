import {useNodeId, useReactFlow, useStore} from '@xyflow/react';
import classNames from 'classnames';
import React, {useCallback, useRef} from 'react';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
} from '../constants';
import {usePushSnapshot} from '../context';
import {REACT_FLOW_INTERACTION_CLASS} from '../reactFlowSelectors';
import {SketchLabNode} from '../types';
import {
  computeRotatedResize,
  resizeCursorForHandle,
  ResizeHandlePosition,
  RotatedResizeStart,
  RESIZE_HANDLE_POSITIONS,
} from '../utils/rotatedResize';

import styles from './rotated-node-resizer.module.scss';

interface RotatedNodeResizerProps {
  isVisible: boolean;
  rotation: number;
  minWidth?: number;
  minHeight?: number;
}

interface ActiveDrag {
  handle: ResizeHandlePosition;
  pointerId: number;
  startFlowPointer: {x: number; y: number};
  start: RotatedResizeStart;
  hasMoved: boolean;
}

const HANDLE_CLASS: Record<ResizeHandlePosition, string> = {
  'top-left': styles.handleTopLeft,
  top: styles.handleTop,
  'top-right': styles.handleTopRight,
  right: styles.handleRight,
  'bottom-right': styles.handleBottomRight,
  bottom: styles.handleBottom,
  'bottom-left': styles.handleBottomLeft,
  left: styles.handleLeft,
};

// Corner handles resize both axes; their names are hyphenated ('top-left').
// Edge handles resize one axis; their names are single words ('top').
const isCornerHandle = (handle: ResizeHandlePosition) => handle.includes('-');

// Edge strips before corners, so the corner dots stack on top of the strip
// ends where a grab should resize both axes.
const RESIZE_HANDLE_RENDER_ORDER: readonly ResizeHandlePosition[] = [
  ...RESIZE_HANDLE_POSITIONS.filter(handle => !isCornerHandle(handle)),
  ...RESIZE_HANDLE_POSITIONS.filter(isCornerHandle),
];

// Counter-scale corner dots uniformly. Edge strips must keep their full-edge
// length, so scale only their perpendicular thickness.
function handleScaleValue(
  handle: ResizeHandlePosition,
  handleScale: number
): string {
  if (isCornerHandle(handle)) {
    return `${handleScale}`;
  }
  const isHorizontalEdge = handle === 'top' || handle === 'bottom';
  return isHorizontalEdge ? `1 ${handleScale}` : `${handleScale} 1`;
}

/**
 * Selection bounding box + resize handles that rotate with the node,
 * replacing React Flow's axis-aligned NodeResizer. Dragging a handle
 * resizes the node along its own rotated axes with the opposite
 * corner/edge pinned in place.
 */
function RotatedNodeResizer({
  isVisible,
  rotation,
  minWidth = MIN_NODE_WIDTH,
  minHeight = MIN_NODE_HEIGHT,
}: RotatedNodeResizerProps) {
  const nodeId = useNodeId();
  const {getNode, screenToFlowPosition, updateNode} =
    useReactFlow<SketchLabNode>();
  const pushSnapshot = usePushSnapshot();
  const zoom = useStore(state => state.transform[2]);
  const activeDragRef = useRef<ActiveDrag | null>(null);

  const handlePointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      handle: ResizeHandlePosition
    ) => {
      // Reject any non-primary pointer event (ex. second finger on a touch screen),
      // any non-left click mouse event (button 0), or when we don't have a nodeId.
      if (!event.isPrimary || event.button !== 0 || !nodeId) {
        return;
      }
      const node = getNode(nodeId);
      if (!node) {
        return;
      }
      // Keep React Flow's node drag and pane interactions from starting.
      event.stopPropagation();
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      activeDragRef.current = {
        handle,
        pointerId: event.pointerId,
        startFlowPointer: screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        start: {
          position: {...node.position},
          width: node.width ?? node.measured?.width ?? DEFAULT_NODE_WIDTH,
          height: node.height ?? node.measured?.height ?? DEFAULT_NODE_HEIGHT,
          rotationDeg: rotation,
        },
        hasMoved: false,
      };
    },
    [nodeId, getNode, screenToFlowPosition, rotation]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = activeDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId || !nodeId) {
        return;
      }
      const flowPointer = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const pointerDelta = {
        x: flowPointer.x - drag.startFlowPointer.x,
        y: flowPointer.y - drag.startFlowPointer.y,
      };
      if (pointerDelta.x === 0 && pointerDelta.y === 0) {
        return;
      }
      // Push the undo snapshot on the first move, before any mutation, so
      // a bare click on a handle doesn't create a history entry.
      if (!drag.hasMoved) {
        pushSnapshot();
        drag.hasMoved = true;
      }
      const result = computeRotatedResize({
        start: drag.start,
        handle: drag.handle,
        pointerDelta,
        minWidth,
        minHeight,
      });
      updateNode(nodeId, {
        position: result.position,
        width: result.width,
        height: result.height,
      });
    },
    [
      nodeId,
      screenToFlowPosition,
      pushSnapshot,
      updateNode,
      minWidth,
      minHeight,
    ]
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activeDragRef.current?.pointerId === event.pointerId) {
        activeDragRef.current = null;
      }
    },
    []
  );

  if (!isVisible) {
    return null;
  }

  // Counter-scale so handles keep a constant screen size when zoomed out.
  const handleScale = Math.max(1 / zoom, 1);

  return (
    <div className={styles.resizer} aria-hidden="true">
      <div className={styles.resizeBox} />
      {RESIZE_HANDLE_RENDER_ORDER.map(handle => {
        const isCorner = isCornerHandle(handle);
        return (
          <div
            key={handle}
            className={classNames(
              styles.handle,
              isCorner ? styles.handleCorner : styles.handleEdge,
              HANDLE_CLASS[handle],
              REACT_FLOW_INTERACTION_CLASS.noDrag,
              REACT_FLOW_INTERACTION_CLASS.noPan
            )}
            style={{
              cursor: resizeCursorForHandle(handle, rotation),
              scale: handleScaleValue(handle, handleScale),
            }}
            onPointerDown={event => handlePointerDown(event, handle)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
          />
        );
      })}
    </div>
  );
}

export default RotatedNodeResizer;
