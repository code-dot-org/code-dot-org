import {createNodeRegistry, type EffectNodeRegistry} from '../registry';
import type {EffectNodeDefinition} from '../types';

import {annotationNodes} from './annotation';
import {colorNodes} from './color';
import {mathNodes} from './math';
import {noiseNodes} from './noise';
import {textureNodes} from './texture';
import {vectorNodes} from './vector';

export * from './helpers';
export {annotationNodes} from './annotation';
export {colorNodes} from './color';
export {mathNodes} from './math';
export {noiseNodes} from './noise';
export {textureNodes} from './texture';
export {vectorNodes} from './vector';

/**
 * Every node the stock palette offers.
 *
 * The input and output rows are not here: they are ghosts, derived from the
 * document rather than placed from a palette. See `../ghosts`.
 */
export const stockNodeDefinitions: readonly EffectNodeDefinition[] = [
  ...mathNodes,
  ...noiseNodes,
  ...vectorNodes,
  ...textureNodes,
  ...colorNodes,
  ...annotationNodes,
];

/** The registry used unless a caller supplies its own. */
export const defaultNodeRegistry: EffectNodeRegistry =
  createNodeRegistry(stockNodeDefinitions);
