# Changelog

## 0.1.0-alpha.0 (2026-06-02)

### Bug Fixes

- **oceans-lab:** address Copilot a11y feedback on interactive elements ([72017ff](https://github.com/code-dot-org/code-dot-org/commit/72017ffb7a6b9ead709d9b63e75a3a72a27e1092))
- **oceans-lab:** apply [#72474](https://github.com/code-dot-org/code-dot-org/issues/72474) alignment, wire CSS to studio, type cleanup ([cba225e](https://github.com/code-dot-org/code-dot-org/commit/cba225e7f194af3514151d268fc3f522fa88e1cf))
- **oceans-lab:** declare playwright as direct dep, bump to 1.59.1 ([9e3cb2d](https://github.com/code-dot-org/code-dot-org/commit/9e3cb2db275576b6da08224e811123925ca37583))
- **oceans-lab:** replace span[role=button] with button for media controls ([33b96a4](https://github.com/code-dot-org/code-dot-org/commit/33b96a4fb1f884fea7a7f12677aa072ced1a19fd))
- **oceans-lab:** use react/experimental types for inert prop ([d3675bc](https://github.com/code-dot-org/code-dot-org/commit/d3675bc2a6f2a8d01aa065cd4d649860a1b47cbd))

### Features

- **oceans-lab:** make publishable with localization API ([fc785c8](https://github.com/code-dot-org/code-dot-org/commit/fc785c8c079b0df3f3b2a0191d72fc8c111e72f5))

### Performance

- **oceans-e2e:** run 4 parallel workers in CI ([c5a4ab1](https://github.com/code-dot-org/code-dot-org/commit/c5a4ab1b14e37d52d6b85489cd1643836cfadd15))
- **oceans-e2e:** use 100% of CPUs in CI, auto-detect locally ([e4dbcbb](https://github.com/code-dot-org/code-dot-org/commit/e4dbcbb361c952c8246ab0c76d099d728b0c5366))

### Chores

- **oceans-lab:** address review feedback on [#72746](https://github.com/code-dot-org/code-dot-org/issues/72746) ([1863253](https://github.com/code-dot-org/code-dot-org/commit/1863253886811d9f579be5c060d3e5852767caed))
- **oceans-lab:** clean up AGENTS.md stack description ([90133aa](https://github.com/code-dot-org/code-dot-org/commit/90133aae5c42a2c29d9f1c77c55de92ce5a7a131))
- **oceans-lab:** drop screenshot scripts and revert AGENTS.md from [#72746](https://github.com/code-dot-org/code-dot-org/issues/72746) ([7e4ceb8](https://github.com/code-dot-org/code-dot-org/commit/7e4ceb865946c3eb2326d4dc28689069088158d9))
- **oceans-lab:** move ml-activities into frontend/packages/labs ([2e937a4](https://github.com/code-dot-org/code-dot-org/commit/2e937a490c81946a2e705f67fd8cd7a48d8d1964))
- **oceans-lab:** rename .js/.jsx to .ts/.tsx (no content changes) ([3649e86](https://github.com/code-dot-org/code-dot-org/commit/3649e86fb82b449dd8fbc664993bb55e50464457))
- **oceans-lab:** trim oceansLab.css opt-in comment ([49c5ca9](https://github.com/code-dot-org/code-dot-org/commit/49c5ca924e680e1a6f6ed0c6e907f5c11870cb44))

### Refactors

- **oceans-e2e:** move POMs into e2e/poms/ subdirectory ([41f4354](https://github.com/code-dot-org/code-dot-org/commit/41f4354bc06ce9d40c62b8229a8de07a67e4e266))
- **oceans-e2e:** split OceansPage.ts into one file per POM ([8add0ca](https://github.com/code-dot-org/code-dot-org/commit/8add0ca16bdcb992e1de390d8cc9631608024094))
- **oceans-lab:** replace Radium with CSS classes (closes [#72592](https://github.com/code-dot-org/code-dot-org/issues/72592)) ([4b4ac5e](https://github.com/code-dot-org/code-dot-org/commit/4b4ac5eedb75243e6e5d346ce6c75f94443d31dd))
- **oceans-lab:** swap toolchain to vite + lint-config + tsx + Playwright ([ab7ced6](https://github.com/code-dot-org/code-dot-org/commit/ab7ced64016a58e3e541534a64d10043ce5f5af5))
