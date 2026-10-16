# Tasks: teacher-dashboard-login-info

Position 5. Depends on teacher-dashboard-shell; shares print components
with teacher-dashboard-manage-students.

## 1. Data + discovery (gate)

- [ ] 1.1 Record selected-section payloads for all six login types (incl.
      LTI issuer case and the secrets-bearing parent-letter needs); verify
      against the shell's recorded contract
- [ ] 1.2 Walk oracles (stories/jest, sources, homepage feature login-cards
      path); record scenario matrix; MSW fixtures + visible choices (six
      login types, demo tooltip, error)

## 2. Move UI

- [ ] 2.1 Extract SectionLoginInfo + SignInInstructions + static imagery
      with adapters (`@cdo/locale`, `SafeMarkdown`→markdown pkg,
      DemoSectionTooltip); mount at the candidate route
- [ ] 2.2 Wire print login cards (moved with roster) and the print
      certificates link
- [ ] 2.3 Candidate printable parent-letter route (chrome-free, print CSS
      preserved); flag the secrets-bearing payload to security review
- [ ] 2.4 Component tests per login type; axe + keyboard; copy parity;
      print-preview checks (login cards + parent letter)

## 3. Integration + verification

- [ ] 3.1 Flip the shell per-tab map entry for `login_info`
- [ ] 3.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 3.3 Live check per login type on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/login_info`
      (serving-checkout validated); standalone MSW check
