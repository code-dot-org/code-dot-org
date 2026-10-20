# Block definitions and the registry

This is the kernel of the package. It defines a language for describing
blocks as data, and the machinery that registers those descriptions with
Blockly for as long as a `Driver` lives. Every other part of the package
builds on it. It also carries the three things every workspace needs and
that have no better home: a renderer, the default theme, and the toolbox
builder.

"Blockly" below means the `blockly` package, version 13. "A lab" means any
consumer of this package.

## Why it exists

Blockly keeps its block types, fields, extensions, mutators and renderers in
registries that are global to the page and keyed by name. A block's JSON
names the fields and extensions it uses, but nothing registers them on its
behalf, nothing records which workspace needed them, and nothing removes
them when that workspace goes away. Code generators live in a third place,
apart from the block. Block code that needs to know about the session (the
main workspace, a lab's assets) has nowhere to find it but a global.

This package changes three things:

1. A definition carries its dependencies by reference: a field is the field
   plugin object, an extension the extension object, the generator a
   function on the definition itself.
2. Registering a definition registers what it references, once, and records
   it. Deconstructing the `Driver` that registered it removes it.
3. Each `Driver` holds an _environment_: an object the lab owns and types,
   which generators, extensions and mutators receive. Per-session state
   travels there instead of in globals.

What it does not change: the registries are still Blockly's, so they are
still global. See DEF-20.

## Terms

- A _definition_ describes one block type (DEF-1).
- The _Driver_ owns a set of definitions, plugins, a theme, a renderer and an
  environment, and their lifetime.
- The _Registry_ is the Driver's bookkeeping against Blockly's registries. A
  lab does not normally use it directly.
- An _agent_ is whatever puts a workspace on the page. The Driver needs only
  four things from one (DEF-29); `Agent` (`workspace.md`) is the usual one.
- A _plugin_ extends Blockly at one of several points in a workspace's life
  (DEF-21).

## The definition language

DEF-1. A definition is one of two forms:

- the _JSON form_, a `BlockDefinition`: Blockly's JSON block format, extended
  as DEF-2 describes, plus a `generator` and an optional `mutator`;
- the _init form_, an `OldBlockDefinition`: a `type`, an `init` function that
  builds the block imperatively, and a `generator`.

A `BlockDefinitions` is an ordered list of either form.

DEF-2. The JSON form accepts Blockly's keys (`type`, `message0`, `args0`,
`output`, `previousStatement`, `nextStatement`, `inputsInline`, `style`,
`helpUrl`, `tooltip`, and so on), with these differences:

- `tooltip` is required.
- An argument's `type` may be a field plugin object instead of a field name.
- `extensions` may hold extension objects as well as names.
- `mixins`, which Blockly does not have, holds mixin objects.
- `mutator` may be a mutator object as well as a name.
- `generator` holds the code generators: `javascript` (required) and `simple`
  (optional; see DEF-14).

DEF-3. Field plugins are recognised in `args0` through `args3` only. The type
also admits `args4`, but a field plugin there is neither registered nor
rewritten, so Blockly receives an object where it expects a name.

DEF-4. `output` is a type name, an array of type names (the block may report
any of them), or `null` (the block plugs into any value socket). `check` on
an input argument takes a name or an array of names in the same sense.

DEF-5. `defineBlock`, `defineExtension`, `defineMixin` and `defineMutator`
do nothing at run time. `defineBlock` returns its argument;
`defineExtension(name, {extension})` returns `{name, extension}`;
`defineMixin(name, mixin)` returns `{name, mixin}`;
`defineMutator(name, mutator, options)` returns `{name, mutator, ...options}`.
They exist so that TypeScript infers the block's type inside a generator or a
mutator method. `defineMutator`'s third argument may be the boolean `true`,
which means `{noRegister: true}`, or an object
`{noRegister?, blocks?}`.

## Registering definitions

DEF-6. `driver.setBlocks(list)`, or assigning `driver.blocks`, replaces the
Driver's list and registers every definition in it, in order. It does not
unregister the definitions of the list it replaces.

DEF-7. Registering a definition first makes a copy, and rewrites only the
copy. The caller's definition is never modified. The copy is fresh at every
level the rewrite touches (the definition, each `argsN` array and its
entries, `extensions`, `mixins`); generator functions, field classes and the
plugin, extension and mutator objects are shared, not copied.

DEF-8. An init-form definition is not rewritten.

DEF-9. In a JSON-form copy, an argument whose `type` is a field plugin is
registered (DEF-22) and its `type` replaced by the plugin's `name`.

DEF-10. In a JSON-form copy, `mutator` is handled thus:

- a mutator object is registered (DEF-19), unless its `noRegister` is set,
  and replaced by its `name`;
- a name is kept;
- if there is none, a mutator named `blank`, with no members of its own, is
  registered and assigned.

So every JSON-form block has a mutator, and with it the accessors of DEF-19.

DEF-11. In a JSON-form copy, `extensions` becomes the names of
`extensions` followed by those of `mixins`, in order. Each extension object
is registered as an extension (DEF-18), each mixin object as a mixin, and
each name is kept.

DEF-12. Any existing `Blockly.Blocks[type]` is deleted and the copy defined
in its place: an init-form copy through `Blockly.common.defineBlocks`, a
JSON-form copy through `Blockly.common.defineBlocksWithJsonArray`. The last
registration of a type wins, whichever Driver made it.

DEF-13. `javascriptGenerator.forBlock[type]` is replaced by a function that
calls the definition's `generator.javascript(block, javascriptGenerator,
environment)` and returns its result, or `''` if the result is falsy.

Blockly reads a generator's `null` as "this block has emitted its own code
and that of the blocks after it", and appends nothing. Because the wrapper
turns `null` into `''`, Blockly appends the following blocks' code after
all.

DEF-14. The Driver also fills a second Blockly generator, named `simple`,
that shares `javascriptGenerator`'s `scrub_` and `INDENT`. It produces the
code shown to students, which need not run. It is not exported from the
package root. Its `forBlock[type]` calls `generator.simple` in the manner of
DEF-13 if the definition has one; otherwise it is the JavaScript function of
DEF-13 itself.

DEF-15. Before replacing it, DEF-13 records the existing
`javascriptGenerator.forBlock[type]` in
`originalGeneratorFunctions.javascript[type]`, unless that slot already
holds a value. This lets a definition that replaces a stock block's
generator still call the stock one. There is one such map in the page,
shared by every Driver; `environment.originalGeneratorFunctions` refers to
it. `deconstruct` empties it in place (DEF-33).

## The environment

DEF-16. The environment is an object the lab creates and passes to the
Driver's constructor. A lab extends the `Environment` type with its own
fields. The Driver writes the fields of DEF-17 and
`originalGeneratorFunctions`, and never replaces the object.

DEF-17. When an agent's workspace is injected (DEF-30), the Driver writes:

- `mainWorkspace`: the workspace of the first main agent;
- `hiddenWorkspaces`: appends each hidden agent's workspace;
- `embeddedWorkspaces`: appends each inline agent's workspace.

It creates the arrays if they are absent. It never writes
`inlineWorkspaces`, and never removes an entry.

DEF-18. An extension runs with `this` bound to the block and one argument:
the environment of the Registry that registered the extension's name.

DEF-19. Registering a mutator wraps it. Every block that has the mutator
gains:

- `getEnvironment()`: the registering Registry's environment;
- `isWithinMainWorkspace()`: whether `environment.mainWorkspace` is the
  block's workspace;
- `isWithinHiddenWorkspace()`: whether `environment.hiddenWorkspace` is the
  block's workspace. That is a singular key, which the Driver never writes,
  so this is false unless the lab writes it;
- `isWithinInlineWorkspace()` and `isWithinEmbeddedWorkspace()`:
  `isWithinMainWorkspace()` and, respectively, `environment.inline` or
  `environment.embedded`. The Driver writes neither.

The wrapper's `loadExtraState` assigns `block.environment` and then calls the
mutator's own, if any. Its `saveExtraState` is the mutator's own, or else a
function that saves nothing. Blockly calls `loadExtraState` only when it
loads a block that saved extra state, so `block.environment` is unassigned
on a block created fresh, and on every block whose mutator saves nothing,
which includes every block with the `blank` mutator. `getEnvironment()` is
the dependable accessor.

`mutator.blocks`, when given, is the list of block types the mutator's
editing bubble offers, as Blockly's `controls_if` offers "else if" and
"else".

DEF-20. Blockly's registries are global to the page. A Registry registers a
field, extension, mixin or mutator name only if Blockly does not already
hold that name, and unregisters only what it registered. So while one
Driver holds a name, a second Driver registering the same name gets the
first one's registration, and its blocks see the first Driver's
environment. Two live Drivers that register overlapping names are not
supported.

## Plugins

DEF-21. A plugin is an object whose `type` is one of `PluginType`:

| `type`     | Registered                       | Undone by                     |
| ---------- | -------------------------------- | ----------------------------- |
| `field`    | when a definition references it  | the Registry, DEF-27          |
| `global`   | when passed to the Driver        | its `uninitialize`, DEF-27    |
| `input`    | when passed to the Driver        | dropped at DEF-27             |
| `inject`   | per main workspace, at injection | its `dispose`, DEF-25, DEF-27 |
| `registry` | never; the Registry ignores it   | —                             |

DEF-22. A field plugin is registered under its `name` unless Blockly's field
registry already holds that name. Registering it registers its `field`
class, or, if it has none, calls its `initialize`.

DEF-23. A global plugin's `initialize` is called each time the plugin is
registered. Nothing prevents registering it twice.

DEF-24. An input plugin associates a connection type name (`check`) with a
named notch shape (`shape`) and a function that draws it (`makePath`). It
affects only renderers acquired after it is registered (DEF-35).

DEF-25. The Driver keeps the inject plugins it is given. When the first main
agent's workspace is injected, each is constructed as
`new plugin(workspace, theme)`, provided the plugin sets `useWithInline` or
the agent is not inline. The first main agent is never inline (DEF-29), so
through the Driver `useWithInline` has no effect. The instance's `dispose`,
if it has one, is called when that agent is uninitialized, before its
workspace is disposed. `driver.register(plugins)` replaces the kept inject
plugins; it does not add to them.

DEF-26. `createInjectPlugin(options)` makes an inject plugin from callbacks.
At construction it calls `onInit(workspace, theme)` and keeps the result as
the plugin's state; adds `onChange(event, state)` as a workspace change
listener; and schedules `onReady(workspace, theme, state)` with a zero
timeout. `dispose` may be called any number of times; the first call cancels
a pending `onReady`, removes the listener, and calls
`onDispose(workspace, theme, state)`. The option types require at least
one of `onInit` and `onChange`; nothing checks this at run time.

DEF-27. `Registry.unregisterAll` unregisters the field plugins it registered
(calling `uninitialize` where given), calls `uninitialize` on the global
plugins it registered, unregisters the extensions, mixins and mutators it
registered, forgets its input plugins, and disposes any inject plugin
instances still live.

## The Driver's life

DEF-28. `new Driver(environment, renderer, theme, plugins?)` creates its
Registry, sets `environment.originalGeneratorFunctions` (DEF-15), and
registers the plugins (DEF-21).

DEF-29. An agent offers `inline`, `hidden`, `workspace` and `getToolbox()`;
this is the `WorkspaceAgent` interface. `driver.initialize(agent)` records
the agent as inline if `inline` is set, as hidden if `hidden` is set, and as
main if neither is. `driver.mainWorkspace` is the workspace of the first main
agent recorded.

DEF-30. `driver.onInject(agent)`, which the agent calls once its workspace
exists, does nothing if the agent has no workspace. Otherwise:

- for the first main agent, it sets `environment.mainWorkspace`, constructs
  the inject plugins (DEF-25), and registers the agent's toolbox's dynamic
  categories (DEF-43);
- for a hidden agent, it appends to `environment.hiddenWorkspaces`;
- for an inline agent that is not hidden, it appends to
  `environment.embeddedWorkspaces`;

and in every case then emits `DriverEvent.Injected` with the workspace and
the environment. A main agent other than the first gets only the event.

DEF-31. `driver.uninitialize(agent)` forgets the agent. If it has a
workspace, it disposes that workspace's inject plugin instances and then
emits `DriverEvent.Removed` with the workspace. It does not touch the
environment.

DEF-32. `driver.setTheme(theme)`, or assigning `driver.theme`, stores the
theme, or the default theme if given `undefined`, and emits
`DriverEvent.ThemeChanged`. The Driver restyles nothing; its listeners do.
The Registry keeps the theme the Driver was constructed with, and that is the
theme inject plugins receive, even after `setTheme`.

DEF-33. `driver.deconstruct()` assigns an empty block list (DEF-6, so it
registers nothing and unregisters nothing), forgets its inject plugins,
calls `Registry.unregisterAll` (DEF-27), and empties the map of DEF-15.
Block types and generator functions it defined stay defined in Blockly.

`DriverEvent.BlocklyEvent` is declared but the Driver never emits it.

## Renderers

DEF-34. A `Renderer` is `{name, class}`, where `class(inputs)` returns a
Blockly renderer class built for those input plugins.
`createRenderer(BlocklyRendererClass)` makes such a `class` from any Blockly
renderer class: the renderer it returns uses the package's constants
provider (DEF-36) built from `inputs`.

DEF-35. `driver.acquireRenderer()` registers a renderer with Blockly under
the name `<renderer name>-<n>`, where `n` counts up across every Registry in
the page, and returns the name. The renderer is built from the input plugins
registered at that moment. Each workspace acquires its own, so two
workspaces never share a registry entry or an input set.
`driver.releaseRenderer(name)` unregisters it; releasing an unknown or
already-released name does nothing.

DEF-36. The constants provider gives each input plugin's `shape` a number:
a shape name Blockly already knows keeps its number; each new one gets the
next number above Blockly's. It then maps the plugin's `check` to
`makePath(number)`, called with `this` bound to the provider. Plugins are
taken in registration order; a later plugin with the same `check` replaces
an earlier one.

DEF-37. For a value connection, `shapeFor` returns the shape mapped to the
connection's first `check` type, if there is one, and otherwise Blockly's
shape. For a statement connection it returns Blockly's shape.

DEF-38. The constants provider computes a block style's secondary colour
as `Blockly.utils.colour.blend('#000', primary, 0.4)`, which is 40% black and
60% the primary colour, when its dark flag is set, and as Blockly does
otherwise. Blockly computes these colours inside `setTheme`, and the provider
sets its dark flag (DEF-40) only after that call returns. So the colours
follow the theme given to the _previous_ `setTheme`: the first theme a
provider receives always gets Blockly's colours, and after a change from a
dark theme to a light one the light theme gets the darkened colours.

DEF-39. The package's renderer is Blockly's _thrasos_, named `cdo-thrasos`.
It draws a disabled block with the class `blocklyDisabled` and without
Blockly's cross-hatch pattern. Highlighting is Blockly's.

DEF-40. A theme is dark when its name contains `dark` (`isDarkTheme`).

## The toolbox

DEF-41. A `Toolbox` is one of:

- a Blockly toolbox definition, recognised by having a `kind`;
- an array of categories and toolbox items, where an item is anything with a
  string `kind` (a separator, or any registered toolbox item);
- one static category, which is a flyout with no categories.

A category has a `name` and `blocks`. A _dynamic_ category also has a `key`
and an `onLoad(workspace)` that returns further blocks when the category is
opened.

DEF-42. `buildToolbox(toolbox)` converts a `Toolbox` to Blockly's form:

- a Blockly definition is returned unchanged;
- an array becomes a `categoryToolbox`; items pass through unchanged; each
  category becomes `{kind: 'category', name, cssconfig, contents}`, plus
  `custom: key` if it is dynamic;
- a single category becomes a `flyoutToolbox` of its blocks.

In `contents`, a block given as a type name becomes
`{kind: 'block', type, id: type}`, and a block given as an object is used
unchanged. The `id` gives each toolbox block a stable DOM id that UI such as
instruction callouts can target; a block dragged out gets a fresh one.

DEF-43. For a dynamic category, `contents` is not what Blockly shows.
Instead, when the first main workspace is injected, the Driver registers a
callback under the category's `key` that returns the category's `blocks`
followed by `onLoad(workspace)`. In that callback a block given as a type
name becomes `{kind: 'block', type}`, without the `id` of DEF-42.

DEF-44. `toolboxFromCategoryBlocks(map, type, pool)` builds a `Toolbox` from
a `{category name: block types}` map, taking the names as given. Categories
mapped to `undefined` are left out. With `type` `'category'`, the default,
the result is the categories in the map's order; with `'flyout'` it is one
unnamed category holding every category's blocks. If a `pool` of categories
is given, each block type is replaced by every entry in the pool with that
type, so that blocks the pool seeds with field values keep them; a type the
pool lacks stays a bare type name.

## Themes and constants

DEF-45. A `Theme` is `{definition, instance}`. `definition` is a Blockly
theme description plus the package's own keys (`option`, a name for a
settings menu; `blockLimits`; `trashcan`), and its `blockStyles` must name a
style for each of: `default`, `setup_blocks`, `event_blocks`,
`loop_blocks`, `logic_blocks`, `procedure_blocks`, `variable_blocks`,
`math_blocks`, `text_blocks`, `colour_blocks`, `sprite_blocks`,
`world_blocks`, `behavior_blocks`, `location_blocks` and `lab_blocks`. These
are the names a definition's `style` uses. `instance` is the Blockly theme
defined from the description over Blockly's classic theme. The default
theme is named `default`; the other themes are in `themes.md`.

DEF-46. `BlockTypes` names the block types the package and its labs share
(`when_run`, the procedure blocks, and so on). Saved projects contain these
names; they must not change.

## Test vectors

DEF-V1 (DEF-7, DEF-9). Given a field plugin `P` named `field_p` and the
definition `{type: 'b', args0: [{type: P, name: 'X'}], ...}`, registration
defines `b` with `args0[0].type === 'field_p'`, `field_p` is in Blockly's
field registry, and the given definition's `args0[0].type` is still `P`.

DEF-V2 (DEF-10). A JSON-form definition with no `mutator` is defined with
`mutator: 'blank'`; a new block of its type has a `getEnvironment` method.

DEF-V3 (DEF-13). A definition whose generator returns `'go();\n'` makes
`javascriptGenerator.forBlock[type](block)` return `'go();\n'`; one that
returns `null` makes it return `''`.

DEF-V4 (DEF-14). With no `generator.simple`, the `simple` generator's
`forBlock[type]` is `javascriptGenerator.forBlock[type]`.

DEF-V5 (DEF-36, DEF-37). Two input plugins with shapes `square` and `round`
and checks `A` and `B` receive shape numbers 3 and 4 (Blockly's own are 1
and 2). A value connection checked `['A', 'C']` gets `A`'s shape; one checked
`['C']` gets Blockly's puzzle tab.

DEF-V6 (DEF-38). A provider given a theme named `my-dark`, then `my-light`,
then `my-dark` again, each with a primary colour of `#ffffff`, computes the
secondary colours `#ffffff`, `#999999`, `#ffffff`.

DEF-V7 (DEF-26). An inject plugin made with `onReady` and disposed before
its zero timeout fires never calls `onReady`, and calls `onDispose` once
however many times it is disposed.

DEF-V8 (DEF-42). `buildToolbox([{name: 'Loops', blocks: ['controls_if']}])`
is `{kind: 'categoryToolbox', contents: [{kind: 'category', name: 'Loops',
cssconfig: undefined, contents: [{kind: 'block', type: 'controls_if', id:
'controls_if'}]}]}`.

## Not specified here

- Putting a workspace on the page, loading blocks into it, and how an agent
  applies themes: `workspace.md`.
- Procedures. The kernel registers no procedure blocks; a lab that wants
  Blockly's shareable procedures uses the plugin in `procedures.md`.
- The themes other than `default`: `themes.md`.
- The order in which one definition's field plugins are registered.

## Open questions

1. DEF-3: should `args4` be scanned, or dropped from the type?
2. DEF-13: should `null` pass through to Blockly unchanged, so that a block
   can emit the code of the blocks after it?
3. DEF-15: after `deconstruct`, `javascriptGenerator.forBlock[type]` still
   holds the previous Driver's function, so the next registration of that
   type records it as the "original". Should registration remember the stock
   generators once, when the package loads?
4. DEF-17, DEF-19: `inlineWorkspaces` is never written, inline workspaces go
   to `embeddedWorkspaces`, `isWithinHiddenWorkspace` reads a key nothing
   writes, and nothing sets `environment.inline` or `environment.embedded`.
   These look like one design that was renamed halfway. Which names stand?
5. DEF-17: entries are never removed when an agent goes away, so a remounted
   workspace leaves a disposed one behind. Should `uninitialize` remove them?
6. DEF-20: is one live Driver per page the supported model, or should names
   be scoped per Driver?
7. DEF-25: since the main agent is never inline, should `useWithInline` go,
   or should inject plugins be constructed for inline workspaces too?
8. DEF-32: should inject plugins receive the current theme?
9. DEF-21: the `registry` plugin kind is declared and ignored. Implement it
   or remove it?
10. DEF-33: emit `DriverEvent.BlocklyEvent`, or remove it?
11. The `Mixin` type says a mixin's `environment` key is filled in with the
    environment. Nothing does so. Fill it in, or correct the type?
12. `Renderers` in `constants.ts` is used nowhere, and its `THRASOS` value
    (`cdo_renderer_thrasos`) is not the renderer's name (`cdo-thrasos`).
    Remove it?
13. DEF-38: the dark flag should be set before Blockly computes the
    colours. As things stand, a workspace that starts with a dark theme has
    never had darkened secondary colours, and one switched from dark to light
    has. This is a bug.
14. Package conventions (`frontend/docs/conventions/packages.md`) ask for the
    shared ESLint preset and for external libraries as peer dependencies.
    The preset reports 53 problems across the package, mostly import order
    and its rejection of `_unused` parameters; `blockly` is a direct
    dependency. Adopt either, and when?
