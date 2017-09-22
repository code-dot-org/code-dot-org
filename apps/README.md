# The Apps Package

The **Apps Package** contains most of our client-side JavaScript, particularly the source code for the [Blockly](https://developers.google.com/blockly/) based 20 hour curriculum, Hour of Code, and our Droplet-based levels (including App Lab). Information about Blockly can be found in the [wiki](https://github.com/google/blockly/wiki).

Blockly is a web-based, graphical programming editor. Users can drag blocks together to build an application. No typing required. Credit goes to these awesome [developers](https://github.com/google/blockly/graphs/contributors)
and a small army of translators.

- [Quick Start](#quick-start)
- [Contributing](#contributing)

## Quick Start

### Installing Apps

```
cd apps

# Machine setup (OSX with Homebrew)
brew install node
npm install -g grunt-cli yarn@0.23.2

# Perform first full build
yarn
npm run build
npm rebuild node-sass

# automatically rebuild every time you make changes to source files
npm run start

# or, if you want it to rebuild even faster, do this instead:
CHEAP=1 npm run start
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
If the symlink is in place, then as you rebuild apps, your results should show up in Dashboard.  If not, run through step 1 again.

### Building during development

#### Full build

To run a full development build (minus localization):

```
npm run build
```

* `npm run build` builds a 'debug' version with more readable javascript
* `npm run build -- --app=maze` builds a 'debug' version of only the maze app
* `npm run build:dist` builds a minified version suitable for production
* `npm run clean` will clean the build directory

See also: [Full build with blockly-core](#full-build-with-blockly-core-changes)

#### Running tests

```
npm test
```
* If you see an error ~like `ReferenceError: Blockly is not defined` or notes~ about missing npm packages, double check that you've run `npm run build` beforehand.
* ~Right now, the tests require a full/production build to pass.  Failures like `Cannot set property 'imageDimensions_' of undefined` in setup steps may indicate that you are testing against a debug build.~
* These tests will also be run via Circle CI when you create a pull request

To run an individual test, use the `--entry` option with `npm run test:entry` to target a file:

```
npm run test:entry -- --entry ./test/unit/gridUtilsTest.js
```

This option also works on directories, in which case all files within that
directory and any subdirectories will be run:

```
npm run test:entry -- --entry ./test/unit/applab/
```

It's also possible to run an individual test or subset of tests with:

```
npm run test:unit -- --grep='TutorialExplorer'
```

To run integration tests for a certain level type:
```
LEVEL_TYPE=applab npm run test:integration
```

You can also use the `--grep` flag with integration tests:
```
LEVEL_TYPE=applab npm run test:integration --grep ec_data_blocks
```

##### Rerun Tests Automatically #####

To rerun tests automatically on every file change, set the environment variable
`WATCH=1`:

```
WATCH=1 npm run test:unit
```

This will work on any of the test commands.

##### Debugging Tests #####

To debug tests, your best bet is to run them in Chrome. Keep in mind that there
can be subtle differences between Chrome and PhantomJS, so after fixing your
test in Chrome, make sure it still works in PhantomJS. To run the tests in
Chrome, use the `BROWSER` environment variable in conjunction with `WATCH`:

```
BROWSER=Chrome WATCH=1 npm run test:unit
```

A new chrome browser window will open where the tests will be running. You can
click on the Debug button to open a new tab where you can then open the
developer console to see everything that is happening. If you don't see the new
chrome browser window, it may have opened *behind* your other windows.

##### Coverage Reports #####

Coverage reports can be generated for any collection of tests by specifying the
`COVERAGE=1` environment variable. Results will be placed in the `coverage`
folder. For example, to see what code gets executed by unit tests, run:

```
COVERAGE=1 npm run test:unit
```

Then you can open up the html report with (note that the exact file path may be
different):

```
open coverage/PhantomJS\ 2.1.1\ \(Mac\ OS\ X\ 0.0.0\)/index.html
```

##### Writing Tests #####

You can add new test files as /test/unit/*Tests.js; see
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

The test runner starts a server which can serve files in the apps directory to
your test code. Only whitelisted files and directories are available. See the
`config.karma.options.files` array in `Gruntfile.js` for the whitelist. When
fetching files served by the test runner, prefix the file path with
`/base/`. For example, to load the `test/audio/assets/win.mp3` file in an
`<audio>` tag inside your test, you could write:

```
document.write('<audio src="/base/test/audio/assets/win.mp3"/>');
```

#### UI Component Style Guide ####

We use `react-storybook` to generate a ui component style guide that you can use
to discover what components are available to reuse as you build new
features. You can also use the style guide to more easily develop new components
without having to run all of code.org.

To view the styleguide run

```
npm run storybook
```

and browse to http://localhost:9001/.

You can add new sections to the styleguide (perhaps for a new component you are
building) by adding the following code:

```javascript
if (IN_STORYBOOK) {
  SomeComponent.styleGuideExamples = storybook => {
    return storybook
      .storiesOf('SomeComponent', module)
      .add(
        'Example #1',
        () => <Component/>
      )
  };
}
```

By wrapping your code in a `IN_STORYBOOK` check, you can guarantee that it
won't appear in production builds. See the
[react-storybook documentation](https://github.com/kadirahq/react-storybook) for
more information on how to use the `storybook` api.

##### Static Styleguide #####

A static version of the styleguide is hosted at https://code-dot-org.github.io/cdo-styleguide/

#### Full build with blockly changes

1. Check out a local copy of [blockly](https://github.com/code-dot-org/blockly/)
1. Follow the directions in [Building with apps](https://github.com/code-dot-org/blockly#building-with-apps)

### Localization

It's especially important to test your changes with localization when modifying layouts. We support
right-to-left languages and have some special layout tweaks embedded in the CSS to support that.

Running a full localization build can take several minutes. Since localization re-builds javascript files for many languages, the default build target locale is `en_us`

Note: Using the live-reload server with localization builds is prone to the `Error: EMFILE, too many open files` problem.  See the `ulimit` fix [under the live-reload server heading](#running-with-live-reload-server).

#### Forwarding new strings on to CrowdIn

To get new strings localized using CrowdIn, we currently run a script in a private repository. Contact a code.org engineer to trigger an update.

### Adding a new npm package

To add a new package using npm, e.g., `lodash`, run: `npm i --save-dev lodash`

- `--save-dev` adds the dependency to node's package.json, freezing the current version
- Because the build process is done in dev mode, include dependencies as devDependencies rather than production dependencies

## Contributing

We'd love to have you join our group of contributors!

For notes on our pull process, where to find tasks to work on, etc., see the [Contributing Guide](https://github.com/code-dot-org/code-dot-org/blob/staging/CONTRIBUTING.md).

### Style Guide

- In general follow Google's javascript style [guide](https://google.github.io/styleguide/jsguide.html).
- 80 character line length.
- 2 space indent.
- 4 space indent on long line breaks.
- `npm run lint` should report 0 warnings or errors.
- See our [project style guide](../STYLEGUIDE.md) for details.

## Other Docs

- [Apps Build System](./docs/build.md)
