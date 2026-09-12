# Tasks: frontend-generator-catalog-alignment

## 1. Template fixes

- [ ] 1.1 `templates/lab/package.json.hbs` + `templates/package/
      package.json.hbs`: react/react-dom/@types → `catalog:`; peer ranges
      → `^18.0.0 || ^19.0.0`
- [ ] 1.2 Reconcile template devDeps against `labs/music` (add
      `@testing-library/dom`; document deliberate omissions)
- [ ] 1.3 Regenerate a scratch lab locally; `yarn install` +
      `turbo build --filter` green; single React resolution verified via
      `yarn why react`

## 2. Registration robustness

- [ ] 2.1 Add `// turbo-gen:<slot>` markers to `labs.ts`,
      `getLabEntrypoint.ts`, `getLabFixtures.ts`; rewrite their modify
      actions to insert before the marker
- [ ] 2.2 Replace the `apps/studio/package.json` regex with a
      JSON parse → insert dep → stringify → prettier custom action
- [ ] 2.3 Post-generation assertion: re-read all four files, verify the
      lab key in each; exit non-zero naming the failing file otherwise
- [ ] 2.4 Unit-test the modify actions against fixture copies of the
      registration files (ordering permutations included)

## 3. Conformance CI

- [ ] 3.1 Script `frontend/turbo/generators/scripts/check-conformance.mjs`:
      run both generators non-interactively (fixed name
      `tmp-gen-conformance`), `turbo build --filter` + lint the output,
      diff its file list against the list in `packages.md`, then restore
      (`git checkout -- yarn.lock apps/studio/package.json src-files`,
      `git clean -fd` generated dirs)
- [ ] 3.2 Wire as a path-filtered job in `frontend-ci.yml`
      (`frontend/turbo/generators/**`, `frontend/docs/conventions/
      packages.md`)
- [ ] 3.3 Update `packages.md` + `AGENTS.md` coupling rule text to name
      the CI check as the enforcement mechanism

## 4. Validation

- [ ] 4.1 Run the full loop once in CI on this change's PR; attach the
      conformance job output
- [ ] 4.2 `yarn release:dryrun` unaffected packages untouched (turbo
      cache hit list attached)
