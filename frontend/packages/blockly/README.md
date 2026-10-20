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

What each piece does, and why, is specified in `specs/`; `specs/README.md`
is the index, and lists where this package departs from the branch it was
first written on. `docs/COVERAGE.md` tracks how much of apps' Blockly layer
(`apps/src/blockly/`) is here.

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

The demo (`yarn dev`) has a mode for each feature: pick one from the
**Mode** menu, and the instructions on the left say what to try.

## A workspace

A lab renders a workspace with `BlocklyWorkspace`, giving it its blocks, a
toolbox, and the blocks it starts with (`workspace.md`):

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

Several workspaces that share blocks, plugins and a theme, such as a lab's
workspace and the blocks in its instructions, sit inside one
`BlocklyProvider`. A headless compile uses a `Driver` on its own.

## Defining blocks

A block definition is Blockly's
[JSON block format](https://developers.google.com/blockly/guides/create-custom-blocks/define/json-and-js)
with its code generator beside it, and with fields, extensions, mixins,
mutators and connection types given as objects rather than names
(`definitions.md`). `defineBlock` only types it.

The `move_forward` block above is a statement block: `previousStatement`
and `nextStatement` give it its top and bottom notches. Its `style` names a
block style of the theme (THM-6). Its `javascript` generator receives the
block, Blockly's JavaScript generator, and the environment; a value block's
returns its code and its precedence, `[code, Order.ATOMIC]`. A definition
may also give a `simple` generator, for the second, simpler language a lab
may generate (DEF-14).

## Environments

The environment is an object every generator, extension, mixin and mutator
receives (DEF-16). The Driver keeps the workspaces in it
(`mainWorkspace`, `hiddenWorkspaces`, `embeddedWorkspaces`; DEF-17), and a
lab adds what its blocks need:

```tsx
import {useState} from 'react';

import {BlocklyWorkspace, defineBlock} from '@code-dot-org/blockly';
import type {Environment} from '@code-dot-org/blockly';

interface MazeEnvironment extends Environment {
  speed: number;
}

// `Environment` admits any field, so a generator reads the lab's own.
const move = defineBlock({
  type: 'maze_move',
  tooltip: '',
  message0: 'move',
  previousStatement: true,
  nextStatement: true,
  generator: {
    javascript: (block, _generator, environment) =>
      `Maze.move(${environment.speed}, 'block_id_${block.id}');\n`,
  },
});

export const Maze = () => {
  // One object for the workspace's life: the Driver keeps it (DEF-16).
  const [environment] = useState(() => ({speed: 2}) as MazeEnvironment);
  return <BlocklyWorkspace blocks={[move]} environment={environment} />;
};
```

## Plugins

A plugin is an object a definition or a workspace names; the package
registers it when it is needed and removes it with the Driver (DEF-21).

| Kind     | Does                                         | Given                         |
| -------- | -------------------------------------------- | ----------------------------- |
| `field`  | adds a field                                 | as an argument's `type`       |
| `input`  | gives a connection type its notch shape      | in `plugins`, or as a `check` |
| `global` | runs once, before any workspace is injected  | in `plugins`                  |
| `inject` | is built for each main workspace, and undone | in `plugins`                  |

The package's own:

| Plugin                                | What                                        | Spec              |
| ------------------------------------- | ------------------------------------------- | ----------------- |
| `CdoFieldDropdown`                    | apps' dropdown, with `config` and `???`     | `fields.md`       |
| `fieldColourPlugin`                   | Blockly's colour field and colour blocks    | `fields.md`       |
| `FieldButton`                         | a button on a block                         | `fields.md`       |
| `createReactField`                    | a field whose editor is React               | `react-fields.md` |
| `RectangleInputPlugin` and the others | notch shapes                                | `inputs.md`       |
| `plugins/sharableProcedures`          | Blockly's shareable procedure blocks        | `procedures.md`   |
| `plugins/scrollOptions`               | apps' scrolling                             | `plugins.md`      |
| `plugins/toolboxTrashcan`             | a trashcan over the toolbox                 | `plugins.md`      |
| `plugins/blockLimits`                 | how many of a block a student may still add | `plugins.md`      |
| `plugins/disableOrphans`              | disables blocks not attached to anything    | `plugins.md`      |
| `plugins/grayOutUndeletableBlocks`    | grays the blocks a student cannot delete    | `plugins.md`      |

### Fields

A field plugin wraps a Blockly field class, and a definition names the
plugin, not a string, as the argument's `type`. However many definitions
name it, it is registered once:

```ts
import * as Blockly from 'blockly/core';

import {defineBlock, PluginType} from '@code-dot-org/blockly';
import type {FieldPlugin} from '@code-dot-org/blockly';

class ShoutField extends Blockly.FieldTextInput {
  static fromJson() {
    return new ShoutField('hello', text => `${text}!`);
  }
}

const shoutField: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_shout',
  field: ShoutField,
};

export const say = defineBlock({
  type: 'say',
  tooltip: '',
  message0: 'say %1',
  args0: [{type: shoutField, name: 'TEXT'}],
  previousStatement: true,
  nextStatement: true,
  generator: {
    javascript: block =>
      `say(${JSON.stringify(block.getFieldValue('TEXT'))});\n`,
  },
});
```

### Connection types

An input plugin gives a connection type its notch, so that the blocks that
fit together look it (`inputs.md`). The blocks name the type as Blockly
does, by a string in `output` and `check`; the plugin is given to the
workspace:

```tsx
import {BlocklyWorkspace, RectangleInputPlugin} from '@code-dot-org/blockly';

// Each block naming `Location` in `output` or `check` gets a square notch.
export const Editor = () => (
  <BlocklyWorkspace plugins={[RectangleInputPlugin('Location')]} />
);
```

`RoundInputPlugin` and `TriangleInputPlugin` draw a semicircle and a
triangle.

## Extensions and mixins

An extension is a function run on each new block of the types that list
it, with the environment as its argument; a mixin is properties and
methods given to them (DEF-11, DEF-18).
`defineExtension` and `defineMixin` type them, and a definition lists them
in `extensions` and `mixins`:

```ts
import {defineBlock, defineExtension, defineMixin} from '@code-dot-org/blockly';

const COLOURS = ['#c00', '#0a0', '#00c'];

const randomColour = defineExtension('random_colour', {
  extension() {
    this.setColour(COLOURS[Math.floor(Math.random() * COLOURS.length)]);
  },
});

const describable = defineMixin('describable', {
  describe(this: {type: string}) {
    return `a ${this.type} block`;
  },
});

export const confetti = defineBlock({
  type: 'confetti',
  tooltip: '',
  message0: 'confetti',
  previousStatement: true,
  nextStatement: true,
  extensions: [randomColour],
  mixins: [describable],
  generator: {javascript: () => 'confetti();\n'},
});
```

## Themes

`themes` holds the ten themes by name, and `themeOptions` the five a
settings menu offers; each has a dark variant named `<name>-dark`
(`themes.md`). A workspace's `theme`, or a provider's, may change at any
time.

## The rest

| Piece                                     | What                                                | Spec                 |
| ----------------------------------------- | --------------------------------------------------- | -------------------- |
| `BaseBlocks`                              | the blocks labs share, and Blockly's own            | `common-blocks.md`   |
| `serialization.positionBlocksOnWorkspace` | where loaded blocks go                              | `layout.md`          |
| `@code-dot-org/blockly/xml`               | Blockly XML to JSON without a workspace             | `xml-toolbox.md`     |
| `@code-dot-org/blockly/utils`             | toolbox, code and block helpers                     | `xml-toolbox.md`     |
| `createTypedVariable`                     | variables of one type, with their getter and setter | `typed-variables.md` |
| `BlocklyFlyout`                           | blocks to drag from outside the workspace           | `flyout.md`          |
| `BlocklyMarkdown`                         | markdown with blocks in it                          | `markdown.md`        |
| `fields/miniToolbox`                      | a `+` on a block that opens a flyout inside it      | `mini-toolbox.md`    |
