# lab-base

## ADDED Requirements

### Requirement: Lab shell provides level context
`@code-dot-org/lab` SHALL export a `Lab` component that, given a
`levelId` and a level-properties map, provides the current level's
properties to children via `useLevelProperties()`.

#### Scenario: Level context provided to children
- **WHEN** `Lab` renders with `levelId=29091` and a map containing
  that level
- **THEN** a child calling `useLevelProperties()` receives the
  properties for level 29091

#### Scenario: Level changes without shell remount
- **WHEN** the `levelId` prop changes to another level in the map
- **THEN** children re-render with the new properties and the shell
  providers are not remounted

### Requirement: Loading and error containment
The package SHALL render a loading state while level data is pending
and SHALL contain child render errors in an error boundary that
reports to the metrics reporter and shows a simple error state.

#### Scenario: Lab render error contained
- **WHEN** a child lab component throws during render
- **THEN** the simple error state is shown and the error is reported
  via `LabMetricsReporter`

### Requirement: Lifecycle events
The package SHALL export a `LifecycleNotifier` with
`LevelChangeRequested`, `LevelLoadStarted`, and `LevelLoadCompleted`
events and a subscribe/unsubscribe hook.

#### Scenario: Subscriber notified on level change
- **WHEN** the host begins loading a different level
- **THEN** `LevelLoadStarted` subscribers are invoked and
  unsubscribed components are not

### Requirement: Embeddable labs stay bare
`oceans-lab` SHALL NOT depend on `@code-dot-org/lab`; its framework
wiring SHALL live in Studio-side adapters. The restriction SHALL be
enforced by an ESLint import rule in the lab's lint config.

#### Scenario: Oceans published artifact unchanged
- **WHEN** `packages/labs/oceans` is built after this change
- **THEN** its dependency set and dist output are unchanged

#### Scenario: Forbidden import fails lint
- **WHEN** a file under `packages/labs/oceans/src` imports from
  `@code-dot-org/lab`
- **THEN** `yarn lint` for the package fails on that import
