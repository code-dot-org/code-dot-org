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
 * Brightness that breathes, driven by the clock.
 *
 * The first effect that MOVES, and the one that teaches the shape every
 * animated effect reuses: a clock that only counts up, turned into a smooth
 * back-and-forth by Sine, then squeezed into a useful range by Remap.
 */
export const pulseEffect: EffectDocument = {
  ...emptyEffectDocument('Pulse'),
  description: 'Makes something glow brighter and dimmer, over and over.',
  // Brightness over time reads best on something with mid-tones rather than flat black and white.
  testTexture: 'sprite',
  parameters: [
    {
      id: 'speed',
      name: 'speed',
      type: 'float',
      defaultValue: 3,
      min: 0,
      max: 12,
      description: 'How many times it pulses. Bigger is faster.',
    },
    {
      id: 'strength',
      name: 'strength',
      type: 'float',
      defaultValue: 0.6,
      min: 0,
      max: 1,
      description: 'How much brighter the bright part gets.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 330, y: 40},
      size: {width: 285, height: 245},
      note: [
        'This is the first effect here that moves, and almost everything that moves is built this way.',
        'The clock only ever counts up: 1, 2, 3, and on forever. On its own that is no use — brightness cannot keep rising for ever.',
        'Sine is the trick. Feed it a number that keeps climbing and it gives back a smooth wobble between -1 and 1, over and over. Remap then squeezes that wobble into the range we actually want.',
        'Follow the wires down and read each step.',
      ].join('\n\n'),
    },
    {
      id: 'multiply-1',
      type: 'multiply',
      position: {x: -60, y: 60},
      note: 'Multiplying the clock speeds it up. A bigger speed means the wobble arrives sooner, so it pulses faster.',
    },
    {
      id: 'sine-1',
      type: 'sine',
      position: {x: -60, y: 190},
      note: 'Turns the ever-climbing clock into a smooth back-and-forth between -1 and 1. This is the pulse itself.',
    },
    {
      id: 'remap-1',
      type: 'remap',
      position: {x: -60, y: 320},
      params: {fromMin: -1, fromMax: 1, toMin: 1},
      note: 'Sine swings from -1 to 1, but a brightness of -1 is meaningless. Remap slides that range up so the dimmest point is normal brightness and the brightest is brighter.',
    },
    {
      id: 'add-1',
      type: 'add',
      position: {x: 100, y: 320},
      params: {a: 1},
      note: 'The top of the range: 1 plus the strength. Turn strength up and the bright part gets brighter, while the dim part stays put.',
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: -260, y: 320},
      note: 'Reads the color of the picture at this spot.',
    },
    {
      id: 'multiply-2',
      type: 'multiply',
      position: {x: -60, y: 470},
      note: 'Scales the color by the pulse. Above 1 makes it brighter; the alpha rides along, which is fine because 1 times anything is unchanged.',
    },
  ],
  edges: [
    edge(
      {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
      {node: 'multiply-1', port: 'a'},
    ),
    edge(
      {node: parameterNodeId('speed'), port: GHOST_PORT},
      {node: 'multiply-1', port: 'b'},
    ),
    edge({node: 'multiply-1', port: 'out'}, {node: 'sine-1', port: 'x'}),
    edge({node: 'sine-1', port: 'out'}, {node: 'remap-1', port: 'value'}),
    edge(
      {node: parameterNodeId('strength'), port: GHOST_PORT},
      {node: 'add-1', port: 'b'},
    ),
    edge({node: 'add-1', port: 'out'}, {node: 'remap-1', port: 'toMax'}),
    edge(
      {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'texture'},
    ),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'uv'},
    ),
    edge({node: 'sample-1', port: 'color'}, {node: 'multiply-2', port: 'a'}),
    edge({node: 'remap-1', port: 'out'}, {node: 'multiply-2', port: 'b'}),
    edge(
      {node: 'multiply-2', port: 'out'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
