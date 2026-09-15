import {renderHook} from '@testing-library/react-hooks';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {useDisplayElements} from '@cdo/apps/sketchlab/reactFlow/hooks/useDisplayElements';

const node = (
  id: string,
  type: string,
  data: object,
  locked = false
): SketchlabReactFlowNode =>
  ({
    id,
    type,
    position: {x: 0, y: 0},
    data: {...data, ...(locked && {locked: true})},
  } as SketchlabReactFlowNode);

const display = (
  nodes: SketchlabReactFlowNode[],
  edges: SketchlabReactFlowEdge[] = []
) =>
  renderHook(() =>
    useDisplayElements({
      nodes,
      edges,
      activeEntry: null,
      nodeOrEdgeFocused: false,
      lastFocusedEntry: null,
      connectingFrom: null,
      readOnly: false,
      grabMode: false,
      focusEntry: () => {},
      handleEdgeMouseDown: () => {},
      multiSelectedNodeIds: new Set<string>(),
    })
  ).result.current;

// React Flow names the focusable wrapper from ariaLabel, and every type here
// can take a tab stop, so none may be left blank.
describe('useDisplayElements ariaLabel', () => {
  it.each([
    [
      'shape',
      'rectangle with label Foo',
      {shapeType: 'rectangle', label: 'Foo'},
    ],
    ['shape', 'circle', {shapeType: 'circle', label: ''}],
    ['text', 'Hello', {text: 'Hello'}],
    ['text', 'text', {text: ''}],
    ['image', 'A cat', {src: '', altText: 'A cat'}],
    ['image', 'image', {src: '', altText: ''}],
    ['group', 'group', {}],
    ['lineAnchor', 'Line endpoint', {lineAnchorRole: 'source'}],
  ])('names a %s as "%s"', (type, expected, data) => {
    expect(display([node('n', type, data)]).displayNodes[0].ariaLabel).toBe(
      expected
    );
  });

  it('appends locked, anchors included', () => {
    const nodes = [
      node('t', 'text', {text: 'Hello'}, true),
      node('a', 'lineAnchor', {lineAnchorRole: 'source'}, true),
    ];
    const labels = display(nodes).displayNodes.map(n => n.ariaLabel);
    expect(labels).toEqual(['Hello, locked', 'Line endpoint, locked']);
  });

  it('names an edge, and appends locked', () => {
    const ends = [
      node('a', 'text', {text: 'A'}),
      node('b', 'text', {text: 'B'}),
    ];
    const edge = {id: 'e', source: 'a', target: 'b'} as SketchlabReactFlowEdge;
    const locked = {...edge, data: {locked: true}} as SketchlabReactFlowEdge;

    expect(display(ends, [edge]).displayEdges[0].ariaLabel).toBe(
      'Line from A to B'
    );
    expect(display(ends, [locked]).displayEdges[0].ariaLabel).toBe(
      'Line from A to B, locked'
    );
  });
});
