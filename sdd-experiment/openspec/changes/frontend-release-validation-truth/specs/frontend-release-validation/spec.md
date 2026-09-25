# Spec: frontend-release-validation

## ADDED Requirements

### Requirement: release:dryrun validates packaging

`yarn release:dryrun` SHALL, for every publishable (`private: false`)
package, verify packaging correctness beyond build+lint+test: every
`exports` subpath resolves in both ESM and CJS forms against the built
output, and the packed file list contains the built entries. A
publishable package whose manifest advertises unresolvable surface MUST
fail the command.

#### Scenario: Broken exports subpath

- **WHEN** a publishable package's `exports` names a path missing from
  `dist/`
- **THEN** `release:dryrun` fails naming the subpath

#### Scenario: Styles package exports

- **WHEN** the validation first runs against component-library-styles
- **THEN** it fails until the package declares an exports map covering
  its consumed file paths, and passes after

### Requirement: CI installs are immutable

Every CI lane that installs the frontend workspace SHALL use
`yarn install --immutable`. A PR whose lockfile does not match its
manifests MUST fail at install, on GHA exactly as on Drone/DTT.

#### Scenario: Drifted lockfile on GHA

- **WHEN** a PR adds a dependency without regenerating `yarn.lock`
- **THEN** the GHA setup action fails the job at install time

### Requirement: Cross-file pins are asserted

The Playwright container image tag used by workflows SHALL be asserted
against the catalog's playwright pin by a script that runs in CI. Pin
drift MUST fail before any Playwright job runs against a mismatched
browser build.

#### Scenario: Catalog bumped without image tag

- **WHEN** the catalog playwright version changes but a workflow's
  `PLAYWRIGHT_IMAGE_TAG` does not
- **THEN** CI fails with the two values named

### Requirement: Publish policy is explicit

The publishable packages SHALL carry a recorded publish mechanism:
either a CI workflow that performs the `release-it` publish with
auditable triggers, or README text stating publishing is manual and by
whom. An unstated, config-only publish path MUST NOT be the standing
state.

#### Scenario: Contributor needs a release

- **WHEN** a contributor asks how component-library alphas reach the
  registry
- **THEN** the repo answers (workflow or documented manual owner)
  without archaeology
