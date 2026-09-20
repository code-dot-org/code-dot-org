# Plan: named, typed values on an event (EVENTS.md, ideas 1 and 2)

STATUS: BUILT, not yet seen in the browser. The first two ideas of
specs/EVENTS.md, which is otherwise deferred. The working record, as the
other plans are.

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
  `choice` item stops being offered and stops being written, and is
  retired outright with the per-type items beside it — nothing in the
  repository holds one, and this lab has never shipped.
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

- `631e6ba418e` — this plan.
- `9c6d54f2731` — the engine: the queue carries a list, `emit` and
  `emitToWorld` take as many values as they are given, handlers are called
  with them spread.
- `1d7a83bfb11` — the editor: the signature drawer on the event surface,
  the hat's wording and per-value filters, the blocks that name what an
  event carries and the `+` that offers them, the preview, and the stock
  DSL's guard. The retired signature items go with it.

## Learned while building

- **Half of this was already built, and could never have worked.** The
  `emit` block has made a socket per parameter of any type since
  specs/ENUMS.md, and generated `world.emit(Ev, actor, a, b)` — every
  value, positionally. The engine took the first and dropped the rest with
  no complaint anywhere. The block half was right and the transport was
  never widened to meet it.
- **One line said the quiet part.** The stock-rule DSL refused a second
  value outright, in `declareEvent`, with the reason written out: "there
  is one `eventValue` to bind". Nothing else in the lab said so, which is
  why the `emit` block could be built past it without anybody noticing.
- **Every filter compared the same value, and was right by luck.** The
  guard a hat generates read `eventValue` whatever parameter the filter
  was for. With one carried value that is the only value there is; with
  two it would have compared the wrong one. The filters carry the index of
  the value they are for now.
- **A value the hat could not filter on was dropped from its wording.**
  `define event ⟨is damaged by⟩ ⟨amount: number⟩` drew as `when ⟨this
actor⟩ is damaged by` — the sentence trailed off and the number was
  invisible on both the hat and the `define event` preview. An unfiltered
  value is a word on the hat now.
- **The preview never drew an actor's kind dropdown**, though the hat has
  drawn one since contact events were designed. The one thing a preview
  promises is that what is designed is what turns up, and for every
  contact hat in the library it was not.

- **Two filters could be the same field.** A kind filter was numbered among
  the kind filters and the enum filters together; an enum filter was
  numbered among the enum filters alone. An event filtering on both gave
  the two dropdowns the name `FILTER0`. Nothing in the library mixes them,
  which is why it went unseen, and a signature that may name several
  values makes mixing them ordinary. Both are numbered across both now.
- **Retiring the `choice` item retired six more.** `define event` wrote its
  parts as one item block per parameter type, and those items were in no
  drawer — only the designer ever made one. With both designers writing the
  same items, `world_signature_choice` and `world_signature_<type>` are
  written by nothing and offered by nothing, so they are gone rather than
  left registered.

## Not built, and known

- **A value is read by a block, not bound to a variable.** The handler is
  in another file from the declaration, so the two cannot share a variable;
  what a learner gets is a block per value, which is what `event actor`
  already was. It cannot be renamed from the handler, and renaming the
  parameter in the signature loses what was plugged in — the same bargain
  the `emit` block's sockets make.
- **A lone actor still says `event actor`**, so an event whose one value is
  an actor does not show the author's name for it. Every contact hat in the
  library is that shape.
- **`event actor` and `event value` still mean the FIRST value**, wherever
  they are used. Under a hat whose signature puts an actor second, `event
actor` is wrong — it is not offered there, and nothing stops a learner
  dragging one in from the Actor drawer.
- **The subject is not in the `+`.** The flyout holds what the event
  carries; `this actor` is the default in every actor socket already and is
  a drawer away.
- **Nothing in the library carries two values yet.** The path is exercised
  by tests over a project-declared event, not by a shipped rule.

## What to look at in the browser

In a `.rule`, `define event` → pencil: the drawer should lead with the
`let` blocks, as a `define block`'s does, and there should be no `choice`
item anywhere. Design `is damaged by ⟨who: actor⟩ ⟨amount: number⟩`: the
preview row should draw a kind dropdown for `who` and the word `amount`,
and the hat in the toolbox should match it exactly.

On that hat, the `+` should open a flyout holding `who` and `amount`.
Dragging `amount` out should give a block that plugs into a number socket
and refuses an actor one; `who` should plug into an actor socket and draw
the kind's picture.

The `emit` block should show two sockets. Raise it with a number in one and
watch the handler read the same number back — the whole point, and the half
that could not work before.

On a contact hat (`starts touching`), the `+` should be unchanged: one
block, `event actor`.
