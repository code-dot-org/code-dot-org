# admin-identity-tools tasks

## 1. assume_identity hardening (ships first, standalone)

- [ ] 1.1 Add require_sudo! and an AdminAuditEvent write to
      admin_users_controller#assume_identity (keep log_admin_action)
- [ ] 1.2 Tests: stale sudo rejected, audit row on success, legacy form
      flow still works end to end

## 2. StudioPerson API

- [ ] 2.1 Api::Admin studio_person controller: merge (sudo), split
      (sudo), add_email; Firehose emission preserved; audit enrichment
      with person/user ids
- [ ] 2.2 Controller tests: sudo paths, legacy-semantics parity on
      merge/split fixtures, Firehose still emitted, audit rows

## 3. SPA pages

- [ ] 3.1 StudioPerson page: person lookup, merge/split typed
      confirmations (reuse lifecycle confirmation component), add-email;
      MSW + Vitest
- [ ] 3.2 Impersonation launch form: target resolution via search, typed
      confirmation, plain HTML form POST to the legacy endpoint (no
      fetch); sudo_required handling before submit
- [ ] 3.3 Flip landing-page links

## 4. Verification

- [ ] 4.1 spring testunit; yarn typecheck + vitest;
      ./tools/hooks/pre-commit
- [ ] 4.2 Manual: impersonate a seeded student from the SPA form —
      confirm full-page landing as the student, audit row present, and
      that navigating to /frontend-studio/admin as the student redirects
      away
