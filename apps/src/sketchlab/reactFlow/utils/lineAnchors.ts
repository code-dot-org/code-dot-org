import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {LINE_ANCHOR_SIZE_PX} from '../constants';

type FlowPoint = {x: number; y: number};

// Builds a lineAnchor node positioned so that its visible Handle ends up at
// `handleFlowPosition`. Source anchors render their Handle on the right
// side of the 10×10 box; target anchors render on the left. Both sit
// vertically centered, so we offset the node's top-left corner accordingly.
export function createLineAnchorAtHandle(
  handleFlowPosition: FlowPoint,
  role: 'source' | 'target'
): SketchlabReactFlowNode {
  const position: FlowPoint =
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

// Resolves the on-screen position of a node's handle to flow coordinates.
// Returns null if the node isn't currently rendered (e.g. off-screen with
// virtualization, though we don't currently use that). When the handleId
// can't be matched exactly we fall back to any handle on the node, which
// keeps the line endpoint roughly correct rather than dropping the drag.
export function getHandleFlowPosition(
  nodeId: string,
  handleId: string | undefined,
  screenToFlowPosition: (point: FlowPoint) => FlowPoint
): FlowPoint | null {
  const handles = document.querySelectorAll<HTMLElement>(
    `.react-flow__handle[data-nodeid="${CSS.escape(nodeId)}"]`
  );
  if (handles.length === 0) {
    return null;
  }
  let chosen: HTMLElement | null = null;
  if (handleId) {
    handles.forEach(handle => {
      if (chosen) return;
      if (handle.dataset.handleid === handleId) {
        chosen = handle;
      }
    });
  }
  if (!chosen) {
    chosen = handles[0];
  }
  const rect = (chosen as HTMLElement).getBoundingClientRect();
  return screenToFlowPosition({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });
}
