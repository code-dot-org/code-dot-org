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

## Cameras

The next strategy for dealing with large maps is to introduce an optional Camera
object. The Camera can define what part of the map is visible within the
viewport and how it is scaled, rotated, etc. Effects can also be applied on the
Camera like any other object. When effects are applied, the effect is applied on
the rendered content the Camera is capturing as it is displayed on the screen.

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

## Layers

The introduction of a Camera means that we may need to render the Camera output
independently of other Actors which might not be part of the game scene. We
might want, say, some visualization of our lives or our score. These are part of
the interface and not part of the game world.

Therefore we need different coordinate systems. This is done through a process
of defining 'layers'. In the World, we can `define layer do` and in that section
place actors and load maps. A Layer is useful since it can have effects applied
to it as well. A Camera controls the visibility of the layer it exists within.
The game engine renders all of the layers via their current or default Camera.

The 'background' blocks kind of create this effect as shorthand. However, the
concept of a background is slightly different. Any layer can have a background.
This just tiles an image across the dimensions of that layer. For the
traditional background blocks, this tiles that image across the dimensions of
the default layer behind the actors. You could imagine creating a new layer on
top of the default layer which you can add a 'background' image to in order to
create a foreground effect, like snow or fog. So the idea of a 'background' can
be a misnomer when applied more broadly to other layers.

With layers, you might implement a kind of parallax scrolling. With this, you
would define a background layer, your normal layer which will have your Camera
object, and a foreground layer. You then need to use the Camera events so that
when your camera moves, you appropriately move the Cameras of the other layers
in a way that moves them scaled appropriately for the parallax effect.

Layers complicate the scene graph. When you add an Actor or you load in a map
full of Actors, you need to know which layer these are going to be placed
within. Without specifying, the default layer is always assumed. We need a
`within layer <x> do` block that encompasses blocks and will update that
assumption to the given layer. In this case, we can create a World with two
layers by doing:

```
define world "My World"
  define layer "Background"
  define layer "Foreground"
  define layer "Interface"
  within layer <Background>
    add actor <Player>
    load map <Level 1>
  within layer <Interface>
    load map <HUD>
```

Most actions do not really care about which layer certain actors are within.
This is because you are likely only placing game actors in a game layer,
background elements in a background layer, and user interface widgets in the
user interface and HUD layers.

To capture actors only within particular layers, we will add the added filter
logic of `all actors in layer <layer name via dropdown>` for the array of actors
and `<actor> is in layer <layer name via dropdown>` query.

## Viewport

Finally, we will add a few direct Viewport manipulations. Advanced creators will
have the `set viewport width <x> and height <y>` and associated `get` blocks
which command the size of the screen. These will have sensible limits and error
when the numbers are too large. This will allow students to create experiences
that cover the entire screen or target mobile dimensions.
