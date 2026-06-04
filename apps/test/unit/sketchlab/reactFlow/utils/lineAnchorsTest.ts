import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {getStandaloneLineAnchorIds} from '@cdo/apps/sketchlab/reactFlow/utils/lineAnchors';

function makeLineAnchorNode(
  id: string,
  role: 'source' | 'target'
): SketchlabReactFlowNode {
  return {
    id,
    type: 'lineAnchor',
    position: {x: 0, y: 0},
    data: {lineAnchorRole: role},
  };
}

function makeTextNode(id: string): SketchlabReactFlowNode {
  return {
    id,
    type: 'text',
    position: {x: 0, y: 0},
    data: {text: ''},
  };
}

function makeEdge(source: string, target: string): SketchlabReactFlowEdge {
  return {id: 'edge-1', source, target};
}

describe('getStandaloneLineAnchorIds', () => {
  it('returns both anchor ids for a standalone line', () => {
    const nodes = [
      makeLineAnchorNode('source-anchor', 'source'),
      makeLineAnchorNode('target-anchor', 'target'),
    ];

    expect(
      getStandaloneLineAnchorIds(
        makeEdge('source-anchor', 'target-anchor'),
        id => nodes.find(node => node.id === id)
      )
    ).toEqual(['source-anchor', 'target-anchor']);
  });

  it('returns null when either endpoint is a real node', () => {
    const nodes = [
      makeLineAnchorNode('source-anchor', 'source'),
      makeTextNode('text-1'),
    ];

    expect(
      getStandaloneLineAnchorIds(makeEdge('source-anchor', 'text-1'), id =>
        nodes.find(node => node.id === id)
      )
    ).toBeNull();
  });
});
