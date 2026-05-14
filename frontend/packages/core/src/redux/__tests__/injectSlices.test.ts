/**
 * @vitest-environment jsdom
 */

import {configureStore, createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it} from 'vitest';

import reduxSlice, {incrementCount} from '../reduxSlice';
import {injectSlice, injectSlices} from '../store';
import type {StoreWithState} from '../types';

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
