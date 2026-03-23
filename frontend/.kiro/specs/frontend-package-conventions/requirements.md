# Requirements Document

## Introduction

This document captures the conventions for creating and maintaining packages in `frontend/packages/`. It serves as the authoritative reference for any new package added to the Turborepo workspace, ensuring consistency in structure, `package.json` metadata, build tooling, TypeScript configuration, linting, formatting, testing, and Turborepo integration across all packages.

Conventions are derived from analysis of the existing packages with full source: `@code-dot-org/core`, `@code-dot-org/component-library`, `@code-dot-org/component-library-styles`, `@code-dot-org/music-lab`, and `@code-dot-org/lint-config`.

## Glossary

- **Package**: A directory under `frontend/packages/` (or `frontend/packages/labs/`) registered as a Turborepo workspace package.
- **Host Application**: A consumer of a Package — either `apps/` (webpack 5) or `frontend/apps/studio` (Vite/Code Studio).
- **Entry Point**: A module path exported from a Package's `exports` field in `package.json`.
- **Externalized Dependency**: A runtime dependency that is not bundled into the Package output and must be provided by the Host Application.
- **Lint Config Package**: `@code-dot-org/lint-config` — the shared package at `frontend/packages/lint-config/` that provides all shared ESLint, Prettier, Stylelint, lint-staged, and TypeScript base configurations.
- **`tsconfig.vite.app.json`**: The shared TypeScript config for browser-targeting Vite library packages; extends `@tsconfig/vite-react`.
- **`tsconfig.vite.node.json`**: The shared TypeScript config for Vite config files (`vite.config.ts`); targets Node/ESNext.
- **`tsconfig.react.json`**: The shared TypeScript config for React packages not using Vite.
- **`tsconfig.node22.json`**: The shared TypeScript config for Node.js packages; extends `@tsconfig/node22`.

---

## Requirements

### Requirement 1: `package.json` Metadata

**User Story:** As a frontend engineer, I want every package's `package.json` to carry consistent metadata so that packages are discoverable, attributable, and correctly registered in the workspace.

#### Acceptance Criteria

1. Every Package SHALL set `"name"` to `"@code-dot-org/<package-name>"`.
2. Every Package SHALL set `"version"` to `"0.0.0"`.
3. Every Package SHALL set `"private": true`.
4. Every Package SHALL set `"license": "SEE LICENSE IN LICENSE"`.
5. Every Package SHALL set `"type": "module"`.
6. Every Package SHALL include a `"keywords"` array with at least one relevant term.
7. Every Package SHALL include a `"homepage"` field pointing to `"https://github.com/code-dot-org/code-dot-org/blob/staging/frontend/packages/<package-name>/#readme"`.
8. Every Package SHALL include a `"bugs"` field: `{"url": "https://github.com/code-dot-org/code-dot-org/issues"}`.
9. Every Package SHALL include a `"repository"` field:
   ```json
   {
     "type": "git",
     "url": "git+https://github.com/code-dot-org/code-dot-org.git",
     "directory": "frontend/packages/<package-name>"
   }
   ```
10. Every Package SHALL set `"engines": {"node": ">=20"}`.

### Requirement 2: `package.json` Scripts

**User Story:** As a frontend engineer, I want every package to expose a consistent set of npm scripts so that Turborepo tasks run uniformly across all packages.

#### Acceptance Criteria

1. Every Package SHALL include the following scripts:
   - `"build": "vite build && tsc --noEmit"` — builds the library and validates types.
   - `"typecheck": "tsc --noEmit"` — standalone type check without building.
   - `"lint": "eslint ."` — runs ESLint.
   - `"lint:fix": "eslint --fix ."` — auto-fixes ESLint issues.
   - `"prettier": "prettier --check ."` — checks formatting.
   - `"prettier:fix": "prettier --write ."` — auto-fixes formatting.
   - `"test": "vitest --run"` — runs tests once (non-watch mode for CI).
   - `"clean": "rimraf dist .turbo"` — removes build artifacts and Turborepo cache.
2. Packages with CSS/SCSS SHALL additionally include:
   - `"stylelint": "stylelint src/**/*.{css,scss,sass}"`.
   - `"stylelint:fix": "yarn run stylelint --fix"`.
3. Packages with a Vite dev server SHALL include `"dev": "vite build --watch"` or `"dev": "vite"` as appropriate.

### Requirement 3: `package.json` Prettier and Stylelint Configuration

**User Story:** As a frontend engineer, I want Prettier and Stylelint configured via `package.json` fields so that editors and tooling pick up the shared config automatically.

#### Acceptance Criteria

1. Every Package SHALL set the top-level `"prettier"` field to `"@code-dot-org/lint-config/prettier/index.mjs"`.
2. Every Package with CSS/SCSS SHALL set the top-level `"stylelint"` field to:
   ```json
   {"extends": "@code-dot-org/lint-config/stylelint/index.mjs"}
   ```

### Requirement 4: `package.json` Exports

**User Story:** As a frontend engineer, I want package exports declared explicitly so that Host Applications can import specific Entry Points without pulling in the entire package.

#### Acceptance Criteria

1. Every Package SHALL declare an `"exports"` field mapping each public Entry Point to its `types`, `import` (ESM `.mjs`), and `require` (CJS `.cjs` or `.js`) paths.
2. The root Entry Point SHALL be `"."` mapping to:
   ```json
   {
     "types": "./dist/index.d.ts",
     "import": "./dist/index.mjs",
     "require": "./dist/index.cjs"
   }
   ```
3. Additional Entry Points (e.g. `"./adapters/newrelic"`) SHALL follow the same `types` / `import` / `require` pattern pointing to their respective `dist/` paths.
4. Packages with CSS outputs SHALL additionally export CSS files directly (e.g. `"./button/index.css": "./dist/button/index.css"`).

### Requirement 5: `package.json` Dependencies

**User Story:** As a frontend engineer, I want dependencies declared correctly so that Host Applications provide runtime deps and the package does not accidentally bundle them.

#### Acceptance Criteria

1. Runtime dependencies that are Externalized Dependencies SHALL be declared in both `"dependencies"` (or `"peerDependencies"`) and listed as peer deps so Host Applications know to provide them.
2. Build tools, type definitions, test frameworks, and linting tools SHALL be declared in `"devDependencies"` only.
3. Shared devDependency versions SHALL use the `catalog:` specifier where a catalog entry exists in `frontend/package.json` (e.g. `"vite": "catalog:"`, `"typescript": "catalog:"`).
4. Internal workspace packages SHALL be referenced with `"workspace:*"` (e.g. `"@code-dot-org/lint-config": "workspace:*"`).
5. Every Package SHALL declare `@code-dot-org/lint-config` as a `devDependency`.

### Requirement 6: TypeScript Configuration

**User Story:** As a frontend engineer, I want TypeScript configured consistently across packages so that type checking is reliable and interoperable.

#### Acceptance Criteria

1. Every Package SHALL use a split tsconfig structure:
   - `tsconfig.json` — root file with `"files": []` and `"references"` pointing to `tsconfig.app.json` and `tsconfig.node.json`.
   - `tsconfig.app.json` — extends `@code-dot-org/lint-config/typescript/tsconfig.vite.app.json`, sets `"baseUrl": "."`, and `"include": ["src"]`.
   - `tsconfig.node.json` — extends `@code-dot-org/lint-config/typescript/tsconfig.vite.node.json`, sets `"baseUrl": "."`, and `"include": ["vite.config.ts"]`.
2. Packages that include a `types/` directory (e.g. for ambient type declarations) SHALL add `"types"` to the `include` array in `tsconfig.app.json`.
3. Packages that do not use React MAY omit `tsconfig.node.json` and use a single `tsconfig.json` extending `tsconfig.vite.app.json` directly, as seen in `@code-dot-org/core`.
4. No Package SHALL define custom `compilerOptions` that conflict with the shared base configs without a documented reason.

### Requirement 7: Vite Build Configuration

**User Story:** As a frontend engineer, I want all library packages built with a consistent Vite library mode setup so that outputs are predictable and tree-shakeable.

#### Acceptance Criteria

1. Every Package SHALL use a `vite.config.ts` with Vite in library mode (`build.lib`).
2. Every Package SHALL use `vite-plugin-externalize-deps` to externalize all runtime dependencies.
3. Every Package SHALL use `vite-plugin-dts` to generate TypeScript declaration files with the following options:
   - `tsconfigPath: './tsconfig.app.json'` (or `'./tsconfig.json'` for single-tsconfig packages).
   - `rollupTypes: false`.
   - `entryRoot: 'src'`.
   - `insertTypesEntry: false`.
   - `exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx']`.
4. Every Package SHALL produce both ESM and CJS outputs using the shared `getRollupOutputConfig` helper pattern:
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
   ```
   and pass `[getRollupOutputConfig('es'), getRollupOutputConfig('cjs')]` to `rollupOptions.output`.
5. Every Package SHALL set `build.sourcemap: true` and `build.cssCodeSplit: true`.
6. Every Package SHALL set a `resolve.alias` mapping `'@'` to `path.resolve(__dirname, './src')`.
7. Packages using React SHALL add `@vitejs/plugin-react` as the first plugin.
8. Packages with CSS modules SHALL add `vite-plugin-lib-inject-css` and a custom `assetFileNames` function to normalize CSS output paths.
9. The `vite.config.ts` SHALL use `dts({ tsconfigPath: './tsconfig.app.json' })` (not `tsconfig.json`) for packages using the split tsconfig structure.

### Requirement 8: ESLint Configuration

**User Story:** As a frontend engineer, I want ESLint configured consistently so that code quality rules are uniform across packages.

#### Acceptance Criteria

1. Every Package SHALL have an `eslint.config.mjs` (preferred) or `eslint.config.js` at the package root.
2. The ESLint config SHALL always ignore `dist/*` (via `globalIgnores(['dist/*'])` or `{ignores: ['dist/*']}`).
3. Packages without React SHALL extend `@code-dot-org/lint-config/eslint/node.mjs` (for Node/build tooling) or `@code-dot-org/lint-config/eslint/base.mjs` (for browser-only non-React packages).
4. Packages with React SHALL extend `@code-dot-org/lint-config/eslint/react.mjs`.
5. Packages using Jest SHALL additionally extend `@code-dot-org/lint-config/eslint/jest.mjs` scoped to test files.
6. Packages using Vitest (not Jest) SHALL NOT include the Jest ESLint config.
7. The available ESLint configs from `@code-dot-org/lint-config` are:
   - `eslint/base.mjs` — JS + TS + import ordering rules (browser + Node globals).
   - `eslint/react.mjs` — extends `base.mjs`, adds React, JSX-a11y, browser globals.
   - `eslint/node.mjs` — extends `base.mjs`, adds Node globals.
   - `eslint/jest.mjs` — Jest plugin rules scoped to `**/*.test.tsx` files.

### Requirement 9: Lint-Staged Configuration

**User Story:** As a frontend engineer, I want lint-staged configured consistently so that pre-commit hooks auto-fix staged files uniformly.

#### Acceptance Criteria

1. Every Package SHALL have a `.lintstagedrc.mjs` at the package root.
2. The `.lintstagedrc.mjs` SHALL import and re-export the base config:
   ```js
   import baseConfig from '@code-dot-org/lint-config/lint-staged/lintstagedrc.mjs';
   export default baseConfig;
   ```
3. The base lint-staged config automatically runs ESLint + Prettier on `*.{js,cjs,mjs,ts,jsx,tsx,json,md}` and Stylelint + Prettier on `*.{css,sass,scss}`.

### Requirement 10: Testing Configuration

**User Story:** As a frontend engineer, I want tests configured consistently so that `turbo test` works uniformly across all packages.

#### Acceptance Criteria

1. Every Package SHALL use Vitest as its test framework (exception: `@code-dot-org/component-library` uses Jest for legacy reasons).
2. Every Package using Vitest SHALL have a `vitest.config.ts` with at minimum `test: { globals: true }`.
3. Tests SHALL be co-located with source files in `__tests__/` subdirectories (e.g. `src/feature/__tests__/feature.test.ts`).
4. The `"test"` script SHALL run `vitest --run` (non-watch, for CI compatibility).

### Requirement 11: `.gitignore`

**User Story:** As a frontend engineer, I want a consistent `.gitignore` in every package so that build artifacts and local files are never committed.

#### Acceptance Criteria

1. Every Package SHALL have a `.gitignore` that excludes at minimum: `node_modules`, `dist`, `dist-ssr`, `*.local`, `.DS_Store`, and editor directories (`.vscode/*`, `.idea`).
2. Packages that produce temporary build artifacts SHALL also exclude `tmp` and `*.log` files.

### Requirement 12: Turborepo Integration

**User Story:** As a frontend engineer, I want every package integrated into the Turborepo pipeline so that builds, tests, and linting run in correct dependency order.

#### Acceptance Criteria

1. Every Package's scripts SHALL include `"build"`, `"test"`, `"lint"`, `"typecheck"`, `"prettier"`, and `"clean"` so that all Turborepo tasks defined in `frontend/turbo.json` can invoke them.
2. The `build` task output SHALL be `dist/**` (matching the `"outputs": ["dist/**"]` field in `turbo.json`).
3. Every Package SHALL be reachable from the `"workspaces"` globs in `frontend/package.json` (currently `"packages/*"` and `"packages/labs/*"`).

### Requirement 13: Documentation

**User Story:** As a frontend engineer, I want every package to have a README so that consumers understand its purpose and API.

#### Acceptance Criteria

1. Every Package SHALL have a `README.md` describing its purpose, package name, installation, key exports, and usage examples.
2. Packages that support extension by other engineers SHALL include a `CONTRIBUTING.md` or an equivalent "Adding new functionality" section in `README.md` describing how to add new modules or adapters.
3. The README SHALL document which `tsconfig`, ESLint config, and Prettier config the package uses, so that contributors can replicate the setup.


