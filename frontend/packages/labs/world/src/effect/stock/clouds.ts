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
 * Cloud cover, and the one idea it exists to show: OCTAVES.
 *
 * One layer of noise looks like blobs. Real clouds, marble, rust and mountains
 * all have the same shape at every size you look at — big lumps made of smaller
 * lumps made of smaller lumps still. You get that by adding the same noise
 * several times over: each layer twice as fine as the last and half as strong.
 *
 * That is all `fbm` means, and it is written out here as three Noise nodes
 * rather than hidden in one, because the whole trick is visible in six numbers:
 * the sizes 4, 8, 16 and the strengths 1, ½, ¼. A learner who reads this can
 * add a fourth layer by copying the pattern.
 *
 * Last in the library. It assumes everything Ripple does and adds a node that
 * generates a picture rather than reading one — see `nodes/definitions/noise`
 * for why a shader's randomness has to be handed a position.
 */
export const cloudsEffect: EffectDocument = {
  ...emptyEffectDocument('Clouds'),
  description:
    'Soft cloud cover, built by stacking the same noise at three sizes.',
  // Clouds are a change in BRIGHTNESS, and that is what the gradient is for.
  // On the checkerboard the white squares are already white, so half the cloud
  // is invisible and the effect looks like it barely does anything.
  testTexture: 'gradient',
  parameters: [
    {
      id: 'amount',
      name: 'amount',
      type: 'float',
      defaultValue: 0.7,
      min: 0,
      max: 1,
      description: 'How thick the cloud cover is. 0 leaves the picture alone.',
    },
  ],
  nodes: [
    {
      id: 'comment-1',
      type: 'comment',
      position: {x: 380, y: -60},
      size: {width: 285, height: 265},
      note: [
        'Clouds, made by adding up three layers of the same noise.',
        'Each layer is twice as FINE as the one before it — sizes 4, 8 and 16 — and half as STRONG — 1, then a half, then a quarter. Big shapes from the first, detail from the last.',
        'That is the whole trick, and it has a name: octaves. It is why clouds, marble and mountains all look the same whether you are close up or far away.',
        'Try changing a size, or copying the pattern to add a fourth layer.',
      ].join('\n\n'),
    },
    {
      id: 'noise-1',
      type: 'noise',
      position: {x: -380, y: 0},
      params: {scale: 4},
      note: 'The big shapes. Size 4 fits about four blobs across the picture — this layer decides where the clouds are.',
    },
    {
      id: 'noise-2',
      type: 'noise',
      position: {x: -170, y: 0},
      params: {scale: 8},
      note: 'Twice as fine: eight blobs across instead of four. On its own it would look like the layer beside it, only smaller.',
    },
    {
      id: 'noise-3',
      type: 'noise',
      position: {x: 40, y: 0},
      params: {scale: 16},
      note: 'Twice as fine again. This is the layer that gives the edges their fuzz.',
    },
    {
      id: 'multiply-1',
      type: 'multiply',
      position: {x: -170, y: 130},
      params: {b: 0.5},
      note: 'Half strength. A finer layer at full strength would drown out the big shapes and the whole thing would look like static.',
    },
    {
      id: 'multiply-2',
      type: 'multiply',
      position: {x: 40, y: 130},
      params: {b: 0.25},
      note: 'A quarter strength — half again, because this layer is finer again. Each halving is what keeps the detail as detail.',
    },
    {
      id: 'add-1',
      type: 'add',
      position: {x: -280, y: 270},
      note: 'The big shapes plus the middle ones. Adding is all there is to it: no layer knows about any other.',
    },
    {
      id: 'add-2',
      type: 'add',
      position: {x: -170, y: 390},
      note: 'And the finest layer on top. Three layers in, the lumps have lumps.',
    },
    {
      id: 'multiply-3',
      type: 'multiply',
      position: {x: -170, y: 510},
      params: {b: 0.571},
      note: 'Three layers added together can reach 1¾, and a brightness only means something between 0 and 1. Dividing by 1¾ — multiplying by 0.571 — brings it back into range.',
    },
    {
      id: 'multiply-4',
      type: 'multiply',
      position: {x: -170, y: 630},
      note: 'How much cloud to actually show. The amount knob at the top scales the whole pattern down; at 0 nothing is hidden.',
    },
    {
      id: 'sample-1',
      type: 'sample',
      position: {x: 170, y: 390},
      note: 'The picture underneath, read normally — this effect adds to it rather than moving it around.',
    },
    {
      id: 'color-1',
      type: 'colorRgba',
      position: {x: 170, y: 510},
      note: 'White: what the cloud is made of. Change it for fog, smoke or ink.',
    },
    {
      id: 'mix-1',
      type: 'mix',
      position: {x: 170, y: 700},
      note: 'Fades each pixel toward white by however much cloud is over it. Where the noise is near 0 the picture shows through; where it is near 1 the cloud hides it.',
    },
  ],
  edges: [
    // Three layers of the same noise, read from the same place.
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'noise-1', port: 'position'},
    ),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'noise-2', port: 'position'},
    ),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'noise-3', port: 'position'},
    ),
    // …each weaker than the one before it.
    edge({node: 'noise-2', port: 'out'}, {node: 'multiply-1', port: 'a'}),
    edge({node: 'noise-3', port: 'out'}, {node: 'multiply-2', port: 'a'}),
    // …added up, and brought back into 0–1.
    edge({node: 'noise-1', port: 'out'}, {node: 'add-1', port: 'a'}),
    edge({node: 'multiply-1', port: 'out'}, {node: 'add-1', port: 'b'}),
    edge({node: 'add-1', port: 'out'}, {node: 'add-2', port: 'a'}),
    edge({node: 'multiply-2', port: 'out'}, {node: 'add-2', port: 'b'}),
    edge({node: 'add-2', port: 'out'}, {node: 'multiply-3', port: 'a'}),
    edge({node: 'multiply-3', port: 'out'}, {node: 'multiply-4', port: 'a'}),
    edge(
      {node: parameterNodeId('amount'), port: GHOST_PORT},
      {node: 'multiply-4', port: 'b'},
    ),
    // The picture, the cloud's color, and the blend between them.
    edge(
      {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'texture'},
    ),
    edge(
      {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
      {node: 'sample-1', port: 'uv'},
    ),
    edge({node: 'sample-1', port: 'color'}, {node: 'mix-1', port: 'a'}),
    edge({node: 'color-1', port: 'out'}, {node: 'mix-1', port: 'b'}),
    edge({node: 'multiply-4', port: 'out'}, {node: 'mix-1', port: 'amount'}),
    edge(
      {node: 'mix-1', port: 'out'},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};
