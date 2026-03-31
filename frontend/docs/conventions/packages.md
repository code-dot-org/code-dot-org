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
  - Jest test files → add `@code-dot-org/lint-config/eslint/jest.mjs` as an overlay

```js
// eslint.config.mjs — React package
import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import {globalIgnores} from 'eslint/config';

export default [globalIgnores(['dist']), ...cdoReactConfig];
```

## Stylelint config

- Packages with CSS/SCSS files shall have a `stylelint.config.mjs` extending the shared config:

```js
// stylelint.config.mjs
import cdoStylelint from '@code-dot-org/lint-config/stylelint/index.mjs';
export default cdoStylelint;
```

## Testing

- Use Vitest (not Jest — Jest is for the legacy `apps/` bundle)
- Test files: `src/**/__tests__/*.test.ts` or `*.test.tsx`

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

The generator creates all scaffold files and automatically registers the lab in
Studio (updates `labs.ts`, `getLabEntrypoint.ts`, and `apps/studio/package.json`).

The lab is then reachable at `/app/projects/<name>/:channelId/edit`.

### Standalone dev server

Each lab has an `index.html` + `src/main.tsx` for running outside Studio. `main.tsx` shall call `initializeCore({plugins: [...]})` before mounting, mirroring what Studio's entrypoint does:

```tsx
// src/main.tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/localization';
import {observabilityPlugin} from '@code-dot-org/core/observability';

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

## Runtime config

Runtime values (API endpoints, feature flags, DSNs) come from `@code-dot-org/core`'s
`SiteConfig` — never `import.meta.env`. `import.meta.env` is build-time only and
produces different bundles per environment.
