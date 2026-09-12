## ADDED Requirements

### Requirement: The slice moves with state and behavior parity
`@code-dot-org/teacher-dashboard/redux` SHALL export the `teacherSections`
slice moved (`git mv`) from staging's
`apps/src/templates/teacherDashboard/teacherSectionsRedux.ts`, preserving the
slice name, state shape, action semantics, selectors, and thunk behavior so
that existing consumers observe no change.

#### Scenario: Verbatim move commit
- **WHEN** the move PR's first commit lands
- **THEN** the moved files are byte-identical to their staging sources and the
  commit message cites the source paths and SHA

#### Scenario: Reducer parity under either store
- **WHEN** the packaged reducer is registered in apps' legacy store under
  `teacherSections` or injected via `injectSlices`
- **THEN** dispatching the same actions yields the same state transitions

### Requirement: Slice HTTP goes through the core transport with pinned request shapes
All `$.ajax`/`fetch`/`HttpClient` call sites in the moved slice SHALL be
replaced by the core ky transport, preserving URL, method, body, and response
wire shapes exactly; CSRF SHALL be supplied by the transport on non-GET
requests after confirming the Rails controllers' CSRF semantics; jQuery SHALL
NOT be a dependency of the package.

#### Scenario: Request shapes pinned by tests
- **WHEN** a thunk issues a mutation
- **THEN** request-shape tests assert the exact URL, method, headers, and body
  against captured Rails fixtures, and reducers receive unchanged wire shapes

#### Scenario: Error paths keep semantics
- **WHEN** an endpoint returns the captured Rails error body
- **THEN** the thunk's failure handling produces the same state/user-visible
  outcome as the legacy `$.ajax`/`fetch` implementation

### Requirement: Apps consumes the slice back through a shim, with one copy
Apps SHALL re-register the packaged reducer via its existing `registerReducers`
and replace `teacherSectionsRedux.ts` with a one-line re-export of
`@code-dot-org/teacher-dashboard/redux`; the legacy copy SHALL be deleted in
the same PR so exactly one implementation exists.

#### Scenario: Existing apps importers unaffected
- **WHEN** any apps module imports from the old
  `templates/teacherDashboard/teacherSectionsRedux` path
- **THEN** it resolves through the shim to the packaged slice with identical
  exports and no behavior change
