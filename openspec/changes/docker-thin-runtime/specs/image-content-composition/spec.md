# image-content-composition

## ADDED Requirements

### Requirement: Runtime composition excludes seed and static content
The default deployed `runtime` composition SHALL NOT contain the db-seed
layer (`dashboard/config/levels`, `config/scripts`, `config/scripts_json`),
the static layer, or node_modules/yarn build output. It MUST serve API and
ActiveJob workloads only.

#### Scenario: Thin image contents audited
- **WHEN** the `runtime` composition image is inspected
- **THEN** `dashboard/config/scripts`, `config/scripts_json`,
  `config/levels`, static-layer paths, and `node_modules` are absent

#### Scenario: Thin image boots and serves
- **WHEN** a container from the `runtime` composition starts against a
  seeded DB
- **THEN** `/health_check` returns 200 and a representative API endpoint
  responds

### Requirement: Seed composition adds the db-seed layer
A `seed` composition SHALL consist of the `runtime` composition plus the
db-seed content layer, and SHALL be able to run the DB seed rake tasks to
completion.

#### Scenario: Seed Job runs the seed image
- **WHEN** the helm `dashboardJob` runs the `seed` composition against an
  empty DB
- **THEN** seeding completes using in-image curriculum files, with no
  volume mounts supplying content

### Requirement: i18n content ships as a separate scratch layer
Locale content (`dashboard/config/locales` and related locale trees) SHALL
be built as a `FROM scratch` content layer and SHALL be included only in
prod-web-shaped compositions. Its COPY MUST be ordered so locale-only
changes do not invalidate code layers.

#### Scenario: Locale layer isolated from code changes
- **WHEN** only application code changes between two builds
- **THEN** the i18n layer is reused from cache and only code layers rebuild

#### Scenario: Prod-web image has full locales
- **WHEN** a prod-web composition image is inspected
- **THEN** non-en locale files are present under `dashboard/config/locales`

### Requirement: Non-prod-web compositions are en-only
The `runtime` and `seed` compositions and dev images SHALL carry only
`*en.yml` locale files, per the existing dockerignore negation.

#### Scenario: Thin image locale audit
- **WHEN** the `runtime` composition image is inspected
- **THEN** `dashboard/config/locales` contains `*en.yml` files and no other
  locales

### Requirement: Content-layer pattern is preserved
The build SHALL preserve the existing scratch content-layer artifacts
(static, pegasus, db-seed) and the skaffold `requires` graph; compositions
change only which layers they COPY. Every composition MUST pass a
boot-and-smoke check in CI.

#### Scenario: Composition smoke checks gate merge
- **WHEN** CI builds the `runtime`, `seed`, and prod-web compositions
- **THEN** each boots and answers `/health_check` plus a representative API
  request before the change merges
