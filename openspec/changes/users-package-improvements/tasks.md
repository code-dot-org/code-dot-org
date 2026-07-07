# Tasks: users-package-improvements

All work in `frontend/packages/users/` unless noted. Per-task verification:
`yarn typecheck`, `yarn test`, `./tools/hooks/pre-commit` (repo root), and
`yarn build` where the dist artifact changes.

## 1. Resilience fixes (TDD)

- [ ] 1.1 Failing test: settings loaded + refetch error keeps the form
      mounted with dirty state; first-load error still shows the blocking
      branch. Then change the error gating in `UsersSettingsPage.tsx` to
      `isError && !settings.data` (same for current-user) and toast the
      refetch failure.
- [ ] 1.2 Failing test: firing the delete form's submit with acknowledgments
      incomplete sends no DELETE. Then add the gate check (`!canDelete ||
      mutation.isPending`) to `DeleteUserModal`'s submit action.
- [ ] 1.3 Failing test: double-firing a modal submit runs the action once.
      Then add the in-flight ref guard (cleared in `finally`) to
      `useModalForm.onSubmit`.
- [ ] 1.4 Test + fix: `document.title` restored on unmount in
      `UsersSettingsPage`.

## 2. Packaging fixes

- [ ] 2.1 Fix `package.json` `homepage`/`repository.directory` and the vite
      lib `name` to reference `frontend/packages/users`.
- [ ] 2.2 Move `md5` to `dependencies` (keep `@types/md5` dev); regenerate
      and COMMIT `frontend/yarn.lock`; `yarn build` and verify dist no
      longer inlines md5 (grep) and Studio dev still resolves it.

## 3. Hygiene

- [ ] 3.1 Hoist the teacher delete-warning legal copy to one exported
      definition shared by `UsersActions.tsx` and `DeleteUserModal.tsx`.
- [ ] 3.2 Type field-error keys: `KnownField` union derived from a
      `KNOWN_FIELDS as const` tuple in `users.types.ts`;
      `FieldErrors = Partial<Record<KnownField, string[]>>`; adjust
      `UsersApiValidationError` narrowing; confirm a typo'd key fails tsc.
- [ ] 3.3 Deduplicate `NO_OP`/`NOOP` into one shared constant.
- [ ] 3.4 README: correct the scenario/persona list to match
      `USERS_SCENARIO_TAGS`; fix the garbled "Mutations are package-local"
      sentence to say the data layer lives in `@code-dot-org/core/api`.

## 4. Parity verification

- [ ] 4.1 Check legacy `/users/edit` (dashboard) for username-edit gating on
      locked word/picture accounts; record the finding as a comment on the
      username field in `LoginInformation.tsx`; if legacy locks it, gate on
      the closest existing entitlement and add a test.

## 5. Final gate

- [ ] 5.1 Full package pass: `yarn typecheck && yarn test && yarn build`
      plus `./tools/hooks/pre-commit`; run the standalone dev host and click
      through one modal flow per scenario touched.
