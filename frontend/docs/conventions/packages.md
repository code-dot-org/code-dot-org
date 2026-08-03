# Frontend Package Conventions

Applies to all packages under `frontend/packages/` and `frontend/packages/labs/`.

Labs (`packages/labs/*`) are standalone React apps that render a curriculum experience.
Libraries (`packages/*`) are shared utilities consumed by labs and Studio.

**Scaffolded by:** `yarn turbo gen package` (library) or `yarn turbo gen lab` (lab)

Run from `frontend/`. The generator creates all scaffold files and, for labs,
also registers the lab in Studio.

> **Convention coupling:** `turbo/generators/config.ts` and this file are tightly
> coupled. When you update a generator template, update this file too, and vice
> versa. See `AGENTS.md` at the `frontend/` root for the enforcement rule.

## Why

Each package is independently buildable, testable, and publishable. This lets
the Turborepo cache skip unchanged packages and keeps dependency graphs explicit.
Conventions below exist to make that isolation real — not just a folder boundary.

## Package docs structure

```
packages/<name>/
  README.md          # purpose, public API surface, usage example
  docs/
    architecture.md  # data flow, key decisions, constraints — update when design changes
```

`architecture.md` is optional for trivial packages. Write it when the package
has non-obvious data flow, stateful services, or significant constraints.

## package.json

- `name`: `@code-dot-org/<package-name>`
- `version`: `0.0.0` (managed by Turborepo/Changesets, never edit manually)
- `private`: `true` for internal packages not published to npm
- External dependencies (`react`, `uuid`, etc.) → `peerDependencies` + `devDependencies`, never `dependencies`
- In `devDependencies`, take shared versions from the catalog (`"react": "catalog:"`) rather than an explicit range. React in particular is pinned to 18.x there because `apps/` portals require one shared instance; a hardcoded 19.x range reintroduces the duplicate-React hooks failures the pin exists to prevent. See `.yarnrc.yml` for when to add a catalog entry
- Do not add `"type": "module"` — it breaks the legacy `apps/` webpack bundle

## Vite config

- Use `vite-plugin-externalize-deps` to exclude all peer deps from the bundle
- Set `preserveModules: true` for dual ESM+CJS output (tree-shakeable)
- Labs use a standard app config (no `preserveModules`); libraries use library mode

## TypeScript config

- Extend the appropriate preset from `@code-dot-org/lint-config/typescript/` (e.g. `tsconfig.vite.app.json` for Vite apps, `tsconfig.node22.json` for Node tooling)
- Set `composite: true` and `declarationMap: true` for project references
- `paths` aliases: declare in `tsconfig.json`, mirror in `vite.config.ts` resolve.alias

## ESLint config

- Each package has its own `eslint.config.mjs` extending `@code-dot-org/lint-config`
- No shared root ESLint config in `frontend/`
- Choose the preset that matches the package type:
  - React apps and component libraries → `@code-dot-org/lint-config/eslint/react.mjs`
  - Node.js tooling or config-only packages → `@code-dot-org/lint-config/eslint/node.mjs`
  - Vitest test files → add `@code-dot-org/lint-config/eslint/vitest.mjs` as an overlay

```js
// eslint.config.mjs — React package
import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import {globalIgnores} from 'eslint/config';

export default [globalIgnores(['dist']), ...cdoReactConfig];
```

## Stylelint config

Stylelint is wired through `package.json`, not a separate config file — a
`stylelint` key extending the shared config, plus the scripts that Turborepo's
`lint` task depends on. Without the `stylelint` script, `turbo lint` has nothing
to run and a package's CSS/SCSS goes unchecked:

```json
{
  "scripts": {
    "stylelint": "stylelint --allow-empty-input \"src/**/*.{css,scss,sass}\"",
    "stylelint:fix": "yarn run stylelint --fix"
  },
  "stylelint": {"extends": "@code-dot-org/lint-config/stylelint/index.mjs"}
}
```

Two details matter. Quote the glob: Yarn's shell expands an unquoted one itself
and aborts with `No matches found` when a package has no stylesheets, so let
stylelint do the expanding. And `--allow-empty-input` keeps the gate green in
that no-stylesheet case, which lets the wiring ship with the scaffold and start
working the moment the first `.scss` file lands.

## Testing

- Use Vitest (not Jest — Jest is for the legacy `apps/` bundle)
- Test files: `src/**/__tests__/*.test.ts` or `*.test.tsx`
- React + jsdom packages extend the shared base from `@code-dot-org/lint-config/vitest/react.mjs` (re-export, or merge with `mergeConfig` to add overrides like `setupFiles` or `resolve.alias`). Both generators scaffold this base, so component tests run without further setup

## Lint-staged

- Each package has its own `.lintstagedrc.mjs` extending the shared config from `@code-dot-org/lint-config`

```js
// .lintstagedrc.mjs
import baseConfig from '@code-dot-org/lint-config/lint-staged/lintstagedrc.mjs';
export default baseConfig;
```

## Labs

Labs (`packages/labs/*`) are standalone React apps that are also consumed as lazy-loaded chunks by Studio. Use `frontend/packages/labs/music/` as the reference implementation when scaffolding a new lab.

### Scaffolding a new lab

Run from `frontend/`:

```bash
yarn turbo gen lab
```

The generator creates all scaffold files and automatically registers the lab
in Studio:

- `apps/studio/src/modules/labs/config/labs.ts` — adds the lab key
- `apps/studio/src/modules/labs/router/getLabEntrypoint.ts` — adds the lazy
  component import
- `apps/studio/src/modules/labs/router/getLabFixtures.ts` — adds the MSW
  fixtures loader
- `apps/studio/package.json` — adds the workspace dependency

The generator also prompts for an optional CODEOWNERS entry (blank to skip);
when given, it appends an owner line for `frontend/packages/labs/<name>/` to
`.github/CODEOWNERS`.

The lab is then reachable at `/app/projects/<name>/:channelId/edit`.

### Mock fixtures (MSW mode)

The generator scaffolds a seed `src/fixtures/{simple.ts,index.ts}` and wires
the lab into Studio's MSW loader. When Studio runs with `VITE_API_MODE=msw`
(no Rails), `:channelId` doubles as the _fixture tag_ —
`/app/projects/<lab>/simple/edit` activates the `simple` scenario,
`/app/projects/<lab>/complex/edit` would activate `complex`, and so on.

The seed barrel looks like:

```ts
// src/fixtures/index.ts
import type {LabFixtures} from '@code-dot-org/core/api/mocks';
import simple from './simple';

export const MyLabFixtures: LabFixtures = {simple};
```

Each fixture is a `LabFixture` (channel, sources, levelProperties, theme —
all optional). Add per-tag files (`complex.ts`, `error.ts`, …) and reference
them from the barrel as the lab grows.

The lab's `package.json` `./mocks` subpath and `vite.config.ts`
`lib.entry: {index, 'fixtures/index'}` are part of the scaffold so the
fixtures emit as `dist/fixtures/index.*` at build time.

If a lab has no MSW story, delete `src/fixtures/` and remove the lab's
entry from `getLabFixtures.ts`. MSW mode still works against the lab; the
handlers fall back to a generic default channel, empty sources, an empty
levelProperties map, and so on.

See `packages/core/src/api/mocks/README.md` for the handler/registry model
and the `scenarioStore` write-through behavior.

### Standalone dev server

Each lab has an `index.html` + `src/main.tsx` for running outside Studio. `main.tsx` shall call `initializeCore({plugins: [...]})` before mounting, mirroring what Studio's entrypoint does:

```tsx
// src/main.tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';

import App from './App.tsx';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

The standalone `index.html` shall include a development-safe
`<meta name="app-config" content='{"observability":{"provider":"none"}}' />`
stub so observability-enabled labs initialize cleanly outside Rails.

### End-to-end tests

Each lab is generated with a Playwright e2e suite:

- `playwright.config.ts` — Chromium functional project (`@visual` excluded) plus
  `visualProjects()` from `@code-dot-org/playwright-support`; auto-starts
  `yarn dev`, `TARGET_URL` env override for remote targets
- `e2e/poms/LabPage.ts` — base Page Object (heading locator + `goto`/`load`); extend per feature
- `e2e/smoke.spec.ts` — verifies the root heading renders and no unhandled JS errors occur on load
- `e2e/fixtures/visual.ts` — `createVisualTest({appName})`; the `test`/`expect` that `@visual` specs import
- `e2e/visual.spec.ts` — a seed `@visual` checkpoint of the initial render

Run locally: `yarn test:ui` (functional only; reuses an already-running `yarn dev` at port 5173).
Run in CI: `yarn test:ui:ci` (spins up its own server via `webServer`).

Visual regression rides on `@code-dot-org/playwright-support`: writing a
`visualCheck()` is the only opt-in. No baselines are committed —
`yarn test:visual:prove` checks determinism locally against ephemeral
snapshots, and CI diffs against Applitools. Visual projects are chromium-only
by default; widen with `visualProjects({browsers})`.

The generator also creates `.github/workflows/<name>-ci.yml` (two jobs: `build`
via `turbo release:dryrun` and `e2e` via Playwright in the pinned container, with
`VISUAL_PROVIDER=applitools` + `APPLITOOLS_API_KEY` so `@visual` tests diff against
Eyes) and updates `frontend-ci.yml` with a `paths-filter` output, filter entry,
conditional job (passing `playwright-image-tag`), and `teardown.needs` entry for
the new lab.

## Runtime config

Runtime values (API endpoints, feature flags, DSNs) come from `@code-dot-org/core`'s
`SiteConfig` — never `import.meta.env`. `import.meta.env` is build-time only and
produces different bundles per environment.
