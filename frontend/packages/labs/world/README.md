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
the game recompiles and reloads; `console.log` from the game appears in the
Console box.

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

## Scripts

- `yarn dev` — lab dev server on :5139
- `yarn dev:sandbox` — sandbox dev server on :5202 (serves `compile.html` /
  `preview.html`)
- `yarn dev:isolated` — both, in parallel
- `yarn setup:world` — self-host the sandbox assets into `public/vendor/`
- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
