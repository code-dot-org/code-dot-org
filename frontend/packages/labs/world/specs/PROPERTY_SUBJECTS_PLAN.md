# Plan: an actor property as an event's subject

STATUS: BUILT, October 2026. All seven steps are in.

A hat can be about `this actor` or `any ⟨kind⟩`. This plan adds a third
subject: an actor-typed property in scope. `when ⟨current player⟩ is hurt`
hears the event for whichever actor `current player` holds at the moment
the event happens. The game says once which actor matters, and everything
that watches it, a health bar among them, is wired by events in the screen
editor. Nothing is kept in step automatically; a display changes because a
handler changed it (specs/SCREEN_STACK_PLAN.md, "Not in this plan").

## What there is now

- **A hat's subject is `this actor` or a kind** (`SUBJECT`,
  `eventSubject.subjectKindOf`). `this actor` compiles to `actor.on(…)`; a
  kind compiles to `⟨kind⟩.on(…)` on the kind's template
  (`domainBlocks.subjectTarget`, `ActorBuilder.on`).
- **A kind's hat in a placement's code goes wrong three ways.** The
  template only reaches actors made after it, so the Player the World
  already holds never hears it. Inside it `this actor` becomes the Player,
  not the placement. Each load of the screen adds it again, and nothing
  takes it away when the screen goes.
- **The game's own events are heard everywhere**, by name, and a handler a
  screen's script hangs on one comes off with the screen (`World.on`,
  `scriptLoad`).
- **A screen may declare actor values** (`actor`, `actors`;
  `ruleMeta.PROPERTY_TYPES`), and the Main Screen's are read from other
  files by name (`World.valueNamed`). An actor-typed value holds a list of
  one.
- **The stock Health Bar** watches its `subject` with a step that runs
  every frame (`actors/stock/healthBar`).

## The model

- **Three subjects.** `this actor`, `any ⟨kind⟩`, and an actor-typed
  property in scope. The third is attached to the PROPERTY: setting the
  property points every handler on it at the new actor.
- **Read when the event happens.** The handler runs when the actor the
  event is about is one the property holds at that moment. A property that
  holds nobody hears nothing; one that holds several (`actors`) hears each
  of them. Nothing is registered on an actor, so nothing has to be moved
  when the property changes and nothing is left on a removed actor.
- **`this actor` keeps its meaning.** In a placement's code it is the
  placement; in an actor file it is the actor.
- **A handler names what its event is about by role.** `subject actor` is
  the actor the event happened to, and `object actor` the one actor it
  carries, the other side of a contact; `event actor` is renamed to it,
  since beside a subject it could mean either. Where the subject is `this
actor` the two are the same and the handler reads `this actor`. A value
  the event names as an argument is read with the variable getter, as now
  (specs/EVENT_VALUES_PLAN.md). Where the kind is known, the blocks show it:
  `subject ⟨picture⟩`, `object ⟨picture⟩`.
- **The hat's `+` offers them.** Every hat's `+` holds the subject (`this
actor`, or `subject actor` where the subject is a kind or a property),
  then `object actor` where the event carries one actor, then the getters
  of its named values.
- **Which properties are in scope**, by where the code is:
  - every file: the Main Screen's actor values;
  - a screen's own code and its placements': that screen's own actor
    values, on the copy of the screen that is running;
  - an actor file, and a placement's code: that actor's own actor-typed
    properties (the Health Bar's `subject`);
  - a map's own code and its placements': the Main Screen's, as above.
- **The game sets the property.** Nothing does it on its own. The usual
  place is beside the `load map` that brings a level in, and `when this
screen loads` for the first: `set current player to ⟨any Player⟩`.

## Decisions

- **Checked at dispatch, not rewired.** "When the property changes, move
  the handlers" and "when the event happens, ask the property" mean the same
  to a learner. The second has no state to go stale and no hook on every
  write, so it is how it is built; the inspector and the lessons still say
  the handler is attached to the property.
- **Kept by the World.** A property subject's handler is held by the World
  beside its world events, with the property it reads, and dispatched from
  the queue when an actor's event is flushed. One hung while a screen's
  script runs comes off with the screen (`scriptLoad`), so showing a screen
  twice does not hear twice.
- **A kind subject in a placement's or a screen's code is held the same
  way**, as "any actor of this kind", so it reaches actors already in the
  World and comes off with the screen. That fixes the three faults above
  with the same machinery; a kind's hat in an actor file stays on the
  template, where it is right.
- **Nobody is a state worth seeing.** A handler on a property that holds
  nobody fails silently, which is the lab's commonest bug
  (specs/MAP_EVENTS_PLAN.md). The inspector shows a game value that holds
  nobody as `(nobody)`, and a debug run says so in the console the first
  time an event finds the property empty.

## How it is built

- **The hat.** `SUBJECT`'s dropdown offers `this actor`, the kinds, and the
  actor properties in scope, each under a heading. A property is stored by
  its member reference, the way a setter names one (`memberKey`), so
  renaming it follows (`renameThing`).
- **The code.** A property subject generates `world.onSubject(⟨read⟩,
⟨event⟩, handler)`, where `⟨read⟩` is a function that returns what the
  property holds: `() => world.valueNamed("current player")` for the Main
  Screen's, `() => map.get(…)` for a screen's own, `() => actor.get(…)` for
  an actor's own. The handler is `(world, eventActor, …values)`, and `actor`
  is not rebound.
- **The engine.** `World.onSubject` keeps `{read, event, handler}`; the
  queue, flushing an actor's event, runs the actor's own handlers and then
  every subject handler for that event whose `read()` holds the actor. A
  kind subject in a placement's or a screen's code is the same call with a
  `read` that asks the actor's kind.

## Order of work

1. This plan.
2. Engine: `World.onSubject`, dispatch from the queue, taken off with the
   screen that hung it. Tests: a property that changes between two events,
   one that holds nobody, one that holds several, a removed actor, a screen
   shown twice.
3. Compiling: a property subject in each scope, and a kind subject in a
   placement's or screen's code through the same path. `this actor` stays
   the placement. Tests through compiled projects.
4. The roles: `subject actor`, `event actor` renamed `object actor`, and
   the hat's `+` offering them. Then the editor: the subject dropdown's
   property rows by scope, `(nobody)` in the inspector, the console note in
   a debug run. Renaming a property rewrites the hats on it.
5. The starter: the Main Screen declares `current player`, sets it as the
   game starts and wherever it loads a level, and the Health Bar's
   placement code hears `when ⟨current player⟩ is hurt` and sets its own
   fraction. The Health Bar loses its per-frame step, and becomes a
   Progress Bar if nothing else is left of it.
6. The shelf: which lesson grants the property subject, and its check.
7. Specs: what this replaces, and this record.

## What was found before step 2

- **The queue** runs an actor's own handlers in `EventQueue.flush`, each
  with the actor in hand (`withActor`). A subject handler runs straight
  after them, the same way, so the actor's own order is unchanged.
- **A removed actor stays in the values that held it.** Nothing clears an
  actor value when its actor goes; the actor's `world` is unset. A removed
  actor raises nothing, so dispatch is not affected, but a handler reading
  `health of ⟨current player⟩` reads the removed one, and `(nobody)` in
  the inspector has to count a removed actor as nobody (step 4).
- **Only the starter, Tapper and Jetpack have a HUD.** The starter's Health
  Bar names the Player's kind as its `subject`; Tapper's score label hears
  the game's `scored`; the lessons reach actors by kind from the game's own
  code, which this plan leaves alone.

## Learned while building

- **Step 2 is `World.onSubject(subject, event, handler)`**, with `subject` a
  function read when the event happens, and `subjectHandlersFor`, which
  the queue asks after an actor's own handlers. One hung while a screen's
  script runs comes off with the screen, as a world handler does. The
  handler is handed the actor the event is about, as an actor's own is.
- **Step 3 stores a property subject as its getter's block type** in
  `SUBJECT`, beside this actor (empty) and a kind (its path). Every
  `actor` and `actors` property is registered as a subject as its getter is
  defined (`registerSubjectProperty`), and the field offers them all; which
  are offered where is step 4. The subject's code is what the getter would
  read from there: the Main Screen's by name from a map or screen, a
  screen's own on its copy, a placement's own on `actor`.
- **A kind heard from a map's, a screen's or a placement's code goes the
  same way**, through `world.ofType`, so the actor the World already held
  hears it and `this actor` stays the placement.
- **The Main Screen's module puts these hats after `const world`**, with
  the world's own, since they call `world.onSubject`; the builder records
  the call. A subject is handed the World, since a module's `world` is the
  builder.
- **Any load's script now owns what it hangs through `onSubject`**, a
  map's as well as a screen's; `World.on` still ties only a screen's.
- **Compared before and after**: no difference but the random lessons'.
  No content uses a property subject or a kind in placement code yet.
- **Step 4 began with the roles.** `event actor` is `object actor` now,
  the block type and every lesson, fixture and drawer that named it, with
  no shim for the old type (specs/RETIREMENTS_PLAN.md). `subject actor` is
  new: the handler's `subject` where the World holds it, its actor
  anywhere else. Every hat that has something to name gets one `+`
  (`eventHatToolboxExtension`), whose list is rewritten as the hat's
  subject changes, since the mini toolbox reads it each time it opens.
- **`this actor` under a kind's hat is that kind only in the game's own
  code**, where the handler binds it; in a map's or a placement's code it is
  the placement, and is drawn with no picture of the hat's kind.
- **Step 4's editor half scopes the subject list by the workspace's tags.**
  The placement editor now tags its workspace with its file and, for a
  placement, its actor (`setEditingFile`, `setEditingActor`), so
  `subjectOptions` offers the Main Screen's values everywhere, a screen's
  own in that screen's files, and an actor's own in its placements. A
  workspace with no file tagged offers every property, and a hat keeps the
  property it already holds even where it is out of scope, so a load never
  drops a subject.
- **The inspector adds `Actor` values**, shown as `(nobody)` and marked
  "Set by code"; nothing sets one by hand.
- **The console note is the World's**, said once per handler, naming the
  property (`onSubject`'s `named`). A removed actor counts as nobody, so a
  subject left holding the Player after it went says so.
- **Renaming a property rewrites the hats about it**: `rewriteWorkspace`
  maps a `SUBJECT` holding a getter's block type as it maps the getter.

- **Step 5 took `player arrived`.** The Main Screen declares `current
player` and the event, and its `when this screen loads` sets the one and
  raises the other. The HUD's bar is a plain Progress Bar whose placement
  code hears `when ⟨current player⟩ is damaged` and `player arrived`, and
  sets its own fraction from each; nothing runs every frame. The starter no
  longer holds `healthBar.actor`.
- **The builder raises a world event** (`WorldBuilder.emitToWorld`), since
  the Main Screen's `when this screen loads` runs while `world` is still the
  builder. Outside a frame it is deferred, and the World made from the
  description dispatches it on its first tick, after every handler is hung.
- **The stock Health Bar keeps its step** (since retired,
  specs/OWN_SUBJECTS_PLAN.md). The Health enhancement gives
  each actor a bar of its own and sets the bar's `subject`; for that bar to
  be event-driven, a hat in an actor file would have to be about the
  actor's own property, held once per instance. No scope compiles that
  yet: an own property is read only from a placement's code.

- **Step 6 is `story/watch`, "A bar about the player"**, beside
  `story/screen`. Its project is the starter with the bar's `is damaged`
  handler taken out; the learner puts it back, about `current player`. The
  check walks into the Crawler and asks that the bar ends at the Player's
  health over three. It grants `subject actor`, now in the Actor drawer
  beside `object actor`, and lends `math_arithmetic`.
- **The grant is an affordance, `subject-properties`**, read by the subject
  dropdown through a workspace tag (`setSubjectPropertiesWithheld`) that the
  file editor and the placement editor set from the shelf. Withheld, a hat
  offers no property but the one it already holds. The placement editor
  sets it when its workspace is made, so a lesson passed while the editor
  is open takes effect when it is next opened.
- **The lesson is not written as a world**, since its HUD and the bar's own
  code have no `define world` form; the world-view test passes over it.
- **Step 7 marked what this changes**: DOCKING_PLAN.md, whose step 6 had
  the starter's bar follow the Player's kind; EVENTS.md, UI_ACTORS.md and
  EVENT_VALUES_PLAN.md where they named `event actor`; and PROGRESSION.md's
  Story table, which gains `story/screen` and `story/watch`. The stock
  Health Bar's own passages (UI_ACTORS.md, ENHANCEMENTS.md, MAPS.md) stand,
  since that bar is unchanged.
- **After the plan, healing raises `is healed`**, the Health rule's third
  event on `Has Health`, raised only when a heal gives something back. The
  starter's bar hears it as it hears `is damaged`; the lesson takes both
  handlers out, since the second would be the answer written out.

## Open

- **An actor file's hat about its own property**, as above, which is what
  would retire the Health Bar's step. Built in specs/OWN_SUBJECTS_PLAN.md.

## Not in this plan

- **An actor raising the game's events.** A map raises them by name; an
  actor file is not offered their `emit`. Worth having as the way a kind
  tells the game something, and separate from this.
- **A property subject that names a placement.** A placement is one map's;
  a game value that should follow a level is set from code.
- **Automatic sync.** No binding keeps a display in step with a value
  (specs/SCREEN_STACK_PLAN.md).
