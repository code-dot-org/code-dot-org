# Implementation Plan: The World Lab Phaser Driver

This plan covers the _driver_ — the machinery that serves a sandboxed Phaser 4
runtime on a separate origin and runs (or interprets) the learner's sources. It
does not cover the eventual Blockly editors, the map/animation editors, or the
`.rule` Blockly-to-JavaScript compiler; those are named where the driver must
leave room for them, and otherwise deferred.

Read `DESIGN.md`, `GLOSSARY.md`, `ENGINE.md`, `SANDBOX.md`, and `INTERFACE.md`
first — this plan assumes their vocabulary (World, Rule, Trait, Actor, Event,
Step, Tick, Scene, Map, Animation).

## 1. Goal

A learner edits a multi-file project (`rules/`, `worlds/`, `actors/`,
`scenes/`, `maps/`, `animations/`, sprites) in the Codebridge editor. The
driver compiles that project, runs it as a Phaser 4 game inside an isolated
iframe, shows the game in the preview pane, and relays console output and
engine errors back to the lab. Small edits reload in place where possible;
structural edits restart the game.

The first milestone is a **vertical slice** (§11), not the full runtime: the
thinnest end-to-end path that proves the pipeline — the two sandboxes, module
compilation, the ECS core, and the Phaser binding — by rendering a
gravity-driven sprite from a learner-authored `scene`, `world`, `actor`, and
`rule`, and hot-patching one property live.

## 2. One lab origin, one sandbox origin, four programs

Unlike Web Lab and Python Lab, World Lab needs a **compile** step: the learner
writes multi-file TypeScript/JavaScript that must become a single runnable
module before a game can start. (Web Lab also runs untrusted code — student
HTML/JS executes in its preview iframe — but that code is already
browser-runnable, so it never needed a compiler; that is the one piece World
adds.) We give compilation its own home so the two dangerous capabilities never
overlap:

```
  LAB ORIGIN (studio / demo :5139)         SANDBOX ORIGIN (:5202)  — sessionless, networkless
  ┌──────────────────────────────┐        ┌──────────────────────────────────────────────┐
  │ WorldPreview (React)         │        │  compile.html  (HIDDEN iframe)                 │
  │  owns both iframes           │        │   worldCompileWorkerManager.ts                 │
  │  posts learner sources       │──B────▶│    esbuild-wasm — TRANSFORMS TEXT ONLY,        │
  │  routes controls             │        │    never executes learner code                 │
  │  relays console → debug      │        │        │ compiled module (served / posted)      │
  │                              │        │        ▼                                        │
  │  useSources() ─ learner ─────┘        │  preview.html  (VISIBLE iframe = the canvas)   │
  │                              │◀───D───│   worldPreviewWorkerManager.ts                 │
  └──────────────────────────────┘  C     │    world-lab engine + Phaser.Game              │
                                          │    imports the compiled module, runs the game  │
                                          └──────────────────────────────────────────────┘
   program A: the lab            B: compile control   C: preview control   D: preview reports
```

- **A — the lab** (studio or demo origin). Never executes learner code. Owns
  both iframes, feeds the project down, displays what the preview reports. This
  is `preview/WorldPreview.tsx` + a runtime façade (`runtime/`), analogous to
  web-lab's `HTMLPreview` and python-lab's `PythonRuntimeProvider`.
- **B — the compile sandbox** (hidden iframe on the sandbox origin). Runs
  esbuild-wasm. It **only parses and transforms source text**; it never imports
  or runs the learner's compiled output. This is the only place WebAssembly
  instantiation is permitted (§8), and it is deliberately a place no learner
  logic ever runs. Mirrors python-lab's _hidden_ compute iframe.
- **C — the preview sandbox** (visible iframe on the sandbox origin). Hosts the
  `world-lab` engine and `Phaser.Game`, imports the compiled module, constructs
  the Scene, runs the loop, and reports back. It _is_ the canvas the student
  watches, so it lives in the `WorldPreview` pane, sized by the layout —
  web-lab's visible-preview placement.
- **the learner's program** is compiled by B and executed by C, as real
  JavaScript, inside the sandbox. It imports `world-lab` (the engine); it never
  imports `phaser` directly — the engine owns Phaser.

Both sandbox iframes share **one origin** (a single dev port; in production, a
per-project subdomain). They are same-origin to each other — which is what lets
the compiler hand modules to the preview cheaply (§7) — and both are
cross-origin to the lab, which is the boundary that matters. Separating them
buys the key security property in §8: the wasm-eval surface (B) never runs
learner code, and the learner-code surface (C) never needs wasm-eval for
compilation.

## 3. What we reuse, and from where

Nothing below is invented where the repo already solves it. Cited paths are the
originals to port or adapt from.

From **web-lab** (`packages/labs/web/`):

- Cross-origin preview placement and origin config —
  `src/preview/previewConfig.ts` (`setPreviewBaseUrl`, `?web-preview=`,
  `PARENT_ORIGIN_PARAM`, the "no origin configured" fallback). World renames to
  `?world-sandbox=` / `setSandboxUrl`.
- Reading the learner's project from Codebridge —
  `useSources<MultiFileSource>()` from `@code-dot-org/lab/contexts`, plus the
  flattening in `src/preview/projectFiles.ts` (`filterSourceForPreview`,
  `getPreviewFiles`, folder-path walking, mime table). World reuses this to
  build the file map it posts to the compiler.
- The **service-worker-serves-from-memory** mechanism —
  `public/webLabProjectServiceWorker.js` + `src/preview/previewPage.ts`
  (`BroadcastChannel`, `UPDATE_FILES`/`RECEIVED_SOURCE`, `updateViaCache:'none'`,
  `skipWaiting`/`clients.claim`, the keep-alive ping). World reuses this exact
  pattern as the recommended compiler→preview transport (§7): the compile
  sandbox stashes the compiled module in a service worker; the preview imports
  it by URL.
- The CSP model — `src/preview/contentSecurityPolicy.ts` (host-supplied,
  generated lab-side, shipped with the source). World needs two variants (§8).
- The visible-iframe lifecycle — `src/preview/HTMLPreview.tsx` (iframe `src`
  with `PARENT_ORIGIN_PARAM`, the `IframeMessage` switch, resend-on-edit,
  stop/refresh teardown, the origin guard).

From **python-lab** (`packages/labs/python/`), the precedent for a _stateful,
long-lived compute runtime_ in a cross-origin iframe:

- The **two-directional message contract** as side-effect-free `as const` maps
  - typed interfaces + union types — `src/runtime/sandbox/messages.ts`
    (`ToSandboxMessage`/`FromSandboxMessage`, `PARENT_ORIGIN_PARAM`,
    `PYODIDE_BASE_PARAM`). World copies the shape for each of its message surfaces.
- The **parent/iframe manager split** — `pyodideSandboxManager.ts` (parent:
  builds the iframe, forwards origin + asset base on the `src`, origin-checks
  every message, `READY` gates a `readyPromise`, run-id `crypto.randomUUID()` +
  `callbacks` map resolves run promises) and `pyodideSandboxWorkerManager.ts`
  (iframe: reads its own URL params, owns the runtime, relays, signals `READY`
  after boot). World has _two_ such splits — one per sandbox.
- The **façade dynamic-import split** — `pyodideManager.ts` (`?pyodide-sandbox=`
  chooses backend via lazy `import()`, so only the selected backend's side
  effects run). World keeps a `direct` backend for jsdom/unit tests.
- The **asset-base config + self-hosting script** — `pyodideConfig.ts`
  (`get/setPyodideBaseUrl`) and `scripts/setup-pyodide-assets.mjs` copying into
  `public/` (git-ignored), served identically on both dev ports so an
  origin-relative base resolves. World mirrors this for esbuild-wasm and Phaser.
- The **two-port dev story** — `dev` / `dev:sandbox` / `dev:isolated`
  (`concurrently`, `--strictPort`), one Vite project serving `index.html`,
  `compile.html`, and `preview.html`, `worker: {format:'es'}`.
- The **React wiring** — `App.tsx`'s `PythonRuntimeProvider` (preload on mount,
  supply a `CodebridgeRuntime` of `onRun`/`onStop` to
  `CodebridgeRuntimeProvider`; `registerSourceWriter` for write-back).

## 4. Message contracts (`src/runtime/messages.ts`)

Side-effect-free, imported by every bundle so the strings match. Python-lab's
`as const` + directional-union style (TS enums are forbidden here under
`erasableSyntaxOnly`). Three surfaces; all origin-checked on receipt, all sends
targeted to a specific origin.

URL params (on iframe `src`, never postMessage'd): `PARENT_ORIGIN_PARAM`,
`ASSET_BASE_PARAM` (origin-relative base for self-hosted esbuild-wasm + Phaser),
`ROLE_PARAM` (`'compile'` | `'preview'` — one page, two roles; see §12).

Lab → compile (`ToCompileMessage`):

| kind        | payload                                      | meaning                                                      |
| ----------- | -------------------------------------------- | ------------------------------------------------------------ |
| `'compile'` | `id`, `files: PreviewFiles`, `entry: string` | (re)bundle the project; incremental if a warm context exists |
| `'dispose'` | —                                            | drop the warm esbuild context (teardown)                     |

Compile → lab (`FromCompileMessage`):

| kind              | payload                                 | meaning                                                                                                                          |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `'ready'`         | —                                       | esbuild initialized; handshake                                                                                                   |
| `'compiled'`      | `id`, `moduleUrl`, `changed?: string[]` | bundle ready at `moduleUrl` (served by the transport, §7); `changed` lists changed modules for the preview's hot-reload decision |
| `'compile_error'` | `id`, `message`, `location?`            | a bundling/parse error, located to a file/line                                                                                   |

Lab → preview (`ToPreviewMessage`):

| kind             | payload                                   | meaning                                                                  |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `'load'`         | `id`, `moduleUrl`, `strategy`, `changed?` | import `moduleUrl` and apply it with the chosen hot-reload strategy (§9) |
| `'stop'`         | —                                         | tear the game down (loop stopped, canvas cleared)                        |
| `'set_running'`  | `running`                                 | pause/resume the loop                                                    |
| `'set_property'` | `path`, `value`                           | hot-patch one property in the live world (§9, level 1)                   |

Preview → lab (`FromPreviewMessage`):

| kind             | payload                                           | meaning                                                                                                                                                         |
| ---------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'ready'`        | —                                                 | engine + Phaser booted; handshake                                                                                                                               |
| `'built'`        | `id`                                              | the module loaded and the game is running (resolves the run promise)                                                                                            |
| `'console'`      | `level`, `args`                                   | a learner `console.*`, for the debug surface                                                                                                                    |
| `'engine_error'` | `message`, `stack?`, `phase: 'construct'\|'tick'` | a runtime failure located to a project file where possible                                                                                                      |
| `'lifecycle'`    | `event`                                           | engine milestones (`scene_started`, `scene_stopped`, …)                                                                                                         |
| `'event'`        | `name`, `detail`                                  | open pass-through for arbitrary engine→lab signals, mirroring python relaying raw worker messages — keeps the contract extensible without a new type per signal |

The lab brokers control (B and C surfaces above). The bulk payload — the
compiled module — does **not** flow through the lab: the compiler makes it
available on the sandbox origin and the preview fetches it (§7), so `moduleUrl`
is all that crosses the lab.

## 5. The lab side (program A)

### 5.1 `runtime/` — the façade

Mirror python-lab, generalized to two sandboxes:

- `runtime/worldRuntime.ts` — the `WorldRuntime` interface (`preload()`,
  `run(source)`, `stop()`, `setProperty(path,value)`, `setRunning(bool)`) and
  `routePreviewMessage(data, {onBuilt})` turning `console`/`engine_error`/… into
  Codebridge-console writes and Redux dispatches.
- `runtime/worldConfig.ts` — `get/setSandboxUrl` (the `?world-sandbox=` param,
  web-lab's `previewConfig.ts` renamed) and `get/setAssetBaseUrl`
  (python-lab's `pyodideConfig.ts` renamed).
- `runtime/worldManager.ts` — the façade: `?world-sandbox=<url>` present →
  `import('./sandbox/worldSandboxManager')` (the two-iframe backend); absent →
  `import('./driverManager')` (the direct, same-page backend, §5.3).
- `runtime/sandbox/worldSandboxManager.ts` — parent side, owns **both** manager
  splits: `worldCompileManager.ts` (builds the hidden compile iframe, holds its
  `readyPromise`) and `worldPreviewManager.ts` (exposes the visible preview
  iframe's `src` + plumbing to `WorldPreview`). It wires compile→preview: on
  `compiled{moduleUrl}` it decides a hot-reload strategy (§9) and posts `load`
  to the preview.

### 5.2 `preview/WorldPreview.tsx` — replaces the placeholder

Adapted from `HTMLPreview.tsx`. Responsibilities:

- Resolve the sandbox URL; if none, keep the current "no sandbox origin
  configured" message.
- Mount the **visible** preview iframe (`?parentOrigin=`, `?assetBase=`,
  `?role=preview`) in the pane. The hidden compile iframe is created by the
  manager, not rendered here (like python's hidden iframe appended off-tree).
- On `useSources` change (debounced), flatten via `projectFiles.ts` and post
  `compile` with the entry (`scenes/main.js`, §6).
- Toolbar (reuse `WorkspaceHeader` + segmented buttons already in
  `WorldLayout`): run/refresh, stop, pause/resume.
- Relay `console`/`engine_error` (the preview's `FromPreviewMessage`) into a
  **Console/Debugger box in the layout**, not the Codebridge console. Placement
  rule: the box sits **under the preview pane** in split or preview-only view,
  and **under the editor pane** only when the editor is the sole visible pane —
  it follows the preview and falls back to the editor when the preview is
  hidden. This is _not_ a full-width bar under both panes (web-lab's shape);
  World's console tracks whichever pane is showing the running game. A richer
  web-lab-style debug panel (network, etc.) is later work.

### 5.3 The direct backend (`runtime/driverManager.ts`)

A same-page runtime, no iframes, for `yarn dev` without a second origin and for
jsdom-safe imports (esbuild-wasm runs in-page; the game renders to an in-pane
canvas). **Not a security boundary** — production and the isolated demo always
use the two-sandbox backend. Mirrors python-lab's direct/sandbox duality and its
warning that the isolation guarantee holds only on the sandbox path.

## 6. Project layout the learner writes, and the entry point

Per `INTERFACE.md`:

```
scenes/main.js     ← default entry: default-exports a built Scene
worlds/*.js        ← WorldBuilder → world-lab
actors/*.js        ← ActorBuilder → world-lab
rules/*.js|.ts     ← RuleBuilder → world-lab   (.rule Blockly deferred)
maps/*.json        ← Map data
animations/*.json  ← Animation/spritesheet/tileset descriptors
sprites/*.png      ← images
```

The driver's entry is the scene the game starts on. For the slice, fix it to
`scenes/main.js`; later, a level/appOptions field or a scene picker selects it.
Modules import each other by project-relative path; they import the engine as
the bare specifier `world-lab`. `phaser` is not learner-facing.

**There is no project `index.html`.** Unlike Web Lab — where the page _is_ the
artifact and the service worker serves the project's own `index.html` to the
iframe — a World project is the game defined by `scenes`/`worlds`/`actors`/
`rules`. The host page is a fixed, uneditable shell that only mounts the canvas
and `import()`s the compiled bundle; in this architecture that shell **is
`preview.html`** (§2), served static by the sandbox origin, and the SW transport
carries a compiled _JS module_, not an HTML page. Consequences: `config.ts`
`editableFileTypes` is code (`js`/`ts`/`json`, later `.rule`/`.anim`), **not**
`html`; `png` stays supported-but-not-editable; and `DEFAULT_PROJECT` is the
engine demo (scenes/worlds/actors/rules + a sprite), never an `index.html`. The
current scaffold's editable `index.html` + `'html'` type are placeholders cloned
from Web Lab, replaced when the demo project lands (§11, milestone 3).

## 7. Compilation and transport (the decision)

The task left the module-loading choice to the plan; your direction — a headless
compile sandbox feeding the visible preview — is adopted. The remaining choices:

**Compiler: esbuild-wasm, self-hosted, warm.** Ship `esbuild-wasm` and a Phaser
4 build as static assets under the sandbox origin, copied into `public/` by
`scripts/setup-world-assets.mjs` and served at an origin-relative path forwarded
via `?assetBase=` — python-lab's pyodide self-hosting. No CDN, no runtime
network. The compile sandbox keeps a **warm `esbuild.context()`** so rebuilds
are incremental and sub-10 ms — this is what makes hot reload feel live. On
`compile`, it runs the context's `rebuild()` over the posted `PreviewFiles` map
through an in-memory resolve/load plugin: project-relative specifiers resolve to
files in the map; `.json` as JSON; `.png` as an asset URL the engine hands to
Phaser's loader; `.ts` transpiled; `world-lab` and `phaser` marked **external**.
Compile errors surface with file/line as `compile_error`. The compiler never
executes the result — it only writes it out. esbuild is initialized with
`worker: false` so it runs on the (idle, hidden) compile surface's main thread
rather than spawning a blob-URL Web Worker that the tight CSP would block
(milestone-0 finding, §15).

Verified in milestone-0 Spike B: a warm `esbuild.context()` over the
`PreviewFiles` map bundles multi-file TS + JSON + external `world-lab` with cold
build ~89 ms and warm incremental rebuild ~10 ms.

Rejected as primary: **service-worker + import-maps serving raw learner files**
(web-lab's SW without a bundler). It runs only native ESM (no `.ts` — the design
wants `.js` _or_ `.ts`), needs per-file bare-specifier rewriting, and gives no
compile-time error surface. Kept in reserve only if esbuild-wasm's size proves
unacceptable.

Rejected outright: **the in-process interpreter**
(`@code-dot-org/lab/interpreter`, `CustomMarshalingInterpreter`, used by music).
It runs on the lab's window — which `SANDBOX.md` forbids without exception — and
is far too slow to drive a real-time loop.

**Transport (compile → preview): a shared service worker on the sandbox
origin — recommended.** Both sandbox iframes are same-origin, so reuse web-lab's
`webLabProjectServiceWorker.js` mechanism: the compile sandbox posts the freshly
built module to the SW (as `previewPage.ts` posts files with `UPDATE_FILES`),
keyed by a cache-busting URL like `/__world_build__/<id>.mjs`; the preview then
`import(moduleUrl)`. Wins: the preview imports a **real self-origin URL**
(clean stack traces and source maps, and CSP stays `script-src 'self'` — no
`blob:` needed); the compiler and preview stay decoupled; the module never
transits the lab. The SW registration + keep-alive + `updateViaCache:'none'`
concerns are already solved in web-lab and port directly. Milestone-0 Spike C
confirmed a same-origin compiled module imports and runs under `script-src
'self'`, while a blob import is refused there — so this transport is what keeps
the preview CSP tight.

Simpler fallback: **`BroadcastChannel` + blob module.** The compiler posts the
bundle text on a named same-origin channel; the preview wraps it in a `blob:`
URL and imports it. No SW, but CSP must allow `script-src blob:` and stack
traces are blob URLs (mitigated by esbuild `sourcemap` + `//# sourceURL`). Use
this if the SW proves fiddly across the two iframes.

## 8. Sandbox security — two CSPs, one origin

`SANDBOX.md`: a separate origin, no network, no session/page takeover. Because
compilation and execution are split, they get different policies, and that is
the point.

**Compile sandbox** (`role=compile`) — instantiates wasm (esbuild), runs **no**
learner code:

- `script-src 'self' 'wasm-unsafe-eval'`
- `connect-src 'self'` (for esbuild's own `esbuild.wasm` fetch), `default-src
'self'`, no `blob:`, no `img-src` needs. esbuild is initialized with
  `worker: false` so no `worker-src blob:` is needed.

`'wasm-unsafe-eval'` is the narrow CSP Level 3 keyword that permits
`WebAssembly.instantiate`/`compile` from bytes while still forbidding JS
`eval`/`new Function` — strictly weaker than `'unsafe-eval'`. The only thing it
trusts here is our vendored esbuild-wasm instantiating its own wasm (Spike C
confirmed it is necessary and sufficient). No learner-derived code ever runs on
this origin (the compiler transforms text and emits it; it never imports the
result), so learner-supplied wasm cannot execute here. `connect-src 'self'` — not
`'none'` — is required because esbuild fetches its own same-origin wasm; that is
the only fetch, it reaches no cross-origin destination, and the surface is
sessionless with no learner code, so it grants the learner nothing.

**Preview sandbox** (`role=preview`) — runs learner code with **no** wasm-eval:

- `script-src 'self'` (SW-served compiled module; add `blob:` only under the
  fallback transport). `'wasm-unsafe-eval'` is **omitted** — Spike A/C confirmed
  Phaser 4.2.1 needs no wasm and no eval — so learner-supplied `.wasm` is refused
  outright.
- `connect-src 'none'`, `img-src 'self' blob: data:` (sprites arrive as
  blobs/data URLs, not network), `frame-ancestors <labOrigin> 'self'`,
  `form-action 'none'`, credential-less origin.

So the two dangerous capabilities never coincide: wasm-eval lives only on the
compile surface, where no learner logic runs; the preview surface runs learner
logic with no wasm-eval, so learner wasm cannot execute there at all.
Compatibility note: `'wasm-unsafe-eval'` is recent; engines that predate it fall
back to
requiring `'unsafe-eval'` — check the target browser matrix.

Production keeps legacy's per-project subdomain so projects are isolated from
each other too; the demo uses a single sandbox origin (a second dev port), which
is weaker and is called out in the README, as web-lab does.

## 9. Hot reload — a spectrum, not a switch

`ENGINE.md` wants small edits to apply without resetting the game, and you
flagged this as important-but-tricky. The recompile itself is cheap (a warm
esbuild context, §7); the hard part is _applying_ new output to a _running,
stateful_ game without a visible reset. The ECS design is what makes this
tractable: **definitions** (Rules, Traits, Steps — the code) are separate from
**instances** (Actors, World state — the data, keyed by `id`). Swap definitions,
keep instances.

The `worldSandboxManager` picks the lowest-cost valid strategy from the
compiler's `changed` hint and sends it as `ToPreviewMessage.load{strategy}`:

- **Level 0 — restart.** Tear down Phaser, reconstruct from the new module.
  Always correct, always the fallback.
- **Level 1 — data patch (no recompile).** Many edits per `DESIGN.md` are
  declarative metadata: a property default, gravity strength, an actor's start
  position, a map's actor list. The lab detects a pure-data delta (a changed
  `.json`, or a changed literal the compiler flags) and sends `set_property` /
  `populate`; the engine writes it into live state and the next tick reflects
  it. This is the `ENGINE.md` example — change gravity, see the jump change
  mid-air — and needs no rebuild at all.
- **Level 2 — code swap with state preservation.** For changed _code bodies_ (a
  Step handler, an event handler), recompile and rebind the live
  World/Rule/Actor _definitions_ to the new module while keeping the Actor
  _instances_ and their property stores (matched by `id`). Feasible precisely
  because state lives in id-keyed instances, not in the code. This is the "very
  nice" middle ground.
- **Level 3 — structural reconcile.** Adding/removing an actor, adding a trait,
  adding a rule: diff the new Scene definition against the live instance tree —
  add new actors, drop gone ones, add/remove trait state on survivors preserving
  overlapping properties. Hardest; later.

Honest staging: the slice ships **Level 0 + Level 1** (restart, plus the
world/trait-property fast path). Levels 2–3 are staged after; the message
contract already carries `load{strategy}` and `set_property`, so they grow
without a protocol change. A caveat worth stating up front: "full esbuild
rebuild + Level 0" is always available and correct, so hot reload can never
block a running game — it only makes some edits smoother.

## 10. The `world-lab` engine (the runtime library)

The API surface `INTERFACE.md` specifies and the largest net-new piece. It lives
at `src/engine/` in the world package (not separately published yet); the
compiler marks it external and the preview provides it as the `world-lab`
module. Its ECS core has no DOM dependency and is unit-tested headless; only the
Phaser binding needs a browser.

```
src/engine/
  index.ts                     ← the 'world-lab' public surface
  core/
    Vector.ts                  ← x/y value type (add, scale, rotate)
    Property.ts                ← typed descriptor (type, default, readonly, name)
    Trait.ts                   ← trait definition + instance state
    Rule.ts                    ← rule definition (deps, traits, actions, events, steps)
    Actor.ts                   ← actor instance (trait set, property store, handlers)
    World.ts                   ← rule set, world-scoped property store
    Scene.ts                   ← world instance + actor instances + populate(map)
    Scheduler.ts               ← topological ordering of Steps (before/after)
    EventQueue.ts              ← events queued during a tick, flushed after
    traits.ts                  ← reference-counted trait dependency resolution
  builders/
    RuleBuilder.ts             ← addProperty/addAction/addTrait/addEvent/addStepBefore/After, build()
    WorldBuilder.ts            ← useRules/hideRule, build()
    ActorBuilder.ts            ← useTraits/set/on, build()
    SceneBuilder.ts            ← useWorld/addActor/clear/populate, build()
  phaser/
    PhaserBinding.ts           ← Scene → Phaser.Game; the Phaser Scene bridge
    spatialBinding.ts          ← Spatial trait → GameObject transform
    spriteBinding.ts           ← Animation/Sprite → Phaser texture/anim
```

Semantics to honor (`DESIGN.md`/`INTERFACE.md`):

- **Reference-counted trait/rule dependencies** (`traits.ts`): adding a Trait
  pulls in its requirements; removing one does not remove a dependency still
  required elsewhere; an explicitly-added-then-removed Trait survives if still
  implied. Rules likewise imply their required Rules.
- **Step ordering** (`Scheduler.ts`): each Step declares `before`/`after`
  another rule's Step (or explicit begin/end); build a per-tick order by
  topological sort; detect cycles at `build()`, not at tick. Gravity's
  `addStepBefore(Motion.steps.reposition)` and
  `addStepAfter(Collision.steps.resolve)` must land on the right sides.
- **Deferred events** (`EventQueue.ts`): Steps enqueue; the queue flushes after
  the tick so no handler mutates state mid-simulation.
- **Typed property access**: `world.get/set(Property)`, `actor.get/set(Property)`;
  `readonly` writable only inside the owning rule's Step (not strictly enforced
  in the prototype, per `INTERFACE.md`). This id-keyed instance store is also
  what §9's Levels 1–2 hot reload depend on.
- **Actions/Queries** carry localizable `name`s for the future Blockly surface;
  in JS they are plain methods.

The **Phaser binding** turns the abstract Scene into a running game:

- One `Phaser.Game` with a single Phaser `Scene` bridging to our `Scene`.
  Phaser `preload` loads sprite textures (project PNGs served as blobs);
  `create` instantiates a Phaser `GameObject` per Actor; `update(time, delta)`
  drives our `Scheduler` with the real `delta` (`ENGINE.md`'s real-time
  requirement), then reconciles each Actor's Spatial state onto its GameObject
  transform and advances Animations.
- The Spatial trait maps to `x/y/scaleX/scaleY/rotation`; Motion integrates
  velocity; Gravity/Collision are engine Steps, **not** Phaser Arcade Physics —
  the engine stays the source of truth so hot reload (§9) can reach the state.
  Handing simulation to Arcade Physics would hide state from us.
- Canvas sizes to the iframe; the iframe sizes to the preview pane.

## 11. The vertical slice (first deliverable)

Thinnest end-to-end path exercising every layer. Definition of done:

Engine (headless, Vitest-tested):

- `Vector`, `Property`, `Trait`, `Rule`, `Actor`, `World`, `Scene`, the four
  builders, `Scheduler` (before/after + cycle detection), `EventQueue`,
  reference-counted deps.
- Three rules: **Spatial** ("Has Space" → position/scale/rotation +
  move/resize/rotate), **Motion** ("Has Physics" → velocity + a reposition
  Step), **Gravity** ("Has Gravity" → acceleration before Motion; "Affected by
  Gravity" / "Acts as Ground" traits; `startsFalling`/`stopsFalling`; a trivial
  ground-stop).
- One demo project shipped as `DEFAULT_PROJECT`: `scenes/main.js`,
  `worlds/platform.js`, `actors/player.js`, `rules/…` re-exporting the engine
  rules, one `sprites/*.png`.

Driver + sandboxes (browser, Playwright-verified):

- `compile.html`, `preview.html` (one page, `?role=`), the compile + preview
  manager splits, `messages.ts`, `worldConfig.ts`, `worldManager.ts`, the
  esbuild-wasm compiler with a warm context, the SW transport, `PhaserBinding`.
- `scripts/setup-world-assets.mjs` self-hosting esbuild-wasm + Phaser;
  `dev`/`dev:sandbox`/`dev:isolated`.
- `WorldPreview` posts sources → compiler bundles → preview runs → a sprite
  falls under gravity and lands, `console.log` reaches the Codebridge console,
  and `set_property` on gravity strength changes the fall live (§9 Level 1).

Out of the slice: collisions beyond ground-stop, keyboard control, animations
beyond a static sprite, maps/tilesets, the editors, the Blockly `.rule` path,
the rich debug panel, per-project subdomains, and §9 Levels 2–3.

## 12. File-by-file work

New, in `packages/labs/world/`:

- `compile.html`, `preview.html` — one Vite-served page each; both load
  `sandbox/entry.ts`, which reads `?role=` and boots the compile or preview
  worker manager. (Two HTML files, one entry module.)
- `scripts/setup-world-assets.mjs`
- `src/runtime/messages.ts`, `worldRuntime.ts`, `worldConfig.ts`,
  `worldManager.ts`, `driverManager.ts`
- `src/runtime/sandbox/worldSandboxManager.ts`, `worldCompileManager.ts`,
  `worldPreviewManager.ts` (parent-side splits)
- `src/runtime/sandbox/worldCompileWorkerManager.ts`,
  `worldPreviewWorkerManager.ts`, `entry.ts` (iframe-side)
- `src/runtime/compile/esbuildCompiler.ts`, `virtualFsPlugin.ts` (the compiler)
- `src/runtime/transport/buildServiceWorker.js` (public/), `buildTransport.ts`
  (the SW-serving transport, ported from web-lab's SW + previewPage)
- `src/preview/contentSecurityPolicy.ts` (two variants), `projectFiles.ts`
  (ported from web-lab)
- `src/engine/**` (§10)
- Tests: `src/engine/**/__tests__/*`, `src/runtime/__tests__/*`

Changed, in `packages/labs/world/`:

- `preview/WorldPreview.tsx` — real visible iframe replacing the placeholder.
- `src/App.tsx` — add a `WorldRuntimeProvider` (mirror python) preloading on
  mount and supplying the Codebridge runtime.
- `src/config.ts` — add `.png` as supported-non-editable; keep editable types.
- `src/constants.ts` — `DEFAULT_PROJECT` becomes the slice project; entry
  constant `scenes/main.js`.
- `src/main.tsx` — call `setAssetBaseUrl` for the demo; `?world-sandbox=` drives
  isolated mode.
- `package.json` — add `phaser` (v4), `esbuild-wasm`, `concurrently`; add
  `dev`/`dev:sandbox`/`dev:isolated`/`setup:world` scripts; `worker:{format:'es'}`.
- `README.md` — document `dev:isolated`, `?world-sandbox=`, the single-origin
  caveat, the self-hosting script (mirror web/python READMEs).
- `.gitignore` — ignore `public/` self-hosted assets.

Studio side: none beyond the existing registration.

## 13. Testing

Unit first, then browser:

- **Engine** — Vitest, headless. The ECS core is pure: cover step ordering
  (before/after, cycle detection), reference-counted trait resolution, the
  deferred event queue, and a full Spatial+Motion+Gravity tick producing
  expected positions for a given `delta`. Correctness lives here.
- **Compiler** — Vitest against a small in-memory `PreviewFiles` map (esbuild-wasm
  runs in Node): resolves relative + JSON imports, marks `world-lab`/`phaser`
  external, surfaces a compile error with a location, and a warm-context rebuild
  reflects a changed file.
- **Driver + Phaser + sandboxes** — not unit-testable in jsdom (WebGL/canvas,
  real iframes, cross-origin messaging, service worker). Verify with Playwright
  driving `dev:isolated` (lab :5139, sandbox :5202): canvas renders, sprite
  moves and lands, console relays, `set_property` takes effect — the approach
  that previously caught a bug Vitest could not.

## 14. Dependencies to add

- `phaser` — Phaser 4. Added as `phaser@^4.2.1` (dependency). Confirmed in
  milestone 0: ships ESM, no wasm, no eval. Not in the shared catalog; pinned
  in-package.
- `esbuild-wasm` — the browser bundler for the compile sandbox. Added as
  `esbuild-wasm@^0.28.1` (dependency). Self-hosted; not the Node-only native
  `esbuild` already present transitively.
- `concurrently` (dev) — the multi-port script, as web/python use. Not yet added.

## 15. Risks and open questions

- **Phaser 4 packaging + wasm.** RESOLVED (milestone-0 Spikes A & C, see
  `spikes/milestone-0/FINDINGS.md`): Phaser 4.2.1 ships ESM, uses no wasm and no
  eval, and renders under a bare `script-src 'self'` with zero CSP violations.
  The preview surface stays wasm-free and learner wasm is refused outright.
- **`'wasm-unsafe-eval'` support.** Recent CSP keyword; engines predating it
  fall back to `'unsafe-eval'`. Verified working on chromium-1228; the older
  browser matrix is still unchecked.
- **esbuild-wasm size + boot + init options.** RESOLVED enough to proceed:
  self-hosted, `initialize` ~4 ms and warm incremental rebuild ~10 ms in Node
  (Spike B). Two required init details (Spike C): `worker: false` (else it
  needs `worker-src blob:`) and the compile surface's `connect-src 'self'` (for
  the wasm fetch). Browser boot time on a cold load still to be measured under
  the real self-hosting path.
- **Compile→preview transport.** RESOLVED (milestone 2, `spikes/milestone-2/`):
  the live round-trip works across two real origins under the production CSPs —
  the compile surface bundles and stores the module in the SW, and the preview
  surface imports the SW-served URL and runs it under `script-src 'self'`. The
  `BroadcastChannel` + blob fallback remains available if needed.
- **Hot-reload Levels 2–3.** State-preserving code swap and structural reconcile
  are non-trivial; the id-keyed instance store makes them possible, but they are
  staged after the slice and may need iteration.
- **Per-project isolation in production.** The demo's single sandbox origin does
  not isolate projects from each other; production must restore legacy's
  per-project subdomain. The origin config must not hard-code a single host.
- **Editor typings for `world-lab`.** Learner TS autocomplete is a
  Codebridge-editor concern, deferred; the engine ships `.d.ts` so it is ready.
- **Blockly authoring (`.rule` / `.actor`).** DONE (milestone 6). The file types
  open in a Blockly workspace (via Codebridge's new `editorComponents`
  per-language seam → `src/blockly/BlocklyFileEditor.tsx`), stored as serialized
  JSON. `src/blockly/domainBlocks.ts` defines the Actor vocabulary (actor,
  traits, position, events, log), each carrying its `world-lab` generator;
  `src/blockly/BlocklyGenerator.tsx` transforms an authored file to JS before
  compile, so it runs through the same esbuild path unchanged. Events are their
  own free-floating top-level blocks (like `when_run`), so
  `src/blockly/assembleActorModule.ts` orders the generated blocks
  deterministically (actor first — TDZ-safe — then handlers, then the export).
  Verified in the browser (editor renders the floating blocks; the game runs)
  and unit-tested headlessly. Still open: a richer block/engine vocabulary
  (input, sprites) — see milestone 7.

## 16. Milestones

0. **Spikes** — DONE (`spikes/milestone-0/`, see `FINDINGS.md`). (a) Phaser
   4.2.1 self-hosts as ESM, needs no wasm/eval, renders under `script-src
'self'`; (b) esbuild-wasm warm-context bundling works (cold ~89 ms, warm
   ~10 ms) with `worker: false` + compile `connect-src 'self'`; a same-origin
   compiled module imports under `script-src 'self'`, blob needs `blob:`. §15's
   top risks resolved; specs updated. Remaining for later: the live
   two-iframe SW handoff and the older-browser `'wasm-unsafe-eval'` matrix.
1. **Engine core** — DONE. `src/engine/**` with Vitest coverage (§13). No DOM.
2. **Compile sandbox + transport** — DONE (`spikes/milestone-2/roundtrip.mjs`).
   `messages.ts`, `worldConfig.ts`, the esbuild compiler + virtual-FS plugin
   (Node-tested), `compile.html`/`preview.html` + `entry.ts`, the compile &
   preview worker managers, the parent managers, the transport SW, the
   self-hosting script + `dev:sandbox`/`dev:isolated`. The round-trip compiles a
   project, stores it in the SW, and imports+runs it in the preview across two
   origins under the production CSPs. No game yet.
3. **Preview sandbox + Phaser binding** — DONE
   (`spikes/milestone-3/roundtrip.mjs`). The engine grew a driver-facing render
   API (`World.renderSnapshot`, `SceneBuilder.getWorld`); `PhaserBinding`
   constructs `Phaser.Game` from the built World and reconciles each positional
   actor each frame; the preview imports the compiled Scene and runs it,
   relaying console. `world-lab` resolves via a **compiler URL rewrite** to the
   self-hosted `/vendor/world-lab.mjs` (one engine instance) — not an import map,
   which the preview's `script-src 'self'` would block inline. The round-trip
   renders a gravity actor that falls and lands, under the production CSPs.
4. **Hot reload Levels 0–1** — DONE (`spikes/milestone-4/roundtrip.mjs`). The
   preview reconciles instead of always restarting: on each rebuild it diffs the
   incoming world against the last build's `snapshot()`; if only world-scoped
   property values changed (same rules/actors/actor-values) it patches the
   running world in place (`setWorldProperty`) and keeps the game — Level 1,
   e.g. change gravity strength and see it live — otherwise it restarts
   (Level 0). The provider logs the outcome ("↻ Applied changes live" /
   "↻ Restarted the game"). Reconcile is pure logic over the engine's public
   `snapshot`/`setWorldProperty`, unit-tested headlessly. Level 2 (state-
   preserving code-body swap) and Level 3 (structural reconcile) remain.
5. **WorldPreview integration + Console + verification** — DONE
   (`spikes/milestone-5/verify.mjs`). `WorldRuntimeProvider` compiles the
   Codebridge sources on edit and runs them in the preview; `WorldPreview`
   mounts the preview iframe; the `ConsolePanel` shows relayed output, placed
   under the preview pane (or the editor when editor-only). `DEFAULT_PROJECT` is
   the gravity demo (no `index.html`); `config.ts` is code-only. Verified in a
   real browser via `dev:isolated`: the actor renders, falls, and lands, with
   console relayed to the box. (First `dev:isolated` load triggers a one-time
   Vite dep-optimization reload — reload the page once.)
6. **Blockly authoring — editor, domain blocks, generator** — DONE. `.rule` /
   `.actor` files open in a Blockly workspace (Codebridge `editorComponents`
   seam → `src/blockly/BlocklyFileEditor.tsx`), stored as serialized JSON.
   `src/blockly/domainBlocks.ts` is the Actor vocabulary (actor, traits,
   position, events, log), each block carrying its `world-lab` generator;
   `src/blockly/BlocklyGenerator.tsx` transforms an authored file to JS before
   compile so it runs through the same esbuild path unchanged. Events are their
   own free-floating top-level blocks (the code.org `when_run` idiom), so
   `src/blockly/assembleActorModule.ts` orders the generated blocks
   deterministically (actor first — TDZ-safe — then handlers, then the export).
   Verified in the browser (default project's player is a `.actor`; the editor
   renders the floating blocks; the game runs) and unit-tested headlessly
   (`assembleActorModule`, `domainBlocks` generators). The default project now
   pairs a JS scene/world with the Blockly-authored player.
7. **Richer vocabulary + interactivity** — IN PROGRESS. Grow the engine and
   blocks beyond the gravity demo. First slice DONE — keyboard input: the World
   gained a DOM-free input channel (`setInput`/`isKeyDown`), a new `input` rule
   (`engine/rules/input.ts`) adds a `ControlledByArrowsTrait` whose step drives
   horizontal velocity from the arrow keys (composing with gravity into a
   platformer), the Phaser binding reads cursor keys each frame, and the
   `world_use_trait` block gained a "Controlled by Arrow Keys" option. Unit-
   tested (`engine/__tests__/input.test.ts`) and browser-verified (the player
   falls, lands, and moves right under ArrowRight). Second slice DONE —
   sprites: a `SpriteProperty` on the positional trait names a built-in image;
   `renderSnapshot` reports it; `scripts/generate-sprites.mjs` writes the PNGs
   into `public/vendor/sprites/` (self-hosted like the other vendor assets — a
   pure-Node PNG encoder, no image dep); the Phaser binding preloads them and
   draws a textured `Image` per actor (rectangle fallback when no sprite); the
   `world_set_sprite` block picks one. `src/sprites.ts` is the shared name list,
   kept in sync with the generator and the files by a test. Browser-verified
   (player + ground render as sprites, not rectangles). Remaining: more
   traits/rules/events (incl. key-press _events_, which need per-actor event
   payloads), spritesheets/animations, and learner-supplied image assets (needs
   the project binary-asset pipeline).
