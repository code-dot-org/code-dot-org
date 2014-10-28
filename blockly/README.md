# Blockly 20 Hour Curriculum

Blockly is a web-based, graphical programming editor. Users can drag blocks together to build an application. No typing required. Credit goes to these awesome [developers](https://code.google.com/p/blockly/wiki/Credits#Engineers)
and a small army of [translators](https://code.google.com/p/blockly/wiki/Credits#Translators).

This repository contains the source code for the apps [Blockly](https://code.google.com/p/blockly/) based 20 hour curriculum and Hour of Code. Information about Blockly can be found in the [wiki](https://code.google.com/p/blockly/w/list).

- [Quick Start](#quick-start)
- [Contributing](#contributing)

## Quick Start

### Install prerequisite: Cairo

One of the node modules, node-canvas, depends on Cairo being installed.

Instructions for MacOSX using [brew](http://brew.sh/) (instructions for other platforms [can be found here](https://github.com/LearnBoost/node-canvas/wiki)):

1. Install [XQuartz from here](http://xquartz.macosforge.org/landing/)
1. `export PKG_CONFIG_PATH="$PKG_CONFIG_PATH:/opt/X11/lib/pkgconfig"`
1. `brew update`
1. `brew install cairo`
1. In blockly, `npm install`

### Installing Blockly

```
cd blockly

# Machine setup (OSX with Homebrew)
brew install node
npm install -g grunt-cli

# Perform first full build
```
npm install
MOOC_DEV=1 grunt build
```

### Seeing your development version of Blockly in Dashboard

1. To make your changes show up in dashboard, run the following after the first time you build blockly:
  ```
  cd ../dashboard
  bundle exec rake 'blockly:dev[../blockly]'
  cd ../blockly
  ```

1. If you find your changes are not showing up within dashboard, you may have accidentally reverted your symlink to point to the pre-built version of blockly (e.g. when switching branches or stashing changes). To check your symlink, run:
  ```
  git status
  ```
and look for something like `public/blockly -> blockly-package` in the output. [NEEDS VALIDATION].

1. If the symlink is in place, then when you run later builds of blockly, your results should show up in Dashboard.

### Building during development

#### Full build

To run a full build (minus localization):

```
MOOC_DEV=1 grunt build
```

* `MOOC_DEV=1` builds a 'debug' version with more readable javascript
* `grunt rebuild` does a `clean` before a `build`

#### Running with live-reload server

```
grunt dev
open http://localhost:8000
```

This will serve a few sample blockly apps at [http://localhost:8000](http://localhost:8000).

Note: this does not update asset files. For that, use a full `grunt build`.

##### Rebuild only a single app

To have grunt rebuild only a single app, use the MOOC_APP parameter:

```
MOOC_APP=studio grunt dev
```

##### Build a single foreign language

To have grunt build a single foreign language, use the MOOC_LOCALE parameter. This will build en_us, en_loc, and the specified locale

```
MOOC_LOCALE=ar_sa grunt build
```

#### Running tests

```
grunt build # run a build before testing
grunt test
```

* If you see an error like `ReferenceError: Blockly is not defined` or notes about missing npm packages, double check that you've run `grunt build` before `grunt test`
* `grunt test` will also be run via Travis CI when you create a pull request

To run an individual test, use the `--grep` option to target a file or Mocha `describe` identifier:

```
grunt test --grep myTestName # e.g., 2_11, or requiredBlockUtils
```

To debug tests using the node-inspector Chrome-like debugger:

```
npm install -g node-inspector
node-inspector &
# open debugger URL
node --debug-brk $(which grunt) --grep='testname'
# This will breakpoint your inspector at the beginning of that test
```

- You can add new test files as /test/*Tests.js, see `/test/feedbackTests.js` as an example of adding a mock Blockly instance
- Blockly tests typically target built files in the `build/js` folder


#### Full build with blockly-core changes

1. Check out [blockly-core](https://github.com/code-dot-org/blockly-core/) as a sibling directory to blockly.
1. `./build_with_core.sh debug`
  * The `debug` flag builds debug versions of both blockly-core and blockly, suitable for debugging
1. `grunt dev`

### Localization

It's especially important to test your changes with localization when modifying layouts. We support
right-to-left languages and have some special layout tweaks embedded in the CSS to support that.

Running a full localization build can take several minutes. Since localization re-builds javascript files for many languages, the default build target locales are `en_us` and `en_ploc` (pseudolocalized). To build
all available locales, specify `MOOC_LOCALIZE=1` in your environment when running a task:

```bash
MOOC_LOCALIZE=1 grunt rebuild
```

Note: if you're running the `grunt dev` live-reload server and get the error `too many open files` after a localization build, try increasing the OS open file limit by running `ulimit -n 1024` (and adding it to your `.bashrc`).

#### Forwarding new strings on to CrowdIn

To get new strings localized using CrowdIn, we currently run a script in a private repository. Contact a code.org engineer to trigger an update.

### Adding a new npm package

To add a new package using npm, e.g., `lodash`, run: `npm i --save-dev lodash`

- `--save-dev` adds the dependency to node's package.json, freezing the current version
- Because the build process is done in dev mode, include dependencies as devDependencies rather than production dependencies

## Contributing

We'd love to have you join our group of contributors!

For notes on our pull process, where to find tasks to work on, etc.—see the Dashboard [contribution guide](https://github.com/code-dot-org/dashboard#contributing).

### Style Guide

- In general follow Google's javascript style [guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).
- 80 character line length.
- 2 space indent.
- 4 space indent on long line breaks.
- `grunt jshint` should report 0 warnings or errors.
