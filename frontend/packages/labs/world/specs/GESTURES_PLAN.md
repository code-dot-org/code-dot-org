# Plan: the finger (APPS.md, missing thing 1)

STATUS: PROPOSED. The first of the six things specs/APPS.md says an app
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

## Learned while building

## Not built, and known

## What to look at in the browser
