// Randomness that is not random: the hash node and the value-noise node.
//
// What these check is the part a graph cannot: that the GLSL each one brings is
// declared once however many nodes ask for it, and that a noise node pulls in
// the hash it is built on.
//
// Whether the shader COMPILES is a question for a driver, and nothing in this
// suite has one — jsdom has no WebGL. Both helpers were compiled and rendered
// against SwiftShader by hand when they landed. Nothing guards that
// automatically yet: the first STOCK effect to use one will, because
// `scripts/build-effect-stills.mjs` renders each of those and fails loudly when
// a shader will not link.

import {describe, expect, it} from 'vitest';

import {compileEffect} from '../../compiler/compileEffect';
import {
  GHOST_PORT,
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
  emptyEffectDocument,
} from '../../model/constants';
import {edge} from '../../model/document';
import type {EffectDocument, EffectGraphNode} from '../../model/types';

const at = (x = 0, y = 0) => ({x, y});

/**
 * A document that runs `nodes` from the UV into the output.
 *
 * The last node's `out` is what gets drawn, through `combine3` so a float
 * reaches a color port — which is also the ordinary way either of these is
 * used: a number turned into grey.
 */
function noiseDocument(nodes: EffectGraphNode[]): EffectDocument {
  const last = nodes[nodes.length - 1].id;
  return {
    ...emptyEffectDocument(),
    nodes: [
      ...nodes,
      {id: 'combine-1', type: 'combine4', position: at(), params: {w: 1}},
    ],
    edges: [
      ...nodes.map(node =>
        edge(
          {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
          {node: node.id, port: 'position'},
        ),
      ),
      edge({node: last, port: 'out'}, {node: 'combine-1', port: 'x'}),
      edge({node: last, port: 'out'}, {node: 'combine-1', port: 'y'}),
      edge({node: last, port: 'out'}, {node: 'combine-1', port: 'z'}),
      edge(
        {node: 'combine-1', port: 'out'},
        {node: OUTPUT_NODE_ID, port: GHOST_PORT},
      ),
    ],
  };
}

/** How many times `name` is DECLARED, not how many times it is called. */
const declarations = (source: string, name: string) =>
  source.split(`float ${name}(`).length - 1;

describe('random', () => {
  it('brings its hash, once', () => {
    const {fragmentSource} = compileEffect(
      noiseDocument([{id: 'random-1', type: 'random', position: at()}]),
    );

    expect(declarations(fragmentSource, 'effectHash21')).toBe(1);
    expect(fragmentSource).toContain('effectHash21(');
  });

  it('declares it once for several nodes, not once each', () => {
    // The whole reason `helper` is keyed by name. Two declarations of one
    // function is not a tidiness problem — it will not compile.
    const {fragmentSource} = compileEffect(
      noiseDocument([
        {id: 'random-1', type: 'random', position: at()},
        {id: 'random-2', type: 'random', position: at()},
      ]),
    );

    expect(declarations(fragmentSource, 'effectHash21')).toBe(1);
  });
});

describe('noise', () => {
  it('brings the hash it is built on', () => {
    const {fragmentSource} = compileEffect(
      noiseDocument([{id: 'noise-1', type: 'noise', position: at()}]),
    );

    expect(declarations(fragmentSource, 'effectValueNoise')).toBe(1);
    expect(declarations(fragmentSource, 'effectHash21')).toBe(1);
    // Declared before it is used: GLSL ES 1.00 has no forward declarations.
    expect(fragmentSource.indexOf('float effectHash21(')).toBeLessThan(
      fragmentSource.indexOf('float effectValueNoise('),
    );
  });

  it('shares one hash with a random node beside it', () => {
    const {fragmentSource} = compileEffect(
      noiseDocument([
        {id: 'noise-1', type: 'noise', position: at()},
        {id: 'random-1', type: 'random', position: at()},
      ]),
    );

    expect(declarations(fragmentSource, 'effectHash21')).toBe(1);
  });

  it('scales the position, so the default is not one blur', () => {
    // A UV runs 0 to 1, and value noise over that range is a single soft blob
    // across the whole picture — which looks like a broken node rather than a
    // node that needs a Multiply in front of it.
    const {fragmentSource} = compileEffect(
      noiseDocument([{id: 'noise-1', type: 'noise', position: at()}]),
    );

    expect(fragmentSource).toMatch(/effectValueNoise\(.*\*.*8\.0/);
  });
});
