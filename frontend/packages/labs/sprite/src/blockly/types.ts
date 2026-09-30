import type {
  BlockDefinition,
  JavascriptBlockGenerator,
  Mutator,
} from '@code-dot-org/blockly';

type BaseBlockDefinition = Omit<
  Extract<BlockDefinition, {mutator?: never}>,
  'generator' | 'mutator'
>;

/**
 * A lab block's definition without its generator, which stays beside it as
 * in apps. The tooltip is optional here; the block list supplies ''.
 */
export type BlockJson = Omit<BaseBlockDefinition, 'tooltip'> & {
  tooltip?: string;
  mutator?: Mutator;
};

export type GeneratorFunction = JavascriptBlockGenerator;

/** One lab-owned block, and the interpreted helper its code calls, if any. */
export interface LabBlock {
  definition: BlockJson;
  generator: GeneratorFunction;
  helperCode?: string;
}
