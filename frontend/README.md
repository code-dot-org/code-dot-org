# Code.org

Welcome! You've found the source code for [the Code.org website](https://code.org/) and [the Code Studio platform](https://studio.code.org/). Code.org is a non-profit dedicated to expanding access to computer science education. You can read more about our efforts at [code.org/about](https://code.org/about).

## Quick start

1. Follow our [setup guide](./SETUP.md) to configure your workstation.
2. `rake build` to build the application if you have not done so already
3. `bin/dashboard-server` to launch the development server.
4. Open your browser to [http://localhost-studio.code.org:3000/](http://localhost-studio.code.org:3000/).

To see a list of all build commands, run `rake` from the repository root.

## How to help

Wondering where to start?  See our [contribution guidelines](CONTRIBUTING.md).

## What's in this repo?
Here's a quick overview of the major landmarks:

### Documentation

* [ARCHITECTURE](./ARCHITECTURE.md): in particular please review and adhere to our [Architectural Tenets](ARCHITECTURE.md#architectural-tenets).
* [SETUP](./SETUP.md): Instructions to get everything up and running.
* [TESTING](./TESTING.md): How to be sure nothing broke.
* [STYLEGUIDE](./STYLEGUIDE.md): Our code style conventions.
* Our [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
* There are many more topical guides in the [docs](./docs) folder.
* In addition, several sections of the repository have their own documentation:
  * [apps/README](./apps/README.md)
  * [blockly/README](https://github.com/code-dot-org/blockly/blob/master/README.md)

### [dashboard](./dashboard)

The server for our [**Code Studio** learning platform](https://studio.code.org/), a [Ruby on Rails](http://rubyonrails.org/) application responsible for:

* Our courses, tutorials, and puzzle configurations
* User accounts
* Student progress and projects
* The "levelbuilder" content creation tools

### [pegasus](./pegasus)

The server for [the **Code.org** website](https://code.org/), a [Sinatra](http://www.sinatrarb.com/) application responsible for:

* [code.org](https://code.org)
* [hourofcode.com](https://hourofcode.com)
* [csedweek.org](https://csedweek.org)

### [apps](./apps)

The JavaScript 'engine' for all of our tutorials, puzzle types and online tools.  It gets built into a static package that we serve through dashboard. Though there are currently some exceptions, the goal is that all JS code ultimately lives here, so that it gets the benefit of linting/JSX/ES6/etc.
Start here if you are looking for:
* The Hour of Code tutorials: [Star Wars](https://code.org/starwars), [Minecraft](https://studio.code.org/api/hour/begin/mc), [Frozen](https://studio.code.org/s/frozen) and [Classic Maze](http://studio.code.org/hoc/1)
* Tools like [Artist](https://studio.code.org/projects/artist), [Play Lab](https://studio.code.org/projects/playlab) and [App Lab](https://code.org/educate/applab)
* Other core puzzle types: Maze, Farmer, Bee, Bounce, Calc, Eval
* Other JS code consumed by dashboard and pegasus.

### Everything else

* **aws**: Configuration and scripts that manage our deployments.
* **bin**: Developer utilities.
* **cookbooks**: Configuration management through [Chef](https://www.chef.io/).
* **shared**: Source and assets used by many parts of our application.
* **tools**: Git commit hooks.

To build all apps and packages, run the following command:

```bash
pnpm build
```

### Develop

To develop on the **studio** application, run in the `frontend` directory

```bash
pnpm dev
```

Changing any monorepo managed dependencies (such as labs) will automatically trigger a rebuild and be made
available to the persistent dev server using Turborepo's watch feature.

### Formatting, Linting. (Prettier, ESLint, Stylelint)

To format all files in all packages and apps, run the following command:

```bash
pnpm lint:fix
```

You can also run this command for some specific package or app:

```bash
pnpm --filter @code-dot-org/component-library lint:fix 
```

### Pre-release Testing

To run all tests that the pull-request quality checks do:

```bash
pnpm release:dryrun
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
pnpm --filter @code-dot-org/design-system-storybook eyes-storybook
```

If differences are detected, follow the [baseline update](https://applitools.com/docs/topics/overview/overview-reviewing-test-results.html) guide to resolve.

## Cleaning

To remove build artifacts, use the following commmand:

```bash
pnpm clean
```

To remove all installed `node_modules`, use the following command:

```bash
pnpm clean:deps
```
