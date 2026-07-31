import {edge, emptyEffectDocument} from '../model';
import {
  GHOST_PORT,
  INPUT_TEXTURE_NODE_ID,
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
  parameterNodeId,
} from '../model/constants';
import type {EffectDocument} from '../model/types';

/**
 * The smallest effect that does something: read the picture, multiply it by a
 * color.
 *
 * The one intended as a learner's first. Two working nodes, one wire each, and
 * the idea it teaches — a color is four numbers, and multiplying scales each of
 * them — is the idea every other effect here builds on.
 */
export const tintEffect: EffectDocument = {
  ...emptyEffectDocument('Tint'),
  description: 'Washes the picture in a color of your choosing.',
  // A sprite reads as a THING, so a color wash over it is obviously a wash over something — a checkerboard would just look like a differently-colored checkerboard.
  testTexture: 'sprite',
  parameters: [
    {
      id: 'color',
      name: 'color',
      type: 'vec4',
      defaultValue: [1, 0.6, 0.6, 1],
      description: 'The color to wash over the picture.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 300, y: 40},
      size: {width: 270, height: 190},
      note: [
        'This is the smallest effect there is. It takes the picture and tints it, like looking through colored glass.',
        'A color is really four numbers: how much red, green, blue, and how see-through it is. Multiplying two colors multiplies each of those numbers in turn.',
        'Multiply by red and the greens and blues shrink toward nothing, so what is left looks red.',
      ].join('\n\n'),
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: -40, y: 60},
      note: 'Reads the color of the picture at this spot. Every effect that changes how something LOOKS starts here.',
    },
    {
      id: 'multiply-1',
      type: 'multiply',
      position: {x: -40, y: 220},
      note: 'Multiplies the picture color by your color. Try white (1,1,1,1) — multiplying by 1 changes nothing at all.',
    },
  ],
  edges: [
    edge(
      {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'texture'},
    ),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'uv'},
    ),
    edge({node: 'sample-1', port: 'color'}, {node: 'multiply-1', port: 'a'}),
    edge(
      {node: parameterNodeId('color'), port: GHOST_PORT},
      {node: 'multiply-1', port: 'b'},
    ),
    edge(
      {node: 'multiply-1', port: 'out'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
