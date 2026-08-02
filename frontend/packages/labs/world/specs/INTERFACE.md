# Interface

The programming model of the entity component system defies traditional interfaces.
In original Sprite Lab, the workspace was a single Blockly workspace that offers complexity via function editing.
It was only a function-based environment and philosophy.

In this model, we have a separation of data and implementation via the components, which are highly descriptive,
and the events including rule implementations.

In the simple case, we might offer a prebuilt world (which is what Sprite Lab is, essentially) where there are
very basic rules. Then, we need a way to apply the traits to different actors, place them in the world, and
respond to and code events.

We will discuss, first, the individual serializations and editing interfaces for each major type of construct
and then conclude by discussing the simplified view. Every step of the simple-to-complex process should allow
for incremental revealing of the complexity such that a learner can see every bit of the program that is making
the logic for their game function. So, if they want to know how Gravity works, the simple view might abstract
it away and hide the construction of the rule and world, but revealing can show the world and then rule in turn.

## Rule

These have a `.js` or `.ts` extension if they are JavaScript and a `.rule` extension if they are Blockly (which
is stored as the Blockly serialized JSON form).

Rules are:

- A set of inherited Rules
- A set of new Traits
- Helper Actions
- Each Trait:
  - A set of inherited Traits
  - A set of properties
  - Event descriptions
  - Helper Actions
- Implementation events (on tick, before {rule}, after {rule})

This could be a Blockly interface where you drag on the existing rules to
define inheritance and then attach 'Create Trait' blocks to define Traits,
etc.

This isn't very dogmatic since traits and inherited rules are declarations
and not any kind of procedural code, and the mix of those concepts makes
the Blockly situation a little more complicated.

Thus, in the JavaScript form, we are choosing to implement it as a
'builder' style system where we incrementally build the definition and then
pass it to a `build()` method to create the immutable Rule.

```javascript
// rules/gravity.js

import {RuleBuilder} from 'world-lab';

import MotionRule, {MovableTrait} from 'rules/Motion';
import CollisionRule from 'rules/Collision';

const rule = new RuleBuilder({
  id: 'gravity',
  name: 'Has Gravity',
});

rule.requires([MotionRule, CollisionRule]);

// Create the World-context properties. These affect all operations within
// the current world. They are settable via the World.
export const DirectionProperty = rule.addProperty('direction', 'vector', {
  x: 0,
  y: 1,
});
export const StrengthProperty = rule.addProperty('strength', 'number', 9);

// Actions are methods that help adjust properties that do not return
// values. These would be accessible via `world.gravity.invert()`.
export const Invert = rule.addAction(
  'invert',
  world => {
    world.set(DirectionProperty, world.get(DirectionProperty).rotate(180));
  },
  {
    // Friendly name for the Blockly version of the action.
    // Otherwise, the default Blockly block is 'Gravity %1' where %1 is a dropdown
    // of actions. This creates an 'Invert Gravity' block.
    name: 'Invert Gravity',
  },
);

// Create the 'Affected by Gravity' trait
export const AffectedByGravityTrait = rule.addTrait({
  id: 'affected',
  name: 'Affected by Gravity',
});

// Inherit other traits. When the Actor uses this trait, it automatically
// uses these, too, even if they are not explicitly written out.
AffectedByGravityTrait.requires([
  MotionRule.traits.movable,
  CollisionRule.traits.collidable,
]);

// Adds properties to the trait, which in turn would add these properties
// to the Actor scoped by the Trait.
export const ScaleActorProperty = AffectedByGravityTrait.addProperty(
  'scale',
  'number',
  1,
);
export const FallingActorProperty = AffectedByGravityTrait.addProperty(
  'falling',
  'boolean',
  false,
  {
    // A readonly property is only assignable in the step handler of this
    // rule. Though it may not be enforced in our prototype.
    readonly: true,
    // Friendly name for the block. A readonly boolean variable is implicitly
    // a kind of 'query'
    name: 'is falling?',
  },
);

// We can add a Trait actions / queries, too, if that matters. These act
// in the actor contexts and take the actor as an argument. In events or
// definitions, the 'this Actor' parameter exists as shorthand for the
// current Actor in the current context.
AffectedByGravityTrait.addQuery(
  'isOnGround',
  actor => !actor.get(FallingActorProperty),
  {
    name: 'is on the ground?',
  },
);

// Create events. These are simple. Others may introduce a set of
// properties that are handed to the event handler as parameters.
export const StartsFallingEvent = rule.addEvent('startsFalling');
export const StopsFallingEvent = rule.addEvent('stopsFalling');

// A Step handler implementation
const applyVelocity = world => {
  for (const actor of world.actors.with(AffectedByGravityTrait)) {
    actor.set(
      MovableTrait.properties.velocity,
      actor
        .get(MovableTrait.properties.velocity)
        .add(
          world
            .get(DirectionProperty)
            .scale(
              world.get(StrengthProperty) *
                actor.get(AffectedByGravityTrait.properties.scale),
            ),
        ),
    );
  }
};

// Attach handler to step
const applyVelocityStep = rule.addStepBefore(
  'applyVelocity',
  MotionRule.steps.reposition,
  applyVelocity,
);

// Ditto for next step implementation.
// Gravity involves two different parts of the update pipeline
const handleCollisions = world => {};

// Attach handler to second step
const handleCollisionsStep = rule.addStepAfter(
  'handleCollisions',
  CollisionRule.steps.resolve,
  handleCollisions,
);

// Export Rule
export default rule.build();
```

There will be a way to transform the Blockly version to JavaScript/TypeScript
but not the other way around. However, it would be nice for there to be
a way to preview the TypeScript code while in the Blockly form for the benefit
of seeing how the Blockly translates. Hovering over a block should highlight
the equivalent code in the generated form. As a bonus, it could describe how
the JavaScript is handling, say, the declarative parts of the Rule and the
procedural forms.

## World

The world is a major construct that defines the rules currently in play.

Although very important and a core concept, a World is fairly simple. It is
a surface that glues all of the other systems and entities together.

```
// worlds/platform.js

import {WorldBuilder} from 'world-lab';

import GravityRule from 'rules/Gravity';
import CollectionRule from 'rules/Collection';

// Construct a world builder
const world = new WorldBuilder({
  id: 'platform',
  name: 'Platform World',
});

// This world has the gravity rule and the collection rules
// since this world will be a player that collects things.
world.useRules([
  GravityRule,
  CollectionRule,
]);

// To guide in the simple view, we can tell it to hide rules
// The learner can generally have the option to unhide them in
// the interface, but some levels might have a property that
// disables that feature, too, since there is an intended
// progression that teaches the concepts without distraction.
world.hideRule(GravityRule);
world.hideRule(CollectionRule);

// A world holds the Actors living under those rules as well as the rules
// themselves — there is no separate "scene". Placing one at a time:
import PlayerActor from 'actors/player';

const player = world.addActor(PlayerActor);
player.set(PositionActorProperty, {x: 100, y: 100});

// Setting each by hand is intensive, so the usual way is a Map: a JSON
// description of instances and their property overrides.
import Level1 from 'maps/level_1.json';

// Every actor type a map names must be registered under that name first.
world.define('player', PlayerActor);
world.loadMap(Level1);

// Loading is additive — a world can stack several maps, e.g. a level and a
// heads-up display. `clear()` empties it first when replacing rather than
// adding.
world.clear();
world.loadMap(Level2);

// Export the world
export default world;
```

The first call that needs actors builds the World, and what that means for a
call arriving afterwards depends on whether the live World can still answer it.

`useRules` and `useAnimations` must come first. Rules decide trait membership
for every actor, and the animation registry is seeded once when the World is
constructed, so neither can be applied to a world that already exists. Placing
`use rule` below `load map` throws rather than doing nothing quietly — Blockly
blocks are reordered by dragging, and a world silently missing a rule the
learner can see they asked for is the worse outcome.

There is no block to misplace for `useAnimations`. Every `.anim` the project
holds is registered, emitted ahead of everything else in the generated world:
an animation is a file, so holding one is what makes it playable, and asking a
learner to also say "and use this one" was a second way to say the same thing
that could only ever be forgotten.

`set` and `addEffect` are not ordered at all. Both have exact counterparts on
the live `World`, so after it is built they simply forward to it. Both are also
blocks a learner may place in an event handler, where they land on the live
world and mean the same thing; making them care where they sit inside a
`.world` file would be an arbitrary rule with nothing behind it.

## Actor

The Actor is an entity in the system.

It needs a set of Traits. And then it can have a set of events.

In Blockly, this is likely either done in the Sprite Lab way where you have
general event blocks that take the type of Actor as arguments, or within Actor
files where free-floating event blocks are tied to the given Actor of that file.

In JavaScript, this is a simple class.

```javascript
// actors/player.js

import {ActorBuilder} from 'world-lab';

import {AffectedByGravityTrait} from 'rules/Gravity';
import {KeyboardControlledTrait} from 'rules/KeyboardController';
import {CollideEvent} from 'rules/Collision';

// Create the actor builder
const actor = new ActorBuilder({
  id: 'player',
  name: 'Player',
});

// Apply traits which adds properties with default values
actor.useTraits([AffectedByGravityTrait, KeyboardControlledTrait]);

// Update trait properties to different values than defaults
actor.set(MovableTrait.properties.velocity, {x: 0, y: 0});
actor.set(AffectedByGravityTrait.properties.scale, {x: 0, y: 0});

const onCollide = world => {
  // go through actor's collisions array
};

actor.on(CollideEvent, onCollide);

// Export the actor
export default actor;
```

## User Interfaces

There will be user interface Actors that are there to enable menus and
such.

A World can then load a Map of these to define the interface of the
game at that moment. A "Main Menu" is a Map you load into a world of
its own; a pop-up dialog is a Map you load on top of the level.

This is something we can design later since user interface elements
are likely going to be DOM elements and will be interesting to
incorporate.

## Map

A Map can be used to quickly load and instantiate actors as a dataset.
It is the arrangement half of a game — the World supplies the laws, a Map
supplies what lives under them — and a World may load several.

A Map editor can be used to populate that data file with actor types
and their properties.

```
// maps/level_1.json

{
  "actors": [
    "type": "player",
    "properties": {
      "gravity": {
        "scale": 1,
      },
      "spatial": {
        "position": {
          "x": 100,
          "y": 100,
        },
      },
    },
  ],
}
```

The Map editor can have a grid and grid-aware assets. We will explore
that in our asset and animations sections.

## Animations

The appearance of any Actor is governed by its 'Animation'.

An Animation might be a misleading name since it can be a static image
or even a set of tile-based images that are grid-aware.

An `.anim` file is the JSON serialization of the animation data that
might refer to several images that exist in the project.

Nothing here is built in. A project draws only what it holds: the image
an Actor wears is a PNG in the project and the animation is an `.anim`
in the project that reads rectangles out of one. There is a library of
stock sprites and animations, but it is a shelf to copy from — importing
one writes the files into the project, and from that moment they are the
learner's, repaintable and deletable, with nothing outside the project
depending on them.

### Sprite and Spritesheets

Sprites are the basic images that can be composed together to form an
animation. A Sprite is just a single image. A Spritesheet is one image
holding a grid of them.

Nothing about a PNG says which it is — how an image should be cut up is a
decision someone made — so the decision is a file: a `.sheet` beside the
image with the same stem. `coinSpin.png` + `coinSpin.sheet` is a
spritesheet; `player.png` on its own is a picture. Importing a stock
spritesheet brings both.

Only the editor reads a `.sheet`. The runtime never does: a frame carries
the rectangle it draws, so by the time an animation is playing the grid
has already done its job. That is why the metadata can live beside the
image rather than inside the animation — and why a learner can change it
without breaking animations already written against it.

### Animation Asset

A proper Animation is a set of frames and a rate to play them at. There
is an Animation Rule that updates the frame and emits events when the
animation changes frames or ends that an Actor can elect to use. The
Animation Rule has the animation property that allows you to set the
animation to one known in the project.

An animation is named by the key it is filed under — `{"animations":
{"walk": …}}`. That key is what a `play animation` block holds and what
`playAnimation` looks up, and there is no second, friendlier name: one
was carried in the file for a while and nothing ever displayed it, which
made it a name to keep in step with the real name for nothing.

The timing is the animation's, said once as `frameRate`. A frame may name
its own `delay` in milliseconds, but that is an exception — a walk cycle
has one timing, and a copy of it on every frame is a set of numbers to
keep in step by hand.

The Animation editor lets you arrange the Sprites to form the animations:
a strip of the frames in the order they play, one inspector for the frame
selected, a looping preview with an onion skin, and — for a sheet-backed
image — one frame per cell in a click. Obviously, authoring is intensive,
so there is a set of stock animations using stock sprites that can be
imported.

### Tile-based Assets

An Actor might be aware that it is using a tile-based 'animation'.

This is important for AI image generation but also more importantly
the Map editor. The Map editor can 'instantiate' tiles for ground and
other surfaces using the tile-based asset such that it automatically
creates nice borders or edges for top-down games or platformer
platforms.

In this form, this 'Animation' is a set of sprites that define the
different dimensions of the tile. So, if the tile is two colors and it
is defining a "wall" or "border", then there will be many sprites of
the same dimensions that are defining all of the permutations where
the border exists or does not exist on any particular side.

In these cases, the Map editor can then paint the sprites for the
actors on a grid and then differ their appearance based on whether or
not the same type of actor using the same tile-based asset is its
neighbor. So, two next to each other and otherwise alone would use
the sprite assets for a block with walls on all sides except the
respective sides that face each other, for instance.

This is likely best facilitated by a Map Editor which shows you all
of your Actors including the Tile-Based Actors. When you select a
Tile-Based Actor (one with a tile-set as its animation), it will
automatically show the grid when you select it and paint to that
grid.

Since this is also intensive, but likely AI-aidable, there will be a
set of stock tiles that are already in this form that you can import.

Not all permutations might be available. And for certain angles, there
might be a trivial 'mirror this' option to yield the missing options.

Also, we should support 'angles' in, say, platformers. So there might
be blocks representing the tops and bottoms of platforms so they can
have height and show the ground surface on the top-most tiles. Then,
there may be options for switching certain tiles to be sloped. This
can be done by adding sloped tiles to the Tile Editor for the asset
and then in the Map editor a context menu to switch the ground tile to
the set of available slopes. The slope degree is written to the tile
as state that the engine can read. This is advanced and may not be
included in our prototype, but something to keep in mind.

### Serialization

The serialization of an Animation is to assume the sprites exist
as PNG files somewhere such that the animation can reference them.
Then, it is something like this for a tile-based asset:

```
// tilesets/Bricks.json

{
  // Hints to the loader that it should open the tileset editor
  "type": "tileset",

  // Using 'blob' or 'Wang' coordinates and mapping those
  // to the sprites
  "tiles": {
    "tile-00": {
      "sprite": "sprites/Tiles.png",
      "position": {
        "x": 0,
        "y": 0,
        "width": 128,
        "height": 128
      }
    },
    "tile-01": {
      "sprite": "sprites/Tiles.png",
      // The position if the given image is a spritesheet
      "position": {
        "x": 129,
        "y": 0,
        "width": 128,
        "height": 128
      },
      // We can mirror the given sprite on the given axis
      // To reuse the sprite image
      "mirror": "x"
    },
    // do all the other forms. mirroring is exhaustive, the editor will
    // emit a copy of any mirrored form with "mirror" property set, but
    // will generally collapse to the first form seen.
  }
}
```

And for a normal animation:

```
// animations/player.anim

{
  // Hints to the loader that it should load the animation helper
  "type": "animation",

  "animations": {
    // An animation is named by its key — what a `play animation` block
    // holds and what `playAnimation` looks up.
    "walk": {
      // Frames per second, for the frames that do not say otherwise.
      // Absent, a frame with no delay of its own is held 100ms.
      "frameRate": 8,

      // Loop back to the first frame (the default). False holds the last
      // frame and emits AnimationEnded.
      "loop": true,

      "frames": [
        {
          "sprite": "playerWalk.png",
          // The cell of a spritesheet this frame draws. Omitting it draws
          // the whole image. Written out rather than named: the frame
          // carries the rectangle, which is why the `.sheet` beside the
          // image is an editor convenience and not a runtime dependency.
          "position": {
            "x": 128,
            "y": 128,
            "width": 128,
            "height": 128
          },
          // Optionally, (default is no offset so (0, 0)), the offset
          // from the Actor position to draw this frame.
          // The animation frame is generally drawn with the center of the
          // image at the Actor position.
          "offset": {
            "x": 0,
            "y": 0
          },
          // The relative scale to render the image
          "scale": 1
        },
        {
          "sprite": "playerWalk.png",
          "position": {"x": 256, "y": 128, "width": 128, "height": 128},
          // A frame that is an exception to the rate says so, in
          // milliseconds. Most frames do not.
          "delay": 500
        }
        // ... rest of the frames for the 'walk' animation
      ]
    }
  }
}
```

A frame's `sprite` is the file name of an image the project holds
(`playerWalk.png`) — the same name the driver keys its texture by and the
same name a `set sprite` block stores.

And a spritesheet is just the size of a cell, beside the image, named
after it. The grid is read left to right and top to bottom; an image that
is not a whole number of cells has a remainder that is not any cell.

```
// sprites/playerWalk.sheet   (beside sprites/playerWalk.png)

{
  "type": "sheet",
  "cell": {
    "width": 32,
    "height": 32
  }
}
```

An earlier form of this named every cell (`"player_walk_1": {position}`).
Nothing needed the names: a frame stores its own rectangle, so a name
would have been a second way to say the same thing and one more thing to
keep in step when an image is repainted.

A simple single-image 'animation' is possible for very simple things.
This is something we can add to the AnimationRule where we can
assign an animation _or_ we can assign a sprite directly. In that case,
it is useful to define the offset and scale.

## Simple World (Simple View)

The abstraction of an Actor is to introduce 'kits'.

A platformer 'Kit' would include a PlatformActor which is just
a basic shell that takes an image or an animation kit and adds
the appropriate traits and default values for their properties.

One cannot alter the state of the abstracted Actor, but can
eventually turn it into an full Actor when they want to expand
out of the Kit and transform the project into a full-fledged
development environment.

This allows introducing the concepts of the environment without
the overhead of the entire ecosystem or interface. We could
essentially just have the World view with PlatformActors where
one can change their appearance only and add events to the
World view per Actor in order to create a very basic experience.

Transforming this would mean taking the PlatformActor in the
Simple version of a World, and creating a proper Actor while
tranferring the events pertaining to that Actor to that file.
Same would go for other Actors in the Simple World to their own
files. Then, we can expose the traits, if desired, or the World,
if desired, from there. That would create an arrangement where
the complexity is shown incrementally from the perspective of
the learner on their own terms.
