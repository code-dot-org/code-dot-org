# Splitting collision: detection from response

## Where it stands

`rules/collision.rule` does both jobs in one step. `resolve` walks the solids,
decides which axis an actor came in through, pushes it out, and zeroes the
velocity on that axis. Two things follow from the fusion, and both are visible:

**Jumping against a wall sticks.** The axis is chosen PER BODY: "resolve on the
axis the actor was clear of a tick ago, else the shallower overlap". Rising
alongside a column of tiles, the actor is horizontally inside the column the
whole way up, but each tile it passes is one it was vertically clear of last
tick — so vertical resolution wins, the actor is snapped to that tile's face,
and `velocity.y` is zeroed. Every tile boundary cancels the jump. The same
choice makes two floor tiles snag at their seam.

**The response is not expressible.** `velocity[axis] = 0` is perfectly
inelastic, hard-coded, and the only thing a collision can mean. Bouncing,
friction, one-way platforms and inertia have nowhere to live, and Gravity works
around the whole arrangement by re-deriving landing in a step of its own,
ordered after `resolve`.

## The split

- **`Collisions`** — detection. Works out which actors overlap which, and says
  so. Pushes nothing, changes no velocity. Noticing a collision is what this
  rule is FOR, so it is what the name says.
- **`Solid Bodies`** — the default response. Requires Collisions; applies the
  push-out and stops the velocity. Today's behaviour, in a file that can be
  opened, replaced, or left out. It does not notice collisions; it decides what
  a solid body does about one.

Gravity then reads contacts instead of re-deriving landing, and a project that
wants bouncing writes a rule beside `Solid Bodies` rather than inside it.

The names went the other way round at first — the detector was `Contacts` and
the responder kept `Collisions` — which read as one rule cut in half rather than
as two rules with different jobs.

## The storage decision

Between the two steps, something has to hold, per actor, the actors it is
touching this tick. That is per-actor, relational, and per-frame, and the
language had nowhere to put it. Three candidates:

**A rule-scoped variable** — a `let` at the top of the generated rule module.
Now that an actor value may hold several (specs/ACTOR_LISTS.md) this can hold a
list, but only ONE list: contacts are per actor, and expressing pairs as two
parallel flat lists is worse than the problem it solves.

**An engine-owned buffer**, as the keyboard has one. It would work, and the
precedent is real — but the precedent does not fit. `for each newly pressed key`
is in the engine because a rule CANNOT work out which keys changed. A rule can
work out its contacts; it computed them. What it lacks is somewhere to put
them, and the engine gaining a `contacts` noun that only one rule uses is a
mechanism where a place would do.

**A property whose value is actors.** ← this one.

`contacts of ⟨body⟩` is then an ordinary property read, and what it reports is
an actor value — so it plugs straight into `for each ⟨other⟩ in ⟨…⟩`,
`⟨x⟩ is in ⟨…⟩`, and `how many actors in ⟨…⟩`, which exist. Detection writes it
with `set`, one actor at a time into a local and then `set contacts of ⟨body⟩`,
using only blocks that are already there. Nothing new is invented: "somewhere to
put per-actor state" is what a property IS, and the rule that owns it declares
it, as rules declare their own state now.

It is declared READ-ONLY, which in this language means the declaring rule writes
it and everyone else reads — exactly the relationship `Contacts` wants with its
responders.

### What it costs

`PropertyType` gains a kind whose value is actors. Two consequences, one of them
the reason this was not already possible:

- **The hot-reload snapshot must skip it.** `World.snapshot()` puts every
  property's value into the baseline and the reconciler compares by
  `JSON.stringify`; an Actor holds `actor.world` and the world holds its actors,
  so stringifying one throws. Skipping is not a workaround but the correct
  reading: a per-tick contact set is scratch, not state a reload should carry.
  The rule is "a property whose value is actors is never snapshotted", stated on
  the property type rather than on collision.
- **The editor gains a property kind**: the `define property` dropdown, a socket
  and shadow for it in `typedValueInputs`, and the `get`/`set` blocks that
  follow from those.

Two things it does NOT cost. Nothing has to clear the set — detection writes
each actor's contacts every tick, and a write replaces. And a removed actor left
in someone's stale list survives at most one tick, so `removeActor` has nothing
to scrub.

## What detection looks like

Entirely in blocks that exist once the property kind does:

```
for each actor ⟨body⟩ in ⟨all actors⟩ where ⟨body has trait Can Collide⟩
  empty ⟨found⟩
  for each actor ⟨other⟩ in ⟨all actors⟩ where ⟨other has trait Can Collide⟩
    if ⟨body is touching other⟩ and not ⟨body is other⟩
      add ⟨other⟩ to ⟨found⟩
  set contacts of ⟨body⟩ to ⟨found⟩
```

`is touching` is the query collision already declares. What detection reports is
WHO; how far in is worked out by whoever responds, from positions and sizes,
with `collision size of` — which is also already there. That keeps one n² pass
in one place and leaves each responder walking a short list.

## What response looks like

`Solid Bodies` walks each movable actor's contacts and pushes out — and this is
where the jump-stick is fixed, because the axis decision moves with it:

resolve X against every contact using the previous Y, then resolve Y at the
corrected X. Rising along a wall, the X pass pushes the actor clear and zeroes
`vx`; the Y pass finds no overlap left, so `vy` survives and the actor slides up
the face. Seams stop snagging for the same reason: the Y pass pushes up out of
both floor tiles equally and the X pass finds nothing to do.

Bouncing and friction then become properties of `Solid Bodies` rather than new
mechanisms — `bounciness` scaling and reflecting the normal component,
`friction` scaling the tangential one, both defaulting to today's behaviour.

## Plan

1. **The property kind.** ✅ `'actors'` on `PropertyType`, offered by
   `define property`, set through an Actor socket (empty = none) and reported as
   an Actor value, so what it holds plugs into a loop's source, `is in`, and
   `how many actors in`.

   Three things the store had to be taught, none of them true of the other
   kinds: the value is always a LIST (so `set contacts to ⟨that actor⟩` is a
   list of one), always the actor's OWN (a declaration's default is one value
   and every actor is seeded from it — sharing it would make one actor's
   contacts every actor's), and never in the hot-reload baseline (an actor holds
   the world, so stringifying one throws, and a set worked out this tick is
   scratch). It is also kept out of the map editor's property panel: there is no
   field that would edit one.

2. **`Contacts`.** ✅ Everything that MEASURES moved: the `Can Collide` trait
   and its `size`, `collision size of`, and `is touching`. It declares
   `contacts` (read-only, actors) and a `find` step, ordered after Motion, that
   writes each actor's. `Collisions` requires it, references its trait, and
   anchors `resolve` on `find` — so the per-tick chain is velocity → move →
   find → push → land, ordered rather than merely hoped for.

   It turned up a latent bug in module generation, which the split was the
   first thing to trigger: a rule's module is written by two hands — the
   declarations, and the bodies the Blockly generator produced — and both
   emit imports keyed the same way without seeing each other. A member used in
   a declaration AND in a body was imported twice, which esbuild refuses
   ("The symbol X has already been declared"). The bodies' keys are passed to
   `ruleMetaToModule` now.

3. **The response, one axis at a time.** ✅ `resolve` walks each mover's
   CONTACTS twice — sideways, then up or down — and the single
   axis-choosing `push out of over` is two actions, one per axis. Which axis a
   pass resolves is the caller's business now; what each pass decides is only
   whether the body was already overlapping the OTHER way, which is what tells
   a wall from a floor.

   The asymmetry between the two passes is the whole thing, and getting it
   wrong the first time cost a wall-jump: sideways looks at where the body WAS
   vertically (its vertical position has not been corrected yet), and up-or-down
   looks at where it IS horizontally (the sideways pass has already corrected
   that). Testing the previous x in the second pass makes a wall push the body
   vertically and cancel its jump — which is the old bug wearing a new hat.

   ✅ And the names: the detector is `Collisions` (`rules/collisions.rule`) and
   the responder is `Solid Bodies` (`rules/solid.rule`). A swap, so it went
   through placeholders — renaming the detector first would have caught what the
   second rename was for.

4. **Gravity reads contacts** ✅ — and this was the test of whether the
   boundary was drawn in the right place, so it is worth saying how small it
   turned out to be: one socket. `land on ground?` walked every actor in the
   world looking for grounds, once per falling actor; its loop now takes
   `contacts of ⟨faller⟩` as its source and keeps the same body, which asks
   gravity's own question — is this ground under me, am I moving toward it, was
   I above it last frame.

   Nothing else had to change. Both of gravity's traits already require
   `Can Collide`, so every ground a faller could land on is in its contacts; and
   a jump-through platform, which is ground without being solid, is in there too
   — Collisions records every overlap, not only the ones something pushes on.

5. **`bounciness` and `friction`** ✅ — on `Solid`, the rule's own trait, so
   every solid has them and neither push action needs an "if it has trait"
   guard. What goes INTO the surface is turned around by bounciness; what runs
   ALONG it is slowed by friction; 0 and 0 are the dead stop the rule did
   before there were numbers for it.

   On the SOLID rather than on the body that hits it, which is the sentence a
   learner means — the trampoline is bouncy, the ice is slippery. Real physics
   combines both surfaces; if that turns out to matter, the fix is to multiply
   the two rather than to move the property.

   Why this is a parameter and not another rule: two responders reading the same
   contacts do not compose. Solid Bodies zeroes the velocity on the axis it
   resolves, so a separate bouncy rule either runs after it — and finds the
   velocity it needed already gone — or runs before it and has its work undone.
   Last writer wins, silently. A DIFFERENT physics model (mass, impulses,
   rotation) is the other path, and it replaces Solid Bodies rather than sitting
   beside it, which is exactly what splitting detection out made possible.
