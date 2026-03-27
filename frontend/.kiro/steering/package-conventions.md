---
inclusion: auto
name: package-conventions
description: Frontend package conventions for frontend/packages. Use when creating or modifying any file at the root of a package under frontend/packages/ or frontend/packages/labs/, including package.json, tsconfig, vite.config.ts, eslint.config.mjs, README.md, and similar scaffold files.
fileMatchPattern: ['packages/*/*', 'packages/labs/*/*']
---

# Frontend Package Conventions

Applies to all packages under `frontend/packages/` and `frontend/packages/labs/`.

Labs (`packages/labs/*`) are standalone React apps — curriculum "game engines" embedded in Code Studio. They share the same conventions as library packages except where noted in the Labs section below.

## package.json — all packages

- `"name"`: `"@code-dot-org/<package-name>"`
- `"version"`: `"0.0.0"`, `"private": true`, `"type": "module"`
- `"license"`: `"SEE LICENSE IN LICENSE"`, `"engines"`: `{"node": ">=20"}`
- `"prettier"`: `"@code-dot-org/lint-config/prettier/index.mjs"`
- Always use `catalog:` for shared devDeps — only override with a pinned version if there is a documented reason
- Use `workspace:*` for internal packages; always declare `@code-dot-org/lint-config` as a `devDependency`

**Required scripts** (all packages):

- `"build"`: `"vite build && tsc --noEmit"`
- `"typecheck"`: `"tsc --noEmit"`
- `"lint"` / `"lint:fix"`: `"eslint ."` / `"eslint --fix ."`
- `"prettier"` / `"prettier:fix"`: `"prettier --check ."` / `"prettier --write ."`
- `"test"`: `"vitest --run"`
- `"clean"`: `"rimraf dist .turbo"`

**Exports**: always declare explicit `"exports"` with `types` / `import` (`.mjs`) / `require` (`.cjs`) per entry point:

```json
".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.cjs" }
```

## Vite (`vite.config.ts`) — all packages

All packages use the same `vite-plugin-dts` options:

```ts
dts({
  tsconfigPath: './tsconfig.app.json', // or './tsconfig.json' for single-tsconfig packages
  rollupTypes: false,
  entryRoot: 'src',
  insertTypesEntry: false,
  exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
});
```

- `rollupTypes: false` keeps per-module `.d.ts` files, matching `preserveModules` and enabling tree-shaking
- `entryRoot: 'src'` mirrors `dist/` paths to `src/` paths
- `insertTypesEntry: false` prevents dts from injecting a redundant `types` field (declared explicitly in `exports`)

All packages use `vite-plugin-externalize-deps` and dual ESM+CJS output via `getRollupOutputConfig`:

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

Also set: `build.sourcemap: true`, `build.cssCodeSplit: true`, `resolve.alias: {'@': './src'}`

## TypeScript — all packages

Library packages (`packages/*`) may use a single `tsconfig.json` extending `@code-dot-org/lint-config/typescript/tsconfig.vite.app.json` when no React/Vite split is needed (see `@code-dot-org/core`).

Split tsconfig is preferred for React packages and required for labs:

- `tsconfig.json` — `"files": []` + `"references"` to `tsconfig.app.json` and `tsconfig.node.json`
- `tsconfig.app.json` — extends `tsconfig.vite.app.json`, `"include": ["src"]`
- `tsconfig.node.json` — extends `tsconfig.vite.node.json`, `"include": ["vite.config.ts"]`

## ESLint (`eslint.config.mjs`) — all packages

Always extend from `@code-dot-org/lint-config`; always ignore `dist/*`. The shared base configs (`base.mjs`, `react.mjs`, `node.mjs`) include `globalIgnores(['dist'])` automatically — do not remove it or override it in package-level configs:

- React packages: `@code-dot-org/lint-config/eslint/react.mjs`
- Non-React browser: `@code-dot-org/lint-config/eslint/base.mjs`
- Node/build tooling: `@code-dot-org/lint-config/eslint/node.mjs`

Minimal package-level config (non-React):

```js
import baseConfig from '@code-dot-org/lint-config/eslint/base.mjs';

// dist/ is ignored via globalIgnores in the base config
export default baseConfig;
```

## Testing (`vitest.config.ts`) — all packages

All packages use Vitest. Minimum config: `test: { globals: true }`. Tests in `src/**/__tests__/`.
Exception: `@code-dot-org/component-library` uses Jest for legacy reasons — do not apply this exception to new packages.

## Lint-staged (`.lintstagedrc.mjs`) — all packages

```js
import baseConfig from '@code-dot-org/lint-config/lint-staged/lintstagedrc.mjs';
export default baseConfig;
```

## Labs (`packages/labs/*`) — differences from library packages

Labs are React apps with an `index.html` and `src/main.tsx` app bootstrap alongside `src/App.tsx` (the root component and library entry point).

- `index.html` present — Vite runs in app mode for `dev`, library mode for `build`
- `src/main.tsx` bootstraps the React app for standalone dev; `src/App.tsx` is the exported entry
- `server.allowedHosts: ['localhost-studio.code.org']` required in `vite.config.ts` for local dev
- tsconfig is always split (never single-file)
- `@vitejs/plugin-react` added as first Vite plugin
- Entry point is `src/App.tsx` (React component), not `src/index.ts`
- `dts` uses `tsconfigPath: './tsconfig.app.json'` (not `./tsconfig.json`)

## README.md — all packages

Every package needs a `README.md` with: purpose, package name, installation, key exports, and usage examples.
