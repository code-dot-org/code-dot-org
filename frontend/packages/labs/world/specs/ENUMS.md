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

The designer's parameter type dropdown lists the enums in play beside `number`,
`boolean`, `string`, `vector`, `actor`. A parameter typed by an enum is a
string parameter — `paramFlavour` maps `enum:<ref>` to the string flavour, so
its getter, its type check and the body that reads it are unchanged — that
arrives at the call site as a socket carrying a DROPDOWN SHADOW of the enum's
options (`typedValueInputs` already builds sockets-with-shadows per type; this
is one more case).

A shadow rather than a field, because the shadow can be replaced. That is not
hypothetical: `rules/input.rule` emits the key it is looping over, so its emit
site needs a variable where the dropdown would be. Reading as a dropdown and
accepting a value is exactly the shape that serves both.

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
language makes. `(any)` emits no guard, which is today's behaviour exactly, so
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
- **A stored value that is no longer an option stays stored.** Deleting `red`
  from an enum must not silently rewrite a block that said `red` — the dropdown
  shows the unknown value and the project still generates, the same way a
  `use rule` naming a deleted rule behaves.
- **`emit … with` stays generic** in the first pass. Generating a per-event emit
  block from the signature (`emit ⟨a key is pressed⟩ for ⟨actor⟩ with ⟨key ▾⟩`)
  is a nicety that can follow; the value is a string either way.
- **A filter change restarts the game.** It edits the handler's source, which
  `handlerIds` hashes — already true and already correct.

## Plan

1. **The enum model.** `EnumMeta {ref, name, options: [label, value][]}`, a
   registry beside `ruleRegistry`, and `Engine#Key` built from the existing
   `KEY_OPTIONS`. `world_key` becomes the `Engine#Key` value block.
2. **Enums as block arguments.** Designer type dropdown lists them;
   `paramFlavour` maps `enum:<ref>` to the string flavour; `typedValueInputs`
   builds the socket-plus-dropdown-shadow. At this point a rule can already
   declare `push ⟨direction ▾⟩` and mean it.
3. **`define choices`.** The `.rule` blocks (`world_rule_enum`,
   `world_rule_enum_option`), parsed into `RuleMeta.enums`, so a rule can author
   its own rather than only using the engine's.
4. **Events get signatures.** The designer on `world_rule_event`; `EventMeta`
   grows `parts`; `defineEventBlock` builds its message from them; an enum part
   becomes the `(any)`-bearing dropdown and the generated guard.
5. **The starter project.** `input.rule`'s events signed with `Engine#Key`, and
   `player.actor`'s jump handler with its `if` removed.

Each step stands on its own: 1–2 are useful without 4, and 4 is the one the
learner sees.
