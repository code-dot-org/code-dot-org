import type {BlockSvg, Mutator} from '../types';

/**
 * Infers the state type from the loadExtraState method's parameter.
 * Falls back to void if no loadExtraState is defined.
 */
type InferState<T> = T extends {loadExtraState(state: infer S): void}
  ? S
  : void;

/**
 * Defines a block mutator with proper type inference.
 *
 * The state type is automatically inferred from the `loadExtraState` parameter type.
 * The `this` context inside mutator methods will have access to all properties
 * and methods defined in the mutator object, plus BlockSvg methods.
 *
 * @param name - The unique name of the mutator
 * @param mutator - The mutator object containing methods and properties
 * @returns A Mutator object that can be assigned to a block definition
 *
 * @example
 * // Without state (no saveExtraState/loadExtraState)
 * const simpleMutator = defineMutator('simple', {
 *   customMethod() { this.setColour(180); }
 * });
 *
 * @example
 * // With state - type is inferred from loadExtraState parameter
 * interface MyState { count: number }
 * const statefulMutator = defineMutator('stateful', {
 *   count_: 0,
 *   saveExtraState() { return { count: this.count_ }; },
 *   loadExtraState(state: MyState) { this.count_ = state.count; },
 * });
 */
export function defineMutator<T extends object>(
  name: string,
  mutator: T & ThisType<BlockSvg & T>,
): Mutator<InferState<T>, T> {
  return {name, mutator} as Mutator<InferState<T>, T>;
}
