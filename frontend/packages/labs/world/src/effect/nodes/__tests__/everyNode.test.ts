// Every node the palette offers, compiled.
//
// A node definition is mostly one line: the GLSL it emits. `minimum` is
// `min(${a}, ${b})` and that is the whole of it. The compiler around them is
// well tested — forty-one cases, ninety-three per cent of its statements —
// but the compiler is not what a typo lives in.
//
// A wrong emitter is invisible everywhere a test would normally look. It
// compiles here, because this compiler assembles strings and does not read
// GLSL; it passes type checking, because the string is a string. What it
// produces is a shader that fails to compile IN THE SANDBOX, at the moment a
// learner drops that node into a graph — which is the worst place to find
// out and the hardest to trace back.
//
// Thirteen of the twenty-five node types were named by no test at all when
// this was written: clamp, dot, maximum, minimum, mix, modulo, normalize,
// power, ramp, rotate, smoothstep, split, step.
//
// So this walks the registry rather than listing nodes, and the table below
// must cover it exactly. A node added without an expectation fails the first
// test in the file; a node deleted without its row failing is impossible.
// That is the property worth having — not this file's thirty-six cases, but
// the thirty-seventh nobody remembers to write.

import {describe, expect, it} from 'vitest';

import {compileEffect} from '../../compiler/compileEffect';
import {
  GHOST_PORT,
  INPUT_TEXTURE_NODE_ID,
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
  emptyEffectDocument,
} from '../../model/constants';
import {edge} from '../../model/document';
import type {
  EffectDocument,
  EffectGraphNode,
  EffectPortType,
} from '../../model/types';
import {defaultNodeRegistry} from '../definitions';

/**
 * What each node must put in the shader.
 *
 * The characteristic call, not the whole line: the defaults its ports carry
 * are the definition's business and change with it, where `min(` is the
 * thing the node IS. A row that is merely the node's own name would pass on
 * any emitter at all.
 */
const EMITS: Record<string, string> = {
  add: '(0.0 + 0.0)',
  subtract: '(0.0 - 0.0)',
  multiply: '(1.0 * 1.0)',
  divide: '(1.0 / 1.0)',
  sine: 'sin(',
  cosine: 'cos(',
  abs: 'abs(',
  floor: 'floor(',
  fract: 'fract(',
  sqrt: 'sqrt(',
  power: 'pow(',
  minimum: 'min(',
  maximum: 'max(',
  clamp: 'clamp(',
  mix: 'mix(',
  step: 'step(',
  smoothstep: 'smoothstep(',
  modulo: 'mod(',
  remap: 'effectRemap_',
  random: 'effectHash21(',
  noise: 'effectValueNoise(',
  combine2: 'vec2(',
  combine3: 'vec3(',
  combine4: 'vec4(',
  split: 'split_',
  length: 'length(',
  distance: 'distance(',
  dot: 'dot(',
  normalize: 'normalize(',
  rotate: 'effectRotate2D(',
  sample: 'texture2D(',
  colorRgba: 'vec4(',
  ramp: 'effectRamp(',
  colorHsla: 'effectHslToRgb(',
  luminance: 'effectLuminance(',
  saturate: 'effectLuminance(',
};

/**
 * A node whose output feeds a required port of each type.
 *
 * By TYPE rather than by node, so a new definition with a required `vec2`
 * needs nothing added here — and one with a required type nothing can feed
 * fails loudly, which is the right way round. `generic` never appears: a
 * generic port always carries a default (`genericInput`), so nothing generic
 * is ever required.
 */
const FEEDERS: Partial<
  Record<
    EffectPortType,
    {node: EffectGraphNode; port: string} | 'uv' | 'texture'
  >
> = {
  vec2: 'uv',
  sampler2D: 'texture',
  vec3: {
    node: {id: 'feed_vec3', type: 'combine3', position: {x: -200, y: 0}},
    port: 'out',
  },
};

/** The one node with nothing to compile: a note a learner leaves themselves. */
const NO_OUTPUT = ['comment'];

/** A document holding `type`, with its required inputs fed and its first
 *  output wired to the shader's colour. */
function graphWith(type: string): EffectDocument {
  const definition = defaultNodeRegistry.require(type);
  const base = emptyEffectDocument();
  const node: EffectGraphNode = {id: 'subject', type, position: {x: 0, y: 0}};
  const extra: EffectGraphNode[] = [];
  const edges = [
    edge(
      {node: 'subject', port: definition.outputs[0].id},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ];

  for (const input of definition.inputs) {
    if (input.defaultValue !== undefined) {
      continue; // optional: the default is what an unwired port means
    }
    const feeder = FEEDERS[input.type];
    if (!feeder) {
      throw new Error(
        `Nothing in this test can feed a required ${input.type} port ` +
          `(${type}.${input.id}). Add it to FEEDERS.`,
      );
    }
    if (feeder === 'uv') {
      edges.push(
        edge(
          {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
          {node: 'subject', port: input.id},
        ),
      );
    } else if (feeder === 'texture') {
      edges.push(
        edge(
          {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
          {node: 'subject', port: input.id},
        ),
      );
    } else {
      if (!extra.some(one => one.id === feeder.node.id)) {
        extra.push(feeder.node);
      }
      edges.push(
        edge(
          {node: feeder.node.id, port: feeder.port},
          {node: 'subject', port: input.id},
        ),
      );
    }
  }

  return {...base, nodes: [...base.nodes, node, ...extra], edges};
}

const emitting = defaultNodeRegistry
  .list()
  .filter(definition => definition.outputs.length > 0);

describe('the node table', () => {
  it('covers every node the palette offers, and nothing it does not', () => {
    // The self-maintaining half. Without it this file tests thirty-six nodes
    // for ever while the palette grows past it.
    expect(Object.keys(EMITS).sort()).toEqual(
      emitting.map(definition => definition.type).sort(),
    );
  });

  it('accounts for the node that emits nothing', () => {
    // A comment is a note in the graph, not a value, so it has no output and
    // no GLSL. Named rather than skipped by rule, so a second output-less
    // node has to be a decision somebody made.
    expect(
      defaultNodeRegistry
        .list()
        .filter(definition => definition.outputs.length === 0)
        .map(definition => definition.type),
    ).toEqual(NO_OUTPUT);
  });
});

describe('every node compiles into a shader', () => {
  it.each(emitting.map(definition => definition.type))(
    'emits GLSL for %s',
    type => {
      const {fragmentSource} = compileEffect(graphWith(type));

      expect(fragmentSource).toContain(EMITS[type]);
      // …and it reaches the colour, so the node was compiled rather than
      // merely tolerated in the document.
      expect(fragmentSource).toContain('gl_FragColor =');
    },
  );
});
