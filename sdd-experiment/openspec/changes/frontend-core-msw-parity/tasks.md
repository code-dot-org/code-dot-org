# Tasks: frontend-core-msw-parity

## 1. URL source of truth

- [ ] 1.1 Extract `<domain>.urls.ts` per wired domain; consume from
      `.api.ts` and existing `.handlers.ts`; no literal drift remains
      (grep gate)

## 2. Default handler coverage

- [ ] 2.1 Handlers for `users` (`current`: signed-out default +
      signed-in persona), `courses`, `sections`, `metrics`, `auth`
- [ ] 2.2 Register in `handlers.ts` after the fixture dispatch handler;
      preserve shadowing order
- [ ] 2.3 Vitest coverage: each new handler exercised through the real
      `DashboardApiClient` (mirroring music's fixture-contract test)

## 3. Schema validation of mocks

- [ ] 3.1 Wrap default-handler emission + `registerLabFixtures`
      desugaring in dev/test-gated `.parse()` against domain schemata
- [ ] 3.2 Negative test: a deliberately drifted handler body fails at
      the handler

## 4. Loader symmetry + docs

- [ ] 4.1 `getLabFixtures.ts`: annotate oceans' opt-out (or wire it, per
      owning-team preference recorded here)
- [ ] 4.2 Consolidate the scenario/fixture contract in
      `src/api/mocks/README.md` incl. the worker-`warn` vs vitest-`error`
      policy split and default-vs-fixture shadowing order

## 5. Validation

- [ ] 5.1 `VITE_API_MODE=msw yarn dev` in studio: navigate `/`, a music
      fixture URL, and a nonexistent-lab URL; zero unhandled-request
      errors; attach console capture
- [ ] 5.2 `yarn release:dryrun --filter @code-dot-org/core` and
      dependent packages green
