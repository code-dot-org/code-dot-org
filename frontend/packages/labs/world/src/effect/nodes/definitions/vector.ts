import {componentCount} from '../../glsl/valueTypes';
import type {EffectNodeDefinition} from '../types';

import {
  defineNode,
  expressionNode,
  floatInput,
  genericInput,
  port,
} from './helpers';

/** Building, taking apart, and measuring vectors. */

const COMPONENT_NAMES = ['x', 'y', 'z', 'w'] as const;

export const vectorNodes: readonly EffectNodeDefinition[] = [
  expressionNode({
    type: 'combine2',
    label: 'Combine XY',
    category: 'vector',
    description:
      'Builds a 2D value, such as a UV coordinate, from two numbers.',
    inputs: [floatInput('x', 'X'), floatInput('y', 'Y')],
    output: port('out', 'Out', 'vec2'),
    glsl: inputs => `vec2(${inputs.x}, ${inputs.y})`,
  }),

  expressionNode({
    type: 'combine3',
    label: 'Combine RGB',
    category: 'vector',
    description: 'Builds a 3D value, such as a color without transparency.',
    inputs: [floatInput('x', 'R'), floatInput('y', 'G'), floatInput('z', 'B')],
    output: port('out', 'Out', 'vec3'),
    glsl: inputs => `vec3(${inputs.x}, ${inputs.y}, ${inputs.z})`,
  }),

  expressionNode({
    type: 'combine4',
    label: 'Combine RGBA',
    category: 'vector',
    description: 'Builds a full color from red, green, blue, and alpha.',
    inputs: [
      floatInput('x', 'R'),
      floatInput('y', 'G'),
      floatInput('z', 'B'),
      floatInput('w', 'A', 1),
    ],
    output: port('out', 'Out', 'vec4'),
    glsl: inputs => `vec4(${inputs.x}, ${inputs.y}, ${inputs.z}, ${inputs.w})`,
  }),

  defineNode({
    type: 'split',
    label: 'Split',
    category: 'vector',
    description:
      'Pulls a value apart into its separate numbers. Components the input does not have read as 0.',
    inputs: [genericInput('in', 'In')],
    outputs: COMPONENT_NAMES.map(name => ({
      id: name,
      label: name.toUpperCase(),
      type: 'float' as const,
    })),
    emit: context => {
      const inputType = context.types.in;
      const available = componentCount(inputType);

      // Hold the input in a local: swizzling the expression four times would
      // otherwise duplicate whatever computed it.
      const local = context.local('split');
      context.statement(`${inputType} ${local} = ${context.inputs.in};`);

      return Object.fromEntries(
        COMPONENT_NAMES.map((name, index) => [
          name,
          index === 0 && inputType === 'float'
            ? local
            : index < available
              ? `${local}.${name}`
              : '0.0',
        ]),
      );
    },
  }),

  expressionNode({
    type: 'length',
    label: 'Length',
    category: 'vector',
    description: 'How far a vector reaches from zero.',
    inputs: [genericInput('in', 'In')],
    output: port('out', 'Out', 'float'),
    glsl: inputs => `length(${inputs.in})`,
  }),

  expressionNode({
    type: 'distance',
    label: 'Distance',
    category: 'vector',
    description:
      'How far apart two points are. Feed it the UV and a center point to get a radial gradient.',
    inputs: [genericInput('a', 'A'), genericInput('b', 'B', 0.5)],
    output: port('out', 'Out', 'float'),
    glsl: inputs => `distance(${inputs.a}, ${inputs.b})`,
  }),

  expressionNode({
    type: 'dot',
    label: 'Dot Product',
    category: 'vector',
    description: 'Measures how much two directions point the same way.',
    inputs: [genericInput('a', 'A'), genericInput('b', 'B')],
    output: port('out', 'Out', 'float'),
    glsl: inputs => `dot(${inputs.a}, ${inputs.b})`,
  }),

  expressionNode({
    type: 'normalize',
    label: 'Normalize',
    category: 'vector',
    description: 'Keeps a direction but shortens it to a length of 1.',
    inputs: [genericInput('in', 'In')],
    glsl: inputs => `normalize(${inputs.in})`,
  }),

  defineNode({
    type: 'rotate',
    label: 'Rotate',
    category: 'vector',
    description:
      'Spins a 2D point around a center. Rotate the UV before sampling to spin an image.',
    inputs: [
      port('uv', 'UV', 'vec2'),
      floatInput('angle', 'Angle', 0),
      {id: 'center', label: 'Center', type: 'vec2', defaultValue: [0.5, 0.5]},
    ],
    outputs: [port('out', 'Out', 'vec2')],
    emit: context => {
      const name = 'effectRotate2D';
      context.helper(
        name,
        [
          `vec2 ${name}(vec2 uv, float angle, vec2 center)`,
          '{',
          '    vec2 offset = uv - center;',
          '    float s = sin(angle);',
          '    float c = cos(angle);',
          '    return center + vec2(offset.x * c - offset.y * s, offset.x * s + offset.y * c);',
          '}',
        ].join('\n'),
      );

      return {
        out: `${name}(${context.inputs.uv}, ${context.inputs.angle}, ${context.inputs.center})`,
      };
    },
  }),
];
