# The Apps Package

The **Apps Package** contains most of our client-side JavaScript, particularly the source code for the [Blockly](https://developers.google.com/blockly/) based 20 hour curriculum, Hour of Code, and our Droplet-based levels (including App Lab). Information about Blockly can be found in the [wiki](https://github.com/RaspberryPiFoundation/blockly/wiki).

Blockly is a web-based, graphical programming editor. Users can drag blocks together to build an application. No typing required. Credit goes to these awesome [developers](https://github.com/google/blockly/graphs/contributors)
and a small army of translators.

- [Quick Start](#quick-start)
- [Running Tests](#testing)
- [Contributing](#contributing)

## Quick Start

```
cd apps

# Machine setup; see ../SETUP.md to install nvm
nvm install    # version from ../.nvmrc
corepack enable

# Perform first full build
yarn
yarn build

# Make sure tests pass
yarn test

# Automatically rebuild every time you make changes to source files
yarn start
```

### Seeing your development version of Apps in Dashboard

1. To make your changes show up in dashboard, do the following after the first time you build apps:

- Set `use_my_apps: true` to your locals.yml config file.
- Run `rake package:apps:symlink` to pick up the configuration change.
- If you are currently running dashboard, stop and restart dashboard-server.

1. If you find your changes are not showing up within dashboard, you may have accidentally reverted your symlink to point to the pre-built version of apps (e.g. when switching branches or stashing changes). To check your symlink, run:

```
> ls -l dashboard/public/blockly
```

and look for something like:

```
lrwxr-xr-x  1 laurel  501  12 Apr 27 13:00 dashboard/public/blockly -> apps/build/package
```

If the symlink is in place, then as you rebuild apps, your results should show up in Dashboard. If not, run through step 1 again.

## Building

To run a full development build (minus localization):

```
yarn build
```

- `yarn build` builds a 'debug' version with more readable javascript
- `yarn build --app=maze` builds a 'debug' version of only the maze app
- `yarn build:dist` builds a minified version suitable for production
- `yarn clean` will clean the build/ directory

### Building with rspack (opt-in)

Appending `--rspack` to `yarn start`, `yarn build`, or `yarn build:dist`
routes the JS bundling step through [rspack](https://rspack.rs), a Rust
implementation of webpack that is much faster on developer machines
(seconds instead of minutes for dev-server startup). It is opt-in while
we evaluate it: swc and babel can transpile edge cases differently, so
check your change under the default webpack build before shipping — the
command prints a reminder. Switching between bundlers cleans
`build/package/js` automatically, and `yarn start --rspack` cleans it on
every start (serving over a populated directory costs rspack about 18
seconds), so the first compile after starting re-copies ace, piskel and
the pyodide wheels. Source maps default to covering `src/` only; see
[Source maps under rspack](#source-maps-under-rspack).

Two other levers:

- `RSPACK_NO_WRITE=1 yarn start --rspack` skips the dev server's copy of
  its output to disk. Rebuilds are bounded by writing, not compiling, so
  this is the big one for iterating on a widely-imported file — a shared
  edit reaches the browser in about 9 seconds instead of 24 — at the cost
  of roughly 1.8GB more resident memory, since the output stays in the
  server's in-memory filesystem. Anything reading `build/package`
  directly (a page served straight from Rails, say) needs the files, so
  it is off by default.
- `RSPACK_SWC=off yarn start --rspack` (also `0` or `babel`) puts
  babel-loader and ts-loader back, keeping rspack as the bundler. That
  isolates the transpiler when you suspect swc is behind a difference,
  which is faster than rebuilding under webpack to find out.
- `RSPACK_NO_LAZY=1 yarn start --rspack` compiles dynamic imports up
  front instead of when a page first requests them. The lazy default is
  a small startup win, but the deferred chunks exist only inside
  the dev server: a page loaded straight from Rails on :3000 while the
  rspack server owns `build/package/js` hits stubs whose requests
  nothing answers. Set this if that is your workflow.

## Dev server source maps and memory usage

`yarn start` defaults to `devtool: 'eval-cheap-module-source-map'`. The `module`
part keeps breakpoints in your original TS/JSX; the `cheap` part drops
column-level mappings (line-level only), which uses less memory than the
full-fidelity `eval-source-map`.

Override the default with `APPS_DEVTOOL` when you need a different tradeoff:

- `APPS_DEVTOOL=eval yarn start` — least memory, no source maps (you step
  through transpiled code).
- `APPS_DEVTOOL=eval-source-map yarn start` — highest fidelity (column-level
  mappings), most memory.

Type checking runs in a separate process capped at ~2.5GB. Set
`SKIP_TYPECHECK=1 yarn start` to skip it and reclaim that memory; your editor
and CI still type-check.

Two shortcuts combine these levers:

- `yarn start:cheap` — `APPS_DEVTOOL=eval` with type checking left on.
- `yarn start:cheapest` — `APPS_DEVTOOL=eval` plus `SKIP_TYPECHECK=1`, for the
  lowest-memory dev server.

Both shortcuts describe webpack economics; under `--rspack` the src/-scoped
default already uses less memory than `eval` (see below), so only
`SKIP_TYPECHECK` retains its meaning there.

### Source maps under rspack

Under `--rspack`, the default is source maps for everything in `src/` and
nothing else: you step through your own TS/JSX in DevTools, and node_modules
stays unmapped. That boundary is what keeps it affordable — node_modules
holds over half the module graph, and mapping it is what makes rspack's
whole-app `-module` modes unusable here (the dev server exceeds 25GB during
rebuilds; a one-shot `yarn build --rspack` forced to full maps was OOM-killed
on a 30GB machine, since a build compiles every dynamic import up front where
the dev server defers them). Measured against no maps at all, the default
costs about 2 seconds per shared-file rebuild, and *less* memory, because
unmapped modules skip eval wrapping entirely. A
one-shot `yarn build --rspack` pays about 4 seconds and 0.7GB for the same
maps in its output.

One lever adjusts it, and the active mode is printed at startup:
`APPS_DEVTOOL=eval yarn start --rspack` turns maps off everywhere, trading
symbols for the ~2 seconds per shared-file rebuild they cost. Known
rough edge either way: unmapped modules (node_modules, or everything under
`eval`) show numeric internal names in DevTools.

## Testing

[jest](https://jestjs.io/) runs `test/unit/**/*Test.{js,jsx,ts,tsx}` in jsdom.
[Karma](https://karma-runner.github.io/) runs `test/unit/**/*.karma.test.*`
(unit tests that need a real browser) and `test/integration/` in
ChromeHeadless. `yarn test` runs `run-tests-in-parallel.sh`: jest, then
`yarn lint`, the karma unit tests, and the integration tests split by level
type, in parallel. It ignores its arguments.

| To Run...                               | Example Command                                           |
|-----------------------------------------|-----------------------------------------------------------|
| All tests in parallel                   | `yarn test`                                               |
| Unit tests                              | `yarn test:unit`                                          |
| Integration tests                       | `yarn test:integration`                                   |
| A single unit test file                 | `yarn test:unit test/unit/utilsTest.js`                   |
| All unit tests in a folder              | `yarn test:unit test/unit/applab/`                        |
| Unit tests named \*Tutorial\*           | `yarn test:unit --testNamePattern='Tutorial'`             |
| Integration tests named \*data_blocks\* | `yarn test:integration --grep='data_blocks'`              |
| Integration tests for maze levels       | `yarn test:integration --levelType=maze`                  |
| **Other useful flags:**                 | **Example Command**                                       |
| Stream pass/fail to stdout/stderr       | `yarn test:unit --verbose`                                |
| Rerun tests when files change           | `yarn test:unit --watch`                                  |
| Debug tests in Chrome                   | `yarn test:integration --browser=Chrome --watchTests`     |
| Directly invoke Karma (same flags)      | `npx karma start --testType=integration --browser=Chrome` |
| Directly invoke jest                    | `npx jest`                                                |

#### Testing Notes

- `yarn test` is run by Drone CI when you create a pull request.
- You'll need to run `yarn build` at least once before running tests. If you don't, you'll see errors like `Module not found: Error: Can't resolve '../../../build/`.

### IDE Support

You can run and debug jest unit tests with an IDE extension. For more details, check your IDE's documentation.

* [VSCode](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest)
* [Rubymine/Webstorm](https://www.jetbrains.com/help/webstorm/running-unit-tests-on-jest.html)

### Debugging Karma Tests

To debug karma tests, run them in a visible Chrome:

```
yarn test:integration --browser=Chrome --watchTests
yarn grunt karma --testType=unit --browser=Chrome --watchTests --entry=./test/unit/Sound.karma.test.js
```

A new chrome browser window will open where the tests will be running. You can
click on the Debug button to open a new tab where you can then open the
developer console to see everything that is happening. If you don't see the new
chrome browser window, it may have opened _behind_ your other windows.

### Coverage Reports

Coverage reports can be generated for any collection of tests by specifying the
`COVERAGE=1` environment variable. Results will be placed in the `coverage`
folder. For example, to see what code gets executed by unit tests, run:

```
COVERAGE=1 yarn test:unit
```

Then open the html report:

```
open coverage/lcov-report/index.html
```

### Writing Tests

Add new jest tests as `test/unit/**/*Test.js` (or `.jsx`, `.ts`, `.tsx`); jest
never runs a file named `*Tests.js`. See `test/unit/feedbackTest.js` for an
example of a mock Blockly instance. Each test file should test exactly one
file in `src/` and share its name, with `Test` appended.

In the event you need certain code to only be available when tests are running,
you can use the `IN_UNIT_TEST` global, which will be set to `true` only when
tests are running. For example:

```
if (IN_UNIT_TEST) {
  console.log("this log line will only show up when tests are run");
}
```

These if statements will be removed from production source files at build time.

### Karma Tests

Prefer jest for new tests. The karma test runner starts a server which can serve files in the apps directory to
your test code. Only allowlisted files and directories are available. See the
`files` array in `karma.conf.js` for the allowlist. When
fetching files served by the test runner, prefix the file path with
`/base/`. For example, to load the `test/audio/assets/win.mp3` file in an
`<audio>` tag inside your test, you could write:

```
document.write('<audio src="/base/test/audio/assets/win.mp3"/>');
```

### UI Component Style Guide & Tests

We use Storybook to generate a UI component style guide that you can use
to discover what components are available to reuse as you build new
features. See more in the [apps/.storybook README](./.storybook/README.md).

### Analyzing bundle sizes

![code-studio-common bundle](https://user-images.githubusercontent.com/1070243/44691985-abe8dc80-aa15-11e8-95a3-0835ca3529df.png)

Bloated javascript bundles getting you down? Run `yarn build:analyze` to generate an interactive treemap visualization of the contents of all of our bundles. This will automatically open the report in your browser, or you can find the generated html page in the apps build directory at code-dot-org/apps/build/package/js/report.html. This uses [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer).

## Adding a new npm package

Run `yarn add <name>`, or `yarn add --dev <name>` to add it to
`devDependencies`. Commit `package.json` and `yarn.lock` together.

## Contributing

We'd love to have you join our group of contributors!

For notes on our pull process, where to find tasks to work on, etc., see the [Contributing Guide](https://github.com/code-dot-org/code-dot-org/blob/staging/CONTRIBUTING.md).

### Style Guide

Prettier enforces formatting. Lint changed files with `./tools/hooks/pre-commit`
from the repo root, and type-check with `yarn run typecheck`. See also the
[project style guide](../STYLEGUIDE.md).

## Other Docs

- [Apps Build System](./docs/build.md)
