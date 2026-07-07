# Proposal: users-package-improvements

## Why

A post-implementation review of `@code-dot-org/users` (the accounts module,
PR series B1–B6) found one data-loss bug, two packaging defects, and a set of
hardening and hygiene gaps. None block the feature, but the data-loss bug and
the delete-account gate are worth fixing before the module ships, and the
rest are cheapest to fix now while the package is small and unshipped.

## What Changes

- **Fix: a failed refetch discards user edits.** `UsersSettingsPage` renders
  the blocking error branch whenever a settings or current-user query is in
  error state, even when cached data exists. A failed background refetch
  (e.g. the invalidation refetch after a modal mutation) unmounts the form
  and the user's dirty SaveBar state with it. The blocking error becomes
  first-load-only; with data present the form stays mounted and the failure
  surfaces non-destructively.
- **Fix: stale package metadata.** `package.json` `homepage` and
  `repository.directory` point at `frontend/packages/accounts`; the package
  lives at `frontend/packages/users`. Same for the `name: 'accounts'` lib
  option in `vite.config.ts`.
- **Fix: `md5` is a runtime import in `devDependencies`.**
  `src/util/hashEmail.ts` imports it at runtime, but `externalizeDeps()`
  only externalizes `dependencies`/`peerDependencies`, so md5 is silently
  inlined into the dist bundle — inconsistent with `tabbable`, which is
  declared and externalized. Move `md5` and `@types/md5` to `dependencies`.
- **Harden: enforce the delete-account gate in the submit handler.** The
  education-records acknowledgment gate in `DeleteUserModal` is enforced
  only by the `disabled` attribute on the submit button. The submit action
  re-checks the gate so it holds regardless of how the form is submitted.
- **Harden: re-entrancy guard in `useModalForm`.** All six modals rely on a
  disabled button for double-submit protection; the shared hook gains an
  in-flight guard so a second submit is a no-op.
- **Cleanup:** single source for the teacher delete-warning legal copy
  (currently duplicated verbatim in `UsersActions` and `DeleteUserModal`);
  restore `document.title` on unmount; fix README drift (scenario list,
  garbled data-layer sentence); type the field-error keys so a typo'd key
  fails tsc; deduplicate the `NO_OP`/`NOOP` constants.
- **Verify:** whether legacy `/users/edit` gates username editing for
  locked (word/picture) accounts; record the answer as a code comment, and
  fix parity if legacy locks it.

Out of scope: i18n. The package's strings are hardcoded English while legacy
`/users/edit` is localized; that is a scope decision for the accounts module
owners, not a defect fix, and is tracked separately.

## Capabilities

### New Capabilities

- `account-settings-resilience`: behavioral requirements for how the page
  survives partial failure — refetch errors must not discard edits,
  destructive submits must be gated in the handler, modal submits must be
  re-entrancy safe, the document title must not leak past the page.
- `users-package-packaging`: correctness requirements for the package
  artifact — metadata paths, runtime dependencies declared as such,
  README accuracy, one source of truth for legal copy, typed field-error
  keys.

### Modified Capabilities

<!-- none: accounts-module-v1's specs live in that change; no merged
     project-level specs exist to delta against. -->

## Impact

- `frontend/packages/users/` only; no Rails, no API, no other package.
- Behavior changes are user-invisible except under failure (refetch error,
  double submit), where behavior improves.
- No new dependencies; `md5` moves between dependency groups.
- The re-entrancy guard touches `useModalForm`, shared by all six modals;
  existing unit tests cover each modal's submit path.
