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
        blocks.ts          ← Blockly workspace object fixtures (TS objects)
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
      blocks.ts            ← Blockly workspace object fixtures (TS objects)
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
  `loadBlocks(blocksJson: object)`, `run()`, `reset()`, `nextLevel()`, `tryAgain()`,
  `waitForReady()`, `acceptHint()`
- Protected hook `navigate(url: string)` runs the full 4-step sequence
  (reset_session → goto → waitForInitialLoad → dismissOptionalOverlays → waitForReady).
  Available to subclasses that need an alternate URL scheme (e.g. Dance course vs
  allthethingscourse); do not duplicate the sequence manually.

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

Extract JSON from `blockly_initialization_blocks.rb` and represent it as a
TypeScript object literal. `LegacyBlocklyLab.loadBlocks(blocksJson: object)`
passes the object directly to `Blockly.serialization.workspaces.load()` via
structured-clone serialization — no JSON string or `JSON.stringify` needed.

The `<field name="...">` XML values embedded in block `fields` become plain
TypeScript string values with single-quoted strings (no backslash escaping):

```typescript
// Ruby source (escaped quotes): \"<field name=\\\"DIR\\\">turnLeft</field>\"
// TypeScript object literal (no escaping needed):
export const WINNING_ARTIST_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 32,
        y: 32,
        next: {
          block: {
            type: 'draw_move_by_constant',
            fields: {
              DIR: '<field name="DIR">moveForward</field>',
              VALUE: '100',
            },
          },
        },
      },
    ],
  },
};
```

If the workspace has `variables`, include them at the top level alongside `blocks`:

```typescript
export const MY_BLOCKS = {
  variables: [{name: 'dancer1', id: 'some-id'}],
  blocks: { languageVersion: 0, blocks: [...] },
};
```

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

**POM encapsulation rule**: Spec files call POM methods, not raw locators. Define
every UI interaction as a named method on the POM class.

```typescript
// Correct — interaction owned by POM:
await bounce.finish();
await dance.generateAiEffects();

// Wrong — raw selector in spec body:
await bounce.finishButton.click();
await dance.page.locator('#generate-button').click();
```

The `lab.page` property is public for cases where Playwright-specific operations
(keyboard events, `waitForTimeout`, DOM assertions) have no POM equivalent.
Use it sparingly and only in the spec, not inside POM methods.

---

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
import {Maze} from '../legacy/activities/maze/Maze';

// Creates and signs in a teacher via /api/test/create_user (test env only).
// Use reloadLevel() (no session reset) after createTeacher so the auth session
// is preserved. gotoLevel() calls /reset_session, which would clear the session.
await createTeacher(page);
const maze = new Maze(page);
await maze.reloadLevel(4);
await expect(
  page.getByRole('heading', {name: 'Teacher Panel', level: 3}),
).toBeVisible();

// Anonymous user: use gotoLevel() normally.
const maze2 = new Maze(page);
await maze2.gotoLevel(4);
await expect(
  page.getByRole('heading', {name: 'Teacher Panel', level: 3}),
).not.toBeAttached();
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

**Blockly grid dropdown** (Sprite Lab sprite picker):
`I click block field "selector" number N` dispatches pointer events on the nth editable
field SVG element. Use `locator.dispatchEvent()` (not `evaluate`) so WebKit receives
correctly-formed events. The grid items briefly detach during Blockly's open animation;
wait for `attached` state then click via `evaluate()` to bypass Playwright's stability check:

```typescript
// in SpriteLab.ts
async clickBlockFieldAt(selector: string, index: number): Promise<void> {
  const locator = this.page.locator(selector).nth(index);
  await locator.dispatchEvent('pointerdown', {bubbles: true});
  await locator.dispatchEvent('pointerup', {bubbles: true});
}

async selectDropdownItem(index: number): Promise<void> {
  await this.page.locator('.blocklyFieldGridItem').nth(index).waitFor({state: 'attached'});
  await this.page.evaluate(idx => {
    const items = document.querySelectorAll('.blocklyFieldGridItem');
    (items[idx] as HTMLElement)?.click();
  }, index);
}
```

**Phaser game ready signal** (Minecraft/Craft labs):
`I wait until the Minecraft game is loaded` polls `Craft?.phaserLoaded()`. Override
`waitForInitialLoad()` to wait for both `#runButton` and the Phaser ready flag:

```typescript
// in Craft.ts
protected override async waitForInitialLoad(): Promise<void> {
  await this.runButton.waitFor({state: 'visible'});
  await this.page.waitForFunction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => !!(window as any).Craft?.phaserLoaded(),
    {timeout: 60000},
  );
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

---

**React portal event delegation** (AI modal emoji buttons):
React 17 moved event delegation from `document` to the root app container.
jQuery `.click()` dispatches synthetic events that do not reach React portal
listeners. Use direct Playwright `.click()` for any element rendered in a React
portal (modal, tooltip, dropdown). Document in POM JSDoc: "Direct click required
— React portal listeners do not receive jQuery synthetic events."

```typescript
// Wrong — jQuery does not reach portal listeners:
await this.pressJQuery('[aria-label="🎉"]');

// Correct — real browser event propagates to portal root:
await this.page.locator('[aria-label="🎉"]').click();
```

The `pressJQuery` method has been removed. Use `page.locator(selector).click()`
universally — Playwright dispatches real browser events that reach all listener
types. Only fall back to `page.evaluate(() => el.click())` when Playwright's
hit-testing must be bypassed (e.g. element obscured by a modal backdrop).

---

**Blockly variable ID instability** (save round-trip XML comparison):
`Blockly.serialization.workspaces.load()` regenerates all variable `id="..."`
attributes on every deserialization. Exact XML comparison after a save/reload
fails because IDs are re-rolled. Strip them before comparing:

```typescript
const stripVarIds = (xml: string) => xml.replace(/ id="[^"]+"/g, '');

const before = stripVarIds(await dance.getBlockXML());
await dance.projectShareButton.click();
await dance.waitForProjectSave();
await dance.page.reload();
expect(stripVarIds(await dance.getBlockXML())).toBe(before);
```

Define `stripVarIds` as a module-level const in the spec file. Extract to a
shared utility only if a second spec needs it.

---

**Per-assertion timeout override** (slow timer-based levels):
When a level fires success at a fixed timestamp that exceeds the global
`expect.timeout` (default 15s in this suite), override the timeout on the
specific assertion — not on the whole test or describe block:

```typescript
// Level fires at 4 measures (~17s at default BPM) — override expect timeout.
await expect(dance.congratsMessage).toBeVisible({timeout: 30_000});
```

Document the reason inline: which timestamp block, approximate elapsed time,
and why the global timeout is insufficient.

---

**Confirmation modal after Start Over** (free-play levels):
Clicking `#clear-puzzle-header` (Start Over) opens a "Are you sure?" modal.
It must be explicitly dismissed before subsequent workspace interactions:

```typescript
await dance.clearPuzzleHeader.click();
await dance.confirmStartOver(); // clicks #confirm-button in the confirmation modal
```

Define `confirmStartOver()` on the POM. Tests that skip this step will fail
on any subsequent click because `.modal-backdrop` intercepts events.

---

**`waitForTimeout` is an antipattern** (Playwright best practice):
`page.waitForTimeout(n)` is a fixed-time sleep — it adds latency and can mask
failures on slow machines. Replace with a real condition wherever possible:

| Instead of                         | Use                                              |
| ---------------------------------- | ------------------------------------------------ |
| `waitForTimeout(500)` after save   | `expect(updatedAt).toContainText('Saved')`       |
| `waitForTimeout(1000)` after share | `page.waitForResponse('/api/...')` or DOM signal |
| `waitForTimeout(n)` polling state  | `page.waitForFunction(condition)`                |

For save completion, `.project_updated_at` shows "Saved" — use that:

```typescript
async waitForProjectSave(): Promise<void> {
  await expect(this.projectUpdatedAt).toContainText('Saved', {timeout: 10_000});
}
```

---

## Clean code and Playwright best practices

These rules were extracted from the live codebase. Apply them in new ports
and fix them when touching existing files.

### POM boundary: all interactions belong on the POM

Spec files must read as a list of requirements, not a list of selectors.
Every interaction — click, wait, evaluate, network intercept — belongs on
the POM class. The only exception is the `lab.page` escape hatch for
Playwright-specific operations with no POM equivalent (keyboard events,
viewport resize).

```typescript
// Correct — spec body is requirement prose:
await applab.waitForDataLibrary();
await applab.selectDataTable('table_name2');
await applab.expectDataTableCell('Seattle');

// Wrong — spec leaks selectors:
await studentPage
  .locator('#data-library-container')
  .waitFor({state: 'visible'});
await studentPage.locator('a', {hasText: 'table_name2'}).click();
await expect(studentPage.locator('td', {hasText: 'Seattle'})).toBeVisible();
```

### Use `expect()` assertions not `isVisible()` snapshot reads

`isVisible()` is a synchronous snapshot — it does not retry. Replacing it
with `expect(...).toBeVisible()` gets Playwright's auto-retry and produces
a clearer failure message.

```typescript
// Wrong — single snapshot, no retry:
if (await chevron.isVisible()) {
  await chevron.click();
}

// Correct for conditional click (still OK as guard, but document why):
// isVisible() intentional: chevron is absent on course-level pages
if (await chevron.isVisible()) {
  await chevron.click();
}
```

For assertions (not guards), always use `expect`:

```typescript
// Wrong:
expect(await foo.isVisible()).toBe(true);

// Correct:
await expect(foo).toBeVisible();
```

### `.catch(() => {})` swallows all errors

Only suppress `TimeoutError` when polling for an optional element; re-throw
everything else so genuine failures surface.

```typescript
// Wrong — swallows network errors, assertion errors, everything:
await locator.waitFor({state: 'visible', timeout: 1000}).catch(() => {});

// Correct:
import {errors} from '@playwright/test';
await locator.waitFor({state: 'visible', timeout: 1000}).catch((e: unknown) => {
  if (!(e instanceof errors.TimeoutError)) throw e;
});
```

### `waitForTimeout` is always wrong

See the dedicated anti-pattern table above. Always replace with a real
wait signal. For saves: `expect(updatedAt).toContainText('Saved')`. For
async server operations: `page.waitForResponse()`. For polling game state:
`page.waitForFunction()`.

### Pre-navigation `waitForResponse` for fire-and-forget requests

Some levels fire async server requests immediately on page load (e.g. App
Lab `populate_tables`). The response completes _after_ the DOM is ready,
so waiting for a DOM signal is not enough. Set up the `waitForResponse`
listener **before** `page.goto()`, then await it after `waitForReady()`:

```typescript
const populatePromise = page.waitForResponse(
  r => r.url().includes('populate_tables'),
  {timeout: 15_000},
);
await page.goto(url);
await lab.waitForReady();
await populatePromise; // blocks until server confirms table data written
```

### Extract common auth boilerplate with a private helper

`createTeacher` and `createStudent` share identical CSRF / POST / error
logic. Extract to a private `createTestUser(page, payload)` function in
`tests/shared/auth.ts`. The public helpers then only build the payload
fields that differ between user types.

### DRY repeated color/state mappings with a private helper

When a method and its sibling encode the same `state → CSS value` mapping,
extract the mapping to a private helper that both call:

```typescript
private progressColors(state: 'not_tried' | 'attempted' | 'perfect'): {
  bg: string; border: string;
} {
  return {
    bg: state === 'perfect' ? 'rgb(14, 190, 14)' : 'rgb(254, 254, 254)',
    border: state === 'not_tried' ? 'rgb(198, 202, 205)' : 'rgb(14, 190, 14)',
  };
}
```

---

## Codebase-wide POM completeness status

All current specs are fully POM-encapsulated. Every interaction lives on
the POM class; no raw `page.locator()` calls remain in spec bodies.

**Complete** (spec reads as requirements, all interactions in POM):
`dance`, `dance-age-filter`, `maze`, `artist`, `bee`, `farmer`, `bounce`,
`flappy`, `jigsaw`, `spritelab`, `studio`, `challenge-level`, `pixelation`,
`pkc`, `music`, `pythonlab`, `mixmoveai`, `netsim`, `hoc`, `hoc-signed-in`,
`modal-function-editor`, `sharepage`, `applab`, `user-menu`, `csp-instructions`,
`teacher-panel`, `catalog`, `weblab`, `multi`, `match`.

When porting or modifying any spec, all interactions must live on the POM.
If a file has no POM at all, create one before adding tests.
