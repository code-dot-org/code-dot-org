import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';
import {GROUP_PADDING_PX} from '@cdo/apps/sketchlab/reactFlow/constants';
import {
  groupSelectedNodes,
  syncGroupBounds,
  ungroupNode,
} from '@cdo/apps/sketchlab/reactFlow/utils/grouping';

function makeNode(
  id: string,
  x: number,
  y: number,
  width = 100,
  height = 80
): SketchlabReactFlowNode {
  return {
    id,
    type: 'shape',
    position: {x, y},
    width,
    height,
    data: {shapeType: 'rectangle', label: id},
  };
}

describe('grouping', () => {
  it('groups selected nodes under a new group node', () => {
    const nodes = [makeNode('a', 100, 120), makeNode('b', 260, 180)];
    const result = groupSelectedNodes(nodes, ['a', 'b'], 'group-1');

    expect(result).not.toBeNull();
    expect(result?.nodes[0]).toMatchObject({
      id: 'group-1',
      type: 'group',
      position: {x: 76, y: 96},
      width: 308,
      height: 188,
    });
    expect(result?.nodes[1]).toMatchObject({
      id: 'a',
      parentId: 'group-1',
      position: {x: GROUP_PADDING_PX, y: GROUP_PADDING_PX},
    });
    expect(result?.nodes[2]).toMatchObject({
      id: 'b',
      parentId: 'group-1',
      position: {x: 184, y: 84},
    });
  });

  it('ungroups child nodes back into absolute positions', () => {
    const groupedNodes = [
      {
        id: 'group-1',
        type: 'group' as const,
        position: {x: 76, y: 96},
        width: 308,
        height: 188,
        data: {},
      },
      {
        ...makeNode('a', 24, 24),
        parentId: 'group-1',
      },
      {
        ...makeNode('b', 184, 84),
        parentId: 'group-1',
      },
    ];

    expect(ungroupNode(groupedNodes, 'group-1')).toEqual([
      makeNode('a', 100, 120),
      makeNode('b', 260, 180),
    ]);
  });

  it('recomputes group bounds when a child moves beyond the frame', () => {
    const nodes = [
      {
        id: 'group-1',
        type: 'group' as const,
        position: {x: 100, y: 100},
        width: 220,
        height: 160,
        data: {
          padding: {
            top: GROUP_PADDING_PX,
            right: GROUP_PADDING_PX,
            bottom: GROUP_PADDING_PX,
            left: GROUP_PADDING_PX,
          },
        },
      },
      {
        ...makeNode('a', -10, 30),
        parentId: 'group-1',
      },
      {
        ...makeNode('b', 120, 40),
        parentId: 'group-1',
      },
    ];

    expect(syncGroupBounds(nodes)).toEqual([
      {
        id: 'group-1',
        type: 'group',
        position: {x: 66, y: 106},
        width: 278,
        height: 138,
        data: {
          padding: {
            top: GROUP_PADDING_PX,
            right: GROUP_PADDING_PX,
            bottom: GROUP_PADDING_PX,
            left: GROUP_PADDING_PX,
          },
        },
      },
      {
        ...makeNode('a', 24, 24),
        parentId: 'group-1',
      },
      {
        ...makeNode('b', 154, 34),
        parentId: 'group-1',
      },
    ]);
  });
});
