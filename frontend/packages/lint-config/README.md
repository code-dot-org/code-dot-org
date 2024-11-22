# @code-dot-org/lint-config

This package contains the Code.org engineering code style guide for the Code.org `frontend` directory.

**Note**: At this time, the top-level `apps` directory does not use this package.

This package includes:

1. Typescript Configuration Files (tsconfig)
2. ESLint Configuration Files
3. Prettier Configuration

## Typescript Configuration Files (tsconfig)

Various default `tsconfig.json` flavors are available for different Node.js versions and frameworks.

Most configurations use [@tsconfig](https://github.com/tsconfig/bases/tree/main) bases and this package
overrides the base configuration for use within the Code.org engineering ecosystem.

When updating these configuration files, be sure to keep them as general as possible. For example, don't
add `jsx` to the node flavors as that would make all consumers of the node flavor to include jsx in its
typescript compilation.

### Current Flavors

1. `tsconfig.node[version].json`: A tsconfig targeted for a specific node version.

## ESLint Configuration Files

ESLint [flat config](https://eslint.org/docs/latest/use/configure/configuration-files) style configuration files are available
in the `eslint` directory for various flavors.

When updating ESLint configuration files in this package, be sure to keep them as general as possible.
Consuming packages can override defaults as needed.

### Current Flavors

1. `node`: Recommended node defaults from ESLint
2. `react`: Recommended react defaults from ESLint

### Usage

Import and spread the shared configuation in your `eslint.config.mjs`:

```js
import cdoEslint from './eslint/node.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [...cdoEslint];
```

## Prettier Configuration

The Code.org uses the default prettier configuration with some overrides in the `prettier` directory.

To use the shared configuration, add the following key to `package.json`:

```
  "prettier": "@code-dot-org/lint-config/prettier/index.mjs",
```

The Code.org prettier configuration also does not utilize ESLint/Prettier plugins in accordance to the
[Prettier](https://prettier.io/docs/en/integrating-with-linters) recommendation. Instead, the `lint` and
`lint:fix` scripts run `prettier --check .` and `prettier --write .` respectively. Ensure the following scripts
are added in the consuming packages' `package.json`:

```
    "lint": "eslint . && prettier --check .",
    "lint:fix": "eslint --fix . && prettier --write .",
```

### Editor Integration

Since prettier will not error out as a linter error, be sure to configure your editor of choice to automatically
run prettier on save. For instructions for your editor of choice, see the [Prettier documentation](https://prettier.io/docs/en/editors).
