# admin-user-lifecycle tasks

## 1. API

- [ ] 1.1 Api::Admin endpoints: user delete/undelete (sudo), section
      undelete, delete_progress (sudo + required reason), manual_pass,
      account_repair — wrapping the model operations the legacy actions
      call
- [ ] 1.2 Audit enrichment: affected_user_id everywhere; script_id +
      reason on delete_progress; repair summary in event params
- [ ] 1.3 Controller tests: sudo stale/fresh paths, 422 on blank
      reason, undelete restores, non-admin 403, audit rows per spec

## 2. SPA flows

- [ ] 2.1 Destructive-action confirmation component (typed identifier,
      disabled submit until match) as the package convention
- [ ] 2.2 sudo_required handling in the client: re-auth prompt, retry
      after stamp refresh
- [ ] 2.3 Pages: user delete/undelete (from inspector), section
      undelete (from section lookup), delete progress, manual pass,
      account repair; MSW fixtures + Vitest
- [ ] 2.4 Flip landing-page links for these tools

## 3. Verification

- [ ] 3.1 spring testunit; yarn typecheck + vitest;
      ./tools/hooks/pre-commit
- [ ] 3.2 Manual on seeded users: delete→undelete round-trip with audit
      rows inspected via mysql reader; sudo-expiry path exercised by
      shrinking the DCDO window locally
