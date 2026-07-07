/**
 * @vitest-environment jsdom
 */

import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction, ThunkAction, UnknownAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, expectTypeOf, it} from 'vitest';

import reduxSlice, {setCount} from '../reduxSlice';
import {createInjectableStore, injectSlices, storeHooks} from '../store';
import type {MockStore, StateFor} from '../store';
import type {SlicesState} from '../types';

// Fixture slices stand in for real platform slices. They intentionally have
// dissimilar reducer shapes — the case a `Slice<any, any, string>` constraint
// would reject (its invariant `actions` map makes such slices unassignable to
// a common tuple type), which is why `injectSlices` matches structurally.

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

// A fresh store per test isolates *state*; the slice registry is shared
// module-wide (one root reducer), so tests must not assume absolute
// reducerCount values — counting has its own order-independent test below.
const makeStore = createInjectableStore;

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
    // The built-in slice is present; exact counting is pinned separately.
    expect(state.redux.reducerCount).toBeGreaterThanOrEqual(2);
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
    // sliceA's state survives the later injection
    expect(withAB.getState().a.value).toBe(7);
    // newly added slice gets its initial state
    expect(withAB.getState().b).toEqual({label: 'none'});
  });

  it('built-in redux slice keeps responding to actions after injection', () => {
    const injected = injectSlices([sliceA] as const, store);
    injected.dispatch(setCount(41));
    expect(injected.getState().redux.reducerCount).toBe(41);
  });

  it('fresh stores share the reducer registry with isolated state', () => {
    const first = injectSlices([sliceA] as const, makeStore());
    first.dispatch(sliceA.actions.setA(42));

    // A second store sees sliceA's reducer (shared root reducer) but not
    // the first store's state.
    const second = injectSlices([sliceA] as const, makeStore());
    expect(second.getState().a.value).toBe(0);
    expect(first.getState().a.value).toBe(42);
  });

  it('reducerCount tracks distinct slices injected app-wide', () => {
    // Injecting an empty tuple just syncs the count into this store,
    // giving an order-independent baseline.
    const before = injectSlices([] as const, makeStore()).getState().redux
      .reducerCount;

    const sliceX = createSlice({
      name: 'count-x',
      initialState: {v: 0},
      reducers: {},
    });
    const sliceY = createSlice({
      name: 'count-y',
      initialState: {v: 0},
      reducers: {},
    });

    const injected = injectSlices([sliceX, sliceY] as const, makeStore());
    expect(injected.getState().redux.reducerCount).toBe(before + 2);

    // Re-injection doesn't double-count.
    const again = injectSlices([sliceX] as const, makeStore());
    expect(again.getState().redux.reducerCount).toBe(before + 2);
  });

  it('re-injecting a slice replaces its reducer without dropping siblings', () => {
    const withAB = injectSlices([sliceA, sliceB] as const, store);
    withAB.dispatch(sliceA.actions.setA(11));
    withAB.dispatch(sliceB.actions.setB('keep me'));

    // Re-inject sliceA alongside a new sliceC. sliceB's reducer must remain
    // wired up (the store's combined reducer carries it forward) so its
    // state survives.
    const withABC = injectSlices([sliceA, sliceC] as const, withAB);

    expect(withABC.getState().b).toEqual({label: 'keep me'});
    expect(withABC.getState().c).toEqual({count: 0});

    // And sliceA still responds — its reducer reference was replaced but
    // identity doesn't matter, only that dispatches still mutate state.
    withABC.dispatch(sliceC.actions.bumpC());
    expect(withABC.getState().c.count).toBe(1);
    expect(withABC.getState().a.value).toBe(11);
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
    const injected = injectSlices([sliceA, sliceB] as const, makeStore());
    expectTypeOf(injected.getState()).branded.toEqualTypeOf<{
      redux: {reducerCount: number};
      a: {value: number};
      b: {label: string};
    }>();
  });

  it('storeHooks derives hook typings from the given store', () => {
    const injected = injectSlices([sliceA] as const, makeStore());
    const hooks = storeHooks(injected);
    // The selector's state parameter carries the injected shape.
    expectTypeOf(hooks.useAppSelector)
      .parameter(0)
      .parameter(0)
      .branded.toEqualTypeOf<{
        redux: {reducerCount: number};
        a: {value: number};
      }>();
  });

  it('storeHooks dispatch accepts thunks over the widened state', () => {
    const injected = injectSlices([sliceA] as const, makeStore());
    const hooks = storeHooks(injected);
    // A thunk typed against the *injected* state must be dispatchable —
    // TStore['dispatch'] alone would only accept thunks over the
    // pre-injection state.
    const thunk: ThunkAction<
      void,
      StateFor<typeof injected>,
      undefined,
      UnknownAction
    > = () => {};
    expectTypeOf(hooks.useAppDispatch).returns.toBeCallableWith(thunk);
  });
});
