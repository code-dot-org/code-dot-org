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

## 6. Phase 2 — `.effect` as a project file

`src/config.ts`:

- `effect` joins `WORLD_EDITABLE_FILE_TYPES` and `languageMapping`.
- `editorComponents.effect` → a new `src/effect/EffectFileEditor.tsx`, a thin
  adapter from Codebridge's `CustomEditorProps`
  (`initialContents` / `isReadOnly` / `onChange`) to `<EffectEditor>`'s
  `initialDocument` / `onChange`, parsing with `parseEffectDocument` and
  writing back with `serializeEffectDocument` (both from
  `./model`). It mirrors
  `BlocklyFileEditor.tsx`: Codebridge keys the component by file id, so
  `initialContents` is read once into a ref and the component remounts when the
  active file changes.
- The `fileIcons.effect` entry is already there.

`src/runtime/compile/virtualFsPlugin.ts`:

- `.effect` joins `EXT_ORDER` and the JSON branch of `loaderFor`, beside
  `.map` and `.anim`.

`src/constants.ts`: `DEFAULT_PROJECT` gains one `effects/*.effect` so the slice
is demonstrable on a fresh project without the learner authoring a graph first.

## 7. Phase 3 — Runtime

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

`reconcile()` reads `snapshot()` — `ruleIds`, `actorIds`, world and actor
property values. Effects appear in none of them, so editing a `.effect` today
would rebuild the bundle, reconcile to "no change", and leave the old shader on
screen.

`WorldSnapshot` gains `effectIds: string[]`, one `"<path>@<hash>"` per applied
effect, and `reconcile`'s `sameStructure` check covers it. An effect edit then
restarts the game. Restart is blunt — `registerEffect` replacing a render-node
constructor is what makes true live editing possible — but live shader swap on
already-attached controllers is its own problem and is deferred (§12).

## 8. Phase 4 — The block

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

`compileEffect` already returns a full `EffectUniformDescriptor[]` — `label`,
`kind`, `defaultValue`, `min`, `max` — per declared parameter. The mutator that
expands the block's arguments (§12) has its data source ready; nothing in this
phase needs to anticipate it beyond not painting us into a corner on the
block's shape.

## 9. Phase 5 — Design system

A verification pass, not a rewrite:

- the editor's nested dark `ThemeProvider` (`src/effect/editor/theme.ts`)
  composes under the host's `CdoTheme`, inside a Codebridge pane;
- the no-portal rule still holds under Codebridge's own layout (portals mount
  on `document.body`, outside the `data-notranslate` container);
- take what is cheap from `component-library-styles` tokens.

Canvas internals — nodes, wires, handles, knobs — stay purpose-built CSS. They
are dense, zoom-scaled, and geometry-bound to React Flow in ways design-system
components are not. A full DSCO alignment and an accessibility pass over a
node-graph editor are each their own effort and are not in this plan.

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

## 12. Deferred

- **Parameters on the block.** `compileEffect` supplies the descriptors; the
  block needs a mutator that expands one socket per parameter with its default
  and range, and `applyEffectToActor` already takes a values map.
- **World and Camera effects.** `applyEffectToWorld` exists and applies to the
  camera's filter list; it needs a `use effect` on `.world` and the same
  registration path.
- **Live shader swap.** Re-registering a render node replaces the constructor,
  which is what would make editing a `.effect` update a running game without a
  restart. Until then, an edit restarts.
- **Runtime re-assignment.** Changing or removing an actor's effect while the
  game runs — `AppliedEffect` already exposes `setValues` / `restart` /
  `remove`, so the engine-side surface is the missing half.
- **A stock effect library.** Effects come from the project's own `effects/`
  for now; enumerating the ones the curriculum wants is separate work.
