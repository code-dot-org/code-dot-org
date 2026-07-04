# Tasks: frontend-app-package-conventions

## 1. Contract

- [ ] 1.1 Write the app-package conventions section/doc (contract items
      per spec; oceans-smell examples named in the accommodation budget)
- [ ] 1.2 Record the client-injection decision (singleton; context
      return-path) with `frontend-core-api-hygiene` cross-reference
- [ ] 1.3 Studio route-integration recipe (route file shape, lazy
      boundary, signed-out auth outcome contract)

## 2. Generator

- [ ] 2.1 `app-package` generator + templates (structure, `./mocks`
      persona stub, dev shell with `?scenario=`, vitest+axe baseline)
- [ ] 2.2 Extend the conformance CI check to the new generator
- [ ] 2.3 Conventions-doc file list updated in the same PR (coupling
      rule)

## 3. Reference implementation

- [ ] 3.1 Bring `packages/users` scaffold into conformance (structure,
      mocks stub, dev shell, README "Planned" framing retained) — no
      product features
- [ ] 3.2 Scratch-generate an app package; verify it builds and its dev
      shell serves personas; discard

## 4. Validation

- [ ] 4.1 `yarn release:dryrun` across touched packages green
- [ ] 4.2 Review sign-off from the Teacher Dashboard planning owners
      that the contract covers their integration shape (recorded, not
      blocking their specs)
