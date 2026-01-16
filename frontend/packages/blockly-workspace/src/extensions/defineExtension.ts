import type {BlockSvg, Extension, Environment} from '../types';

/**
 * Defines a block extension with proper type inference.
 *
 * @param name - The unique name of the extension
 * @param extension - The extension function
 * @returns A Extension object that can be assigned to a block definition
 */
export function defineExtension<
  TState extends Environment = Environment,
  TBlock extends BlockSvg = BlockSvg,
>(
  name: string,
  definition: {extension: (environment: TState) => void} & ThisType<TBlock>,
): Extension<TState> {
  return {
    name,
    extension: definition.extension,
  } as Extension<TState>;
}
