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
 * Make something see-through by scaling only its alpha.
 *
 * The first effect that has to take a color APART. Multiplying the whole color
 * by a number is the obvious guess and it is wrong — it fades toward black
 * rather than toward invisible — so this is where a learner meets Split and
 * Combine, and learns that the fourth number is not like the other three.
 */
export const fadeEffect: EffectDocument = {
  ...emptyEffectDocument('Fade'),
  description:
    'Makes the picture see-through, so what is behind shows through.',
  // See-through only means anything against a shape with edges; a full-bleed pattern has no outside to show through to.
  testTexture: 'sprite',
  parameters: [
    {
      id: 'visible',
      name: 'visible',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 1,
      description: '1 is completely solid, 0 is completely invisible.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 320, y: 40},
      size: {width: 280, height: 215},
      note: [
        'This makes something see-through.',
        'You might think you could just multiply the whole color by 0.5 to get half. But that halves the red, green and blue too — which makes it darker, not fainter.',
        'The fourth number, alpha, is the one that means "how solid am I". So we take the color apart, change only that number, and put it back together.',
      ].join('\n\n'),
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: -60, y: 60},
      note: 'Reads the color of the picture at this spot.',
    },
    {
      id: 'split-1',
      type: 'split',
      position: {x: -60, y: 200},
      note: 'Takes the color apart into its four numbers: red, green, blue, and alpha.',
    },
    {
      id: 'multiply-1',
      type: 'multiply',
      position: {x: 60, y: 330},
      note: 'Shrinks ONLY the alpha. The colors themselves are passed along untouched.',
    },
    {
      id: 'combine4-1',
      type: 'combine4',
      position: {x: -60, y: 460},
      note: 'Puts the color back together: the same red, green and blue as before, with the new alpha.',
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
    edge({node: 'sample-1', port: 'color'}, {node: 'split-1', port: 'in'}),
    edge({node: 'split-1', port: 'w'}, {node: 'multiply-1', port: 'a'}),
    edge(
      {node: parameterNodeId('visible'), port: GHOST_PORT},
      {node: 'multiply-1', port: 'b'},
    ),
    edge({node: 'split-1', port: 'x'}, {node: 'combine4-1', port: 'x'}),
    edge({node: 'split-1', port: 'y'}, {node: 'combine4-1', port: 'y'}),
    edge({node: 'split-1', port: 'z'}, {node: 'combine4-1', port: 'z'}),
    edge({node: 'multiply-1', port: 'out'}, {node: 'combine4-1', port: 'w'}),
    edge(
      {node: 'combine4-1', port: 'out'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
