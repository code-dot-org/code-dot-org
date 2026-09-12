# Tasks: frontend-e2e-studio-gate

## 1. Suite scaffold

- [ ] 1.1 `apps/studio/e2e/` + `apps/studio/playwright.config.ts`,
      modeled on `packages/labs/oceans/playwright.config.ts`: webServer
      `{command: 'VITE_API_MODE=msw yarn dev', url: <from the port in
      apps/studio/config/vite.json> + '/frontend-studio/',
      reuseExistingServer: !process.env.CI}`, single chromium project,
      playwright from the catalog pin
- [ ] 1.2 Smoke specs: shell render + console-clean; music lab lazy
      chunk + `simple` scenario; unknown-lab 404; signed-out auth
      outcome (last one lands after frontend-core-msw-parity)

## 2. CI wiring

- [ ] 2.1 Add smoke job to `studio-ci.yml` using the existing Playwright
      container image (`PLAYWRIGHT_IMAGE_TAG` from `frontend-ci.yml`)
- [ ] 2.2 Extend the studio path filter in `frontend-ci.yml` with
      `frontend/packages/core/**`
- [ ] 2.3 MANUAL-TASK (repo admin): mark the smoke job required in
      branch protection after 4.1 passes; record who/when in the PR.
      Implementation does not block on this — the job runs either way

## 3. e2e-tests truthfulness

- [ ] 3.1 Remove or implement `@no_mobile` and `@no_ci`; document the
      tagging convention in the package README
- [ ] 3.2 Lane-truth section in the README (GHA vs Drone vs DTT: code
      seen, blocking or not)

## 4. Validation

- [ ] 4.1 10× local stress run of the suite (deflake gate) before
      marking the job required
- [ ] 4.2 Prove the gate: a scratch commit that blanks the root route
      must fail the job (attach run link, then drop the commit)
- [ ] 4.3 Record suite wall time; keep under the minutes-not-tens
      budget or cut specs
