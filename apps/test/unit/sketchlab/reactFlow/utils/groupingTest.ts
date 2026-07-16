import {SketchLabNode} from '@cdo/apps/sketchlab/reactFlow/types';
import {
  expandGroupDeletion,
  getGroupChildren,
  groupSelectedNodes,
  isGroupedChildNode,
  ungroupNode,
} from '@cdo/apps/sketchlab/reactFlow/utils/grouping';

interface TestEdge {
  id: string;
  source: string;
  target: string;
}

function makeTextNode(
  id: string,
  x: number,
  y: number,
  overrides: Partial<SketchLabNode> = {}
): SketchLabNode {
  return {
    id,
    type: 'text',
    position: {x, y},
    data: {text: ''},
    ...overrides,
  } as SketchLabNode;
}

function makeLineAnchorNode(id: string, x: number, y: number): SketchLabNode {
  return {
    id,
    type: 'lineAnchor',
    position: {x, y},
    data: {},
  } as SketchLabNode;
}

describe('groupSelectedNodes', () => {
  it('does not create a group from a single standalone line (two lineAnchor nodes)', () => {
    const nodes = [
      makeLineAnchorNode('a1', 0, 0),
      makeLineAnchorNode('a2', 100, 0),
    ];
    const result = groupSelectedNodes(['a1', 'a2'], nodes, 'g');
    expect(result).toBe(nodes);
  });

  it('creates a group when a standalone line and another node are selected', () => {
    const nodes = [
      makeLineAnchorNode('a1', 0, 0),
      makeLineAnchorNode('a2', 100, 0),
      makeTextNode('t1', 200, 0),
    ];
    const result = groupSelectedNodes(['a1', 'a2', 't1'], nodes, 'g');
    expect(result).not.toBe(nodes);
    expect(result.find(n => n.type === 'group')).toBeDefined();
  });
});

describe('grouping', () => {
  it('marks grouped children as immovable until ungrouped', () => {
    const grouped = groupSelectedNodes(
      ['a', 'b'],
      [makeTextNode('a', 100, 100), makeTextNode('b', 200, 100)],
      'test-group-id'
    );
    const child = grouped.find(node => node.id === 'a');
    const group = grouped.find(node => node.type === 'group');

    expect(child).toBeDefined();
    expect(group).toBeDefined();
    expect(isGroupedChildNode(child as SketchLabNode)).toBe(true);
    expect(getGroupChildren(group?.id ?? '', grouped)).toHaveLength(2);

    const ungrouped = ungroupNode(group?.id ?? '', grouped);
    const restoredChild = ungrouped.find(node => node.id === 'a');

    expect(restoredChild).toBeDefined();
    expect(isGroupedChildNode(restoredChild as SketchLabNode)).toBe(false);
  });
});

describe('expandGroupDeletion', () => {
  it('adds a deleted group’s children to the deletion set', () => {
    const nodes = groupSelectedNodes(
      ['a', 'b'],
      [makeTextNode('a', 100, 100), makeTextNode('b', 200, 100)],
      'g'
    );
    const group = nodes.find(node => node.type === 'group') as SketchLabNode;

    const result = expandGroupDeletion([group], [], nodes, []);

    const deletedIds = result.nodes.map(node => node.id).sort();
    expect(deletedIds).toEqual(['a', 'b', 'g']);
  });

  it('leaves an ungrouped node deletion untouched', () => {
    const nodes = [makeTextNode('a', 0, 0), makeTextNode('b', 100, 0)];

    const result = expandGroupDeletion([nodes[0]], [], nodes, []);

    expect(result.nodes).toEqual([nodes[0]]);
    expect(result.edges).toEqual([]);
  });

  it('also deletes edges attached to a group’s children', () => {
    const grouped = groupSelectedNodes(
      ['a1', 'a2', 't1'],
      [
        makeLineAnchorNode('a1', 0, 0),
        makeLineAnchorNode('a2', 100, 0),
        makeTextNode('t1', 200, 0),
      ],
      'g'
    );
    const group = grouped.find(node => node.type === 'group') as SketchLabNode;
    const edges: TestEdge[] = [
      {id: 'line', source: 'a1', target: 'a2'},
      {id: 'unrelated', source: 'x', target: 'y'},
    ];

    const result = expandGroupDeletion([group], [], grouped, edges);

    expect(result.edges.map(edge => edge.id)).toEqual(['line']);
    expect(result.nodes.map(node => node.id).sort()).toEqual([
      'a1',
      'a2',
      'g',
      't1',
    ]);
  });

  it('does not duplicate an edge already queued for deletion', () => {
    const grouped = groupSelectedNodes(
      ['a1', 'a2', 't1'],
      [
        makeLineAnchorNode('a1', 0, 0),
        makeLineAnchorNode('a2', 100, 0),
        makeTextNode('t1', 200, 0),
      ],
      'g'
    );
    const group = grouped.find(node => node.type === 'group') as SketchLabNode;
    const edges: TestEdge[] = [{id: 'line', source: 'a1', target: 'a2'}];

    const result = expandGroupDeletion([group], [edges[0]], grouped, edges);

    expect(result.edges.map(edge => edge.id)).toEqual(['line']);
  });
});
