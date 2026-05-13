# @code-dot-org/lint-config

Shared ESLint, TypeScript, Prettier, Stylelint, and lint-staged configs for all packages and apps in `frontend/`. Not used by the legacy `apps/` bundle.

## ESLint

Three flat-config presets are available:

| Preset             | Use for                                            |
| ------------------ | -------------------------------------------------- |
| `eslint/node.mjs`  | Node.js tools, config files                        |
| `eslint/react.mjs` | React apps and component libraries                 |
| `eslint/jest.mjs`  | Jest test files (overlay on top of another preset) |

All presets include `eslint:recommended`, `typescript-eslint`, and `eslint-plugin-import-x` (with enforced import ordering). The `react` preset adds `eslint-plugin-jsx-a11y` (strict) and `eslint-plugin-react`.

```js
// eslint.config.mjs — React app
import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import {globalIgnores} from 'eslint/config';

export default [globalIgnores(['dist']), ...cdoReactConfig];
```

```js
// eslint.config.mjs — with Jest overlay
import cdoJestConfig from '@code-dot-org/lint-config/eslint/jest.mjs';
import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [...cdoReactConfig, ...cdoJestConfig];
```

Spread and extend as needed — consuming packages can append additional rule overrides after the preset.

## TypeScript

Four tsconfig presets, all extending [`@tsconfig`](https://github.com/tsconfig/bases) bases:

| Preset                               | Use for                       |
| ------------------------------------ | ----------------------------- |
| `typescript/tsconfig.node22.json`    | Node 22 tooling               |
| `typescript/tsconfig.react.json`     | React library packages        |
| `typescript/tsconfig.vite.app.json`  | Vite app `tsconfig.app.json`  |
| `typescript/tsconfig.vite.node.json` | Vite app `tsconfig.node.json` |

```json
// tsconfig.app.json
{
  "extends": "@code-dot-org/lint-config/typescript/tsconfig.vite.app.json",
  "compilerOptions": {"baseUrl": "."},
  "include": ["src"]
}
```

The `tsconfig.vite.app.json` preset sets `"paths": {"@/*": ["src/*"]}` — mirror this alias in `vite.config.ts` `resolve.alias` if you use it.

Keep these presets general-purpose. Package-specific options (`composite`, `declarationMap`, `paths`) go in the consuming package's own tsconfig.

## Prettier

```json
// package.json
{
  "prettier": "@code-dot-org/lint-config/prettier/index.mjs"
}
```

Key overrides from default Prettier: `singleQuote: true`, `bracketSpacing: false`, `arrowParens: 'avoid'`. Also includes `prettier-plugin-packagejson` for sorting `package.json` keys.

Run Prettier separately from ESLint (no ESLint/Prettier plugin):

```json
"lint": "eslint . && prettier --check .",
"lint:fix": "eslint --fix . && prettier --write ."
```

Configure your editor to auto-format on save — see [Prettier editor integration](https://prettier.io/docs/en/editors).

## Stylelint

```js
// stylelint.config.mjs
import cdoStylelint from '@code-dot-org/lint-config/stylelint/index.mjs';
export default cdoStylelint;
```

Extends `stylelint-config-standard-scss` with relaxed rules matching the legacy `apps/` style (vendor prefixes allowed, flexible selector patterns, SCSS globals permitted).

## lint-staged

```js
// .lintstagedrc.mjs
import baseConfig from '@code-dot-org/lint-config/lint-staged/lintstagedrc.mjs';
export default baseConfig;
```

Default behavior on staged files:

- `*.{js,cjs,mjs,ts,jsx,tsx,json,md}` → `eslint --fix` + `prettier --write`
- `*.{css,sass,scss}` → `stylelint --fix` + `prettier --write`

To customize, import `defaultLintFix`, `cssLintFix`, or `DEFAULT_EXTENSIONS_GLOB` and compose your own config.
