# Effect Editor

An **Effect** is a visual transformation that is created as a series of
modifications to a set of images. These allow interesting graphical indicators
and cool effects.

## How Effects Actually Work

In a video game, different visual effects are constructed using "Shaders". In
reality, shaders are a variety of things and really only refer to the one
particular programming model that could be used. They are compiled to code that
runs on the GPU.

There are a couple of languages that one could use to write a shader in order to
write one of these visual effects. The prominent one in the case of Phaser and
similar web-based tooling is going to be GLSL. Therefore, we need to compile our
visual language to GLSL at the end of the day.

GLSL and the shader logic on the GPU in general is a programming paradign that
is somewhat different from the traditional programming paradigm and certainly
quite different from the model that JavaScript is expecting. It is a vector
programming model. It is running one function (your GLSL script) a million times
at once: once for each individual pixel of your image. Thinking about writing
your function to work from the perspective of the pixel and having it work no
matter which pixel it happens to be computing is quite unique.

To do this task, a GLSL function is given a UV coordinate (a 2D vector) that
describes which pixel it is deciding and the function will output a 4D vector
representing the color (red, green, blue, and alpha, typically). Other input it
may receive is a timestamp of the engine so it can react to the passing of time
and potentially a timestamp relative to the beginning of any hypothetical
animation, so it can have effects that are one-shot rather than continuous. Any
other input is any individual GLSL parameter written as such in the script. With
this, a GLSL script might allow for a 'knob' that can be optionally applied to
change some aspect of the effect.

## The Effect Editor

In our system, we will have an `.effect` file which will represent a particular
serialization of a node-based graph that represent the effect. This graph will
be just-in-time compiled into GLSL which is fed into the Phaser application and
run within the sandbox.

We can elect to allow GLSL files, but it's likely best to start with the more
limited interface and scope the potential effects we allow to those able to be
expressed by the tooling.

The tool itself when you open an `.effect` for editing will be a node-based
graph editor. Likely, this will be powered by LiteGraph, an open-source graph
editor that others have used successfully to do similar visualization of shader
code.

We will assume we have vertical space rather than horizontal space for our
default layout in the editor. The goal is of any Effect is to transform some
input texture into some output texture of the same size. This is the guaranteed
input and eventual output of the Effect. To represent this, we will have two
rows representing input and output, respectively. The input will be on the top
with a square showing the testing texture and a knob with which a connection to
a graph node could be made. The bottom row will show the output texture with a
knob with which to connect the output of the computation to finalize this as the
output of the Effect script. The input texture can be a variety of defaults that
are useful for testing and can be switched by the learner via a button near that
input box. The output will show the resulting visualization in real time, if
possible.

In-between is the editor workspace. This is pannable and zoomable without
affecting the positions of the input and output rows and their nodes. Those are
always visible for reference. If anything is connected to the input or output,
those wires are simply obscured if panned out of view. Basically, there are
ghost nodes that represent the static input and output nodes that hold those
wires in place and they move, when necessary to ensure they are in the positions
of the actual visual input and output node boxes at the top and bottom of the
editor workspace.

## Effect Nodes

The input and output are connected via any number of nodes that provide useful
transformations or computations. Using the graph node system, wires are made
between and among all of these nodes. Connecting some input to any node will
power that node and it will then produce some useful output that could be fed to
the next node or to the actual output of the Effect itself.

Nodes are very typical types of image processing nodes and there will be quite a
few stock ones to choose from. For instance, `sine`, `multiply`, `clamp`, etc.
To pull a color out of a texture, there will be a `sample` node that takes the
UV coordinate and a texture (for instance the input texture).

Functions are essentially created by using whatever process our graph engine
provides for creating a separate named sub-workspace so the individual can make
a reusable node of their own.

## Visualizing Intermediates

One useful tool will be the inner node inspection. Here, we can take any point
of our tool and see what the generated image looks like at that point of the
graph. If we, say, had a graph set up to take the UV and calculate the distance
to the center, then inspecting at that point would show us a nice radial
gradient.

We can do this by adding an 'eye' button on any node in the main workspace and
expanding the node to show the visualization in real time. It would have to
essentially compile the GLSL shader code where it returns the output value of
this node instead of continuing or somehow record it to another texture before
continuing execution of the rest of the GLSL.

Either way, this is a nice feature to have so that what is happening within the
shader is more visible to the beginner.

## Parameters

To facilitate more expressive effects than otherwise possible, the Effect can
elect to include parameters. These are additional nodes that are introduced into
the graph workspace from the input row. So, additional little nodes in that row
that can be connected to by other nodes in the workspace. These could be vectors
or values that need to be configured by the consumer of the Effect.

Let's say we wanted a strength value to dampen the scale for which the effect is
applied. We could add a "number" as an input, have it default to 1, have it
constrained to 0 to 1, and then wire that up to a multiply in the effect itself.

One stock parameter would be the overall engine runtime. This is to power
continous effects that animate over time. This is just an monotonically
increasing number.

## Applying Effects

Effects are set on an Actor or on a World (eventually on the Camera). When
applied to the Actor, they are effects that are played on the Actor image. When
applied to the World, they are effects that are played on the entire viewport.
For instance, maybe we have an underwater World, so we have a kind of water
distortion effect being used to give that impression.

These are applied by an `add effect <name>` block — `to <actor>` for an Actor,
`to the world` for a World — and both respond to the `.addEffect()` call.

One block covers both describing and doing. Under `define actor` the target is
the template, so every instance is born wearing the effect; inside an event
handler the same block reaches a live actor. `ActorBuilder.addEffect` and
`Actor.addEffect` take the same arguments and mean the same thing (likewise for
the World pair), and both contexts bind the same identifier, so the generated
call is right either way. There is no separate declarative block.

`remove effect` is the exception: it is runtime-only, because un-declaring an
effect on a template described once has no meaning.

Supplying arguments is tricky. The `add effect` block has to dynamically expand
to offer the possible arguments and their defaults.

A parameter that declares bounds gets a slider rather than a number box. The
bounds are already in the `.effect` file — the editor's own parameter controls
use them — and a plain socket throws them away, leaving a learner typing into a
range they cannot see, where 0.35 and 0.035 look equally plausible and one of
them does nothing.

The slider is `world_slider`, seeded as the socket's shadow, so it can still be
replaced by dropping a getter or an expression on top of it like any other
shadow. It is drawn in the block, not in a popup: the track sits at the left of
the field and the number to its right, and the thumb is dragged in place. That
order is deliberate — the number's width changes with its value, so with the
track on the right it would slide out from under the pointer mid-drag.

A `vec3` or `vec4` parameter is a colour by the model's own convention — the
editor names a vec3 "color (RGB)" — so it takes a colour socket rather than
three number boxes. Nobody picks a colour by typing three floats, and
"0.53, 0.27, 0.08" says nothing about what it looks like. The socket's shadow is
Blockly's stock `colour_picker`, seeded with the parameter's declared default
converted to hex.

The picker is deliberately the stock block rather than one of ours. Its output
type is `Colour`, and so is `colour_random`'s and `colour_blend`'s, so all of
them drop into the same socket. What makes that work is that the conversion
from `#rrggbb` to the floats a uniform wants happens in the _generated code_ —
`WorldLab.rgb("#ff8800")` — rather than inside the block. A bespoke picker that
emitted floats directly would have shut that door for no gain.

A `vec4` takes the SAME single socket. A picker cannot express alpha, so the
swatch it seeds simply means opaque, which is what choosing a colour from a
swatch is understood to mean. Reaching the fourth channel means swapping the
picker for the `r g b a` block — four sliders, one per channel — which fits the
socket because it also outputs `Colour`. One socket to understand instead of
two, and alpha sits with the other channels rather than orphaned beside them.

That block is also the answer to the other thing a picker cannot do: drive a
channel from something that is not a constant — a variable, a query, a bit of
arithmetic. It hands its channels over as floats rather than as hex, which is
why `rgb`/`rgba` accept either. Going through hex would drop the alpha and
quantize every channel to 8 bits for nothing.

The block leads with a colour swatch, which does double duty. It shows what the
four channels currently add up to, live as they are dragged — four numbers tell
you the channels and nothing about the colour, and until the swatch existed the
only way to see the result was to run the game. Clicking it opens the same grid
of presets the plain picker offers, and picking one writes the channels, so a
learner can start from "green" and adjust rather than having to reach green by
arithmetic.

The sockets are the truth and the swatch never overrides them. A preset writes
to the channels and the swatch is then re-derived from what they actually hold,
so a channel driven by something unwritable — a variable, a query, arithmetic —
keeps it, and the swatch visibly disagrees with what was picked. That is honest
feedback about which channel is owned elsewhere, and it beats discarding the
learner's block without saying so. For the same reason a channel the swatch
cannot read is shown as 0 rather than blanking it: the block that owns it is
right there to see. The swatch also ignores alpha, which is what a swatch is.

Channels are 0–1, matching the shader and the numbers in the `.effect` file
rather than the 0–255 a learner may know from elsewhere. The sliders are what
makes that workable: setting a colour by dragging needs no knowledge of the
convention, and a learner who opens the effect afterwards finds the same
numbers there.

A `vec2` keeps its pair of number sockets: it is a direction or an offset, not
a colour.

The socket layout for each parameter type is one definition (`paramSockets`),
read both by the mutator that builds the sockets and by the generator that
reads them back. They were separate lists that had to agree.

Values snap to a step derived from the range (about a hundred positions across
it, rounded to 1, 2 or 5 times a power of ten), which is finer than the track
can resolve and coarse enough that every value reads cleanly. The step governs
the typed value as well as the dragged one: a knob whose slider snaps to 0.02
but whose text box accepts 0.0234 would be showing a value its own control
cannot express. These arguments are then
supplied when the Effect is assigned to the Actor or World (or Camera).
Updating the Effect is tricky and will be deferred for just setting parameters
on assignment.
