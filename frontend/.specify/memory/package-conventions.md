---
name: Frontend Package Conventions
description: Authoritative conventions for creating and maintaining packages in frontend/packages/. Covers package.json metadata, scripts, exports, TypeScript config, Vite build, ESLint, lint-staged, testing, .gitignore, Turborepo integration, and documentation. Distinguishes Standard Package vs Lab rules where they differ.
type: reference
---

## Glossary

- **Standard Package**: A directory under `frontend/packages/` (excluding `labs/`) registered
  as a Turborepo workspace package. Exports granular named entry points consumed by Host
  Applications.
- **Lab**: A directory under `frontend/packages/labs/` registered as a Turborepo workspace
  package. Exports a single root `App` component, runs standalone, and is embedded in a Host
  Application as a self-contained unit.
- **Host Application**: A consumer of packages — either the root `apps/` (webpack 5 React app)
  or `frontend/apps/studio` (Vite/Code Studio).
- **Entry Point**: A module path exported from a package's `exports` field in `package.json`.
- **Externalized Dependency**: A runtime dependency not bundled into package output; must be
  provided by the Host Application.
- **Lint Config Package**: `@code-dot-org/lint-config` — provides all shared ESLint, Prettier,
  Stylelint, lint-staged, and TypeScript base configurations.
- **`tsconfig.vite.app.json`**: Shared TypeScript config for browser-targeting Vite library
  packages; extends `@tsconfig/vite-react`.
- **`tsconfig.vite.node.json`**: Shared TypeScript config for `vite.config.ts` files; targets
  Node/ESNext.

---

## 1. `package.json` Metadata

Every package SHALL set:

- `"name"`: `"@code-dot-org/<package-name>"`
- `"version"`: `"0.0.0"` (fixed; packages are not published)
- `"private": true`
- `"license"`: `"SEE LICENSE IN LICENSE"`
- `"type"`: `"module"`
- `"keywords"`: array with at least one relevant term
- `"engines"`: `{"node": ">=20"}`
- `"homepage"`: `"https://github.com/code-dot-org/code-dot-org/blob/staging/frontend/packages/<package-name>/#readme"`
- `"bugs"`: `{"url": "https://github.com/code-dot-org/code-dot-org/issues"}`
- `"repository"`:
  ```json
  {
    "type": "git",
    "url": "git+https://github.com/code-dot-org/code-dot-org.git",
    "directory": "frontend/packages/<package-name>"
  }
  ```
  Labs use `"directory": "frontend/packages/labs/<package-name>"`.

## 2. `package.json` Scripts

Every package SHALL include:

```json
{
  "build":        "vite build",
  "typecheck":    "tsc --noEmit",
  "lint":         "eslint .",
  "lint:fix":     "eslint --fix .",
  "prettier":     "prettier --check .",
  "prettier:fix": "prettier --write .",
  "test":         "vitest --run",
  "clean":        "rimraf dist .turbo"
}
```

Packages with CSS/SCSS additionally include:

```json
{
  "stylelint":     "stylelint src/**/*.{css,scss,sass}",
  "stylelint:fix": "yarn run stylelint --fix"
}
```

**Standard packages**: `"dev": "vite build --watch"` or `"dev": "vite"` if a dev server is
needed (optional).

**Labs**: `"dev"` and `"preview"` are both required:

```json
{
  "dev":     "vite",
  "preview": "vite preview"
}
```

## 3. `package.json` Prettier and Stylelint Config

- `"prettier"` field: `"@code-dot-org/lint-config/prettier/index.mjs"`
- `"stylelint"` field (CSS/SCSS packages only):
  ```json
  {"extends": "@code-dot-org/lint-config/stylelint/index.mjs"}
  ```

## 4. `package.json` Exports

**Standard packages** — root entry point plus additional named entry points:

```json
{
  "exports": {
    ".": {
      "types":   "./dist/index.d.ts",
      "import":  "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

Additional entry points (e.g. `"./adapters/analytics"`) follow the same
`types` / `import` / `require` pattern. CSS outputs export directly:

```json
"./button/index.css": "./dist/button/index.css"
```

**Labs** — single root `App` export with types:

```json
{
  "exports": {
    ".": {
      "types":   "./dist/App.d.ts",
      "import":  "./dist/App.js",
      "require": "./dist/App.cjs"
    }
  }
}
```

## 5. `package.json` Dependencies

- Runtime deps the Host Application must supply → `peerDependencies` (and externalized in Vite)
- Build tools, type definitions, test frameworks, linting tools → `devDependencies` only
- Shared devDependency versions → `catalog:` specifier where a catalog entry exists in
  `frontend/package.json` (e.g. `"vite": "catalog:"`, `"typescript": "catalog:"`)
- Internal workspace packages → `"workspace:*"` (e.g. `"@code-dot-org/lint-config": "workspace:*"`)
- Every package MUST declare `@code-dot-org/lint-config` as a `devDependency`

## 6. TypeScript Configuration

Split-tsconfig structure (required for all Vite packages):

- `tsconfig.json` — root file:
  ```json
  { "files": [], "references": [{"path": "./tsconfig.app.json"}, {"path": "./tsconfig.node.json"}] }
  ```
- `tsconfig.app.json` — extends `@code-dot-org/lint-config/typescript/tsconfig.vite.app.json`,
  `"baseUrl": "."`, `"include": ["src"]` (add `"types"` if an ambient `types/` dir exists)
- `tsconfig.node.json` — extends `@code-dot-org/lint-config/typescript/tsconfig.vite.node.json`,
  `"baseUrl": "."`, `"include": ["vite.config.ts"]`

Non-React packages MAY use a single `tsconfig.json` (see `@code-dot-org/core`).

No package SHALL define `compilerOptions` that conflict with shared base configs without a
documented reason.

## 7. Vite Build Configuration (`vite.config.ts`)

**Standard packages** use Vite in library mode with:

- `vite-plugin-externalize-deps` to externalize all runtime dependencies
- `vite-plugin-dts`:
  ```ts
  dts({
    tsconfigPath: './tsconfig.app.json',
    rollupTypes: false,
    entryRoot: 'src',
    insertTypesEntry: false,
    exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
  })
  ```
- Dual ESM + CJS outputs via shared `getRollupOutputConfig` helper:
  ```ts
  function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
    return {
      format,
      exports: 'auto',
      entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
    };
  }
  // rollupOptions.output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')]
  ```
- `build.sourcemap: true`, `build.cssCodeSplit: true`
- `resolve.alias`: `{'@': path.resolve(__dirname, './src')}`
- React packages: `@vitejs/plugin-react` as the first plugin
- CSS-module packages: `vite-plugin-lib-inject-css` + custom `assetFileNames`

**Labs** use Vite in library mode with a single App entry and standalone dev server:

- Same `vite-plugin-externalize-deps` and `vite-plugin-dts` setup as standard packages
- Single entry point and direct format declaration (no `getRollupOutputConfig`):
  ```ts
  build: {
    lib: {
      entry: ['src/App.tsx'],
      name: '<lab-name>',
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
  }
  ```
- Standalone dev server with allowed host:
  ```ts
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  }
  ```
- `resolve.alias`: `{'@': path.resolve(__dirname, './src')}`
- `@vitejs/plugin-react` as the first plugin

## 8. ESLint Configuration (`eslint.config.mjs`)

Every package MUST have an `eslint.config.mjs` at the package root that:

- Ignores `dist/*` via `globalIgnores(['dist/*'])`
- Extends the appropriate config from `@code-dot-org/lint-config`:
  - React packages → `eslint/react.mjs`
  - Non-React browser packages → `eslint/base.mjs`
  - Node/build-tooling packages → `eslint/node.mjs`
- Does NOT include `eslint/jest.mjs` for Vitest packages

Available configs:

| Config | Contents |
|--------|----------|
| `eslint/base.mjs` | JS + TS + import ordering (browser + Node globals) |
| `eslint/react.mjs` | extends `base.mjs`, adds React, JSX-a11y, browser globals |
| `eslint/node.mjs` | extends `base.mjs`, adds Node globals |
| `eslint/jest.mjs` | Jest plugin rules scoped to `**/*.test.tsx` |

## 9. Lint-Staged Configuration (`.lintstagedrc.mjs`)

Every package MUST have a `.lintstagedrc.mjs`:

```js
import baseConfig from '@code-dot-org/lint-config/lint-staged/lintstagedrc.mjs';
export default baseConfig;
```

The base config runs ESLint + Prettier on `*.{js,cjs,mjs,ts,jsx,tsx,json,md}` and
Stylelint + Prettier on `*.{css,sass,scss}`.

## 10. Testing Configuration

All packages use **Vitest** for unit tests:

- Every package MUST have a `vitest.config.ts` with at minimum:
  ```ts
  export default { test: { globals: true } }
  ```
- Tests co-located under `src/<feature>/__tests__/`
- `"test"` script MUST run `vitest --run` (non-watch, CI-compatible)
- Exception: `@code-dot-org/component-library` uses Jest for legacy reasons
- Public design system components MUST have Storybook stories with Applitools Eyes visual
  snapshot tests in CI; snapshots MUST be updated when component appearance changes

**Labs additionally** require UI tests that run independently of the Host Application and
backend. UI tests exercise the lab via its standalone dev server (`yarn dev` /
`yarn preview`) and MUST NOT depend on any backend service or the full studio application.
UI test framework: TBD (leaning toward Playwright).

## 11. `.gitignore`

Every package MUST have a `.gitignore` excluding at minimum:

```
node_modules
dist
dist-ssr
*.local
.DS_Store
.vscode/*
.idea
tmp
*.log
```

## 12. Turborepo Integration

- Scripts MUST include `build`, `test`, `lint`, `typecheck`, `prettier`, and `clean` so all
  Turborepo tasks in `frontend/turbo.json` can invoke them
- `build` task output MUST be `dist/**` (matches `"outputs": ["dist/**"]` in `turbo.json`)
- Standard packages MUST be reachable from the `"packages/*"` workspace glob
- Labs MUST be reachable from the `"packages/labs/*"` workspace glob

## 13. Documentation

Every package MUST have a `README.md` covering:

- Purpose and package name
- Installation / linking instructions
- Key exports and usage examples
- Which `tsconfig`, ESLint config, and Prettier config the package uses

Packages that support extension by other engineers MUST include a `CONTRIBUTING.md` or an
"Adding new functionality" section describing how to add new modules or adapters.

**Labs additionally** MUST document:

- How to run the lab standalone (`yarn dev`, `yarn preview`)
- How to run UI tests independently
