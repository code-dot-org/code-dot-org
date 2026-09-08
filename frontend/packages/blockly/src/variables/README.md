# Typed variables

`createTypedVariable` builds a reusable variable _flavour_: a Blockly variable
identified by a type tag, plus a getter block whose `output` connection is
checked to that tag. A variable of one flavour therefore cannot plug where a
different type is expected — the same connection-type mechanism the input
plugins notch.

```ts
const ActorVariable = createTypedVariable({
  type: 'Actor',
  style: 'sprite_blocks',
});

// Register the reader (and offer it in the toolbox):
blocks = [...blocks, ActorVariable.getterBlock];

// Bind one on a block (a loop variable, a parameter):
defineBlock({
  type: 'for_each_actor',
  message0: 'for each %1 in actors',
  args0: [ActorVariable.field('VAR')],
  // …
  generator: {
    javascript(block, gen) {
      const name = gen.getVariableName(block.getFieldValue('VAR'));
      // `for (const <name> of …)`
    },
  },
});
```

Typed variables nest and serialise like any Blockly variable (through
`Blockly.serialization.workspaces`, which records each variable's type), and the
getter maps to a safe JS identifier via the generator's name table. The facility
is type-agnostic — call it once per flavour a lab needs.
