# Tasks: user-dual-auth-retirement-pathway

Gate-tracking checklist; implementation lives in the three stage
changes.

## 0. Standing rules (now)

- [ ] 0.1 Confirm `migration_service_enabled` is OFF in prod DCDO and
      annotate the flag (crash hazard, see
      user-single-multi-auth-migrator V4) until G0 exit
- [ ] 0.2 Land the account-shape scheduled metric + post-create legacy
      counter + per-provider login success panel

## 1. G0 — one migrator

- [ ] 1.1 user-single-multi-auth-migrator implemented and landed
- [ ] 1.2 V4 regression test in place; pinning suite green
- [ ] 1.3 Gate review recorded (sign-off in this change dir)

## 2. G1 — born multi-auth

- [ ] 2.1 user-multi-auth-at-creation ramped to 100% on all flows
- [ ] 2.2 Post-create legacy counter at zero for 14 consecutive days
- [ ] 2.3 after_create hook deleted
- [ ] 2.4 user-email-source-of-truth landed (G2 entry dependency)
- [ ] 2.5 Gate review recorded

## 3. G2 — backfill

- [ ] 3.1 demigrate rollback exercised on sampled batch (non-prod)
- [ ] 3.2 Backfill executed per stage-3 design; audit metric → 0
      (with_deleted)
- [ ] 3.3 Login success-rate flat across window; gate review recorded

## 4. G3 — deletion

- [ ] 4.1 30-day soak at zero
- [ ] 4.2 37 migrated? sites, manual? branches, demigrate, :demigrated
      trait deleted; provider/uid via ignored_columns then dropped;
      serialized oauth_* keys removed
- [ ] 4.3 Retirement grep clean (allowlist recorded); program closed
