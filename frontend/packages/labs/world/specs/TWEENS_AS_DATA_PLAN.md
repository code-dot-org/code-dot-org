# Plan: a tween is an actor's data, written on a page

STATUS: BUILT, November 2026, and seen in the browser. Follows
specs/DRAWING_PAGE_PLAN.md.

`define tween` was the last definition written as a block. A tween is a
movement described: how long, on what curve, and the `set` rows inside it,
each a destination rather than a write (`blockly/tweens`). It was defined in
the file that played it and named by its block's id, so it could only be
played from that file, and the Portrait shipped no fade for that reason.
This plan made a named tween an actor's data, written on a page as its
steps are, playable from any file.

## Not an animation

`engine/core/keyframes` says a tween and a flipbook are one timeline. They
are not one thing a learner uses:

- A tween moves any number or vector, position and a trait's own among
  them; an animation's tracks are the actor's look.
- A tween starts where the property is; an animation's keys are fixed.
- A tween's destinations are code, and may read the actor.
- Tweens run beside whatever is playing; an actor plays one animation, and
  playing a fade would stop its flipbook.
- A tween may be played on any actor; an animation is its kind's.

So a tween stays a tween, and only where it is written changes.

## The shape

- **`tweens?: {id, name, seconds: Socket, curve, body?}[]`** on the actor.
  `id` is minted once, from the name, and kept: it is what `play tween`
  names, so a renamed tween is still played.
- **A head, as a step's.** `tweenHead` reads "⟨name⟩ over ⟨1⟩ seconds,
  ⟨steadily⟩", the seconds a socket and the curve a dropdown on the head,
  the destinations below it. The sheet loads one per tween and
  `actorCode` writes `export const <tween> = (actor) => ({…})`, the
  constant `define tween` wrote, now exported.
- **`play tween ⟨Pad: fade out⟩ on ⟨who⟩`.** Its value is
  `actors/pad#<id>`, which a renamed actor file already carries
  (`renameReferences`); its options are every actor's tweens. Played from
  another file it imports the constant, as a member's call does
  (`refCode`).
- **`play a tween on ⟨…⟩`** stays code: it is a statement with a body,
  not a definition, and a screen that wants a movement uses it.
- **Where they are reached.** The Blocks tab lists the tweens under
  Tweens, with New tween; each opens "Pad › fade out".

## Order

All six are BUILT.

1. **Data and compiler.** `ActorData.tweens`, `tweenHead`, the sheet and
   `actorCode`; `inTweenBody` knows the head. `actorTweens.test` pins the
   module.
2. **`play tween` across files.** The project's tweens are registered with
   the dropdowns (`refreshProjectDropdowns`, `tweens.setProjectTweens`). A
   tween the project no longer holds plays nothing, as before.
3. **Written as data.** Jetpack's ledge and pad. The Portrait ships
   `enters` and `leaves`, and the Novel plays them; seen fading in.
4. **The page.** The Blocks tab lists Tweens, beside Every frame, in one
   list component (`MembersTab.NamedList`); a tween's page names it, and
   its head holds the time and the curve. Deleting one names the files that
   play it. Seen in the browser.
5. **The lesson.** `motion/tween`'s last step makes the Door's tween on its
   Blocks tab.
6. **`define tween` goes**, with `tweensIn`, `tweenVar`, its `ROOT_HOMES`
   and `ROOT_BLOCK_TYPES` entries, and the hoisting `assembleActorModule`
   and `assembleWorldModule` did for it. An actor's tweens are exported from
   inside its own code, before any handler runs.

## Decided

- **Named tweens are an actor's alone.** A screen's code that wants a
  movement says it where it happens.
- **`play tween` names another actor's tween.** It is what lets a kind
  ship its own entrances.
- **The fades stay tweens.** A fade must not stop a flipbook.
