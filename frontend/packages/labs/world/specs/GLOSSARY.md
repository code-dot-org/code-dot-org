# Glossary

This is a set of official terms for common concepts within the system.

## World

A **World** is the encapsulation of all laws that exist in the simulated environment, together with
the Actors living under them. It is the whole of a running game: the Rules in play, the Animations
registered, and every Actor placed.

There is no separate "scene" concept. An arrangement of Actors is a Map, and a World loads as many
Maps as it likes — one for the level, another for the UI — so a Map serves the role a Scene would
have. Splitting the laws from the arrangement bought nothing: everything a Scene could do was an
operation on the World it held.

## Actor

An **Actor** is any entity that can act in the World.

## Rule

A **Rule** is a law of the world.

## Property

A **Property** is some value or data that is owned by either the World or the Actor.

## Action

An **Action** is a method that is placed on an Actor by a Trait that helps modify
property state. Often this has a `name` field that can be a localized string useful
for rendering simpler/friendlier Blockly interfaces.

## Accessor, Mutator, Query

Not necessarily terms that are used concretely in the system from the creator's perspective, but
useful to capture the differences between methods that access (retrieve a value from a property),
mutate (set a value of a property) and query (determine the state of an Actor via their properties.)

Properties and Actions have a `name` property that determines how their Blockly-based versions and
helpers look. These are localizable names.

## Trait

A **Trait** is a concept that is applied to an Actor that determines how it interacts with the World.

## Event

An **Event** is a kind of signal to do something in response to something that has happened either
in the World or relating to the given Actor.

## Tick

A **Tick** is the unit of time that the World is updated. Each Rule generally affects the state of
the world in some unique way each Tick.

## Step

Rules update the world by offering an implementation routine that runs once per tick. These rules
can have more than one such routine as necessary. Each routine is a **Step** which can run before
or after a Step in another dependent Rule (or explictly ordered at the beginning or end, for
certain rules.)

## Sprite

A **Sprite** is a single image. These are combined to create animations. A single image may
represent multiple sprites via a **Spritesheet**.

## Animation

An **Animation** is a description of a set of Sprites with a delay between each frame that will
represent an animated routine. These can be applied to an Actor to represent them visually. An
Animation may just be a single image, of course, for simpler Actors.

## Map

A **Map** is a description of initial instances of Actors that can be loaded into a World. This
allows an easier editing of level data that can be swapped in to a general World as needed.

Loading is additive, so a World can stack several: a level Map and a UI Map, say. A Map may hold UI
Actors as readily as game ones — a dialog is a Map you load on top of what is already there. Special
editors can exist to make editing a Map more pleasant; the tile-based map editor is the first.
