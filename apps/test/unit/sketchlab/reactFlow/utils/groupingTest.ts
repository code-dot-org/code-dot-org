import {SketchLabNode} from '@cdo/apps/sketchlab/reactFlow/types';
import {
  getGroupChildren,
  groupSelectedNodes,
  isGroupedChildNode,
  ungroupNode,
} from '@cdo/apps/sketchlab/reactFlow/utils/grouping';

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
