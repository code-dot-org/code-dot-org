import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {
  canCreateConnection,
  getEdgeReconnectability,
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

function edge(
  id: string,
  source: string,
  target: string
): SketchlabReactFlowEdge {
  return {id, source, target};
}

function nodeMap(
  ...nodes: SketchlabReactFlowNode[]
): Map<string, SketchlabReactFlowNode> {
  return new Map(nodes.map(node => [node.id, node]));
}

const UNLOCKED = {locked: false, readOnly: false};

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

describe('getEdgeReconnectability', () => {
  it('offers both handles when both endpoints are real nodes', () => {
    const map = nodeMap(shapeNode('a'), shapeNode('b'));
    expect(getEdgeReconnectability(edge('e', 'a', 'b'), map, UNLOCKED)).toBe(
      true
    );
  });

  it('offers no handles when both endpoints are free anchors', () => {
    const map = nodeMap(anchorNode('a'), anchorNode('b'));
    expect(getEdgeReconnectability(edge('e', 'a', 'b'), map, UNLOCKED)).toBe(
      false
    );
  });

  it('offers only the attached endpoint when the source is an anchor', () => {
    const map = nodeMap(anchorNode('a'), shapeNode('b'));
    expect(getEdgeReconnectability(edge('e', 'a', 'b'), map, UNLOCKED)).toBe(
      'target'
    );
  });

  it('offers only the attached endpoint when the target is an anchor', () => {
    const map = nodeMap(shapeNode('a'), anchorNode('b'));
    expect(getEdgeReconnectability(edge('e', 'a', 'b'), map, UNLOCKED)).toBe(
      'source'
    );
  });

  it('treats a missing endpoint node like an anchor', () => {
    const map = nodeMap(shapeNode('a'));
    expect(getEdgeReconnectability(edge('e', 'a', 'gone'), map, UNLOCKED)).toBe(
      'source'
    );
  });

  it('offers no handles when the edge is locked', () => {
    const map = nodeMap(shapeNode('a'), shapeNode('b'));
    expect(
      getEdgeReconnectability(edge('e', 'a', 'b'), map, {
        locked: true,
        readOnly: false,
      })
    ).toBe(false);
  });

  it('offers no handles when the canvas is read-only', () => {
    const map = nodeMap(shapeNode('a'), shapeNode('b'));
    expect(
      getEdgeReconnectability(edge('e', 'a', 'b'), map, {
        locked: false,
        readOnly: true,
      })
    ).toBe(false);
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
