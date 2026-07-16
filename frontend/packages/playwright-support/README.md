# @code-dot-org/playwright-support

Shared Playwright test support for frontend packages: fixtures, config helpers,
and scripts. Visual-regression testing is the first member; the package is the
home for any common Playwright support that follows.

## Visual regression — `./visual`

A provider-agnostic `visualCheck` fixture. One backend captures native
Playwright screenshots (local); the other drives Applitools Eyes (CI). The
backend is chosen at runtime by the `VISUAL_PROVIDER` env var, so the same
`@visual` test serves both. There are **no committed baselines** — Applitools
is the source of truth; local runs compare against ephemeral snapshots only.

### Wire it into a package

`e2e/fixtures/visual.ts`:

```ts
import {createVisualTest} from '@code-dot-org/playwright-support/visual';

export const {test, expect} = createVisualTest({appName: 'Code.org Foo'});
export type {
  VisualCheck,
  VisualCheckOptions,
} from '@code-dot-org/playwright-support/visual';
```

`playwright.config.ts` — exclude `@visual` from the functional projects and
register the visual projects (chromium-only by default):

```ts
import {visualProjects} from '@code-dot-org/playwright-support/visual';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
      grepInvert: /@visual/,
    },
    ...visualProjects(),
  ],
});
```

A test:

```ts
import {test} from './fixtures/visual';

test('@visual initial render', async ({page, visualCheck}) => {
  await page.goto('/');
  await visualCheck('initial');
});
```

`package.json`:

```jsonc
"scripts": {"test:visual:prove": "prove-visual"},
"devDependencies": {"@code-dot-org/playwright-support": "workspace:*"}
```

### How visual runs

- **CI:** the e2e job sets `VISUAL_PROVIDER=applitools` + `APPLITOOLS_API_KEY`,
  so `@visual` tests diff against Eyes automatically. Writing a `visualCheck` is
  the only opt-in; no `@visual` tests means no checkpoints (and no cost).
- **Local:** `yarn test:visual:prove` runs the `prove-visual` bin — it generates
  throwaway native baselines under `.visual-baselines/`, re-runs the visual projects 5x to
  confirm determinism, then deletes them. Add `.visual-baselines` to `.gitignore`.
- **`yarn test:ui`** (plain `playwright test`) runs the functional projects
  only; visual projects register only when `VISUAL_PROVIDER` is set.

## API

| Export                        | Purpose                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `createVisualTest({appName})` | Extended `{test, expect}` with the `visualCheck` fixture.                                                    |
| `visualProjects({browsers?})` | Playwright `projects` for `@visual` tests; `[]` unless `VISUAL_PROVIDER` is set. Defaults to `['chromium']`. |
| `prove-visual` (bin)          | Local stability gate; run via a `test:visual:prove` script.                                                  |
