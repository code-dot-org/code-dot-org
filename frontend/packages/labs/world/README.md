# @code-dot-org/world-lab

World Lab, built on the Codebridge shell (`@code-dot-org/codebridge`). It edits a
multi-file project and renders that project in a preview pane as a web-based
iframe running a Phaser 4 game world.

Its structure mirrors `@code-dot-org/web-lab`: the default export is the studio
lab entrypoint, accepting no props (the host renders the single `<Lab>` and
publishes level data to context). It renders `<CodebridgeLab>` wrapping
`WorldLayout`.

## Status

This is a scaffold. Ported/present:

- The shell composition — config, default project, layout, demo harness.
- `WorldLayout`, mirroring `web-lab`'s `WebLayout`: an instructions / resource
  panel on the far left, and beside it one workspace column holding the editor
  and the preview as two panes under a shared header. The header's segmented
  buttons collapse the split to either pane alone; every divider drags to resize
  and restores its default size on double-click.

Deliberately deferred (World Lab gets its own, later):

- **The Phaser 4 runtime.** `WorldPreview` is a self-contained placeholder
  iframe. It does not yet read the Codebridge project sources or boot a Phaser
  game; that wiring is the next increment. See `src/preview/WorldPreview.tsx`.
- The debug panel (console + network). `web-lab`'s is coupled to its
  service-worker HTML preview; World Lab will grow its own once the Phaser
  runtime lands.
- Additional editors and file types beyond the starting HTML / JS / JSON / MD /
  TXT set — added to `src/config.ts` as the lab grows.

## Layout

```
┌─────────────┬───────────────────────────────────────┐
│             │ [Code|Preview|Split]   header         │
│ instructions├───────────────────┬───────────────────┤
│             │ editor            │ world preview     │
└─────────────┴───────────────────┴───────────────────┘
```

The shared pieces — `InfoPanel`, `Workspace` — come from the Codebridge package;
`PanelContainer`, `ResizeHandle`, and `WorkspaceHeader` come from
`@code-dot-org/lab` (base).

## Standalone demo

`yarn dev` serves a harness (`index.html` + `src/main.tsx`) at
http://localhost:5139 — no Rails backend. It mounts the App with the provider
stack the studio host normally supplies, plus a fixture level served by MSW, so
the full shell renders.

Fixture scenarios load by channel id:

```
http://localhost:5139/frontend-studio/projects/world/simple/edit
```

The lab is registered with the studio app in
`frontend/apps/studio/src/modules/labs/config/labs.ts` and reachable there at
`/app/projects/world/:channelId/edit`.

## Scripts

- `yarn dev` — standalone demo harness on :5139
- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
