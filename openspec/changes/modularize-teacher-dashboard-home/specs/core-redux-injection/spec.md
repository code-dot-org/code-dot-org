## ADDED Requirements

### Requirement: Package-owned slices inject into one app store
`@code-dot-org/core/redux` SHALL provide `injectSlices` operating on a single
`combineSlices`-seeded app store, such that feature packages own their slices
(default-exported, with actions, from a `./redux` subpath) and hosts inject the
slices they need, receiving the store with `getState` widened to include them.

#### Scenario: Host injects package slices
- **WHEN** a host calls `injectSlices([currentUserSlice, teacherSectionsSlice])`
- **THEN** the returned store's state includes both slices under their `name`
  keys, materialized immediately

#### Scenario: Layered injection widens an already-widened store
- **WHEN** a package injects its slice on top of a store type another host
  widened, supplying both type arguments explicitly
- **THEN** the resulting store type includes both the prior and the new slices

### Requirement: Typed hooks derive from the final store
The module SHALL provide `storeHooks<typeof store>()` returning `useAppDispatch`
and `useAppSelector` typed against the widened store, and SHALL provide
`MockStore`/`StateFor` so a package can type reads of another package's slice
state without building a store.

#### Scenario: Store-agnostic component reads state
- **WHEN** a component types its state via `MockStore<[typeof sliceA]>` and
  reads through context-based hooks
- **THEN** it renders correctly under any Provider whose store contains a slice
  of the same name and shape (the core injected store or the legacy apps store)

### Requirement: Injection is test-isolatable
Because the store is a module singleton, the module SHALL support per-test
isolation by re-importing a fresh copy (`vi.resetModules()` pattern), and its
own test suite SHALL cover injection, widening, and hook typing.

#### Scenario: Fresh module per test
- **WHEN** a test resets modules and re-imports `@code-dot-org/core/redux`
- **THEN** previously injected slices are absent from the new store
