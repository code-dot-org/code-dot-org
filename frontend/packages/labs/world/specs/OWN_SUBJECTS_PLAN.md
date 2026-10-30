# Plan: a kind's hat about its own property

STATUS: BUILDING, October 2026. Steps 2 and 3 are done. Follows specs/PROPERTY_SUBJECTS_PLAN.md,
whose one open item this is.

A hat in an actor file may be about that actor's own actor-typed property:
in `healthBar.actor`, `when ⟨subject⟩ is damaged`. Every actor of the kind
hears the event when its own `subject` holds the actor it happened to, and
inside the handler `this actor` is the bar and `subject actor` is the one
that was hurt. The stock Health Bar then fills itself by events, and loses
the step that runs every frame.

## What there is now

- **A property subject is held by the World**, one entry per hat, with a
  function read when the event happens (`World.onSubject`). In a
  placement's code that function reads `actor.get(…)`, where `actor` is
  the one placement whose code it is.
- **In an actor file there is no such `actor`.** The file describes a kind,
  and its hats go on the kind's template (`ActorBuilder.on`), which every
  instance copies when it is made (`instantiate`). `subjectRead` returns
  nothing for an own property outside a placement's code, and the hat
  compiles to nothing.
- **The dropdown offers it anyway.** The file editor tags an actor file's
  workspace with its actor, so `subjectOptions` lists that actor's own
  properties there. A learner who picks one gets a hat that never runs and
  says nothing: the lab's commonest bug, made by the lab
  (specs/MAP_EVENTS_PLAN.md).
- **Acts-like copies handlers.** `ActorBuilder.actsLike` appends the
  other kind's handlers, so a kind that acts like a Health Bar fills the
  same way.
- **The stock Health Bar** reads `health ÷ most health` of its `subject`
  in a `react` step, every frame. The Health enhancement adds one per
  actor and sets its `subject` (`actors/enhance/health`).

## The model

- **One hat, every actor of the kind.** The hat is a statement about the
  kind: "a bar hears damage to whatever it is about". Each actor of the kind,
  placed or added, now or later, is one listener, and stops being one when
  it is removed.
- **Read when the event happens**, as a property subject is
  (PROPERTY_SUBJECTS_PLAN.md, "Checked at dispatch, not rewired"). When an
  actor's event is flushed, every actor carrying such a hat for that event
  is asked whether its property holds the actor now; each that does runs
  the handler. Nothing is registered per instance, and nothing has to be
  taken off a removed actor or moved when the property changes.
- **`this actor` is the listener; `subject actor` is the one it happened
  to.** The same roles as a property subject in a placement's code, with
  the listener standing where the placement stood.
- **Inherited like a handler.** A kind that acts like one with such a hat
  has it too.

## Decisions

- **Kept on the kind, not on the World.** A placement's property subject
  names one placement, so the World can hold it as one entry. This one names
  a kind, and the actors of a kind come and go. So the template carries it
  (`ActorBuilder`, beside `handlers`), each Actor carries it from there as
  it carries its handlers, and the World keeps the set of actors in it that
  carry any, added in `addActor` and dropped in `removeActor`. Dispatch walks
  that set, not every actor.
- **After the property subjects**, in the queue's order: the actor's own
  handlers, then the World's subject handlers, then these. The actor in hand
  while a handler runs (`withActor`) is the listener, so a spawn lands in the
  bar's space, which is where its code is about.
- **A removed subject is nobody**, as before: an actor out of the World is
  not held, whatever the property still says.
- **No console note for nobody.** A Health Bar the enhancement has not
  pointed yet is ordinary, and one note per bar per event would bury the note
  that matters. The placement case keeps its note.

## How it is built

- **The engine.** `ActorBuilder.onOwnSubject(property, event, handler)`, with
  `handler` `(world, actor, subject, …values)`; `Actor` keeps the entries;
  `World` indexes the actors that carry any; `EventQueue.flush` asks
  `world.ownSubjectHandlersFor(event, actor)` for `[listener, handler]`
  pairs after the subject handlers.
- **The code.** In an actor file a hat about the actor's own property
  generates `⟨kind⟩.onOwnSubject(⟨property⟩, ⟨event⟩, (world, actor,
subject, …) => {…})`, on the template the file's other hats use
  (`subjectTarget`). `subject actor` there reads `subject`, as where the World
  holds a handler; `this actor` reads `actor`, as in any actor file.
- **The Health Bar.** Its step goes. Its file hears `when ⟨subject⟩ is
damaged` and `when ⟨subject⟩ is healed` and sets its own fraction from
  `subject actor`. A bar that holds nobody stays as it was drawn last,
  which is full.

## Order of work

1. This plan.
2. Engine: `onOwnSubject`, carried by instances and by acts-like, indexed by
   the World, dispatched from the queue. Tests: two bars on two subjects,
   a subject changed between events, a bar added after the event's actor,
   a removed bar, a removed subject, a kind that acts like the bar.
3. Compiling: the hat in an actor file, `subject actor` and `this actor`
   inside it, and acts-like through compiled files. Tests through a
   compiled project.
4. The Health Bar and the enhancement: the stock bar's hats in place of its
   step; the enhancement's bar fills on the first hit and on each heal.
   Settle the open question first.
5. Specs: UI_ACTORS.md and ENHANCEMENTS.md, where they say the bar asks
   its subject as it paints; PROPERTY_SUBJECTS_PLAN.md's open item; this
   record.

## Learned while building

- **Step 2 is `ActorBuilder.onOwnSubject(property, event, handler)`**,
  copied into each instance as handlers are, and by `actsLike`. The World
  keeps its listeners in `addActor` and `detach`, the two places an actor
  joins or leaves its list, and `ownSubjectHandlersFor` answers the queue
  with listener and handler pairs. A subject not in the listener's World is
  held by nobody.
- **A listener's hats count in `handlerIds`**, by event, property and
  source, so editing one restarts the game as editing a handler does.
- **Step 3 is one branch in the hat's generator.** An actor-scoped property
  subject in a file whose module is under `actors/`, and not in a map's or a
  placement's code, generates `actor.onOwnSubject(…)` on the file's builder.
  `subject actor` already read the handler's `subject` under any property
  hat, and `this actor` reads `actor`, which the handler binds to the
  listener, so neither block changed. A property the kind has through
  `acts like` is handled the same way, since the generator does not ask
  which file declared it.

## Open

- **A bar pointed at somebody already hurt.** The bar is full until the next
  damage or heal, as the starter's was before `player arrived`. The
  enhancement sets `subject` as it adds the bar, when its target is usually
  full, so this is wrong only for a bar pointed later. One answer is a
  `when ⟨this actor⟩'s ⟨subject⟩ changes` hat; another is that whoever sets
  `subject` also sets `fraction`. To decide by step 4.
- **Whether a placement's code should use this too.** A placement's own
  property subject is held by the World for the one placement today; the
  same hat in a kind's file would now mean every actor of the kind. The two
  agree, and there is no reason yet to merge them.

## Not in this plan

- **A property of another actor as a subject**, `when ⟨subject of ⟨any
⟨Health Bar⟩⟩⟩ is damaged`. A hat is about something the code it is in
  can name; this is a query, and a different feature.
