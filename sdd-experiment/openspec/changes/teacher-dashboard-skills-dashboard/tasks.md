# Tasks: teacher-dashboard-skills-dashboard

Position 15. Depends on teacher-dashboard-shell (gate + route exist).

## 1. Data + discovery (gate)

- [ ] 1.1 Record the component's data requests on a local Rails run (flag
      on); typed wrappers + parser tests + MSW handlers
- [ ] 1.2 Scenario discovery from source; MSW fixtures + visible choices
      (flag-on populated, flag-off, error)

## 2. Port

- [ ] 2.1 Port SkillsDashboard at a recorded legacy SHA (divergence ledger
      entry with owner); mount at the gated candidate route
- [ ] 2.2 Component tests per scenario; axe + keyboard; copy parity

## 3. Visual parity + verification

- [ ] 3.1 Pixel baselines/checkpoints via the shell harness at
      `http://localhost-studio.code.org:9000` (serving-checkout validated;
      Playwright MCP available)
- [ ] 3.2 Flip the shell per-tab map entry for `skills`
- [ ] 3.3 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`;
      live (flag on) + standalone MSW checks
