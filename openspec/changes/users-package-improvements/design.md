# Design: users-package-improvements

## Context

`@code-dot-org/users` is the new accounts module (PR series B1–B6, stacked on
`accounts/pr-b6-delete-account`). A code review found the defects listed in
the proposal. The package is unshipped, so all fixes are free of migration
concerns; the only shared surface touched is `useModalForm`, used by all six
modals.

## Goals / Non-Goals

**Goals:**

- Fix the edit-discarding error branch, the packaging defects, and the
  submit-path gaps with the smallest diffs that satisfy the specs.
- Keep every change inside `frontend/packages/users/`.

**Non-Goals:**

- i18n (separate scope decision).
- Any behavior change visible outside failure/double-submit paths.
- Refactors beyond the named cleanups.

## Decisions

- **Error gating**: change the blocking-error condition in
  `UsersSettingsPage` from `!isPending && isError` to `isError &&
  !settings.data` (current-user errors likewise only block before data).
  With data present, a failed refetch is surfaced via the existing
  ToastProvider rather than a new inline alert — the page already uses
  toasts for mutation outcomes, and a refetch failure is transient.
  Alternative (inline dismissible alert) rejected as new UI surface for a
  rare state.
- **Re-entrancy**: `useModalForm` tracks in-flight with a ref (not state —
  no re-render needed) and bails out of `onSubmit` while set. The
  delete-gate check stays in `DeleteUserModal`'s action (`if (!canDelete)
  return;`) because the gate is modal-specific; the hook only owns the
  generic busy guard. Alternative (pass a `canSubmit` predicate into the
  hook) rejected: one caller needs it.
- **`document.title`**: capture the previous title in the mount effect and
  restore it in the cleanup. No host API added.
- **Legal copy**: export the teacher warning string from
  `DeleteUserModal.tsx` (where the rest of the legal copy lives) and import
  it in `UsersActions.tsx`. The modal's `DialogContentText` renders the same
  string; the `<strong>` emphasis moves into a small shared render or is
  dropped to plain text in both places — resolved at implementation to
  whichever keeps one source without a markup DSL.
- **Typed field keys**: derive a `KnownField` union from a `KNOWN_FIELDS`
  `as const` tuple in `users.types.ts`; `FieldErrors` becomes
  `Partial<Record<KnownField, string[]>>`. `UsersApiValidationError` keeps
  accepting arbitrary server keys and narrows via the set membership check
  it already performs.
- **md5**: move to `dependencies`; `@types/md5` stays dev. `externalizeDeps`
  then externalizes it like `tabbable`; no vite config change.
- **Username-gating parity**: verified during implementation against legacy
  `/users/edit` (dashboard ERB/haml + React for the account page). Outcome
  is a code comment on the username field; if legacy locks it, gate on the
  closest existing entitlement rather than inventing a new API field.

## Risks / Trade-offs

- [Toast on refetch failure may be missed] → acceptable: data shown is at
  most 30s stale (query staleTime), and the next interaction retries.
- [Busy-guard ref could stick if an action throws synchronously] → clear it
  in `finally`.
- [Moving md5 changes the dist bundle (no longer inlined)] → consumers
  install it transitively via workspace resolution; verified by building and
  grepping dist for the md5 implementation.
