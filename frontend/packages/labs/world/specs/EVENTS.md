# Exploration: the event model, for interfaces

STATUS: PROPOSED, and deliberately a list of ideas rather than a design.
Written beside specs/UI_ACTORS.md, which argues that an interface element
is an actor, and after specs/APPS.md, which found six things an app wants
that a game did not. This one asks a narrower question: what would an event
have to be able to SAY for an interface to be built comfortably out of
actors — and which of those answers a game would want too.

## What an event is today

- **It carries one thing.** `emit(event, actor, detail?)` and
  `emitToWorld(event, detail?)` (`engine/core/World.ts`); the queue holds
  `{event, actor?, detail?}` (`engine/core/EventQueue.ts`). A handler reads
  it with `event value`, whose output type is `null` — it fits any socket
  — or with `event actor`, which is the same one thing typed as an Actor.
- **It is declared, not invented.** `define event ⟨quit⟩` in an actor, a
  map or a rule; a rule's own events are the world's, a trait's are an
  actor's (`EventMeta.scope`). There is no string-keyed bus.
- **A hat may filter on a choice.** specs/ENUMS.md gave `define event` a
  designed phrasing whose parameters are enums, so `when ⟨space⟩ is
pressed` is one block instead of a hat and an `if`. Some hats filter on a
  KIND as well — `when ⟨any Door⟩ starts touching ⟨Player⟩`.
- **It happens after the tick, once.** The queue is flushed after every
  step has run, snapshot-and-clear, so an event raised by a handler is
  dispatched on the NEXT tick. One round of handlers per tick, and no
  in-tick feedback.
- **Every handler runs.** There is no order among them, no way for one to
  say it has dealt with it, and no way for a handler to answer.

That is a good model for a game, and its limits are visible in the lab's
own interface kit: **five stock controls each hand-roll a change event** —
Text Input and Text Area raise `changed`, Slider raises `changed`, Toggle
raises `turned on` and `turned off`, Dropdown raises `chosen`. Five kinds,
five bespoke announcements of the same idea, each written out in blocks.

## What an interface asks that a game did not

A game's events are about things HAPPENING: a touch, a landing, a key. An
interface's are mostly about a value BEING DIFFERENT, about WHICH of many
identical things, and about whether something is allowed. Those are three
sentences the model cannot say.

## Ideas

Each with what it buys, what it costs, and whether a game wants it too.

### 1. An event carries named values

`define event ⟨changed⟩ with ⟨text was⟩ ⟨text now⟩`, and the hat hands both
over. Today a handler gets one unnamed thing, so an event that is about two
things either picks one and loses the other, or smuggles a pair through as
an actor.

The signature machinery already exists: `define block` takes typed
arguments, and `define event` uses the same designer with only the `choice`
item offered (`domainBlocks`, `SIGNATURE_ITEMS`). Letting an event's
signature take value items as well as choices is mostly a decision about
what the hat looks like — a variable per value, the way a `for each` loop
hands over its item, rather than a socket.

- **Buys:** "which row, and what is in it". Every list, every field.
- **Costs:** the hat grows; `event value` has to keep meaning the first one
  for every event already written.
- **A game too:** "damaged by ⟨who⟩ for ⟨how much⟩" is the same shape, and
  today the amount is lost.

### 2. Those values are typed

`event value` reports `null`, which fits every socket: plug the Text
Input's `changed` into a number and nothing complains until it runs.
Typing follows free from idea 1, since the signature items carry types.

- **Buys:** the connection check does the teaching, which is how the rest
  of the language works.
- **Costs:** every existing event's value is untyped and must stay
  pluggable, so this is a property of NEW signatures, not a retrofit.

### 3. A hat that filters on more than a choice

Enums and kinds can be filtered on. An interface wants two more: **which
one** (this Button, not any Button) and **only when** (a guard). The first
is the more valuable — `when ⟨the Save button⟩ is clicked` is the sentence
a learner writes, and today they either write a placement script or an `if`
about `this actor`.

Placement scripts already answer it per instance (specs/MAP_SCRIPTS_PLAN.md
— the whole reason the map-first work happened). So this is a smaller idea
than it looks: it is a hat that filters on a PLACEMENT NAME, in a world's
file, for people who would rather keep their behavior in one place.

- **A game too:** "when ⟨the Boss⟩ is damaged".

### 4. When a value changes

The big one. `when ⟨text⟩ of ⟨this actor⟩ changes`, raised by the engine
when a property is set to something different — and its declarative twin,
**keep ⟨the Label's text⟩ as ⟨join ⟨"Lives: "⟩ ⟨lives⟩⟩**, which is a
standing instruction rather than a handler.

An app is mostly this: a value changes, something on screen follows. So is
a game's HUD — `memory/world-state` exists because two Labels disagreed
about a number, and its answer was "read it from the world", which still
leaves somebody writing the row that copies it into the text.

- **Buys:** the five hand-rolled change events collapse into one idea; a
  HUD stops being handwritten; data binding becomes sayable without the
  word.
- **Costs:** real engine work. Properties are set through `Traited.set`,
  so the hook has a home, but "changed" needs a comparison per set, a
  decision about vectors and lists (copied on write — specs/LISTS.md), and
  care that a standing instruction cannot loop. The queue's one-round-per-
  tick rule is what keeps that safe, and is worth keeping.
- **The risk worth naming:** a binding that is cheap to write is cheap to
  write a hundred of. It wants a way to see what is bound (idea 10).

### 5. Events that travel, and can be handled

A row in a list is a Panel with a Label and a Button in it (parenting —
specs/PARENTING.md). Tap the Button and the Button hears it; tap the row
and the row hears it; tap the Button and the ROW hears nothing. An
interface wants the tap to travel up the parent chain, and wants the
Button to be able to say it has dealt with it.

- **Buys:** lists, cards, anything nested. It is the missing half of
  parenting.
- **Costs:** a decision about direction (up only, probably), and
  `handled` — which is the first thing in this model that lets one handler
  affect another, so it needs an order to be meaningful.
- **A game too:** a click on a HUD over the level should not also be a
  click on the level.

### 6. Events that wait

`when typing stops for ⟨0.5⟩ seconds`, `after ⟨2⟩ seconds`, `every ⟨1⟩
second while ⟨…⟩`. The Time rule has timers, so the machinery exists as a
rule; what is missing is saying it about an event — debounce and throttle,
without those words.

- **Buys:** search-as-you-type, autosave, "hold to confirm".
- **Costs:** small, if it is a rule rather than a change to the queue.

### 7. Events that can be refused

`before ⟨text⟩ of ⟨this⟩ changes → refuse when ⟨…⟩`. A validation is the
one place an interface genuinely wants a handler's ANSWER, and the model
has no channel for one.

- **Buys:** a field that will not take letters; a form that will not
  submit.
- **Costs:** the most invasive idea here. A refusable event cannot be
  queued-and-flushed — the setter has to wait for the answer — so it is a
  different mechanism wearing the same word. **Recommend not doing this as
  an event.** A `may ⟨…⟩` query on the actor, asked by the control, says
  the same thing inside the model that exists.

### 8. Gestures are events

Tap, long press, drag, swipe. specs/APPS.md puts a finger first for its own
reasons; from here the point is that they should arrive as declared events
with values — `when ⟨this⟩ is swiped ⟨left⟩` is a choice parameter (idea 3)
and `when ⟨this⟩ is dragged` carries a place (idea 1).

- **A game too:** every touch game.

### 9. Subjects that are not actors

An event is about an actor or about the world. An app has things that are
neither: a save, a request, a screen. A MAP already declares its own events
(specs/MAP_SCRIPTS_PLAN.md — the pause menu's `quit`), which is the
precedent: the subject can be a thing that is not an actor, and the hat
says whose it is.

- **Buys:** "when the save finishes", "when this screen appears".
- **Costs:** modest, and mostly naming.

### 10. Seeing them

A panel that lists what was raised this tick, by whom, with what values,
and which handlers ran. Every idea above makes the event model richer and
therefore harder to picture; this is the one that keeps it teachable, and
it is also the best debugging tool the lab could have.

- **A game too**, emphatically.

## What not to build

- **A string-keyed event bus.** Everything here keeps events DECLARED, so
  a dropdown can offer them, a rename can find them, and a typo is not a
  silent no-op.
- **In-tick cascades.** One round of handlers per tick is what makes a
  world explicable and a binding safe. Every idea above fits inside it.
- **A second mechanism called events.** Idea 7 is the example: when the
  thing wanted is an answer, the language already has queries.

## Where to start

1. **Named, typed values on an event** (1 and 2). It is the smallest change
   that makes the other ideas expressible, and the signature designer is
   already there.
2. **When a value changes**, and `keep ⟨…⟩ as ⟨…⟩` (4). The largest gain
   for both apps and game interfaces, and the one that removes five
   hand-rolled events from the stock kit.
3. **Travel and handled** (5), which lists need.
4. **Gestures** (8), with the finger work in specs/APPS.md.
5. **Waiting** (6) and **non-actor subjects** (9), both small.
6. **The event log** (10) — early, if any two of the above land.
