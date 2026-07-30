# spikes/

Throwaway de-risking harnesses, not part of the package build or its tests
(`spikes/` is outside `src/`, so Vite, Vitest, and `tsc -b` ignore it). Each
subdirectory answers a specific question the plan flagged before committing to
an implementation, and records the answer alongside the code. Delete a spike
once its findings have been absorbed into the real code and it stops being a
useful reference.

## milestone-0/

De-risks the driver's foundations (`specs/PLAN.md` §16 milestone 0). See
`milestone-0/FINDINGS.md` for results.

- `esbuild-spike.mjs` — Node. Warm-context esbuild-wasm bundling of a stand-in
  learner project through an in-memory virtual-FS plugin. Run:
  `node spikes/milestone-0/esbuild-spike.mjs`
- `spike-c.mjs` + `browser/` — drives headless chromium (Playwright) to verify
  the two sandbox CSPs, module import, the transport, and a Phaser render. Run:
  `node spikes/milestone-0/spike-c.mjs`

## milestone-2/

End-to-end verification of the compile → SW → preview transport (`specs/PLAN.md`
§16 milestone 2), driving the real parent/iframe managers across two origins
under the production CSPs.

- `harness.ts` — lab-side page wiring `WorldCompileManager` + `WorldPreviewManager`.
- `roundtrip.mjs` — bundles the harness and the sandbox entry, serves the lab and
  the sandbox on separate ports with per-surface CSP headers, and asserts a
  2-file project compiles, stores in the SW, and imports+runs in the preview.
  Run: `yarn setup:world && node spikes/milestone-2/roundtrip.mjs`

## milestone-3/

End-to-end render verification (`specs/PLAN.md` §16 milestone 3): a learner
project importing `world-lab` compiles, loads in the preview, and the Phaser
binding renders it.

- `harness.ts` — lab page that also captures the preview's relayed console.
- `roundtrip.mjs` — asserts a gravity actor renders (green sprite on the canvas),
  falls, and lands (relayed `startsFalling`/`stopsFalling`), under the production
  CSPs. Run: `yarn setup:world && node spikes/milestone-3/roundtrip.mjs`

## milestone-4/

Level-1 hot-reload verification (`specs/PLAN.md` §16 milestone 4): three
sequential loads across the real sandbox under the production CSPs.

- `harness.ts` — exposes `window.__load(files, entry)` returning the reload report.
- `roundtrip.mjs` — asserts base → `built` (900), a strength-only edit →
  `reconciled` (live-patched to 1500, no restart), and an actor-value edit →
  `restarted`. Run: `yarn setup:world && node spikes/milestone-4/roundtrip.mjs`.

## milestone-5/

Browser check of the whole lab (`specs/PLAN.md` §16 milestone 5). Unlike the
others it drives the real dev servers rather than self-serving.

- `verify.mjs` — with `yarn dev:isolated` running, opens the lab and asserts the
  game renders (green sprite) and the Console box shows the actor landing. Run:
  `yarn dev:isolated` (separately), then `node spikes/milestone-5/verify.mjs`.
  (Reload once on the first run — Vite optimizes `phaser`/`esbuild-wasm` and
  reloads the sandbox iframes.)

## project-rules/

De-risks relocating the standard rule library from the engine bundle into the
learner's project as source (the "rules as `.rule`/`.js` files" direction;
`specs/PLAN.md:249`, `specs/INTERFACE.md`). Answers whether a `RuleBuilder` rule
authored in a project file compiles and runs in the preview. See
`project-rules/FINDINGS.md` for results — the runtime half works; the editor half
(project-driven block generation) is next.

- `rules/gravity.js` — a from-scratch project port of the built-in Gravity rule.
- `scenes/spike.js` — a JS scene running it end to end (player falls and lands).
  Verified by adding both to `DEFAULT_PROJECT`, pointing `ENTRY_FILE` at the
  spike, driving the preview headless, then reverting.
