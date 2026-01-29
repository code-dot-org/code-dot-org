import type {Mutator, Environment} from '../types';

import type {
  BaseBlockDefinition,
  BlockDefinitionWithMutator,
  BlockDefinitionWithoutMutator,
  BlockSvg,
  JavascriptBlockGenerator,
  MutatorBlock,
} from './types';

/**
 * Input type for defineBlock when a mutator is provided.
 * The mutator property is required and determines the block type for the generator.
 */
type BlockDefinitionInputWithMutator<
  T extends Mutator,
  U extends Environment = Environment,
  B extends BlockSvg<U> = BlockSvg<U>,
> = BaseBlockDefinition & {
  mutator: T;
  generator: {
    javascript: JavascriptBlockGenerator<MutatorBlock<T, B>, U>;
  };
};

/**
 * Input type for defineBlock when no mutator is provided.
 * The generator receives a standard BlockSvg.
 */
type BlockDefinitionInputWithoutMutator<
  U extends Environment = Environment,
  B extends BlockSvg<U> = BlockSvg<U>,
> = BaseBlockDefinition & {
  mutator?: undefined;
  generator: {
    javascript: JavascriptBlockGenerator<B, U>;
  };
};

/**
 * Defines a block with proper type inference for the generator function.
 *
 * This helper function enables TypeScript to infer the mutator type from the
 * `mutator` property and correctly type the `block` parameter in the generator.
 *
 * @example
 * // Without mutator - block is typed as BlockSvg
 * const myBlock = defineBlock({
 *   type: 'my_block',
 *   tooltip: 'My block',
 *   generator: {
 *     javascript(block, generator) {
 *       // block is BlockSvg
 *       return 'code';
 *     },
 *   },
 * });
 *
 * @example
 * // With mutator - block is typed as BlockSvg & MutatorProps
 * const myMutator = defineMutator('my_mutator', {
 *   customProp: 0,
 *   saveExtraState() { return { customProp: this.customProp }; },
 *   loadExtraState(state) { this.customProp = state.customProp; },
 * });
 *
 * const myBlock = defineBlock({
 *   type: 'my_block',
 *   tooltip: 'My block',
 *   mutator: myMutator,
 *   generator: {
 *     javascript(block, generator) {
 *       // block is BlockSvg & { customProp: number, saveExtraState, loadExtraState }
 *       console.log(block.customProp);
 *       return 'code';
 *     },
 *   },
 * });
 */
export function defineBlock<
  T extends Mutator,
  U extends Environment = Environment,
  B extends BlockSvg<U> = BlockSvg<U>,
>(
  def: BlockDefinitionInputWithMutator<T, U, B>,
): BlockDefinitionWithMutator<T, U, B>;
export function defineBlock<
  U extends Environment = Environment,
  B extends BlockSvg<U> = BlockSvg<U>,
>(
  def: BlockDefinitionInputWithoutMutator<U, B>,
): BlockDefinitionWithoutMutator<U, B>;
export function defineBlock<
  U extends Environment = Environment,
  B extends BlockSvg<U> = BlockSvg<U>,
>(
  def:
    | BlockDefinitionInputWithMutator<Mutator, U, B>
    | BlockDefinitionInputWithoutMutator<U, B>,
):
  | BlockDefinitionWithMutator<Mutator, U, B>
  | BlockDefinitionWithoutMutator<U, B> {
  return def as
    | BlockDefinitionWithMutator<Mutator, U, B>
    | BlockDefinitionWithoutMutator<U, B>;
}
