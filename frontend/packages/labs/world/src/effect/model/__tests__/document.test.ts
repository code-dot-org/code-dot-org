import {describe, expect, it} from 'vitest';

import {
  GHOST_PORT,
  INPUT_UV_NODE_ID,
  emptyEffectDocument,
  parameterNodeId,
} from '../constants';
import {
  addNode,
  addParameter,
  applyToScope,
  createEffectDocument,
  duplicateNodes,
  edge,
  findNode,
  insertNodes,
  nextParameterId,
  removeFunction,
  removeParameter,
  setNodeNote,
  updateParameter,
} from '../document';
import type {EffectDocument, EffectParameter} from '../types';

const parameter = (id: string): EffectParameter => ({
  id,
  name: id,
  type: 'float',
  defaultValue: 1,
});

const withParameters = (...ids: string[]): EffectDocument => ({
  ...emptyEffectDocument(),
  parameters: ids.map(parameter),
});

describe('nextParameterId', () => {
  it('starts at param1', () => {
    expect(nextParameterId(emptyEffectDocument())).toBe('param1');
  });

  it('fills the gap left by a removed parameter instead of colliding', () => {
    // Counting parameters would mint a second `param2` here — and the id
    // seeds the uniform name, so a collision merges two knobs into one.
    expect(nextParameterId(withParameters('param2'))).toBe('param1');
    expect(nextParameterId(withParameters('param1', 'param3'))).toBe('param2');
  });
});

describe('updateParameter', () => {
  it('merges changes into the matching parameter only', () => {
    const document = withParameters('param1', 'param2');

    const updated = updateParameter(document, 'param1', {name: 'waviness'});

    expect(updated.parameters[0].name).toBe('waviness');
    expect(updated.parameters[1].name).toBe('param2');
  });
});

describe('removeParameter', () => {
  it('removes the parameter and every wire leaving its ghost', () => {
    const document: EffectDocument = {
      ...withParameters('param1'),
      nodes: [{id: 'sine-1', type: 'sine', position: {x: 0, y: 0}}],
      edges: [
        edge(
          {node: parameterNodeId('param1'), port: GHOST_PORT},
          {node: 'sine-1', port: 'x'},
        ),
      ],
    };

    const removed = removeParameter(document, 'param1');

    expect(removed.parameters).toHaveLength(0);
    expect(removed.edges).toHaveLength(0);
    // The node the parameter fed stays; its input falls back to its literal.
    expect(removed.nodes).toHaveLength(1);
  });
});

describe('duplicateNodes', () => {
  /** sine → multiply chain, fed by the UV ghost, feeding a downstream add. */
  const chain: EffectDocument = {
    ...emptyEffectDocument(),
    nodes: [
      {id: 'sine-1', type: 'sine', position: {x: 0, y: 0}, params: {x: 2}},
      {id: 'multiply-1', type: 'multiply', position: {x: 0, y: 100}},
      {id: 'add-1', type: 'add', position: {x: 0, y: 200}},
    ],
    edges: [
      edge(
        {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
        {node: 'sine-1', port: 'x'},
      ),
      edge({node: 'sine-1', port: 'out'}, {node: 'multiply-1', port: 'a'}),
      edge({node: 'multiply-1', port: 'out'}, {node: 'add-1', port: 'a'}),
    ],
  };

  const duplicated = duplicateNodes(chain, ['sine-1', 'multiply-1'], {
    x: 28,
    y: 28,
  });

  it('clones the nodes with fresh ids, offset positions, and copied params', () => {
    const sine2 = duplicated.nodes.find(node => node.id === 'sine-2');

    expect(sine2?.position).toEqual({x: 28, y: 28});
    expect(sine2?.params).toEqual({x: 2});
    // A deep copy: editing the clone's literals must not touch the original.
    expect(sine2?.params).not.toBe(
      chain.nodes.find(node => node.id === 'sine-1')?.params,
    );
  });

  it('remaps wires between copied nodes onto the clones', () => {
    expect(
      duplicated.edges.some(
        candidate =>
          candidate.source.node === 'sine-2' &&
          candidate.target.node === 'multiply-2',
      ),
    ).toBe(true);
  });

  it('copies incoming wires so the piece arrives still fed', () => {
    expect(
      duplicated.edges.some(
        candidate =>
          candidate.source.node === INPUT_UV_NODE_ID &&
          candidate.target.node === 'sine-2',
      ),
    ).toBe(true);
  });

  it('never copies outgoing wires, which would steal downstream inputs', () => {
    // add-1 was not selected; its `a` input must still hear from the original.
    const intoAdd = duplicated.edges.filter(
      candidate => candidate.target.node === 'add-1',
    );

    expect(intoAdd).toHaveLength(1);
    expect(intoAdd[0].source.node).toBe('multiply-1');
  });

  it('leaves the document alone when nothing selected is a real node', () => {
    expect(duplicateNodes(chain, ['@in:uv', 'missing'], {x: 1, y: 1})).toBe(
      chain,
    );
  });
});

describe('insertNodes', () => {
  it('drops a pasted wire whose source no longer exists', () => {
    // Clipboard captured a wire from a parameter that has since been deleted.
    const clipboardNodes = [
      {id: 'sine-1', type: 'sine', position: {x: 0, y: 0}},
    ];
    const clipboardEdges = [
      edge(
        {node: parameterNodeId('gone'), port: GHOST_PORT},
        {node: 'sine-1', port: 'x'},
      ),
    ];

    const pasted = insertNodes(
      emptyEffectDocument(),
      clipboardNodes,
      clipboardEdges,
      {x: 10, y: 10},
    );

    expect(pasted.nodes).toHaveLength(1);
    expect(pasted.edges).toHaveLength(0);
  });

  it('keeps a pasted wire from a parameter that still exists', () => {
    const withParameter = addParameter(emptyEffectDocument(), {
      id: 'strength',
      name: 'strength',
      type: 'float',
      defaultValue: 1,
    });

    const pasted = insertNodes(
      withParameter,
      [{id: 'sine-1', type: 'sine', position: {x: 0, y: 0}}],
      [
        edge(
          {node: parameterNodeId('strength'), port: GHOST_PORT},
          {node: 'sine-1', port: 'x'},
        ),
      ],
      {x: 0, y: 0},
    );

    expect(pasted.edges).toHaveLength(1);
    expect(pasted.edges[0].target.node).toBe('sine-1');
  });

  it('mints ids that avoid everything already in the document', () => {
    const document: EffectDocument = {
      ...emptyEffectDocument(),
      nodes: [
        {id: 'sine-1', type: 'sine', position: {x: 0, y: 0}},
        {id: 'sine-3', type: 'sine', position: {x: 0, y: 0}},
      ],
    };

    const pasted = insertNodes(
      document,
      [
        {id: 'sine-1', type: 'sine', position: {x: 0, y: 0}},
        {id: 'other', type: 'sine', position: {x: 0, y: 0}},
      ],
      [],
      {x: 0, y: 0},
    );

    const ids = pasted.nodes.map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('sine-2');
    expect(ids).toContain('sine-4');
  });
});

describe('removeFunction', () => {
  it('cascades through every scope that called the function', () => {
    const document: EffectDocument = {
      ...emptyEffectDocument(),
      functions: [
        {
          id: 'fn1',
          name: 'Inner',
          outputType: 'float',
          parameters: [],
          nodes: [],
          edges: [],
        },
        {
          id: 'fn2',
          name: 'Outer',
          outputType: 'float',
          parameters: [],
          // Outer calls Inner: removing Inner must strip this node too.
          nodes: [{id: 'fn:fn1-1', type: 'fn:fn1', position: {x: 0, y: 0}}],
          edges: [
            edge(
              {node: 'fn:fn1-1', port: 'out'},
              {node: '@out', port: GHOST_PORT},
            ),
          ],
        },
      ],
      nodes: [{id: 'call-1', type: 'fn:fn1', position: {x: 0, y: 0}}],
      edges: [
        edge({node: 'call-1', port: 'out'}, {node: '@out', port: GHOST_PORT}),
      ],
    };

    const removed = removeFunction(document, 'fn1');

    expect(removed.functions.map(fn => fn.id)).toEqual(['fn2']);
    expect(removed.nodes).toHaveLength(0);
    expect(removed.edges).toHaveLength(0);
    expect(removed.functions[0].nodes).toHaveLength(0);
    expect(removed.functions[0].edges).toHaveLength(0);
  });
});

describe('applyToScope', () => {
  const withFunction: EffectDocument = {
    ...emptyEffectDocument(),
    functions: [
      {
        id: 'fn1',
        name: 'Fn',
        outputType: 'float',
        parameters: [],
        nodes: [],
        edges: [],
      },
    ],
  };
  const sine = {id: 'sine-1', type: 'sine', position: {x: 0, y: 0}};

  it('routes an operation to the main workspace for a null id', () => {
    const result = applyToScope(withFunction, null, scope => ({
      ...scope,
      nodes: [...scope.nodes, sine],
    }));

    expect(result.nodes).toHaveLength(1);
    expect(result.functions[0].nodes).toHaveLength(0);
  });

  it("routes an operation into the named function's body", () => {
    const result = applyToScope(withFunction, 'fn1', scope => ({
      ...scope,
      nodes: [...scope.nodes, sine],
    }));

    expect(result.nodes).toHaveLength(0);
    expect(result.functions[0].nodes).toHaveLength(1);
    // Non-scope fields of the function survive the round trip.
    expect(result.functions[0].outputType).toBe('float');
  });
});

describe('addParameter', () => {
  it('appends without touching existing parameters', () => {
    const document = addParameter(
      withParameters('param1'),
      parameter('param2'),
    );

    expect(document.parameters.map(candidate => candidate.id)).toEqual([
      'param1',
      'param2',
    ]);
  });
});

describe('setNodeNote', () => {
  const document = addNode(createEffectDocument(), {
    id: 'sine-1',
    type: 'sine',
    position: {x: 0, y: 0},
  });

  it('writes a note onto the node', () => {
    const noted = setNodeNote(document, 'sine-1', 'Makes it wobble.');

    expect(findNode(noted, 'sine-1')?.note).toBe('Makes it wobble.');
  });

  it('treats a blank note as no note, so the file never carries an empty one', () => {
    const noted = setNodeNote(document, 'sine-1', 'Makes it wobble.');

    expect(
      findNode(setNodeNote(noted, 'sine-1', '   '), 'sine-1'),
    ).not.toHaveProperty('note');
    expect(
      findNode(setNodeNote(noted, 'sine-1', undefined), 'sine-1'),
    ).not.toHaveProperty('note');
  });

  it('is carried by duplicate, so a copied node keeps its explanation', () => {
    const noted = setNodeNote(document, 'sine-1', 'Makes it wobble.');
    const copied = duplicateNodes(noted, ['sine-1'], {x: 20, y: 20});
    const clone = copied.nodes.find(
      node => node.id !== 'sine-1' && node.type === 'sine',
    );

    expect(clone?.note).toBe('Makes it wobble.');
  });
});
