# Spec: frontend-generator-conformance

## ADDED Requirements

### Requirement: Templates conform to the catalog

Generator templates SHALL declare every catalog-managed dependency
(react, react-dom, their types, and any other `.yarnrc.yml` catalog
entry) as `catalog:`, and SHALL NOT advertise peer ranges no shipped
package supports. A generated package's dependency declarations MUST
match the pattern used by the reference implementations
(`packages/labs/music`, `packages/core`).

#### Scenario: Fresh lab in a React 18 workspace

- **WHEN** `yarn turbo gen lab` runs and `yarn install` completes
- **THEN** exactly one React major version (the catalog's) resolves in
  the workspace, and no second React instance is introduced

### Requirement: Registration edits are verified

The lab generator SHALL assert, after generation, that all four
studio-registration edits landed (`labs.ts`, `getLabEntrypoint.ts`,
`getLabFixtures.ts`, `apps/studio/package.json`), and SHALL fail the
generation run loudly when any edit did not apply. Silent partial
registration (today's regex no-op → runtime `notFound()`) MUST NOT be
possible.

#### Scenario: Insertion anchor missing

- **WHEN** a registration site has been refactored so the generator's
  anchor no longer matches
- **THEN** generation exits non-zero naming the file that failed, and no
  partial scaffold is left registered

### Requirement: Generator output is CI-checked

CI SHALL run both generators and verify the output builds, lints, and
matches the scaffold file list documented in
`docs/conventions/packages.md`, on every change to
`turbo/generators/**` or that doc. The AGENTS "tightly coupled" rule
becomes machine-checked.

#### Scenario: Template edited without doc update

- **WHEN** a PR changes a template's scaffold file set but not
  `packages.md`
- **THEN** the conformance job fails with the file-list diff
