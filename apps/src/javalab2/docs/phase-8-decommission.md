# Phase 8 — Decommission `apps/src/javalab/`

Once Phases 1–7 are in place and javalab2 has reached parity, delete the
legacy bundle. This is the largest single cleanup of the migration but
also the most mechanical.

## Preconditions

- All javalab levels load through `lab2_options` (Phase 1 made
  `Javalab#uses_lab2?` return true, so this is already the case).
- All v1 features (validation, exemplar/start edit, starter assets,
  backpack, code review, captcha) are wired into javalab2 (Phase 6).
- The `javalab2` feature flag, if used during rollout, is on by default
  and has been observed in production.
- `dashboard/test/models/javalab_test.rb` is green.
- A full drone run on the current branch has been green.

## What to delete

Frontend:

- `apps/src/javalab/` — entire directory (~40 files).
- `apps/webpackEntryPoints.js` — remove the `javalab` entry from the
  legacy lab1 entry list. Keep the `javalab` entry in
  `apps/lab2EntryPoints.ts`.
- `apps/i18n/javalab/` stays. Javalab2 still uses the same string bundle
  via `@cdo/javalab/locale`.

Backend / views:

- `dashboard/app/helpers/javalab_files_helper.rb` stays — Javabuilder
  still consumes the bundle it produces (the override-sources flow
  routes through `get_project_files_with_override_sources`).
- `dashboard/app/views/levels/_javalab.html.haml` (the legacy lab1
  template wrapper) — delete if it exists and is no longer referenced.
- Any controller branches keyed on `is_a?(Javalab)` that route through
  the legacy stack (`non_blockly_puzzle_options`, etc.) — leave the
  lab2 path only.

Imports to scrub:

```
grep -rn "@cdo/apps/javalab" apps/src/
```

Should return empty before merge. The Phase 3 exception/test-result
handlers (`apps/src/javalab/javabuilderExceptionHandler.js`,
`apps/src/javalab/testResultHandler.js`) are still imported by
`javabuilderRunner.ts`. Move them into `apps/src/javalab2/` (or copy and
delete the originals) as part of this phase.

```
grep -rn "@cdo/apps/javalab" dashboard/
grep -rn "@cdo/apps/javalab" frontend/
```

## What stays

- `apps/src/miniApps/neighborhood/` — shared with pythonlab.
- `apps/i18n/javalab/` — shared string bundle.
- `dashboard/app/helpers/javalab_files_helper.rb` — bundle producer for
  Javabuilder.
- `dashboard/app/models/levels/javalab.rb` — model class name unchanged.
- All level rows in the DB — no schema migration.

## Migration ordering

To minimize the blast radius of a bad cut:

1. **First PR**: delete `apps/src/javalab/` and the entry-point listing.
   The redirected imports (exception handler, test result handler) move
   into `apps/src/javalab2/` in the same PR. Run typecheck + the
   javalab test suite locally.
2. **Second PR**: remove the now-dead controller branches and views.
3. **Third PR**: collapse any temporary feature flags (e.g.
   `experiments.isEnabled('javalab2')` checks added during rollout).

## Verification

- `yarn build` succeeds.
- `bundle exec spring testunit dashboard/test/models/javalab_test.rb`
  passes.
- `bundle exec rake test:changed` from the repo root reports green.
- `grep -rn "@cdo/apps/javalab" apps/ dashboard/ frontend/` is empty.
- A drone run on the branch is green.
- Spot-load one console, one neighborhood, and one theater level in a
  production-like build. All three render and Run executes against the
  real Javabuilder.

## Risks

- **Stale references in `dashboard/app/views/levels/editors/**`**. The
  haml templates may reference partials or helpers that imported javalab
  bits. Grep both `*.haml` and `*.rb` for the path.
- **Test fixtures**. `dashboard/test/fixtures/**` or
  `dashboard/test/support/**` may hard-code legacy `start_sources` shape.
  If `convert_legacy_start_sources` already handles both shapes (it does),
  fixtures continue to work as-is; the cleanup is purely opportunistic.
- **External docs**. The internal wiki and `docs/` references to
  `apps/src/javalab/` get updated separately, not as part of this
  branch.
