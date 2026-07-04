# Spec: frontend-docs-accuracy

## ADDED Requirements

### Requirement: Actionable doc statements match the tree

Workspace docs under `frontend/` SHALL contain no path, command, route
URL, export name, or API call that does not exist in the tree at merge
time. Specifically: no reference to `docs/conventions/tech.md` without the
file existing; no `/app/projects/…` route text; no
`DashboardApiClient.labs.*` or `.users.userPreference.*` examples; no
`httpTransport`/`createHttpTransport`/`fetch`/`rails` transport-mode
references; no `types.d.ts`/`apps/src/types/mui.d.ts` augmentation paths;
no "Jest" as the test runner for `frontend/packages/*`.

#### Scenario: New lab author follows the docs

- **WHEN** an author scaffolds a lab and opens the URL the conventions doc
  gives them
- **THEN** the URL resolves (no 404 from a stale `/app` prefix)

#### Scenario: Core README example compiles

- **WHEN** the core README's API example is pasted into a TS file in a
  consuming package
- **THEN** it typechecks against the shipped client surface

### Requirement: Aspirational content is labeled

READMEs in `frontend/packages/*` SHALL separate shipped surface from
planned surface under an explicit heading, so a reader can tell
Implemented from Aspirational without reading source. The users package
README is the first application.

#### Scenario: Reading the users README

- **WHEN** a reader checks whether `UsersSettingsPage` exists
- **THEN** the README places it under a "Planned" (or equivalent) heading
  until it ships

### Requirement: Structure listings are complete

`frontend/README.md` and `frontend/AGENTS.md` SHALL list every directory
present under `frontend/apps/`, `frontend/packages/`, and
`frontend/packages/labs/`, and disagree with each other on no package's
status.

#### Scenario: Auditing the workspace from the docs

- **WHEN** a reviewer diffs the AGENTS structure block against
  `ls frontend/apps frontend/packages frontend/packages/labs`
- **THEN** no tracked package is missing and studio carries one
  description across both files
