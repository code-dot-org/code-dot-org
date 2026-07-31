# The effect editor (`src/effect`)

Part of `@code-dot-org/world-lab`, not a package of its own — read the World
lab's own `AGENTS.md` and `README.md` first, then this.

## Orientation

Read [specs/EFFECT_EDITOR.md](../../specs/EFFECT_EDITOR.md) for what this is
meant to be, the layer table in [README.md](./README.md) for how it is built,
and [specs/EFFECTS_PLAN.md](../../specs/EFFECTS_PLAN.md) for how it is being
wired into the lab.

## Layering is the main constraint

Dependencies run one way only:

```
glsl → model → nodes → compiler → {preview, runtime} → editor
```

(`localization` is a second leaf beside `glsl`: anything may import it, it
imports nothing. It re-exports the mainline
`@code-dot-org/core/plugins/localization` singleton and adds the `{name}`
interpolation adapter.)

`import-x/no-cycle` is an error, so a violation fails lint. Three consequences
that are easy to trip over:

- `glsl/` must stay a leaf. Both `nodes` and `compiler` import it; if it
  imported either back, everything above it cycles.
- Modules inside a layer import each other by file, not through the layer's
  `index.ts`. Importing the barrel from within the same layer creates a cycle.
- **There is no `src/effect/index.ts`, and adding one is a mistake.** Layer
  barrels are what keep the Phaser preview surface free of React Flow: the
  driver imports `../../effect/compiler` and `../../effect/runtime` only. A
  top-level barrel re-exporting `./editor` would let one careless import pull
  the editor into the preview bundle, and nothing would fail — the bundle would
  just quietly grow. (As a standalone package this was enforced structurally,
  by sub-path exports. It is now a rule.)

## Rules that are load-bearing

- **One scope shape serves both levels.** `EffectGraphScope`
  (`{parameters, nodes, edges}`) is what the graph helpers, wiring rules, and
  compiler walker operate on; `EffectDocument` and `EffectFunction` both
  extend it. Editor handlers route through `applyToScope(document,
functionId, op)` — never edit `document.nodes` directly in a handler, or the
  edit lands in the wrong workspace when a function is open. Node ids are
  scoped per workspace (`sine-1` can exist in both), which is why
  `EffectCompileError.functionId` exists and error highlighting checks it.
- **Stock input ghosts are banned inside functions on purpose.** A function
  body may only read its declared inputs; the compiler rejects `@in:*` sources
  there, `insertNodes` drops such wires on paste when
  `stockInputsAvailable: false`, and the function input row simply never
  renders those knobs. Ambient UV/Time would make functions non-reusable and
  the lesson dishonest.
- **Ghost nodes are derived, never stored.** `document.nodes` holds workspace
  nodes only. The input row, output row, and parameter knobs come from
  `src/effect/nodes/ghosts.ts` plus `document.parameters`. Anything that writes a
  `@`-prefixed id into `document.nodes` is a bug.
- **An unwired input port is a literal.** `EffectGraphNode.params` is keyed by
  _port_ id and only consulted when no wire arrives. Do not add a parallel
  "node config" concept.
- **Only scalar-to-vector broadcast is implicit.** Widening `vec2` → `vec3` or
  narrowing `vec4` → `vec3` must stay compile errors. The final output is the
  single deliberate exception, via `visualizeAsColor`.
- **Generic ports never accept a texture.** `portsCompatible` in
  `connectionRules.ts` is the one place this lives, and both the drag
  validation and the wire-drop picker run through it. Letting a sampler into a
  generic port emits GLSL like `(uMainSampler * x)` that only fails at driver
  compile time, far from the learner's mistake.
- **Generated GLSL targets ES 1.00**, matching Phaser 4's own filter shaders:
  `#version 100`, `texture2D`, `gl_FragColor`, and the
  `#pragma phaserTemplate(shaderName)` line the renderer looks for. Do not
  "modernize" it to ES 3.00 without checking what Phaser's renderer accepts.
- **Every learner-facing string goes through `translate` from
  `src/effect/localization` — at render or throw time, never at module load** (the
  mainline engine loads lazily; import-time translation is English forever).
  Templates stay whole with `{placeholders}`; learner-entered names
  (parameters, functions) are spliced in and never translated —
  `src/effect/editor/labels.ts` is where stock-vs-user is decided for labels. The
  editor container's `data-notranslate="true"` keeps the LocalizeJS DOM
  engine off the rendered output.
- **A sticky heading needs an opaque background and a scrollport with no top
  padding.** Both bit the node palette: the theme set
  `MuiListSubheader` to `background: transparent`, so items scrolled _through_
  the category headings, and the palette's own `padding-top` sat above where
  those headings pin, leaving a strip that items painted in regardless. Put
  leading space on the first child, not on the scroll container.
- **MUI must never portal.** Portals mount on `document.body`, outside the
  `data-notranslate` container — translated strings would be re-translated by
  the mainline LocalizeJS DOM engine. Selects are native
  (`slotProps.select.native`), pickers are inline `MenuList`s, and
  `src/effect/editor/theme.ts` sets `disablePortal` defaults on
  Popover/Menu/Modal/Dialog as a backstop. The browser suite asserts no `[class*="Mui"]` element escapes the
  container. MUI is for chrome only; canvas internals (nodes, handles, wires,
  knobs) stay custom CSS because they are zoom-scaled and geometry-bound to
  React Flow.
- **Preview contexts are `premultipliedAlpha: false`.** Graph shaders write
  straight alpha; under the WebGL default, translucent output goes additive
  over the page and animated effects appear to accumulate to white. Do not
  "fix" a washed-out preview with blending state — the context attribute is
  the contract.
- **Swizzles are stored as canonical `xyzw`, never `rgba`.** The RGBA
  spelling is a display choice made from the _source_ type (`vec4` reads as a
  color), and the schema rejects anything else — two spellings of one wire in
  the file format would be two things to keep in sync forever. Narrowing is
  allowed only where the learner picked the component; the compiler still
  never guesses one, and widening stays refused.
- **Ask the compiler what a generic port carries; never re-derive it.** A
  definition can only declare `generic`, so the connection rules take
  `resolvedPortTypes` from the last compile, and fall back to one
  `inspect`-pointed compile for nodes that compile never reached. Do not add a
  second copy of `resolveGenericType` to the editor — the two would drift, and
  the compiler's answer is the one that decides whether the shader builds.
  Resolve the _source_ end only: a generic input's type depends on the wire
  being dragged into it.
- **A resizable node's box goes on `width`/`height`, not `style`.** React
  Flow writes resize results onto those fields, so the document has to
  overwrite the same ones or the stale measurement wins and undo cannot shrink
  the node. `reconcileFlowNodes` holds the live dimensions while
  `existing.resizing` is set, exactly as it holds position while `dragging`.
- **The precision guard is not boilerplate to tidy away.** `highp` is optional
  in fragment shaders and using it unsupported is a _compile error_, so the
  `#ifdef GL_FRAGMENT_PRECISION_HIGH` block must survive into the emitted
  shader — it is resolved on the device that runs it, and a `.effect` is
  played on machines its author never saw. Fold it in the code _view_ if it is
  in the way; never drop it from the output. (It was previously emitted with
  `mediump` in both branches, which asked the question and ignored the
  answer.)
- **`bool` and `int` are authoring constraints, not GLSL types.** Both compile
  to a `float` uniform through `parameterValueType`, which is what keeps a
  switch multipliable and a counter addable without conversion nodes. Anything
  that needs the GLSL type — uniform declarations, ghost port types, function
  argument types, the preview's uniform upload — must map through it;
  `EffectUniformDescriptor` carries both (`type` for uploading, `kind` for
  building UI). Function output types stay numeric (`EffectFunctionOutputType`):
  a function body has no knob to constrain.
- **Annotation is one field, two surfaces.** `EffectGraphNode.note` backs
  both the bubble beside a selected node and the standalone Comment node —
  the Comment node is a note with no ports attached, which is why it needed no
  model of its own. Both edit through `useNoteDraft`; keep new annotation
  surfaces on that field and that hook rather than adding a parallel one.
- **Text fields that feed the shader edit a local draft and commit on blur.**
  Anything in the document reaches the compiled source, and a changed source
  relinks a WebGL program in every open preview. Per-keystroke writes stall
  typing and drop characters as the controlled field chases the document
  round-trip. Notes work this way; hold the same line for any field like it.
- **A node's own statements begin _after_ its inputs resolve.** Resolving an
  input walks upstream and emits those nodes first, so anything that captions
  or brackets "this node's code" — notes today, anything similar later — must
  mark the body position after `resolveInputs`, not before `emitNode`. Marking
  early attributes the whole upstream chain to the node.
- **Error messages are read by learners.** "Nothing is connected to the Output
  yet." not "unresolved edge target". Keep GLSL type names out of them where a
  plain phrase works.
- **Node state belongs to React Flow; run every change through
  `applyNodeChanges`.** React Flow works out `measured` from the DOM and tracks
  `dragging` and `selected` itself. Rebuilding the node array from the document
  each render throws all of that away — and a node without `measured` is "not
  initialized", so React Flow refuses to drag it properly and logs error #015.
  The canvas therefore holds nodes in state and folds the document back in with
  `reconcileFlowNodes`. Never handle only the change types that look
  interesting; `dimensions` is the one that matters most and looks like
  bookkeeping.
- **Edges are still derived, and that is fine** — they have nothing measured.
  But `edges` is a controlled prop too, so an ignored `select` change means no
  edge is ever selected and the delete key does nothing. `toFlowEdges` merges
  that state back in.
- **Positions reach the document on `onNodeDragStop`, not per pointer move.**
  One undo step per drag, and no document churn mid-gesture. Anything that
  writes position during a drag will fight `reconcileFlowNodes`, which
  deliberately keeps the live position while `dragging` is true.
- **React Flow's viewport layers all sit at `z-index: auto`, so they stack in
  DOM order — edges, then edge labels, then nodes.** Nodes therefore paint over
  every wire and every edge label by default. On the stock ripple graph, 32% of
  one wire's length runs behind node bodies, which hides its hit area as well
  as its pixels. Neither `.react-flow__edges` nor `.react-flow__edgelabel-renderer`
  creates a stacking context, so a positive `z-index` on an edge or a label
  competes directly with nodes and wins. `ACTIVE_EDGE_Z_INDEX` raises only the
  wire being pointed at; wires at rest stay under the nodes on purpose.
- **Ghost pinning is paint-deadline work; keep it out of React effects.**
  React Flow moves the viewport with a direct DOM write inside a store
  subscription — no render — so anything compensating for the viewport must do
  the same or it paints a frame late (the original effect-based pinning
  jittered by one pan-step per frame). `usePinnedGhosts` subscribes to the
  store and, in the same synchronous notification, writes each ghost wrapper's
  `transform` straight to the DOM; React state follows with identical values.
  Do not "simplify" this back to a `useEffect` on the transform, and never
  call `updateNodeInternals` per pan frame — handle bounds are flow-unit and
  pan-invariant; re-measure only on zoom change.
- **`autoPanOnConnect` stays off.** React Flow auto-pans connection drags near
  canvas edges — and the ghost dots are pinned to the canvas edge by design, so
  every wire dragged from a row knob starts inside the auto-pan zone. The
  canvas slides out from under the drag and drop-target detection (which is
  screen-space `elementFromPoint` plus cached bounds) misses. Symptom if
  re-enabled: wires from row knobs never land on node ports and the wire-drop
  picker opens instead.
- **`EffectCompileError.nodeId`/`portId` are a contract.** The red node
  outline, port ring, and dashed error wire are all built on the compiler
  blaming an exact location. A new error path must set them.
- **Handles carry an invisible hit pad for touch.** The visible dots are
  ~8-11px on screen at typical zoom — far below the 24px touch-target minimum —
  so each `<Handle>` contains a child span with `inset: -12px` that receives
  the pointerdown and bubbles it up. Drop detection is unaffected (it uses
  `connectionRadius` around the handle's own bounds), and pads must not grow
  past the tightest port spacing (33.6px on a five-input node) or neighbours
  overlap. Touch behavior is tested by driving CDP `Input.dispatchTouchEvent`
  from Playwright — its `touchscreen` API only taps, and synthetic pointer
  events skip the browser's real touch pipeline.
- **Palette drag-to-place does not exist on touch** — HTML5 drag-and-drop is
  mouse-only in browsers. Tap-to-add-mid-view and the wire-drop picker are the
  touch paths; do not "fix" this by replacing HTML5 DnD unless replacing it
  everywhere.
- **Handle geometry must be set inline, never in a CSS module.** React Flow
  positions handles with `.react-flow__handle-bottom` and friends — two-class
  selectors that outrank any single class a CSS module generates, and its
  stylesheet loads after ours. A rule that _looks_ like it moves a handle is
  silently ignored: every handle on an edge stacks at the midpoint, so a Split
  node shows one dot for four outputs and the labels point at nothing. Anything
  affecting `left`/`top`/`width`/`height`/`transform` on a `<Handle>` goes in
  the `style` prop. See `PortStrip` and `GhostFlowNode`.

## Changing the `.effect` file shape

`EFFECT_DOCUMENT_VERSION` (in `src/effect/model/constants.ts`) is written into every
file, and `migrate` in `src/effect/model/schema.ts` runs on every parse _before_
validation — that pairing is the whole mechanism.

While `.effect` files exist only inside this repo, a shape change needs no
ceremony: update the types, the Zod schema, and the fixtures, and leave the
version alone (functions were added to v1 this way). Once files live in
project storage, the procedure becomes:

1. Change the shape in `src/effect/model/types.ts` and mirror it in the Zod schema.
2. Bump `EFFECT_DOCUMENT_VERSION`.
3. Add a branch to `migrate` translating each older version's **raw JSON** to
   the new shape — it runs pre-validation on purpose, so it can reshape
   fields the current schema would reject. Chain migrations stepwise
   (1→2, then 2→3) rather than writing every-version-to-latest.
4. Add a test that parses a literal fixture of the _old_ JSON and asserts the
   migrated result — not a fixture built from current constructors, which
   would silently follow the new shape.

Parsing already refuses files newer than the editor
(`version > EFFECT_DOCUMENT_VERSION`), so forward compatibility is a clean
error rather than a scramble.

## Adding a node type

1. Add the definition to the right file in `src/effect/nodes/definitions/`. Use
   `expressionNode` unless the node needs a local or a helper function.
2. It is picked up by `stockNodeDefinitions` automatically via that file's
   exported array.
3. `type` is stored in `.effect` files. Renaming one breaks saved projects;
   treat it as a migration.
4. Helper functions emitted per resolved type must include the type in their
   name (see `remap`), because GLSL ES 1.00 has no overloading.

## Adding a layer

1. Create `src/effect/<name>/index.ts` as that layer's barrel.
2. Place it in the dependency order above and keep it one-way.
3. Update the layer table in the README.

There is no `package.json` or `vite.config.ts` step: this is a directory of the
World lab, and the lab's build takes it as it finds it.

## Testing

Tests run under the World lab's vitest (`yarn test` from the package root) and
its `src/__tests__/setup.ts`, which stubs `ResizeObserver`,
`DOMMatrixReadOnly`, rAF, and canvas `getContext` — the shims React Flow and
the previews need under jsdom.

They cover the compiler, model, GLSL type rules, and the editor shell. They
cannot cover canvas layout or shader execution: React Flow needs real
measurement and previews need a real GL context. Those are checked in a browser
against `yarn dev` / `yarn dev:isolated`. Do not add jsdom tests that assert
node positions or pixel output — they will only test the stubs.
