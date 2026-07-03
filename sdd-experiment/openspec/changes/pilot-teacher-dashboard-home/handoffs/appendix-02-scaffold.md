# Appendix 02 — Scaffold: pilot-teacher-dashboard-home

Detail behind memo-02. Phase 2 (Opus): directed cleanups, planning commit,
package scaffold, gate verification.

## Directed cleanups applied (per ceo-decision-01)

- tasks.md 3.2: removed the self-correction artifact from the file list.
- tasks.md 0.1 + design.md R1 + visual-artifacts.md: playwright-support ruling
  recorded as RESOLVED — native `toHaveScreenshot`, no merge/cherry-pick.
- tasks.md 7.1 + visual-artifacts.md: advisory legacy capture explicitly
  OPUS-OWNED in Phase 4, not a Sonnet task.
- `openspec validate pilot-teacher-dashboard-home --strict` re-run after
  cleanups: valid.

## Commits

1. `29a417eecb6` — docs(sdd): OpenSpec planning artifacts (13 files, includes
   cleanups + ceo-decision-01). Note: `sdd-experiment/` is excluded by the
   local `.git/info/exclude`; files were force-added (`git add -f`). No tracked
   ignore file was modified.
2. (this commit) — the inspected scaffold + Phase 2 handoff docs.

## Scaffold run

Command (from `frontend/`):

```
yarn turbo gen package --args teacher-dashboard \
  "Read-only teacher dashboard home (pilot): section-list region for /teacher_dashboard/home"
```

Precondition hit: fresh worktree had no `frontend/node_modules`
("Couldn't find the node_modules state file"); ran `yarn install` first.

### Generator outcome

File emission and the studio package.json modification succeeded. The
generator's post-gen action chain (`yarn install` → `yarn lint:fix` →
`yarn release:dryrun`) ABORTED at `yarn lint:fix` on a PRE-EXISTING error
unrelated to the scaffold:

```
packages/e2e-tests/tests/platform/header.spec.ts
  3:36  error  Unable to resolve path to module '../pages/teacher-dashboard'
               import-x/no-unresolved
```

`tests/pages/teacher-dashboard` is a directory (containing
`teacher-dashboard.ts`, `manage-students-page.ts`) with no `index.ts`; the
import cannot resolve. Introduced by commit `efa54994177` ("test(e2e): port
platform/header to playwright (#73570)") on staging — present before this
branch's work. NOT fixed here (out of pilot scope; surgical-changes rule).
Flagged to the CEO in memo-02; it will fail any workspace-wide `lint`/
`release:dryrun` run, including Sonnet's task-level verification if run
unfiltered.

### Side effects found and disposition

| Side effect | Cause | Disposition |
|---|---|---|
| `frontend/apps/studio/package.json`: `"@code-dot-org/teacher-dashboard": "workspace:*"` added | generator action | KEPT (intended) |
| `frontend/yarn.lock`: +30 lines | post-gen `yarn install` registering the workspace pkg + catalog deps | KEPT (required) |
| `frontend/packages/labs/ailab/{src/redux.ts, test/unit/redux.test.js, test/unit/train.test.js}` reformatted | workspace-wide `yarn lint:fix` prettier pass over pre-existing drift | REVERTED (`git checkout --`) — unrelated to pilot |
| `frontend/packages/teacher-dashboard/{dist,node_modules,.turbo}` | build during turbo task graph | untracked (pkg `.gitignore` / repo ignore) — not committed |
| scaffolded `eslint.config.mjs` had 2 `import-x/order` errors | generator's own autofix step aborted before fixing its output | fixed with package-scoped `yarn lint:fix` + `prettier:fix` |
| scaffolded `package.json` pinned devDep `react: ^19.2.0` (template `package.json.hbs:37`) vs catalog `react ^18.3.1` — resolves a second, unhoisted React copy | generator template defect, DISCOVERED LATE (Session B, commit `0d8ad529c57`) | fixed in Session B: `react: catalog:` + `react-dom: catalog:`; GENERATOR FEEDBACK — template should emit `catalog:` |

No other tracked file changed (`git status` verified; the only remaining
untracked file is the pre-existing `teacher-dashboard-autonomous-pilot-prompt.md`
at repo root, untouched).

## Post-codegen adjustments (tasks.md 0.1)

- `vitest.config.ts` → `mergeConfig(baseConfig, {})` extending
  `@code-dot-org/lint-config/vitest/react.mjs` (jsdom + @vitejs/plugin-react),
  following the component-library pattern.
- `package.json`: added `dependencies: {"@code-dot-org/core": "workspace:*"}`
  (music/markdown pattern) and devDependencies `@vitejs/plugin-react: catalog:`,
  `jsdom: catalog:` (required by the react vitest base).
- Studio workspace dep: confirmed added by the generator (no manual edit).
- `yarn install` re-run to wire the new deps.
- Task 0.1 evidence amendment (post-Session-B): the scaffold's `react: ^19.2.0`
  devDep pin was a latent defect not caught by the Phase 2 empty-package gate
  (nothing imported React yet). Fixed in Session B (`react`/`react-dom` →
  `catalog:`). Session B also wired the design-mandated UI deps with the
  correct taxonomy, verified against precedent: workspace packages
  (`component-library`, `core`) in `dependencies`; host-supplied externals
  (`@mui/material ^7.0.0`, `@emotion/* ^11.0.0`, `@tanstack/react-query`,
  `react`, `react-dom`) in `peerDependencies` with hand-written ranges matching
  component-library's own peers (never `catalog:` in peers, per `.yarnrc.yml`);
  build/test tools (`msw`, `@testing-library/*`, `stylelint`) in
  `devDependencies`. Studio hosts all peers via `catalog:` — no double-bundle.

## Gate results (narrowest equivalent of release:dryrun)

Workspace-wide `yarn release:dryrun` is blocked by the pre-existing e2e-tests
lint error above, so the gate ran filtered:

- `yarn turbo run build typecheck lint test --filter=@code-dot-org/teacher-dashboard --force`
  → 13/13 tasks successful (includes upstream deps lint-config, core).
- Package tests: 1 file / 1 test passed; core: 17 files / 143 tests passed.
- Consumer check: `yarn turbo run build typecheck --filter=@code-dot-org/studio`
  → 13/13 successful with the new workspace dep in place.

First scoped lint run failed on the scaffold's own `eslint.config.mjs`
import-order (see table); after the package-scoped autofix all tasks green.

## Sonnet Phase 3 batching recommendation

Recorded in memo-02. Constraint reminders: Sonnet runs `/opsx:apply
pilot-teacher-dashboard-home` with cwd `sdd-experiment/` (design.md D7); it must
use package/filter-scoped gates, NOT workspace-wide `release:dryrun`, until the
pre-existing e2e-tests lint error is resolved upstream.
