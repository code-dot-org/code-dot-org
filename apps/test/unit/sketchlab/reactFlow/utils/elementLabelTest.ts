import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {
  getEdgeLabel,
  getNodeLabel,
} from '@cdo/apps/sketchlab/reactFlow/utils/elementLabel';

// Minimal node fixtures — only the fields getNodeLabel/getEdgeLabel inspect.
function shapeNode(
  id: string,
  shapeType: string,
  label = ''
): SketchlabReactFlowNode {
  return {
    id,
    type: 'shape',
    position: {x: 0, y: 0},
    data: {shapeType, label} as SketchlabReactFlowNode['data'],
  } as SketchlabReactFlowNode;
}

function textNode(id: string, text: string): SketchlabReactFlowNode {
  return {
    id,
    type: 'text',
    position: {x: 0, y: 0},
    data: {text} as SketchlabReactFlowNode['data'],
  } as SketchlabReactFlowNode;
}

function imageNode(id: string, altText: string): SketchlabReactFlowNode {
  return {
    id,
    type: 'image',
    position: {x: 0, y: 0},
    data: {altText, src: ''} as SketchlabReactFlowNode['data'],
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
  return new Map(nodes.map(n => [n.id, n]));
}

describe('getNodeLabel', () => {
  describe('shape nodes', () => {
    it('returns shapeType when label is empty', () => {
      expect(getNodeLabel(shapeNode('n1', 'rectangle', ''))).toBe('rectangle');
    });

    it('returns "shapeType with label …" when label is set', () => {
      expect(getNodeLabel(shapeNode('n1', 'circle', 'My Circle'))).toBe(
        'circle with label My Circle'
      );
    });
  });

  describe('text nodes', () => {
    it('returns the text content when present', () => {
      expect(getNodeLabel(textNode('n1', 'Hello world'))).toBe('Hello world');
    });

    it('falls back to "text" when text is empty', () => {
      expect(getNodeLabel(textNode('n1', ''))).toBe('text');
    });
  });

  describe('image nodes', () => {
    it('returns altText when present', () => {
      expect(getNodeLabel(imageNode('n1', 'A cat sitting'))).toBe(
        'A cat sitting'
      );
    });

    it('falls back to "image" when altText is empty', () => {
      expect(getNodeLabel(imageNode('n1', ''))).toBe('image');
    });
  });

  it('returns "lineAnchor" for anchor nodes (internal fallback)', () => {
    expect(getNodeLabel(anchorNode('a1'))).toBe('lineAnchor');
  });
});

describe('getEdgeLabel', () => {
  describe('free-floating lines (both endpoints are anchors)', () => {
    const map = nodeMap(anchorNode('a1'), anchorNode('a2'));
    const e = edge('e1', 'a1', 'a2');

    it('returns "Line" when no index is given', () => {
      expect(getEdgeLabel(e, map)).toBe('Line');
    });

    it('returns "Line N" when an index is given', () => {
      expect(getEdgeLabel(e, map, 1)).toBe('Line 1');
      expect(getEdgeLabel(e, map, 3)).toBe('Line 3');
    });
  });

  it('describes a line between two real nodes', () => {
    const map = nodeMap(shapeNode('n1', 'rectangle'), textNode('n2', 'Hello'));
    expect(getEdgeLabel(edge('e1', 'n1', 'n2'), map)).toBe(
      'Line from rectangle to Hello'
    );
  });

  it('uses altText when an endpoint is an image node', () => {
    const map = nodeMap(
      shapeNode('n1', 'triangle', 'Flow'),
      imageNode('n2', 'A dog')
    );
    expect(getEdgeLabel(edge('e1', 'n1', 'n2'), map)).toBe(
      'Line from triangle with label Flow to A dog'
    );
  });

  it('treats a missing source node as a line endpoint', () => {
    const map = nodeMap(textNode('n2', 'World'));
    expect(getEdgeLabel(edge('e1', 'missing', 'n2'), map)).toBe(
      'Line from line endpoint to World'
    );
  });

  it('treats a missing target node as a line endpoint', () => {
    const map = nodeMap(textNode('n1', 'Hello'));
    expect(getEdgeLabel(edge('e1', 'n1', 'missing'), map)).toBe(
      'Line from Hello to line endpoint'
    );
  });

  it('truncates node labels longer than 10 words', () => {
    const longText = 'one two three four five six seven eight nine ten eleven';
    const map = nodeMap(textNode('n1', longText), textNode('n2', 'short'));
    expect(getEdgeLabel(edge('e1', 'n1', 'n2'), map)).toBe(
      'Line from one two three four five six seven eight nine ten... to short'
    );
  });

  it('does not truncate labels of exactly 10 words', () => {
    const tenWords = 'one two three four five six seven eight nine ten';
    const map = nodeMap(textNode('n1', tenWords), textNode('n2', 'short'));
    expect(getEdgeLabel(edge('e1', 'n1', 'n2'), map)).toBe(
      `Line from ${tenWords} to short`
    );
  });

  it('treats an anchor source paired with a real target node correctly', () => {
    const map = nodeMap(anchorNode('a1'), shapeNode('n1', 'diamond'));
    expect(getEdgeLabel(edge('e1', 'a1', 'n1'), map)).toBe(
      'Line from line endpoint to diamond'
    );
  });
});
