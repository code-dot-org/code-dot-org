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

describe('grouping', () => {
  it('marks grouped children as immovable until ungrouped', () => {
    const grouped = groupSelectedNodes(
      ['a', 'b'],
      [makeTextNode('a', 100, 100), makeTextNode('b', 200, 100)]
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
