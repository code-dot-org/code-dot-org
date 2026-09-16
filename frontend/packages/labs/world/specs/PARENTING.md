# Parenting: one actor carried by another — PROPOSED

Nothing in this document is built. It records a design discussion and the
implementation it settled on, so that the build is a decision already made
rather than one made again at the keyboard.

## The problem

A game hangs things off other things: a health bar over an enemy, a name over
a villager, a hat on a head, a turret on a tank, the buttons in a dialog. The
lab answers this today with the Attachment rule (`rules/attachment`): a rider
elects `Attached`, names the actor it rides and an `offset`, and a step in
`react` writes `position = subject + offset` every frame.

That is wrong in exactly the case the interface toolkit needs. A dialog is a
Panel with a title, a field and two buttons arranged on it in the map editor,
and the map already says where each child sits relative to the panel. With
Attachment the child's authored position is thrown away on the first frame and
`offset` becomes the only coordinate that matters — a second position, typed
into a different field, that the editor cannot show in place. The same is
true, less visibly, of every rider today: "set offset to x 0 y −24" is a
sentence a learner has to be taught (the villager lesson teaches it) where
"put the name over her head" would have been the thing they already did.

Two other things are wrong with a position that is overwritten each frame.
Steps in one moment are unordered, so a rider on a rider reads its subject a
frame late on some frames and not others. And a rider cannot be nudged: `set
position` on it is undone before anybody sees it.

## The claim

**Parenting is a property of every actor, and a child's position is relative
to its parent.** Not a rule to elect: any actor may have a parent, the way any
actor has a position. What a child stores is where it is IN ITS PARENT'S
FRAME; where it is in the world is worked out from that, on demand, through
the chain of parents. Move the parent and every child moves, because nothing
about the children changed. Turn the parent and every child turns with it.

The one decision that makes this safe for everything already written:

**`position` keeps meaning the world position.** Every rule, block, collision,
camera and hit test in the lab reads `position` and means "where in the
world". If parenting changed what the word meant for a child, every rule that
compares two actors' positions — chasing, steering, closest, confined — would
be wrong the moment one of them had a parent. So `position` on a child is
DERIVED: read, it is the parent's transform applied to the child's local one;
set, it is converted back into the parent's frame and stored there. An actor
with no parent is exactly what it is today.

## The construct

Four properties on the Space rule's positional trait, which every actor has:

| property         | type   | meaning                                        |
| ---------------- | ------ | ---------------------------------------------- |
| `parent`         | actor  | the actor this one is carried by, or nobody    |
| `local position` | point  | where this actor is in its parent's frame      |
| `local rotation` | number | how far it is turned from its parent's heading |
| `local scale`    | vector | how it is scaled beside its parent's scale     |

…and the three the engine already has — `position`, `rotation`, `scale` —
become the WORLD ones, derived for a child and stored for a root. A root's
local and world values are the same values, so nothing is duplicated for the
actor that has no parent, which is nearly every actor in every game.

`skew` is not inherited. A shear does not compose the way a turn and a
stretch do, and no case has asked for a sheared panel to shear its buttons.
It stays the actor's own, applied last, as it is today.

### The arithmetic

World from local, for a child `c` of a parent `p` whose world transform is
already known:

    position(c) = position(p) + rotate(rotation(p), scale(p) ⊙ local position(c))
    rotation(c) = rotation(p) + local rotation(c)
    scale(c)    = scale(p) ⊙ local scale(c)

`⊙` is component-wise. A child at local `(0, −24)` on a parent turned a
quarter turn is a bar standing off the parent's side, which is what "rotating
the parent rotates the children" means and what a turret on a tank wants.

Local from world, when something sets a child's world position:

    local position(c) = unscale(scale(p), rotate(−rotation(p), position − position(p)))

…and the two others by subtraction and division. Setting the parent keeps
the child's world position: `set parent` computes the local transform from
where the child already is, so nothing jumps.

### Where the derivation lives

Every property read goes through one method on the actor (`Actor.get`), and
properties already carry set-time watchers (`Property.watch`). Position,
rotation and scale on an actor whose `parent` is set are intercepted there:
a read composes up the chain; a write converts and stores locally. Nothing
else in the engine learns about parents — the Phaser driver goes on receiving
world transforms from `renderSnapshot`, collisions go on reading `position`,
the camera goes on following it.

ON READ, not once per frame. Deriving a child's world position when it is
asked for means it is right in every moment, whatever moved the parent and
whenever, with no ordering between the parent's step and the child's. A
per-frame propagation pass was the alternative and is the one that lags:
Carry's platforms accept being a frame late for a reason that does not apply
here, and the displacement design this replaced would have had the same
frame-late chain. The cost is a walk up the chain per read, and chains are
two or three deep.

A cycle — an actor parented to its own descendant — is refused at `set
parent`, which does nothing and warns. There is no picture of a cycle.

### What follows the parent besides position

**Removal.** Removing a parent removes its children, at the same moment and
by the same path (`World.detach`). A bar over an enemy goes with the enemy.
The health enhancement's "when removed, remove the bar" handler becomes
unnecessary and is dropped.

**The layer.** A child is drawn on its parent's layer, whatever layer it was
placed in. A panel fixed to the screen brings its buttons with it, and a bar
parented to an enemy in the game layer is in the game layer. Set at `set
parent`, so `inLayer` and the driver need no second answer.

**Nothing else.** A child does not inherit its parent's rules, traits,
visibility or opacity. Those are the actor's own, and a rule that wants a
child to fade with its parent is a rule somebody can write.

### Physics on a child

Velocity integrates the world position and the write converts to local, so a
child with `Can Move` moves in its parent's frame, and a solid pushing a child
apart moves it off its parent. That is how every scene-graph engine behaves
and it is right for interface actors, which have neither. A child that should
fall with a moving floor under it is the Carry rule's case and stays there:
Carry is contact, not ownership, and a rider on a platform is not the
platform's child.

## The blocks

In the Space category, beside `set position`:

    set parent of ⟨actor⟩ to ⟨actor⟩        keeps the world position
    set parent of ⟨actor⟩ to ⟨nobody⟩       unparents, keeping the world position
    parent of ⟨actor⟩                        an actor, or nobody
    children of ⟨actor⟩                      an actor list, in placement order

    local position of ⟨actor⟩                and its setter
    local rotation of ⟨actor⟩                and its setter
    local scale of ⟨actor⟩                   and its setter

`children of` is a list because a panel has several, and the list blocks
already say everything a project wants to say about several actors
(specs/ACTOR_LISTS.md): `for each ⟨child⟩ in children of ⟨panel⟩`, `count
of`, `where`. It is answered by the world — the actors whose `parent` is this
one — rather than stored twice.

The `position`, `rotation` and `scale` getters and setters are unchanged and
unrenamed. A learner who has never parented anything sees nothing new in
them.

## The map

A placement gains a `parent`, which is an actor-typed override on
`positional` like any other reference the map holds (specs/MAPS.md,
"An actor-typed property: a placement naming another"), and its position is
stored LOCAL when it has one:

    {type: 'actors/button', id: 'OK',
     properties: {positional: {parent: 'Dialog', position: {x: 60, y: 30}}}}

`position` in the file is the local position when `parent` is set and the
world position when it is not, which is the same rule the engine keeps and
means a map with no parents in it is byte-identical to today's. `loadMap`
already resolves actor references in a second pass once every entry exists;
a parent is one more, set with the world position preserved — which for a
placement means the stored local one is applied after the parent is known.

Every fixture that places actors stays valid: none has a parent.

## The map editor

This is what the concept is FOR, from the editor's side, and what the
Attachment rule could never give it.

- **A group moves as one.** The stage draws a child at its parent's transform
  applied to its local one, and dragging a parent drags its children, because
  the children's stored values did not change. Nothing new is written for
  this; it falls out of drawing through the parent.
- **A child is edited in place.** Selecting a child moves it in world
  coordinates on the canvas and stores the local ones; the inspector shows
  both, local editable and world read-only, so "60 across the panel" and
  "220 on the screen" are both visible.
- **Dropping onto a panel parents.** Dropping a placement onto one that can
  hold others — a Panel, or any actor the project says so of — sets its
  parent. Which actors can hold others is a question for the Panel's design;
  the mechanism does not care.
- **The line the stage already draws** for a reference points from a child to
  its parent, and the outline of a selected parent can take in its children.
- **The interface layer is a tree.** A dialog map is a Panel and its
  children; loading it on top of a level and removing the Panel removes the
  dialog. That is the "stock interface maps" case in UI_ACTORS.md, and the
  first place grouping is tried on something real.

## What it replaces

**The Attachment rule retires.** Its whole job — "follow this actor, sitting
here relative to it" — is `set parent` with the child placed where it should
sit. The rule's own header lists what it was for: a health bar, a name tag, a
shield, a shadow; each is a child now, and the turret it deliberately did not
answer is answered, since a child turns with its parent.

Two things use it, and each changes by one row:

- **The health enhancement** (`actors/enhance/health`) relies on the rule's
  default offset of `(0, −24)`. Its `when created` handler sets the bar's
  position to the target's, 24 above, and then `set parent of ⟨bar⟩ to ⟨this
actor⟩`. The `when removed` handler goes, since removal cascades. The stock
  Health Bar stops electing `Attached`, and its comment about "one intention
  each" — `subject` for whose health, `attached to` for where — stays true
  with `parent` in the second place.
- **The villager lesson** ("Somebody who is there") says "set offset to x 0,
  y −24". It says "put the Label over her head, then set its parent to her",
  which is the shorter lesson and the truer one: a name over somebody is
  where you put it, and the relationship is what keeps it there. Its check
  changes to match.

Camera Follow stays. A camera is not an actor and parenting is between actors;
the two rules were the same sentence about different subjects and now only
one of them is a rule.

## Decisions

**A property, not a rule.** Attachment was a rule because rules are how the
lab adds mechanics, and it was the right first answer. What made it the wrong
final one is that a position relative to something is not a mechanic — it is
part of what a position IS, and every actor should be able to have one
without electing anything. The map editor is the proof: a group is a fact
about the map, and a map cannot elect a trait.

**World position stays `position`.** Stated under "The claim" and worth
repeating as the decision, because the obvious design — "position is always
relative to the parent" — is the one that breaks every rule already written.
Local is the new word; world keeps the old one.

**Derived on read, stored locally.** The alternative, storing world and
propagating deltas, is what the displacement design did and what Carry does,
and it lags a frame per level of the chain. On-read derivation has no
ordering to get wrong. The chain is short and the read is arithmetic.

**Rotation and scale are inherited; skew is not.** A parent that turns turns
its children — a turret, a hand on a clock, a dialog that tilts as it slides
in — and one that grows grows them. Shear does not compose sensibly and
nothing has asked for it.

**Set parent keeps the world position.** The other convention — keep the
local values and let the child jump to wherever that lands it — is never what
somebody dragging a button onto a panel meant. If a project wants a child
snapped to a particular local place, it sets `local position` after.

**Removal cascades; nothing else does.** A parent's children are part of
what it is, so they go with it. Its rules, opacity and visibility are not, and
a child fading with its parent is one `each frame` row a project can write.

**Physics acts in the parent's frame.** Not pinned: a child that can move,
moves, and one that is pushed is pushed. Pinning would need a second kind of
child, and interface actors — the ones parented today — have no physics.

## Costs, and what is deliberately not solved

- **The read is a walk.** Three levels deep at most in anything imagined, and
  the walk is three vector operations per level. If a profile ever shows it,
  a per-frame cache invalidated by the watchers is the answer, and it is not
  built in advance.
- **A child under a solid parent** is not part of the parent's collision
  shape. A Panel is one box and its buttons are their own boxes; a tank and
  its turret collide as two things. Compound shapes are a collision question
  and are not answered here.
- **Physics on a child of a moving parent** is not special-cased. A jumper on
  a platform is Carry's, not this.
- **A map cannot say a child belongs to a placement in another map.** Parents
  are resolved within the map being loaded, as every reference is.
- **The editor's drop-to-parent** needs a way to say which kinds accept
  children. That is the Panel's design (UI_ACTORS.md, "The rest of the
  toolkit") and is left to it.

## What to check when it is built

- A root actor reads and writes position, rotation and scale exactly as
  before, and the fixtures' play tests pass unchanged.
- A child's `position` is the parent's transform applied to its local one,
  for a parent that is moved, turned and scaled, and for a chain of three.
- Setting a child's `position` leaves it where it was set, in the world, on
  the next read and after the parent moves.
- `set parent` does not move the child; `set parent` to nobody does not move
  it either. A cycle is refused with a warning.
- A child follows its parent in the same tick, whichever moment moved the
  parent — including a parent moved in `react` by something else.
- Removing a parent removes its children, mid-tick and between ticks.
- A child placed in the game layer and parented to an actor on the fixed
  layer is drawn on the fixed layer.
- A map placement with a parent loads at parent-plus-local; one without
  loads as it always did; a map file with no parents is unchanged bytes.
- The map editor draws a child at its parent's transform, drags the group
  with the parent, and stores the local position when the child is dragged.
- The health enhancement's bar rides its target and goes with it; the
  villager's name follows her with `parent` and no offset.

## Plan

1. **The engine.** The four properties on the positional trait; the
   intercepted read and write on `Actor.get` and `Actor.set` for a parented
   actor, with the composition above; cycle refusal; removal cascade; the
   layer following the parent. Tests for the arithmetic and each check above.
2. **The blocks.** `set parent`, `parent of`, `children of`, and the three
   local getters and setters, in the Space category. The palette guard covers
   them.
3. **The map.** `parent` as a positional override; `loadMap` resolving it in
   the reference pass with the stored local position applied after. The
   editor draws through the parent, drags groups, edits local in the
   inspector and shows world beside it.
4. **Retire Attachment.** The health enhancement's rows and the villager
   lesson's steps and check; the stock Health Bar's trait; the rule file and
   its generator script removed; the enhancement and lesson tests updated.
5. **Panel**, as a Label with no words that accepts children in the editor,
   and a dialog in the Interface Kit's map to try the group on.
