import type {XYPosition} from '@xyflow/react';
import {describe, expect, it} from 'vitest';

import {
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
  parameterNodeId,
} from '../../model/constants';
import {createEffectDocument} from '../../model/document';
import type {EffectDocument} from '../../model/types';
import {defaultNodeRegistry} from '../../nodes/definitions/index';
import {
  ACTIVE_EDGE_Z_INDEX,
  DEFAULT_COMMENT_SIZE,
  ERROR_EDGE_STROKE,
  FLOW_COMMENT_TYPE,
  FLOW_GHOST_TYPE,
  reconcileFlowNodes,
  toFlowEdges,
  toFlowNodes,
} from '../flowMapping';
import {portColor} from '../portTypes';

const document: EffectDocument = {
  ...createEffectDocument(),
  parameters: [
    {id: 'strength', name: 'strength', type: 'float', defaultValue: 1},
  ],
};

const positionsFor = (ids: string[]): Map<string, XYPosition> =>
  new Map(ids.map((id, index) => [id, {x: index * 10, y: index * 10}]));

describe('toFlowNodes', () => {
  it('takes ghost positions from the pinning pass, not the document', () => {
    const positions = positionsFor([INPUT_UV_NODE_ID, OUTPUT_NODE_ID]);

    const nodes = toFlowNodes(document, defaultNodeRegistry, positions);
    const uv = nodes.find(node => node.id === INPUT_UV_NODE_ID);

    expect(uv?.type).toBe(FLOW_GHOST_TYPE);
    expect(uv?.position).toEqual(positions.get(INPUT_UV_NODE_ID));
  });

  it('omits ghosts whose row knob has not been measured yet', () => {
    // Positions arrive one render after the rows mount. Emitting a ghost with
    // a guessed position would draw its wires somewhere wrong for that frame —
    // which is how the pinned rows first appeared not to be connected at all.
    const nodes = toFlowNodes(document, defaultNodeRegistry, new Map());

    expect(nodes.some(node => node.type === FLOW_GHOST_TYPE)).toBe(false);
  });

  it('gives every input knob and the output a ghost once measured', () => {
    const positions = positionsFor([
      INPUT_UV_NODE_ID,
      parameterNodeId('strength'),
      OUTPUT_NODE_ID,
    ]);

    const ghostIds = toFlowNodes(document, defaultNodeRegistry, positions)
      .filter(node => node.type === FLOW_GHOST_TYPE)
      .map(node => node.id);

    expect(ghostIds).toEqual([
      INPUT_UV_NODE_ID,
      parameterNodeId('strength'),
      OUTPUT_NODE_ID,
    ]);
  });

  it('keeps workspace nodes at the positions the document stores', () => {
    const nodes = toFlowNodes(document, defaultNodeRegistry, new Map());
    const sample = nodes.find(node => node.id === 'sample-1');

    expect(sample?.position).toEqual({x: 0, y: 0});
  });
});

describe('reconcileFlowNodes', () => {
  const ghostPositions = positionsFor([INPUT_UV_NODE_ID, OUTPUT_NODE_ID]);
  const base = () => toFlowNodes(document, defaultNodeRegistry, ghostPositions);

  /** A node as React Flow hands it back: measured, and possibly selected. */
  const asManaged = (
    nodes: ReturnType<typeof base>,
    id: string,
    extra: Record<string, unknown>,
  ) =>
    nodes.map(node =>
      node.id === id
        ? ({...node, measured: {width: 168, height: 90}, ...extra} as never)
        : node,
    );

  it('keeps the size React Flow measured', () => {
    // Losing `measured` is what leaves a node "not initialized" — React Flow
    // then refuses to drag it and logs error #015.
    const current = asManaged(base(), 'sample-1', {});

    const merged = reconcileFlowNodes(
      current,
      document,
      defaultNodeRegistry,
      ghostPositions,
    );

    expect(merged.find(node => node.id === 'sample-1')?.measured).toEqual({
      width: 168,
      height: 90,
    });
  });

  it('keeps selection, which lives in React Flow rather than the document', () => {
    const current = asManaged(base(), 'sample-1', {selected: true});

    const merged = reconcileFlowNodes(
      current,
      document,
      defaultNodeRegistry,
      ghostPositions,
    );

    expect(merged.find(node => node.id === 'sample-1')?.selected).toBe(true);
  });

  it('takes the resting position from the document', () => {
    const current = asManaged(base(), 'sample-1', {
      position: {x: 999, y: 999},
    });
    const moved = {
      ...document,
      nodes: document.nodes.map(node =>
        node.id === 'sample-1' ? {...node, position: {x: 40, y: 60}} : node,
      ),
    };

    const merged = reconcileFlowNodes(
      current,
      moved,
      defaultNodeRegistry,
      ghostPositions,
    );

    expect(merged.find(node => node.id === 'sample-1')?.position).toEqual({
      x: 40,
      y: 60,
    });
  });

  it('leaves a node being dragged where the pointer put it', () => {
    // The document only learns the position on drag stop, so reading from it
    // mid-gesture would snap the node back on every frame.
    const current = asManaged(base(), 'sample-1', {
      dragging: true,
      position: {x: 512, y: 300},
    });

    const merged = reconcileFlowNodes(
      current,
      document,
      defaultNodeRegistry,
      ghostPositions,
    );

    expect(merged.find(node => node.id === 'sample-1')?.position).toEqual({
      x: 512,
      y: 300,
    });
  });

  it('picks up a node added to the document', () => {
    const withExtra = {
      ...document,
      nodes: [
        ...document.nodes,
        {id: 'sine-9', type: 'sine', position: {x: 5, y: 5}},
      ],
    };

    const merged = reconcileFlowNodes(
      base(),
      withExtra,
      defaultNodeRegistry,
      ghostPositions,
    );

    expect(merged.some(node => node.id === 'sine-9')).toBe(true);
  });
});

describe('toFlowEdges', () => {
  const [firstEdge] = document.edges;

  it('marks the selected edge', () => {
    // React Flow reads selection back out of the controlled `edges` prop, so
    // an edge that is not marked here can never be selected — and the delete
    // key has nothing to act on.
    const edges = toFlowEdges(document, {
      selectedIds: new Set([firstEdge.id]),
    });

    expect(edges.find(edge => edge.id === firstEdge.id)?.selected).toBe(true);
    expect(edges.filter(edge => edge.selected)).toHaveLength(1);
  });

  it('shows the delete button on the selected edge', () => {
    const edges = toFlowEdges(document, {
      selectedIds: new Set([firstEdge.id]),
    });

    expect(edges.find(edge => edge.id === firstEdge.id)?.data?.active).toBe(
      true,
    );
  });

  it('shows the delete button on the hovered edge without selecting it', () => {
    const edges = toFlowEdges(document, {hoveredId: firstEdge.id});
    const hovered = edges.find(edge => edge.id === firstEdge.id);

    expect(hovered?.data?.active).toBe(true);
    expect(hovered?.selected).toBe(false);
  });

  it('leaves every other edge inactive', () => {
    const edges = toFlowEdges(document, {hoveredId: firstEdge.id});

    expect(edges.filter(edge => edge.data?.active)).toHaveLength(1);
  });

  it('raises the active wire above the nodes it runs behind', () => {
    // React Flow's viewport layers all sit at `z-index: auto` and stack in DOM
    // order, nodes last. Measured on the ripple graph, a third of one wire's
    // length passes behind node bodies — taking its hit area and its delete
    // button with it. Elevating the active wire is what makes it reachable.
    const edges = toFlowEdges(document, {hoveredId: firstEdge.id});

    expect(edges.find(edge => edge.id === firstEdge.id)?.zIndex).toBe(
      ACTIVE_EDGE_Z_INDEX,
    );
  });

  it('leaves wires at rest beneath the nodes', () => {
    // Only the wire being pointed at is raised; otherwise the graph reads as a
    // pile of wires drawn over every node.
    const edges = toFlowEdges(document, {hoveredId: firstEdge.id});

    for (const edge of edges.filter(
      candidate => candidate.id !== firstEdge.id,
    )) {
      expect(edge.zIndex).toBeUndefined();
    }
  });

  it('gives a comment node its own flow type and no ports', () => {
    const withComment = {
      ...document,
      nodes: [
        ...document.nodes,
        {
          id: 'comment-1',
          type: 'comment',
          position: {x: 40, y: 40},
          note: 'Start here.',
        },
      ],
    };

    const flow = toFlowNodes(withComment, defaultNodeRegistry, new Map());
    const comment = flow.find(node => node.id === 'comment-1');

    expect(comment?.type).toBe(FLOW_COMMENT_TYPE);
    expect(comment?.data).toEqual({
      node: expect.objectContaining({note: 'Start here.'}),
    });
    // A resizable node needs an explicit box for React Flow to act on.
    expect(comment).toMatchObject(DEFAULT_COMMENT_SIZE);
  });

  it('gives a comment the size the document stored for it', () => {
    const withComment = {
      ...document,
      nodes: [
        ...document.nodes,
        {
          id: 'comment-1',
          type: 'comment',
          position: {x: 40, y: 40},
          size: {width: 320, height: 180},
        },
      ],
    };

    const flow = toFlowNodes(withComment, defaultNodeRegistry, new Map());

    // On `width`/`height`, the same fields React Flow writes when resizing —
    // set only `style` and an undo cannot shrink the box back.
    expect(flow.find(node => node.id === 'comment-1')).toMatchObject({
      width: 320,
      height: 180,
    });
  });

  it('colors a wire by the type it carries', () => {
    const edges = toFlowEdges(document, {
      wireTypes: new Map([[firstEdge.id, 'vec2' as const]]),
    });
    const typed = edges.find(edge => edge.id === firstEdge.id);
    const untyped = edges.find(edge => edge.id !== firstEdge.id);

    expect(typed?.style?.stroke).toBe(portColor('vec2'));
    expect(untyped?.style?.stroke).toBeUndefined();
  });

  it('colors a narrowed wire by what it delivers, not what it left with', () => {
    // The dot on the source node keeps the vec4 color; the wire itself is
    // carrying a single number by the time it lands, and says so.
    const narrowed = {
      ...document,
      edges: document.edges.map(edge =>
        edge.id === firstEdge.id
          ? {...edge, source: {...edge.source, swizzle: 'y'}}
          : edge,
      ),
    };

    const edges = toFlowEdges(narrowed, {
      wireTypes: new Map([[firstEdge.id, 'vec4' as const]]),
    });
    const swizzled = edges.find(edge => edge.id === firstEdge.id);

    expect(swizzled?.style?.stroke).toBe(portColor('float'));
    expect(swizzled?.data?.swizzleLabel).toBe('G');
    expect(swizzled?.data?.swizzleColor).toBe(portColor('float'));
  });

  it('leaves an unswizzled wire without a badge', () => {
    const edges = toFlowEdges(document, {
      wireTypes: new Map([[firstEdge.id, 'vec4' as const]]),
    });

    expect(
      edges.find(edge => edge.id === firstEdge.id)?.data?.swizzleLabel,
    ).toBeUndefined();
  });

  it('keeps the type color while the wire is active', () => {
    // Recoloring on hover would break the association the colors exist to
    // build; activity is shown by width and opacity instead.
    const edges = toFlowEdges(document, {
      hoveredId: firstEdge.id,
      wireTypes: new Map([[firstEdge.id, 'sampler2D' as const]]),
    });
    const active = edges.find(edge => edge.id === firstEdge.id);

    expect(active?.style?.stroke).toBe(portColor('sampler2D'));
    expect(active?.style?.strokeWidth).toBe(3);
    expect(active?.style?.strokeOpacity).toBe(1);
  });

  it('draws the errored wire dashed red, over its type color', () => {
    const edges = toFlowEdges(document, {
      errorEdgeId: firstEdge.id,
      wireTypes: new Map([[firstEdge.id, 'vec2' as const]]),
    });
    const errored = edges.find(edge => edge.id === firstEdge.id);

    // The error outranks the type color — the wire being wrong is the one
    // thing it must show — and the dash carries the signal without color.
    expect(errored?.style?.stroke).toBe(ERROR_EDGE_STROKE);
    expect(errored?.style?.strokeDasharray).toBe('7 4');
    expect(errored?.zIndex).toBe(ACTIVE_EDGE_Z_INDEX);
  });

  it('leaves healthy wires untouched by an error elsewhere', () => {
    const edges = toFlowEdges(document, {errorEdgeId: firstEdge.id});

    for (const edge of edges.filter(
      candidate => candidate.id !== firstEdge.id,
    )) {
      expect(edge.style?.strokeDasharray).toBeUndefined();
      expect(edge.zIndex).toBeUndefined();
    }
  });

  it('carries the document ids React Flow needs to route each wire', () => {
    const edges = toFlowEdges(document);
    const mapped = edges.find(edge => edge.id === firstEdge.id);

    expect(mapped).toMatchObject({
      source: firstEdge.source.node,
      sourceHandle: firstEdge.source.port,
      target: firstEdge.target.node,
      targetHandle: firstEdge.target.port,
    });
  });
});
