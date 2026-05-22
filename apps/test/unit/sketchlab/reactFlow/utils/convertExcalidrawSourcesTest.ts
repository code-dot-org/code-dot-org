import {ExcalidrawElement} from '@excalidraw/excalidraw/types/element/types';

import {ExcalidrawSourceWithExternalFiles} from '@cdo/apps/lab2/types';
import {convertExcalidrawToReactFlow} from '@cdo/apps/sketchlab/reactFlow/utils/convertExcalidrawSources';

// Fills in the boilerplate fields _ExcalidrawElementBase requires that
// the converter does not look at, so each test can name only the
// fields under test.
function el<T extends ExcalidrawElement>(
  override: Partial<T> & Pick<T, 'type'>
): T {
  return {
    id: 'id',
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    seed: 1,
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    groupIds: [],
    frameId: null,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    ...override,
  } as T;
}

describe('convertExcalidrawToReactFlow', () => {
  it('returns empty source when there are no elements', () => {
    const result = convertExcalidrawToReactFlow({elements: []});
    expect(result).toEqual({nodes: [], edges: []});
  });

  it('drops elements flagged as deleted', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [el({type: 'rectangle', id: 'r1', isDeleted: true})],
    };
    expect(convertExcalidrawToReactFlow(source).nodes).toEqual([]);
  });

  it('maps rectangle, diamond, and ellipse to matching shape nodes', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({type: 'rectangle', id: 'r1', x: 1, y: 2, width: 3, height: 4}),
        el({type: 'diamond', id: 'd1'}),
        el({type: 'ellipse', id: 'e1'}),
      ],
    };
    const {nodes} = convertExcalidrawToReactFlow(source);
    expect(
      nodes.map(n => [n.id, n.type, (n.data as {shapeType?: string}).shapeType])
    ).toEqual([
      ['r1', 'shape', 'rectangle'],
      ['d1', 'shape', 'diamond'],
      ['e1', 'shape', 'circle'],
    ]);
    expect(nodes[0].position).toEqual({x: 1, y: 2});
    expect(nodes[0].style).toEqual({width: 3, height: 4});
  });

  it('passes hex stroke and background colors through verbatim', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({
          type: 'rectangle',
          id: 'r1',
          strokeColor: '#abcdef',
          backgroundColor: '#123456',
        }),
      ],
    };
    const {nodes} = convertExcalidrawToReactFlow(source);
    const data = nodes[0].data as {
      strokeColor: string;
      backgroundColor: string;
    };
    expect(data.strokeColor).toBe('#abcdef');
    expect(data.backgroundColor).toBe('#123456');
  });

  it('emits standalone text as a TextNode with handles hidden by default', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({
          type: 'text',
          id: 't1',
          text: 'hello',
          fontSize: 16,
          containerId: null,
          strokeColor: '#222222',
        }),
      ],
    };
    const {nodes} = convertExcalidrawToReactFlow(source);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('text');
    expect(nodes[0].data).toEqual({
      text: 'hello',
      fontColor: '#222222',
      fontSize: 16,
      showHandles: false,
    });
  });

  it('merges text bound to a shape into the shape label and drops the text node', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({type: 'rectangle', id: 'r1'}),
        el({
          type: 'text',
          id: 't1',
          text: 'inside',
          fontSize: 22,
          containerId: 'r1',
          strokeColor: '#ff0000',
        }),
      ],
    };
    const {nodes} = convertExcalidrawToReactFlow(source);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('shape');
    expect(nodes[0].data).toMatchObject({
      label: 'inside',
      fontColor: '#ff0000',
      fontSize: 22,
    });
  });

  it('emits image nodes when the file id has an externalFiles url', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({
          type: 'image',
          id: 'img1',
          fileId: 'f1' as never,
          status: 'saved',
          scale: [1, 1],
        }),
      ],
      externalFiles: {
        f1: {id: 'f1', url: 'https://example.com/f1.png'},
      } as never,
    };
    const {nodes} = convertExcalidrawToReactFlow(source);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('image');
    expect(nodes[0].data).toEqual({
      src: 'https://example.com/f1.png',
      altText: '',
      showHandles: false,
    });
  });

  it('falls back to the embedded dataURL when externalFiles has no entry', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({
          type: 'image',
          id: 'img1',
          fileId: 'f1' as never,
          status: 'saved',
          scale: [1, 1],
        }),
      ],
      files: {
        f1: {
          id: 'f1',
          mimeType: 'image/png',
          dataURL: 'data:image/png;base64,AAAA',
          created: 0,
        },
      } as never,
    };
    const {nodes} = convertExcalidrawToReactFlow(source);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].data).toEqual({
      src: 'data:image/png;base64,AAAA',
      altText: '',
      showHandles: false,
    });
  });

  it('drops images with neither an externalFiles url nor a dataURL', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({
          type: 'image',
          id: 'img1',
          fileId: 'missing' as never,
          status: 'saved',
          scale: [1, 1],
        }),
      ],
    };
    expect(convertExcalidrawToReactFlow(source).nodes).toEqual([]);
  });

  it('drops freedraw, frame, and embeddable elements', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({
          type: 'freedraw',
          id: 'fd',
          points: [],
          pressures: [],
          simulatePressure: false,
          lastCommittedPoint: null,
        }),
        el({type: 'frame', id: 'fr', name: null}),
        el({type: 'embeddable', id: 'em', validated: true}),
      ],
    };
    expect(convertExcalidrawToReactFlow(source).nodes).toEqual([]);
  });

  it('converts an arrow connecting two shapes into an edge with an arrow markerEnd', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 100}),
        el({type: 'rectangle', id: 'b', x: 300, y: 0, width: 100, height: 100}),
        el({
          type: 'arrow',
          id: 'arr',
          x: 0,
          y: 0,
          points: [
            [0, 0],
            [300, 0],
          ],
          startBinding: {elementId: 'a', focus: 0, gap: 0},
          endBinding: {elementId: 'b', focus: 0, gap: 0},
          startArrowhead: null,
          endArrowhead: 'arrow',
          lastCommittedPoint: null,
        }),
      ],
    };
    const {nodes, edges} = convertExcalidrawToReactFlow(source);
    expect(nodes.filter(n => n.type === 'lineAnchor')).toHaveLength(0);
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      source: 'a',
      target: 'b',
      sourceHandle: 'right-source',
      targetHandle: 'left-target',
      markerEnd: {type: 'arrowclosed'},
    });
  });

  it('converts a line connecting two shapes into an edge with no markerEnd', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 100}),
        el({type: 'rectangle', id: 'b', x: 0, y: 300, width: 100, height: 100}),
        el({
          type: 'line',
          id: 'ln',
          points: [
            [0, 0],
            [0, 300],
          ],
          startBinding: {elementId: 'a', focus: 0, gap: 0},
          endBinding: {elementId: 'b', focus: 0, gap: 0},
          startArrowhead: null,
          endArrowhead: null,
          lastCommittedPoint: null,
        }),
      ],
    };
    const {edges} = convertExcalidrawToReactFlow(source);
    expect(edges).toHaveLength(1);
    expect(edges[0].markerEnd).toBeUndefined();
    expect(edges[0]).toMatchObject({
      source: 'a',
      target: 'b',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
    });
  });

  it('keeps the arrow markerEnd on a free-floating arrow', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({
          type: 'arrow',
          id: 'arr',
          x: 50,
          y: 60,
          points: [
            [0, 0],
            [100, 0],
          ],
          startBinding: null,
          endBinding: null,
          startArrowhead: null,
          endArrowhead: 'arrow',
          lastCommittedPoint: null,
        }),
      ],
    };
    const {nodes, edges} = convertExcalidrawToReactFlow(source);
    const anchors = nodes.filter(n => n.type === 'lineAnchor');
    expect(anchors).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      source: anchors[0].id,
      target: anchors[1].id,
      type: 'straight',
      markerEnd: {type: 'arrowclosed'},
    });
  });

  it('converts a free-floating line into a paired-anchor straight line', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({
          type: 'line',
          id: 'ln',
          x: 0,
          y: 0,
          points: [
            [0, 0],
            [100, 100],
          ],
          startBinding: null,
          endBinding: null,
          startArrowhead: null,
          endArrowhead: null,
          lastCommittedPoint: null,
        }),
      ],
    };
    const {nodes, edges} = convertExcalidrawToReactFlow(source);
    expect(nodes.filter(n => n.type === 'lineAnchor')).toHaveLength(2);
    expect(edges[0].type).toBe('straight');
  });

  it('treats an arrow whose binding points at a dropped element as a free-floating arrow', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [
        el({type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 100}),
        el({
          type: 'arrow',
          id: 'arr',
          x: 0,
          y: 0,
          points: [
            [0, 0],
            [300, 0],
          ],
          startBinding: {elementId: 'a', focus: 0, gap: 0},
          endBinding: {elementId: 'ghost', focus: 0, gap: 0},
          startArrowhead: null,
          endArrowhead: 'arrow',
          lastCommittedPoint: null,
        }),
      ],
    };
    const {nodes, edges} = convertExcalidrawToReactFlow(source);
    expect(nodes.filter(n => n.type === 'lineAnchor')).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(edges[0].markerEnd).toEqual({type: 'arrowclosed'});
  });

  it('does not emit a viewport', () => {
    const source: ExcalidrawSourceWithExternalFiles = {
      elements: [],
      appState: {scrollX: 100, scrollY: 200, zoom: {value: 2}} as never,
    };
    expect(convertExcalidrawToReactFlow(source).viewport).toBeUndefined();
  });
});
