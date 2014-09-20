# Blockly Core

This is a fork of [Blockly](https://code.google.com/p/blockly/), an open source visual programming environment.

## Installation

```
cd blockly-core
./deploy.sh
```

## Usage

### With Blockly (apps)

This is the most typical use case for current development.

[Blockly (aka Blockly apps)](http://github.com/code-dot-org/blockly) is a set of blockly apps built on top of blockly-core. Follow the [building with core instructions](https://github.com/code-dot-org/blockly#full-build-with-blockly-core-changes) in that repository to build blockly-core into blockly.

#### Testing changes

[Blockly apps](http://github.com/code-dot-org/blockly) contains many tests that target features of blockly-core in the context of the code.org curriculum apps.

Additionally, [Dashboard's UI tests](https://github.com/code-dot-org/dashboard/tree/finished/test/ui) cover certain features of blockly-core through Cucumber / Selenium scenarios.

To run a handful of utility tests:

1. `./deploy.sh debug` which builds blockly_uncompressed.js
2. Open the test page in your browser: `open tests/blockly_test.html`

### Standalone usage

_Note: the following usage instructions **may have fallen out of date**, as the sample apps in this fork are unmaintained. See [Blockly apps](http://github.com/code-dot-org/blockly) for up-to-date information on using this fork in the context of code.org blockly apps, or upstream [Blockly's project page](https://code.google.com/p/blockly/) for the most recent demo apps._

- Open blockly-core/apps/index.html and select an app to play around with.
- To run in debug/dev mode, find where the specific app you're working on sources `blockly_compressed.js` and change it to `blockly_uncompressed.js` (eg, /maze/template.soy). If that is in a .soy file, make sure to recompile the template. Instructions for recompiling templates are usually at the top of the template.
