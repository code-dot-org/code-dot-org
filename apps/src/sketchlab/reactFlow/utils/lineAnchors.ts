import type {XYPosition} from '@xyflow/react';

import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {LINE_ANCHOR_SIZE_PX} from '../constants';

// Builds a lineAnchor node positioned so that its visible Handle ends up at
// `handleFlowPosition`. Source anchors render their Handle on the right
// side of the 10×10 box; target anchors render on the left. Both sit
// vertically centered, so we offset the node's top-left corner accordingly.
export function createLineAnchorAtHandle(
  handleFlowPosition: XYPosition,
  role: 'source' | 'target'
): SketchlabReactFlowNode {
  const position: XYPosition =
    role === 'source'
      ? {
          x: handleFlowPosition.x - LINE_ANCHOR_SIZE_PX,
          y: handleFlowPosition.y - LINE_ANCHOR_SIZE_PX / 2,
        }
      : {
          x: handleFlowPosition.x,
          y: handleFlowPosition.y - LINE_ANCHOR_SIZE_PX / 2,
        };
  return {
    id: createUuid(),
    type: 'lineAnchor',
    position,
    data: {lineAnchorRole: role},
    style: {width: LINE_ANCHOR_SIZE_PX, height: LINE_ANCHOR_SIZE_PX},
  };
}

// Inverse of createLineAnchorAtHandle's offset: given an anchor's top-left
// position and role, return the flow-coordinate position of its visible
// Handle. Used by drag/keyboard paths that need to test whether the
// post-move handle position lands on (or near) another node's handle.
export function anchorHandleFlowPosition(
  position: XYPosition,
  role: 'source' | 'target'
): XYPosition {
  return role === 'source'
    ? {
        x: position.x + LINE_ANCHOR_SIZE_PX,
        y: position.y + LINE_ANCHOR_SIZE_PX / 2,
      }
    : {
        x: position.x,
        y: position.y + LINE_ANCHOR_SIZE_PX / 2,
      };
}

// Resolves the on-screen position of a node's handle to canvas coordinates.
// Returns null if the node isn't currently rendered. When the handleId
// can't be matched we fall back to any handle on the node, which
// keeps the line endpoint roughly correct rather than dropping the drag.
export function getHandleFlowPosition(
  nodeId: string,
  handleId: string | undefined,
  screenToFlowPosition: (point: XYPosition) => XYPosition
): XYPosition | null {
  const handles = document.querySelectorAll<HTMLElement>(
    `.react-flow__handle[data-nodeid="${CSS.escape(nodeId)}"]`
  );
  if (handles.length === 0) {
    return null;
  }
  const matched = handleId
    ? Array.from(handles).find(handle => handle.dataset.handleid === handleId)
    : undefined;
  const chosen = matched ?? handles[0];
  const rect = chosen.getBoundingClientRect();
  return screenToFlowPosition({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });
}
