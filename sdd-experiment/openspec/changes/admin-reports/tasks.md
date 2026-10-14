# admin-reports tasks

## 1. API

- [ ] 1.1 Extract report query objects from admin_reports_controller
      with replica connection handling inside them; legacy actions call
      them
- [ ] 1.2 Api::Admin reports controller: level_completions,
      level_answers, debug; query timeouts + envelope errors
- [ ] 1.3 Controller tests: parity result sets, replica-only assertion,
      timeout envelope, non-admin 403

## 2. SPA pages

- [ ] 2.1 Report pages with legacy-parity filters and tables; CSV links
      to legacy endpoints; MSW + Vitest
- [ ] 2.2 Flip landing-page links after side-by-side output comparison

## 3. Verification

- [ ] 3.1 spring testunit; yarn typecheck + vitest;
      ./tools/hooks/pre-commit
- [ ] 3.2 Manual: compare SPA vs HAML outputs on seeded data; confirm
      pd_progress.csv usage question (design open question) and note the
      answer in the decommission change
