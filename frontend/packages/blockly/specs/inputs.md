# Notch shapes

Three input plugins (DEF-24), each of which gives a connection type its own
notch: the shape drawn where a value block's output meets the input it
plugs into.

## Why they exist

Blockly draws every value connection with the same puzzle tab. A lab whose
blocks pass values of custom types (Sprite Lab's sprites, behaviours and
locations) wants each type to look different, so that a student can see
which block fits where before trying it. A notch shape is drawn by the
renderer, so the package delivers shapes as input plugins, which the
renderer is built from (DEF-34, DEF-35).

## The shapes

INP-1. `RectangleInputPlugin(check)`, `RoundInputPlugin(check)` and
`TriangleInputPlugin(check)` each return an input plugin for the
connection type named `check`, with the shape name `RECTANGLE`, `ROUND` or
`TRIANGLE`.

INP-2. Each plugin's `makePath(shapeNumber)` is called with `this` bound to
the renderer's constants provider (DEF-36). With `w` and `h` the provider's
`TAB_WIDTH` and `TAB_HEIGHT`, it returns
`{type: shapeNumber, width: w, height: h, pathUp, pathDown}`. `pathUp` is
the notch drawn going up the block's edge and `pathDown` going down; each is
the mirror of the other.

INP-3. The rectangle is three straight lines, relative to the edge: left by
`w`, up by `h` (down for `pathDown`), right by `w`.

INP-4. The round notch is one cubic Bézier curve, relative, with control
points (−1.5`w`, 0) and (−1.5`w`, −`h`) and end point (0, −`h`); for
`pathDown`, `h` is negated.

INP-5. The triangle is two straight lines: to (−`w`, −`h`/2), then to
(`w`, −`h`/2), relative, which makes a point; for `pathDown`, `h` is
negated.

INP-6. The three paths are those of apps' `cdoConstantsProvider`, which
draws Sprite Lab's `Sprite` connections with the triangle, `Behavior` with
the round notch and `Location` with the rectangle.

## Using them

INP-7. A lab passes a shape's plugin, made with its own type name, to a
Driver, a `BlocklyWorkspace` or a `BlocklyProvider` among its `plugins`.
A value connection whose first `check` is that name is drawn with the shape
(DEF-37); statement connections never are. A block declares the type
through `output` and an input through `check`; neither knows the shape.

INP-8. The shape is fixed when a workspace acquires its renderer (DEF-35),
so a shape registered after a workspace is injected does not reach that
workspace.

## Test vectors

Under thrasos `TAB_WIDTH` is 8 and `TAB_HEIGHT` 15.

INP-V1 (INP-3). The rectangle's `pathUp` is `" l -8,0  0,-15  8,0 "` and
its `pathDown` `" l -8,0  0,15  8,0 "`.

INP-V2 (INP-4). The round notch's `pathUp` is
`" c-12, 0 -12, -15 0, -15 "` and its `pathDown`
`" c-12, 0 -12, 15 0, 15 "`.

INP-V3 (INP-5). The triangle's `pathUp` is `" l -8,-7.5  8,-7.5 "` and its
`pathDown` `" l -8,7.5  8,7.5 "`.

INP-V4 (INP-7). A provider given `RectangleInputPlugin('Location')` draws a
value connection checked `['Location']` with INP-V1's paths.

## Not specified here

- How shape numbers are assigned and connections matched: `definitions.md`,
  DEF-36 and DEF-37.
- Which connections may join, which is the connection checker's business,
  not the notch's.

## Open questions

1. INP-6: the Sprite Lab port (`frontend/packages/labs/sprite`) passes none
   of these, so its sprite, behaviour and location sockets have Blockly's
   puzzle tab, where apps' have their own shapes. Should it pass them?
