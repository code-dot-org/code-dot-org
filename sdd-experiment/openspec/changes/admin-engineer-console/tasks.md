# admin-engineer-console tasks

## 1. API

- [ ] 1.1 Api::Admin config controllers: DCDO read/update, Gatekeeper
      read/set/delete, feature_mode read/update, dynamic_config read,
      NPS audience set — mutations require_sudo!
- [ ] 1.2 Audit enrichment: key/gate name + size-capped before/after
      values (truncation flagged); sanitizer blocklist applied
- [ ] 1.3 Controller tests: sudo paths, before/after captured, reads
      audit-silent, propagation parity with legacy writes, non-admin 403

## 2. SPA pages

- [ ] 2.1 Config editor pages: value display, raw editing with
      client-side JSON validation, old→new diff confirmation, typed key
      confirmation on delete; MSW + Vitest
- [ ] 2.2 Config visibility page replacing dynamic_config#show
- [ ] 2.3 Flip landing-page links after non-prod side-by-side
      verification

## 3. Verification

- [ ] 3.1 spring testunit; yarn typecheck + vitest;
      ./tools/hooks/pre-commit
- [ ] 3.2 Manual on a local/adhoc env: DCDO key round-trip and gate
      set/delete via SPA; audit rows show before/after; legacy editor
      still works (break-glass path intact)
