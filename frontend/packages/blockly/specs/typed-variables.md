# Typed variables

`createTypedVariable(config)` makes a variable "flavour": Blockly variables
of one type, a getter and a setter for them, and a field that binds one in
another block. `src/variables/README.md` shows a lab using it.

## Why it exists

Blockly's own variables hold anything, so its getter plugs into any socket.
World Lab's actors, vectors and colours are variables a student must not
mix: a loop over actors binds an actor, and only an actor may go where one
is expected. Blockly already tags a variable with a type and a connection
with a check; this ties the two together, once for each flavour a lab
needs. Apps has no counterpart.

## Requirements

TV-1. `createTypedVariable(config)` returns `{type, getterType,
setterType, getterBlock, setterBlock, field}`. The block definitions are
ordinary definitions (DEF-1), which a lab registers and offers in its
toolbox.

TV-2. Only `config.type` is required. The rest default from it: `check` to
`type`; `style` to `variable_blocks`; a new variable's name, `defaultName`,
to `type` in lower case; `getterType` to `variables_get_<type>` and
`setterType` to `variables_set_<type>`; the getter's `message0` to `%1`,
the variable alone, and the setter's to `set %1 to %2`; and each tooltip to
a sentence naming the type.

TV-3. The getter is a value block whose output is checked to `check`. The
setter is a statement block, inputs inline, with a value input `VALUE`
checked to `check`. So a getter plugs into its own setter, and into any
other socket checked to `check`, and into no socket checked otherwise.

TV-4. `field(name, {variable?})` is a `field_variable` argument named
`name`, for a block that binds a variable of the flavour, such as a loop's
or a parameter's: it lists and creates only variables of `type`, and starts
with one named `variable`, or `defaultName`.

TV-5. The getter's and the setter's variable field is `VAR`, made as
`field` makes it (TV-4). A new getter or setter on a workspace therefore
creates, or takes, a variable of `type` named `defaultName`, and its menu
lists only variables of `type`.

TV-6. The getter generates the variable's name from the generator's
variable table (`getVariableName`) at atomic precedence; the setter
generates `<name> = <value>;`. The generator's `finish` declares each
name so used with `var`.

TV-7. A setter whose `VALUE` is empty assigns `0`, so that the rest of the
program still generates while the block is half finished. A getter or
setter whose field names no variable generates `undefined`, or nothing:
that is what a lab's own reader field (TV-9) gives when no variable is in
scope.

TV-8. The variables save and load with their types, through Blockly's
serialization, as any variable does.

TV-9. `readerFieldType` names a field type to draw the getter's and the
setter's `VAR` in place of `field_variable`, and `readerExtensions` adds
extensions to those two blocks. They are for a lab whose variables have
scopes, where what a reader may name depends on where it sits. `field`
(TV-4) keeps `field_variable`, since a block that binds a name always has
one.

## Test vectors

TV-V1 (TV-5). With `Actor = createTypedVariable({type: 'Actor'})`
registered, a new `variables_get_Actor` creates the variable `actor` of
type `Actor`.

TV-V2 (TV-6). `variables_set_Actor` holding `variables_get_Actor`, both on
`actor`, generates `var actor;\n\n\nactor = actor;\n` once finished.

## Not specified here

- Scoped reader fields, which are each lab's (TV-9).
- Blockly's variable blocks and menus, which this leaves alone.

## Open questions

1. TV-7: a setter with an empty socket assigns `0` whatever its type, so
   an actor variable can be set to a number. Assign `undefined` instead?
2. The comments in `createTypedVariable.ts` run to paragraphs, against
   the package's one-line rule. Move their reasons here and keep one line
   each?
