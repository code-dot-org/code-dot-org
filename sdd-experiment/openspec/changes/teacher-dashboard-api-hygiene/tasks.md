# Tasks: teacher-dashboard-api-hygiene

Sequenced after teacher-dashboard-homepage-v2 is implemented (its call
sites are the first consumers of the new write endpoints).

## 1. Caller inventory and rulings

- [ ] 1.1 Grep-verified inventory of all callers of `get_drawer_data`,
      `sections#update`, and flash consumers; record in the task log
- [ ] 1.2 Obtain and record the product ruling on TOS explicit-accept
      (blocker for 4.x only)

## 2. Write endpoints

- [ ] 2.1 `POST` drawer-seen endpoint + Rails tests; candidate homepage
      posts it after interstitial display; drawer GET side effect removal
      scheduled for cutover (ledger entry with owner)
- [ ] 2.2 Flash acknowledge endpoint + Rails tests; home bootstrap stops
      clearing on read; candidate toast posts acknowledge after display
- [ ] 2.3 TOS accept endpoint + Rails tests; candidate interstitial wired

## 3. CSRF skip removal

- [ ] 3.1 Verify all `sections#update` callers send tokens via standard
      clients; fix any that do not
- [ ] 3.2 Remove `skip_before_action :verify_authenticity_token`; Rails
      test asserting rejection without token; staging canary; security
      review sign-off

## 4. Cleanups

- [ ] 4.1 Remove the dead `unit_in_aif` else branch; controller test pins
      valid-id and 404 contracts
- [ ] 4.2 At cutover (human-gated): delete the drawer GET side effect and
      the HAML TOS auto-accept block

## 5. Verification

- [ ] 5.1 Targeted Rails tests + `./tools/hooks/pre-commit`
- [ ] 5.2 Live check of interstitial/flash/TOS flows on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`
