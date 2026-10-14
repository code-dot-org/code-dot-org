import type {BlockSvg, Environment} from '../types';

/**
 * Our encapsulation of block extensions, which are functions that are used
 * when generating and initializing certain blocks.
 */
export interface Extension<
  TState extends Environment = Environment,
  TProps extends object = object,
> {
  /** The unique name of the extension which can be referenced from other blocks. */
  name: string;
  /** The extension method. We pass in the Blockly environment object, also. */
  extension: (environment: TState) => void & ThisType<BlockSvg & TProps>;
}
