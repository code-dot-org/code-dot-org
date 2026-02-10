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
}
