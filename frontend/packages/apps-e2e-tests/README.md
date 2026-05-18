# @code-dot-org/apps-e2e-tests

Playwright + TypeScript end-to-end test suite for studio.code.org (dashboard).

## Running tests locally

### Prerequisites

1. **Node ≥ 20**, managed via nvm (already set up if you have the repo set up).
2. Install dependencies from `frontend/`:
   ```bash
   yarn install
   ```
3. Install Playwright's bundled browsers (one-time per machine):
   ```bash
   cd frontend/packages/apps-e2e-tests
   npx playwright install chromium
   # For all browsers (Firefox, WebKit too):
   npx playwright install
   ```

### Commands (run from `frontend/packages/apps-e2e-tests/`)

| Command                                                               | What it does                                      |
| --------------------------------------------------------------------- | ------------------------------------------------- |
| `yarn test`                                                           | Run all tests under Chromium (the PoC lane)       |
| `yarn test:report`                                                    | Open the last Playwright HTML report in a browser |
| `npx playwright test --project=firefox`                               | Run under Firefox                                 |
| `npx playwright test --project=webkit`                                | Run under WebKit                                  |
| `npx playwright test tests/maze/maze-submit-invalid-solution.spec.ts` | Run a single file                                 |
| `npx playwright test --shard=1/2`                                     | Run first shard of 2                              |

All tests run against `https://test-studio.code.org`. No local server required.

### Viewing the HTML report

After `yarn test` completes, the HTML report is written to
`playwright-report/`. Open it with:

```bash
yarn test:report
```

or open `playwright-report/index.html` directly in a browser.

---

## Agentic porting loop

The primary workflow for adding new scenarios is an **agent-assisted port** from
the existing Cucumber suite at `dashboard/test/ui/`. The full protocol lives in
`agent-loop/INSTRUCTIONS.md`. Short version:

1. Identify the Cucumber `.feature` file and its scenarios.
2. Invoke the agent (Claude Code or equivalent) with the instructions in
   `agent-loop/INSTRUCTIONS.md` and the source feature + step definitions as
   context.
3. The agent authors the Playwright equivalent, runs it against
   `test-studio.code.org`, and iterates up to the documented budget.
4. Review the resulting test file and iteration log; request revisions if needed.
5. Repeat for each scenario in the batch.
6. Review `agent-loop/batch-report.md` for any fixme/skip entries.

### Iteration budget

**N = 3 attempts per scenario.** If the test does not pass after 3 runs, the
agent marks it `test.fixme(reason)` and records it in the batch report. This is
a technical debt marker, not a permanent skip — a human can review the reason
and either fix the selector/logic or accept the skip.

---

## Locator policy

Selectors are chosen in this order:

1. `page.getByRole(role, { name })` — accessibility tree (preferred)
2. `page.getByLabel(text)` — labeled form controls
3. `page.getByText(text)` — visible text content
4. `page.getByPlaceholder(text)` — placeholder inputs
5. `page.getByTestId(id)` — only where the source already exposes a `data-testid`
6. `page.locator('#id')` / `page.locator('.class')` / XPath — literal carry-over
   from the original Cucumber test

**Hard rule:** no `data-testid` attributes are added to source components as part
of porting work. When accessibility-based locators are ambiguous, fall back to
the original Cucumber selector unchanged.

---

## Skip protocol

| Marker               | Meaning                                                 |
| -------------------- | ------------------------------------------------------- |
| `test.fixme(reason)` | Agent exhausted iteration budget; needs human review    |
| `test.skip(reason)`  | User-decided non-port (out of scope, mobile-only, etc.) |

Every `fixme` and `skip` must include:

- A human-readable description of the failure or decision
- The originating Cucumber feature path and scenario name

Example:

```typescript
test.fixme(
  'Budget exhausted: Blockly.getMainWorkspace() unavailable in main context. ' +
    'Source: dashboard/test/ui/features/star_labs/maze.feature "Submit a valid solution"',
);
```

---

## Brittle-test handling rules

1. Prefer `waitForSelector` / `waitForURL` over fixed `page.waitForTimeout`
   delays. Playwright's auto-wait covers most cases.
2. If a selector resolves to multiple elements, narrow with `.nth(0)` or a more
   specific locator rather than relying on CSS order.
3. Blockly workspace initialization uses `page.evaluate` to call
   `Blockly.serialization.workspaces.load`. The Blockly workspace for legacy CSF
   labs lives in the **main window** — no iframe switching needed.
4. Per-test timeout is 90 seconds (set in `playwright.config.ts`). If a test
   consistently approaches this limit, investigate whether the lab page is
   loading slowly or a selector is timing out.

---

## State-setup conventions

- **Target:** all tests run against `https://test-studio.code.org`.
- **Session reset:** every test begins with `page.goto('/reset_session')` to
  clear any previous session, mirroring the Cucumber Background pattern.
- **Login:** where a test requires an authenticated session, perform a fresh
  login in `test.beforeEach` via the same Rails routes the Cucumber suite uses
  (e.g., `page.goto('/users/sign_in')` or
  `request.post('/users/sign_in', ...)`). Do not reuse `storageState`.
- **Blockly workspace:** call `lab.loadBlocks(blocksJson)` on the POM instance.
  Block JSON fixtures live in `tests/legacy/{lab}/blocks.ts`.

---

## Out of scope / deferred to follow-up

- **Drone CI integration**: wiring `yarn test` into PR / DTT pipelines.
- **S3 HTML report upload**: making reports accessible after CI runs.
- **Firefox / WebKit execution lanes**: the projects are configured but not run
  in this PoC.
- **Porting beyond 6 labs**: ~740+ Cucumber scenarios remain unported.
- **Retiring the Cucumber suite**: `dashboard/test/ui/` is unchanged.
- **Reducing the role of remote-browser providers** (SauceLabs, AWS Device Farm)
  to a smoke lane.
- **Levelbuilder / curriculum-author flow scenarios**: deferred to phase 2.
- **GitHub Actions migration**: CI remains on Drone for now.

---

## Package layout

```
frontend/packages/apps-e2e-tests/
  playwright.config.ts         # baseURL=test-studio.code.org, 90s timeout, 3 projects
  tests/
    shared/                    # Cross-architecture helpers
      urls.ts                  # labLevelUrl(lesson, level, course?) + flappyLevelUrl(level)
      auth.ts                  # createTeacher(page) — creates + signs in via /api/test/create_user
    legacy/                    # Legacy CSF Blockly labs (Maze, Bee, Artist, Farmer,
      shared/                  # Bounce, Flappy, and future labs of the same architecture)
        LegacyBlocklyLab.ts    # Abstract POM base — buildLevelUrl() + shared locators/methods
        urls.ts                # Re-exports from ../../shared/urls (backward compat)
      {lab}/                   # One directory per lab
        {Lab}Lab.ts            # Concrete POM — buildLevelUrl impl + lab-specific locators
        blocks.ts              # Blockly workspace JSON fixtures (JSON strings)
        {lab}.spec.ts          # Playwright spec (test.describe / beforeEach / test)
    lab2/                      # Lab2-architecture labs (Music, Weblab2, Pythonlab, …)
      shared/
        Lab2Lab.ts             # Abstract POM base for lab2 labs
      {lab}/
        {Lab}Lab.ts            # Concrete POM
        blocks.ts              # Blockly workspace JSON fixtures (TS objects)
        {lab}.spec.ts          # Playwright spec
    teacher/                   # Teacher-tools tests (require authentication)
      teacher-panel.spec.ts    # Teacher panel visibility tests
  agent-loop/
    INSTRUCTIONS.md            # Agent porting protocol — read this before adding tests
    ITERATION_LOG_FORMAT.md    # Per-port log schema
    batch-report.md            # fixme/skip registry across all batches
    logs/                      # Per-scenario iteration logs
```

### Labs currently covered

| Lab           | POM / file                      | Levels / area tested | Confirmed |
| ------------- | ------------------------------- | -------------------- | --------- |
| Maze          | `legacy/maze/MazeLab.ts`        | 4, 5                 | Chromium  |
| Farmer        | `legacy/farmer/FarmerLab.ts`    | 1                    | Chromium  |
| Bee           | `legacy/bee/BeeLab.ts`          | 4                    | Chromium  |
| Artist        | `legacy/artist/ArtistLab.ts`    | 2                    | Chromium  |
| Bounce        | `legacy/bounce/BounceLab.ts`    | 1, 3, 5, 10          | Chromium  |
| Flappy        | `legacy/flappy/FlappyLab.ts`    | 1, 2                 | Chromium  |
| Music         | `lab2/music/MusicLab.ts`        | 2                    | Chromium  |
| Teacher panel | `teacher/teacher-panel.spec.ts` | teacher + anonymous  | Chromium  |
