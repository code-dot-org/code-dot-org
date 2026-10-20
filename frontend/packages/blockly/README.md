# @code-dot-org/blockly

Code.org's layer over [Google Blockly](https://developers.google.com/blockly)
for the labs in `frontend/packages/labs/`.

Blockly registers block types, fields, extensions and mutators globally, by
name, and leaves it to its user to register each before it is needed and to
remove it afterwards. This package lets a block definition carry what it
uses by reference, registers all of it when the definition is registered,
and removes it when the `Driver` that registered it is deconstructed. Each
Driver also carries an _environment_, an object the lab defines, that block
code receives in place of global state.

The package is landing in parts. `specs/README.md` lists them and their
order; each part's behaviour is specified in `specs/`. Until part 1b lands
there is no workspace component, and the Driver is used on its own:

```ts
import {Driver, defineBlock} from '@code-dot-org/blockly';
import type {Environment} from '@code-dot-org/blockly';
import ThrasosRenderer from '@code-dot-org/blockly/renderers/thrasos';
import DefaultTheme from '@code-dot-org/blockly/themes/default';

const moveForward = defineBlock({
  type: 'move_forward',
  tooltip: 'Move forward one space.',
  message0: 'move forward',
  style: 'default',
  previousStatement: true,
  nextStatement: true,
  generator: {
    javascript: block => `Maze.moveForward('block_id_${block.id}');\n`,
  },
});

const driver = new Driver({} as Environment, ThrasosRenderer, DefaultTheme);
driver.setBlocks([moveForward]);
// Blockly now knows `move_forward` and how to generate its code.
driver.deconstruct();
```

## Commands

Run from this directory, with Node 22:

```
yarn build       # dist/, then a typecheck
yarn test        # unit tests, under jsdom
yarn typecheck
yarn lint
```
