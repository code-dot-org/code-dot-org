import type {EffectNodeDefinition} from '../types';

import {defineNode, floatInput, port} from './helpers';

/**
 * Color operations.
 *
 * These work on `vec3` RGB rather than `vec4` so alpha is never accidentally
 * desaturated or brightened; pair them with Split and Combine RGBA when a full
 * color needs to round-trip.
 */

const LUMINANCE_HELPER = 'effectLuminance';

/** Rec. 709 weights — the standard perceptual weighting for sRGB content. */
const LUMINANCE_SOURCE = [
  `float ${LUMINANCE_HELPER}(vec3 color)`,
  '{',
  '    return dot(color, vec3(0.2126, 0.7152, 0.0722));',
  '}',
].join('\n');

const HSL_HELPER = 'effectHslToRgb';

/** Branch-free HSL → RGB; hue is normalized 0–1 here, degrees at the port. */
const HSL_SOURCE = [
  `vec3 ${HSL_HELPER}(float hue, float saturation, float lightness)`,
  '{',
  '    vec3 ramp = clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);',
  '    float chroma = (1.0 - abs(2.0 * lightness - 1.0)) * saturation;',
  '    return (ramp - 0.5) * chroma + lightness;',
  '}',
].join('\n');

export const colorNodes: readonly EffectNodeDefinition[] = [
  defineNode({
    type: 'colorRgba',
    label: 'Color (RGBA)',
    category: 'color',
    description:
      'A color you pick by hand, as red, green, blue, and alpha from 0 to 1. Wire any channel to animate it.',
    colorPicker: 'rgba',
    inputs: [
      floatInput('r', 'R', 1),
      floatInput('g', 'G', 1),
      floatInput('b', 'B', 1),
      floatInput('a', 'A', 1),
    ],
    outputs: [port('out', 'Color', 'vec4')],
    emit: context => {
      const {r, g, b, a} = context.inputs;
      return {out: `vec4(${r}, ${g}, ${b}, ${a})`};
    },
  }),

  defineNode({
    type: 'ramp',
    label: 'Ramp',
    category: 'color',
    description:
      'Turns one number into a color, along a gradient of three: 0 gives Low, 1 gives High, and Midpoint says where Mid sits between them.',
    inputs: [
      floatInput('t', 'T', 0),
      {
        id: 'low',
        label: 'Low',
        type: 'vec4',
        defaultValue: [0, 0, 0, 1],
        description: 'The color at 0.',
      },
      {
        id: 'mid',
        label: 'Mid',
        type: 'vec4',
        defaultValue: [0.5, 0.5, 0.5, 1],
        description: 'The color partway along.',
      },
      {
        id: 'high',
        label: 'High',
        type: 'vec4',
        defaultValue: [1, 1, 1, 1],
        description: 'The color at 1.',
      },
      floatInput('midpoint', 'Midpoint', 0.5),
    ],
    outputs: [port('out', 'Color', 'vec4')],
    emit: context => {
      const name = 'effectRamp';
      context.helper(
        name,
        [
          `vec4 ${name}(float t, vec4 low, vec4 mid, vec4 high, float midpoint)`,
          '{',
          '    // Two blends rather than a branch: below the midpoint the second',
          '    // one is 0 and leaves the first alone, above it the first has',
          '    // already reached Mid. Same answer, no divergence.',
          '    float lower = clamp(t / max(midpoint, 0.0001), 0.0, 1.0);',
          '    float upper = clamp(',
          '        (t - midpoint) / max(1.0 - midpoint, 0.0001), 0.0, 1.0);',
          '    return mix(mix(low, mid, lower), high, upper);',
          '}',
        ].join('\n'),
      );
      const {t, low, mid, high, midpoint} = context.inputs;
      return {out: `${name}(${t}, ${low}, ${mid}, ${high}, ${midpoint})`};
    },
  }),

  defineNode({
    type: 'colorHsla',
    label: 'Color (HSLA)',
    category: 'color',
    description:
      'A color as hue (0–360), saturation, lightness, and alpha. Wire Time into H and the color cycles the rainbow.',
    colorPicker: 'hsla',
    inputs: [
      floatInput('h', 'H', 200),
      floatInput('s', 'S', 0.8),
      floatInput('l', 'L', 0.6),
      floatInput('a', 'A', 1),
    ],
    outputs: [port('out', 'Color', 'vec4')],
    emit: context => {
      context.helper(HSL_HELPER, HSL_SOURCE);
      const {h, s, l, a} = context.inputs;
      return {
        out: `vec4(${HSL_HELPER}((${h}) / 360.0, ${s}, ${l}), ${a})`,
      };
    },
  }),

  defineNode({
    type: 'luminance',
    label: 'Brightness Of',
    category: 'color',
    description:
      'How bright a color looks to the eye, as a single number from 0 to 1.',
    inputs: [port('color', 'Color', 'vec3')],
    outputs: [port('out', 'Out', 'float')],
    emit: context => {
      context.helper(LUMINANCE_HELPER, LUMINANCE_SOURCE);
      return {out: `${LUMINANCE_HELPER}(${context.inputs.color})`};
    },
  }),

  defineNode({
    type: 'saturate',
    label: 'Saturation',
    category: 'color',
    description:
      'Pushes color toward or away from gray. 0 is fully gray, 1 is unchanged, above 1 is vivid.',
    inputs: [port('color', 'Color', 'vec3'), floatInput('amount', 'Amount', 1)],
    outputs: [port('out', 'Out', 'vec3')],
    emit: context => {
      context.helper(LUMINANCE_HELPER, LUMINANCE_SOURCE);
      const gray = context.local('gray');
      context.statement(
        `float ${gray} = ${LUMINANCE_HELPER}(${context.inputs.color});`,
      );
      return {
        out: `mix(vec3(${gray}), ${context.inputs.color}, ${context.inputs.amount})`,
      };
    },
  }),
];
