# Plan: Viewport

The viewport of the World, by default, needs to be sensible for beginners.
Therefore, the viewport should default to the size of the map. And the basic
map size is something small, similar to original Sprite Lab, of around 10x10
tiles. This sets the viewport to be a square and to be showing all 10x10 of
those tiles.

To grow literally out of this box, the map can be resized. Maps should be able
to contain more or less any reasonable dimension of tiles and within that any
amount of actors. When the map is larger, the viewport stays the same. There
are two possible strategies for dealing with a map that is not the same size as
the viewport:

1. Render only the original dimensions of the map within the viewport.
2. Scale the map size such that it is contained within the viewport.

For the first option, the parts of the map that overflow the viewport are
simply not visible. For the second option, the entire map is always scaled to
fit within the default viewport, though the size of the tiles might be shrunk
down such that the map fits. The units, in either case, remain the same. The
viewport camera itself is what is effectively scaling. So, jumping, positioning,
etc, are all the same behavior regardless of how large actors are on the screen.

We will do the second option. It is the least surprising and the most applicable
to beginners since we will likely hide layers, cameras, and other tricks that
allow for more content than fits on the screen. They will gain access to those
extra primitives and engine capabilities over time. So, the default will be an
ever constrained map as the map gets larger. The screen and viewport remain the
small square until they gain the ability to change its shape.

### The fit rule

Fitting is a uniform scale, centered. When the aspect ratio of what is being fit
differs from the viewport's, bars appear on the two short sides. It is never a
stretch and never a crop, so a circle is a circle and nothing is ever cut off.

This is one rule and it applies to every layer, including the interface layer.
There is no separate screen-space coordinate system anywhere: a HUD is a map in
a layer, fit to the viewport by that layer's default camera like any other. A
HUD map with the viewport's own dimensions gets a 1:1 scale and a camera that
never moves, which is screen space, arrived at by the general rule rather than
beside it. A HUD map of some other aspect ratio gets bars, which is the fit rule
telling the author their map is the wrong shape.

Two things follow, both for later:

- The map editor should offer to resize a map to the viewport, so conforming is
  one click rather than arithmetic.
- There may eventually be a distinct interface-editing mode in the map editor,
  presenting the map as the screen it will become. That is a VIEW, not a format:
  a HUD map is an ordinary map, and what makes it a HUD is the layer it is
  loaded into. Nothing about the editing mode belongs in the file.

The fit does NOT snap to integer scale factors, and this is a decision rather
than an oversight. Against a 320px viewport very few map sizes scale exactly —
5 tiles (2x), 10 (1x), 20 (1/2), 40 (1/4) — and snapping the rest down to the
nearest exact factor wastes most of the surface: a 13-tile map would drop from
0.77 to 0.5 and use 208 of 320 pixels to avoid an artifact most authors would
not have noticed.

Crispness is a real concern and it is not the fit's to solve. It is a FILTERING
and DISPLAY-SCALE question, decided with the other renderer options when the
viewport gains settable size (see below). What belongs here instead is feedback:
the map editor's width and height controls should report the resulting scale, so
an author resizing can see when they have left an exact one. That is the same
one line of UI as the legibility readout and now has two reasons to exist.

Note where the residue actually lives. A beginner is pinned to 10x10 and exact;
an advanced creator scrolls a camera at 1:1 and is exact. Only the band between
— resized maps, no camera yet — is fractional, and that band shrinks as the
progression continues rather than growing.

### Beginners

Scale-to-fit degrades — a 40x40 map draws every actor at a sixteenth of the size
— and a beginner has no camera with which to fix it. This is handled by not
giving them the rope: the map editor's width and height controls are hidden for
beginners, or the map editor is hidden entirely, which pins them to the 10x10
default. The same lever the toolbox already uses for categories (`levelData`,
`toolboxFilter`).

## Cameras

The next strategy for dealing with large maps is to introduce an optional Camera
object. The Camera can define what part of the map is visible within the
viewport and how it is scaled, rotated, etc. Effects can also be applied on the
Camera like any other object. When effects are applied, the effect is applied on
the rendered content the Camera is capturing as it is displayed on the screen.

### Effects on a Camera

Precisely:

> An effect on a Camera applies to every Viewport rendering through that Camera.

The definition is needed because a Camera is a POSE and a pose has no pixels of
its own — the drawing exists only where a Camera is applied to a surface. Saying
which viewports are affected is therefore the whole content of the rule, and it
makes the lens metaphor exact: a filter is on the lens, and every screen showing
that lens's output sees it. Pointing a viewport at a different Camera swaps its
effects along with its view, which is the intuitive reading of "show me the
security camera".

An effect on the WORLD remains an effect on the whole screen. The two coincide
today, and only because there is one viewport — a fact worth stating so that
neither is later folded into the other on the grounds that they look identical.
They separate as soon as there are two: a global flash is the world's, and
blurring one half of a split screen because that player was poisoned is that
half's Camera.

That leaves room for a third scope nobody needs yet — an effect on a VIEWPORT
alone, applying to that one region even when it shares a Camera with another.
It is a coherent thing to want (a scanlined monitor, a bordered picture-in-
picture) and it is additive whenever it is wanted. It is not part of this plan.

Cameras will have convenience methods in order to move them and oriented them
relative to other Actors. For one, the Camera can be set to 'follow' an Actor.
When that actor moves, the Camera moves to center that Actor in the view while
confined by the map. So, if the Actor moves to the left-most part of the map,
the Camera will orient itself such that it renders the left part of the map and
is locked at that edge until the Actor moves sufficiently to the right.

More interesting patterns are possible by taking further control over the
Camera. You can allow the player to "look" up or down by handling key events
and nudging the position of the camera slightly above or below the player.

You can potentially allow smoother flow by animating the movement of the Camera
so that it gradially centers on the player. If the player moves very quickly,
the camera will allow the Actor to drift to the left or right of the viewport
until they stop and it will center again. This can make the player seem faster
and the action seem more dynamic than a Camera that forcibly locks itself to
always render the Actor at the center of the screen.

Thus, Cameras are effectively also Actors that do not render in the World. They
instead use their positioning to guide which part of the map the viewport is
rendering and how. You would add traits to Cameras in order to tell them how to
follow a player or how to react. A useful trait is 'follows the player' which
ensures that the position of the Camera is exactly centered on the player.

### What a Camera is, exactly

A Camera is the actor FOUNDATION MINUS APPEARANCE. Every actor has a position
and an appearance without electing either (`ActorBuilder`'s foundation); a
Camera has the position and not the appearance. That single sentence decides
most of the rest: the positional blocks work on it because position is
foundational, and nothing that draws it does, because it is never drawn.

Cameras live in their own collection — `world.cameras`, not `world.actors`.
They therefore do not appear in `all actors`, in `for each actor`, in `how many
actors in`, or in any other filter or loop over actors. A Camera is not a body
in the simulation and rules must not have to learn to skip one. This is the same
line `BACKGROUNDS.md` §1 draws for backdrops, drawn again for the same reason.

But a Camera's VALUE is typed `Actor`, so it fits anywhere an actor value fits.
This is deliberate and is not in tension with the above: the collection is about
what the simulation iterates, and the type is about what an author may write.
Every actor-scoped rule member — `move to`, `rotate`, the positional family, the
effect blocks — should work on a Camera, and a separate `Camera` type would
force every one of those generated sockets to widen to accept it, which is the
same outcome by a longer road. The language keeps one actor type for the reason
`actorValue.ts` gives: a second one is a wall of sockets rejecting each other for
reasons a learner has to learn before building anything.

Three consequences to implement:

- **Removal dispatches.** `remove actor <camera>` must work — removing a Camera
  is meaningful, especially once a Viewport can be pointed at one of several.
  `World.removeActor` searches the actor list today; it has to search both
  collections. The mid-tick deferral applies to Cameras too, since a handler is
  exactly where "switch cameras, drop the old one" is written.
- **Appearance blocks on a Camera need a defined answer.** `set sprite of
<camera>` will type-check. Either a Camera carries the appearance foundation
  and is simply never drawn, or the block warns on a Camera the way
  `remove effect` warns under `define actor` (`runtimeActorExtension`). Silently
  storing a sprite nobody reads is the option to avoid.
- **`clear world` leaves the Cameras.** It calls `clearActors()`, and Cameras
  are not in the actor list — so clearing a level leaves the camera pointed
  where it was. That is the wanted behavior, and now it is for a reason.

One known and accepted gap: because a Camera's value is typed `Actor`, it can be
pushed into an actor variable and thereby reach `for each actor`. The
consequences are mild — positional blocks work, appearance blocks are the no-op
above — and closing it later is additive: narrow `world_push_actor`'s socket and
the Actor variable's check. Not worth pre-empting.

### Camera traits

A Camera's traits are its own. Sharing one pool with actors would offer
'Affected by Gravity' and 'Acts as Ground' in a Camera's `use trait` dropdown —
the meaningless-trait problem moved from the actor list up into the palette,
where a learner can actually pick it.

The subject is a FIELD on the trait declaration, not a second declaration block:

```
define trait "Follows the player" for <camera>
```

defaulting to `actor`, so every trait that exists today reads and behaves
unchanged. This follows the existing model, where a member's subject is its
SCOPE and is derived from where it is declared — a rule's own members are
world-scoped, a trait's are actor-scoped — and it follows the direction
`world_rule_block` took, which generalized several member blocks into one with a
field rather than adding more blocks.

What it costs: `TraitMeta` gains a subject; a camera trait's members are
camera-scoped and bind `camera` where an actor-scoped member binds `actor`; the
scheduler iterates `world.cameras` for camera-scoped steps; `use trait` gains a
third home in `traitContextExtension` (which already exists for its two), and
that home is what tells the dropdown which subject to filter to.

A camera trait is declared inside an ordinary `.rule`, so a "Camera Follow" rule
is a rule a learner can open and read — which is the reason to prefer a trait
here over a `follow target` property plus one engine behavior.

COMBINATIONS ARE DEFERRED. A trait valid on both an actor and a Camera — screen
shake, drift, anything that only perturbs a position — is a real category, but a
`both` subject forces a member body to name its subject generically rather than
as `camera` or `actor`, which reads worse for the common case. It is additive
later, and there is no telling yet what other subjects may want one.

`has trait` works on a Camera, since a Camera's value is an actor value. The
actor-collection filter (`world.actors.with(t)`) does not see Cameras, by the
same rule as every other actor filter; `world.cameras` is where a camera query
starts.

## Layers

The introduction of a Camera means that we may need to render the Camera output
independently of other Actors which might not be part of the game scene. We
might want, say, some visualization of our lives or our score. These are part of
the interface and not part of the game world.

Therefore we need different coordinate systems. This is done through a process
of defining 'layers'. In the World, we can `define layer do` and in that section
place actors and load maps. A Layer is useful since it can have effects applied
to it as well.

A Layer does NOT own a Camera. Cameras are the World's (see above) and are
applied to a Viewport; a Layer says only how it RESPONDS to whichever camera is
drawing it. That is one choice and one number:

- **camera-driven**, with a parallax factor for how much of the camera's motion
  it takes. The game layer is 1.0. Distant scenery is 0.2. Something in front of
  the action is 1.2 — a near thing moves faster, which is what parallax is.
- **fit** — ignore the camera and fit this layer's own extent to the surface.

The factor is a VECTOR, one multiplier per axis, applied component-wise. This is
not generality for its own sake: the commonest parallax in a side-scrolling game
is `(0.2, 0)` — a sky that shifts as the player walks and stays put when they
jump. A single number cannot say that, and a sky that bobs with every jump is
the thing that reads as broken.

`fit` is what makes an interface layer work, and it is why one is not a special
kind of object. The factor covers translation only; SCALE comes from the camera,
so a factor of 0 would still leave a HUD drawn at whatever scale a large map put
the camera at (a 40x40 map is quarter scale, and the score would shrink with the
level). `fit` does not consult the camera at all, which is the wanted behavior
and is also why an interface layer does not need a camera of its own.

A FACTOR OF `(0, 0)` IS NOT `fit`. It means "do not translate with the camera",
and the camera's scale still applies. `fit` means "do not consult the camera at
all". The two look identical until a map is large enough to move the camera off
1:1, and then only one of them keeps a HUD readable. They are different answers
and both are wanted.

### A layer's background and foreground

A Layer has a BACKGROUND image, drawn behind its actors, and a FOREGROUND image,
drawn in front of them. Both are properties of the layer rather than objects in
their own right, and they inherit the layer's factor and fit for free. There is
nothing to name and nothing to order: they are behind and in front of the actors
that are already there.

This is what 'backdrops' were. `World` today holds `backdrops` back-to-front and
`setBackground(sprite, layer = 0)` takes a stack index — which was always a
proto-layer, and now becomes a layer reference meaning exactly what it means
today: the default layer's background. No block changes, no migration, and the
word 'backdrop' retires in favour of 'a layer's background'.

Parallax is then layers, and needs no cameras at all. Distant mountains are a
layer with a background and no actors at 0.2; near hills are another at 0.5; the
game is 1.0; fog in front is a foreground on the game layer, or a layer of its
own at 1.2. Nothing is hand-wired, and none of it requires a learner to have met
a Camera — which matters, because parallax is the likeliest reason anyone
reaches for layers in the first place.

An earlier draft of this document built parallax out of separate 'backdrop'
objects and out of camera-move events wired between layers. Both are retired:
one image per slot, and the slot carries repeat / size / scale of its own (a
background may tile while a foreground stretches). Two images at the same rate
is two layers, which is cheap now that a layer holding no actors costs nothing.

### Where a slot's image sits

Two terms, composed:

```
image position = camera position (*) layer parallax + slot offset
```

`(*)` is component-wise, since the factor is per-axis.

The FACTOR ties the image to the camera. The OFFSET is motion the author owns,
and it is why a factor alone is not enough: a factor ties an image to the camera
and to nothing else, so a background on a still camera never moves. Drifting
clouds, a scrolling starfield, a conveyor texture — every one of those is motion
with no camera involved, and none of them is expressible as a multiplier.
Neither term can say what the other says, and together they cover parallax,
drift, and parallax with drift.

The offset is a vector in world pixels, so `(32, 0)` is one tile.

It is SETTABLE AT RUNTIME, because drift is a step or a handler writing it every
tick. That makes it part of the render state, and it must be a VALUE change
rather than a structural one — the distinction `WorldSnapshot` already draws for
effects, where gaining or losing one restarts the game and retuning one is
patched through `effectValues`. An offset written sixty times a second must
never restart anything.

Offset pairs with REPEAT. A stretched image slid sideways leaves a gap at the
edge; a repeating one wraps. Both are legal — stretch plus offset is a warning,
not a prohibition — but repeat plus offset is the combination that means
something, and the one to teach.

The offset is on the SLOT, not on the layer. Offsetting a layer would move its
actors too, which is a different feature (a layer transform) and one nothing
here needs. On the slot, the image scrolls and the actors stand still, which is
what a scrolling backdrop is.

Called offset rather than position: for a repeating image the value is a scroll
amount, and "position" invites the reading that a surface-filling image has an
origin somewhere in the world.

The slot settings — image, offset, repeat, size, scale, for each of two slots,
get and set — are another small combinatorial family, and they want the same
answer as the effect blocks below: GENERATED FROM A TABLE, not hand-written.
They do not exist yet at all, so there is nothing to migrate.

### Which layer a thing is placed in

Layers complicate the scene graph. Three blocks place things — `add actor`,
`load map`, `create actor in map` — and each has to end up in some layer.

A LAYER OWNS ITS CONTENTS. `define layer` has a `do` mouth, and what is placed
inside it is placed in it:

```
define world "My World"
  define layer "Sky"        parallax 0.2   background <Clouds>
  define layer "Game"       parallax 1.0 do
    add actor <Player>
    load map <Level 1>
  define layer "Interface"  fit do
    load map <HUD>
```

Declaration order is depth: the Sky is drawn first and the Interface last. Depth
is something read rather than computed, which is the reason to make the order of
the blocks mean it.

The alternative was `within layer <x> do` as the only way to target a layer —
ambient context, where a placement block does not say where it places and its
ancestor decides. That was rejected as the PRIMARY form. This project is
consistently wary of ambient context and guards it rather than trusting it
(`worldContextExtension`, `runtimeWorldExtension`, and `world_actor_kind`, which
compiles to two different things depending on its parent). Containment says the
same thing without the guard: a block's layer is its ancestor, which is a fact
you can see without scrolling, and it is the shape everything else here already
has — `define world`, `define actor` and `define rule` all contain their bodies.

Rejected too was a layer field on each of the three placement blocks. It is
honest, but it puts a dropdown reading `Game` on twenty consecutive blocks, and
it shows the word "layer" to the beginner on the first block they ever touch.

`within layer <x> do` SURVIVES, as the reopener. It targets a layer declared
earlier, for the cases containment cannot reach:

- adding to a layer from somewhere other than its declaration;
- eventually, spawning at runtime, where the placing block is inside an event
  handler and has no layer ancestor at all.

Two blocks with clearly separate jobs — "here is a layer and what is in it"
versus "target this layer for a while" — in the same way `define actor` and
`add actor` are separate. Innermost wins when they nest, and that is a rule to
state rather than leave to be discovered.

### The default layer

A placement directly under `define world`, in no layer at all, goes to the
DEFAULT LAYER — which is a real layer, not the absence of one. The alternative
is a scene graph with two kinds of actor in it forever, and an `all actors in
layer` query with no honest answer for the ones that are in none.

**The default layer is created where the first such placement appears.**
Declaration order is already depth, so this reads top to bottom like everything
else: a Sky declared above it is behind, an Interface declared below it is in
front, and a world that declares no layers at all has exactly one.

The two alternatives were worse. Pinning the default to the BOTTOM of the stack
puts every author-declared layer above it, which is backwards for the first
thing anyone will want — a sky behind the game. Requiring explicit placement
once any layer exists is a mode switch: everything works until you add your
first layer, and then every placement you already wrote is an error.

### What warns

Two, and both reuse machinery that exists:

- `within layer` outside a `define world` — the `worldContextExtension`
  treatment, since there is no world whose layers it could mean.
- `add actor` in a handler. This is not a layer problem and predates layers:
  the block generates `world.addActor(Template, id, type)`, which is
  `WorldBuilder.addActor`, while the live `World.addActor` takes one
  already-instantiated Actor. It is builder-only and carries no guard today
  (`extensions: [actorOptionsExtension]`), so dropped into a handler it pushes
  an `ActorBuilder` into the actor list. It wants the mirror of
  `runtimeWorldExtension`, independent of any of this.

A placement with no resolvable layer cannot happen, because the default layer
above is always resolvable. That is the point of choosing it.

Because placement is builder-only, ALL of this resolves lexically during
generation. No layer context exists at runtime, and none of it becomes state
the reconciler has to track.

A layer is referenced BY BLOCK ID, not by its name. Layers are world-local, and
the project has both patterns to choose from: rules are named by string, and
that cost `renameRule` and `renameMemberReferences` to carry a rename through
every reference; a world's own actors are referenced by the id of the block that
defines them (`localActors`, `local:<blockId>`) and cost nothing. A layer's name
is a label, and renaming it should not be able to break anything.

Layers and Cameras are STRUCTURAL. `WorldSnapshot` restarts a running game on a
structural change and patches it otherwise, and a layer cannot be spliced into a
live scene graph — so layers and cameras belong in the snapshot from the start,
alongside `ruleIds` and `effectIds`, rather than being retrofitted after the
first reload that silently does nothing.

Most actions do not really care about which layer certain actors are within.
This is because you are likely only placing game actors in a game layer,
background elements in a background layer, and user interface widgets in the
user interface and HUD layers.

To capture actors only within particular layers, we will add the added filter
logic of `all actors in layer <layer name via dropdown>` for the array of actors
and `<actor> is in layer <layer name via dropdown>` query.

## Viewports

Three things were sharing two names for most of this document's life, and
separating them is what makes minimaps and split screens fall out rather than be
built:

- a **Layer** is contents, and the coordinate space they live in;
- a **Camera** is a pose — where you look from, and how far zoomed;
- a **Viewport** is a camera applied to a surface, drawing a selection of the
  layers.

A Camera reads as though it IS the viewport right now, and that is because there
is exactly one of each: one camera drawing into one surface. When there is only
one of a thing it cannot be told apart from what it is paired with. Wanting a
second view of the SAME contents — a minimap, a security monitor, one half of a
split screen — is what pulls them apart, and it is the case that proves a Camera
cannot belong to a Layer.

```
define viewport <Left>   camera <Follows P1>   left half
define viewport <Right>  camera <Follows P2>   right half   hide layer <P1 HUD>
```

A viewport SELECTS from the world's layers rather than listing its own. Contents
belong to the World, because that is where placement happens — an `add actor`
inside a `define layer` is an act on the world, and "which viewport did I put the
player in" must never become a question anyone can ask. Selection also
means adding a layer reaches every viewport automatically, which is what is
wanted for scenery and not for a per-player HUD; hence a filter, used only where
it is wanted.

An interface CAN live on its own viewport, and for an advanced layout it should.
It must not be the answer for the basic case, though: a project with a score
would then meet viewports on day one. The `fit` flag keeps that at zero new
concepts.

### What the basic case writes

Nothing. One implicit viewport, one implicit camera, one implicit default layer
holding every actor. `set background to <sky>` sets that layer's background,
stretched and static, behind everything — which is exactly what backdrops do
today. A learner who never opens the Layers category sees no change at all.

The order of arrival follows from that: **layers first** (depth, effects, and
parallax by factor — all of it useful with no camera in sight), **cameras
second** (control of the pose), **viewports last** (split screen, minimaps,
render-to-texture). A Camera shipped before layers would be a Camera that
scrolls the score off the screen.

## Viewport size

Finally, we will add a few direct Viewport manipulations. Advanced creators will
have the `set viewport width <x> and height <y>` and associated `get` blocks
which command the size of the screen. These will have sensible limits and error
when the numbers are too large. This will allow students to create experiences
that cover the entire screen or target mobile dimensions.

DEFERRED, and worth knowing why it is not the cheap one it looks like.
`VIEWPORT_WIDTH` and `VIEWPORT_HEIGHT` are constants today, and `viewport.ts`
exists precisely because they were once two constants that could disagree. A
settable viewport turns them into state, which reaches `PhaserBinding`, the map
editor's fit and border, `FieldMapPlacements` / `PlacementGrid` (whose grid is
hardcoded to `VIEWPORT_TILES`), the backdrop draw, and `sandbox/preview.html` —
whose CSS is a hardcoded square (`min(100vw, 100vh)`) and is, per that same
file, "the one place that has to be kept in step by hand".

A later Viewport OBJECT is the other half of this: a rendering surface that is
told which Camera to use, of the several a World may hold. With no Cameras, the
default camera is used — which is what the whole first section describes.

### Renderer options belong here too

Setting a viewport's size is where the OTHER renderer options are decided —
filtering, display scale, and whatever else the surface is asked to do — because
they are the same kind of knob on the same object and deciding them apart would
mean deciding them twice.

Deferred with the rest, and the findings recorded so they are not rediscovered:

- `PhaserBinding`'s game config sets no `pixelArt` and no `antialias`. Phaser
  defaults to `antialias: true`, so game textures filter LINEAR.
- `sandbox/preview.html` sets no `image-rendering` on the game canvas.
- Every EDITOR surface does — the map editor, animation editor, placement grid,
  appearance dialog and cell thumbnails all use `image-rendering: pixelated`,
  and the effect preview sets `antialias: false` outright.
- `#game` is `width: min(100vw, 100vh); max-width: 800px` over a 320px native
  canvas, so the display scale is up to 2.5x and takes every value in between as
  the pane resizes.

Which means the running game is already softer than every editor that draws the
same pixels — today, at 10x10, with no resizing involved. A learner draws crisp
pixels and runs blurry ones. Map resizing does not cause this; it adds a second
fractional scale on top of it.

Three sub-decisions for whoever picks this up:

- Phaser's `pixelArt: true` also sets `roundPixels`, which snaps sprite
  positions to whole pixels. Good against sub-pixel jitter, but it quantizes
  slow motion — at 320px native, half a pixel per frame becomes a visible step.
- NEAREST changes how the effect shaders sample their textures, so effect output
  may shift.
- Making the DISPLAY scale integral (sizing `#game` to a whole multiple of the
  native width instead of `min(100vw, 100vh)`) is the actual fix for crispness.
  Nearest at 2.5x is still uneven; nearest at 2x or 3x is exact. It costs pane
  space to letterboxing.

Adaptive filtering — NEAREST at exact scales, LINEAR otherwise — was considered
and set aside. It is the best output, but it is per-texture state entangled with
the effect shaders, and the case it fixes needs a fractional scale AND a moving
camera at once.

## Effect blocks

Everything above adds somewhere for an effect to live, and the effect blocks are
the one part of this palette that was never generated.

There are six today — `add` and `remove` × actor, world, background — written out
by hand, with `effectParamsMutator` wired separately into each of the three `add`
blocks. This plan takes the owners to six: actor, world, layer, a layer's
background, a layer's foreground, and camera. That is twelve blocks and six
hand-wired mutators, and the viewport effect deferred above would make fourteen.

GENERATE THEM FROM A TABLE OF OWNERS. One factory, one row each:

```
actor       socket    add effect <E> to <actor>
world                 add effect <E> to the world
layer       dropdown  add effect <E> to layer <L>
background  dropdown  add effect <E> to the background of <L>
foreground  dropdown  add effect <E> to the foreground of <L>
camera      dropdown  add effect <E> to camera <C>
```

Twelve blocks still exist; one definition and one mutator wiring produce them,
and a new owner kind is a row rather than a copied block, a copied mutator and a
copied generator. This is the house idiom rather than a new invention —
`defineSetPropertyBlock`, `defineGetPropertyBlock`, `defineActionBlock`,
`defineQueryBlock`, `defineEventBlock`, `defineEmitBlock` and
`defineEnumValueBlock` are all already factories over metadata. The effect
blocks are the odd ones out for being hand-written, and the count is only a
problem while they are.

The alternative was collapsing everything but the actor into one block with a
live target dropdown — `add effect <E> to <the world | layer Game | the
background | camera Follow>` — four blocks that never grow. It was rejected on
two counts. The palette pressure it relieves is largely imaginary, because the
twelve distribute into the categories of the things they affect: actor effects
in Actor, camera effects in Camera, layer effects in Layers. Nobody meets twelve
at once, and each is found where its subject already is. And the labels stay
sentences: `add effect to the world` reads better than `add effect to <the world
▾>`, which for a beginner is the difference between a block that does something
and a block that asks a question first. What the collapse does buy — one place
enumerating everything that can carry an effect — is real but smaller.

THE ACTOR OWNER TAKES A SOCKET AND THE REST TAKE DROPDOWNS, and that asymmetry
is the point rather than an inconsistency. An actor effect must be able to name
the coin that was touched, a loop's actor, `any <Coin>`; a dropdown cannot say
any of those. The world is singular, and layers and cameras are world-local
things chosen by name.

The layer dropdown on `background` and `foreground` DEFAULTS TO THE DEFAULT
LAYER, so `add effect to the background` keeps working unqualified for a project
that has never heard of layers — the same defaulting `setBackground(sprite,
layer = 0)` already does.

Restructuring is free at the moment of writing and expensive afterwards: block
types are what saved workspaces are made of, so six hand-written blocks can
become a factory now with no migration, and cannot later.

## Open questions

Not yet settled. Recorded here so they are not mistaken for decided.

- **Deferred: whether "world" is the right word for the screen.** With layers,
  `add effect to the world` invites the reading "the game, not my HUD" — which
  is now a sayable and different thing (an effect on the Game layer). Three
  scopes exist: the whole screen (the world's), the game but not the interface
  (a layer's), and one region of a split screen (a camera's). The label was
  raised and deliberately kept; if it is ever revisited, this is the reason.
- **Build order.** Layers before Cameras: a Camera without layers cannot express
  the thing that motivates Cameras — a HUD that does not scroll — so shipping it
  first ships a Camera that breaks the score display.
