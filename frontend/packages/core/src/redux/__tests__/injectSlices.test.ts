/**
 * @vitest-environment jsdom
 */

import {configureStore, createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, expectTypeOf, it} from 'vitest';

import reduxSlice, {incrementCount} from '../reduxSlice';
import {injectSlice, injectSlices} from '../store';
import type {MockStore, StateFor} from '../store';
import type {SlicesState, StoreWithState} from '../types';

// Fixture slices stand in for real platform slices. They intentionally have
// dissimilar reducer shapes — that's what previously broke when the type
// constraint was `Slice<any, any, string>` (the invariant `actions` map made
// these unassignable to a common tuple type).

const sliceA = createSlice({
  name: 'a',
  initialState: {value: 0},
  reducers: {
    setA: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
});

const sliceB = createSlice({
  name: 'b',
  initialState: {label: 'none'},
  reducers: {
    setB: (state, action: PayloadAction<string>) => {
      state.label = action.payload;
    },
  },
});

const sliceC = createSlice({
  name: 'c',
  initialState: {count: 0},
  reducers: {
    bumpC: state => {
      state.count += 1;
    },
  },
});

// A fresh store per test — `injectSlices` mutates `asyncReducers` on the
// input, so we can't reuse the shared `defaultStore` singleton across cases.
// Cast mirrors what `defaultStore` does: `StoreFor`/`StateFor` can only
// extract a useful type when the input is already a `StoreWithState`.
function makeStore() {
  const raw = configureStore({reducer: {redux: reduxSlice.reducer}});
  return raw as unknown as StoreWithState<
    typeof raw,
    {redux: {reducerCount: number}}
  >;
}

type RootStore = ReturnType<typeof makeStore>;

describe('injectSlices', () => {
  let store: RootStore;
  beforeEach(() => {
    store = makeStore();
  });

  it('places each slice under its name and keeps the built-in redux slice', () => {
    const injected = injectSlices([sliceA, sliceB] as const, store);

    const state = injected.getState();
    expect(state.a).toEqual({value: 0});
    expect(state.b).toEqual({label: 'none'});
    expect(state.redux).toEqual({reducerCount: 0});
  });

  it('dispatches reach the injected slices', () => {
    const injected = injectSlices([sliceA, sliceB] as const, store);

    injected.dispatch(sliceA.actions.setA(42));
    injected.dispatch(sliceB.actions.setB('hello'));

    const state = injected.getState();
    expect(state.a.value).toBe(42);
    expect(state.b.label).toBe('hello');
  });

  it('preserves existing slice state when injecting another slice later', () => {
    const withA = injectSlices([sliceA] as const, store);
    withA.dispatch(sliceA.actions.setA(7));
    expect(withA.getState().a.value).toBe(7);

    const withAB = injectSlices([sliceB] as const, withA);
    // sliceA's state survives the replaceReducer call
    expect(withAB.getState().a.value).toBe(7);
    // newly added slice gets its initial state
    expect(withAB.getState().b).toEqual({label: 'none'});
  });

  it('built-in redux slice keeps responding to actions after injection', () => {
    const injected = injectSlices([sliceA] as const, store);
    injected.dispatch(incrementCount());
    injected.dispatch(incrementCount());
    expect(injected.getState().redux.reducerCount).toBe(2);
  });

  it('re-injecting a slice replaces its reducer without dropping siblings', () => {
    const withAB = injectSlices([sliceA, sliceB] as const, store);
    withAB.dispatch(sliceA.actions.setA(11));
    withAB.dispatch(sliceB.actions.setB('keep me'));

    // Re-inject sliceA alongside a new sliceC. sliceB's reducer must remain
    // wired up (asyncReducers carries it forward) so its state survives.
    const withABC = injectSlices([sliceA, sliceC] as const, withAB);

    expect(withABC.getState().b).toEqual({label: 'keep me'});
    expect(withABC.getState().c).toEqual({count: 0});

    // And sliceA still responds — its reducer reference was replaced but
    // identity doesn't matter, only that dispatches still mutate state.
    withABC.dispatch(sliceC.actions.bumpC());
    expect(withABC.getState().c.count).toBe(1);
    expect(withABC.getState().a.value).toBe(11);
  });

  it('injectSlice is sugar for the multi-slice form', () => {
    const injected = injectSlice(sliceA, store);
    injected.dispatch(sliceA.actions.setA(3));
    expect(injected.getState().a.value).toBe(3);
  });
});

// Compile-time pins for the type-level surface. These don't exercise runtime
// behavior — they fail at typecheck if the generic resolutions drift. The
// hazard they guard against is `SlicesState` silently collapsing (e.g. to
// `unknown` or `Record<string, ...>`) when someone re-tightens the constraint
// or simplifies the structural extraction. Downstream packages would still
// build but lose their per-slice keys.
describe('redux module type surface', () => {
  // The `{} as T` casts let us pin generic resolutions without constructing
  // real values; only the type position matters to `expectTypeOf`.
  it('SlicesState maps a tuple of literal-named slices to per-key state', () => {
    expectTypeOf(
      {} as SlicesState<[typeof sliceA, typeof sliceB]>,
    ).branded.toEqualTypeOf<{
      a: {value: number};
      b: {label: string};
    }>();
  });

  it('SlicesState composes with the built-in redux slice', () => {
    expectTypeOf(
      {} as SlicesState<[typeof reduxSlice, typeof sliceA]>,
    ).branded.toEqualTypeOf<{
      redux: {reducerCount: number};
      a: {value: number};
    }>();
  });

  it('MockStore exposes the combined state via getState', () => {
    type S = MockStore<[typeof sliceA, typeof sliceB]>;
    expectTypeOf({} as ReturnType<S['getState']>).branded.toEqualTypeOf<{
      a: {value: number};
      b: {label: string};
    }>();
  });

  it('StateFor extracts the state shape from a MockStore', () => {
    type S = MockStore<[typeof sliceA, typeof sliceB]>;
    expectTypeOf({} as StateFor<S>).branded.toEqualTypeOf<{
      a: {value: number};
      b: {label: string};
    }>();
  });

  it('injectSlices return widens the store state with the new slices', () => {
    const fresh = configureStore({
      reducer: {redux: reduxSlice.reducer},
    }) as unknown as StoreWithState<
      ReturnType<typeof configureStore>,
      {redux: {reducerCount: number}}
    >;
    const injected = injectSlices([sliceA, sliceB] as const, fresh);
    expectTypeOf(injected.getState()).branded.toEqualTypeOf<{
      redux: {reducerCount: number};
      a: {value: number};
      b: {label: string};
    }>();
  });
});
