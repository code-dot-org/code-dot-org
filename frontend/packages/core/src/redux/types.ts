import type {Store, ReducersMapObject} from 'redux';

/**
 * Collapses a union of object types into a single intersection. Used to
 * merge per-slice state contributions into the combined store shape.
 */
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Maps a slice-like shape `{name: 'foo'; getInitialState(): State}` to the
 * single-key object `{foo: State}` that the slice contributes to the
 * combined store. Structural matching (instead of `S extends Slice<...>`)
 * keeps the `name` literal narrow — @reduxjs/toolkit v2's default `Slice`
 * widens `Name` to `string` and makes the `actions` map invariant, both of
 * which break direct assignability of real slice instances.
 */
type SliceStateEntry<S> = S extends {
  name: infer N;
  getInitialState: () => infer State;
}
  ? N extends string
    ? {[K in N]: State}
    : never
  : never;

/**
 * Given a tuple of slices, produces the combined state shape — the
 * union-intersection of each slice's `{name: state}` contribution. Mirrors
 * what `configureStore({reducer: {...}})` would infer.
 */
export type SlicesState<SlicesT extends readonly unknown[]> =
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
export type StoreWithState<TStore, TState> = Omit<TStore, 'getState'> & {
  getState(): TState;
};

/**
 * The augmented store definition to include the embedded asyncReducers list.
 */
export type StoreWithAsyncReducers<TStore> = TStore & {
  asyncReducers?: ReducersMapObject;
};
