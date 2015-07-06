# Blockly Core

This is a fork of [Blockly](https://code.google.com/p/blockly/), an open source visual programming environment.

## Installation

```
cd blockly-core
npm install
./deploy.sh
```

## Usage

### With Blockly (apps)

This is the most typical use case for current development.

[Apps (aka Blockly apps)](https://github.com/code-dot-org/code-dot-org/tree/staging/apps) is a set of blockly apps built on top of blockly-core. Follow the [building with core instructions](https://github.com/code-dot-org/code-dot-org/tree/staging/apps#full-build-with-blockly-core-changes) in that repository to build blockly-core into apps.

#### Testing changes

[Blockly apps](https://github.com/code-dot-org/code-dot-org/tree/staging/apps) contains many tests that target features of blockly-core in the context of the code.org curriculum apps.

Additionally, [Dashboard's UI tests](https://github.com/code-dot-org/code-dot-org/tree/staging/dashboard/test/ui) cover certain features of blockly-core through Cucumber / Selenium scenarios.

There are three ways to run the handful of utility tests:

1. `./deploy.sh` rebuilds blockly-core and then runs the tests.
2. `./test.sh` will just run the tests against the last version of blockly you built.
3. Or, open the test page in your browser: `open tests/blockly_test.html`

### Standalone usage

_Note: the following usage instructions **may have fallen out of date**, as the sample apps in this fork are unmaintained. See [Blockly apps](https://github.com/code-dot-org/code-dot-org/tree/staging/apps) for up-to-date information on using this fork in the context of code.org blockly apps, or upstream [Blockly's project page](https://code.google.com/p/blockly/) for the most recent demo apps._

- Open blockly-core/apps/index.html and select an app to play around with.
- To run in debug/dev mode, find where the specific app you're working on sources `blockly_compressed.js` and change it to `blockly_uncompressed.js` (eg, /maze/template.soy). If that is in a .soy file, make sure to recompile the template. Instructions for recompiling templates are usually at the top of the template.
