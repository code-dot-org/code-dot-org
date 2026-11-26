import {renderHook} from '@testing-library/react-hooks';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {useDisplayElements} from '@cdo/apps/sketchlab/reactFlow/hooks/useDisplayElements';
import type {TabOrderEntry} from '@cdo/apps/sketchlab/reactFlow/utils/computeTabOrder';

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
  edges: SketchlabReactFlowEdge[] = [],
  lastFocusedEntry: TabOrderEntry | null = null
) =>
  renderHook(() =>
    useDisplayElements({
      nodes,
      edges,
      activeEntry: null,
      nodeOrEdgeFocused: lastFocusedEntry !== null,
      lastFocusedEntry,
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

describe('useDisplayElements focusedEdgeId', () => {
  const ends = [node('a', 'text', {text: 'A'}), node('b', 'text', {text: 'B'})];
  const edge = {id: 'e', source: 'a', target: 'b'} as SketchlabReactFlowEdge;

  it('is the focused edge', () => {
    expect(display(ends, [edge], {type: 'edge', id: 'e'}).focusedEdgeId).toBe(
      'e'
    );
  });

  it('is null when a node or nothing is focused', () => {
    expect(
      display(ends, [edge], {type: 'node', id: 'a'}).focusedEdgeId
    ).toBeNull();
    expect(display(ends, [edge]).focusedEdgeId).toBeNull();
  });
});
