import {XYPosition} from '@xyflow/react';

import {LINE_ANCHOR_SIZE_PX} from '@cdo/apps/sketchlab/reactFlow/constants';
import {
  anchorHandleFlowPosition,
  attachEdgeToFreshAnchor,
  createLineAnchorAtHandle,
  findAnchorHandleSnap,
  getHandleFlowPosition,
  lineAnchorHandleId,
} from '@cdo/apps/sketchlab/reactFlow/utils/lineAnchors';

function stubRect(element: HTMLElement, x: number, y: number) {
  element.getBoundingClientRect = () =>
    ({
      x,
      y,
      left: x,
      top: y,
      width: 0,
      height: 0,
      right: x,
      bottom: y,
      toJSON: () => ({}),
    }) as DOMRect;
}

function addHandle(spec: {
  nodeId: string;
  type: 'source' | 'target';
  x: number;
  y: number;
  handleId?: string;
}): HTMLElement {
  const node = document.createElement('div');
  node.classList.add('react-flow__node');
  const handle = document.createElement('div');
  handle.classList.add('react-flow__handle', spec.type);
  handle.dataset.nodeid = spec.nodeId;
  if (spec.handleId) {
    handle.dataset.handleid = spec.handleId;
  }
  stubRect(handle, spec.x, spec.y);
  node.appendChild(handle);
  document.body.appendChild(node);
  return handle;
}

const identity = (point: XYPosition) => point;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('lineAnchorHandleId', () => {
  it('names the handle by role', () => {
    expect(lineAnchorHandleId('source')).toBe('line-anchor-source');
    expect(lineAnchorHandleId('target')).toBe('line-anchor-target');
  });
});

describe('createLineAnchorAtHandle', () => {
  it('offsets a source anchor so its right-side handle lands on the point', () => {
    const anchor = createLineAnchorAtHandle({x: 100, y: 50}, 'source');
    expect(anchor.position).toEqual({
      x: 100 - LINE_ANCHOR_SIZE_PX,
      y: 50 - LINE_ANCHOR_SIZE_PX / 2,
    });
    expect(anchor.type).toBe('lineAnchor');
    expect(anchor.data).toMatchObject({lineAnchorRole: 'source'});
    expect(anchor.style).toMatchObject({
      width: LINE_ANCHOR_SIZE_PX,
      height: LINE_ANCHOR_SIZE_PX,
    });
  });

  it('offsets a target anchor so its left-side handle lands on the point', () => {
    const anchor = createLineAnchorAtHandle({x: 100, y: 50}, 'target');
    expect(anchor.position).toEqual({
      x: 100,
      y: 50 - LINE_ANCHOR_SIZE_PX / 2,
    });
  });

  it('gives each anchor a distinct id', () => {
    const first = createLineAnchorAtHandle({x: 0, y: 0}, 'source');
    const second = createLineAnchorAtHandle({x: 0, y: 0}, 'source');
    expect(first.id).toEqual(expect.any(String));
    expect(first.id).not.toBe(second.id);
  });
});

describe('anchorHandleFlowPosition', () => {
  it('is the inverse of createLineAnchorAtHandle for both roles', () => {
    const handlePoint = {x: 73, y: 19};
    (['source', 'target'] as const).forEach(role => {
      const {position} = createLineAnchorAtHandle(handlePoint, role);
      expect(anchorHandleFlowPosition(position, role)).toEqual(handlePoint);
    });
  });
});

describe('attachEdgeToFreshAnchor', () => {
  it('spawns an anchor and points the given side at it', () => {
    const {anchor, edgePatch} = attachEdgeToFreshAnchor({x: 5, y: 5}, 'target');
    expect(anchor.type).toBe('lineAnchor');
    expect(edgePatch).toEqual({
      target: anchor.id,
      targetHandle: lineAnchorHandleId('target'),
    });
  });
});

describe('getHandleFlowPosition', () => {
  it('returns the matched handle center in flow coordinates', () => {
    addHandle({nodeId: 'n', handleId: 'wanted', type: 'source', x: 20, y: 30});
    addHandle({nodeId: 'n', handleId: 'other', type: 'target', x: 99, y: 99});

    expect(getHandleFlowPosition('n', 'wanted', identity)).toEqual({
      x: 20,
      y: 30,
    });
  });

  it('falls back to the first handle when the id does not match', () => {
    addHandle({nodeId: 'n', handleId: 'only', type: 'source', x: 11, y: 12});

    expect(getHandleFlowPosition('n', 'absent', identity)).toEqual({
      x: 11,
      y: 12,
    });
  });

  it('returns null when the node has no rendered handle', () => {
    expect(getHandleFlowPosition('missing', undefined, identity)).toBeNull();
  });
});

describe('findAnchorHandleSnap', () => {
  // A source anchor positioned so its handle sits exactly on the real node's
  // handle at (100, 0): handle = position + (SIZE, SIZE/2).
  const anchorOnHandle: XYPosition = {
    x: 100 - LINE_ANCHOR_SIZE_PX,
    y: 0 - LINE_ANCHOR_SIZE_PX / 2,
  };

  it('returns the snap position and the handle it lands on', () => {
    addHandle({nodeId: 'real', handleId: 'h', type: 'source', x: 100, y: 0});

    const snap = findAnchorHandleSnap({
      anchorPosition: anchorOnHandle,
      role: 'source',
      excludeNodeIds: ['anchor'],
      radiusPx: 40,
      flowToScreenPosition: identity,
      screenToFlowPosition: identity,
    });

    expect(snap).toEqual({
      position: anchorOnHandle,
      nodeId: 'real',
      handleId: 'h',
    });
  });

  it('returns null when no handle is within the radius', () => {
    addHandle({nodeId: 'real', type: 'source', x: 500, y: 0});

    expect(
      findAnchorHandleSnap({
        anchorPosition: anchorOnHandle,
        role: 'source',
        excludeNodeIds: ['anchor'],
        radiusPx: 40,
        flowToScreenPosition: identity,
        screenToFlowPosition: identity,
      })
    ).toBeNull();
  });

  it('ignores handles on excluded nodes', () => {
    addHandle({nodeId: 'real', type: 'source', x: 100, y: 0});

    expect(
      findAnchorHandleSnap({
        anchorPosition: anchorOnHandle,
        role: 'source',
        excludeNodeIds: ['anchor', 'real'],
        radiusPx: 40,
        flowToScreenPosition: identity,
        screenToFlowPosition: identity,
      })
    ).toBeNull();
  });
});
