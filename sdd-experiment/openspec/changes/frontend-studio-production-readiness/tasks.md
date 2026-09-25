# Tasks: frontend-studio-production-readiness

## 1. Auth primitive

- [ ] 1.1 Memoize `fetchAuthOutcome` (module-level cached promise);
      register a boot-time window-focus listener that clears the cache
      and calls `router.invalidate()`
- [ ] 1.2 `requireAuth` beforeLoad helper (reads cached outcome;
      redirect-to-Rails-sign-in or declared signed-out render);
      default-public documented
- [ ] 1.3 Unit tests + smoke-suite spec (fetch-count assertion via MSW)

## 2. Bundle budget

- [ ] 2.1 manualChunks vendor split (MUI/emotion/component-library vs
      app code); record per-chunk gzip sizes
- [ ] 2.2 `apps/studio/scripts/check-bundle-budget.mjs` (reads
      `.vite/manifest.json`, gzips the entry chunk, exits non-zero over
      budget); chain after `vite build`; set the budget just above the
      post-split measurement (reviewer sign-off on the ratchet value)
- [ ] 2.3 Negative test: an oversized entry fails the build

## 3. Config verification

- [ ] 3.1 Basepath lockstep test (vite.json, router basepath, Rails
      route)
- [ ] 3.2 Production hostname→environment mapping test in SiteConfig
- [ ] 3.3 MANUAL-TASK (infra): file the `frontend_studio_sentry_dsn`
      provisioning request; record owner + status. Does not block
      sections 1-2

## 4. Gate bookkeeping

- [ ] 4.1 MANUAL-TASK (product): obtain the index-route ruling; record
      outcome (BLOCKED-EVIDENCE until then; gates only the future
      cutover change, not this one)
- [ ] 4.2 MANUAL-TASK (repo admin): cross-check the `studio-e2e-gate`
      job is required in branch protection; record
- [ ] 4.3 Draft the cutover-change skeleton (controller 404 + rake
      skips + rollout shape) referencing this spec — not executed here

## 5. Validation

- [ ] 5.1 `yarn release:dryrun --filter @code-dot-org/studio` +
      smoke suite green with auth caching and split chunks in place
- [ ] 5.2 Attach before/after chunk-size table to the PR
