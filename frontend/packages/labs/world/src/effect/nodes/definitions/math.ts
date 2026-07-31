import type {EffectNodeDefinition} from '../types';

import {defineNode, expressionNode, floatInput, genericInput} from './helpers';

/**
 * Arithmetic and scalar math.
 *
 * Most of these are `generic`: their ports take whichever numeric type is
 * wired in, and every generic port on a node resolves to the same type. That
 * is what lets one `multiply` node scale a brightness value and a UV offset
 * without the learner picking a typed variant.
 */

/** `a op b` for the four arithmetic operators. */
function binaryOperator(
  type: string,
  label: string,
  operator: string,
  description: string,
  identity = 1,
): EffectNodeDefinition {
  return expressionNode({
    type,
    label,
    category: 'math',
    description,
    inputs: [
      genericInput('a', 'A', identity),
      genericInput('b', 'B', identity),
    ],
    glsl: inputs => `(${inputs.a} ${operator} ${inputs.b})`,
  });
}

/** `fn(x)` for the one-argument built-ins. */
function unaryFunction(
  type: string,
  label: string,
  fn: string,
  description: string,
): EffectNodeDefinition {
  return expressionNode({
    type,
    label,
    category: 'math',
    description,
    inputs: [genericInput('x', 'X')],
    glsl: inputs => `${fn}(${inputs.x})`,
  });
}

export const mathNodes: readonly EffectNodeDefinition[] = [
  binaryOperator('add', 'Add', '+', 'Adds two values together.', 0),
  binaryOperator(
    'subtract',
    'Subtract',
    '-',
    'Subtracts the second value from the first.',
    0,
  ),
  binaryOperator('multiply', 'Multiply', '*', 'Multiplies two values.'),
  binaryOperator(
    'divide',
    'Divide',
    '/',
    'Divides the first value by the second. Dividing by zero is undefined on the GPU.',
  ),

  unaryFunction(
    'sine',
    'Sine',
    'sin',
    'Waves smoothly between -1 and 1 as the input grows. Feed it Time to animate.',
  ),
  unaryFunction(
    'cosine',
    'Cosine',
    'cos',
    'Like Sine, but starts at 1 instead of 0.',
  ),
  unaryFunction('abs', 'Absolute', 'abs', 'Drops the minus sign off a value.'),
  unaryFunction(
    'floor',
    'Floor',
    'floor',
    'Rounds down to a whole number. Useful for making things blocky.',
  ),
  unaryFunction(
    'fract',
    'Fraction',
    'fract',
    'Keeps only the part after the decimal point, so values repeat from 0 to 1.',
  ),
  unaryFunction('sqrt', 'Square Root', 'sqrt', 'The square root of a value.'),

  expressionNode({
    type: 'power',
    label: 'Power',
    category: 'math',
    description:
      'Raises the base to an exponent. Bends how fast a value ramps up.',
    inputs: [
      genericInput('base', 'Base', 1),
      genericInput('exponent', 'Exponent', 2),
    ],
    glsl: inputs => `pow(${inputs.base}, ${inputs.exponent})`,
  }),

  expressionNode({
    type: 'minimum',
    label: 'Minimum',
    category: 'math',
    description: 'Whichever of the two values is smaller.',
    inputs: [genericInput('a', 'A'), genericInput('b', 'B')],
    glsl: inputs => `min(${inputs.a}, ${inputs.b})`,
  }),

  expressionNode({
    type: 'maximum',
    label: 'Maximum',
    category: 'math',
    description: 'Whichever of the two values is larger.',
    inputs: [genericInput('a', 'A'), genericInput('b', 'B')],
    glsl: inputs => `max(${inputs.a}, ${inputs.b})`,
  }),

  expressionNode({
    type: 'clamp',
    label: 'Clamp',
    category: 'math',
    description:
      'Keeps a value inside a range, pinning anything outside to the edge.',
    inputs: [
      genericInput('value', 'Value'),
      genericInput('min', 'Min', 0),
      genericInput('max', 'Max', 1),
    ],
    glsl: inputs => `clamp(${inputs.value}, ${inputs.min}, ${inputs.max})`,
  }),

  expressionNode({
    type: 'mix',
    label: 'Mix',
    category: 'math',
    description:
      'Blends between two values. An amount of 0 gives A, 1 gives B, 0.5 gives the midpoint.',
    inputs: [
      genericInput('a', 'A'),
      genericInput('b', 'B'),
      floatInput('amount', 'Amount', 0.5),
    ],
    glsl: inputs => `mix(${inputs.a}, ${inputs.b}, ${inputs.amount})`,
  }),

  expressionNode({
    type: 'step',
    label: 'Step',
    category: 'math',
    description: 'Gives 0 below the edge and 1 at or above it — a hard cutoff.',
    inputs: [genericInput('edge', 'Edge', 0.5), genericInput('x', 'X')],
    glsl: inputs => `step(${inputs.edge}, ${inputs.x})`,
  }),

  expressionNode({
    type: 'smoothstep',
    label: 'Smooth Step',
    category: 'math',
    description: 'Like Step, but eases from 0 to 1 between the two edges.',
    inputs: [
      genericInput('edge0', 'Edge 0', 0),
      genericInput('edge1', 'Edge 1', 1),
      genericInput('x', 'X'),
    ],
    glsl: inputs => `smoothstep(${inputs.edge0}, ${inputs.edge1}, ${inputs.x})`,
  }),

  expressionNode({
    type: 'modulo',
    label: 'Modulo',
    category: 'math',
    description: 'The remainder after dividing. Makes values wrap around.',
    inputs: [genericInput('x', 'X'), genericInput('divisor', 'Divisor', 1)],
    glsl: inputs => `mod(${inputs.x}, ${inputs.divisor})`,
  }),

  defineNode({
    type: 'remap',
    label: 'Remap',
    category: 'math',
    description:
      'Rescales a value from one range to another, so -1 to 1 can become 0 to 1.',
    inputs: [
      genericInput('value', 'Value'),
      genericInput('fromMin', 'From Min', 0),
      genericInput('fromMax', 'From Max', 1),
      genericInput('toMin', 'To Min', 0),
      genericInput('toMax', 'To Max', 1),
    ],
    outputs: [{id: 'out', label: 'Out', type: 'generic'}],
    emit: context => {
      // GLSL ES 1.00 has no function overloading, so the helper is emitted once
      // per resolved type and keyed by the name it is declared under.
      const type = context.types.out;
      const name = `effectRemap_${type}`;
      context.helper(
        name,
        [
          `${type} ${name}(${type} value, ${type} fromMin, ${type} fromMax, ${type} toMin, ${type} toMax)`,
          '{',
          `    ${type} span = fromMax - fromMin;`,
          '    return toMin + (value - fromMin) * (toMax - toMin) / span;',
          '}',
        ].join('\n'),
      );

      const {value, fromMin, fromMax, toMin, toMax} = context.inputs;
      return {
        out: `${name}(${value}, ${fromMin}, ${fromMax}, ${toMin}, ${toMax})`,
      };
    },
  }),
];
