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

- [ ] 2.1 Replace the insertion regexes in `config.ts` with deterministic
      anchors across the four registration sites (design decision on the
      package.json anchor mechanism recorded here)
- [ ] 2.2 Post-generation assertion: all four edits present, exit
      non-zero with the failing file otherwise
- [ ] 2.3 Unit-test the modify actions against fixture copies of the
      registration files (ordering permutations included)

## 3. Conformance CI

- [ ] 3.1 Script: generate package + lab into a throwaway member, build,
      lint, diff scaffold file list against `packages.md`
- [ ] 3.2 Wire as a path-filtered job in `frontend-ci.yml`
      (`turbo/generators/**`, `docs/conventions/packages.md`)
- [ ] 3.3 Update `packages.md` + `AGENTS.md` coupling rule text to name
      the CI check as the enforcement mechanism

## 4. Validation

- [ ] 4.1 Run the full loop once in CI on this change's PR; attach the
      conformance job output
- [ ] 4.2 `yarn release:dryrun` unaffected packages untouched (turbo
      cache hit list attached)
