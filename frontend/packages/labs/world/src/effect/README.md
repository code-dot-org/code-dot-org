# The effect editor

A node-based editor that compiles `.effect` documents into GLSL fragment
shaders for Phaser 4, and the runtime that plays them. Built for the World lab,
where effects are applied to Actors and Worlds.

The design this implements is in
[specs/EFFECT_EDITOR.md](../../specs/EFFECT_EDITOR.md); the integration work is
in [specs/EFFECTS_PLAN.md](../../specs/EFFECTS_PLAN.md).

> **Status: scaffolding.** The model, compiler, node registry, WebGL preview,
> and editor shell are working end to end. The Phaser filter integration is
> written against Phaser 4.2.1's filter API but has not yet been run inside a
> game — see [Verification status](#verification-status).

This was developed as a standalone package and folded into the World lab, which
is its only consumer. It kept its layering; it lost its package boundary. See
[Layers](#layers) for what that costs.

## Working on it

There is no separate build, test, or dev server: it is part of
`@code-dot-org/world-lab`, so `yarn test` / `yarn typecheck` / `yarn lint` /
`yarn dev` from the package root cover it. `yarn dev` opens the lab, where a
`.effect` in the project opens in this editor — which is where it has to work.
(The generated GLSL is viewable inside the editor itself, via the GLSL toolbar
button.)

## Layers

Each layer depends only on the ones below it, so a host that just needs to
_run_ effects never pulls in React Flow.

| Layer      | Path                  | Depends on            |
| ---------- | --------------------- | --------------------- |
| `editor`   | `src/effect/editor`   | everything below      |
| `preview`  | `src/effect/preview`  | compiler, model       |
| `runtime`  | `src/effect/runtime`  | compiler, model, glsl |
| `compiler` | `src/effect/compiler` | nodes, model, glsl    |
| `nodes`    | `src/effect/nodes`    | model, glsl           |
| `model`    | `src/effect/model`    | —                     |
| `glsl`     | `src/effect/glsl`     | model (types only)    |

**There is deliberately no `src/effect/index.ts`.** As a package, sub-path
exports were what kept React Flow out of a host that only wanted to run
effects. As a directory, the only thing enforcing that is the import graph: the
Phaser driver imports `../../effect/compiler` and `../../effect/runtime` and
nothing else, and a barrel re-exporting `./editor` would let one careless
import drag the whole editor into the preview bundle. Import layers directly.

### `model` — the `.effect` file

A document is a list of workspace nodes, a list of edges, and a list of
parameters. It is validated with Zod on the way in and pretty-printed on the
way out.

The input and output rows are **not** stored in the document. They are _ghost
nodes_, derived from a fixed list plus one per parameter, and their ids start
with `@` (`@in:uv`, `@out`, `@param:strength`). This means a document can never
be missing its output or carry a stale position for something the editor pins
anyway.

### `nodes` — what a learner can place

Each node definition declares its ports and emits GLSL. Ports may be typed
`generic`, in which case every generic port on that node resolves to one
concrete type taken from whatever is wired in — that is what lets a single
`multiply` scale both a brightness value and a UV offset.

An input port with nothing wired into it is a literal: the editor shows a
number field, and the compiler emits its value. There is no separate
"constant" node.

### `compiler` — graph to GLSL

`compileEffect(document)` walks backwards from the output, emitting only nodes
that reach it, and returns a complete GLSL ES 1.00 fragment shader plus a
uniform descriptor per parameter.

Shaders are compiled at `highp` by default, behind the
`GL_FRAGMENT_PRECISION_HIGH` guard that falls back to `mediump` — the same
shape all sixteen of Phaser 4's own shaders use. `highp` is _optional_ in
fragment shaders and using it where unsupported is a compile error rather than
a downgrade, so the choice has to be made by the compiler on the device that
runs the shader: a `.effect` is authored once and played anywhere, and picking
at authoring time would be a guess about someone else's GPU. The default
matters because `mediump` guarantees only a 10-bit mantissa, which by a
hundred seconds in resolves `uTime` to steps of about a tenth of a second and
makes time-driven effects stutter. Asking for `mediump` explicitly emits it
unguarded, since every implementation has it.

Each emitted node becomes one named local (`float sine_1 = sin(add_1);`,
named after the node), so the shader reads top-to-bottom like the graph
instead of collapsing into one nested expression on the `gl_FragColor` line.
Trivially simple results — an identifier, a swizzle, a number — stay inline
rather than becoming noise lines. Naming is also sharing: a node wired to two
consumers is computed once, where inlining would have evaluated it twice.

Passing `inspect: {node, port}` compiles a _different_ shader for the same
graph — one that writes that port's value to the screen. That is what the "eye"
on each node renders, and non-color values are visualized rather than refused
(a scalar shows as grayscale, a UV as red-green).

Implicit conversion is limited to scalar-to-vector broadcast. Narrowing
(`vec4` → `vec3`) and cross-width widening (`vec2` → `vec3`) are compile
errors, so a learner sees a wire problem rather than a silently invented or
dropped component. Narrowing is available _explicitly_ through a wire's
`source.swizzle` — the learner names the component in the picker (see
[Wiring](#wiring)), so nothing is invented on their behalf. The final
output is the one deliberate exception: anything that is not a texture is
accepted and visualized.

### `preview` — WebGL without Phaser

The editor previews shaders in a plain WebGL 1 context, declaring the same
uniforms and varyings Phaser's filters do. Booting a game per node thumbnail
would be absurd; matching Phaser's conventions is what keeps the preview
honest.

Preview contexts declare `premultipliedAlpha: false`, because graph shaders
write straight alpha — a learner's `vec4(color, 0.5)` means half-transparent
color. Under the WebGL default the compositor reads RGB as pre-scaled by
alpha, and any translucent output composites additively over the page: an
animated effect appears to stack frame on frame until the preview saturates
white.

All previews read one shared clock (`previewClock.ts`) rather than measuring
time from their own mount: `uTime` is the engine clock, and in a game every
filter sees the same value. Opening a node thumbnail mid-animation joins the
animation in phase with the output preview instead of restarting it at zero.
`uEffectTime` runs on its own epoch with a real analogue for restarting: the
↻ button above the Effect Time knob plays the effect from its beginning in
every preview at once, exactly as re-applying the effect in a game would.

### `runtime` — Phaser 4

```ts
import {compileEffect} from '../../effect/compiler';
import {applyEffectToActor, registerEffect} from '../../effect/runtime';

const compiled = compileEffect(document);
const effect = registerEffect(Phaser, scene, 'ripple', compiled);

applyEffectToActor(Phaser, fish, effect, {strength: 0.04});
```

Phaser is taken as an argument rather than imported, because the preview
surface loads its own vendored build (`public/vendor/phaser.esm.js`) and this
code must not reach for a second copy.

### `editor` — the React Flow surface

```tsx
import {EffectEditor} from '../effect/editor';

<EffectEditor initialDocument={document} onChange={save} />;
```

Layout is the spec's: a fixed input row, a pannable workspace, a fixed output
row. The rows do not pan or zoom, so `usePinnedGhosts` moves each ghost node to
sit under its knob every time the viewport changes — which is what makes wires
look anchored to the rows while the workspace slides beneath them.

#### The effect's identity

A bar above the workspace holds the effect's **name** and a one-line
**description** — what a host would show beside it in a gallery or picker
without opening it. The name is held to non-empty, like a function's and a
parameter's, since an unnamed effect is an unlabelled row in whatever list
shows it. Clearing the description removes the field rather than storing an
empty string, so a document still round-trips through `.effect` unchanged.

That bar is the main workspace's counterpart to the function bar below, and
they share one slot: inside a function you are editing the function's
identity, not the effect's.

A description is not a Comment node, and the overlap is worth keeping
straight. A description is metadata _about_ the effect, read by something that
has not opened it. Notes and Comment nodes explain the graph to whoever has.

#### Functions

A function is the spec's reusable sub-workspace: it opens as the same editor —
same rows, same wiring, same palette — because a function body has the same
graph shape as the document (`EffectGraphScope`), with its declared inputs
playing the role parameters play in the main workspace. Differences are what
the semantics demand: the input row holds only the function's own inputs (the
stock Texture/UV/Time knobs are deliberately absent — wanting UV means adding
an input and wiring UV into the function's node, which is what teaches real
function thinking), and the output has a declared type set in the header bar.

Each function compiles to a GLSL helper, each use to a call. Compilation is
lazy and recursive, which both orders declarations by dependency and catches
cycles ("A cannot use itself, even through another function"). Compile errors
inside a body are prefixed with the function's name and highlight the offending
node when that function's workspace is open. Deleting a function cascades:
every node that called it, in any workspace, goes with it — and one undo
brings it all back.

#### Wiring

| To do this          | Do that                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| Add a node          | Click it in the palette (lands mid-view), or drag it exactly where you want it     |
| Build from a wire   | Drop a wire on empty canvas and pick from the nodes that can take it               |
| Move a node         | Drag it by its body                                                                |
| Pan the workspace   | Drag the empty canvas                                                              |
| Zoom                | Scroll, or use the controls at the bottom left                                     |
| Connect two ports   | Drag from one dot to another                                                       |
| Rewire an input     | Drag a new wire onto it — inputs hold one wire, so the old one is replaced         |
| **Delete a wire**   | Hover it and click the **×**, or click it and press Delete or Backspace            |
| Delete a node       | Select it and press Delete or Backspace (its wires go too)                         |
| Set a value by hand | Leave an input unwired and type in its number field                                |
| Edit a parameter    | Click its name in the input row — rename, retype, set default and range, or remove |
| Make a function     | "+ New function" in the palette opens its own workspace; ◂ Effect returns          |
| Use a function      | It appears under "Your Functions" — place and wire it like any node                |
| Duplicate nodes     | Select them and press Ctrl+D — copies arrive offset, still fed by their inputs     |
| Copy / paste        | Ctrl+C snapshots the selection; Ctrl+V pastes it, staggering on repeat             |
| Get an overview     | The minimap (bottom right) — drag inside it to pan, scroll it to zoom              |
| Undo / redo         | Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y), or the ↶ ↷ buttons over the canvas              |
| See the GLSL        | The **GLSL** button by undo/redo opens the live compiled shader beside the canvas  |

Duplicating or pasting copies the wires _between_ the chosen nodes and the
wires _into_ them — from other nodes, input knobs, or parameters — so the
piece arrives working. Wires _out_ of the selection are not copied: an input
holds one wire, so copying them would steal the original's connections. The
clipboard is a snapshot, not a reference — pasting works even after the
originals are deleted, and a pasted wire whose source has since vanished is
dropped rather than left dangling.

A parameter's type is picked from six: **number**, **whole number**, **on or
off**, **2D value**, **color (RGB)**, and **color (RGBA)**. The first three are
all a `float` uniform underneath — `bool` and `int` are constraints on how the
knob is _edited_, not new GLSL types. That is the point: a switch that stays a
float can be multiplied straight into a value to turn a feature on and off,
with no conversion node in between, and a whole-number knob can be added to
anything a number can. `uniform bool` would need converting at every use.

The editor is what enforces the constraint. A switch shows a toggle in the
input row and a "Starts on" checkbox in its editor, with no range to set; a
whole-number knob gets a slider that steps and snaps to integers (with visible
marks for short ranges) and integer-only min/max fields. Each slider prints its
current value above itself, with decimals fixed by the step rather than the
number — `0.020` and `0.100`, so the figure keeps a steady width while it is
being dragged instead of shoving the column around. Switches have no readout:
the toggle already is one. A new switch starts
**on**, so wiring one in to gate a feature does not silently turn that feature
off. Games may pass either form: `{glow: true}` and `{glow: 1}` both work.

Adding a parameter opens its editor immediately, because the default name is a
placeholder and the name matters: it becomes the `.addEffect()` argument, the
min/max become the consumer's slider bounds, and the hint is the description a
host can surface. Changing a parameter's type resets its default to the new
shape and recolors its pin and wires. A float parameter also gets a
vertical try-out slider standing above its pin — editor-only, driving the
previews, never written to the document. Removing a wired parameter is safe —
the inputs it fed fall back to their own number fields.

A drag is one undo step: the position reaches the document when the drag ends,
not on every pointer move.

Any node can carry a **note** explaining what it is doing at that point in the
effect — the graph's own commentary, and the natural place for an assistant to
leave an explanation. Select a node and the slot to its left holds either the
note or, when there is none, the button that starts one; deselect and the
annotation is gone, because a graph with every bubble on screen at once is
unreadable and the question "what is this bit doing?" is one you ask about the
thing you just clicked. Clearing the text deletes the note, so the button
comes back and no empty bubble is ever stored.

Notes are carried into the compiled shader as line comments above that node's
own statements — which is what makes the generated GLSL readable as an
explanation rather than only as code:

```glsl
    float add_1 = (multiply_1 + uTime);
    // Bends the travelling value into a smooth wave, so the ripple rolls.
    float sine_1 = sin(add_1);
```

Line comments, never block comments: nothing a learner (or a model) types can
close the comment early and spill into the shader as code.

The code panel opens on the effect itself — uniforms, helpers, and `main()` —
with the version, the Phaser pragma, and the precision guard folded behind a
"show the 7 setup lines" toggle. Those lines are true of every effect and say
nothing about this one, but they stay in the compiled shader: the guard has to
reach the device that runs it. `splitShaderPreamble` finds the boundary
structurally (leading blank, `#`, and `precision` lines) rather than by
counting, so it keeps working when the preamble changes shape.

A **Comment** node (Utility, in the palette) is the same note with nothing
attached to it: no ports, no header, always visible. It is for what a graph
needs to say that does not belong to any one step — what the effect is for,
what to try next, why a branch was left in. Having no ports means nothing can
wire to it, so the demand-driven walk never reaches it and it contributes
nothing to the shader; unlike a per-node note, editing one does not even
change the compiled source.

A Comment is arranged rather than wired, so it drags from anywhere on its face
and resizes from any corner once selected (both are one undo step, committed
when the gesture ends). Its box is stored on the node, which is why the flow
node carries explicit `width`/`height` rather than only a `style`: React Flow
writes the resized dimensions onto those same fields, and setting just the
style left the old measurement in place where an undo could not shrink it
back.

Because a note _is_ part of the shader, typing one is held locally and
committed when editing finishes. Writing per keystroke recompiled the effect
and relinked a WebGL program in every open preview on every character, which
both stalled and dropped characters as the controlled field chased the
document. One edit is now one document change, one recompile, and one undo
step.

Wires draw in the color of the value they carry — the same palette as the port
dots and the pins under the row labels, so an input can be followed by hue
from its pin to every place it is used. Each row entry is a name with a single
colored pin at the canvas seam beneath it — the pin _is_ the connection point,
so there is no second dot to mistake for one. The compiler supplies the real
types: a generic math node passing a color along draws a vec4 wire, not a gray
one. Color is never the only cue — every pin and label names its type on
hover, and ports are labelled on the node.

A wire can narrow the value it carries. Drop a color on a port that takes a
single number and the drop is accepted, then a menu opens **at the connection
point** asking which component was meant — R, G, B, A off a vec4, X/Y/Z/W off
anything narrower. Nothing reaches the document until the answer is complete,
so cancelling (Escape, the backdrop, or the Cancel button) leaves the graph
exactly as it was; typing the letter works too. The choice is stored on the
wire's source end, which means the same output can feed a color to one node
and a single channel to another without a helper node in between.

A port that wants several components asks the same question once per slot, in
order, and commits as soon as the last one is answered — so a `vec4` landing
on a `vec2` UV port is two clicks (or two keystrokes), with **Back** to undo a
slot. Order is the point: `.zy` is not `.yz`, and a menu listing every ordered
pair would be unreadable long before it was complete. Any component may be
used in any slot, including twice — that is a choice about real data, unlike
widening.

Afterwards the wire says what it did: a badge at the target end names the
components, and the wire draws in the color of what it now _delivers_ — a
narrowed color wire is number-blue, while the dot it leaves keeps its own
vec4 pink. That change of hue at the source dot is the signal that something
was taken out.

Generic ports take part in this. A `multiply` declares its ports `generic` and
becomes whatever the graph makes it, so the editor asks the compiler what a
particular node is carrying _right now_ rather than reading the word
"generic" — a Multiply that resolved to a vec2 offers X and Y like any other
vec2. Nodes the output does not reach yet have no resolved type, so a drop
from one compiles once with `inspect` pointed at that port to find out; that
happens on drop, never during a drag. Resolution is consulted for the source
end only — a generic _input_'s type depends on the very wire being dragged
into it, so resolving it would be reasoning in a circle.

If a generic source later narrows below what its wire picks out, the wire says
so ("This wire takes Z from a value that only has XY"), blamed at the input it
lands on. Narrowing all the way to a single number is the forgiving case: a
scalar has exactly one value to give, and GLSL will not let a component of one
be named at all, so the selection is simply carried through.

This is the one place narrowing is allowed, and only because it is explicit.
The compiler still refuses to guess a component on its own, and widening is
still refused outright — no menu could invent the third component of a `vec2`.
Component letters are display only: the `.effect` file always stores canonical
`xyzw`, so a wire has exactly one spelling on disk.

Pointing at a wire highlights it and lifts it above the nodes it runs behind,
so its delete button is reachable even where the wire itself is buried. Wires
at rest stay under the nodes, which is what keeps a dense graph readable.

Deleting a wire is not an error state: the input it fed falls back to its own
number field, so the effect keeps compiling. An input with no literal to fall
back to — the Sample node's texture — reports what it needs instead.

When the graph cannot compile, the error is drawn where the problem is: the
blamed node gets a red outline with the message printed on it, the named port
gets a red ring, and — when the error is about a wire — that wire draws dashed
red over the nodes it crosses. The output row still shows the message, but the
learner no longer has to hunt for the place it means. Errors that live in the
rows (nothing wired to the Output) appear beside the Output knob as before.

Impossible connections are refused while you drag rather than accepted and
failed at compile time — and the refusal explains itself. Hovering an
incompatible port shows a hint naming what the wire carries, what the port
wants, and the node that converts between them when one exists ("This wire
carries a 2D value, but "X" takes a number. Split can pull a single number out
of it."). The same rules drive the drag validation, the hint, and the
wire-drop picker, so the three never disagree. The wire-drop picker is the same rule turned inside out: it
lists only nodes with a compatible port, so a texture wire offers exactly
Sample, and picking one places the node already connected — a single undo
step. It works in both directions, forward from an output or backward from an
input.

#### Touch

Verified under real touch input (Chrome's touch event stream, not synthetic
clicks): one-finger pan with the rows staying pinned, pinch zoom, tap-to-add
from the palette, node drags, handle-to-handle wiring, the wire-drop picker,
the refusal hint mid-drag, and tap-a-wire → tap-the-× deletion. Handles carry
an invisible finger-sized hit pad (~25px effective at typical zoom) so drags
can start without pixel-perfect aim; the visible dots stay small.

One known gap: dragging a palette entry to a position uses HTML5 drag-and-drop,
which browsers do not provide for touch — tapping the entry places the node
mid-view instead, and the wire-drop picker covers precise placement.

#### UI framework

The editor chrome — palette, popovers, form controls, buttons, sliders — is
MUI (Material UI 7 + Emotion, from the workspace catalog), themed by a nested
`ThemeProvider` (`src/effect/editor/theme.ts`) that composes under the host's
`CdoTheme`. Canvas internals (nodes, wires, handles, knobs) stay purpose-built
CSS: they are dense, zoom-scaled, and geometry-bound to React Flow in ways MUI
components are not.

A button here is a design-system button: every `Button`/`IconButton` names a
`variant` and a `color` that `CdoTheme` styles (`contained`/`outlined`/`text` ×
`primary`/`secondary`/`tertiary`/`error`), and the editor's theme adds only
density (`size="extraSmall"`). Icons are `FontAwesomeV6Icon`, including inside
the canvas's own custom buttons — a node's inspect eye, a wire's delete, a
note's bubble — which stay custom for their geometry, not for their glyphs.

Form controls are DSCO: `TextField`, `SimpleDropdown` (a native `<select>`, so
it cannot portal), and `Toggle`. MUI keeps what DSCO has no answer for — the
layout and surface components (`Paper`, `List`, `MenuList`) and the _vertical_
try-out slider, which has no DSCO equivalent and whose orientation is what lets
it stand in the tall input row beside the knob it feeds. `LiteralInput` stays a
bare `<input>` for the same reason it always was: it is the number widget on an
unwired port, sized to a node and used two to four at a time.

Two things follow from DSCO fields being built for full-width forms. Their
wrapper is `min-width: 18.75rem`, which is wider than the palette, the bars, or
the parameter popover — each overrides it by specificity, as the map editor's
inspector does. And their labels follow the lab's `data-theme` while MUI's
`Paper` does not (`CdoTheme` declares no dark color scheme), so every popover
paints its own surface from `--effect-editor-*` rather than taking Paper's
default — otherwise a dark-mode popover is a white panel with white labels.

One hard rule: **no MUI component may portal**. Portals mount on
`document.body`, outside the `data-notranslate` container. Selects are native
(`slotProps.select.native`), menus are inline `MenuList`s, and the theme sets
`disablePortal` defaults on Popover/Menu/Modal/Dialog as a backstop — the
test-texture picker is a `Dialog` that renders inline for exactly this reason.

#### Localization

Every learner-facing string — palette entries, node and port labels, compile
errors, tooltips, ARIA labels — goes through `localization.translate` from
`src/effect/localization`, which re-exports the mainline
`@code-dot-org/core/plugins/localization` singleton and adds one thing on top:
`translate(text, vars)`, which fills in `{name}` placeholders _after_
translation. Templates therefore stay whole for translators
(`"{name}" needs a texture wired into it.`), and learner-entered names
(parameters, functions) never reach translation at all. Strings translate at
render or throw time, never at module load, so a locale arriving after import
still applies.

The editor container carries `data-notranslate="true"` so the LocalizeJS DOM
engine never re-translates output that was already translated at the string
level.

## Shader contract

Generated shaders declare exactly what Phaser 4 filters provide, plus our own
clocks:

| Symbol         | Kind    | Meaning                               |
| -------------- | ------- | ------------------------------------- |
| `uMainSampler` | uniform | Texture being filtered (Phaser)       |
| `outTexCoord`  | varying | Interpolated UV (Phaser)              |
| `uTime`        | uniform | Seconds since the game started        |
| `uEffectTime`  | uniform | Seconds since this effect was applied |
| `uResolution`  | uniform | Target size in pixels                 |
| `uParam_<id>`  | uniform | One per declared parameter            |

Unused uniforms are stripped by GL drivers, so `getUniformLocation` returning
null is expected; `compileEffect` reports which parameters are actually read
via `parameters[].used`.

## Verification status

| Area                                   | Status                            |
| -------------------------------------- | --------------------------------- |
| Compiler, model, GLSL type rules       | Unit tests (`yarn test`)          |
| Parameter/uniform marshalling          | Unit tests                        |
| Ghost/document → React Flow mapping    | Unit tests                        |
| Editor shell, palette, error surfacing | Unit tests (jsdom)                |
| Canvas layout, wires, ghost pinning    | Headless Chromium, by screenshot  |
| Live WebGL preview rendering           | **Only under SwiftShader so far** |
| Phaser filter integration              | **Not yet run in a game**         |

Ghost pinning is the part most likely to look broken, so it was measured
directly rather than eyeballed: with the viewport panned by (−400, −120) and
zoomed from 0.75 to 0.33, every ghost held its exact screen position on its
knob's centre. `toFlowNodes` is unit-tested for the mapping that makes that
possible.

The Phaser integration is written against Phaser 4.2.1's `BaseFilterShader` and
`Filters.Controller` and typechecks against its shipped types, but has not been
run inside a live scene — that is Phase 3 of
[specs/EFFECTS_PLAN.md](../../specs/EFFECTS_PLAN.md). The renderer it needs is
in place: Phase 0 moved the World preview from Canvas to WebGL.

Note that the two jsdom-flavoured rows above are honest about their limits.
Canvas layout cannot be unit tested — React Flow needs real measurement and
previews need a real GL context — so `src/__tests__/setup.ts` stubs both, and a
test asserting node positions or pixel output would only be testing the stubs.

## License

Covered by the monorepo's `LICENSE`, like the rest of the repository. This
code carries no Proprietary Materials (artwork, sounds, video, fonts) — the
test textures are drawn procedurally — so that file's preamble about them has
nothing here to carve out.
