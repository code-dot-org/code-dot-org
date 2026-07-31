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
 * Chunky pixels, by rounding the place we look before we look there.
 *
 * The first effect that changes WHERE it reads instead of what it does with the
 * color — the idea the Ripple then takes further. Rounding is what makes
 * neighbouring spots agree on an answer, and agreement is what a block is.
 */
export const pixelateEffect: EffectDocument = {
  ...emptyEffectDocument('Pixelate'),
  description: 'Turns the picture into chunky blocks, like an old video game.',
  // Deliberate: pixelating the checkerboard produces moire, because the pattern and the block grid fight. The effect is right and the picture is unreadable — which would teach a learner the wrong thing about their own graph.
  testTexture: 'sprite',
  parameters: [
    {
      id: 'blocks',
      name: 'blocks',
      type: 'float',
      defaultValue: 16,
      min: 2,
      max: 128,
      description: 'How many blocks across. Fewer blocks means bigger ones.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 320, y: 40},
      size: {width: 285, height: 250},
      note: [
        'Every effect so far changed the color it found. This one changes WHERE it looks.',
        'Think of the picture as covered by a grid. Instead of reading the exact spot under each pixel, we round that spot down to the corner of its grid square.',
        'Every pixel inside one square rounds to the same corner, so they all read the same color — and a patch of identical color is exactly what a big chunky pixel is.',
        'Multiply, round down, divide back: that is the whole trick.',
      ].join('\n\n'),
    },
    {
      id: 'multiply-1',
      type: 'multiply',
      position: {x: -60, y: 60},
      note: 'Stretches the spot across the grid. With 16 blocks, a spot at the middle of the picture becomes 8 — it now counts in grid squares rather than in fractions of the picture.',
    },
    {
      id: 'floor-1',
      type: 'floor',
      position: {x: -60, y: 200},
      note: 'Rounds down to a whole number. 8.7 becomes 8, and so does 8.1 — which is how neighbours end up agreeing on one answer.',
    },
    {
      id: 'divide-1',
      type: 'divide',
      position: {x: -60, y: 330},
      note: 'Shrinks the grid square back to a real spot on the picture, so we have somewhere to read from.',
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: -60, y: 460},
      note: 'Reads the color at that rounded-off spot. Every pixel in the block asks for the same one, so the whole block comes out one flat color.',
    },
  ],
  edges: [
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'multiply-1', port: 'a'},
    ),
    edge(
      {node: parameterNodeId('blocks'), port: GHOST_PORT},
      {node: 'multiply-1', port: 'b'},
    ),
    edge({node: 'multiply-1', port: 'out'}, {node: 'floor-1', port: 'x'}),
    edge({node: 'floor-1', port: 'out'}, {node: 'divide-1', port: 'a'}),
    edge(
      {node: parameterNodeId('blocks'), port: GHOST_PORT},
      {node: 'divide-1', port: 'b'},
    ),
    edge(
      {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'texture'},
    ),
    edge({node: 'divide-1', port: 'out'}, {node: 'sample-1', port: 'uv'}),
    edge(
      {node: 'sample-1', port: 'color'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
