# Code.org Frontend

This directory represents the frontend codebase powering Code.org with the exception of the Studio `apps` package. 

## What's inside?

This directory uses [Turborepo](https://turbo.build/) to manage the monorepo and uses the following package structure:

- `apps`: Applications or services (Contentful CMS, Storybook, etc.)
- `packages`: Libraries, build tools, configurations (Shared linter configs, component library, etc.)

### Apps

- `apps/design-system-storybook`: A [Storybook](https://storybook.js.org/) instance for the Code.org design system

### Packages

- `packages/dsco`: The Design System for Code.org including its react components and styling

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

To develop a specific set of apps and packages, apply a Turborepo [filter](https://turbo.build/repo/docs/crafting-your-repository/running-tasks#using-filters).

For example, to only run the design system storybook:

```bash
yarn dev -- --filter=@code-dot-org/design-system
```

## Cleaning

To remove build artifacts, use the following commmand:

```bash
yarn clean
```