# Tasks: user-write-api-auth-options

Depends on user-write-api-foundation + user-write-api-catalog.
Coordinates with user-multi-auth-at-creation (creation excluded) and
user-single-auth-retirement (dual-path deletion later).

## 0. Blocking asks

- [ ] 0.1 **DECISION (blocking)**: sign off the one deliberate behavior
      change in this program — SetPrimaryContactInfo wrapping
      save + destroy_all in a transaction (fixes finding A12's
      crash-window orphans). Security-adjacent; needs an explicit ack
      that closing the non-atomic window is desired. Default: yes, per
      design D2. Owner: auth/platform code owner.

## 1. Pins

- [ ] 1.1 Characterization suite for authentication_options#disconnect
      (provider × primary × last-option × migrated matrix)
- [ ] 1.2 Pins for update_oauth_credential_tokens (incl. Clever
      legacy-id fallback) and omniauth linking paths
- [ ] 1.3 Pin LTI account-linking save path

## 2. Commands

- [ ] 2.1 RemoveAuthenticationOption; delegate #disconnect
- [ ] 2.2 SetPrimaryContactInfo (transactional; A12 fix noted in PR);
      delegate model update_primary_contact_info as shim
- [ ] 2.3 AddAuthenticationOption (absorbs add_credential + token
      refresh verbatim); delegate omniauth + LTI callers
- [ ] 2.4 Instrumentation events on all three

## 3. Verify

- [ ] 3.1 Pin suites pass unchanged (documented A12 exception aside)
- [ ] 3.2 Cop todo list shrinks by these controllers;
      `./tools/hooks/pre-commit` clean
- [ ] 3.3 Manual pass: connect/disconnect each provider on a dev server,
      migrated + unmigrated test users
