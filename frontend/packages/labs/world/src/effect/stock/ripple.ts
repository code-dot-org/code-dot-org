import {edge, emptyEffectDocument} from '../model';
import {
  GHOST_PORT,
  INPUT_TEXTURE_NODE_ID,
  INPUT_TIME_NODE_ID,
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
  parameterNodeId,
} from '../model/constants';
import type {EffectDocument} from '../model/types';

/**
 * A horizontal ripple: offset the UV by a sine wave that travels with time,
 * then sample the texture at the offset coordinate.
 *
 * The most involved of the stock effects, and the one to read last: it uses
 * every idea the others introduce at once — a parameter, the clock, taking a
 * value apart and putting it back, and moving where the picture is read from.
 */
export const rippleEffect: EffectDocument = {
  ...emptyEffectDocument('Ripple'),
  description: 'Waves the picture sideways, like a flag in the wind.',
  // Straight lines are what make a wobble legible; the checkerboard's edges bend visibly where a soft image would only smear.
  testTexture: 'checker',
  parameters: [
    {
      id: 'strength',
      name: 'strength',
      type: 'float',
      defaultValue: 0.02,
      min: 0,
      max: 0.1,
      description: 'How far the ripple pushes each pixel sideways.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 300, y: -40},
      size: {width: 265, height: 210},
      // Paragraphs, not hard-wrapped lines: the bubble wraps text itself, and
      // baked-in breaks fight that and land mid-sentence.
      note: [
        'This effect makes a picture ripple, like a flag in the wind.',
        'The trick: we never change any colors. We change WHERE we look for them. Each row of the picture gets nudged a little bit sideways, and rows near each other get nudged by different amounts.',
        'Follow the wires downward and read the note on each step.',
      ].join('\n\n'),
    },
    {
      id: 'split-1',
      type: 'split',
      position: {x: -160, y: 0},
      note: 'Every spot on the picture has two numbers: how far across (X) and how far down (Y). We only want Y.',
    },
    {
      id: 'multiply-1',
      type: 'multiply',
      position: {x: -160, y: 120},
      params: {b: 14},
      note: 'Multiplying by 14 fits 14 waves down the picture instead of one. Try a smaller number for bigger, lazier waves.',
    },
    {
      id: 'add-1',
      type: 'add',
      position: {x: -160, y: 240},
      note: 'Adding the clock makes the whole pattern slide as time passes. This is what turns a still wave into a moving one.',
    },
    {
      id: 'sine-1',
      type: 'sine',
      position: {x: -160, y: 360},
      note: 'Sine takes a number that keeps counting up and turns it into a smooth back-and-forth, between -1 and 1. That wobble is the wave.',
    },
    {
      id: 'multiply-2',
      type: 'multiply',
      position: {x: -160, y: 470},
      note: 'Shrinks the wave down to a tiny nudge. The strength knob at the top decides how tiny — a big nudge would smear the picture.',
    },
    {
      id: 'combine2-1',
      type: 'combine2',
      position: {x: 40, y: 470},
      params: {y: 0},
      note: 'Turns the nudge into a direction. Y is 0, so the picture only ever moves sideways, never up or down.',
    },
    {
      id: 'add-2',
      type: 'add',
      position: {x: 40, y: 600},
      note: 'Adds the nudge to where we started, so we end up pointing at a spot just beside the original one.',
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: 40, y: 720},
      note: 'Reads the color at that shifted spot. Because every row shifts by a different amount, the picture comes out wavy.',
    },
  ],
  edges: [
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'split-1', port: 'in'},
    ),
    edge({node: 'split-1', port: 'y'}, {node: 'multiply-1', port: 'a'}),
    edge({node: 'multiply-1', port: 'out'}, {node: 'add-1', port: 'a'}),
    edge(
      {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
      {node: 'add-1', port: 'b'},
    ),
    edge({node: 'add-1', port: 'out'}, {node: 'sine-1', port: 'x'}),
    edge({node: 'sine-1', port: 'out'}, {node: 'multiply-2', port: 'a'}),
    edge(
      {node: parameterNodeId('strength'), port: GHOST_PORT},
      {node: 'multiply-2', port: 'b'},
    ),
    edge({node: 'multiply-2', port: 'out'}, {node: 'combine2-1', port: 'x'}),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'add-2', port: 'a'},
    ),
    edge({node: 'combine2-1', port: 'out'}, {node: 'add-2', port: 'b'}),
    edge(
      {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'texture'},
    ),
    edge({node: 'add-2', port: 'out'}, {node: 'sample-1', port: 'uv'}),
    edge(
      {node: 'sample-1', port: 'color'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
