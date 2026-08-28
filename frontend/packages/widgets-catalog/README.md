# @code-dot-org/widgets-catalog

Reviewed, versioned widget artifacts graduated from Author Mode's authoring
session. A widget lives here once it has been through a real pull request —
see `frontend/docs/prototypes/author-mode.md` for the authoring-session side
of the flow this package's widgets graduated from.

## Layout

```
widgets/<slug>/
  src/            # TSX package source, copied verbatim from a session widget
  widget.json     # manifest: version, inputSchema, eventTypes, sourceHash,
                  # docHash, pinned toolchain versions, recorded gate results
  CHANGELOG.md    # one entry per version
```

`dist/<slug>/widget.html` and `dist/manifest.json` are build output, not
committed — see "Why CI-built, not committed dist" in the widget PR flow
plan. Run `yarn workspace @code-dot-org/widgets-catalog build` to produce
them locally.

## Public API

- `buildWidget(widgetDir, title)` — the one esbuild configuration that
  bundles a widget's `src/index.tsx` (React, react-dom, and
  `@code-dot-org/component-library` — CSS included — into one self-contained
  document). Both the authoring service (rebuilding a session widget live)
  and this package's own `buildCatalog()` call this same function, so a
  document built at authoring time and a document built in CI can never
  disagree about how the bundle was produced.
- `checkWidgetDocument(html)` — the contract gates (network-free, real
  `McpApp` usage, size cap, static a11y checks) against a widget's SERVED
  document.
- `hashWidgetSource(srcDir)` / `hashWidgetDoc(html)` — the hashes recorded in
  `widget.json`.
- `WidgetManifestSchema` — the zod schema for `widget.json`.
- `buildCatalog()` — builds every widget in `widgets/`, writing
  `dist/<slug>/widget.html` and `dist/manifest.json`.

## Scripts

- `yarn build` — compiles this package's own TypeScript, then runs
  `buildCatalog()`.
- `yarn test:gates` — for every widget: rebuilds it, asserts `sourceHash`/
  `docHash` still match what `widget.json` records, runs
  `checkWidgetDocument`, validates `widget.json` against the zod schema, and
  checks `CHANGELOG.md` has an entry for the recorded version. This is the
  gate CI runs; run it locally before proposing a change to a widget.
- `yarn widgets:rehash` — recomputes `sourceHash`, `docHash`, `toolchain`,
  and `gates` for every widget and rewrites `widget.json` in place. Run this
  after editing a widget's source, or after a toolchain/dependency bump
  (component-library, widget-runtime, esbuild) that would otherwise leave
  every `docHash` stale.

## Toolchain pinning

`esbuild` and the workspace deps this package's widgets bundle
(`@code-dot-org/component-library`, `@code-dot-org/widget-runtime`) are
pinned to exact versions, not ranges — `docHash` reproducibility depends on
the toolchain being identical between the machine that ran
`widgets:rehash` and the one that later verifies it in `test:gates`/CI.
