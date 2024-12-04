# Code.org Frontend

This directory contains the codebase powering Code.org's marketing site and UI component library packages.

**Note**: Most of Code.org's Studio product (student experience, curriculum, teacher tools, etc.) is built in the
top-level `apps` package and is not currently located in this directory.

## What's inside?

This directory uses [Turborepo](https://turbo.build/) to manage the monorepo and uses the following package structure:

- `apps`: Applications or services (Contentful CMS, Storybook, etc.)
- `packages`: Libraries, build tools, configurations (Shared linter configs, component library, etc.)

### Apps

- `apps/design-system-storybook`: A [Storybook](https://storybook.js.org/) instance for the Code.org design system

### Packages

- `packages/dsco`: The Design System for Code.org including its react components and styling

### Getting Started

Initialize the frontend package:

```bash
yarn install
```

### Build

Turborepo will automatically detect changed sub-directories and appropriately cache to avoid duplicate work.

To build all apps and packages, run the following command:

```bash
yarn build
```

### Develop

To develop **all** apps and packages, run the following command:

```bash
yarn dev
```

To develop a specific set of apps and packages, use `yarn workspace [workspace name] [command]`.
More information on this command [here](https://yarnpkg.com/cli/workspace).

For example, to only run the design system storybook:

```bash
yarn workspace @code-dot-org/design-system-storybook dev
```

### Visual Snapshot Testing (Eyes)

The design system uses [Applitools Eyes](https://applitools.com/platform/eyes/) via their [storybook integration](https://applitools.com/tutorials/sdks/storybook) to take a visual snapshot of a storybook component and
compare it with baselines. Visual snapshots on pull requests and during the CI build.

To run visual snapshots locally, first obtain an [Applitools API Key](https://applitools.com/docs/topics/overview/obtain-api-key.html).

Then, assign the API key to `frontend/.env` in the `APPLITOOLS_API_KEY` key. (If this file does not exist, copy it from `frontend/.env.example`)

To run the visual tests:

```bash
yarn workspace @code-dot-org/design-system-storybook eyes-storybook
```

If differences are detected, follow the [baseline update](https://applitools.com/docs/topics/overview/overview-reviewing-test-results.html) guide to resolve.

## Cleaning

To remove build artifacts, use the following commmand:

```bash
yarn clean
```
