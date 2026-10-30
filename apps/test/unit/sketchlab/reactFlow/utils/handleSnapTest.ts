import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';
import {
  attachEdgeEndpoint,
  findNearestHandleAmong,
  findNearestHandleInRadius,
  snapAnchorIfNearby,
} from '@cdo/apps/sketchlab/reactFlow/utils/handleSnap';

// jsdom returns an all-zero rect by default; pin each handle to a point so
// distance math is predictable (a zero-size rect centers on its top-left).
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
    } as DOMRect);
}

interface HandleSpec {
  nodeId: string;
  type: 'source' | 'target';
  x: number;
  y: number;
  handleId?: string;
  isAnchor?: boolean;
}

// Renders a React Flow handle inside a node wrapper so the document queries and
// the lineAnchor `.closest()` check in findNearestHandleInRadius see real DOM.
function addHandle(spec: HandleSpec): HTMLElement {
  const node = document.createElement('div');
  node.classList.add('react-flow__node');
  if (spec.isAnchor) {
    node.classList.add('react-flow__node-lineAnchor');
  }
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

// A setEdges that synchronously runs the updater over a starting array and
// exposes the result, mirroring how the hooks drive it.
function fakeSetEdges(initial: SketchlabReactFlowEdge[]) {
  let edges = initial;
  return {
    setEdges: (
      updater: (current: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
    ) => {
      edges = updater(edges);
    },
    edges: () => edges,
  };
}

function edge(
  id: string,
  source: string,
  target: string
): SketchlabReactFlowEdge {
  return {id, source, target} as SketchlabReactFlowEdge;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('findNearestHandleAmong', () => {
  const resolveToNodeId = (handle: HTMLElement) =>
    handle.dataset.nodeid ?? null;

  it('returns the closest handle of the required type within the radius', () => {
    addHandle({nodeId: 'near', type: 'source', x: 10, y: 0});
    addHandle({nodeId: 'far', type: 'source', x: 100, y: 0});
    const handles = document.querySelectorAll<HTMLElement>(
      '.react-flow__handle'
    );

    const snap = findNearestHandleAmong(
      handles,
      {x: 0, y: 0},
      'source',
      40,
      resolveToNodeId
    );

    expect(snap?.nodeId).toBe('near');
  });

  it('ignores handles of the other type', () => {
    addHandle({nodeId: 'wrongType', type: 'target', x: 5, y: 0});
    addHandle({nodeId: 'rightType', type: 'source', x: 30, y: 0});
    const handles = document.querySelectorAll<HTMLElement>(
      '.react-flow__handle'
    );

    const snap = findNearestHandleAmong(
      handles,
      {x: 0, y: 0},
      'source',
      40,
      resolveToNodeId
    );

    expect(snap?.nodeId).toBe('rightType');
  });

  it('returns null when nothing is within the radius', () => {
    addHandle({nodeId: 'far', type: 'source', x: 100, y: 0});
    const handles = document.querySelectorAll<HTMLElement>(
      '.react-flow__handle'
    );

    expect(
      findNearestHandleAmong(
        handles,
        {x: 0, y: 0},
        'source',
        40,
        resolveToNodeId
      )
    ).toBeNull();
  });

  it('skips handles whose resolveNodeId returns null', () => {
    addHandle({nodeId: 'excluded', type: 'source', x: 5, y: 0});
    addHandle({nodeId: 'kept', type: 'source', x: 30, y: 0});
    const handles = document.querySelectorAll<HTMLElement>(
      '.react-flow__handle'
    );

    const snap = findNearestHandleAmong(
      handles,
      {x: 0, y: 0},
      'source',
      40,
      h => (h.dataset.nodeid === 'excluded' ? null : h.dataset.nodeid ?? null)
    );

    expect(snap?.nodeId).toBe('kept');
  });

  it('records the handle id from the dataset', () => {
    addHandle({
      nodeId: 'n',
      handleId: 'top-source',
      type: 'source',
      x: 0,
      y: 0,
    });
    const handles = document.querySelectorAll<HTMLElement>(
      '.react-flow__handle'
    );

    const snap = findNearestHandleAmong(
      handles,
      {x: 0, y: 0},
      'source',
      40,
      resolveToNodeId
    );

    expect(snap?.handleId).toBe('top-source');
  });
});

describe('findNearestHandleInRadius', () => {
  it('skips handles on the excluded node ids', () => {
    addHandle({nodeId: 'self', type: 'source', x: 5, y: 0});
    addHandle({nodeId: 'opposite', type: 'source', x: 10, y: 0});
    addHandle({nodeId: 'other', type: 'source', x: 30, y: 0});

    const snap = findNearestHandleInRadius(
      {x: 0, y: 0},
      ['self', 'opposite'],
      'source',
      40
    );

    expect(snap?.nodeId).toBe('other');
  });

  it('skips handles that belong to a line anchor node', () => {
    addHandle({nodeId: 'anchor', type: 'source', x: 5, y: 0, isAnchor: true});
    addHandle({nodeId: 'realNode', type: 'source', x: 30, y: 0});

    const snap = findNearestHandleInRadius({x: 0, y: 0}, [], 'source', 40);

    expect(snap?.nodeId).toBe('realNode');
  });

  it('returns null when only excluded candidates are in range', () => {
    addHandle({nodeId: 'self', type: 'source', x: 5, y: 0});

    expect(
      findNearestHandleInRadius({x: 0, y: 0}, ['self'], 'source', 40)
    ).toBeNull();
  });
});

describe('attachEdgeEndpoint', () => {
  it('rewrites the matching edge and leaves others untouched', () => {
    const store = fakeSetEdges([
      edge('e1', 'anchor', 'nodeB'),
      edge('e2', 'x', 'y'),
    ]);

    attachEdgeEndpoint({
      edgeId: 'e1',
      side: 'source',
      nodeId: 'nodeC',
      handleId: 'left-source',
      setEdges: store.setEdges,
    });

    expect(store.edges()[0]).toMatchObject({
      source: 'nodeC',
      sourceHandle: 'left-source',
      target: 'nodeB',
    });
    expect(store.edges()[1]).toEqual(edge('e2', 'x', 'y'));
  });

  it('refuses an attachment that would collapse the edge onto one node', () => {
    const store = fakeSetEdges([edge('e1', 'anchor', 'nodeB')]);

    attachEdgeEndpoint({
      edgeId: 'e1',
      side: 'source',
      nodeId: 'nodeB',
      handleId: 'left-source',
      setEdges: store.setEdges,
    });

    expect(store.edges()[0]).toEqual(edge('e1', 'anchor', 'nodeB'));
  });
});

describe('snapAnchorIfNearby', () => {
  it('attaches the anchor end to the nearest real-node handle', () => {
    addHandle({
      nodeId: 'target',
      handleId: 'left-source',
      type: 'source',
      x: 10,
      y: 0,
    });
    const store = fakeSetEdges([edge('e1', 'anchor', 'nodeB')]);

    const snappedId = snapAnchorIfNearby({
      anchorId: 'anchor',
      screenPoint: {x: 0, y: 0},
      radiusPx: 40,
      edges: store.edges(),
      setEdges: store.setEdges,
    });

    expect(snappedId).toBe('e1');
    expect(store.edges()[0]).toMatchObject({
      source: 'target',
      sourceHandle: 'left-source',
    });
  });

  it('does not snap onto the node holding the other end', () => {
    // The opposite endpoint (nodeB) sits closest, but snapping there would make
    // a self-loop, so it must be excluded and the snap declined.
    addHandle({nodeId: 'nodeB', type: 'source', x: 5, y: 0});
    const store = fakeSetEdges([edge('e1', 'anchor', 'nodeB')]);

    const snappedId = snapAnchorIfNearby({
      anchorId: 'anchor',
      screenPoint: {x: 0, y: 0},
      radiusPx: 40,
      edges: store.edges(),
      setEdges: store.setEdges,
    });

    expect(snappedId).toBeNull();
    expect(store.edges()[0]).toEqual(edge('e1', 'anchor', 'nodeB'));
  });

  it('returns null when the anchor has no associated edge', () => {
    const store = fakeSetEdges([edge('e1', 'x', 'y')]);

    expect(
      snapAnchorIfNearby({
        anchorId: 'anchor',
        screenPoint: {x: 0, y: 0},
        radiusPx: 40,
        edges: store.edges(),
        setEdges: store.setEdges,
      })
    ).toBeNull();
  });
});
