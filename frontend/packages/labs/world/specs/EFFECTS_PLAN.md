# Implementation Plan: Effects

The design is in [EFFECT_EDITOR.md](./EFFECT_EDITOR.md). This is the work to
get from today's tree to a learner dragging `use effect Ripple` under
`define actor` and seeing the fish wobble.

## 1. Goal

The first deliverable is one vertical slice:

- a `.effect` file in the project, edited in a node graph inside Codebridge;
- a `use effect <name>` block under `define actor`;
- the compiled GLSL running as a Phaser filter on that actor's image.

Parameters, World and Camera effects, and runtime re-assignment are out of
scope here (§12).

## 2. What already exists

`~/phaser-glsl-editor` is the editor, developed standalone as
`@code-dot-org/effect-editor` and layered so that a host which only _runs_
effects never pulls in React Flow:

| Layer      | Source         | What it gives us                        |
| ---------- | -------------- | --------------------------------------- |
| `model`    | `src/model`    | `.effect` parse/serialize (Zod)         |
| `glsl`     | `src/glsl`     | value types, uniform symbols            |
| `nodes`    | `src/nodes`    | the node registry a learner places from |
| `compiler` | `src/compiler` | `compileEffect` → GLSL + uniforms       |
| `preview`  | `src/preview`  | WebGL 1 preview, no Phaser              |
| `runtime`  | `src/runtime`  | `registerEffect`, `applyEffectToActor`  |
| `editor`   | `src/editor`   | `<EffectEditor>` React surface          |

Its `docs/moving-into-code-dot-org.md` carries the monorepo checklist. Its
README carries the verification table; the two rows that matter to us are
"live WebGL preview — only under SwiftShader" and "Phaser filter integration —
**not yet run in a game**". Every phase below that touches Phaser is therefore
verification work as much as it is integration work.

World lab already has an `effect` entry in `fileIcons` (`src/config.ts`), left
there when the file type was anticipated.

## 3. Decisions

**An effect attaches through a builder call, not a trait.** `ActorBuilder`
grows `useEffect(path, doc)` beside `useTraits` / `set` / `on`. An effect is
appearance-of-the-drawing, not simulated state: it declares no property, runs
no step, and reads nothing from the world. Modelling it as a rule would mean a
rule with no step and a property store that has no list-of-object type. The
cost is that `use effect` is not gated behind a `use rule` the way `set sprite`
is gated behind the appearance trait; we accept it.

**The graph compiles to GLSL at runtime, in the preview surface.** A `.effect`
travels through the bundle as JSON — the same treatment `.anim` gets — and
`PhaserBinding` calls `compileEffect` where Phaser already is. This keeps the
Blockly generator ignorant of GLSL, keeps one compile path shared with the
editor's own live preview, and turns a malformed graph into a runtime engine
error rather than a bundle failure.

**The block is `use effect`,** joining `use trait` / `use rule` /
`use animations` rather than standing apart from them.

**The editor is a directory of this package, not a package of its own.** It
lands at `src/effect/`, keeping its layer directories. World lab is its only
consumer, and a `workspace:*` package for one consumer buys a second
package.json, a second lint config, a second test run, and a `dist` that the
dev server has to be aliased around. The layering is what has value, and the
layering survives a directory move — if a second lab or Codebridge itself
wants the editor later, extracting it is `git mv` plus a package.json.

## 4. Phase 0 — Canvas to WebGL — DONE

Nothing else could land first: `registerEffect` throws
`'Effects need the WebGL renderer; this game is running on Canvas.'` when
`renderNodes` is absent from the renderer.

`src/runtime/driver/PhaserBinding.ts`:

- `type: Phaser.CANVAS` → `Phaser.WEBGL`. Not `AUTO`: a silent fallback to
  Canvas on a machine without WebGL turns every effect into a thrown error from
  deep inside the driver, which is a worse failure than refusing to boot. A new
  `assertWebGL()` probes for a context before the game is constructed and
  throws a sentence; the preview surface already reports a constructor throw as
  an engine error.
- `installSkewHook` wraps the object's `renderWebGL` instead of its
  `renderCanvas`. Both `ImageWebGLRenderer` and `RectangleWebGLRenderer` thread
  their fourth argument into the transform the way Canvas does (`Submitter.run`
  and `GetCalcMatrix` respectively), so the shear matrix `M = T(c)·shear·T(-c)`
  is unchanged.

**Two places must be patched, not one.** This was not in the original plan and
is the substantive difference between the renderers. Canvas resolves the hook
at draw time (`child.renderCanvas(...)`), so replacing the instance property
sufficed. WebGL does not: the GameObject constructor runs
`addRenderStep(this.renderWebGL)` (`GameObject.js:279`), capturing the
_function value_ into `_renderSteps`, and the display list dispatches through
that list (`ListCompositor.js:94` → `renderWebGLStep`). An instance property
replaced afterwards is never reached. Worse, `Filters.enableFilters()` locates
its insertion point with `_renderSteps.indexOf(this.renderWebGL)`
(`Filters.js:285`), so if the property and the captured entry disagree the
filter step is spliced in at `-1`. Effects call `enableFilters()`, which makes
this load-bearing for Phase 3 rather than a detail. Both now hold the same
wrapper reference.

`src/runtime/driver/frameThumbnail.ts` draws into a 2D canvas of its own and
was not affected.

**Verified in Chromium** (SwiftShader), against the running `dev:isolated`
servers:

- the game canvas reports a WebGL 1 context and no 2D context;
- the default project renders — textured images, spritesheet cells, the
  platform, and the FIT letterbox;
- a throwaway probe page installed the hook exactly as the driver does and
  confirmed it is invoked (130 calls over ~65 frames × 2 objects — zero without
  the `_renderSteps` patch), that `indexOf(renderWebGL)` finds it at index 0,
  and that a 30° skew shears both a textured Image and the fallback Rectangle
  into parallelograms about their centers.

A canvas readback (`drawImage` off the game canvas) reports blank and is not a
usable check: `preserveDrawingBuffer` is false, so the buffer is cleared once
composited. Capture through the compositor — a Playwright page screenshot —
instead.

The same-reference invariant between `renderWebGL` and its `_renderSteps` entry
fails silently in both directions, so it is not left to a browser check.
`installSkewHook` was extracted from the `PhaserBinding` constructor into
`src/runtime/driver/skew.ts` — it takes the object and a `matrixFor` lookup, so
the matrix math stays with the caller and the module needs neither a GL context
nor Phaser (its only Phaser import is `import type`). Nine tests in
`__tests__/skew.test.ts` cover it against fakes shaped like a Game Object; six
of them fail if the `_renderSteps` patch is removed.

## 5. Phase 1 — Fold the editor in — DONE

The editor's own checklist (`docs/moving-into-code-dot-org.md`) assumed it
became a package; most of it was discharged rather than followed, because a
directory inherits the host's configs instead of repointing its own.

**Layout.** `src/{model,glsl,nodes,compiler,preview,runtime,editor,localization}`
move to `src/effect/` under those same names. `src/effect/preview` and
`src/effect/runtime` are the editor's own; world lab's existing `src/preview`
and `src/runtime` are untouched and unrelated.

**No barrel.** The editor's `src/index.ts` is dropped rather than moved. As a
package, sub-path exports were what kept React Flow out of a host that only
wanted to run effects; as a directory, the only thing enforcing that is the
import graph. A barrel at `src/effect/index.ts` re-exporting `./editor` would
let one careless `import {compileEffect} from '../effect'` in the driver drag
React Flow into the preview bundle. Layers are imported directly:
`../effect/compiler`, `../effect/runtime`.

**Delete.** `package.json`, `yarn.lock`, `.yarnrc.yml`, `config/`,
`eslint.config.mjs`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`,
`index.html`, and `src/dev/` (the standalone playground, including its
stand-in `translations.ts` — LocalizeJS takes that job over). World lab's
`yarn dev` opens the real lab and `DEFAULT_PROJECT` will carry a `.effect`
(§6); that is the iteration loop, and it exercises the editor where it
actually has to work.

**Localization.** `src/effect/localization/index.ts` collapses to a re-export
of `@code-dot-org/core/plugins/localization`; world lab already installs
`localizationPlugin` in `main.tsx`. Keep `translate(text, vars)` — it is the
interpolation adapter every layer calls — and keep `data-notranslate="true"`
on the editor container, which is what stops the LocalizeJS DOM engine
re-translating already-translated output. Delete `setTranslations`.

**Dependencies** into world lab's `package.json`:

- `@xyflow/react` — new to the workspace (MIT, ~120 kB gz). Per the policy
  comment in `frontend/.yarnrc.yml` it stays pinned until a second consumer
  appears; it does not go in the catalog yet.
- `zod` — already in the catalog (`^4.3.6`), so `catalog:`.
- `@mui/material`, `@emotion/react`, `@emotion/styled` — already world lab
  dependencies at `catalog:`. Nothing to do.

Also added: `@testing-library/jest-dom` (`catalog:`), which the editor's suite
asserts with and world lab did not previously carry.

**Tests.** Each layer's `__tests__` moved with it and runs under world lab's
vitest — same `jsdom`, same `globals: true` — via a new
`setupFiles: ['./src/__tests__/setup.ts']`. All 211 editor tests pass
unchanged apart from localization (below); the suite is now 402 tests.

The setup file landed at the lab's own `src/__tests__/`, not under
`src/effect/`, because vitest applies one setup to the whole run and naming it
after one directory would misdescribe it. Two corrections to the plan came out
of writing it:

- **The blanket canvas override was right.** The plan called for narrowing
  `HTMLCanvasElement.prototype.getContext = () => null` to the WebGL context
  types, on the theory that answering for `2d` was not ours to do. But jsdom
  has no canvas implementation _at all_ — it throws "Not implemented" for `2d`
  just as loudly — and the editor's test textures are drawn in 2D, so the
  narrowing put a stack trace back on every render. The clobbering worry was
  also unfounded: setup runs before the test file, so a test installing its own
  stub still wins.
- **Two suites have no DOM.** `buildCache` and `esbuildCompiler` run under
  `@vitest-environment node`, where `HTMLCanvasElement` is undefined. The
  canvas block is guarded.

**Localization.** `src/effect/localization/index.ts` now re-exports the
mainline singleton and keeps only `translate(text, vars)`. Its two dependent
suites (`localization.test.ts`, `localizedRendering.test.tsx`) drove the
deleted `setTranslations`, so both were ported to `vi.mock` the core module
with a dictionary standing in for LocalizeJS — which keeps what they were
really testing: that a template is translated _whole_ and values are spliced
in _after_, so learner-entered names never reach a translator.

**Docs.** The editor's `README.md` and `AGENTS.md` became
`src/effect/README.md` and `src/effect/AGENTS.md`, repointed at their new
paths and stripped of package-scoped procedure (sub-path exports, the config
mirror, the standalone playground). Its `EFFECT_EDITOR.md` was already this
package's `specs/EFFECT_EDITOR.md`. `LICENSE` and `NOTICE` were dropped in
favour of the monorepo's, which the editor's own README had already called for.

**Not yet exercised in the lab.** Nothing outside `src/effect/` imports it yet
— that is Phase 2. What proves the fold-in works is the test suite, which
renders `EffectEditor` through vite, so CSS modules, `@xyflow/react`
resolution, and the MUI theme are all covered; and `tsc -b`, which sees every
file. The standalone repo at `~/phaser-glsl-editor` is untouched and is now
the stale copy.

The trade accepted here: no independent versioning, and no structural
guarantee against the preview surface pulling in the editor — that becomes an
import-hygiene rule with a build-output check behind it (§11).

## 6. Phase 2 — `.effect` as a project file — DONE

`src/config.ts`: `effect` joined `WORLD_EDITABLE_FILE_TYPES` and
`languageMapping`, and `editorComponents.effect` routes to the new
`src/effect/EffectFileEditor.tsx`. The `fileIcons.effect` entry was already
there.

`src/runtime/compile/virtualFsPlugin.ts`: `.effect` joined `EXT_ORDER` and the
JSON branch of `loaderFor`, beside `.map` and `.anim`.

`src/effect/examples.ts` holds the annotated Ripple graph (promoted from the
standalone playground's `src/dev/examples.ts`, the one file worth keeping from
it). It imports `model` and nothing else, so `src/constants.ts` can seed
`effects/ripple.effect` into `DEFAULT_PROJECT` without reaching into the
editor.

**The adapter is thin, but not trivial.** Two things had to be decided rather
than plumbed:

- **An empty file is a new file, not a broken one.** Codebridge creates a file
  with no contents; that gets a fresh passthrough effect. Anything else that
  will not parse is _reported_, with the raw text shown — silently replacing a
  learner's broken file with a blank one destroys the only copy of what went
  wrong. The error view is deliberately not editable: a graph editor is the
  wrong tool for repairing JSON by hand.

**Two bugs found by wiring it up:**

- **`EffectEditor` called `onChange` on mount**, with the document it had just
  been given. Harmless in the standalone playground; in Codebridge it means
  merely _opening_ a `.effect` writes the file back — dirtying the project and
  churning stored text through a re-serialize for a document identical to the
  one on disk. Now compared by identity against the opened document
  (`useEffectDocument`'s reducer returns the same object for a no-op change),
  so the first notification is a real edit.
- **Read-only was not implemented at all.** Every other custom editor in the
  lab honours Codebridge's `isReadOnly` (`isReadOnlyWorkspace` — someone else's
  project, a frozen one); the effect editor had no such mode. Added in two
  layers, deliberately independent:

  1. **The guarantee.** `useEffectDocument(initial, {readOnly})` refuses every
     update at source, so no control — present, forgotten, or added later —
     can change the file. History reports empty, which disables undo/redo for
     free.
  2. **The manners.** `EffectEditorContextValue.readOnly` reaches the canvas
     internals (literal fields, notes, comments, the wire delete button, the
     color swatch, node resize) without prop-threading, and the top level
     withdraws the palette and the add-parameter button and disables the
     identity bars. React Flow gets `nodesDraggable`/`nodesConnectable` off
     and `deleteKeyCode` unbound.

  Reading stays fully live: panning, zooming, selection, the per-node eye
  previews, the GLSL panel, the test-texture picker, and the parameter try-out
  sliders all work, because none of them touch the document.

**Verified in Chromium** against the running `dev:isolated` servers:
`effects/ripple.effect` opens from the file tree into the graph editor (9
nodes, 13 wires, the palette, the input/output rows, the parameter slider);
editing the description and switching files and back shows the change
round-tripped through the stored file; no MUI portal roots escaped to
`document.body`; no console errors. The game preview kept running beside it.

Tests: `EffectFileEditor.test.tsx` (6) covers parse/serialize/empty/broken/
no-write-on-open/read-only pass-through, `editor/__tests__/readOnly.test.tsx`
(9) covers both read-only layers, and `esbuildCompiler.test.ts` gained a case
asserting an imported `.effect` arrives in the bundle as data. Suite: 418.

## 7. Phase 3 — Runtime — DONE

Effects are applied **once, when the actor's Game Object is created**, and not
reconciled per frame. Attaching a filter enables the object's filter pipeline
and inserts a render step, which is the delicate insertion §4 is about. Adding
or removing an effect while the game runs is a separate piece of work the plan
defers (§12).

### 7.1 Engine (`src/engine/`)

- `builders/ActorBuilder.ts`: `useEffect(path: string, doc: EffectDocument)`,
  accumulating `Array<[string, EffectDocument]>` and passed through
  `instantiate` to the `Actor`. `EffectDocument` is imported
  `import type` from `../../effect/model` — the engine is bundled on its own
  into `world-lab.mjs` (`scripts/setup-world-assets.mjs`), and a type import is
  erased, so that bundle gains nothing. A value import from `src/effect/` here
  would pull the compiler into the engine bundle, which is the wrong side of
  the seam: the engine carries the document, the driver compiles it.
- `core/Actor.ts`: carries the list; `effects()` reads it.
- `core/World.ts`: `RenderState` gains `effects?: Array<[string, EffectDocument]>`,
  populated in `renderSnapshot()`.

The `path` is the effect's identity for `registerEffect`, which keys render
nodes by name so twenty actors sharing an effect compile and upload one
program. `doc.name` is the learner's label and is not unique; the module path
is.

### 7.2 Driver (`src/runtime/driver/PhaserBinding.ts`)

A `Map<string, RegisteredEffect>` per scene. On `create()`, for each of the
actor's effects: compile if not seen (`compileEffect` from
`../../effect/compiler`), `registerEffect`, then
`applyEffectToActor(Phaser, object, effect)` (both from `../../effect/runtime`).
These two imports are the whole of the driver's dependency on the editor
directory, and they must stay that way — see §11. `applyEffectToActor` calls
`enableFilters()` and adds to the _internal_ filter list, so the effect
distorts the actor's own pixels before compositing — an underwater wobble on a
fish distorts the fish, not the water behind it.

A `compileEffect` throw is an `EffectCompileError` carrying a node/port
location. It must surface as an engine error through the existing
`FromPreviewMessage.ENGINE_ERROR` path, naming the effect file — a learner with
a broken graph gets a message, not a blank canvas.

### 7.3 Hot reload

`WorldSnapshot` gained `effectIds: string[]`, one `"<path>@<hash>"` per applied
effect (`engine/core/effectIds.ts`, FNV-1a over the serialized document), and
`reconcile`'s `sameStructure` check covers it.

**The plan overstated why this was needed, and the first test written for it
proved nothing.** The claim was that without `effectIds` an edited `.effect`
would "reconcile to no change and leave the old shader on screen". It would
not: `reconcile` patches live _only_ when rules, actors, and actor values all
match **and** a world property changed; every other rebuild already restarts.
An effect-only edit therefore restarted anyway, through the "nothing changed is
not patchable" fallthrough — and a test asserting that passed with the
`effectIds` comparison deleted.

The real gap is narrower and still real: an effect edited **alongside** a
world-property change. That rebuild satisfies every condition for patching
live, so the game keeps running and the new shader never loads. That is the
case the test now pins, and it fails without the comparison.

Restart remains blunt — re-registering a render node is what would make true
live editing possible — but swapping the program under an already-attached
filter is its own problem (§12).

## 8. Phase 4 — The block — DONE

`src/blockly/`:

- `projectModules.ts`: `projectEffectFileOptions(files)`, listing
  `effects/*.effect` as `[label, modulePath]` — the same shape as
  `projectAnimationFileOptions`.
- `moduleOptions.ts`: `setProjectEffectFiles` / `effectFileOptions` and a
  `liveDropdown('world_effect_options', 'EFFECT', …)` extension. Blockly JSON
  dropdowns take static options, so the extension swaps the field's
  `menuGenerator_` for one that reads the registry.
- `projectDropdowns.ts`: `refreshProjectDropdowns` populates it. This must
  happen before deserialization — a dropdown silently drops a serialized value
  that is not among its options — and that ordering is already handled for
  every other project dropdown.
- `domainBlocks.ts`: `world_use_effect`, `previousStatement` /
  `nextStatement`, so it chains under `world_actor` like `world_use_trait`.
  Style follows `sprite_blocks` (it is appearance work, not behavior). Its
  generator hoists the import through `addImport` and emits
  `actor.useEffect('<path>', <importVar>);`.
- The `.actor` toolbox category gains it beside `world_use_trait`.

Generated module:

```js
import * as WorldLab from 'world-lab';
import effects_ripple from 'effects/ripple.effect';

const actor = new WorldLab.ActorBuilder({id: 'Fish', name: 'Fish'});
actor.useTraits([WorldLab.PositionalTrait, WorldLab.AppearanceTrait]);
actor.useEffect('effects/ripple', effects_ripple);
export default actor;
```

The generator emits nothing when the dropdown holds its `(none)` placeholder —
a project with no `.effect` files yet. `actor.useEffect("", undefined)` would be
a runtime error for a block the learner simply has not finished filling in.

**`use effect` is a template block, and the editor now says so.** It calls
`ActorBuilder.useEffect`, so it belongs under `define actor`. Dropped into an
event handler it would still generate, because a handler is `(world, actor,
eventValue) => …` and `actor` resolves — to the _live_ `Actor`, which has no
such method. The result is `actor.useEffect is not a function` at run time,
about a method the learner never typed. `extensions/actorContext.ts` warns in
the editor instead, mirroring `worldContext`: the walk stops at the nearest
binder, so a handler disqualifies even when it sits inside an `.actor` file.
The warning has been confirmed rendering on a block dragged into a handler.

**`use trait` carries the same guard; the `set` blocks deliberately do not.**
Which blocks need it follows from which methods exist on which object, not from
which look like setup:

| Block                         | Emits                     | `ActorBuilder` | live `Actor` |
| ----------------------------- | ------------------------- | -------------- | ------------ |
| `use effect`                  | `actor.useEffect(…)`      | yes            | **no**       |
| `use trait`                   | `actor.useTraits([…])`    | yes            | **no**       |
| `set sprite` / `set position` | `target.set(Prop, value)` | yes            | yes          |

`set` exists on both, so those blocks are correct as a template default _and_ at
runtime on a live actor — guarding them would warn about working programs.

`use trait` needed more than a second copy of the rule, because it has two
valid homes: under `define actor` it calls the builder, and inside
`define trait` it declares that trait's own `requires`, where it is parsed into
`RuleMeta` and never generated at all. So `inActorDefinition` became
`inBuilderContext(block, roots)` — `['world_actor']` for `use effect`,
`['world_actor', 'world_rule_trait']` for `use trait`. A handler still
disqualifies in both.

**The starter effect ships unapplied.** `effects/ripple.effect` is in
`DEFAULT_PROJECT` so the folder is not empty and the editor opens on something
worth reading, but nothing in the tutorial uses it: that project teaches gravity
and input, and a permanently rippling player would pull against it. Dragging
`use effect` under an actor is how a learner tries it.

`compileEffect` already returns a full `EffectUniformDescriptor[]` — `label`,
`kind`, `defaultValue`, `min`, `max` — per declared parameter. The mutator that
expands the block's arguments (§12) has its data source ready; nothing in this
phase needed to anticipate it beyond not painting us into a corner on the
block's shape.

**Verified in Chromium**, against the running `dev:isolated` servers, that the
compiled GLSL runs as a Phaser filter on one actor — the integration the
editor's README had flagged as never having run in a game. With `use effect
Ripple` on the player its pixels tear into displaced wavy bands; with the block
removed, a clean sprite. The ground tile beside it is unchanged in both, which
is the scoping `applyEffectToActor` promises: the filter goes in the object's
_internal_ list, so it distorts the actor's own pixels rather than the scene
behind them. The ripple's default strength (0.02) is sub-pixel on a 24px
sprite, so the comparison was made at 0.35 — a screenshot at the shipped value
would have proved only that nothing crashed.

Two traps in doing that comparison, both worth knowing again:

- **The vendored engine does not hot-reload.** `public/vendor/world-lab.mjs` is
  pre-bundled by `yarn setup:world`; editing `src/engine/` and reloading gives
  the old bundle, and the symptom is `actor.useEffect is not a function` — the
  same message the missing-method trap above produces.
- **A dropdown substitutes an invalid serialized value.** Blanking the block's
  `EFFECT` field to `''` to make a control did not disable the effect: `''` is
  not among the options, so Blockly selected the first one and the effect stayed
  on. The two runs differed only in animation phase. A control has to remove the
  block.

## 9. Phase 5 — Design system — DONE

Planned as a verification pass. It became a real retheme, because the first two
things checked were both false.

**The theme did not compose.** `theme.ts` built its palette with
`createTheme({...})` and the comment claimed nesting composed with the host's
`CdoTheme`. It does not: `<ThemeProvider theme={object}>` _replaces_ the parent
theme for its subtree — only a _function_ composes. So the editor was running
an invented dark palette with the design system switched off inside it. It is
now `theme={outer => createTheme(outer, overrides)}`, and the palette block is
gone entirely: `CdoTheme` sets `cssVariables: true` and writes its component
overrides in semantic colors, so MUI chrome in the editor follows the lab's
theme by itself. What is left in `theme.ts` is density (`size="small"`
everywhere) and the no-portal defaults — the two things true of this surface
and not of a page.

**The editor was not themed at all.** 100 color literals across 15 stylesheets,
plus a `system-ui` font stack. The `--effect-editor-*` variables existed but
were referenced-with-fallback and never _defined_, so every fallback was the
real value. They are now declared once on `.editor`, each from a semantic token
(`--background-neutral-primary`, `--borders-brand-teal-primary`, …), and every
stylesheet and style override reads them. `--font-family-main` replaces the
hand-rolled stack. The literals that remain are the Light-theme fallbacks in
that one block, for a host that mounts the editor without the design system's
stylesheets — Light because `:root` is Light in `colors.css`, so a missing
stylesheet degrades to the default theme rather than one nobody chose.

**The editor follows the lab's Light/Dark setting; it does not pin one.** An
earlier revision set `data-theme="Dark"` on the container, reasoning that a
canvas tool should be dark whatever the app is. That is the editor overriding a
choice that belongs to the learner, so it was removed: the tokens now resolve
against the lab's own `div[data-theme]`. Two consequences had to be chased:

- **React Flow paints its own chrome** — dot grid, controls, minimap — from a
  `colorMode` prop rather than from CSS, and it was hard-coded `"dark"`. A
  light canvas kept a black dot grid. It now reads
  `useTheme(true)` from the component-library context, which is the _same
  state_ the attribute comes from (`ThemeProvider` renders
  `<div data-theme={theme}>` around its own provider), so the two halves cannot
  disagree. `useTheme(true)` rather than `useTheme()` because the editor must
  still render outside a provider, where Light is the right default.
- **The wire colors are theme-aware.** Five hues tuned against a dark canvas
  wash out on white, and type is the one thing a learner must read at a glance.
  These are the one palette _not_ taken from the design system, and
  deliberately: five mutually-distinguishable hues is a syntax-highlighting
  problem, while brand families are chosen to sit together — the opposite
  requirement. So they stay hand-picked, but now as `--effect-port-*` with a
  Light set and a Dark set selected by `data-theme`.

Canvas internals — nodes, wires, handles, knobs — stay purpose-built CSS. They
are dense, zoom-scaled, and geometry-bound to React Flow in ways design-system
components are not. A full DSCO alignment and an accessibility pass over a
node-graph editor are each their own effort and are not in this plan.

The switch itself needs nothing from this lab: `WorldLayout` renders
Codebridge's `InfoPanel`, which defaults `supportedThemes = ['Light', 'Dark']`,
so the settings menu already carries a Theme picker. Both modes have been
exercised through it.

**Verified** in Chromium against `dev:isolated`, by measuring computed styles
rather than reading screenshots — twice a downscaled crop suggested something
the computed values contradicted. Light: canvas `#fff`, nodes `#dfe3e9`, text
`#292f36`, wires the darker set. Dark: canvas `#292f36`, palette `#424d59`,
nodes `#576575`, fields `#292f36`, text white, wires the lighter set. Geist
throughout, no MUI portal roots escaping to `document.body`.

Tests: `theming.test.tsx` (the container pins no theme of its own and keeps
`data-notranslate`) and `colorMode.test.tsx` (React Flow follows the provider
into dark, into light, and defaults light with no provider). The latter caught
a wiring bug while being written — the first version passed a `theme` prop
`ThemeProvider` does not accept, so the assertion failed and was right to.

## 10. Testing

Unit (vitest, `frontend/packages/labs/world`):

- `projectEffectFileOptions` over a fixture project;
- the `world_use_effect` generator's emitted module (import hoisting, call);
- `ActorBuilder.useEffect` → `renderSnapshot().effects` round trip;
- `reconcile` restarts when `effectIds` change and not otherwise;
- `virtualFsPlugin` resolves and loads a `.effect` as JSON.

The editor brings its own suite (model, compiler, GLSL type rules, flow
mapping, editor shell). It must pass unchanged under world lab's vitest after
the localization swap — a suite that needed edits to survive the move is a
signal the move changed behavior.

Browser (`yarn dev:isolated`, lab :5139 / sandbox :5202) — the driver, Phaser,
and the sandboxes are not unit-testable in jsdom:

- Phase 0 regression sweep (§4);
- a `.effect` opens in the graph editor inside Codebridge and persists;
- `use effect` on an actor visibly changes that actor and nothing else;
- editing the `.effect` restarts the game with the new shader;
- a deliberately broken graph reports a located error rather than a blank
  canvas.

## 11. Risks

**The Phaser filter integration has never run.** It typechecks against 4.2.1's
`Filters.Controller` and `RenderNodes.BaseFilterShader` — both present in the
vendored build — but typechecking is not running. This is the single largest
unknown and it is why Phase 0 comes first and ends in a browser.

~~**Skew under WebGL.**~~ Resolved in Phase 0: shear confirmed on both a
textured Image and the fallback Rectangle, in a browser. The port was not
mechanical — see §4.

**WebGL context loss.** A Canvas game had no such failure mode. A lost context
in the preview iframe currently has no handler; at minimum it should report
rather than freeze silently. Handling it is not in this plan, noticing it is.

**Bundle cost, and the seam that guards it.** The lab side gains React Flow
(~120 kB gz); the preview surface gains only the compiler and the effect
runtime. Nothing structural enforces that split any more — as a package it was
sub-path exports, as a directory it is the import graph. The library build
uses `preserveModules`, so the split holds exactly as long as the driver
imports `../../effect/compiler` and `../../effect/runtime` and nothing else,
and there is no barrel at `src/effect/index.ts` for someone to reach for. It
must be checked in the built output (`dist-demo/`, the preview surface's
chunk), not assumed. If it proves hard to hold, that is the argument for
promoting `src/effect/` back out to its own package.

## 11a. Parameters on the block — DONE

`use effect Ripple` can now say _how much_ ripple. The block grows one value
socket per parameter the chosen effect declares, seeded with that parameter's
default, and the values travel to the shader uniforms.

**Parameters are read from the `.effect` document, not from `compileEffect`.**
The plan assumed the compiler, which does report more (`used` — whether the
graph actually reads a knob). But it costs a full compile per dropdown refresh
and _refuses a graph that does not yet build_ — and a learner part-way through
wiring an effect up should still see its knobs. `projectEffectParameters` reads
the declared list straight off the JSON, alongside the existing dropdown
registries.

**It is a mutator because the sockets depend on a file.** A block's inputs are
fixed at definition time; these come from the project, so
`effectParamsMutator` reshapes the block when the EFFECT dropdown changes and
rebuilds from the block's own serialized list on load. Types map onto the
lab's existing conventions: `float`/`int` a Number socket with a `math_number`
shadow, `bool` a Boolean socket with `logic_boolean`, and `vec2`/`vec3`/`vec4`
one labelled Number socket per component (x/y, or red/green/blue/alpha — the
effect editor calls a `vec3` "color (RGB)", so the labels follow it).

Emitted as a third argument, omitted entirely when the effect has no
parameters: `actor.useEffect('effects/ripple', Ripple, {"strength": 0.05})`.
`AppliedEffectSpec.values` carries it, the driver hands it to
`applyEffectToActor`, and `buildUniformValues` fills in each parameter's own
default for anything absent — so a partial map is fine. `effectSnapshotId`
hashes the values with the document, because a value is read once when the
filter is attached and so a changed knob needs the same restart an edited graph
does.

**Two bugs the browser found that the unit tests could not.**

- **The generator workspace needs the sockets.** `effectParamsMutator` copied
  `ruleParamsMutator`'s `isRuleGenerator` early-return, which skips the visual
  rebuild in the headless workspace. That is right for rule blocks — their rows
  are `+`/`−` FieldImages the offscreen renderer cannot draw, and they have no
  generator at all. It is wrong here: this block's generator reads those very
  sockets through `valueToCode`, so skipping the build left them missing and
  loading a saved block failed with _"is missing a(n) EPARAM_0_0 connection"_
  before a line was generated. The carve-out is gone, with a comment saying why
  it must not come back.
- **A rebuild overwrote the learner's value.** `setShadowState` ran
  unconditionally on every rebuild — and a rebuild happens on every block init,
  deserialization included. So reopening a file reset every knob to its default,
  and did it _silently_: the block displayed `0.02` while the saved `0.35` went
  on driving the shader. Sockets now keep what they held across a reshape,
  matched by parameter **id** rather than socket index, so switching effects
  does not smear one effect's values onto another's knobs while re-picking the
  same effect keeps them.

**Verified in Chromium**: the block renders `use effect [Ripple] / strength
[0.35]`, and the player ripples hard — against a document default of `0.02`,
which is sub-pixel on a 24px sprite, so the visible distortion is the block's
value reaching the uniform and nothing else. The scaffolding was then removed;
the tutorial's player is unrippled again.

## 12. Deferred

- **World and Camera effects.** `applyEffectToWorld` exists and applies to the
  camera's filter list; it needs a `use effect` on `.world` and the same
  registration path.
- **Live shader swap.** Re-registering a render node replaces the constructor,
  which is what would make editing a `.effect` update a running game without a
  restart. Until then, an edit restarts.
- **Runtime effects on an instance — wanted, deferred.** Adding an effect to
  one actor from inside an event handler ("when the player is hit, glow"), and
  removing it again. `use effect` cannot do this and must not appear to: it is
  a _template_ block that calls `ActorBuilder.useEffect`, and inside a handler
  `actor` is rebound to the live `Actor`, which has no such method. The editor
  now warns rather than letting that reach the game
  (`extensions/actorContext.ts`).

  The shape it wants, following `use trait` (template) vs `set sprite` /
  `play animation` (runtime, on an instance):

  1. `Actor` gains `addEffect(path, document)` / `removeEffect(path)`, keyed by
     path so adding twice is a no-op. `renderSnapshot` already reports
     `actor.effects()` every frame, so the list is free to change.
  2. `PhaserBinding` stops applying effects once at Game Object creation and
     reconciles them in `sync` instead: a `WeakMap<GameObject, Map<path,
AppliedEffect>>` against `state.effects`, attaching what is new and calling
     the `AppliedEffect.remove()` the runtime already returns for what is gone.
     Actors with no effects and nothing attached early-out, which is most of
     them.
  3. Two runtime blocks — `add effect <EFFECT> to <ACTOR>` and
     `remove effect <EFFECT> from <ACTOR>` — with the `this actor` shadow on the
     ACTOR socket, exactly like `set sprite`.

  The hot-reload snapshot is unaffected: `reconcile` only ever compares
  snapshots taken at build time, before any tick, so effects added by a running
  game never reach it.

- **A stock effect library.** Effects come from the project's own `effects/`
  for now; enumerating the ones the curriculum wants is separate work.
