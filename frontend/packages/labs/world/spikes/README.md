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
