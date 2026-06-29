# Accessibility tests

Automated accessibility scans for studio.code.org pages, run with axe-core
(`@axe-core/playwright`). This is the house convention; it overrides upstream
Playwright a11y advice where they differ.

## Dedicated specs, never tacked onto functional tests

A11y scans live in their own files here, one per page/area:

    tests/a11y/<area>.a11y.spec.ts

A functional spec (under `tests/<area>/`) exercises behavior; an a11y spec
navigates to a page state and scans it. Keeping them apart means a functional
change and an a11y regression fail in different files, and coverage is auditable
by listing this directory. Reuse the page's existing POM (`tests/pages/`) to
navigate — do not duplicate selectors here.

## One scan per (page, meaningful state)

Coverage is tracked per **page + meaningful state**, deduplicated across the whole
suite. Do not add a test that re-scans a state another test already covers. Do add
a separate test when the same route presents materially different UI — a modal
open vs closed is two states worth scanning, the way `multi-level.a11y.spec.ts`
covers initial load, the win modal, and the dismissed-incorrect modal.

Title convention makes coverage greppable:

    test('<page label> — <state>', async ({page}) => { ... });

Before adding a test, grep this directory for the page's existing titles and fill
only the gaps.

## The pattern

Use the shared helper from `tests/shared/a11y.ts` — never re-implement the scan:

```ts
import {expect, test} from '@playwright/test';

import {MultiLevel} from '../pages/multi-level';
import {expectBaselineViolations} from '../shared/a11y';

test.describe('Accessibility: multi level', () => {
  test('multi level — initial load', async ({page}) => {
    const level = new MultiLevel(page);
    await level.gotoLevel({lesson: 9, level: 1});

    await expectBaselineViolations(page, ['color-contrast', 'image-alt']);
  });
});
```

`a11y.ts` exports `WCAG_TAGS` (2.0/2.1/2.2 at A and AA — AA is the floor),
`violationIds`, and `expectBaselineViolations(page, baseline, opts?)`.

## Baselining existing violations

`expectBaselineViolations` asserts the scan's violation IDs **equal** the baseline
exactly. A new violation fails; fixing one means dropping its id from the baseline.
Suppression is the baseline list and nothing else — **never disable an axe rule**
to force green.

To baseline a new state: pass `[]`, run the spec, read the actual violation IDs
from the assertion diff, and fill the array. A flaky page can surface a violation
on only some runs, so run the spec **2–3 times** and use the **union** of the IDs
seen — a too-narrow baseline turns a real intermittent violation into a flake.

## Scoping to dodge flake

A full-page scan flakes when the background re-renders out from under it (e.g. a
milestone POST repaints the page while a modal is up). Scope to the part that
matters, but only when a full-page scan is genuinely noisy — scoping narrows what
you cover:

```ts
await expectBaselineViolations(page, ['color-contrast'], {selector: '.modal'});
```

## Scope

These tests are a **regression guard**: they hold the line on known violations and
catch new ones. Remediating a baselined violation is separate work. Lowering a
baseline is welcome; never raise one to make a test pass.
