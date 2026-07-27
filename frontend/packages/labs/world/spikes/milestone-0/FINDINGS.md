# Milestone-0 Spike Findings

De-risking spikes for the World Lab driver (`PLAN.md` §16 milestone 0). These
harnesses are throwaway — they exist to answer the questions the plan flagged as
load-bearing before the vertical slice is built. All three ran green on
`chromium-1228` (Playwright) and Node 22 in this workspace.

Run them:

```
node spikes/milestone-0/esbuild-spike.mjs     # Spike B (Node)
node spikes/milestone-0/spike-c.mjs           # Spike C (drives headless chromium)
```

## Spike A — Phaser 4 packaging + wasm needs

Method: install `phaser@4.2.1`; inspect the package and its ESM build; confirm
at runtime in Spike C.

- Phaser 4 is **released and stable** (`latest = 4.2.1`), and ships a real ESM
  build (`dist/phaser.esm.js`, ~1.37 MB minified) — self-hostable as a module.
- **Zero `.wasm` files; zero `WebAssembly.*` calls** in the ESM build.
- The only dynamic-code pattern is the webpack global-`this` shim
  `new Function('return this')()`, which is guarded by
  `if (typeof globalThis === 'object') return globalThis;` **before** it and
  wrapped in try/catch — so modern browsers return early and never reach it.
- Runtime (Spike C): Phaser boots and renders a sprite under a **bare
  `script-src 'self'`** — no `'unsafe-eval'`, no `'wasm-unsafe-eval'` — with
  **zero Phaser-attributable CSP violations** (verified by reading back a green
  sprite pixel, `centerPixel [51,204,102,255]`).

**Verdict:** the preview surface keeps `script-src 'self'` with **no**
`'wasm-unsafe-eval'`. Learner-supplied `.wasm` is therefore refused outright.
This is the best-case CSP the plan hoped for.

## Spike B — esbuild-wasm warm-context bundling (Node)

Method: a warm `esbuild.context()` with an in-memory virtual-FS resolve/load
plugin bundles a stand-in learner project (the `PreviewFiles` shape
`projectFiles.getPreviewFiles` emits).

- Bundles multi-file → one ESM module; keeps `world-lab` **external**;
  transpiles **TypeScript**; resolves **root-relative bare** specifiers
  (`worlds/platform`), **relative** imports, and **JSON** imports.
- Timings: esbuild-wasm `initialize` **4 ms**, cold build **89 ms**, warm
  incremental `rebuild()` **10 ms**.

**Verdict:** the compile approach works, and the warm-context incremental
rebuild (~10 ms) is fast enough to feed live hot reload. The spike's plugin is a
working prototype of `virtualFsPlugin.ts`.

## Spike C — browser CSP + import + render

Method: native esbuild bundles the two harness entries; a Node server serves
them under precise per-mode CSP **response headers**; headless chromium runs
them and reports results + `securitypolicyviolation` events. All 8 assertions
pass.

### Compile surface (Q1)

| CSP                                                        | esbuild init | note                                                              |
| ---------------------------------------------------------- | ------------ | ----------------------------------------------------------------- |
| `script-src 'self' 'wasm-unsafe-eval'; connect-src 'none'` | **fails**    | wasm _fetch_ blocked (`connect-src`, `/esbuild.wasm`)             |
| `script-src 'self'; connect-src 'self'`                    | **fails**    | instantiation blocked — `'wasm-unsafe-eval'` is required          |
| `script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'` | **succeeds** | inits, keeps `world-lab` external, transpiles TS, zero violations |

Two consequences the plan/spec must absorb:

1. **`connect-src 'self'` is required on the compile surface**, not `'none'`:
   esbuild-wasm fetches its own `esbuild.wasm`, and a `fetch` is governed by
   `connect-src`. This is same-origin only and the surface is sessionless and
   runs no learner code, so it grants the learner nothing. (Alternative: inline
   the wasm bytes and instantiate from memory to keep `connect-src 'none'`, at
   the cost of a ~10 MB base64 blob in the bundle. Not worth it.)
2. **`initialize({worker: false})` is required.** By default esbuild-wasm spawns
   a **blob-URL Web Worker**, which needs `worker-src blob:`; that hung
   `initialize()` under the tight CSP. Running esbuild on the (idle, hidden)
   compile surface's main thread avoids `worker-src blob:` entirely.

Resulting compile-surface CSP:
`default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'`.

### Preview surface (Q2 + Q3)

- **Q2:** Phaser renders under `script-src 'self'` (see Spike A verdict).
- **Q3 transport:** a compiled module served from a **same-origin URL** imports
  and runs under `script-src 'self'` — the preferred service-worker transport
  keeps the CSP tight. A **blob** import is **blocked** under `script-src 'self'`
  (`script-src-elem`/`blob`) and works only once `blob:` is added — confirming
  the fallback transport's exact CSP cost.

Resulting preview-surface CSP:
`default-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' blob: data:`
(add `blob:` to `script-src` **only** if the blob-transport fallback is used).

## Net effect on the plan

- Phaser-wasm risk (`PLAN.md` §15): **resolved** — preview stays wasm-free.
- Compile CSP: **`connect-src 'self'` + `initialize({worker:false})`** (was
  `connect-src 'none'`); `'wasm-unsafe-eval'` confirmed necessary and
  sufficient.
- Transport: **service-worker (same-origin URL) preferred and viable under
  `script-src 'self'`**; blob fallback costs `script-src blob:`.
- `'wasm-unsafe-eval'` browser-support caveat still stands (untested on the
  older matrix; chromium-1228 supports it).
