# Dynamic slice injection

One global redux store, assembled at runtime from slices that feature
packages own. The store starts with a single built-in bookkeeping slice;
everything else is injected by whoever needs it.

## The convention

- A feature package owns its slices and exports each slice (default export)
  plus its actions from a `./redux` sub-path:
  `@code-dot-org/users/redux`, `@code-dot-org/progress/redux`, and so on.
- A host — typically a lab's `redux/store.ts` — injects the slices it needs
  and exports the widened store:

```ts
import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import {currentUserSlice} from '@code-dot-org/users/redux';

import mySlice from './mySlice';

const store = injectSlices([currentUserSlice, mySlice]);

export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();
export default store;
```

`injectSlices` operates on the app store — there is exactly one — and
returns it with `getState` widened to include the injected slices. Hosts
layer: a lab package injecting on top of a store type another host already
widened supplies both type arguments explicitly, slices tuple first:

```ts
import {default as labStore} from '@code-dot-org/lab/redux';

const store = injectSlices<[typeof musicSlice], typeof labStore>([musicSlice]);
```

Both type arguments are required in that form: TypeScript does not
partially infer type arguments, so a lone explicit store type would
silently collapse the slices tuple type instead of inferring it.

Do not use react-redux's bare `useSelector`/`useDispatch`, and do not export
globally typed hooks from a shared package — hooks typed anywhere other than
against the final store lie about the state shape. `storeHooks<typeof
store>()` is the one sanctioned way to get typed hooks.

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

- There is one root reducer and one store for the whole app. The reducer is
  a `combineSlices` reducer seeded with the built-in `redux` slice;
  `injectSlices` adds each slice's reducer under its `name`, then dispatches
  to materialize the new state immediately (bare `inject` defers it to the
  next action).
- The built-in slice records `reducerCount` — the number of distinct slices
  injected so far — as a debugging surface.
- Slices are matched structurally (`{name, reducer, getInitialState}`), not
  as `Slice<...>`; see the `SliceLike` note in `store.ts` for why.

## Tests

Injection accumulates in module state (the store is a singleton), so tests
isolate by importing a fresh copy of the module per test:

```ts
async function freshModule() {
  vi.resetModules();
  return await import('@code-dot-org/core/redux');
}
```

See `__tests__/injectSlices.test.ts` for the pattern.
