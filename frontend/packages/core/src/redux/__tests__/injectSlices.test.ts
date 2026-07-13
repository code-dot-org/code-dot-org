/**
 * @vitest-environment jsdom
 */

import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction, ThunkAction, UnknownAction} from '@reduxjs/toolkit';
import {describe, expect, expectTypeOf, it, vi} from 'vitest';

import reduxSlice from '../reduxSlice';
import {injectSlices, storeHooks} from '../store';
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

// The app store is a singleton and injection accumulates in module state, so
// each runtime test imports a fresh copy of the module instead of creating a
// per-test store.
async function freshModule() {
  vi.resetModules();
  const store = await import('../store');
  const {setCount} = await import('../reduxSlice');
  return {...store, setCount};
}

describe('injectSlices', () => {
  it('places each slice under its name and keeps the built-in redux slice', async () => {
    const {injectSlices} = await freshModule();
    const injected = injectSlices([sliceA, sliceB] as const);

    const state = injected.getState();
    expect(state.a).toEqual({value: 0});
    expect(state.b).toEqual({label: 'none'});
    // The built-in slice tracks how many slices have been injected.
    expect(state.redux).toEqual({reducerCount: 2});
  });

  it('returns the app store itself', async () => {
    const mod = await freshModule();
    const injected = mod.injectSlices([sliceA] as const);
    // One store: injection widens the type, not the identity.
    expect(injected).toBe(mod.default);
  });

  it('dispatches reach the injected slices', async () => {
    const {injectSlices} = await freshModule();
    const injected = injectSlices([sliceA, sliceB] as const);

    injected.dispatch(sliceA.actions.setA(42));
    injected.dispatch(sliceB.actions.setB('hello'));

    const state = injected.getState();
    expect(state.a.value).toBe(42);
    expect(state.b.label).toBe('hello');
  });

  it('preserves existing slice state when injecting another slice later', async () => {
    const {injectSlices} = await freshModule();
    const withA = injectSlices([sliceA] as const);
    withA.dispatch(sliceA.actions.setA(7));
    expect(withA.getState().a.value).toBe(7);
    expect(withA.getState().redux.reducerCount).toBe(1);

    // Layering onto an already-widened store type supplies both type
    // arguments: the slices tuple, then the prior store type.
    const withAB = injectSlices<readonly [typeof sliceB], typeof withA>([
      sliceB,
    ] as const);
    // sliceA's state survives the later injection
    expect(withAB.getState().a.value).toBe(7);
    // newly added slice gets its initial state
    expect(withAB.getState().b).toEqual({label: 'none'});
    // and the count accumulates across calls
    expect(withAB.getState().redux.reducerCount).toBe(2);
  });

  it('built-in redux slice keeps responding to actions after injection', async () => {
    const {injectSlices, setCount} = await freshModule();
    const injected = injectSlices([sliceA] as const);
    injected.dispatch(setCount(41));
    expect(injected.getState().redux.reducerCount).toBe(41);
  });

  it('re-injecting a slice replaces its reducer without dropping siblings', async () => {
    const {injectSlices} = await freshModule();
    const withAB = injectSlices([sliceA, sliceB] as const);
    withAB.dispatch(sliceA.actions.setA(11));
    withAB.dispatch(sliceB.actions.setB('keep me'));

    // Re-inject sliceA alongside a new sliceC. sliceB's reducer must remain
    // wired up (the shared root reducer carries it forward) so its state
    // survives.
    const withABC = injectSlices<
      readonly [typeof sliceA, typeof sliceC],
      typeof withAB
    >([sliceA, sliceC] as const);

    expect(withABC.getState().b).toEqual({label: 'keep me'});
    expect(withABC.getState().c).toEqual({count: 0});

    // Re-injection doesn't double-count: a, b, c — not a, b, a, c.
    expect(withABC.getState().redux.reducerCount).toBe(3);

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
// build but lose their per-slice keys. They run against the statically
// imported module instance, separate from the runtime tests' fresh copies.
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

  it('injectSlices widens the store state, layering via explicit generics', () => {
    const injected = injectSlices([sliceA, sliceB] as const);
    expectTypeOf(injected.getState()).branded.toEqualTypeOf<{
      redux: {reducerCount: number};
      a: {value: number};
      b: {label: string};
    }>();

    const layered = injectSlices<readonly [typeof sliceC], typeof injected>([
      sliceC,
    ] as const);
    expectTypeOf(layered.getState()).branded.toEqualTypeOf<{
      redux: {reducerCount: number};
      a: {value: number};
      b: {label: string};
      c: {count: number};
    }>();
  });

  it('storeHooks derives hook typings from the given store type', () => {
    type Injected = MockStore<[typeof reduxSlice, typeof sliceA]>;
    const hooks = storeHooks<Injected>();
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
    type Injected = MockStore<[typeof reduxSlice, typeof sliceA]>;
    const hooks = storeHooks<Injected>();
    // A thunk typed against the *injected* state must be dispatchable —
    // TStore['dispatch'] alone would only accept thunks over the
    // pre-injection state.
    const thunk: ThunkAction<
      void,
      StateFor<Injected>,
      undefined,
      UnknownAction
    > = () => {};
    expectTypeOf(hooks.useAppDispatch).returns.toBeCallableWith(thunk);
  });
});
