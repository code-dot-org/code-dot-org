# Batch Report

Tracks every `test.fixme` and `test.skip` introduced or encountered across all
porting batches.

---

## Batch 1 — Maze PoC (5 scenarios)

**Source:** `dashboard/test/ui/features/star_labs/maze.feature`,
`dashboard/test/ui/features/star_labs/maze2.feature`

_No fixme or skip entries. All 5 scenarios passed within budget._

**Note:** These 5 scenarios were later consolidated into
`tests/legacy/maze/maze.spec.ts` during the POM refactor (Batch 2).

---

## Batch 2 — POM refactor + 6-lab expansion

**Labs ported:** Maze, Farmer, Bee, Artist, Bounce, Flappy

**Source features:**

- `dashboard/test/ui/features/star_labs/maze.feature` → `tests/legacy/maze/maze.spec.ts`
- `dashboard/test/ui/features/star_labs/bee.feature` → `tests/legacy/bee/bee.spec.ts`
- `dashboard/test/ui/features/star_labs/artist.feature` → `tests/legacy/artist/artist.spec.ts`
- `dashboard/test/ui/features/star_labs/bounce.feature` → `tests/legacy/bounce/bounce.spec.ts`
- `dashboard/test/ui/features/star_labs/flappy.feature` → `tests/legacy/flappy/flappy.spec.ts`
- Farmer lab (no dedicated feature file; scenarios from `initial_page_views_csf.feature` and
  `blockly_initialization_blocks.rb`) → `tests/legacy/farmer/farmer.spec.ts`

**Confirmed passing (Chromium):** Maze (5) and Farmer (3) — 8 tests total.

All 12 tests (Bee 1, Artist 3, Bounce 5, Flappy 3) confirmed passing on Chromium against
`test-studio.code.org` (2026-05-02).

_No fixme or skip entries._

---

---

## Batch 3 — First lab2 test: Music Lab

**Lab:** Music Lab (lesson 46 of allthethingscourse)

**Source feature:** `dashboard/test/ui/features/star_labs/musiclab/musiclab_drag_block.feature`
(tagged `@skip` in the Cucumber suite)

**Test file:** `tests/lab2/music/music.spec.ts`

**Notes:**

- Introduced `tests/lab2/shared/Lab2Lab.ts` abstract base for lab2-architecture labs.
- Introduced `tests/shared/urls.ts` as the canonical home for URL builders (replaces
  `tests/legacy/shared/urls.ts`, which now re-exports for backward compat).
- `#instructions-feedback-message` contains both the validation text and the continue-button
  label; `toContainText` is required for feedback assertions.
- Music Lab flyout toolbox has no `.blocklyTreeRow` elements; use `[data-id='when-run-block']`
  as the sole ready signal.

**Confirmed passing (Chromium):** 3 tests — 2026-05-02.

_No fixme or skip entries._

---

---

## Batch 4 — First authenticated test: Teacher Panel

**Source feature:** `dashboard/test/ui/features/teacher_tools/level_navigation.feature`
("External Video Level" scenario — teacher sees teacher panel on a level page)

**Test file:** `tests/teacher/teacher-panel.spec.ts`

**New shared utility:** `tests/shared/auth.ts` — `createTeacher(page)` POSTs to
`/api/test/create_user` (available in rack_env :test) with a CSRF token extracted
from the current page. The session cookie is set in the POST response, so subsequent
`page.goto()` calls are authenticated.

**Notes:**

- `#teacher-panel-container` is a zero-dimension wrapper div — its only child
  (`.teacher-panel`) is `position: fixed`. Playwright reports the container as
  "hidden" (zero bounding box). Assert on `getByRole('heading', {name: 'Teacher Panel',
level: 3})` instead.
- The panel default state is "open" (localStorage null → `null !== 'closed'` → open).
  The `.teacher-panel` slides to `right: -195px` when closed, but still has non-zero
  dimensions; Playwright would consider it "visible" in both states. The h3 assertion
  is the correct discriminator.
- For anonymous users, `InstructorsOnly` returns null; the heading is not in the DOM.
  Use `not.toBeAttached()` for the negative assertion.
- Do NOT use `LegacyBlocklyLab.gotoLevel()` for auth tests — it calls
  `page.goto('/reset_session')` which clears the session.

**Confirmed passing (Chromium):** 2 tests — 2026-05-02.

_No fixme or skip entries._

---

## Batch 5 — Feedback and Authored Hints

**Labs:** Bee (level 5 feedback), Farmer (level 2 authored hints)

**Source features:**

- `dashboard/test/ui/features/star_labs/bee.feature` — feedback scenario for level 5
- Authored hints scenarios derived from `dashboard/test/ui/features/authored_hints/` step defs
  and confirmed live via Playwright MCP

**Test files:**

- `tests/legacy/bee/bee.spec.ts` — added "Feedback — Bee level 5" describe (2 tests)
- `tests/legacy/farmer/farmer.spec.ts` — added "Authored hints — Farmer level 2" describe (2 tests)
- `tests/legacy/bee/blocks.ts` — added `RECOMMENDED_BEE_LEVEL_5_BLOCKS` fixture

**Notes:**

- `getByRole('button', {name: 'Yes'})` (partial) matches both the actual prompt button
  and the lightbulb `div[role=button]` whose aria-label contains "yes". Use
  `{name: 'Yes', exact: true}` to target only the prompt button.
- Bee level 5 with default blocks produces a congrats message that contains
  "But you could use a different block"; `#hint-request-button` appears and its click
  reveals `#feedbackBlocks`.
- After all 3 authored hints are viewed, `#hintCount` is removed from the DOM;
  assert with `not.toBeAttached()`.

**Confirmed passing (Chromium):** 8 tests (4 pre-existing + 4 new) — 2026-05-02.

_No fixme or skip entries._

---

## Batch N — Auth-unblocking pass (craft, share_buttons, applab)

**Features ported:**

- `craft/hero_logged_in.feature` → `tests/legacy/activities/craft/craft.spec.ts`
- `share_buttons.feature` → `tests/legacy/share-buttons/share-buttons.spec.ts`
- `applab/clipping.feature` → `tests/applab/applab.spec.ts`
- `applab/sharing_from_script_level.feature` → `tests/applab/applab.spec.ts`
- `applab/scenarios.feature` (scenario 1) → `tests/applab/applab.spec.ts`

All pass C+F+W.

### applab_submittable — submit/unsubmit/resubmit cycle

- **Source:** `dashboard/test/ui/features/star_labs/applab_submittable.feature` —
  "Submit anything, unsubmit, be able to resubmit."
- **Test file:** `tests/applab/applab.spec.ts`
- **Status:** fixme
- **Reason:** `page.goto(levelUrl)` gets `net::ERR_ABORTED` after clicking `#confirm-button`
  on the submit modal. Three approaches tried: (1) direct goto after click,
  (2) `Promise.all([waitForLoadState('load'), click])`, (3) wait for `.modal` hidden
  then goto — all fail identically. Root cause: the confirm triggers a server-side
  multi-step redirect chain; the browser is still mid-navigation when goto fires.
  Page snapshot after modal closes shows empty `<main>` at an unexpected URL, not
  the level URL — a JS or meta redirect on the landing page likely fires a second
  navigation before goto can settle.

---

## Batch N+1 — Auth-unblocking pass 2 (sharepage_logo, share_remix, maker, gamelab, spritelab, catalog)

**Features ported (passing):**

- `star_labs/sharepage_logo.feature` → `tests/legacy/sharepage-logo/sharepage-logo.spec.ts` (4 tests)
- `star_labs/legacy_share_remix.feature` → `tests/legacy/share-remix/share-remix.spec.ts` (1 test)
- `star_labs/maker_projects.feature` → `tests/legacy/maker/maker.spec.ts` (3 tests)
- `gamelab/level_options.feature` → `tests/legacy/activities/gamelab/gamelab.spec.ts` (4 tests)
- `spritelab/loading_costumes.feature` → `tests/legacy/activities/spritelab/spritelab.spec.ts` (1 test)
- `acquisition_products/curriculum_catalog.feature` (scenarios 2–3) → `tests/catalog/catalog.spec.ts`

All pass C+F+W (maker Chromium-only per @chrome tag).

**Key techniques learned:**

- `#overlay` CSS-module div blocks pointer events on project pages; use `page.evaluate(() => document.querySelector('#overlay')?.click())` to dismiss.
- Game Lab and App Lab share pages autoplay on load — `#runButton` stays hidden; wait for `#logo-img img` instead.
- Congrats dialog backdrop blocks `.project_share` header button; `page.evaluate()` JS click bypasses hit-testing.

### gamelab_submittable — submit/unsubmit/resubmit cycle

- **Source:** `dashboard/test/ui/features/star_labs/gamelab_submittable.feature` —
  "Submit anything, unsubmit, be able to resubmit."
- **Test file:** `tests/legacy/activities/gamelab/gamelab.spec.ts`
- **Status:** fixme
- **Reason:** Submit and unsubmit steps pass consistently; the final
  `#submitButton visible` assertion times out after reload + rerun.
  Server-side submission state does not reset cleanly within the test window.
  Likely cause: unsubmit AJAX completes but submit-button visibility is tied
  to server-session state that a subsequent fresh `page.goto()` does not yet
  reflect. 3 attempts exhausted.

### curriculum_catalog_assign_unassign — assign/unassign teacher flow

- **Source:** `dashboard/test/ui/features/acquisition_products/curriculum_catalog_assign_unassign.feature`
- **Test file:** `tests/catalog/catalog.spec.ts`
- **Status:** fixme
- **Reason:** Test passes in isolation (12/12) but fails under parallel server
  load. Four PATCH `/dashboardapi/sections/:id` calls interleave with page
  navigations; `waitForResponse` timing races under heavy parallelism cause the
  first assignment PATCH to time out. No reliable completion signal for
  unassignment (no success message); the Section 1 assignment success message
  can falsely satisfy the Section 2 `toBeVisible` assertion. 6+ iterations
  exhausted.

---

## Batch N+2 — Auth-unblocking pass 3 (App Lab + Game Lab loading + AI chat + AI tutor)

**Features ported (passing):**

- `applab/scenarios.feature` (scenarios 2–3) → `tests/applab/applab.spec.ts` (setText/getText + textarea newline preservation)
- `applab/scenarios3.feature` → `tests/applab/applab.spec.ts` (HTTP image proxy + clear-puzzle reset)
- `applab/html_sanitization.feature` → `tests/applab/applab.spec.ts` (design-mode DOM hierarchy)
- `gamelab/loading_animations.feature` → `tests/legacy/activities/gamelab/gamelab.spec.ts` (blank + bear animations; Piskel iframe pen)
- `aichat/chat.feature` → `tests/lab2/aichat/aichat.spec.ts` (bot reply color; system prompt save; publish model)
- `ai_tutor/chat.feature` → `tests/lab2/ai-tutor/ai-tutor.spec.ts` (@no_ci; App Lab + Python Lab + Weblab2)

All pass C+F+W (ai_tutor @no_ci; excluded from CI by grepInvert).

**Key techniques:**

- Droplet ACE editor injection: `window.__TestInterface.getDroplet().aceEditor.onTextInput(c)` after `navigateFileEnd()`.
- Design-mode element drag: jQuery `mousedown` on `[data-element-type='X']` + `mousemove`/`mouseup` on `#visualization` offset.
- React controlled-input clearing: `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set` + `dispatchEvent(new Event('input', {bubbles:true}))`.
- Game Lab animation picker: JS `.click()` on `#newListItem` → `.uitest-animation-picker-list>div>div>div>button[0]` (blank) or `img[src*='/category_animals.png'][1]` + bear thumbnail + `.ui-test-selector-done-button`.
- AI chat teacher panel dismiss: `.teacher-panel > .hide-handle > .fa-chevron-right`, then wait for `.fa-chevron-left`.

---

<!-- Agent: append new entries here as fixme/skip placeholders are created.

Format:

## <Batch name>

**Labs:** ...

### <Scenario name>
- **Source:** `<feature path>` — "<scenario name>"
- **Test file:** `tests/legacy/<lab>/<lab>.spec.ts`
- **Status:** fixme | skip
- **Reason:** <what failed or user decision>
-->
