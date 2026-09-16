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

## Events

Reparenting is something a project has to be able to hear: a dialog that
lays its buttons out when they arrive, a turret that arms when it is fitted,
a bar that resets when it is moved to another enemy. Four events, on the
positional trait beside `is created` and `is removed`, which is where the
events every actor gets for nothing already live (`rules/spatial`):

| event                      | on the | value             |
| -------------------------- | ------ | ----------------- |
| `⟨actor⟩ gets a parent`    | child  | the new parent    |
| `⟨actor⟩ loses its parent` | child  | the parent it had |
| `⟨actor⟩ gains a child`    | parent | the child         |
| `⟨actor⟩ loses a child`    | parent | the child         |

The value rides on the event as every event's value does (`the event value`,
`World.emit(event, actor, detail)`), so a handler on the parent knows which
child arrived without searching `children of` for it.

**One `set parent` raises up to four, in this order:** the old parent loses
a child; the child loses its parent; the child gets a parent; the new parent
gains a child. Setting the parent it already has raises nothing. Setting it
to nobody raises the first two. They are raised in the moment the block ran,
as `is created` is, and a handler reads the child's world position as
unchanged and its local one as already recomputed.

**A cascade is a removal, not an orphaning.** When a parent is removed its
children are removed with it and hear `is removed`; nobody hears `loses a
child` or `loses its parent`, because there is no actor left to have lost
anything. A parent removed mid-tick takes its children out at the end of the
tick, as `removeActor` already defers.

**A map raises them too.** `loadMap` resolves a placement's `parent` in the
pass that resolves every actor reference, after each entry exists and has
heard `is created`; each parented placement then gets its parent, and each
parent gains its children, in placement order. So `when ⟨Dialog⟩ gains a
child` fires once per button as a dialog map loads, which is what lets a
dialog lay itself out from a map rather than from a handler that knows its
buttons by name.

`children of` is answered by the world and never stored, so there is no
"children changed" event beyond these four.

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

## The driver, and Phaser's scene tree

Phaser has this model already: a `Container` carries a transform, and every
child's transform is composed onto it, parent first, in the order translate,
rotate, scale (`Phaser.GameObjects.Components.TransformMatrix`, which the
renderer multiplies down the tree). The arithmetic under "The construct" is
that composition, and it is written that way on purpose — in degrees rather
than radians, about the actor's centre rather than an origin fraction, and
with shear left out — so that a transform the engine derives, one the map
editor draws, and one Phaser would compute if it nested the objects all agree
to the pixel. Nothing here is a second opinion about what a scene tree is.

**But the driver does not nest.** Today it keeps one Container per LAYER, in
stack order, and one Image per actor inside it, and it applies the world
transform `renderSnapshot` hands it: position, scale, rotation, then a shear
matrix about the drawn centre (`PhaserBinding`, `applySkew`). That stays.
A parent does not become a Container holding its children, for three
reasons, each of which is a decision made above:

- **The engine owns world transforms anyway.** Collisions, the camera, hit
  tests and the map editor all need them, so the engine derives them
  (`Actor.get`), and the driver would be re-deriving what it was handed.
- **Nothing but the transform is inherited.** A Phaser Container's alpha,
  visibility and post-effects apply to the whole subtree, and this document
  says a child does not fade, hide or tint with its parent. Flat images keep
  effects per actor, which is how `AppliedEffectSpec` attaches them now.
- **The layer is the parent's, not the parent.** A child moves to its
  parent's layer container at `set parent`; inside a nested Container it
  would have had no layer of its own to move between.

What the driver does take from the tree is DRAW ORDER. Within a layer,
actors draw in a pre-order walk — a parent, then its children in placement
order, then the next root — so a child is always over its parent and a
dialog's buttons are over its panel. The driver already sorts a layer's
children by depth on demand rather than every frame; the walk is what the
depths are assigned from.

**One matrix, three users.** The composition and its inverse are written
once, as a small affine transform in the engine core (`Transform2D`: the
six numbers Phaser's `TransformMatrix` holds, with translate, rotate, scale,
multiply, invert and apply-to-point), and used by:

- the engine, deriving a child's world transform and converting a written
  world position back to local;
- the map editor's stage, which today unrolls translate → shear → rotate →
  scale by hand in `stageGeometry.toLocalFrame` and `transformOf`, and
  composes through the parent instead;
- the driver's `applySkew`, whose shear-about-the-centre is the same matrix
  with the shear term set.

Three hand-written copies of the same arithmetic are three places for a sign
to differ; the editor's hit test and the game's click box disagreeing by a
rotation is the bug this prevents.

## What existing tooling touches, and what it does not

**Engine.** `Actor.get` and `Actor.set` intercept the three world properties
for a parented actor; `World.detach` cascades; `loadMap` gains one reference
in its second pass; `renderSnapshot`, `sizeOf`, `scaleOf` and every rule are
unchanged, since they read world values as they do now. `intrinsic size` is
the actor's own and is not scaled by a parent in the property — the world
scale is what scales the drawn box, as it does today.

**Hot reload.** `reconcile` treats any actor value change as a restart, and
a parent is an actor value, so a map edit that reparents restarts the game
exactly as a map edit that moves an actor does. Nothing new to reconcile.

**Blocks.** Seven blocks and four event hats in the Space category
(`domainBlocks`), the event value block already existing. The palette guard
covers the types; `ROOT_HOMES` is untouched, since none is a root.

**The map document.** `mapModel.transformOf` composes through the parent —
it needs the document's placements by id, which `linksFrom` already looks up
— and `positionOf` answers the stored (local) position. `placementKey`
already excludes everything under `positional`, so a reparent or a drag
re-renders no picture: a placement's picture is its own, and a Panel's
picture is not its children's.

**The stage.** Draws each placement at its composed world transform; drags
a root by writing its position and a child by writing its local one, through
the inverse; `hitTest` goes through the composed transform, which is the
same function the drawing uses. The inspector shows `local position`
editable and `position` read-only beside it for a child, and `parent` as
the actor reference it already knows how to edit. Dropping onto a
placement that accepts children sets `parent`, keeping the world position,
which for a placement means computing the local one at drop.

**Local pictures and the sandbox thumbnails** draw one actor alone, and
still do. A child's picture is its own drawing at its own size; where it
sits is the stage's business.

**The drawing reader** reads nothing spatial and is untouched.

**The tutor's measurements** (`aiTutor/measurements`) describe positions as
world positions, which remains true; a sentence about `local position` is
worth adding when the blocks exist.

**Attachment** retires as described under "What it replaces": the rule file,
its generator script, the `Attached` trait on the stock Health Bar, the
enhancement's rows, the lesson's steps and check, and the enhancement and
lesson tests.

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

**Phaser's composition, not Phaser's Containers.** The arithmetic is the
scene tree's, so the engine, the editor and the renderer agree; the driver
stays flat because the engine must own world transforms regardless, because
a Container inherits more than the transform, and because a child's layer is
its parent's. Nesting would buy the driver nothing it is not handed.

**Reparenting is heard, as creation is.** Four events with the other actor
as the value, raised in the moment the block ran, and by `loadMap` after its
reference pass. A cascade is a removal and says so.

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
- `set parent` raises the four events in the stated order with the right
  values; setting the same parent raises none; a cascade raises `is removed`
  on each child and no parent events; a loaded map raises `gains a child` on
  a Dialog once per button, after every entry's `is created`.
- Within a layer a child is drawn over its parent, and over a sibling root
  placed before the parent; the engine's world transform for a turned,
  scaled parent's child matches what a Phaser Container would draw, checked
  by composing the same matrices.
- `Transform2D`'s inverse undoes its composition for a rotated, scaled,
  translated case, and the stage's hit test and the driver's shear are both
  written over it.

## Plan

1. **The engine.** `Transform2D` in the core; the four properties on the
   positional trait; the intercepted read and write on `Actor.get` and
   `Actor.set` for a parented actor, with the composition above; cycle
   refusal; removal cascade; the layer following the parent; the four events
   and their order. The driver assigns depth from the pre-order walk. Tests
   for the arithmetic and each check above.
2. **The blocks.** `set parent`, `parent of`, `children of`, and the three
   local getters and setters, in the Space category. The palette guard covers
   them.
3. **The map.** `parent` as a positional override; `loadMap` resolving it in
   the reference pass with the stored local position applied after, and
   raising the events. The editor's `transformOf`, `toLocalFrame` and
   `hitTest` move onto `Transform2D` and compose through the parent; it
   drags groups, edits local in the inspector and shows world beside it,
   and parents on drop.
4. **Retire Attachment.** The health enhancement's rows and the villager
   lesson's steps and check; the stock Health Bar's trait; the rule file and
   its generator script removed; the enhancement and lesson tests updated.
5. **Panel**, as a Label with no words that accepts children in the editor,
   and a dialog in the Interface Kit's map to try the group on.
