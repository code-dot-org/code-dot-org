# Tasks: teacher-dashboard-settings

Position 11. Depends on teacher-dashboard-shell; reuses homepage's section
mutation wrappers.

## 1. Data + discovery (gate)

- [ ] 1.1 Record update/delete/course-offering traffic; verify existing
      core wrappers against recordings; extend where fields are missing
- [ ] 1.2 Walk oracles (TSX sources, local_nav_v2 settings scenario,
      validation branches); record matrix; MSW fixtures + visible choices
      (default, locale-filtered-versions, PL participant-type, restricted,
      save-blocker, delete, error)

## 2. Port UI

- [ ] 2.1 Port the form read path (all fields incl. curriculum pickers with
      locale/participant filtering) onto the Query spine; dual-copy ledger
      entry for components shared with sectionsRefresh
- [ ] 2.2 Port mutations: save (+ save-blocker modal), delete (+
      confirmation); redirect-on-save via the shell per-tab map
- [ ] 2.3 Component tests per scenario incl. dirty/cancel states; axe +
      keyboard; copy parity

## 3. Visual parity (pixel-gated)

- [ ] 3.1 Declare regions/masks (form, save-blocker modal, delete
      confirmation); capture baselines/checkpoints at
      `http://localhost-studio.code.org:9000` (serving-checkout validated;
      Playwright MCP available); wire diff gates

## 4. Integration + verification

- [ ] 4.1 Flip the shell per-tab map entry for `settings`
- [ ] 4.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 4.3 Live save/delete round-trip + standalone MSW checks
