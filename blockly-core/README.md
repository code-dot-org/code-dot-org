# Blockly Core (Code Studio fork)

This is a fork of [Blockly](https://code.google.com/p/blockly/), an open source visual programming environment.

Major additions and changes in this fork:

* Modal editor for function blocks ([function_editor.js](./core/ui/function_editor.js)) 
* Addition of "Functional blocks" and "Contract/Variable Editor" ([contract_editor/](./core/ui/contract_editor/)) for use in the CS in Algebra curriculum
  * Blocks have "Block Value Types" ([block_value_type.js](./core/utils/block_value_type.js))
* Scrolling improvements:
  * auto-scroll on block drag ([scroll_on_block_drag_handler.js](./core/ui/block_space/scroll_on_block_drag_handler.js))
  * scroll on mouse wheel ([scroll_on_wheel_handler.js](./core/ui/block_space/scroll_on_wheel_handler.js))
* New in-toolbox trashcan
* Support for "block limits" ([block_limits.js](./core/ui/block_space/block_limits.js)), toolbox blocks which allow only a certain number of instances in the block space
* Support for new block properties ([block.js](./core/ui/block.js)): invisible, un-deletable, immovable, specify-able via a context menu when `Blockly.editBlocks` is set
* Structure: add folders in [core/](./core) to further categorize classes
* New field types:
  * Image Dropdown ([field_image_dropdown.js](./core/ui/fields/field_image_dropdown.js))
* Refactoring:
  * rename "Workspace" to "BlockSpace" 
  * move many static properties and methods from `blockly.js` into a prototype class `BlockSpaceEditor`
* Playground: add dependency cache and generation script ([tests/update_test_dependencies.sh](./tests/update_test_dependencies.sh)), to allow for testing changes without re-building
  * support for [goog.ui.tweak](https://google.github.io/closure-library/source/closure/goog/demos/tweakui.html)s to configure playground page behavior
  * debug drawing helpers for block bumping 
* Testing: add phantomjs-based test runner [test.sh](./test.sh). Tested in CI at root level of this repository.

## Installation

```
cd blockly-core
npm install
./deploy.sh
```

## Usage

### Playground manual testing page

There is a playground manual testing page at [tests/playground.html](./tests/playground.html), which requires no build step or server running.

`open tests/playground.html`

### Building with apps

This is the most typical use case for code-dot-org fork development.

[Apps (aka Blockly apps)](https://github.com/code-dot-org/code-dot-org/tree/staging/apps) is a set of blockly apps built on top of blockly-core. Follow the [building with core instructions](https://github.com/code-dot-org/code-dot-org/tree/staging/apps#full-build-with-blockly-core-changes) in that repository to build blockly-core into apps.

#### Testing changes

There are a set of utility and integration tests included in `tests/blockly_test.html`, and a playground manual testing page at `tests/playground.html`.

After adding any new files, you will need to run `./update_test_dependencies.sh` to update the test dependency map, which caches file dependencies so edits can be tested and played with without any re-build time.

There are three ways the test suites can be run:

1. `./test.sh` will run the tests in phantomjs
1. To debug failures, you can open the test page in your browser, e.g. `open tests/blockly_test.html` 
1. `./deploy.sh` will also run `./test.sh` at the end of its full rebuild.

##### Other tests covering this package

[Blockly apps](https://github.com/code-dot-org/code-dot-org/tree/staging/apps) contains many tests that target features of blockly-core in the context of the code.org curriculum apps.

Additionally, [Dashboard's UI tests](https://github.com/code-dot-org/code-dot-org/tree/staging/dashboard/test/ui) cover certain features of blockly-core through Cucumber / Selenium scenarios.
