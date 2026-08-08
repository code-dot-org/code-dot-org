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
 * Rings spreading out from the middle: a stone dropped in a pond.
 *
 * The one to read AFTER Ripple, and it is the same idea turned a quarter turn.
 * Ripple asks "how far down the picture is this pixel?" and pushes sideways;
 * this asks "how far from the middle is it?" and pushes OUTWARD. Two things
 * follow from that, and they are the whole difference:
 *
 *   - the wave is driven by distance from a point rather than by one axis, so
 *     the crests come out as circles instead of stripes; and
 *   - the nudge has to point somewhere different for every pixel — away from
 *     the middle — where Ripple's always pointed along X. That is what
 *     `normalize` is for, and it is the one new node here.
 *
 * Time is SUBTRACTED rather than added, which is what sends the rings outward.
 * Adding it runs them inward, toward the middle, which looks like a drain.
 */
export const radialRippleEffect: EffectDocument = {
  ...emptyEffectDocument('Radial Ripple'),
  description:
    'Rings spread out from the middle, like a stone dropped in water.',
  // The same reason Ripple picks it: straight lines make a bend legible, and
  // the grid shows the rings curving where a soft image would only smear.
  testTexture: 'checker',
  parameters: [
    {
      id: 'strength',
      name: 'strength',
      type: 'float',
      defaultValue: 0.02,
      min: 0,
      max: 0.1,
      description: 'How far each ring pushes the picture outward.',
    },
    {
      id: 'rings',
      name: 'rings',
      type: 'float',
      defaultValue: 30,
      min: 2,
      max: 80,
      description: 'How many rings fit between the middle and the corner.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 320, y: -40},
      size: {width: 280, height: 250},
      note: [
        'This effect makes rings spread out from the middle, the way they do when you drop a stone in a pond.',
        'Like Ripple, it never changes a single color. It changes WHERE each color is read from. The difference is what decides the nudge: Ripple asks how far DOWN a pixel is, and this asks how far it is from the MIDDLE.',
        'That one change turns stripes into circles. Follow the wires down.',
      ].join('\n\n'),
    },
    {
      id: 'distance-1',
      type: 'distance',
      position: {x: -180, y: 0},
      params: {b: 0.5},
      note: 'How far this spot is from the middle of the picture. The middle is 0.5, 0.5 — halfway across and halfway down. Spots near the middle get a small number, corners get the biggest.',
    },
    {
      id: 'multiply-1',
      type: 'multiply',
      position: {x: -180, y: 130},
      note: 'Multiplying that distance decides how many rings there are. The rings knob at the top sets it — a smaller number gives fewer, fatter rings.',
    },
    {
      id: 'subtract-1',
      type: 'subtract',
      position: {x: -180, y: 260},
      note: 'Taking the clock away makes the rings travel OUTWARD as time passes. Adding it instead would run them inward, which looks like water going down a drain.',
    },
    {
      id: 'sine-1',
      type: 'sine',
      position: {x: -180, y: 390},
      note: 'Sine turns a number that keeps counting up into a smooth back-and-forth between -1 and 1. Every spot the same distance from the middle gets the same answer, and that is why the crests come out as circles.',
    },
    {
      id: 'multiply-2',
      type: 'multiply',
      position: {x: -180, y: 510},
      note: 'Shrinks the wave to a tiny nudge. The strength knob decides how tiny — a big nudge would tear the picture apart rather than ripple it.',
    },
    {
      id: 'subtract-2',
      type: 'subtract',
      position: {x: 90, y: 130},
      params: {b: 0.5},
      note: 'Which WAY is away from the middle, for this spot. Subtracting the middle from the spot gives an arrow pointing outward — long near the corners, short near the middle.',
    },
    {
      id: 'normalize-1',
      type: 'normalize',
      position: {x: 90, y: 260},
      note: 'Keeps the direction of that arrow but makes it one unit long, so every spot is pushed by the same amount no matter how far out it is. Without this the corners would ripple far harder than the middle.',
    },
    {
      id: 'multiply-3',
      type: 'multiply',
      position: {x: 90, y: 510},
      note: 'Points the nudge outward: the direction from above, shrunk to the size of the wave. This is the finished push, and it is different for every pixel.',
    },
    {
      id: 'add-1',
      type: 'add',
      position: {x: 90, y: 640},
      note: 'Adds the push to where we started, so we end up pointing at a spot slightly further out than the original one.',
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: 90, y: 760},
      note: 'Reads the color at that shifted spot. Because the shift goes in rings, the picture comes out rippling in rings.',
    },
  ],
  edges: [
    // How far from the middle, turned into a travelling wave.
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'distance-1', port: 'a'},
    ),
    edge({node: 'distance-1', port: 'out'}, {node: 'multiply-1', port: 'a'}),
    edge(
      {node: parameterNodeId('rings'), port: GHOST_PORT},
      {node: 'multiply-1', port: 'b'},
    ),
    edge({node: 'multiply-1', port: 'out'}, {node: 'subtract-1', port: 'a'}),
    edge(
      {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
      {node: 'subtract-1', port: 'b'},
    ),
    edge({node: 'subtract-1', port: 'out'}, {node: 'sine-1', port: 'x'}),
    edge({node: 'sine-1', port: 'out'}, {node: 'multiply-2', port: 'a'}),
    edge(
      {node: parameterNodeId('strength'), port: GHOST_PORT},
      {node: 'multiply-2', port: 'b'},
    ),
    // Which way "outward" is, as a direction of length one.
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'subtract-2', port: 'a'},
    ),
    edge({node: 'subtract-2', port: 'out'}, {node: 'normalize-1', port: 'in'}),
    // Direction times size, added to where we started.
    edge({node: 'normalize-1', port: 'out'}, {node: 'multiply-3', port: 'a'}),
    edge({node: 'multiply-2', port: 'out'}, {node: 'multiply-3', port: 'b'}),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'add-1', port: 'a'},
    ),
    edge({node: 'multiply-3', port: 'out'}, {node: 'add-1', port: 'b'}),
    edge(
      {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'texture'},
    ),
    edge({node: 'add-1', port: 'out'}, {node: 'sample-1', port: 'uv'}),
    edge(
      {node: 'sample-1', port: 'color'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
