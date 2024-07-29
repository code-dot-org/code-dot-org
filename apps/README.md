# The Apps Package

The **Apps Package** contains most of our client-side JavaScript, particularly the source code for the [Blockly](https://developers.google.com/blockly/) based 20 hour curriculum, Hour of Code, and our Droplet-based levels (including App Lab). Information about Blockly can be found in the [wiki](https://github.com/google/blockly/wiki).

Blockly is a web-based, graphical programming editor. Users can drag blocks together to build an application. No typing required. Credit goes to these awesome [developers](https://github.com/google/blockly/graphs/contributors)
and a small army of translators.

- [Quick Start](#quick-start)
- [Running Tests](#testing)
- [Contributing](#contributing)

## Quick Start

```
cd apps

# Machine setup (macOS with Homebrew)
brew install node
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

See also: [Full build with blockly changes](#full-build-with-blockly-changes)

## Testing

Apps unit tests are run using [jest](https://jestjs.io/) and integration tests are run in a browser using [Karma](https://karma-runner.github.io/). By default they run inside a [headless chrome browser](https://developer.chrome.com/blog/headless-karma-mocha-chai/) but they can also be run in the browser of your choice. See below for information on [writing new tests](#writing-tests).

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
- You probably don't need to keep running `yarn build` while fixing tests, `yarn test --watchTests` will watch and rebuild most test/ and src/ files for you.

### IDE Support

You can run and debug jest unit tests with an IDE extension. For more details, check your IDE's documentation.

* [VSCode](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest)
* [Rubymine/Webstorm](https://www.jetbrains.com/help/webstorm/running-unit-tests-on-jest.html)

### Debugging Karma Tests

To debug tests, your best bet is to run them in Chrome:

```
yarn test:unit --browser=Chrome --watchTests
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

Then you can open up the html report with (note that the exact file path may be
different):

```
open coverage/PhantomJS\ 2.1.1\ \(Mac\ OS\ X\ 0.0.0\)/index.html
```

### Writing Tests

New or updated tests are executed using [jest](https://jestjs.io/). You can add new test files as `/test/unit/\*Tests.js`; see
`/test/unit/feedbackTests.js` as an example of adding a mock Blockly
instance. Note that each test file in `/test/unit/**` should include tests for
exactly one file in `src/**` and the test file should have the same file name as
the file it tests (with `Tests` appended to it): i.e. don't create new unit test
files that test lots and lots of different stuff.

In the event you need certain code to only be available when tests are running,
you can use the `IN_UNIT_TEST` global, which will be set to `true` only when
tests are running. For example:

```
if (IN_UNIT_TEST) {
  console.log("this log line will only show up when tests are run");
}
```

These if statements will be removed from production source files at build time.

### Karma Tests (Deprecated)

Karma is used to run tests that depend on a browser. The test runner starts a server which can serve files in the apps directory to
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

### Full build with blockly changes

1. Check out a local copy of [blockly](https://github.com/code-dot-org/blockly/)
1. Follow the directions in [Building with apps](https://github.com/code-dot-org/blockly#building-with-apps)

### Analyzing bundle sizes

![code-studio-common bundle](https://user-images.githubusercontent.com/1070243/44691985-abe8dc80-aa15-11e8-95a3-0835ca3529df.png)

Bloated javascript bundles getting you down? Run `yarn build:analyze` to generate an interactive treemap visualization of the contents of all of our bundles. This will automatically open the report in your browser, or you can find the generated html page in the apps build directory at code-dot-org/apps/build/package/js/report.html. This uses [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer).

## Localization

It's especially important to test your changes with localization when modifying layouts. We support
right-to-left languages and have some special layout tweaks embedded in the CSS to support that.

Running a full localization build can take several minutes. Since localization re-builds javascript files for many languages, the default build target locale is `en_us`

Note: Using the live-reload server with localization builds is prone to the `Error: EMFILE, too many open files` problem. See the `ulimit` fix [under the live-reload server heading](#running-with-live-reload-server).

### Sending new i18n strings to CrowdIn

To get new strings localized using CrowdIn, we currently run a script in a private repository. Contact a code.org engineer to trigger an update.

## Adding a new npm package

To add a new package using npm, e.g., `lodash`, run: `yarn add --dev lodash`

- `--dev` adds the dependency to node's package.json, freezing the current version
- Because the build process is done in dev mode, include dependencies as devDependencies rather than production dependencies

## Typescript Migration
We are trying out Typescript in our repository, and currently have a combination of Typescript and Javascript files. Typescript files can be added anywhere in `/src`, and will
be linted and built. 

## Contributing

We'd love to have you join our group of contributors!

For notes on our pull process, where to find tasks to work on, etc., see the [Contributing Guide](https://github.com/code-dot-org/code-dot-org/blob/staging/CONTRIBUTING.md).

### Style Guide

- In general, we follow Google's javascript style [guide](https://google.github.io/styleguide/jsguide.html).
- 80 character line length.
- 2 space indent.
- 4 space indent on long line breaks.
- `yarn lint` should report 0 warnings or errors. Try `yarn lint:fix`.
- See our [project style guide](../STYLEGUIDE.md) for more details, including CSS/SCSS styling.

## Other Docs

- [Apps Build System](./docs/build.md)
