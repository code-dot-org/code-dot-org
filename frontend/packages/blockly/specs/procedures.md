# Procedures

The procedure (function) blocks of `@blockly/block-shareable-procedures`,
offered as a global plugin, and the two mutators a lab's own procedure
blocks name.

## Why it exists

Blockly's own procedure blocks keep a procedure's name and parameters in
the definition block. The shareable ones keep them in a procedure model on
the workspace, which the definition and every call observe, so a procedure
can be edited apart from its blocks: apps' modal function editor depends on
this, and Music's functions use it. Apps installs these blocks for every
lab; here a lab asks for them.

## The plugin

PRC-1. `@code-dot-org/blockly/plugins/sharableProcedures` exports, as
default and as `plugin`, a global plugin (DEF-21).

PRC-2. Its `initialize` deletes the four procedure block types Blockly
defines (`procedures_defnoreturn`, `procedures_defreturn`,
`procedures_callnoreturn`, `procedures_callreturn`) and defines the
library's blocks under the same types, replacing whatever was there. It
may be called any number of times (DEF-23).

PRC-3. A definition and its calls share one procedure model in the
workspace's procedure map: renaming the definition renames its calls.

PRC-4. The plugin registers no procedure serializer. A workspace saved as
JSON carries no `procedures` key; the definition saves only its model's
id, and its parameters survive only as variables. Loaded again, the
definition gets a new model with its name and no parameters.

PRC-5. The plugin has no `uninitialize`. Once initialized, the shareable
blocks stay defined after the Driver is deconstructed, for the life of the
page.

PRC-6. `BaseBlocks` holds Blockly's own procedure blocks (CMN-11), since
they are captured when the package is imported. A lab that registers those
entries through a Driver after the plugin is initialized, as it is at the
Driver's construction, puts Blockly's blocks back in place of the
shareable ones.

## The mutators

PRC-7. `@code-dot-org/blockly/mutators` exports `procedureDefMutator` and
`procedureCallerMutator`, which name the library's `procedure_def_mutator`
and `procedure_caller_mutator`. A lab's own definition or call block gives
one as its `mutator`. The mutator alone does not make a call block: it must
also list the library's caller extensions, as the library's
`procedures_callnoreturn` does (PRC-V2).

PRC-8. Both mutators are marked `noRegister`: the Registry gives the block
the mutator's name and neither registers nor unregisters it. The library
registers the mutators, and its extensions, when it is first imported,
which importing the plugin does; the mutators module imports only the
library's types. A block naming either mutator on a page that has not
imported the library fails to build.

PRC-9. The mutators are typed `Mutator<ProcedureBaseJson, IProcedureBlock>`,
so a definition's `this` and its generator's block have the library's
procedure methods. `ProcedureBlock` is a rendered block with those methods;
`LegacyProcedureBlock` adds the methods of Blockly's own procedure blocks,
`getProcedureCall`, `renameProcedure` and `getProcedureDef`.

## Test vectors

PRC-V1 (PRC-3). With the plugin, append `procedures_defnoreturn` named
`foo` with a parameter `x`, and `procedures_callnoreturn` with
`extraState: {name: 'foo'}`. The map holds one procedure; setting the
definition's `NAME` to `bar` sets the call's `NAME` to `bar`.

PRC-V2 (PRC-7). A block with a `NAME` label, an `input_dummy` named
`TOPROW`, `mutator: procedureCallerMutator`, and the extensions
`procedure_caller_get_def_mixin`, `procedure_caller_var_mixin`,
`procedure_caller_update_shape_mixin`,
`procedure_caller_context_menu_mixin`, `procedure_caller_onchange_mixin`
and `procedure_callernoreturn_get_def_block_mixin` follows a definition's
renaming as PRC-V1's call does. Music's function call block is this block.

PRC-V3 (PRC-4). Saving PRC-V1's workspace and loading it into another
gives one procedure named `foo` with no parameters.

## Not specified here

- The shareable blocks themselves, their models and events: the library.
- Code generation for procedure blocks, which is Blockly's.
- Apps' modal function editor, which is not ported.

## Open questions

1. PRC-4: register the library's procedure serializer, as apps does
   (`apps/src/blockly/blocklyWrapper.ts`)? Without it a definition's
   parameters do not survive a save.
2. PRC-5: give the plugin an `uninitialize` that restores Blockly's
   blocks?
3. PRC-6: leave the stock procedure blocks out of `BaseBlocks`, since a
   lab with the plugin must not register them and one without it has
   Blockly's already?
4. PRC-9: the mutators' state type is the library's base event JSON, not
   what the blocks save. And nothing in the package or its labs uses
   `LegacyProcedureBlock`. Drop it?
