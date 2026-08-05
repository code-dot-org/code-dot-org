import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';
import {getSelectionMoveIds} from '@cdo/apps/sketchlab/reactFlow/hooks/useKeyboardNavigation';

function makeTextNode(
  id: string,
  overrides: Partial<SketchlabReactFlowNode> = {}
): SketchlabReactFlowNode {
  return {
    id,
    type: 'text',
    position: {x: 0, y: 0},
    data: {text: ''},
    ...overrides,
  } as SketchlabReactFlowNode;
}

function makeLineAnchorNode(id: string): SketchlabReactFlowNode {
  return {
    id,
    type: 'lineAnchor',
    position: {x: 0, y: 0},
    data: {lineAnchorRole: 'source'},
  } as SketchlabReactFlowNode;
}

describe('getSelectionMoveIds', () => {
  it('returns every selected id when two nodes are selected', () => {
    const nodes = [makeTextNode('a'), makeTextNode('b'), makeTextNode('c')];
    expect(getSelectionMoveIds(new Set(['a', 'b']), nodes)).toEqual(['a', 'b']);
  });

  it('returns nothing for a single selected node', () => {
    const nodes = [makeTextNode('a'), makeTextNode('b')];
    expect(getSelectionMoveIds(new Set(['a']), nodes)).toEqual([]);
  });

  it('returns nothing for a lone selected line', () => {
    const nodes = [makeLineAnchorNode('a1'), makeLineAnchorNode('a2')];
    expect(getSelectionMoveIds(new Set(['a1', 'a2']), nodes)).toEqual([]);
  });

  it('moves a line together with another node', () => {
    const nodes = [
      makeTextNode('text'),
      makeLineAnchorNode('a1'),
      makeLineAnchorNode('a2'),
    ];
    expect(getSelectionMoveIds(new Set(['text', 'a1', 'a2']), nodes)).toEqual([
      'text',
      'a1',
      'a2',
    ]);
  });

  it('drops a node locked after it was selected', () => {
    const nodes = [
      makeTextNode('a'),
      makeTextNode('locked', {data: {text: '', locked: true}}),
      makeTextNode('c'),
    ];
    expect(getSelectionMoveIds(new Set(['a', 'locked', 'c']), nodes)).toEqual([
      'a',
      'c',
    ]);
  });

  it('drops grouped children', () => {
    const nodes = [
      makeTextNode('a'),
      makeTextNode('child', {parentId: 'group1'}),
    ];
    expect(getSelectionMoveIds(new Set(['a', 'child']), nodes)).toEqual([]);
  });

  it('ignores selected ids with no matching node', () => {
    const nodes = [makeTextNode('a'), makeTextNode('b')];
    expect(getSelectionMoveIds(new Set(['a', 'b', 'gone']), nodes)).toEqual([
      'a',
      'b',
    ]);
  });
});
