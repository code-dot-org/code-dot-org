import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';
import {
  canCreateConnection,
  isAnchorEndpoint,
  isLineAnchorNodeId,
} from '@cdo/apps/sketchlab/reactFlow/utils/connectionRules';

// Minimal fixtures — only the fields the connection rules inspect.
function shapeNode(id: string): SketchlabReactFlowNode {
  return {
    id,
    type: 'shape',
    position: {x: 0, y: 0},
    data: {shapeType: 'rectangle'} as SketchlabReactFlowNode['data'],
  } as SketchlabReactFlowNode;
}

function anchorNode(id: string): SketchlabReactFlowNode {
  return {
    id,
    type: 'lineAnchor',
    position: {x: 0, y: 0},
    data: {lineAnchorRole: 'source'} as SketchlabReactFlowNode['data'],
  } as SketchlabReactFlowNode;
}

describe('isAnchorEndpoint', () => {
  it('is true for a line anchor node', () => {
    expect(isAnchorEndpoint(anchorNode('a'))).toBe(true);
  });

  it('is true for a missing node', () => {
    expect(isAnchorEndpoint(undefined)).toBe(true);
  });

  it('is false for a real node', () => {
    expect(isAnchorEndpoint(shapeNode('s'))).toBe(false);
  });
});

describe('canCreateConnection', () => {
  it('allows connections between two real nodes', () => {
    const nodes = [shapeNode('a'), shapeNode('b')];
    expect(canCreateConnection('a', 'b', nodes)).toBe(true);
  });

  it('blocks connections involving a line anchor', () => {
    const nodes = [shapeNode('a'), anchorNode('b')];
    expect(canCreateConnection('a', 'b', nodes)).toBe(false);
    expect(canCreateConnection('b', 'a', nodes)).toBe(false);
  });
});

describe('isLineAnchorNodeId', () => {
  it('is true only for ids of line anchor nodes', () => {
    const nodes = [shapeNode('a'), anchorNode('b')];
    expect(isLineAnchorNodeId('a', nodes)).toBe(false);
    expect(isLineAnchorNodeId('b', nodes)).toBe(true);
    expect(isLineAnchorNodeId('missing', nodes)).toBe(false);
  });
});
