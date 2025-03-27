# Code.org Frontend

This directory contains packages and applications that power Code.org sites.

**Note**: Most of Code.org's Studio product (student experience, curriculum, teacher tools, etc.) is built in the
top-level `apps` package and is not currently located in this directory.

## What's inside?

This directory uses [Turborepo](https://turbo.build/) to manage the monorepo and uses the following package structure:

- `apps`: Applications or services (Contentful CMS, Storybook, etc.)
- `packages`: Libraries, build tools, configurations (Shared linter configs, component library, etc.)

### Apps

Open source Code.org applications:

- [@code-dot-org/marketing](apps/marketing): Code.org's marketing site (uses Contentful).
- [@code-dot-org/design-system-storybook](apps/design-system-storybook): A [Storybook](https://storybook.js.org/)
  instance for the Code.org design system (`@code-dot-org/component-library`). Publicly available at
  [https://code-dot-org.github.io/code-dot-org/component-library-storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook).

### Packages

Publicly available packages:

- [@code-dot-org/component-library](packages/component-library): The Code.org Design System React component library.
- [@code-dot-org/component-library-styles](packages/component-library-styles): Common Styles
  (`variables`, `colors`, `mixins`, `typography styles`, etc) of Code.org Design System
  ([@code-dot-org/component-library](packages/component-library)). Based on [Figma](https://www.figma.com/design/NIVcvUgU3WmXpAmp9U2vVy/DSCO-Variables?node-id=2925-33951&m=dev).
  Used by [@code-dot-org/component-library](packages/component-library), should also be used as
  a standalone package for styling components with Code.org's Design System styles.
- [@code-dot-org/lint-config](packages/lint-config): Shared linters configuration for Code.org projects
  (includes `eslint`, `lint-staged,` `prettier`, `stylelint`, `typescript` configs).
- [@code-dot-org/fonts](packages/fonts): Code.org's Design System fonts package.
- [@code-dot-org/changelogs](packages/changelogs): [Release-it](https://github.com/release-it/release-it)
  configuration for changelogs automatic generation, package versioning, and publishing.

## Getting Started

_(!!!)_ If you're unable to find some information in this README.md, please refer to the documentation of package/app
that you're working on. (e.g. go to [packages/component-library/README.md](packages/component-library/README.md),
[apps/marketing/README.md](apps/marketing/README.md), etc)

### Prerequisites

Ensure that [corepack](https://nodejs.org/api/corepack.html) is enabled.

```bash
corepack enable
```

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

### Formatting, Linting. (Prettier, ESLint, Stylelint)

To format all files in all packages and apps, run the following command:

```bash
yarn lint:fix
```

You can also run this command for some specific package or app using yarn workspace:

```bash
yarn lint:fix --filter @code-dot-org/component-library

OR

yarn workspace @code-dot-org/component-library lint:fix
```

### Pre-release Testing

To run all tests that the pull-request quality checks do:

```bash
yarn release:dryrun
```

This command executes all lint, test, and build commands.

### Visual Snapshot Testing (Eyes)

The design system uses [Applitools Eyes](https://applitools.com/platform/eyes/) via their [Storybook integration](https://applitools.com/tutorials/sdks/storybook) to take a visual snapshot of
a storybook component and
compare it with baselines. Visual snapshots on pull requests and during the CI build.

To run visual snapshots locally, first obtain an [Applitools API Key](https://applitools.com/docs/topics/overview/obtain-api-key.html).

Then, assign the API key to `frontend/.env` in the `APPLITOOLS_API_KEY` key. (If this file does not exist,
copy it from `frontend/.env.example`)

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
