# @code-dot-org/world-lab

World Lab, built on the Codebridge shell (`@code-dot-org/codebridge`). It edits a
multi-file project and renders that project in a preview pane as a web-based
iframe running a Phaser 4 game world.

Its structure mirrors `@code-dot-org/web-lab`: the default export is the studio
lab entrypoint, accepting no props (the host renders the single `<Lab>` and
publishes level data to context). It renders `<CodebridgeLab>` wrapping
`WorldLayout`.

## How it runs

The lab edits a project and runs it as a Phaser 4 game inside an **isolated
sandbox on a separate origin** — student code never runs on the lab's origin
(see `specs/SANDBOX.md`). The sandbox has two surfaces: a hidden **compile**
surface (esbuild-wasm bundles the project) and a visible **preview** surface
(the game canvas). The lab posts the sources down, the compile surface bundles
them, the transport service worker hands the module to the preview, and the
Phaser binding runs it. Console output is relayed back to the Console box.

See `specs/PLAN.md` for the full design and milestone status.

## File types and editors

Text files (`js`/`ts`/`json`/`md`/`txt`) edit in CodeMirror. Everything else has
its own editor, mounted through Codebridge's per-language editor seam
(`CodebridgeConfig.editorComponents`, parallel to `languageExtensions`). Each
one loads and saves through the same file `onChange` seam as CodeMirror, so
persistence is identical whatever the surface — except the image editor, whose
file has no text contents at all: it reads and writes the bytes on the file's
`url` (`UPLOADS.md`), and writes the `.sheet` beside a spritesheet. A `.sheet`
is not listed in the file browser (`hiddenFileTypes`); it belongs to the image
of the same name, which is what writes and deletes it.

| Type                       | Editor                                | On disk                    |
| -------------------------- | ------------------------------------- | -------------------------- |
| `rule` / `actor` / `world` | `src/blockly/BlocklyFileEditor`       | a Blockly workspace (JSON) |
| `map`                      | `src/mapEditor/MapEditor`             | world population (JSON)    |
| `anim`                     | `src/animationEditor/AnimationEditor` | an animation file (JSON)   |
| `effect`                   | `src/effect/EffectFileEditor`         | a shader graph (JSON)      |
| `png`                      | `src/imageEditor/ImageFileEditor`     | bytes, on the file's `url` |

An `.effect` is a node graph that compiles to a GLSL fragment shader — see
`src/effect/README.md` and `specs/EFFECT_EDITOR.md`. It travels through the
bundle as data and is compiled to GLSL in the preview surface, where Phaser is.

## Where a picture comes from

Nothing is built in. A game draws only what its project holds: an image is a
file (bytes on the file's `url`, the same shape an uploaded PNG has) and an
animation is a `.anim` that reads rectangles out of one. The driver preloads the
project's images and nothing else, and every `.anim` in the project is registered
when the world is built — there is no `use animations` block, because an
animation file is not something a world opts into, it is something the project
has.

The library at `src/appearance/stock.ts` is a shelf to copy from, reached by the
`(import…)` row on a `set sprite` or `play animation` dropdown. Importing writes
real files — an animation brings the image it reads — and from then on they are
the learner's: repaintable, renamable, deletable. The drawings live in
`scripts/generate-sprites.mjs`; `scripts/write-stock-assets.mjs` turns them into
the data URLs the library hands out (`src/appearance/stockImages.ts`, generated
and committed).

## What a level can say

Most of a World level is its starting project, but a few of the editor's
affordances are teaching decisions rather than preferences, and those live in
the level's own data (`src/levelData.ts`):

| `levelData` field | Default | What turning it off does                                                  |
| ----------------- | ------- | ------------------------------------------------------------------------- |
| `showRuleSource`  | on      | Removes the eye on `use rule` / `use trait` that opens the file behind it |

Level properties are validated on the way in and **zod drops keys it was not
told about**, so a field only reaches the lab because `src/schema.ts` declares
it and `App.tsx` registers that schema for the `world` kind. A new field added
to one and not the other parses away silently, and every level looks like the
default one.

## Layout

```
┌─────────────┬───────────────────────────────────────┐
│             │ [Code|Preview|Split]   header         │
│ instructions├───────────────────┬───────────────────┤
│             │ editor            │ world preview     │
│             │                   ├───────────────────┤
│             │                   │ console           │
└─────────────┴───────────────────┴───────────────────┘
```

The shared pieces — `InfoPanel`, `Workspace` — come from the Codebridge package;
`PanelContainer`, `ResizeHandle`, and `WorkspaceHeader` come from
`@code-dot-org/lab` (base). The Console box follows the running game: under the
preview pane in split / preview-only view, under the editor when the editor is
the only pane.

## Standalone demo

The lab and the sandbox run on two origins (two dev ports). Run both:

```
yarn dev:isolated     # lab on :5139, sandbox on :5202
```

then open **http://localhost:5139/**. The demo defaults the sandbox origin to
`http://localhost:5202/`; override with `?world-sandbox=<url>`. Edit the code and
the game updates; `console.log` from the game appears in the Console box.

Edits reload as cheaply as possible: a change that only alters a world-scoped
property value (e.g. gravity strength) is **applied live** to the running game
with no restart; a structural or actor change **restarts** it. The Console notes
which happened ("↻ Applied changes live" / "↻ Restarted the game").

> Editing the **engine** (`src/engine/`) is different from editing lab code: the
> engine is served as a pre-bundled `public/vendor/world-lab.mjs`, so run
> `yarn setup:world` (or restart `dev`) to regenerate it — Vite HMR alone won't.

> The **first** load triggers a one-time Vite dependency optimization (`phaser`,
> `esbuild-wasm`) that reloads the sandbox iframes — reload the page once and it
> runs. Subsequent loads are warm.

> The demo's MSW mock saves your project to `sessionStorage`, so edits survive a
> reload. If you change `DEFAULT_PROJECT`'s shape in code (e.g. move the entry),
> a stale saved project can shadow it — load once with `?cdoMockReset=1` (or
> clear `sessionStorage`) to drop it.

`yarn dev` alone (lab only) shows the editor, but the preview says "no sandbox
origin configured" until the sandbox is also running. Both `dev` and
`dev:sandbox` run `yarn setup:world` first, which self-hosts the sandbox assets
(esbuild-wasm, Phaser, and the bundled engine `world-lab.mjs`) into
`public/vendor/`.

The lab is registered with the studio app in
`frontend/apps/studio/src/modules/labs/config/labs.ts` and reachable there at
`/app/projects/world/:channelId/edit`.

## Deploying the demo

`yarn build:demo` emits a static `dist-demo/` — the lab at the root, the two
sandbox surfaces under `sandbox/`, and the vendored assets. There is no backend:
the MSW mock answers the API and the project lives in `sessionStorage`, so the
whole thing is a directory anyone can serve. (`yarn build` is the LIBRARY build
the studio host consumes — different artifact, no HTML.)

Two knobs, both read at build time:

|                      |                                                                    |
| -------------------- | ------------------------------------------------------------------ |
| `VITE_WORLD_SANDBOX` | where the sandbox is served from: a URL, or `same-origin`          |
| `WORLD_DEMO_BASE`    | the path the build is served from, if not `/` (e.g. `/world-lab/`) |

Serve `dist-demo/` at exactly the base it was built for. Everything the app
addresses absolutely hangs off it — both service workers, `vendor/`,
`backgrounds/` — and a build moved elsewhere 404s on all of them.

### Two origins (what the design wants)

Deploy the same `dist-demo/` twice, at the same base path on each, and name the
sandbox:

```
VITE_WORLD_SANDBOX=https://world-sandbox.example/ yarn build:demo
```

The origin split is the security boundary (`specs/SANDBOX.md`): learner code
runs where it cannot reach the lab's cookies, storage, or DOM. Production goes
further and gives each project its own sandbox subdomain.

### One origin (GitHub Pages)

`yarn build:pages` builds for `https://<name>.github.io/world-lab/` — that is
`WORLD_DEMO_BASE=/world-lab/` plus `VITE_WORLD_SANDBOX=same-origin`. It exists
because Pages hands out an origin per ACCOUNT, not per repository: two repos are
two paths on one origin, and a second origin means a second org (`org.github.io`
is a root of its own) or a custom domain per site.

**This runs learner code on the lab's own origin, which the spec forbids in
production.** It is defensible for a demo that holds no session and none of
anyone else's work, and nothing selects it silently — a build has to ask for it.
Prefer two orgs and `VITE_WORLD_SANDBOX=https://<org>-sandbox.github.io/` if you
have them.

Sharing an origin means the lab's mock-API worker and the sandbox's build worker
are both service workers on one origin. They coexist because the sandbox
surfaces live under `sandbox/`, so the build worker's scope is narrower and each
client is controlled by the most specific scope that matches it
(`SANDBOX_SURFACE_DIR`). Two workers cannot share one scope: the later
registration evicts the earlier, which is why the surfaces are in a directory
rather than beside `index.html`.

The demo's `index.html` also carries `<meta name="cdo-api-url"
content="same-origin">`. Core resolves the dashboard API from the hostname, and
a host it does not recognise means `development` — `http://localhost-studio
.code.org:3000`. On an HTTPS deployment the browser refuses that as mixed
content, and it refuses it _before_ the request reaches a service worker, so the
mock never gets the chance to answer and nothing loads at all. The tag points
the API at the page's own origin instead, which the handlers match (`*​/v3/…`)
and which never leaves the page.

Serving requirements, learned by getting them wrong:

- **HTTPS** (or localhost). Both service workers need it — MSW serves the
  project, and the build worker serves the compiled module.
- `.wasm` as **`application/wasm`**. `WebAssembly.compileStreaming` refuses
  anything else, and esbuild's worker dies without a word. Pages sends it; a
  hand-rolled static server may not.
- No header control on Pages, so the sandbox CSP in `specs/SANDBOX.md` cannot be
  applied. Nothing breaks; a layer of defense in depth is simply absent.

`dist-demo/` is ~49MB, of which 22MB is vendored `esbuild.wasm` (13.9) and
`phaser.esm.js` (8.8) — inside the 1GB Pages site limit and the 100MB per-file
limit, but Pages will not compress the wasm.

A deployed build still fetches two things from elsewhere: the design system's
FontAwesome from `dsco.code.org`, and Blockly's media (trashcan and zoom
sprites, click sounds) from `static.blockly.com`. Both are HTTPS, so neither is
mixed content — they simply need those hosts to be reachable.

## Scripts

- `yarn dev` — lab dev server on :5139
- `yarn dev:sandbox` — sandbox dev server on :5202 (serves `sandbox/compile.html`
  / `sandbox/preview.html`)
- `yarn dev:isolated` — both, in parallel
- `yarn setup:world` — self-host the sandbox assets into `public/vendor/`
- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn build:demo` — static demo build → `dist-demo/` (see Deploying the demo)
- `yarn build:pages` — the same, built for `<host>/world-lab/` on one origin
- `yarn preview:demo` — serve `dist-demo/` on :5139 and :5202
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
