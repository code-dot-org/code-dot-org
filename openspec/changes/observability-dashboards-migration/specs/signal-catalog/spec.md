# signal-catalog

## ADDED Requirements

### Requirement: Typed signal registry
The package SHALL export a typed registry of application telemetry signals, where each metric entry carries name, kind (counter, gauge, or timing), unit, dimensions, and owning area, and where log-attribute names and app slugs are enumerated as typed tables.

#### Scenario: Metric entry lookup
- **WHEN** a dashboard builder or emit site imports a metric by its catalog identifier
- **THEN** the identifier resolves to a single entry with name, kind, unit, and dimensions, and referencing a non-existent identifier fails typecheck

#### Scenario: Lab2 log attributes
- **WHEN** code needs the Lab2 structured log attribute names (appName, channelId, currentLevelId, scriptId)
- **THEN** the catalog provides them as the single source, with no hand-maintained copy in dashboard code

### Requirement: Importable from emit sites
The catalog SHALL be importable from `apps/src` emit sites through the existing frontend workspace linkage, without changing emitter runtime behavior.

#### Scenario: Emit site adopts a catalog constant
- **WHEN** an `apps/src` call site replaces a bare metric-name literal with the catalog constant
- **THEN** the emitted metric name is byte-identical to before and the change typechecks in the apps build

### Requirement: Catalog ships in the artifact
The build SHALL emit the catalog as `catalog.json` inside the published artifact so non-TypeScript consumers can read the signal inventory.

#### Scenario: JSON export matches registry
- **WHEN** the artifact is built
- **THEN** `catalog.json` contains every registry entry with its name, kind, unit, and dimensions

### Requirement: New signals register in the catalog
Dashboard builders SHALL accept only catalog entries for metric-backed panels, so a signal used by a dashboard MUST exist in the catalog.

#### Scenario: Builder rejects unregistered signal
- **WHEN** a dashboard source references a metric not present in the catalog
- **THEN** the package fails typecheck or its build fails, before any artifact is produced
