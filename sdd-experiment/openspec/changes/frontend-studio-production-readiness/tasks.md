# Tasks: frontend-studio-production-readiness

## 1. Auth primitive

- [ ] 1.1 Cache auth outcome in router context (fetch once per session;
      focus revalidation; invalidate on auth-mutating events)
- [ ] 1.2 `requireAuth` beforeLoad helper + signed-out behavior
      declaration; default-public documented
- [ ] 1.3 Unit tests + smoke-suite spec (fetch-count assertion via MSW)

## 2. Bundle budget

- [ ] 2.1 manualChunks vendor split (MUI/emotion/component-library vs
      app code); record per-chunk gzip sizes
- [ ] 2.2 Set the entry budget just above the post-split measurement
      (reviewer sign-off on the ratchet value); wire build-time
      enforcement
- [ ] 2.3 Negative test: an oversized entry fails the build

## 3. Config verification

- [ ] 3.1 Basepath lockstep test (vite.json, router basepath, Rails
      route)
- [ ] 3.2 Production hostname→environment mapping test in SiteConfig
- [ ] 3.3 File the DSN provisioning request; record owner + status
      (infra dependency, not code here)

## 4. Gate bookkeeping

- [ ] 4.1 Obtain the product ruling on the index route; record outcome
      (BLOCKED-EVIDENCE until then)
- [ ] 4.2 Cross-check the `studio-e2e-gate` job is required in branch
      protection; record
- [ ] 4.3 Draft the cutover-change skeleton (controller 404 + rake
      skips + rollout shape) referencing this spec — not executed here

## 5. Validation

- [ ] 5.1 `yarn release:dryrun --filter @code-dot-org/studio` +
      smoke suite green with auth caching and split chunks in place
- [ ] 5.2 Attach before/after chunk-size table to the PR
