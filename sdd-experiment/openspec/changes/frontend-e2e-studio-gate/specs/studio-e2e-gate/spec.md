# Spec: studio-e2e-gate

## ADDED Requirements

### Requirement: Studio shell is browser-verified on PRs

Studio CI SHALL run a hermetic Playwright smoke suite (MSW mode, no
Rails, no deployed environment, no secrets) as a required check whenever
`frontend/apps/studio/**`, `frontend/packages/core/**`, or the workspace
scaffold changes. The suite MUST cover: shell render at the basepath,
lazy lab-chunk load with fixture-scenario activation, router 404 for an
unregistered lab, and the signed-out auth outcome.

#### Scenario: Route tree regression

- **WHEN** a PR breaks the root route render (blank shell)
- **THEN** the studio smoke job fails the PR before merge

#### Scenario: Core transport regression

- **WHEN** a `packages/core` change breaks the client the shell's auth
  fetch uses
- **THEN** the studio smoke job runs (core is in its path filter) and
  fails

### Requirement: Smoke pages log clean

The smoke suite SHALL assert zero unexpected console errors on every
page it visits, with an explicit, reviewed allow-list if any expected
noise exists.

#### Scenario: New console error introduced

- **WHEN** a change introduces a console error on shell boot
- **THEN** the smoke suite fails naming the message

### Requirement: e2e tags and lane docs are truthful

`packages/e2e-tests` SHALL carry no tag that filters nothing
(`@no_mobile` without a mobile project, `@no_ci` applied to zero specs):
each is implemented or removed, and the README SHALL state per lane
(GHA / Drone / DTT) what code it sees and whether it blocks.

#### Scenario: Contributor reads the README

- **WHEN** a contributor asks "does a failing Playwright spec block my
  PR?"
- **THEN** the README answers per lane without reading CI configs
