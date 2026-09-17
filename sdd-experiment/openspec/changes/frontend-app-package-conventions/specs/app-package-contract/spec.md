# Spec: app-package-contract

## ADDED Requirements

### Requirement: App-shaped packages have a written contract

The conventions docs SHALL define the app-shaped package kind: page
components with typed props and host-owned URL state (no router imports
in the package), peer-externalized React/MUI/core, API access through
the documented core client mechanism, a `./mocks` persona subpath, a
standalone dev shell with scenario selection, and a vitest+axe test
baseline. The contract MUST be as concrete as the existing lab
conventions (file lists, config snippets, reference package).

#### Scenario: Author starts an app-shaped feature

- **WHEN** an author consults `docs/conventions/` for a
  settings/dashboard-class feature
- **THEN** a documented package kind applies, with a scaffold command
  and a conformant reference package to copy

### Requirement: Host accommodation is bounded

The contract SHALL enumerate what integrating a package may require of
studio (route file, workspace dependency, documented providers) and
what it may not (host vite-config edits, host-side wrapper components,
manual style imports). A package needing more MUST change the
convention first, not accrete host shims.

#### Scenario: Package needs a bundler shim

- **WHEN** a package's dependency requires a define/polyfill in the
  host bundler config
- **THEN** the integration is rejected until the need is resolved
  package-side or the convention is explicitly amended

### Requirement: Personas ride the existing mock registry

App-package mock scenarios SHALL use core's fixture registry and
scenario store — the same machinery as lab fixtures — with persona
selection in the dev shell via query parameter. A second mock mechanism
MUST NOT be introduced for app packages.

#### Scenario: Running the dev shell as a teacher

- **WHEN** the standalone shell runs with the teacher persona selected
- **THEN** MSW serves the teacher scenario through the core registry,
  with no package-local interception layer

### Requirement: Generator scaffolds the contract

`yarn turbo gen app-package` SHALL scaffold a conformant package
(structure, mocks subpath, dev shell, test baseline) and pass the
generator-conformance CI check.

#### Scenario: Fresh app package builds

- **WHEN** the generator runs and `turbo build --filter` executes on the
  output
- **THEN** the scaffold builds, lints, and its file list matches the
  conventions doc
