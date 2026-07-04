# Tasks: teacher-dashboard-calendar

Position 7. Depends on teacher-dashboard-shell.

## 1. Data + discovery (gate)

- [ ] 1.1 Confirm + record the calendar's data request(s) from a local
      Rails run (calendar-bearing unit, no-calendar unit)
- [ ] 1.2 Typed wrappers + parser tests + MSW handlers
- [ ] 1.3 Walk oracles (`calendar_eyes.feature`, sources); record matrix;
      MSW fixtures + visible choices (populated, empty, error)

## 2. Port UI

- [ ] 2.1 Port UnitCalendar + CalendarEmptyState onto the Query spine
      (renders-unconditionally quirk preserved)
- [ ] 2.2 Component tests per scenario; axe + keyboard; copy parity

## 3. Visual parity (pixel-gated)

- [ ] 3.1 Declare regions/masks; capture baselines/checkpoints at
      `http://localhost-studio.code.org:9000` (serving-checkout validated;
      Playwright MCP available); wire diff gates

## 4. Integration + verification

- [ ] 4.1 Flip the shell per-tab map entry for `calendar`
- [ ] 4.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 4.3 Live + standalone MSW checks
