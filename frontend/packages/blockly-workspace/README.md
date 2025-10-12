# Blockly Workspace

This package organizes all of the supporting code related to the
[Google Blockly](https://developers.google.com/blockly) library.

In this package, there are two React components that do some of the heavy
lifting of embedding a Blockly workspace into a view.

You, then, pass along options to that workspace component to shape that
workspace in terms of the blocks available, starting blocks that will
initially appear in that workspace, themes, plugins, and the shared
environment containing any other data that might be useful throughout
the Blockly space.

Here are a few considerations that are usually a challenge in Blockly that
are solved in some way with this package:

* **Block definitions are very loose** - There are a variety of ways to define blocks and supplying fields, extensions, etc is cumbersome to manage since they are defined in the block by name but registered elsewhere. This package maintains a [comprehensive extension](#defining-blocks) to the JSON block specification to address this. It also provides a means of organizing [block extensions and mixins](#block-extensions-and-mixins).
* **Global data is difficult to wrangle** - Sometimes blocks need to know (or mutate) some global state during events or generation. Having block functions reference global data makes the codespace very gnarly, however this package introduces a [typed Environment block](#environments) that is available to all blocks, fields, and their extensions.
* **Plugins are loosely supported** - Blockly plugins for various tasks are only loosely supported officially via their registry. Supplying them is challenging due to having to register them, ideally, just-in-time as blocks that use them are registered. In many cases, it is difficult to know if a field plugin, for instance, is actually needed until you see the defined blocks. This package provides a wide range of [plugin interfaces](#plugins) beyond the official ones that can be supplied together yet registered at just the appropriate times (and unregistered after the workspace lifetime).

## Defining a workspace

A Blockly workspace is largely coordinated around the `BlocklyWorkspace`
component. You can create a new workspace by simply rendering such a
component.

## Defining blocks

Supplying the `blocks` property will supply the workspace with new, custom
blocks. For this, each block will be defined with the `BlockDefinition` type.

For example, we can create a 'Move Forward' block:

```
import type {BlockDefinition} from '@code-dot-org/blockly-workspace';

const blocks: BlockDefinition[] = [
  {
    type: 'move_forward',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: 'Move me forward one space.',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'move forward',
    generator: {
      javascript(block: Blockly.Block) {
        return `Maze.moveForward('block_id_${block.id}');\n`;
      },
    },
  },
];
```

This creates a block of type `move_forward` which gets a default style, which is
appropriate for general actions. That style is specified as a term that relates
to an entry in the `Theme`. More information about themes and the possible
categories is in a following section.

The JavaScript generator produces some basic code to call a `Maze.moveForward`
function while passing the block id, which will uniquely identify that exact
`move_forward` block in the workspace. This is useful context for doing things
like block highlighting and potential visualization of errors.

This block has 'nubs' on the top and bottom and is generally a 'statement' style
block since the `previousStatement` and `nextStatement` are set. It has some basic
metadata via the `helpUrl` and `tooltip` properties.

The metadata as a whole is largely matching the
[JSON serialization](https://developers.google.com/blockly/guides/create-custom-blocks/define/json-and-js)
format for Blockly blocks. The additional `generator` helps keep JavaScript generation
alongside the block definition. Furthermore, there are augmented means of passing
along Plugins and Field implementations by reference instead of by name that go
further than the original Blockly intention, but help keep such custom classes
initialized when needed and unregistered when a new Blockly workspace is introduced.
More information about plugins, extensions, and mutators will follow below.

## Environments

One useful feature to use is to type an `Environment` which can contain global state
information visible to all blocks. The base `Environment` will always contain
references to the current main and hidden workspaces. A custom lab can extend this
type with its own shared state as needed.

Here's a full example of how to apply information in the environment to blocks:

```
const blocks: BlockDefinition[] = [
  {
    type: 'my-block',
    message0: 'This is a block.',
    generator: {
      javascript(block: Blockly.Block, _javascriptGenerator: JavascriptGenerator, environment: Environment) {
        return `Maze.moveForward('workspace_id_${environment.mainWorkspace.id}', 'block_id_${block.id}');\n`;
      },
    },
  },
];

const LabFoo: React.FunctionComponent = () => {
  const environment = useRef<Environment>({});

  return (
    <BlocklyWorkspace
      blocks={blocks}
      environment={environment.current}
    />
  );
};
```

In this simplified case, the `my-block` block will, when generated, have access to
the mainWorkspace. This is also available via the `block` in cases where that block
is visible on the intended workspace, but this is not always true. That is, this is
useful in cases where a block in the hidden workspace wants to look at the main
workspace and vice-versa without needing to put those references in some outside
global space.

The `Environment` is also available to block extensions. When defining an extension
you have access to the `Environment` in the extension function that is added to
the block. Here is a practical example where we want to draw a border around a
block that is in the main workspace for certain 'grouped' block types. The
`BlockSvgFrame` is an implementation we wrote elsewhere and imported. We then
attach this extension on the `extensions` property of the `BlockDefinition`.

```
import * as Blockly from 'blockly';

import type {Environment, Extension} from '@code-dot-org/blockly-workspace';

export const behaviorsBlockFrame: Extension = {
  name: 'behaviors_block_frame',
  extension: function (this: Blockly.BlockSvg, environment: Environment) {
    let functionalSvg: BlockSvgFrame | undefined;

    if (
      this.workspace === environment.mainWorkspace
    ) {
      // Used to create and render an SVG frame instance.
      const getColor = () => {
        return this.style?.colourPrimary;
      };

      functionalSvg = new BlockSvgFrame(
        this,
        'Behavior',
        'blocklyFunctionalFrame',
        getColor,
      );

      this.setOnChange(function (this: Blockly.BlockSvg) {
        if (!this.isInFlyout) {
          functionalSvg?.render();
        }
      });
    }
  },
};
```

This way, we can apply block extensions with per-workspace state without resorting
to global data.

We can extend this type via TypeScript and use that to add more specific properties
to this state. For instance, if we want to add a 'noFunctionBlockFrame' field to
turn off the block frame behavior above, we can add that field as a boolean to our
own `Environment` block.

```
import * as Blockly from 'blockly';

import type {Environment, Extension} from '@code-dot-org/blockly-workspace';

export interface FooEnvironment extends Environment {
  noFunctionBlockFrame: boolean;
}

export const behaviorsBlockFrame: Extension = {
  name: 'behaviors_block_frame',
  extension: function (this: Blockly.BlockSvg, environment: FooEnvironment) {
    let functionalSvg: BlockSvgFrame | undefined;

    if (
      this.workspace === environment.mainWorkspace
      && !environment.noFunctionBlockFrame
    ) {
      // Used to create and render an SVG frame instance.
      const getColor = () => {
        return this.style?.colourPrimary;
      };

      functionalSvg = new BlockSvgFrame(
        this,
        'Behavior',
        'blocklyFunctionalFrame',
        getColor,
      );

      this.setOnChange(function (this: Blockly.BlockSvg) {
        if (!this.isInFlyout) {
          functionalSvg?.render();
        }
      });
    }
  },
};

const blocks: BlockDefinition[] = [
  {
    type: 'my-block',
    message0: 'This is a block.',
    extensions: [behaviorsBlockFrame],
    generator: {
      javascript() {
        return '';
      },
    },
  },
];

const LabFoo: React.FunctionComponent = () => {
  const environment = useRef<FooEnvironment>({
    noFunctionBlockFrame: true,
  });

  return (
    <BlocklyWorkspace
      blocks={blocks}
      environment={environment.current}
    />
  );
};
```

For more information on block extensions and mixins, read the
[Block Extensions and Mixins](#block-extensions-and-mixins) section for
more information.

## Themes

TBD

## Plugins

To facilitate extending the Blockly ecosystem, there are a series of plugin types
that alter different aspects of the environment. They are summarized as follows:

* `FieldPlugin` - These add new interactive fields to blocks.
* `InputPlugin` - These add new visual indications of block types via altering the 'nubs' of blocks.
* `GlobalPlugin` - These will be registered before the workspace is injected.
* `InjectPlugin` - These are registered after the workspace is injected.

You can supply these in bulk via the `plugins` property of the `BlocklyWorkspace`
component. However, they are often more conveniently supplied alongside block
definitions when appropriate.

### Fields

One powerful way to extend Blockly is to introduce new fields. A Field is some
area of input provided by the block. Generally, it is interactive and typically
visual in nature. A few examples would be a custom dropdown, a widget that
visually depicts angles, color pickers, etc.

Typically in Blockly, a field is defined as a class implementation of the
`Blockly.Field` interface which is registered just before blocks need them.
That field is given a name upon registration that is then used by the blocks
within their block definition in the argument's `type` property.

Some
[built-in fields](https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/overview)
already exist. For instance, specifying the `field_checkbox` as the `type` of an
argument will provide a little visual box in the position of that argument that,
when interacted, will toggle a checkmark. For custom fields, the `type` will be
supplied by a unique name which will then similarly render some custom visual
component in the position of that argument.

This package provides a field plugin system to help manage the use of fields and
ensure they are just-in-time registered with blocks that use them. No names need
to be remembered as they are specified within the plugin just once.

To use this, define a FieldPlugin that wraps the implementation of your field.
Then, supply that class implementation as the `type` of any argument in the place
of the field name string. Your field is implemented in the same way you would
normally create a
[custom field](https://developers.google.com/blockly/guides/create-custom-blocks/fields/customizing-fields/overview).

Here is a simple example, (generally practical examples will be implementing the
`fromJSON` static method, but this still illustrates a useful case):

```
import * as Blockly from 'blockly';

import {PluginType} from '@code-dot-org/blockly-workspace/plugins';
import type {FieldPlugin} from '@code-dot-org/blockly-workspace/plugins';

class CustomTextField extends Blockly.FieldTextInput {
  constructor(value, _validator, config) {
    // Always add a bunch of !!! at the end of the input
    super(value, (newValue) => (newValue + '!!!'), config);
  }
}

const CustomTextFieldPlugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_location',
  field: CustomTextField,
};

const blocks: BlockDefinition[] = [
  {
    type: 'get_text',
    message0: 'enter text: %1',
    args0: [
      {
        type: CustomTextFieldPlugin,
        name: 'TEXT',
      },
    ],
  },
];
```

You can specify that same field plugin in multiple blocks and multiple arguments
within the same block. It will only be registered once and it will automatically
be deregistered when the lifetime of the workspace ends.

### Inputs

These plugins will add a different style of 'nub' to a block. To use it in a
block, define the plugin and supply it as the 'output' of that block
definition, or the `check` for an argument. For instance, to ensure that the
`Location` type, which we are defining as a custom type, has a square nub,
then we define the block as such:

```
import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import {RectangleInputPlugin} from '@code-dot-org/blockly-workspace/plugins/inputs';

import FieldLocation from './fields/FieldLocation';

const LocationType = RectangleInputPlugin('Location');

const blocks: BlockDefinition[] = [
  {
    type: 'location_picker',
    style: 'location_blocks',
    tooltip: '',
    helpUrl: '',
    output: LocationType,
    message0: '%1',
    args0: [
      {
        type: FieldLocation,
        name: 'LOCATION',
        check: LocationType,
      },
    ],
    generator: () => '\n',
  },
];
```

This also shows an example of a custom Field as well. See the prior discussion of
field plugins to know more about how that is done.

There are a few stock plugins available for use:

* `RoundInputPlugin` - A semicircle nub.
* `TriangleInputPlugin` - A triangular nub.
* `RectangularInputPlugin` - A squared nub.

## Block Extensions and Mixins

Two powerful features Blockly allows for adding custom behaviors to blocks are
Extensions, which modify initialization behavior, and Mixins, which add methods
to the `BlockSvg` instance for certain block types. These can be cumbersome to
use, so this package provides particular wrappers around these which can be
directly specified in block definitions.

### Extensions

Block extensions augment a block by running a single function when the block is
created. This allows the extension to perform a few operations on the block at
that time with access to the `BlockSvg` reference.

To create an extension, define it with the `Extension` type and that add it to
the `extensions` property when defining the block.

```
import * as Blockly from 'blockly';

import type {Extension} from '@code-dot-org/blockly-workspace';

export const randomColourBlockExtension: Extension = {
  name: 'randomColourBlock',
  extension: function (this: Blockly.BlockSvg) {
    // Set the block colour to a random value from this list
    const colours = [
      'red',
      'yellow',
      'blue',
      'green',
      'khaki',
    ];
    this.setColour(colours[Math.floor(Math.random() * myArray.length)]);
  },
};

const blocks: BlockDefinition[] = [
  {
    type: 'my-block',
    message0: 'This is a block with a random colour.',
    extensions: [randomColourBlockExtension],
    generator: {
      javascript() {
        return '';
      },
    },
  },
];
```

### Mixins

Mixins are a good way to add properties and methods to block instances. These
can be used by other extensions to coordinate behavior with those particular
blocks.

To add such properties and methods, you can do so with a `Mixin`, as long as
those properties do not already exist on the base Block. If they do, you have
to mix them in with an Extension instead.

Here is a quick example that adds a couple of properties to the `BlockSvg`
interface:

```
export const behaviorCallerGetDefBlockMixin = {
  name: 'behavior_caller_get_def_block_mixin',
  mixin: {
    hasReturn_: false,
    defType_: 'behavior_definition',
  },
};
```

And then we add that `behaviorCallerGetDefBlockMixin` to the `extensions` list
within any applicable block's definition, much like an `Extension`.
