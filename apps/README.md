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

# Perform first full build
npm install
npm run build
```

### Building during development

#### Incremental development-mode build

Start up the development server:

```
./up
```

See also: [Full build with blockly-core](#full-build-with-blockly-core-changes)

#### Running with live-reload server

```
npm start
open http://localhost:8000
```

This will serve a few sample blockly apps at [http://localhost:8000](http://localhost:8000) and live-reload changes to blockly.  Caveats:
* The live-reload server does not pick up changes to blockly-core.  For that, see [Full build with blockly-core](#full-build-with-blockly-core-changes).
* If you get `Error: EMFILE, too many open files` while running the live-reload server (common on OSX) try increasing the OS open file limit by running `ulimit -n 1024` (and adding it to your `.bashrc`).

#### Running tests

```
npm run build # run a non-incremental build before testing
npm test
```
* If you see an error like `ReferenceError: Blockly is not defined` or notes about missing npm packages, double check that you've run `npm run build` before `npm test`
* Right now, the tests require a full/production build of blockly-core to pass.  Failures like `Cannot set property 'imageDimensions_' of undefined` in setup steps may indicate that you are testing against a debug build.
* `npm test` will also be run via Travis CI when you create a pull request

To run an individual test, use the `--grep` option to target a file or Mocha `describe` identifier:

```
npm test -- --grep myTestName # e.g., 2_11, or requiredBlockUtils
```

To debug tests using the node-inspector Chrome-like debugger:

```
npm install -g node-inspector
node-inspector &
# open debugger URL, i.e. http://127.0.0.1:8080/debug?port=5858
node --debug-brk npm test -- --grep='testname'
# This will breakpoint your inspector at the beginning of that test
```
- You can add new test files as /test/*Tests.js, see `/test/feedbackTests.js` as an example


#### Full build with blockly-core changes

1. Check out [blockly-core](https://github.com/code-dot-org/code-dot-org/tree/staging/blockly-core) as a sibling directory to `apps`.
1. `./build_with_core.sh debug`
  * The `debug` flag builds debug versions of both blockly-core and blockly, suitable for debugging
1. `npm start`

### Localization

It's especially important to test your changes with localization when modifying layouts. We support
right-to-left languages and have some special layout tweaks embedded in the CSS to support that.

Note: Using the live-reload server with localization builds is prone to the `Error: EMFILE, too many open files` problem.  See the `ulimit` fix [under the live-reload server heading](#running-with-live-reload-server).

#### Forwarding new strings on to CrowdIn

To get new strings localized using CrowdIn, we currently run a script in a private repository. Contact a code.org engineer to trigger an update.

### Adding a new npm package

To add a new package using npm, e.g., `lodash`, run: `npm i --save-dev lodash`

- `--save-dev` adds the dependency to node's package.json, freezing the current version
- Because the build process is done in dev mode, include dependencies as devDependencies rather than production dependencies

## Contributing

We'd love to have you join our group of contributors!

For notes on our pull process, where to find tasks to work on, etc.—see our main [contribution guide](https://github.com/code-dot-org/code-dot-org#contributing).

### Style Guide

- In general follow Google's javascript style [guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).
- 80 character line length.
- 2 space indent.
- 4 space indent on long line breaks.
- `npm run lint` should report 0 warnings or errors.
