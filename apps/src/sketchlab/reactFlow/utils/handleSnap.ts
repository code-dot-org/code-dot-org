// Searches the DOM for the React Flow handle nearest to a screen-space
// point. Used to snap a dragged line-anchor onto a node's handle when the
// user drops the anchor close enough.
//
// Operates on the rendered DOM rather than node geometry because React
// Flow already lays handles out at their final on-screen positions
// (factoring in node size, transform, zoom, etc.). Reading those is
// simpler than re-deriving the handle position from node state.

export interface SnapTarget {
  nodeId: string;
  handleId: string | null;
  handleType: 'source' | 'target';
}

function getHandleType(handle: HTMLElement): 'source' | 'target' | null {
  if (handle.classList.contains('source')) {
    return 'source';
  }
  if (handle.classList.contains('target')) {
    return 'target';
  }
  return null;
}

export function findNearestHandle(
  screenPoint: {x: number; y: number},
  excludeNodeId: string,
  requiredType: 'source' | 'target',
  radiusPx: number
): SnapTarget | null {
  const handles = document.querySelectorAll<HTMLElement>(
    '.react-flow__handle'
  );
  let closest: SnapTarget | null = null;
  let closestDistance = radiusPx;

  handles.forEach(handle => {
    const nodeId = handle.dataset.nodeid;
    if (!nodeId || nodeId === excludeNodeId) {
      return;
    }
    const handleType = getHandleType(handle);
    if (handleType !== requiredType) {
      return;
    }

    const rect = handle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(
      centerX - screenPoint.x,
      centerY - screenPoint.y
    );

    if (distance < closestDistance) {
      closest = {
        nodeId,
        handleId: handle.dataset.handleid ?? null,
        handleType,
      };
      closestDistance = distance;
    }
  });

  return closest;
}
