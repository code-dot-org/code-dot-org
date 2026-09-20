# Plan: the finger (APPS.md, missing thing 1)

STATUS: BUILT, not yet seen in the browser. The first of the six things specs/APPS.md says an app
wants and this lab does not have, and the one it says blocks the rest: "a
control that cannot be dragged cannot be a list that scrolls". The working
record, as the other plans are.

## What the pointer is today

- **One pointer, polled once a frame.** The driver reads Phaser's active
  pointer and hands the world a position and the set of buttons held. The
  world keeps the previous set, so it can answer which buttons went down
  and which came up this tick — the same shape the keyboard has.
- **Three events, all about buttons.** The Mouse rule runs one step in
  `sense`, walks the buttons that changed, and announces each three times:
  on the world, on the actors that elected `Takes Mouse Input`, and — for
  a press only — on the actors under the pointer that elected `Can Be
Clicked`.
- **Where the pointer is is not an event.** `mouse position` answers it,
  deliberately, so nothing has to remember the last one to be able to ask.
- **Nothing has met a finger.** No drag, no swipe, no long press, no
  double tap, no hover. The Slider fakes dragging: it keeps a `held`
  boolean, jumps to the press, and follows the pointer each frame for as
  long as the button is down.

## The thing worth saying first

**One finger needs no engine change.** Everything a gesture is made of can
already be said in a rule:

- the press and release edges, which the Mouse rule already walks;
- where the pointer is, and how long the frame took;
- the world's clock in seconds, for how long a press has lasted;
- rule-level properties, which persist across ticks;
- which actors are under a point, which the Mouse rule already works out
  from position and drawn size.

So this is a stock rule and an enum, not a change to the engine. What DOES
need the engine is multi-touch, which means pointer identities and asking
Phaser for more than one, and telling a finger from a mouse, which only
matters for hover. Both wait.

## What is being built

**A `Gestures` rule, ability `Reads Gestures`**, in the shape the Mouse
rule already has: one step in `sense`, events announced on the world and
on a trait.

- **A `Direction` enum in the engine**, beside `Key` and `MouseButton`:
  left, right, up, down. A swipe filters on one, so it has to be a set of
  named choices, and a direction is engine vocabulary rather than a rule's
  invention.
- **World events**, for a gesture that is about the screen rather than
  about a thing: `the screen is swiped ⟨left⟩`, and the drag pair, which
  is how a list scrolls.
- **A trait, `Takes Gestures`**, whose events belong to the actor the
  press BEGAN on: `is dragged` carrying where the pointer now is, `is
dropped`, `is swiped ⟨left⟩`, and `is long pressed`.
- **The Slider stops faking it.** It keeps `held` and a per-frame follow
  today; it becomes a handler for `is dragged`.

## Decisions taken before building

- **A gesture belongs to what the press began on.** This is where the
  trait deliberately differs from `Takes Mouse Input`, which hears every
  button wherever it went down. Dragging something you are no longer over
  is the whole point of dragging, so the rule marks the actors under the
  press and keeps them marked until it ends.
- **Marked with a per-actor boolean on the trait, not an actor-valued
  property on the rule.** Two reasons: nothing then limits it to one actor
  at a time, and the rule stays free of a reference it would have to clear
  when an actor is removed.
- **The rule reads the button edges itself** rather than handling the
  Mouse rule's events. Events are queued and flushed after the tick, so a
  rule built on them would react a frame late — which for a drag means the
  thing lags the finger by a frame, forever.
- **It runs in `sense`**, where the Mouse rule runs, for the same reason:
  the frame's input is read before anything decides what to do about it.
- **A drag starts after the pointer has moved far enough.** Otherwise
  every click is a one-pixel drag. The threshold is a rule property, so it
  is a number a learner can see and change rather than one buried in a
  rule.
- **A swipe is a fast, far press that did not become a drag**, decided at
  release: far enough, quick enough, and its direction is whichever axis
  moved further. `+y` is down in this engine — gravity's default direction
  is `y: 1` — so a swipe up is a negative change in y.
- **A long press fires WHILE the finger is down**, not at release, which
  is what makes "hold to confirm" work. Once per press, which needs one
  more boolean.
- **Double tap is not in this cut.** It wants the time and the place of
  the last release, which is two more properties, and nothing in the
  interface kit is waiting on it.

## Order of work

1. This plan.
2. The `Direction` enum, beside the engine's other two.
3. The `Gestures` rule: its state, its events, its step. Tests.
4. The Slider onto `is dragged`. Tests.
5. Specs: APPS.md's first missing thing marked, and this record.

## Commits

- `2b49586115b` — this plan.
- `6885bd41c22` — the `Direction` enum.
- `117199496f9` — one shared definition of what is under the pointer.
- `22da232dc43` — the `Gestures` rule and eight tests that run it.
- the Slider onto the drag event, the demo the shelf asks for, and the
  tile that grants the rule.

## Learned while building

- **A swipe is not an alternative to a drag.** It travels far by
  definition, so by the time the finger lifts it has already crossed the
  drag threshold. The release asked "was it a drag, or else a swipe?" and
  the answer was always the first, so a swipe could never happen. They are
  two questions now, and a fast far release is both — which is also what a
  phone does when you flick a list.
- **A release arrives with the pointer wherever it was let go**, and the
  step read that as one more frame of dragging. The Slider ended a drag by
  jumping to wherever the pointer had stopped. Handling the release BEFORE
  the frames in between is the whole fix, and the order is now the first
  thing the step says about itself.
- **`choice` names a set without the prefix a parameter's type carries.**
  `param('direction', 'enum:Engine#Direction')` and
  `choice('Engine#Direction', 'left')` are the same set spelled two ways,
  and the wrong one fails as "Invalid block definition" when the workspace
  loads rather than when the rule is written.
- **The shelf and the progression each hold a rule to something.** A rule
  on the shelf needs a DEMO — a small recorded world showing what it does,
  which every other stock rule has — and a tile that grants it, or it is
  something a learner can only meet by accident. Two tests said so, which
  is the library keeping its own promises rather than a person
  remembering to.
- **The Slider had a drag written out by hand**, and it is exactly what
  the rule exists to stop every control writing again: a `held` boolean,
  and a step asking every frame whether the button was still down. It is a
  handler for one event now, and keeps no state of its own.

## Not built, and known

- **One finger.** Multi-touch needs pointer identities and a second call
  to Phaser, and nothing in the interface kit is waiting on it.
- **A finger is not told from a mouse.** Only hover wants that.
- **No double tap.** It wants the time and the place of the last release,
  which is two more properties.
- **A gesture is decided once a tick**, so a press and release inside one
  frame is invisible — the same bargain the whole engine makes, since
  events are queued and flushed once a tick.
- **Nothing scrolls yet.** A list view is the next thing that needs this,
  and it is its own piece of work.

## What to look at in the browser

The Slider is the one to try, because it is the control that changed.
Press it and the knob should jump to the press, as before. Drag, and the
knob should follow. THEN drag off the end and keep going: the knob should
stay pinned at the end and come back when the pointer returns, because the
gesture still belongs to the slider. Letting go anywhere should leave the
knob where the finger left it rather than jumping.

On a touch screen, the same with a finger.

A swipe wants a project of its own: an actor with `Takes Gestures` and a
`when ⟨this⟩ is swiped ⟨left⟩` hat. A quick flick should fire it; a slow
drag the same distance should not.
