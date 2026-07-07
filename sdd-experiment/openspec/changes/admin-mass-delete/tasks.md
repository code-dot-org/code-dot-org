# admin-mass-delete tasks

## 1. API

- [ ] 1.1 Api::Admin progress_deletions controller: preview (no audit,
      no mutation) and create (require_sudo!, required reason, per-user
      + batch audit rows, re-validation with skipped report)
- [ ] 1.2 Controller tests: preview warnings, sudo paths, per-user audit
      rows share batch id, skipped-id reporting, blank reason 422

## 2. Component port

- [ ] 2.1 Move MassDeleteContainer logic into packages/admin: transport
      → DashboardApiClient endpoints, scss module → CSS module, jest →
      Vitest; preserve preview→confirm flow and copy
- [ ] 2.2 Wire sudo_required handling (shared client convention) and the
      typed-confirmation component on execute
- [ ] 2.3 Flip landing-page link; leave apps/ entry + HAML page in place
      for decommission

## 3. Verification

- [ ] 3.1 spring testunit; yarn typecheck + vitest;
      ./tools/hooks/pre-commit
- [ ] 3.2 Manual: preview+execute on two seeded students with one bogus
      username; verify per-user audit rows, batch id, and skipped
      reporting
