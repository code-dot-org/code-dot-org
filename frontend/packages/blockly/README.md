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
order; each part's behaviour is specified in `specs/`.

A lab renders a workspace with `BlocklyWorkspace`:

```tsx
import {BlocklyWorkspace, defineBlock} from '@code-dot-org/blockly';

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

export const Editor = () => (
  <BlocklyWorkspace
    blocks={[moveForward]}
    toolbox={{name: 'Moves', blocks: ['move_forward']}}
    onChange={event => console.log(event.type)}
  />
);
```

Several workspaces that should share blocks, plugins and a theme sit inside
one `BlocklyProvider`. A headless compile uses a `Driver` on its own.

## Commands

Run from this directory, with Node 22:

```
yarn dev            # the demo, in demo/
yarn build          # dist/, then a typecheck
yarn test           # unit tests, under jsdom
yarn test:browser   # tests that need a real browser, in headless Chromium
yarn typecheck
yarn lint
```
