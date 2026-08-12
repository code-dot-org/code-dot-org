# @code-dot-org/lab

Host shell for Lab2 labs. Provides level context, error containment, and loading state so that lab packages (`@code-dot-org/oceans-lab`, etc.) can focus on their domain logic.

The package has no root export. It ships two subpaths that split the API along the host/lab boundary:

- `@code-dot-org/lab/host` — the shell a platform host (Studio, apps) wraps around a lab.
- `@code-dot-org/lab/contexts` — the hooks and types a lab reads to receive host-provided state.

A lab must import only from `/contexts`; importing `/host` from a lab is a circular dependency (the host wraps the lab) and is blocked by the shared lab ESLint config.

## Usage

Host (Studio) wraps the lab:

```tsx
import {Lab} from '@code-dot-org/lab/host';

<Lab levelId={activeLevelId} levelPropertiesMap={propertiesMap}>
  <LabEntrypoint onContinue={onContinue} />
</Lab>;
```

Lab reads its level properties:

```tsx
import {useLevelProperties} from '@code-dot-org/lab/contexts';

const levelProperties = useLevelProperties();
```

`Lab` owns:

- **Level context** — `useLevelProperties()` returns the properties object for the active level. Changing `levelId` updates the context without remounting the shell.
- **Error boundary** — catches render errors in the lab subtree and shows a fallback.
- **Loading** — displays a spinner while the lab chunk is in flight (via Suspense).
- **Metrics reporter** — `LabMetricsReporter` logs errors to the observability plugin.

## Exports

`@code-dot-org/lab/host`:

| Export               | Kind      | Purpose                                        |
| -------------------- | --------- | ---------------------------------------------- |
| `Lab`                | Component | Shell wrapper (level context + error boundary) |
| `ErrorBoundary`      | Component | Catches and displays render errors             |
| `Loading`            | Component | Spinner / loading indicator                    |
| `LabMetricsReporter` | Class     | Sends error events to observability            |

`@code-dot-org/lab/contexts`:

| Export               | Kind | Purpose                                                                                                  |
| -------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| `useLevelProperties` | Hook | Read the active level's properties (undefined off route)                                                 |
| `LevelPropertiesMap` | Type | Level-id → properties map, re-exported from `@code-dot-org/core` (`Record<string, LevelPropertiesBase>`) |

The shell never inspects the property values; a lab reads its slice via `useLevelProperties()` and narrows it. Lab-specific fields (e.g. a fish level's `mode`) reach the lab only when the app registers a level-kind schema with `registerLevelKindSchema`, since the base schema strips unknown keys.

## Architecture rules

- **Labs import `@code-dot-org/lab/contexts`; hosts import `@code-dot-org/lab/host`.** The host (Studio) is the only package that imports both a lab and `/host`. `@code-dot-org/lab` never imports a lab.
- **No store.** Level state is URL-driven (TanStack Router owns the active level). Labs that need persistent state (projects, redux slices) will add it in a future `platform/` layer, not here.
- Labs receive props from the host via `onContinue`, `useLevelProperties()`, and any lab-specific props the host passes through. They do not read the URL directly.

## Development

```bash
yarn turbo build --filter='@code-dot-org/lab'
yarn turbo test --filter='@code-dot-org/lab'
```
