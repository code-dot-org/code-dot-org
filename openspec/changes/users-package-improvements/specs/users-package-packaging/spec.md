# users-package-packaging

## ADDED Requirements

### Requirement: Package metadata names the package's real location

`package.json` `homepage` and `repository.directory` SHALL point at
`frontend/packages/users`, and the vite lib `name` SHALL match the package.

#### Scenario: Metadata inspection

- **WHEN** `package.json` and `vite.config.ts` are read
- **THEN** no reference to `frontend/packages/accounts` (or the lib name
  `accounts`) remains

### Requirement: Runtime imports are declared dependencies

Every module SHALL be declared in `dependencies` or `peerDependencies` if
`src/` imports it at runtime (dev host, tests, and fixtures excluded), so
`externalizeDeps()` treats it uniformly.

#### Scenario: md5

- **WHEN** `src/util/hashEmail.ts` imports `md5`
- **THEN** `md5` appears in `dependencies` (with `@types/md5` remaining a
  devDependency) and is externalized from the dist bundle like `tabbable`

### Requirement: One source for the teacher delete-warning legal copy

The education-records delete warning SHALL come from a single exported
constant, shared by the Account Actions section and the delete modal.

#### Scenario: Copy edit

- **WHEN** the warning text is changed at its definition
- **THEN** both the section and the modal render the updated text

### Requirement: Field-error keys are typed

The field-error map's keys SHALL be a union of the known server field names,
so an unknown key fails typecheck at both write sites (error mapping) and
read sites (`errors.fieldErrors.<key>`).

#### Scenario: Typo'd key

- **WHEN** a component reads `errors.fieldErrors.curent_password`
- **THEN** `tsc` reports an error

### Requirement: README reflects the package

The README SHALL list the actual fixture scenario set and describe the data
layer's location accurately.

#### Scenario: Scenario list

- **WHEN** a scenario tag is added to `USERS_SCENARIO_TAGS`
- **THEN** the README's persona list names it (checked in review; no
  automated enforcement)
