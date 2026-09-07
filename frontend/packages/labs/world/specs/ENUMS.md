# Choices, and events that filter on them

## The problem

`rules/input.rule` raises one event for every key that goes down, carrying the
key as the event's value. A handler that cares about one key has to say so
itself:

```
when any Player a key is pressed
  if (event value) = (key ⟨space⟩)
    …jump…
```

Two blocks and a comparison to express "when space is pressed". Worse, it
scales the wrong way: four keys means four handlers each opening with the same
`if`, and the thing the learner wanted to say — WHICH key — is buried a level
down from the hat that announces the event.

The hat cannot say it because an event has nothing to say it with.
`world_rule_event` declares a NAME and nothing else, so `EventMeta` is
`{id, name, ref}` and the block it generates can only ever be
`when ⟨actor⟩ <name>`. Every other member kind escaped this: `define block` has
the designer, whose parts are exactly "label, param, label, param". Events are
the one that never got it.

And the value being carried is not any string — it is one of a known set. The
language has no way to say that either, which is why `world_key` is a built-in
block rather than something a rule could have declared.

## The construct

An ENUM is a named set of string choices. It is an authoring-time construct:
its values are plain strings at runtime, and nothing in the engine knows an
enum exists. What it buys is at the edit surface — an argument typed by an enum
is a DROPDOWN of those choices rather than a free text field, and an event
argument typed by an enum is a FILTER.

Two sources, as with rules:

- **The engine's.** `Key` already exists as `KEY_OPTIONS` in `domainBlocks`,
  behind the `world_key` block. It becomes an enum the authoring surface can
  name, and `world_key` becomes what it always was: that enum's value block.
  A rule does not rebuild it — `rules/input.rule` USES it.
- **A rule's own.** `define choices ⟨Gusts⟩` with `option` rows chained below,
  a root in a `.rule` beside `define trait` and the step hats.

Referred to like every other member, by `<Owner>#<Name>` — `Engine#Key`,
`Wind#Gusts` — so an enum can be renamed or moved and references still resolve
(`ruleRegistry`).

## Using one as a block argument

The designer's flyout offers a `choice` item beside `number`, `boolean`,
`string`, `vector`, `actor`; which enum is a field on it, so a new set of
choices needs no new item block. A parameter typed by an enum is a string
parameter — `paramFlavour` maps `enum:<ref>` to the string flavour, so its
getter, its type check and the body that reads it are unchanged.

At the call site it is the DROPDOWN ITSELF, a field on the block. The choices
are the whole of what the argument can be, so a socket would draw a notch, an
outline and a plug around a list of five words, and offer to accept a value
that is not one of them. Naming a choice where a socket is genuinely wanted — a
comparison, an `emit … with` — is what the enum's own chip block is for, and
that is the block `rules/input.rule` uses to send the key it is looping over.

The options are live, so a set of choices edited a moment ago reaches the blocks
built from it, and a stored word the set no longer offers is kept and shown as
itself rather than becoming the first option.

## Using one on an event

An event gains a SIGNATURE — the same designer, the same parts. `input.rule`
declares its event as `%1 is pressed` with one `Engine#Key` parameter, and the
hat is built from those parts:

```
when [ any Player ▾ ] [ space ▾ ] is pressed
   …jump…
```

On a hat the enum parameter is a FIELD, not a socket, and its options carry one
more entry: `(any)`. Two reasons. Nothing is in scope at a hat to compute a key
from, so a socket would buy nothing; and "fires for every key" needs to be
sayable, which as an empty socket would be a thing a learner discovers by
deleting a block and as `(any)` is a thing they read.

The filter is generated as the guard the learner writes by hand today:

```js
Player.on(AKeyIsPressedEvent, (world, actor, eventValue) => {
  if (eventValue !== " ") return;
  …
});
```

No engine change: `Actor.on` and the EventQueue are untouched, and the emitted
JavaScript is the code the block replaces, which is the bargain the rest of the
language makes. `(any)` emits no guard, which is today's behavior exactly, so
nothing that exists now breaks. `event value` keeps working for a handler that
means to switch on many.

## What this does to the starter project

`rules/input.rule` declares two signed events instead of two bare ones. Its step
is unchanged — it still emits the loop's key, through a socket that now shows a
key dropdown as its shadow.

`player.actor`'s jump handler loses its `if`:

```
when this actor [ space ▾ ] is pressed        (was: a key is pressed → if …)
  …jump…
```

## Decisions

- **An option is one word.** `option ⟨red⟩` — the label IS the value. The
  engine's `Key` needs them to differ (`space` is `" "`, `up arrow` is
  `"ArrowUp"`), and it can, being built in. A second field on the option block
  can follow if a learner-authored enum ever needs it; starting with one keeps
  the block a sentence.
- **One parameter on an event, for now.** `emit … with` carries a single
  detail, so one filter falls out of the existing runtime for free. Several
  would mean the detail becomes a list and the guard compares positionally —
  worth doing when something wants it, not before.
- **Equality is `!==`.** Sound for enums, which are strings by construction.
  A filter on a vector parameter would need `WorldLab.sameValue`; enums do not,
  so that arrives with multi-parameter filters or not at all.
- **Two sets of choices with one name are reported, not silently resolved.**
  A reference carries its owner (`Wind#Colors`), so two rules may each declare
  a `Colors`; two `define choices` inside ONE rule may not, and the editor says
  so — the same warning two rules with one name get, for the same reason. The
  first is what every dropdown offers, and the palette builds one chip for the
  one reference rather than defining a type twice (registering a type twice
  does not fail, it silently replaces).
- **A stored value that is no longer an option stays stored.** Deleting `red`
  from an enum must not silently rewrite a block that said `red` — the dropdown
  shows the unknown value and the project still generates, the same way a
  `use rule` naming a deleted rule behaves.
- **A parameter is a FIELD where a constant is meant and a SOCKET where a value
  is meant.** The hat picks one of the choices to wait for; the block that
  raises the event supplies whichever the code worked out — `rules/input` raises
  its event once per key it is looping over, so a dropdown has to be
  droppable-over there. One signature, two renderings, and the difference is
  not an inconsistency but the thing each side is for.
- **`emit` is generated per event**, from that signature, and the two
  hand-written blocks are retired. `world_emit` / `world_emit_with` named their
  event in a dropdown and always said "with" — wrong for an event that carries
  nothing and unextendable past one argument — and they were the last member
  reference in the language that went through a dropdown instead of being a
  block of its own. The event's own words now read at the place it is raised:
  `emit ⟨space ▾⟩ is pressed for ⟨each⟩`.
- **A filter change restarts the game.** It edits the handler's source, which
  `handlerIds` hashes — already true and already correct.

## Plan

1. **The enum model.** ✅ `EnumMeta {owner, name, options}` in `blockly/enums`,
   referenced as `<Owner>#<Name>`, with `Engine#Key` built from the engine's own
   key table. Both key dropdowns read it.

   The keys got their NAMES at the same time: the driver translates
   `KeyboardEvent.key` at the door (`engine/core/keys`), so a key is `space` and
   `up arrow` everywhere inland — including in the JavaScript a learner reads,
   which no longer compares against `" "`.

2. **Enums as block arguments.** ✅ The designer's flyout offers one `choice`
   item for every enum (which enum is a field on it, so a new set of choices
   needs no new block type); `paramFlavour` maps `enum:<ref>` to the string
   flavour; `typedValueInputs` builds the socket-plus-dropdown-shadow. The
   editor's parameter type is `ParamType`, which is `ArgType` plus enums — the
   engine's list stays the engine's.
3. **`define choices`.** ✅ A definition root with its options chained below,
   parsed into `RuleMeta.enums` and registered beside the project's rules. Each
   set gets a chip in its own rule's toolbox category — the only way to name one
   of its choices outside a socket already typed by it.
4. **Events get signatures.** The designer on `world_rule_event`; `EventMeta`
   grows `parts`; `defineEventBlock` builds its message from them; an enum part
   becomes the `(any)`-bearing dropdown and the generated guard.
5. **The starter project.** `input.rule`'s events signed with `Engine#Key`, and
   `player.actor`'s jump handler with its `if` removed.

Each step stands on its own: 1–2 are useful without 4, and 4 is the one the
learner sees.

## A second dropdown-shaped parameter: `kind`

The same shape as an enum's, for the project's actor KINDS. A rule declares a
parameter typed `kind` and the block wears a dropdown of the actors the project
holds — the same list `is a ⟨Coin⟩` and `how many ⟨Coin⟩ in ⟨…⟩` offer, with
pictures where there are pictures:

```
⟨Player⟩ spends a ⟨Key ▾⟩          Inventory
⟨Player⟩ has a ⟨Key ▾⟩
```

**Why a rule could not do this before.** `is a` is a question a PROJECT asks:
its dropdown names the project's own kinds, and a rule has never seen them. So
a rule wanting to talk about a sort of thing had to be handed a word, and
Inventory was: every carried thing held a string — `"key"` — that could be
typed two ways with only the game running to say which had been meant.

**What arrives is a string all the same**, which is why this is the enum's
shape rather than a new one: the dropdown is about what may be CHOSEN, and the
value is the module path (or a world's own stamped id) that the choice resolves
to. `paramFlavour` maps it to the string flavour, `typedValueCode` resolves it
the way `is a` does, and the engine hears nothing about kinds — `ParamType` is
`ArgType` plus enums plus this, and both additions are about a socket rather
than about a value.

**A rule compares it with `kind of ⟨actor⟩`**, which is the half of `is a` a
rule can hold: the kind as a value, so a body can ask whether the thing it is
looking at is the thing it was asked about.

**One trap, paid for once.** A live dropdown rebinds the ONE field it is named
for (`moduleOptions`), so the kind field needs its own — the ready-made
`actorTypeOptionsExtension` is bound to `TYPE`, and a parameter's field is
named after the parameter. Bound to the wrong name it rebinds nothing, the
options stay whatever they were when the block was defined, and a stored kind
is dropped on load: a project that says `spends a ⟨Key⟩` generating
`spends a ⟨⟩`.

**And the same trap from the other side, found by using the editor.** An
actor-carrying event's HAT has filtered by kind since it got a signature — the
dropdown is `(any)` plus the project's kinds — but its option list was built by
a closure that ignored the field it was handed. A world's own `define actor`
kinds are found THROUGH the field (its workspace), so in a world that defines
its actors inline — which is every progression lesson and the starter — the
filter offered `(any)`, the empty-list placeholder beside it, and nothing else.
Two entries carrying the same empty value, one of them reading like an actor a
game might have.

So: pass the field, and drop the placeholder wherever `(any)` already says
there is nothing to filter on. The placeholder is `orNone` saying a list is
empty — it reads "(no actors yet)" now, for the reason that function's header
gives — and it is never a thing to choose. Nothing in the palette asks a learner
to choose an empty row: the one that did, `set music to ⟨none⟩`, is a `stop
music` block instead (specs/SOUND.md).
