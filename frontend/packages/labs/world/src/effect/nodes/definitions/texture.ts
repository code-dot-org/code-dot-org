import type {EffectNodeDefinition} from '../types';

import {expressionNode, port} from './helpers';

/**
 * Reading pixels out of a texture.
 *
 * `texture` has no default: a sampler cannot be conjured from a literal, so an
 * unwired Sample node is a compile error rather than a silent black pixel.
 */
export const textureNodes: readonly EffectNodeDefinition[] = [
  expressionNode({
    type: 'sample',
    label: 'Sample',
    category: 'texture',
    description:
      'Reads the color of a texture at a UV coordinate. This is how you see the original image.',
    inputs: [
      port('texture', 'Texture', 'sampler2D'),
      {
        id: 'uv',
        label: 'UV',
        type: 'vec2',
        defaultValue: [0.5, 0.5],
        description: 'Which point of the texture to read.',
      },
    ],
    output: port('color', 'Color', 'vec4'),
    glsl: inputs => `texture2D(${inputs.texture}, ${inputs.uv})`,
  }),
];
