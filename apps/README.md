# Blockly 20 Hour Curriculum

Blockly is a web-based, graphical programming editor. Users can drag blocks together to build an application. No typing required. Credit goes to these awesome [developers](https://code.google.com/p/blockly/wiki/Credits#Engineers)
and a small army of [translators](https://code.google.com/p/blockly/wiki/Credits#Translators).

This repository contains the source code for the apps [Blockly](https://code.google.com/p/blockly/) based 20 hour curriculum and Hour of Code. Information about Blockly can be found in the [wiki](https://code.google.com/p/blockly/w/list).

- [Quick Start](#quick-start)
- [Contributing](#contributing)

## Quick Start

### Installing Blockly

```
cd apps

# Machine setup (OSX with Homebrew)
brew install node
npm install -g grunt-cli

# Perform first full build
npm install
npm run build
```

### Seeing your development version of Blockly in Dashboard

1. To make your changes show up in dashboard, run the following after the first time you build blockly: [has this been replaced with locals.yml?]
  ```
  cd ../dashboard
  bundle exec rake 'blockly:dev[../apps]'
  cd ../apps
  ```

1. If you find your changes are not showing up within dashboard, you may have accidentally reverted your symlink to point to the pre-built version of blockly (e.g. when switching branches or stashing changes). To check your symlink, run:
```
> ls -l dashboard/public/blockly
```
and look for something like:
```
lrwxr-xr-x  1 laurel  501  12 Apr 27 13:00 dashboard/public/blockly -> apps/build/package
```
If the symlink is in place, then when you run later builds of blockly, your results should show up in Dashboard.

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

#### Running with live-reload server

```
npm start
```

This will perform an initial build, then serve and open a playground with a few sample blockly apps at [http://localhost:8000](http://localhost:8000) and live-reload changes to apps.  Caveats:
* The live-reload server does not pick up changes to blockly-core.  For that, see [Full build with blockly-core](#full-build-with-blockly-core-changes).
* If you get `Error: EMFILE, too many open files` while running the live-reload server (common on OSX) try increasing the OS open file limit by running `ulimit -n 1024` (and adding it to your `.bashrc`).

##### Rebuild only a single app

To have grunt rebuild only a single app, use the `--app` parameter:

```
npm start -- --app=maze
```

##### Rebuild with custom polling interval

The `grunt watch` task when run with a low filesystem polling interval is [known to cause high CPU usage](https://github.com/gruntjs/grunt-contrib-watch/issues/145) on OS X.

To set a custom polling interval, use the `--delay` parameter:

```
npm start -- --delay=5000
```

Since the longer the polling is, the longer the delay before builds can be, we'll try to keep the polling interval a happy medium. The default polling interval is set to 700ms which as of 2/24/2016 uses roughly 10% CPU on a Macbook Pro.

##### Rebuild without live reload

To have grunt rebuild on changes but not run an express server, you can use the constituent commands:

```
MOOC_DEV=1 grunt build watch
```

#### Running tests

```
npm test
```
* If you see an error like `ReferenceError: Blockly is not defined` or notes about missing npm packages, double check that you've run `grunt build` before `grunt test`
* Right now, the tests require a full/production build to pass.  Failures like `Cannot set property 'imageDimensions_' of undefined` in setup steps may indicate that you are testing against a debug build.
* These tests will also be run via Travis CI when you create a pull request

To run an individual test, use the `--grep` option to target a file or Mocha `describe` identifier:

```
npm test -- --grep myTestName # e.g., 2_11, or requiredBlockUtils
```

To debug tests using the webkit inspector, just add a `--debug` flag. This will launch a new browser window with a debugger attached.
Unfortunately, this is also before bundle.js has been loaded, making it difficult to set breakpoints. The best solutions I've found
thus far are to add debugger; statements in your code, or to have your debugger break on caught exceptions, which will generally result
it breaking in some jquery code before running tests (at which point you can go set your breakpoints).

```
npm test -- --grep='testname' --debug
```

We also have the ability to run a faster subset of tests without using grep. In particular, this will run without maze and turtle level tests.
```
npm test -- --fast
```

- You can add new test files as /test/*Tests.js, see `/test/feedbackTests.js` as an example of adding a mock Blockly instance

If you are iterating on a particular test file that doesn't require phantomjs, install global mocha and run your individual test.  It will go way faster since it doesn't need to bundle everything before each run.
```
npm install -g mocha
mocha test/ObserverTest.js
```

#### Full build with blockly-core changes

1. Check out [blockly-core](https://github.com/code-dot-org/blockly-core/) as a sibling directory to blockly.
1. `./build_with_core.sh debug`
  * The `debug` flag builds debug versions of both blockly-core and blockly, suitable for debugging
1. `grunt dev`

### Localization

It's especially important to test your changes with localization when modifying layouts. We support
right-to-left languages and have some special layout tweaks embedded in the CSS to support that.

Running a full localization build can take several minutes. Since localization re-builds javascript files for many languages, the default build target locales are `en_us` and `en_ploc` (pseudolocalized).

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

- In general follow Google's javascript style [guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).
- 80 character line length.
- 2 space indent.
- 4 space indent on long line breaks.
- `npm run lint` should report 0 warnings or errors.
- See our [project style guide](../STYLEGUIDE.md) for details.
