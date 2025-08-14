import type {Slice} from  '@reduxjs/toolkit'
import type {Store, ReducersMapObject} from 'redux';

/**
 * Helper to combine a set of states into one state object.
 */
type UnionToIntersection<U> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/**
 * Pulls out a Slice's name and state.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SliceStateEntry<S extends Slice<any, any, string>> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends Slice<infer State, any, infer Name extends string>
    ? { [K in Name]: State }
    : never;

/**
 * Gets the redux state definition from the union of the the given redux toolkit Slices.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SlicesState<SlicesT extends readonly Slice<any, any, string>[]> =
  UnionToIntersection<SliceStateEntry<SlicesT[number]>>;

/**
 * Pulls out the inferred redux state from an existing store.
 */
export type StateFromStore<TStore> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TStore extends Store<infer S, any> ? S : never;

/**
 * Augments an existing store definition to include the given redux state.
 */
export type StoreWithState<TStore, TState> =
  Omit<TStore, 'getState'> & { getState(): TState };

/**
 * The augmented store definition to include the embedded asyncReducers list.
 */
export type StoreWithAsyncReducers<TStore> = TStore & {
  asyncReducers?: ReducersMapObject;
};
