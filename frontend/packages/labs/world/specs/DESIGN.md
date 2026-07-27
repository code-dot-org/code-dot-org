# Overview and System Design

Rules are the "laws" of the world.
They determine how the world "works".

Without any Rules, a World has no shape or form.
If we want things to have positions, we need to create Space via a Spatial Rule.
This Rule adds the Spatial Trait.
When an Actor (Entity) has a Spatial Trait, it has a set of properties.
In this case, a position (vector: x, y), a scale (vector: x, y) and a rotation value and a vertical skew value.

Since this is meant to be a simple system, Rules can offer abstractions via methods called 'Actions'.
An Actor with the Spatial Trait can "rotate", "move", and "resize" which sets the respective values.

Rules can be composed of other Rules to further the goals of abstraction.
Many of these 'inherited' Rules can be hidden in some contexts in order to reduce cognitive complexity and then can be revealed over time.
Let's jump ahead to the Gravity Rule.
This applies a downward force on any Actor with the Gravity Trait.
Let's say that the Gravity Rule applies the Spatial Rule, the Physics Rule, and a Collision Rule.
The Gravity Trait thus also similarily implies the addition of several other Traits to an Entity.

Here's a break down of a simple world:

```
World
Rules:
- Has Space
- Has Physics
- Has Collisions
- Has Gravity (implies 'Has Space', 'Has Physics', and 'Has Collisions'... so one doesn't need to exactly specify all of them)

Player
- Affected by Gravity (implies other traits)
- Affected by Physics (implied also by Affected by Gravity)
- Can Be Positioned (implied by Affected by Gravity)
- Can Collide (implied by Affected by Gravity)
When
- Collide: callback()
- Stops falling: callback()
- Starts to fall: calback()

Ground
- Acts as Ground
- Can Collide (implied by the Acts as Ground Trait)
```

Here, the 'Has Space' is the Spatial Rule.
It has the friendly term 'Has Space' since we are in a visual environment and we can use rich language when adding attributes.
The 'Has Space' Rule enables the existence of the 'Can Be Positioned' Trait.
This Trait adds the `position`, `scale`, and `rotation` vectors as members.
Therefore it adds the methods: `Get position of {Actor}`, `Get scale of {Actor}`, `Get rotation of {Actor}`, `Move {Actor} to`, `Rotate {Actor} to`, and `Scale {Actor} to` (and helper function `Resize {Actor} to` which sets both x and y of the `scale` property to the same value`.
These are all where `Actor` is an Actor with that particular Trait.

The Physics rule is doing a lot of the work, here.
This adds the `velocity` property to the Actor which is generally only readable.
The rules themselves can affect the velocity during the simulation.
The Gravity Rule, on the simulation tick, adds the gravity acceleration to the Actor `velocity` vector and keeps track of whether or not
the Actor is 'falling'.
It always adds to the velocity, but the collision logic dictates if the Actor falls on the frame.
If the Actor successfully doesn't collide during that frame while falling, it switches the Actor to `falling` and calls its "Starts to fall" Event.
If the Actor was already 'falling', a collision from above on to an Actor that has the `Acts as Ground` Trait will cause it to reset the position to "land" on that Actor and call the "Stops falling" Event.

Adding the Gravity Rule to the World automatically adds the other Rules that the Gravity Rule depends on.
Adding the Gravity Rule to the World adds the Traits that the Gravity Rule maintains to the pool of possible Traits that can be applied to an Actor.
In this case, the Gravity Rule provides the "Affected by Gravity" and "Acts as Ground" Traits.
The "Affected by Gravity" Trait (maybe also known as "Can Fall") automatically adds the other Traits that this Trait depends on.
In this case, adding "Affected by Gravity" also adds "Can Move", "Can Collide", and "Has Velocity".
Traits that are implied via dependency are reference counted. Removing a Trait that also adds another does not also remove that added Trait if yet another Trait should also depend on it.
Furthermore, removing a Trait that one explicitly added but is otherwise required by a Trait that survives it would effectively retain that Trait even if it is not visually represented as an explicit Trait.
In certain cases, we might hide those additional "implied" Traits and they are not visible in the interface to simplify the effort, but they still affect the Actor within the overall system.

The Gravity Rule also, like other Rules, enables Events to be added to the pool.
In this case, Gravity enables the "Starts to fall" and "Stops falling" events.
These are callbacks that the system can call within its implementation.
Events are queued and run after the simulation tick so as not to allow mutations of state during the simulation.

Finally, the implementation of a Rule, such as Gravity, is fairly simple.
The Gravity Rule is a set of dependencies (other Rules) and a set of Traits (which affect the construction of Actors).
A Rule can have properties that apply World-wide. For instance the Gravity rule can have a modifiable acceleration and possibly a direction.
A Trait is defined as a set of dependencies (other Traits that are available via the dependency Rules of its owning Rule), a set of properties to add to the Actor, a set of accessors/mutators (methods to access those properties that become Blockly blocks), a set of queries (which pull out typically boolean values such as 'Is {Actor} falling?'), and a set of Events that the Trait offers which an Actor can elect to respond to.
For instance the 'Affected by Physics' Trait might give us a 'Apply {x} force to {Actor} in {y} direction' method that would apply an instantaneous force to the internal velocity.
This could be useful for adding jumping, bouncing (inertia), or knockback.

The Gravity Rule then has a single implementation that runs on every simulation tick.
The implementation is code.
That code is to simply go through the list of Actors that have the 'Affected by Gravity' Trait and to add the gravity acceleration to their velocity vectors.
Since the Gravity Rule affects the velocity vector, it needs to run before the Physics or Motion Rule does.
It specifies that it runs "Before Motion" in order to enforce this.
In fact, that's how it defines its 'Tick' implementation.
It does it as a "Before 'Motion' do:" block.
If it does not matter when it happens, it just has a 'Do:' block, but this is likely rare.
You generally need to run before or after something else.

In the case of Gravity, it also has to run "After Collision".
So, it might also have a "After Collision Do:" and for each collected Collision, look to see which are a result of falling and react.

These implementation handlers are called 'Steps'.

Let's say we greatly simplify the toolbox for a student.
We give them a World, a 'Has Gravity' Rule, a way to create a Player or other objects and a map with tiles, and then the 'Affected by Gravity' and 'Acts as Ground' Traits.
We can easily create a platformer if we add one additional method to abstract the 'Apply {x} force to {Actor} in {y} direction' and provide a '{Actor} jumps' method to apply the instantaneous upward force.
By limiting the toolbox and leaning on inherited Rules/Traits, we can scope down the complexity which we can later reveal.
For instance, they might be applying the `Has Gravity` Rule, but later we can show them that is also brought in these lower-level Rules, too, which we can manipulate in various ways.
Further down the line, we can reveal the implementation of the `Gravity` Rule and show them how the systems actually interact and offer to let them build or remix their own rules.
