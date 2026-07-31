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
 * Drain the color out, using Brightness Of and a Mix.
 *
 * Teaches two things a learner needs early: that "how bright is this color" is
 * a real question with a real answer (and not just the average of the three
 * numbers), and that Mix lets an effect be applied *partly* — which is what
 * turns an on/off effect into a dial.
 */
export const grayscaleEffect: EffectDocument = {
  ...emptyEffectDocument('Grayscale'),
  description: 'Drains the color out, leaving black and white.',
  // Draining color needs color worth draining, and a sprite has several at once.
  testTexture: 'sprite',
  parameters: [
    {
      id: 'amount',
      name: 'amount',
      type: 'float',
      defaultValue: 1,
      min: 0,
      max: 1,
      description: '0 leaves the colors alone, 1 removes them completely.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 330, y: 40},
      size: {width: 285, height: 235},
      note: [
        'This takes the color out of a picture, like an old photograph.',
        'To do it we need one number for "how bright is this color". Brightness Of works that out — and it is not simply the three numbers averaged, because our eyes see green as much brighter than blue.',
        'Then Mix slides between the real color and the gray one. That is what makes the amount knob work: halfway gives you a half-faded picture rather than an all-or-nothing switch.',
      ].join('\n\n'),
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: -80, y: 60},
      note: 'Reads the color of the picture at this spot.',
    },
    {
      id: 'split-1',
      type: 'split',
      position: {x: -80, y: 190},
      note: 'Takes the color apart so we can hand just the red, green and blue to Brightness Of — it has no use for alpha.',
    },
    {
      id: 'combine3-1',
      type: 'combine3',
      position: {x: -80, y: 320},
      note: 'Puts red, green and blue back together as one color, without the alpha.',
    },
    {
      id: 'luminance-1',
      type: 'luminance',
      position: {x: -80, y: 450},
      note: 'Works out how bright that color is, as a single number. Bright yellow gives a high number; deep blue a low one.',
    },
    {
      id: 'combine3-2',
      type: 'combine3',
      position: {x: 110, y: 450},
      note: 'The gray version: the same brightness used for red, green AND blue. Equal amounts of all three is exactly what gray means.',
    },
    {
      id: 'mix-1',
      type: 'mix',
      position: {x: 20, y: 580},
      note: 'Slides between the real color and the gray one. Turn the amount knob down and the color comes back.',
    },
    {
      id: 'combine4-1',
      type: 'combine4',
      position: {x: 20, y: 710},
      note: 'Puts the alpha back on, so anything see-through stays see-through.',
    },
    {
      id: 'split-2',
      type: 'split',
      position: {x: 240, y: 580},
      note: 'Splits the mixed color so its three numbers can be recombined with the original alpha.',
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
    edge({node: 'split-1', port: 'x'}, {node: 'combine3-1', port: 'x'}),
    edge({node: 'split-1', port: 'y'}, {node: 'combine3-1', port: 'y'}),
    edge({node: 'split-1', port: 'z'}, {node: 'combine3-1', port: 'z'}),
    edge(
      {node: 'combine3-1', port: 'out'},
      {node: 'luminance-1', port: 'color'},
    ),
    edge({node: 'luminance-1', port: 'out'}, {node: 'combine3-2', port: 'x'}),
    edge({node: 'luminance-1', port: 'out'}, {node: 'combine3-2', port: 'y'}),
    edge({node: 'luminance-1', port: 'out'}, {node: 'combine3-2', port: 'z'}),
    edge({node: 'combine3-1', port: 'out'}, {node: 'mix-1', port: 'a'}),
    edge({node: 'combine3-2', port: 'out'}, {node: 'mix-1', port: 'b'}),
    edge(
      {node: parameterNodeId('amount'), port: GHOST_PORT},
      {node: 'mix-1', port: 'amount'},
    ),
    edge({node: 'mix-1', port: 'out'}, {node: 'split-2', port: 'in'}),
    edge({node: 'split-2', port: 'x'}, {node: 'combine4-1', port: 'x'}),
    edge({node: 'split-2', port: 'y'}, {node: 'combine4-1', port: 'y'}),
    edge({node: 'split-2', port: 'z'}, {node: 'combine4-1', port: 'z'}),
    edge({node: 'split-1', port: 'w'}, {node: 'combine4-1', port: 'w'}),
    edge(
      {node: 'combine4-1', port: 'out'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
