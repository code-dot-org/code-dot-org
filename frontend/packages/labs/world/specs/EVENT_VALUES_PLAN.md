# Plan: named, typed values on an event (EVENTS.md, ideas 1 and 2)

STATUS: PROPOSED. The first two ideas of specs/EVENTS.md, which is otherwise
deferred. The working record, as the other plans are.

## What an event can say today, and what it cannot

- **One value.** `emit(event, actor, detail?)`, a queue of
  `{event, actor?, detail?}`, a handler of `(world, actor, eventValue)`.
  The stock-rule DSL enforces this in so many words: `declareEvent` throws
  if a signature carries more than one thing that is not a set of choices,
  because "there is one `eventValue` to bind".
- **A signature of choices.** `define event` uses the same designer
  `define block` uses, with the arguments row restricted to the CHOICE
  item — `surfaceToolbox` offers that item and the wording item and
  nothing else, and `buildArguments_` writes the older per-type items
  rather than the `let` and `argument` blocks.
- **A hat that filters.** An enum parameter becomes a dropdown with
  `(any)` in front; an actor parameter becomes a dropdown of the project's
  kinds. A parameter of any OTHER type is dropped from the hat's phrasing
  altogether — `define event ⟨damaged by⟩ ⟨number amount⟩` draws as
  `when ⟨this actor⟩ damaged by`, and the amount has no word and no reader.
- **An `emit` that already passes them.** `defineEmitBlock` makes a socket
  per parameter whatever its type, and generates
  `world.emit(Ev, actor, a, b)`. The engine takes the first and drops the
  rest. The block half of what is asked for here is built; nothing carries
  it.
- **Two ways to read the one value**, neither named: `event value`, typed
  `null` so it fits any socket, and `event actor`, the same value typed as
  an Actor and offered in a `+` flyout on the hat that carries one.

So an event that is about two things picks one and loses the other, and an
event about a number says the number's name nowhere.

## What is being built

**An event carries as many values as its signature names, and a handler
reads each one by that name, typed.**

- **The engine carries a list.** `emit(event, actor, ...values)`,
  `emitToWorld(event, ...values)`, a queue of `{event, actor?, values}`,
  and handlers called with the values spread. One value is the same call
  it is today, which is what every rule in the library makes.
- **`define event` designs like `define block`.** The event surface offers
  the signature drawer `define block`'s surface offers — the `let` blocks
  first, then wording, then `argument` with its type dropdown — and
  `buildArguments_` writes an event's parts as those same blocks. The
  `choice` item stops being offered and stops being written; it stays
  DEFINED and readable, because a saved document may hold one.
- **A value the author named gets a block with that name on it.** Per
  event, per parameter: `world_carried_<Rule>_<Event>_<Name>`, wearing the
  parameter's name, typed by the parameter's type, generating the
  positional name that parameter arrives under.
- **The hat offers them behind its `+`.** The mini toolbox that today
  holds `event actor` holds one block per carried value instead, in
  signature order, so the way to name what the event brought starts on the
  block that brought it.
- **The hat says what it carries.** A parameter with no filter is drawn as
  its own name, so `when ⟨this actor⟩ is damaged by ⟨amount⟩` reads as a
  sentence rather than trailing off. The preview on `define event` draws
  the same thing, including the kind dropdown it has never drawn.
- **A filter compares its own value.** Today every filter guard compares
  `eventValue`, which was right when there was one. Each filter now
  compares the value it is the filter for.

## Decisions taken before building

- **Positional transport, named reading.** What crosses the queue is a
  list; what a learner sees is a name. Binding the names at the call
  boundary was considered and refused: a handler is in another file from
  the declaration, so the two cannot share a variable the way a `define
block`'s body shares one with its signature, and a generated closure
  parameter taking the author's word for it would collide with a body
  variable of the same name.
- **`eventValue`, then `eventValue$2`, `eventValue$3`.** The first value
  keeps the name it has, so every handler already written generates
  exactly what it generated before. The rest are numbered from two, as the
  learner counts them. The `$` is the point of the spelling: Blockly's
  name table replaces every character outside `[A-Za-z0-9_]` when it makes
  an identifier for a variable, so no variable a learner can name will
  ever collide with one of these.
- **`event value` and `event actor` keep meaning the FIRST value**, and
  are not deprecated. They are what an undesigned event's one value is
  called, and under a designed hat the first value is still the first
  value.
- **A lone actor parameter keeps `event actor` in the flyout.** That is
  every contact hat in the library — `when ⟨this actor⟩ starts touching
⟨Brick⟩` carries one actor, whose parameter the stock rule calls
  `other`. Two blocks for one value is worse than either alone, and of the
  two `event actor` is the one the lessons point at and the one that draws
  the kind it was filtered to. Every other shape of signature offers the
  author's names.
- **The block type is keyed by the parameter's NAME**, not its position.
  Renaming a parameter then loses what was plugged in, and reordering does
  not — which is the same bargain the `emit` block's sockets already make
  (`paramValueNames`), so the two halves of an event break in the same
  place or not at all.
- **The one-value guard in the stock DSL goes.** It exists because the
  transport could not carry two. Nothing in the library needs a second
  value today; the check would simply be false from here on.

## Order of work

1. The engine: queue, `emit`, `emitToWorld`, the two handler types. Tests.
2. The designer: the event surface's drawer, and writing an event's parts
   as `let`/`argument` items. Tests.
3. The hat: the carried-value blocks, the `+` flyout, the unfiltered
   parameter's word, per-value filter guards, the closure's parameters.
   The preview, to agree with it. Tests.
4. The `emit` side: whatever the engine change leaves to do, and an
   event's parts keeping their defaults through `ruleMeta`. Tests.
5. The stock DSL's guard.
6. Specs: this record, and EVENTS.md's ideas 1 and 2 marked.

## Commits

## Learned while building

## Not built, and known

## What to look at in the browser
