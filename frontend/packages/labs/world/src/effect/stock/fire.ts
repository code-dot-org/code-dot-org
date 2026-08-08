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
 * An actor on fire, and three ideas that no earlier effect uses.
 *
 *   - Time moves WHERE the noise is read, not what is done with it. Ripple
 *     feeds the clock into a wave; here the pattern slides downward past a
 *     fixed frame, and what you see is flame rising.
 *   - A coordinate is used as a MASK. Multiplying by `1 - y` makes the fire
 *     hottest at the bottom and gone at the top, which is most of what makes
 *     it read as fire rather than as noise.
 *   - A number becomes a COLOR through a ramp — black to red to yellow — where
 *     everything before this blended between two things at most.
 *
 * ONE layer of noise, deliberately, where Clouds uses three. Octaves are that
 * effect's lesson and repeating them here would bury these three; a single
 * layer under a hard falloff and a steep ramp reads perfectly well as flame.
 *
 * The flame is MIXED in rather than added, and that is a color decision rather
 * than a stylistic one: added red over a blue actor comes out PINK, because
 * adding can only ever brighten what is already there. Mixing replaces it, so
 * the orange in the ramp is the orange you see.
 *
 * What keeps the fire ON the actor is the mask: the heat is multiplied by the
 * picture's own alpha, so outside the actor it is 0, and mixing by 0 leaves
 * every pixel there exactly as transparent as it was. It follows that this
 * looks right on a sprite and does very little to a full-bleed background.
 */
export const fireEffect: EffectDocument = {
  ...emptyEffectDocument('Fire'),
  description: 'Flames licking upward, hottest at the bottom.',
  // A stand-in actor with transparency around it: the alpha is doing real work
  // here, and on any other sample there would be nothing to see it do.
  testTexture: 'sprite',
  parameters: [
    {
      id: 'speed',
      name: 'speed',
      type: 'float',
      defaultValue: 0.6,
      min: 0,
      max: 3,
      description: 'How fast the flames climb.',
    },
    {
      id: 'intensity',
      name: 'intensity',
      type: 'float',
      defaultValue: 3.5,
      min: 0,
      max: 6,
      description: 'How fierce the fire is. 0 puts it out.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 360, y: -60},
      size: {width: 290, height: 280},
      note: [
        'Fire, out of one layer of noise and two tricks.',
        'First, the noise is read from a spot that slides DOWN as time passes — so the pattern appears to climb. Nothing is moving up; we are just looking further down each frame.',
        'Second, the whole thing is multiplied by how far up the picture we are, so it is fierce at the bottom and gone at the top. That falloff is most of what makes noise look like flame.',
        'Then a Ramp turns that one number into color: black where it is cold, red, then yellow where it is hottest.',
      ].join('\n\n'),
    },
    {
      id: 'multiply-1',
      type: 'multiply',
      position: {x: -400, y: 0},
      note: 'How far the pattern has slid by now: the clock times the speed knob.',
    },
    {
      id: 'combine2-1',
      type: 'combine2',
      position: {x: -400, y: 120},
      params: {x: 0},
      note: 'Turns that into a direction. X is 0, so the pattern only ever slides up and down, never sideways.',
    },
    {
      id: 'subtract-1',
      type: 'subtract',
      position: {x: -400, y: 240},
      note: 'Reads the noise from further DOWN as time passes. Taking away makes the flames climb; adding would make them fall, which looks like rain.',
    },
    {
      id: 'multiply-0',
      type: 'multiply',
      position: {x: -400, y: 360},
      params: {b: [7, 2.2]},
      note: 'Squashes the pattern sideways before reading it: seven blobs across but only two down, so each one comes out tall. That stretch is what turns round noise into something tongue-shaped.',
    },
    {
      id: 'noise-1',
      type: 'noise',
      position: {x: -400, y: 480},
      params: {scale: 1},
      note: 'The flame shapes. One layer is enough here — Clouds is where stacking several is the lesson.',
    },
    {
      id: 'split-1',
      type: 'split',
      position: {x: -140, y: 0},
      note: 'Every spot has an across (X) and a down (Y). We want Y: how far up the picture this pixel is.',
    },
    {
      id: 'subtract-2',
      type: 'subtract',
      position: {x: -140, y: 130},
      params: {a: 1},
      note: 'Flips it, so the BOTTOM of the picture is 1 and the top is 0. This is the shape of the fire.',
    },
    {
      id: 'power-1',
      type: 'power',
      position: {x: -140, y: 250},
      params: {exponent: 2},
      note: 'Bends the fade so it drops away faster than a straight line would — a straight fade leaves the whole actor glowing. Squared keeps the fire low without snuffing it out: remember an actor sits in the MIDDLE of its picture, so its feet are already a quarter of the way up and a steeper fade than this never reaches them.',
    },
    {
      id: 'multiply-2',
      type: 'multiply',
      position: {x: -140, y: 480},
      note: 'Fades the flames out toward the top. Without this the noise fills the whole picture evenly and looks nothing like fire.',
    },
    {
      id: 'multiply-3',
      type: 'multiply',
      position: {x: -140, y: 600},
      note: 'How fierce, from the intensity knob. Above 1 the hottest parts pin to the top of the ramp and go white.',
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: 150, y: 0},
      note: 'The actor underneath, read normally. The fire is added on top of it rather than replacing it.',
    },
    {
      id: 'split-2',
      type: 'split',
      position: {x: 150, y: 130},
      note: 'Takes the actor’s own see-through-ness (W). Outside the actor this is 0.',
    },
    {
      id: 'multiply-4',
      type: 'multiply',
      position: {x: -140, y: 720},
      note: 'Multiplying by that keeps the fire ON the actor: where there is nothing to burn, there is no flame.',
    },
    {
      id: 'ramp-1',
      type: 'ramp',
      position: {x: -140, y: 840},
      params: {
        low: [0.4, 0.05, 0, 1],
        mid: [1, 0.35, 0.02, 1],
        high: [1, 0.95, 0.6, 1],
        midpoint: 0.5,
      },
      note: 'One number into a color: dark ember, then red, then yellow at the hottest. These are the colors the flame IS, not colors added to the actor — which is why they are opaque and why the cold end still has a little red in it.',
    },
    {
      id: 'mix-1',
      type: 'mix',
      position: {x: 150, y: 840},
      note: 'Fades the actor over to flame by however hot it is. Mixing rather than ADDING is what keeps the color honest: added red over a blue actor comes out pink, where mixing gives the orange the ramp actually asked for. Where the heat is 0 — which is everywhere outside the actor — the actor is left exactly as it was.',
    },
  ],
  edges: [
    // Where to read the noise from: sliding downward as time passes.
    edge(
      {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
      {node: 'multiply-1', port: 'a'},
    ),
    edge(
      {node: parameterNodeId('speed'), port: GHOST_PORT},
      {node: 'multiply-1', port: 'b'},
    ),
    edge({node: 'multiply-1', port: 'out'}, {node: 'combine2-1', port: 'y'}),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'subtract-1', port: 'a'},
    ),
    edge({node: 'combine2-1', port: 'out'}, {node: 'subtract-1', port: 'b'}),
    edge({node: 'subtract-1', port: 'out'}, {node: 'multiply-0', port: 'a'}),
    edge(
      {node: 'multiply-0', port: 'out'},
      {node: 'noise-1', port: 'position'},
    ),
    // How far up the picture we are, flipped so the bottom burns.
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'split-1', port: 'in'},
    ),
    edge({node: 'split-1', port: 'y'}, {node: 'subtract-2', port: 'b'}),
    // Noise, shaped by that falloff and by the knob.
    edge({node: 'noise-1', port: 'out'}, {node: 'multiply-2', port: 'a'}),
    edge({node: 'subtract-2', port: 'out'}, {node: 'power-1', port: 'base'}),
    edge({node: 'power-1', port: 'out'}, {node: 'multiply-2', port: 'b'}),
    edge({node: 'multiply-2', port: 'out'}, {node: 'multiply-3', port: 'a'}),
    edge(
      {node: parameterNodeId('intensity'), port: GHOST_PORT},
      {node: 'multiply-3', port: 'b'},
    ),
    // …and kept to where the actor actually is.
    edge(
      {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'texture'},
    ),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'uv'},
    ),
    edge({node: 'sample-1', port: 'color'}, {node: 'split-2', port: 'in'}),
    edge({node: 'multiply-3', port: 'out'}, {node: 'multiply-4', port: 'a'}),
    edge({node: 'split-2', port: 'w'}, {node: 'multiply-4', port: 'b'}),
    // One number into a color, added as light.
    edge({node: 'multiply-4', port: 'out'}, {node: 'ramp-1', port: 't'}),
    edge({node: 'sample-1', port: 'color'}, {node: 'mix-1', port: 'a'}),
    edge({node: 'ramp-1', port: 'out'}, {node: 'mix-1', port: 'b'}),
    edge({node: 'multiply-4', port: 'out'}, {node: 'mix-1', port: 'amount'}),
    edge(
      {node: 'mix-1', port: 'out'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
