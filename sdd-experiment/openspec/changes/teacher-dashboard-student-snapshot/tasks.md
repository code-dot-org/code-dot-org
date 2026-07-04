# Tasks: teacher-dashboard-student-snapshot

Position 16 (last). Depends on teacher-dashboard-shell; reuses progress
wrappers where payloads overlap.

## 1. Data + discovery (gate)

- [ ] 1.1 Record each widget's data requests on a local Rails run
      (experiment on); typed wrappers + parser tests + MSW handlers;
      reuse progress wrappers where payloads overlap
- [ ] 1.2 Scenario discovery from widget sources; MSW fixtures + visible
      choices (experiment-on populated, per-widget empty/error,
      experiment-off)

## 2. Port

- [ ] 2.1 Port header + widgetTemplate at a recorded legacy SHA
      (divergence ledger entry)
- [ ] 2.2 Port the six widgets incrementally (code, lesson feedback,
      lesson insight, student CFU, lesson progress details, student
      rubric), each with component tests + axe + copy parity as it lands
- [ ] 2.3 Mount at the gated candidate route with the empty-state matrix

## 3. Visual parity + verification

- [ ] 3.1 Pixel baselines/checkpoints via the shell harness at
      `http://localhost-studio.code.org:9000` (serving-checkout validated;
      Playwright MCP available)
- [ ] 3.2 Flip the shell per-tab map entry for `studentSnapshot`
- [ ] 3.3 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`;
      live (experiment on) + standalone MSW checks
