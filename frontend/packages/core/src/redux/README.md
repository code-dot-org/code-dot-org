# Dynamic slice injection

One global redux store, assembled at runtime from slices that feature
packages own. The store starts with a single built-in bookkeeping slice;
everything else is injected by whoever needs it.

## The convention

- A feature package owns its slices and exports each slice (default export)
  plus its actions from a `./redux` sub-path:
  `@code-dot-org/users/redux`, `@code-dot-org/progress/redux`, and so on.
- A host — typically a lab's `redux/store.ts` — injects the slices it needs
  into the shared store and exports the result:

```ts
import {
  default as defaultStore,
  injectSlices,
  storeHooks,
} from '@code-dot-org/core/redux';
import {currentUserSlice} from '@code-dot-org/users/redux';

import mySlice from './mySlice';

const store = injectSlices([currentUserSlice, mySlice], defaultStore);

export const {useAppDispatch, useAppSelector} = storeHooks(store);
export default store;
```

`injectSlices` returns the same store object with `getState` widened to
include the injected slices. Hosts layer: a lab package can inject its slice
into the store exported by another host (music injects `musicSlice` into the
lab-base store) and the state type accumulates.

Do not use react-redux's bare `useSelector`/`useDispatch`, and do not export
globally typed hooks from a shared package — hooks typed anywhere other than
against the final store lie about the state shape. `storeHooks(store)` is the
one sanctioned way to get typed hooks.

## Typing across packages

A package that reads another package's slice state without building a store
types the expectation with `MockStore`:

```ts
import type {MockStore, StateFor} from '@code-dot-org/core/redux';
import type {currentUserSlice} from '@code-dot-org/users/redux';

import mySlice from './mySlice';

type Store = MockStore<[typeof mySlice, typeof currentUserSlice]>;
type RootState = StateFor<Store>;
```

Note the type-only import of the slice _value binding_ — `typeof` works on
it, so packages never need types-only sub-path exports for their slices.

## Mechanics

- The root reducer is a `combineSlices` reducer seeded with the built-in
  `redux` slice; `injectSlices` adds each slice's reducer under its `name`
  and calls `replaceReducer`, whose REPLACE dispatch materializes the new
  slice state immediately (bare `inject` defers it to the next action).
- The built-in slice records `reducerCount` — the number of distinct slices
  injected into that store — as a debugging surface.
- Slices are matched structurally (`{name, reducer, getInitialState}`), not
  as `Slice<...>`; see the `SliceLike` note in `store.ts` for why.

## Tests

`createInjectableStore()` returns a fresh, correctly typed store — use it
instead of casting a raw `configureStore` result. `injectSlices` also adopts
stores it has never seen (tracked weakly, keyed by store identity), so a
hand-built store still works.
