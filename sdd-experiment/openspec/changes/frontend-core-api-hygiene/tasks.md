# Tasks: frontend-core-api-hygiene

## 1. Pre-flight

- [ ] 1.1 Grep open PR branches (accounts/users stack) for imports of the
      surface slated for deletion; sequence behind any real consumer
- [ ] 1.2 Audit for legitimate cross-origin authenticated calls through
      the transport (expected: none)

## 2. Deletions

- [ ] 2.1 Delete `src/api/package.json`; verify build output and exports
      map unchanged (`yarn build` + diff `dist/` listing)
- [ ] 2.2 Delete `src/api/dashboard/lessons/`; remove any type re-exports
- [ ] 2.3 Remove `src/api/contexts/` exports (record the re-add path in
      the app-package-conventions change)
- [ ] 2.4 Consolidate `getCurrent.ts` into `users.api.ts`; migrate the
      factory consumer; delete the raw-ky path

## 3. Behavior fixes

- [ ] 3.1 replayTransport: blob requests throw explicit unsupported
      error; unit test the path
- [ ] 3.2 Decide `record` mode: wire into `bootstrapApiClient` or remove
      from the transport; test whichever lands
- [ ] 3.3 `users.schemata.ts`: drop `'admin'` from `user_type`; verify
      against `api/v1/users_controller.rb#current` render
- [ ] 3.4 kyTransport: same-origin guard on `X-CSRF-Token`; unit tests
      for same-origin, API-origin, and third-party cases

## 4. Validation

- [ ] 4.1 `yarn release:dryrun --filter @code-dot-org/core` green
      (143-test baseline must not shrink except deleted-surface tests)
- [ ] 4.2 `turbo build` of all core consumers (studio, music, users,
      markdown, oceans) green
- [ ] 4.3 Security review sign-off on 3.4 recorded in the PR
