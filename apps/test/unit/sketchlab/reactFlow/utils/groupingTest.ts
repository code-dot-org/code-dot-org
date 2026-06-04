import {
  GROUP_PADDING_PX,
  LINE_ANCHOR_SIZE_PX,
} from '@cdo/apps/sketchlab/reactFlow/constants';
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

function makeLineAnchorNode(
  id: string,
  x: number,
  y: number,
  role: 'source' | 'target'
): SketchLabNode {
  return {
    id,
    type: 'lineAnchor',
    position: {x, y},
    data: {lineAnchorRole: role},
    style: {width: LINE_ANCHOR_SIZE_PX, height: LINE_ANCHOR_SIZE_PX},
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

  it('uses anchor size instead of default node size for standalone lines', () => {
    const grouped = groupSelectedNodes(
      ['source-anchor', 'target-anchor'],
      [
        makeLineAnchorNode('source-anchor', 100, 100, 'source'),
        makeLineAnchorNode('target-anchor', 200, 100, 'target'),
      ]
    );
    const group = grouped.find(node => node.type === 'group');

    expect(group).toBeDefined();
    expect(group?.position).toEqual({
      x: 100 - GROUP_PADDING_PX,
      y: 100 - GROUP_PADDING_PX,
    });
    expect(group?.width).toBe(100 + LINE_ANCHOR_SIZE_PX + GROUP_PADDING_PX * 2);
    expect(group?.height).toBe(LINE_ANCHOR_SIZE_PX + GROUP_PADDING_PX * 2);
  });
});
