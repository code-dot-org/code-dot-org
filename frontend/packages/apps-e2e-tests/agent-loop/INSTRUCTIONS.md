# Agent Loop: Cucumber → Playwright Porting Instructions

Govern how an agent translates Cucumber/Selenium scenarios from
`dashboard/test/ui/` into Playwright/TypeScript tests in
`frontend/packages/apps-e2e-tests/tests/`.

---

## Architecture overview

### Legacy vs Lab2

Before writing any code, determine the lab's architecture by checking its source
directory under `apps/src/`:

| Architecture | Source path                                              | Examples                                  |
| ------------ | -------------------------------------------------------- | ----------------------------------------- |
| **Legacy**   | `apps/src/{maze,turtle,bounce,flappy}/`                  | Maze, Bee, Artist, Bounce, Flappy, Farmer |
| **Lab2**     | `apps/src/{music,weblab2,pythonlab}/` + `apps/src/lab2/` | Music Lab, Web Lab 2, Python Lab          |

Reliable confirming signals for **legacy**:

- Feature file uses `#runButton`, `#resetButton`, `.congrats`, `.uitest-topInstructions-inline-feedback`
- Block JSON is loaded via `Blockly.serialization.workspaces.load()`
- The Blockly workspace lives in the **main window** — no iframe switching needed

Lab2 labs have a different DOM; use `tests/lab2/shared/Lab2Lab.ts` as the abstract
base (see **Adding a new lab2 lab** below).

### Page Object Model

```
tests/
  shared/
    urls.ts                ← labLevelUrl + flappyLevelUrl (canonical; used by all labs)
  legacy/
    shared/
      LegacyBlocklyLab.ts  ← abstract base (do not modify unless adding a new
                              shared capability; never add lab-specific code here)
    activities/            ← CSF Blockly activities (Maze, Bee, Artist, etc.)
      {name}/
        {Name}.ts          ← concrete POM (no "Lab" suffix — these are not product labs)
        blocks.ts          ← Blockly workspace JSON fixtures (JSON strings)
        {name}.spec.ts     ← Playwright spec
    {feature}/             ← platform/workspace features (step, clearpuzzle, …)
      {FeatureType}.ts     ← concrete POM
      blocks.ts
      {feature}.spec.ts
  lab2/
    shared/
      Lab2Lab.ts           ← abstract base for lab2 labs
    {lab}/
      {Lab}Lab.ts          ← concrete POM
      blocks.ts            ← Blockly workspace JSON fixtures (TS objects)
      {lab}.spec.ts        ← Playwright spec
```

`LegacyBlocklyLab` is an **abstract class** with:

- `protected abstract buildLevelUrl(level: number): string` — each lab's URL
- `protected get instructionsSelector(): string` — default `.csf-top-instructions p`
- `protected get congratsSelector(): string` — default `.congrats`
- `protected async waitForInitialLoad()` — default waits for `#runButton` visible;
  override in labs where `#runButton` is absent or hidden on mount (e.g. Jigsaw)
- `async waitForReady()` — default checks `#runButton` visible + signincallout hidden;
  override together with `waitForInitialLoad()` when the run-button assumption breaks
- Shared locators: `runButton`, `resetButton`, `continueButton`, `againButton`,
  `congratsMessage`, `inlineFeedback`, `instructions`, `instructionsPanel`,
  `lightbulb`, `hintCount`
- Shared methods: `gotoLevel(n)`, `reloadLevel(n)`, `waitForLevel(n)`,
  `loadBlocks(json)`, `run()`, `reset()`, `nextLevel()`, `tryAgain()`,
  `waitForReady()`, `acceptHint()`

---

## Adding a new legacy lab

### Step 1 — Gather source material

Read (do not rely on memory):

1. The `.feature` file, e.g. `dashboard/test/ui/features/star_labs/bee.feature`
2. Relevant step definitions in `dashboard/test/ui/features/step_definitions/`,
   especially `blockly_initialization_blocks.rb` for block JSON and `steps.rb`
   for key-press and other game interactions
3. The lab's source directory (`apps/src/{maze,turtle,...}`) to confirm the
   architecture is legacy and to find any game-state globals (e.g. `Maze`,
   `Flappy`, `Bounce`)

### Step 2 — Determine URL scheme

**allthethingscourse activities** (Maze, Bee, Artist, Farmer, Jigsaw) — files live
under `tests/legacy/activities/{name}/`:

```typescript
import {labLevelUrl} from '../../../shared/urls';
protected buildLevelUrl(level: number): string {
  return labLevelUrl(lessonNumber, level);   // course defaults to 'allthethingscourse'
}
```

Lesson numbers (allthethingscourse/units/1):

- Jigsaw → 1, Maze → 2, Artist → 3, Bee → 4, Farmer → 6

**Other-course activities** (Bounce):

```typescript
return labLevelUrl(1, level, 'events'); // course = 'events'
```

**Standalone route activities** (Flappy):

```typescript
import {flappyLevelUrl} from '../../../shared/urls';
protected buildLevelUrl(level: number): string { return flappyLevelUrl(level); }
```

**Lab2 labs** (Music Lab etc.) — files live under `tests/lab2/{lab}/`; import
from the top-level shared module:

```typescript
import {labLevelUrl} from '../../shared/urls';
protected buildLevelUrl(level: number): string {
  return labLevelUrl(46, level) + '&library=intro2024';  // extra params appended
}
```

### Step 3 — Override selectors only when needed

Override the protected getter in the subclass when the lab differs from the
defaults:

```typescript
// Farmer — uses MarkdownInstructions component
protected override get instructionsSelector(): string {
  return '.instructions-markdown p';
}

// Flappy — congrats lives inside a modal
protected override get congratsSelector(): string {
  return '.modal .congrats';
}
```

### Step 4 — Write `{Name}.ts`

Minimal activity (no extra locators, default selectors):

```typescript
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';
import {labLevelUrl} from '../../../shared/urls';

/** Page Object for the Bee activity — lesson 4 of allthethingscourse. */
export class Bee extends LegacyBlocklyLab {
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(4, level);
  }
}
```

Activity with extra locators:

```typescript
import {type Locator, type Page} from '@playwright/test';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';
import {labLevelUrl} from '../../../shared/urls';

export class Farmer extends LegacyBlocklyLab {
  readonly pegman: Locator;
  readonly farmerAvatar: Locator;

  protected override get instructionsSelector(): string {
    return '.instructions-markdown p';
  }

  constructor(page: Page) {
    super(page);
    this.pegman = page.locator('#pegman');
    this.farmerAvatar = page.locator('img[src*="farmer/small_static_avatar"]');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(6, level);
  }

  async getDirtAt(x: number, y: number): Promise<number> {
    return this.page.evaluate(
      ({x, y}: {x: number; y: number}) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Maze.controller.map.getValue(x, y) as number,
      {x, y},
    );
  }
}
```

### Step 5 — Write `blocks.ts`

Extract JSON from `blockly_initialization_blocks.rb`.

**Escape conversion:** the Ruby source uses single-quoted strings. Occurrences
of `\"` in the Ruby source need to become `\\"` in the TypeScript single-quoted
string:

```ruby
# Ruby (single-quoted): \"DIR\" → actual value: \"DIR\"
load_json_blocks('{"fields":{"DIR":"<field name=\"DIR\">"}}')
```

```typescript
// TypeScript (single-quoted): \\"DIR\\" → actual value: \"DIR\"
export const WINNING_ARTIST_BLOCKS =
  '{"fields":{"DIR":"<field name=\\"DIR\\">..."}}';
```

If the Ruby source uses `\\"` (double-backslash-quote) — which appears in some
blocks — copy it as-is; the semantics are identical.

### Step 6 — Write `{name}.spec.ts`

Pattern:

```typescript
import {expect, test} from '@playwright/test';
import {WINNING_BEE_BLOCKS} from './blocks';
import {Bee} from './Bee';

test.describe('Bee — level 4', () => {
  let bee: Bee;

  test.beforeEach(async ({page}) => {
    bee = new Bee(page);
    await bee.gotoLevel(4);
  });

  test('winning solution completes the puzzle', async () => {
    await bee.loadBlocks(WINNING_BEE_BLOCKS);
    await bee.run();
    await expect(bee.congratsMessage).toBeVisible();
    await expect(bee.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 4.',
    );
  });
});
```

Tag `@no_mobile` on any test that the source Cucumber feature tags `@no_mobile`.
Flappy congrats uses `toContainText` (partial match) rather than `toHaveText`.

### Step 7 — Patch U+2019 apostrophes

The app emits U+2019 RIGHT SINGLE QUOTATION MARK in feedback strings (e.g.
`aren't`, `you've`). The Write tool writes U+0027 (plain apostrophe). After
writing any spec file containing feedback text assertions, patch with Python:

```python
import pathlib
p = pathlib.Path('tests/legacy/{lab}/{lab}.spec.ts')
data = p.read_bytes()
p.write_bytes(data.replace(b"aren\x27t", b"aren\xe2\x80\x99t"))
# repeat for other contractions as needed
```

Comment the affected assertion line:

```typescript
// ' is RIGHT SINGLE QUOTATION MARK; the app emits it instead of U+0027 APOSTROPHE
await expect(bee.inlineFeedback).toHaveText(
  "Not quite. Try using a block you aren't using yet.",
);
```

### Step 8 — Typecheck and run

```bash
# From frontend/
yarn turbo run typecheck --filter=@code-dot-org/apps-e2e-tests

# From frontend/packages/apps-e2e-tests/
yarn playwright test tests/legacy/activities/{name} --project=chromium --reporter=line
```

---

---

## Adding a new lab2 lab

### Step 1 — Confirm architecture and gather source material

Verify the lab lives under `apps/src/lab2/` framework (Music, WebLab2, PythonLab).
Find the Cucumber feature file(s) under `dashboard/test/ui/features/star_labs/`.
Find the level config under `dashboard/config/levels/custom/{lab}/` to learn the
URL lesson number, library param, startSources block format, and validations.

### Step 2 — Determine URL and ready signal

**allthethingscourse lab2 labs** (Music):

```typescript
import {labLevelUrl} from '../../shared/urls';
protected buildLevelUrl(level: number): string {
  return labLevelUrl(46, level) + '&library=intro2024';
  // append &library=intro2024 to skip the pack-selection dialog
}
```

**Ready signal** — the DOM element that confirms the workspace is mounted:

- **Music Lab**: `[data-id='when-run-block']` — only works for levels whose
  `startSources` sets `id: "when-run-block"` on the `when_run_simple2` block
  (Music Level 1, Level 3 do; Level 2 does not). Check the level config.
- **PythonLab**: `#uitest-codebridge-run` not disabled
- **WebLab2**: TBD

Implement `protected async waitForReady()` accordingly.

### Step 3 — Load blocks

Lab2 blocks are TypeScript objects (not JSON strings). Call `loadBlocks(json)`
which passes the object to `Blockly.serialization.workspaces.load()` via
`page.evaluate`. This fires `FINISHED_LOADING`, which the lab's view listens to
and triggers `compileSong()` → timeline auto-preview.

Block JSON format matches `startSources.blocks` in the level config:

```typescript
export const WINNING_MUSIC_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [{
      id: 'when-run-block',
      type: 'when_run_simple2',
      ...
      next: { block: { type: 'play_sound_at_current_location_simple2',
                       fields: { sound: 'disco_beat' } } },
    }],
  },
  variables: [{name: 'currentTime'}, {name: 'i'}],
};
```

### Step 4 — Write `{Lab}Lab.ts`

Extend `Lab2Lab` from `tests/lab2/shared/Lab2Lab.ts`. Add lab-specific locators:

```typescript
import {type Locator, type Page} from '@playwright/test';
import {labLevelUrl} from '../../shared/urls';
import {Lab2Lab} from '../shared/Lab2Lab';

export class MusicLab extends Lab2Lab {
  readonly runButton: Locator;
  readonly timelineElement: Locator;
  readonly whenRunBlock: Locator;

  constructor(page: Page) {
    super(page);
    this.runButton = page.locator('#run-button');
    this.timelineElement = page.locator('.timeline-element').first();
    this.whenRunBlock = page.locator("[data-id='when-run-block']");
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(46, level) + '&library=intro2024';
  }

  protected async waitForReady(): Promise<void> {
    await this.whenRunBlock.waitFor({state: 'visible'});
  }

  async loadBlocks(json: object): Promise<void> {
    await this.page.evaluate(blocksJson => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Blockly.serialization.workspaces.load(
        blocksJson,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Blockly.getMainWorkspace(),
      );
    }, json);
  }

  async run(): Promise<void> {
    await this.runButton.click();
  }
}
```

### Step 5 — Feedback message quirk

`#instructions-feedback-message` contains both the validation text AND the
continue-button label when `next: true`. Always use `toContainText` not
`toHaveText` for feedback assertions:

```typescript
await expect(music.feedbackMessage).toContainText('Nice work.');
```

The continue button itself is cleanly targetable via `music.continueButton`
(`#instructions-continue-button`).

### Step 6 — Typecheck and run

```bash
# From frontend/
yarn turbo run typecheck --filter=@code-dot-org/apps-e2e-tests

# From frontend/packages/apps-e2e-tests/
yarn playwright test tests/lab2/{lab} --project=chromium --reporter=line
```

---

## Iteration budget: N = 3

- **Attempt 1**: initial port from source
- **Attempt 2**: refine locators, timing, or state-setup based on failure output
- **Attempt 3**: final refinement

After each failed run, read the Playwright error and trace, re-read the relevant
step definitions, revise, and retry. If the test does not pass after 3 attempts,
escalate:

```typescript
test.fixme(
  'Budget exhausted: <what failed>. ' +
    'Source: dashboard/test/ui/features/star_labs/{lab}.feature "<scenario name>"',
);
```

---

## Skip and fixme protocol

| Marker               | When                                                    |
| -------------------- | ------------------------------------------------------- |
| `test.fixme(reason)` | Agent exhausted N=3 budget; needs human review          |
| `test.skip(reason)`  | User-decided non-port (out of scope, mobile-only, etc.) |

Every entry must include:

- What failed or why it was skipped
- Originating Cucumber feature path and scenario name

---

## Per-port artifacts

After completing or abandoning each port, produce:

1. **Test file** at `tests/legacy/activities/{name}/{name}.spec.ts` (or `tests/legacy/{feature}/` for platform features)
2. **Iteration log** at `agent-loop/logs/{lab}-{scenario-slug}.iteration.md`
   (format: see `ITERATION_LOG_FORMAT.md`)
3. **Update `agent-loop/batch-report.md`** with any fixme/skip entries

---

## Common patterns reference

**Key-hold for Bounce** (Bounce lab has `holdKey`/`releaseKey` methods):

```typescript
await bounce.run();
await bounce.holdKey('ArrowLeft'); // Playwright key name; Bounce checks keyCode 37
await expect(bounce.congratsMessage).toBeVisible();
await bounce.releaseKey('ArrowLeft');
```

**JavaScript game events for Flappy**:

```typescript
await flappy.run();
await flappy.setGravity(-1); // negative gravity → bird floats upward
await flappy.flap(); // calls Flappy.onMouseDown()
await expect(flappy.congratsMessage).toBeVisible();
```

**Game-state read via page.evaluate** (Farmer dirt value):

```typescript
const dirt = await farmer.getDirtAt(3, 3);
expect(dirt).toBe(0);
```

**Mid-test same-session navigation** (verify saved solution):

```typescript
await maze.nextLevel();
await maze.waitForLevel(6);
await maze.reloadLevel(5); // no session reset
await maze.run();
```

**Freeplay finish button** (Bounce level 10):

```typescript
await expect(bounce.finishButton).toBeHidden();
await bounce.run();
await expect(bounce.finishButton).toBeVisible();
await bounce.finish(); // calls finishButton.click() — prefer method over raw locator
await expect(bounce.congratsMessage).toBeVisible();
```

**Authenticated teacher** (teacher-tools tests):

```typescript
import {createTeacher} from '../shared/auth';

// Creates and signs in a teacher via /api/test/create_user (test env only).
// Do NOT use LegacyBlocklyLab.gotoLevel() after this — it calls /reset_session
// which clears the session. Navigate directly with page.goto(labLevelUrl(...)).
await createTeacher(page);
await page.goto(labLevelUrl(2, 4));
await expect(
  page.getByRole('heading', {name: 'Teacher Panel', level: 3}),
).toBeVisible();
```

**Teacher panel selector caveat:**
`#teacher-panel-container` is a zero-dimension wrapper div (its child `.teacher-panel`
is `position:fixed`). Playwright reports it as "hidden". Assert on the h3 heading:

```typescript
// Teacher present:
page.getByRole('heading', {name: 'Teacher Panel', level: 3});
// Teacher absent (InstructorsOnly renders null for non-teachers):
await expect(
  page.getByRole('heading', {name: 'Teacher Panel', level: 3}),
).not.toBeAttached();
```

**Labs without a visible run button** (Jigsaw):
Some labs hide `#runButton` on mount. Override both `waitForInitialLoad()` and
`waitForReady()` in the subclass; the base `gotoLevel()` then works unchanged:

```typescript
export class Jigsaw extends LegacyBlocklyLab {
  readonly workspace: Locator;

  protected override get congratsSelector(): string {
    return '.modal .congrats';
  }

  constructor(page: Page) {
    super(page);
    this.workspace = page.locator('.blocklyWorkspace');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(1, level);
  }

  protected override async waitForInitialLoad(): Promise<void> {
    await expect(this.workspace).toBeVisible();
  }

  override async waitForReady(): Promise<void> {
    await expect(this.workspace).toBeVisible();
    await expect(this.page.locator('.uitest-signincallout')).toBeHidden();
  }
}
```

**`getByRole` partial match vs lightbulb** (authored hints):
The lightbulb button has `aria-label="A friendly character with lightbulb image - click to
display instruction hints prompt (Do you want a hint? yes or no) if hints are available"`.
`getByRole('button', {name: 'Yes'})` partial-matches it (case-insensitive substring). Use
`exact: true` to target only the prompt confirm button:

```typescript
await page.getByRole('button', {name: 'Yes', exact: true}).click();
```
