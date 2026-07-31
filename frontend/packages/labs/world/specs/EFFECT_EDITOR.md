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
to offer the possible arguments and their defaults. These arguments are then
supplied when the Effect is assigned to the Actor or World (or Camera).
Updating the Effect is tricky and will be deferred for just setting parameters
on assignment.
