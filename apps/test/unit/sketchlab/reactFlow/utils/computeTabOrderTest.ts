import {
  computeTabOrder,
  TabOrderEntry,
} from '@cdo/apps/sketchlab/reactFlow/utils/computeTabOrder';
import {
  SketchlabReactFlowNode,
  SketchlabReactFlowEdge,
} from '@cdo/apps/lab2/types';

function makeNode(
  id: string,
  x: number,
  y: number
): SketchlabReactFlowNode {
  return {id, position: {x, y}, data: {}};
}

function makeEdge(
  id: string,
  source: string,
  target: string
): SketchlabReactFlowEdge {
  return {id, source, target};
}

function ids(entries: TabOrderEntry[]): string[] {
  return entries.map(e => `${e.type}:${e.id}`);
}

describe('computeTabOrder', () => {
  it('returns empty array for no nodes', () => {
    expect(computeTabOrder([], [])).toEqual([]);
  });

  it('returns single node', () => {
    const nodes = [makeNode('a', 0, 0)];
    expect(computeTabOrder(nodes, [])).toEqual([{type: 'node', id: 'a'}]);
  });

  it('sorts orphan nodes top-to-bottom then left-to-right', () => {
    const nodes = [
      makeNode('c', 100, 200),
      makeNode('a', 0, 0),
      makeNode('b', 50, 0),
    ];
    expect(ids(computeTabOrder(nodes, []))).toEqual([
      'node:a',
      'node:b',
      'node:c',
    ]);
  });

  it('orders a simple chain A->B->C with edges interleaved', () => {
    const nodes = [
      makeNode('a', 0, 0),
      makeNode('b', 100, 0),
      makeNode('c', 200, 0),
    ];
    const edges = [
      makeEdge('e1', 'a', 'b'),
      makeEdge('e2', 'b', 'c'),
    ];
    expect(ids(computeTabOrder(nodes, edges))).toEqual([
      'node:a',
      'edge:e1',
      'node:b',
      'edge:e2',
      'node:c',
    ]);
  });

  it('uses topological sort respecting edge direction', () => {
    // B is above A visually but A->B via edge, so A comes first.
    const nodes = [
      makeNode('a', 0, 100),
      makeNode('b', 0, 0),
    ];
    const edges = [makeEdge('e1', 'a', 'b')];
    expect(ids(computeTabOrder(nodes, edges))).toEqual([
      'node:a',
      'edge:e1',
      'node:b',
    ]);
  });

  it('breaks ties at branch points by position', () => {
    //   A
    //  / \
    // B   C
    // B is left of C, so B comes first.
    const nodes = [
      makeNode('a', 50, 0),
      makeNode('b', 0, 100),
      makeNode('c', 100, 100),
    ];
    const edges = [
      makeEdge('e1', 'a', 'b'),
      makeEdge('e2', 'a', 'c'),
    ];
    expect(ids(computeTabOrder(nodes, edges))).toEqual([
      'node:a',
      'edge:e1',
      'node:b',
      'edge:e2',
      'node:c',
    ]);
  });

  it('places orphan nodes after connected components', () => {
    const nodes = [
      makeNode('a', 0, 0),
      makeNode('b', 100, 0),
      makeNode('orphan', 50, 0),
    ];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = ids(computeTabOrder(nodes, edges));
    expect(result).toEqual([
      'node:a',
      'edge:e1',
      'node:b',
      'node:orphan',
    ]);
  });

  it('sorts connected components by their first node position', () => {
    // Component 1 starts lower, component 2 starts higher.
    const nodes = [
      makeNode('x', 0, 200),
      makeNode('y', 100, 200),
      makeNode('a', 0, 0),
      makeNode('b', 100, 0),
    ];
    const edges = [
      makeEdge('e1', 'x', 'y'),
      makeEdge('e2', 'a', 'b'),
    ];
    // Component {a,b} is higher so it comes first.
    expect(ids(computeTabOrder(nodes, edges))).toEqual([
      'node:a',
      'edge:e2',
      'node:b',
      'node:x',
      'edge:e1',
      'node:y',
    ]);
  });

  it('handles a diamond graph', () => {
    //     A
    //    / \
    //   B   C
    //    \ /
    //     D
    const nodes = [
      makeNode('a', 50, 0),
      makeNode('b', 0, 50),
      makeNode('c', 100, 50),
      makeNode('d', 50, 100),
    ];
    const edges = [
      makeEdge('ab', 'a', 'b'),
      makeEdge('ac', 'a', 'c'),
      makeEdge('bd', 'b', 'd'),
      makeEdge('cd', 'c', 'd'),
    ];
    const result = ids(computeTabOrder(nodes, edges));
    // A first (only root), then B before C (left of C), then D.
    // Edges interleaved before their targets.
    expect(result).toEqual([
      'node:a',
      'edge:ab',
      'node:b',
      'edge:ac',
      'node:c',
      'edge:bd',
      'edge:cd',
      'node:d',
    ]);
  });

  it('handles a cycle by falling back to position sort', () => {
    // A -> B -> C -> A (cycle)
    const nodes = [
      makeNode('a', 0, 0),
      makeNode('b', 100, 0),
      makeNode('c', 200, 0),
    ];
    const edges = [
      makeEdge('e1', 'a', 'b'),
      makeEdge('e2', 'b', 'c'),
      makeEdge('e3', 'c', 'a'),
    ];
    const result = computeTabOrder(nodes, edges);
    // All three nodes and edges should appear exactly once.
    const nodeEntries = result.filter(e => e.type === 'node');
    const edgeEntries = result.filter(e => e.type === 'edge');
    expect(nodeEntries).toHaveLength(3);
    expect(edgeEntries).toHaveLength(3);
  });

  it('ignores edges referencing nonexistent nodes', () => {
    const nodes = [makeNode('a', 0, 0)];
    const edges = [makeEdge('e1', 'a', 'missing')];
    expect(computeTabOrder(nodes, edges)).toEqual([{type: 'node', id: 'a'}]);
  });

  it('handles multiple edges into one node', () => {
    //  A   B
    //   \ /
    //    C
    const nodes = [
      makeNode('a', 0, 0),
      makeNode('b', 100, 0),
      makeNode('c', 50, 100),
    ];
    const edges = [
      makeEdge('ea', 'a', 'c'),
      makeEdge('eb', 'b', 'c'),
    ];
    const result = ids(computeTabOrder(nodes, edges));
    // A and B are both roots; A is left so it comes first.
    // Both edges appear before C.
    expect(result).toEqual([
      'node:a',
      'node:b',
      'edge:ea',
      'edge:eb',
      'node:c',
    ]);
  });

  it('produces unique entries (no duplicates)', () => {
    const nodes = [
      makeNode('a', 0, 0),
      makeNode('b', 100, 0),
      makeNode('c', 200, 0),
      makeNode('d', 300, 0),
    ];
    const edges = [
      makeEdge('e1', 'a', 'b'),
      makeEdge('e2', 'b', 'c'),
      makeEdge('e3', 'c', 'd'),
    ];
    const result = computeTabOrder(nodes, edges);
    const allIds = result.map(e => `${e.type}:${e.id}`);
    expect(allIds).toHaveLength(new Set(allIds).size);
  });
});
