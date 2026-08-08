import type {EffectNodeDefinition} from '../types';

import {defineNode, floatInput, port} from './helpers';

/**
 * Randomness that is not random.
 *
 * A shader has no `rand()`, and cannot: every pixel runs the same program with
 * no memory and no order, so there is nowhere for a sequence to live. What it
 * has instead is a HASH — arithmetic that scrambles a coordinate into a number
 * that looks random and is the same every time you ask. That distinction is the
 * whole idea here, and it is why these two nodes take a position as input where
 * a learner expects them to take nothing at all.
 *
 * Both are float-only. Hashing is defined on a position, not on a color, and a
 * generic port would invite wiring a vec4 in and getting something meaningless
 * per channel.
 */

/**
 * The hash, shared by both nodes.
 *
 * The classic `fract(sin(dot(…)) * large)`. Two things about it are worth
 * knowing rather than discovering:
 *
 *   - It leans on `sin` far outside the range anyone means it for, so what
 *     comes back depends on how a driver implements `sin`. Two machines can
 *     disagree slightly. Shaders here compile at `highp` by default
 *     (`compileEffect`), which keeps that to a wobble rather than visible
 *     banding — at `mediump` this pattern is known to stripe.
 *   - It is cheap and famously legible, which is why it is the one nearly every
 *     shader tutorial uses. A learner who meets it here will recognise it
 *     everywhere else.
 */
const HASH = 'effectHash21';
const HASH_SOURCE = [
  `float ${HASH}(vec2 p)`,
  '{',
  '    // Two arbitrary, unrelated numbers: the point is that they share no',
  '    // factors with each other or with the multiplier below, so nearby',
  '    // coordinates land far apart.',
  '    float d = dot(p, vec2(12.9898, 78.233));',
  '    return fract(sin(d) * 43758.5453123);',
  '}',
].join('\n');

/**
 * Value noise: the hash sampled on a grid, and smoothly blended between.
 *
 * `smoothstep` rather than a straight blend, because a straight one leaves
 * visible creases along the grid lines — the value is continuous across them
 * but its slope is not, and an eye finds that instantly.
 */
const NOISE = 'effectValueNoise';
const NOISE_SOURCE = [
  `float ${NOISE}(vec2 p)`,
  '{',
  '    vec2 cell = floor(p);',
  '    vec2 within = fract(p);',
  '',
  '    // The four corners of the cell this point falls in.',
  `    float bottomLeft = ${HASH}(cell);`,
  `    float bottomRight = ${HASH}(cell + vec2(1.0, 0.0));`,
  `    float topLeft = ${HASH}(cell + vec2(0.0, 1.0));`,
  `    float topRight = ${HASH}(cell + vec2(1.0, 1.0));`,
  '',
  '    // Ease the blend so the grid lines do not show as creases.',
  '    vec2 t = within * within * (3.0 - 2.0 * within);',
  '',
  '    float bottom = mix(bottomLeft, bottomRight, t.x);',
  '    float top = mix(topLeft, topRight, t.x);',
  '    return mix(bottom, top, t.y);',
  '}',
].join('\n');

export const noiseNodes: readonly EffectNodeDefinition[] = [
  defineNode({
    type: 'random',
    label: 'Random',
    category: 'math',
    description:
      'A number between 0 and 1 that looks random but never changes: the same spot always gives the same answer. Feed it Time as well to make it flicker.',
    inputs: [
      {
        id: 'position',
        label: 'Position',
        type: 'vec2',
        description:
          'What to scramble. The UV gives a different number per pixel; a whole number gives one value for everything.',
      },
    ],
    outputs: [port('out', 'Out', 'float')],
    emit: context => {
      context.helper(HASH, HASH_SOURCE);
      return {out: `${HASH}(${context.inputs.position})`};
    },
  }),

  defineNode({
    type: 'noise',
    label: 'Noise',
    category: 'math',
    description:
      'Soft random blobs, like clouds or marble. Scale decides how big they are; add several at different scales for something more natural.',
    inputs: [
      {
        id: 'position',
        label: 'Position',
        type: 'vec2',
        description: 'Where to read the pattern — usually the UV.',
      },
      // On the node rather than left to a Multiply, because a UV runs 0 to 1
      // and value noise at that scale is a single blur across the whole
      // picture. Without a scale the node looks broken the first time it is
      // wired up, which is the worst moment for it to.
      floatInput('scale', 'Scale', 8),
    ],
    outputs: [port('out', 'Out', 'float')],
    emit: context => {
      context.helper(HASH, HASH_SOURCE);
      context.helper(NOISE, NOISE_SOURCE);
      const {position, scale} = context.inputs;
      return {out: `${NOISE}((${position}) * (${scale}))`};
    },
  }),
];
