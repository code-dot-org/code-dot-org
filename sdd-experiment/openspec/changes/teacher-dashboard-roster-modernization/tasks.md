# Tasks: teacher-dashboard-roster-modernization

Runs only after the candidate roster is the roster of record
(post-cutover, human-gated). Consumes the migration's scenario matrix,
tests, and design-system mapping.

## 1. Phase 1 — state port (UI unchanged)

- [ ] 1.1 Dedicated tests pinning edit-buffer and add-row-staging semantics
      of the slice (pre-port oracle)
- [ ] 1.2 Port queries (students, completed levels) and mutations (add,
      update, remove, bulk, transfers, secrets) to TanStack Query behind
      the existing component props
- [ ] 1.3 Remove the bridge and package-scoped store; cross-feature
      invalidations direct; migration test suite + MSW round-trips green

## 2. Phase 2 — design-system UI

- [ ] 2.1 Check component-library MIGRATION_STATUS.md for table primitives;
      decide DSCO vs MUI Table carry; record
- [ ] 2.2 Swap table core (sticky header, pinned sort behavior) + cells
      (DSCO textField/dropdown editors); column-sort behavior tests
      before/after
- [ ] 2.3 Swap dialogs to DSCO chrome (age gating, secrets, sharing, code
      review groups, transfers, bulk add) — behavior tests unmodified
- [ ] 2.4 Replace react-tooltip with DSCO tooltip; review react-csv
      retention for login export; remove reactabular-table/sortabular with
      grep-verified zero usage

## 3. A11y and verification

- [ ] 3.1 No-regression a11y review + axe per scenario; keyboard-complete
      flows
- [ ] 3.2 Full scenario matrix + ported Playwright spec green;
      `yarn release:dryrun`; live check on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/roster`
