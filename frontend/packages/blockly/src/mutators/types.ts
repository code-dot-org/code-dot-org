import type {BlockSvg} from '../blocks/types';

// Enforce "both or neither" for loadExtraState/saveExtraState
export type ExtraStateMethods<TState> =
  | {
      loadExtraState(state: TState): void;
      saveExtraState(): TState;
    }
  | {
      loadExtraState?: never;
      saveExtraState?: never;
    };

/**
 * Our encapsulation of block mutators.
 */
export interface Mutator<TState = object, TProps extends object = object> {
  name: string;
  mutator: TProps & ExtraStateMethods<TState> & ThisType<BlockSvg & TProps>;
  noRegister?: boolean;
  /**
   * Block types the mutator's BUBBLE offers in its flyout.
   *
   * Supplying this is what makes a mutator the familiar kind — the ⚙ opens a
   * mini-workspace holding a container block, and these are what you drag into
   * it (as `controls_if` offers "else if" and "else"). A mutator that reshapes
   * its block from fields instead leaves this off.
   */
  blocks?: string[];
}
