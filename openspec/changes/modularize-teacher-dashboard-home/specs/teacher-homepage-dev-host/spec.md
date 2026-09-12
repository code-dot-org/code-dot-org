## ADDED Requirements

### Requirement: The home page runs standalone with zero backend
The package's standalone host SHALL boot the home page under
`VITE_API_MODE=msw` with no Rails, no database, and no network: providers
recreated locally, slices injected via `injectSlices`, `BrowserRouter` wrapping
moved `<Link>`s, MSW serving every endpoint the slice and components call.

#### Scenario: Cold start
- **WHEN** a contributor runs `VITE_API_MODE=msw yarn dev` in the package
- **THEN** the dev server starts in under two seconds and the home page renders
  seeded data with zero requests leaving MSW

### Requirement: Personas and pitfall states are seedable by name
The `./mocks` export SHALL provide named personas — `new-teacher`,
`established-teacher`, `archived-only`, `coteacher-invite-pending`,
`unverified-teacher`, `aita-enabled`, `demo-section-eligible`, `degraded` —
and named pitfall dimensions (promotions none/one/permanent/skeleton/dismissed/
stacked; drawer content/empty/error/slow plus NPS and demo popup; section-list
edges including provider-synced types, long names, large counts; alert
stacking), each fixing the host-contract flag set and usable from the dev-host
switcher, vitest, and Playwright alike.

#### Scenario: Switching personas
- **WHEN** the reviewer selects `coteacher-invite-pending` in the switcher
- **THEN** the page re-renders with the invite notification and its
  accept/decline flows working against MSW write-through

#### Scenario: Degraded endpoints
- **WHEN** the `degraded` persona makes drawer/tours/profile endpoints error or
  stall
- **THEN** the page still renders the section list, matching legacy tolerance
  of these enhancement endpoints failing
