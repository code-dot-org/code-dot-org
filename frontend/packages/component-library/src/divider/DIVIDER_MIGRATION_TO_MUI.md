# Divider Migration: DSCO to MUI

## Summary

`Divider` moves onto MUI's `Divider` as a thin wrapper in `src/divider`, the
way `dialog` is built. The wrapper keeps the legacy API prop for prop, so
every call site changes only its import line. It ships as `MuiDivider` beside
the untouched legacy names, and an import-only codemod moves the two consumer
files in one stacked PR.

The wrapper renders MUI's `<hr>` and puts the legacy module rules on it. MUI
supplies the element, its implicit `separator` role and its classes; the
module supplies the look. No theme override is added, so the nine call sites
that import `Divider` from `@mui/material` today render as they do now.

The target is what DSCO renders today, within 0.005 mismatch per story. No
story's render changes. Three legacy defects are fixed; none is visible.
Nothing is deferred: the legacy component has no behavior for MUI to take
over. Figma is out of scope.

## Approach and exports

Approach: **wrapper**. Theme overrides alone cannot carry the API. MUI
`Divider` has no `color` or `margin` prop, and it spreads every prop it does
not know onto the `<hr>`. Augmenting `DividerOwnProps` with them, as
Breadcrumbs does with `size`, would emit `color="strong"` and `margin="m"`
attributes, and Chromium maps an `hr` `color` attribute to border and
background presentational hints. A global `MuiDivider` override would also
restyle the nine `@mui/material` `Divider` call sites (`AiDiffChatHeader`,
`SelectDataset`, `AddResourceDialog`, `Toolbar`, `CanvasControls`,
`WorkshopEnrollments`, `WorkshopInformationSection` twice,
`WorkshopLinksSection`). Six of them are vertical at some width, where
`border: 0; border-top: 1px` erases the rule and `width: 100%` stretches it
across the row. No `styleOverrides/divider.ts` is added;
`styleOverrides/index.ts` and `muiAugmentation.ts` do not change.

Files (Execute):

| File                                  | Role                                                               |
| ------------------------------------- | ------------------------------------------------------------------ |
| `MuiDivider.tsx`                      | Renders MUI `Divider`; maps `color` and `margin` to module classes |
| `muiDivider.module.scss`              | `divider.module.scss` ported at two classes per selector           |
| `stories/MuiDivider.story.tsx`        | Twins (see Parity)                                                 |
| `stories/muiDividerStory.module.scss` | The twins' layout boxes, in place of the DSCO story's `style`      |
| `__tests__/MuiDivider.test.tsx`       | Legacy tests ported, plus the pins listed under Parity             |
| `index.ts`                            | Adds the new exports; legacy lines unchanged                       |
| `Divider.tsx`                         | `@deprecated` JSDoc only                                           |
| `codemods/divider-to-mui-divider.ts`  | The codemod                                                        |

MUI parts used: `Divider` from `@mui/material`, with `orientation`,
`flexItem`, `variant`, `component`, `absolute`, `light`, `textAlign` and
`children` left at MUI's defaults. It then renders
`<hr class="MuiDivider-root MuiDivider-fullWidth …">` with no `role` and no
`aria-orientation`, the element legacy renders.

MUI's root declarations (emotion, one class) that the module overrides:
`margin: 0`, `flex-shrink: 0`, `border-width: 0`, `border-style: solid`,
`border-color: var(--mui-palette-divider)`, `border-bottom-width: thin`. The
module, in legacy order:

```scss
.divider:global(.MuiDivider-root) {
  border: 0;
  border-top: 1px solid;
  width: 100%;
  margin-inline: auto;
  flex-shrink: 1;
}

.divider.divider-color-primary {
  border-top-color: var(--background-neutral-quaternary);
}

.divider.divider-color-strong {
  border-top-color: var(--background-neutral-senary);
}

// .divider.divider-margin-{none,xs,s,m,l}: margin-block 0, 0.5rem, 1rem, 2rem, 4rem
```

`flex-shrink: 1` restores the initial value legacy has; MUI's `0` lets a
100%-wide rule overflow a flex row. The local class names stay `divider`,
`divider-color-*` and `divider-margin-*`, so the hashed names still contain
`divider`.

Exports after Execute:

| Name                               | Status                           |
| ---------------------------------- | -------------------------------- |
| `MuiDivider`, `MuiDividerProps`    | New: the MUI wrapper             |
| `Divider`, `DividerProps`, default | Legacy, unchanged, `@deprecated` |

Policy: MuiX beside the untouched legacy names, with an alias swap later, as
in the dialog and chips runs. The tooltip precedent gave the MUI version the
plain name, but MUI's `Tooltip` came from `@mui/material` and did not collide.
Here both versions ship from `@code-dot-org/component-library/divider`, the
DSCO stories must keep rendering the legacy component for the gate to compare,
and handing the plain names to the wrapper in Execute would move both
consumers with no consumer PR to review or revert. Finish step 4 deletes the
legacy source and re-exports the wrapper as `Divider`, `DividerProps` and
`default`; the `Mui` names stay as aliases until consumers drop them. The
entry point keeps its `{__esModule, Divider, default}` shape plus
`MuiDivider`, which the `interop: 'auto'` note in
`frontend/packages/markdown/vite.config.ts` already covers.

## Prop map

Every prop keeps its name and value at the call site. `kind` says how the MUI
side implements the prop. `consumer` says what a call site edits.

| DSCO prop / behavior  | MUI side                                                                                                                                                              | kind          | consumer |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| `color`               | Module class `divider-color-<c>` on the root; destructured, never passed to MUI. Default `primary`                                                                    | wrapper-logic | none     |
| `margin`              | Module class `divider-margin-<m>` on the root; destructured, never passed to MUI. Default `none`                                                                      | wrapper-logic | none     |
| `className`           | MUI `className`, after the module classes                                                                                                                             | direct        | none     |
| other HTML attributes | Spread onto MUI `Divider`, which spreads them onto the `<hr>` (`id`, `style`, `aria-*`, `data-*`). Typed `Omit<HTMLAttributes<HTMLHRElement>, 'color' \| 'children'>` | direct        | none     |
| element and role      | MUI's default: a bare `<hr>`, implicit `separator`, no `role`, `aria-orientation` or `id` attribute. MUI classes added; legacy local names kept                       | direct        | none     |
| box model             | `.divider:global(.MuiDivider-root)`: `border: 0; border-top: 1px solid; width: 100%; margin-inline: auto; flex-shrink: 1`, over MUI's emotion root                    | wrapper-logic | none     |
| global side effects   | None. MUI `Divider` owns none either                                                                                                                                  | direct        | none     |
| orientation           | Horizontal only, as today. `orientation`, `flexItem` and `children` are not in the prop type; vertical rules keep `Divider` from `@mui/material`                      | wrapper-logic | none     |

## Codemod

Required. No entry's consumer change is `rewrite`, `rename` or `drop`. Every
call site edits only its import, and that edit is mechanical. The transform
is idempotent, so it can be re-run when staging gains consumers while the PR
is open. Build it from `codemods/dialog-to-mui-dialog.ts` (or
`chips-to-mui-chips.ts` once that lands) with the source and the rename table
swapped.

Script: `codemods/divider-to-mui-divider.ts`, run with `yarn jscodeshift`.

Transforms:

1. `import L from '@code-dot-org/component-library/divider'` becomes
   `import {MuiDivider as L} from '@code-dot-org/component-library/divider'`
   (no `as` when `L` is `MuiDivider`). It merges into an existing named value
   import from the same source.
2. The named value specifier `Divider` or `default`, under any local name
   `L`, becomes `MuiDivider as L`. Local bindings, JSX and identifier
   references are left as written.
3. The named type specifier `DividerProps` becomes `MuiDividerProps as L`.
   `import type` and inline `type` modifiers are kept.
4. `jest.mock`, `jest.doMock`, `vi.mock` or `vi.doMock` of the entry point
   whose factory returns one object literal: a `default` or `Divider` key whose
   value is a name or a function gains a `MuiDivider` key with the same value,
   unless one is already there. Any other shape is reported.
5. Files without the source are untouched. Specifiers already on `Mui` names
   are left alone. No prop is renamed or dropped, so no call site is skipped.
6. Reported per file for hand work, not rewritten: enzyme string selectors
   naming `Divider` as a type, passed to `find`, `filter`, `closest`,
   `children`, `parents`, `exists`, `is`, `not`, `some` or `every`; namespace
   imports; re-exports; `require()` / `import()` of the entry point.
7. `.ts` files are parsed with the `ts` parser, others with `tsx`.

Expected residue:

- `frontend/packages/markdown/src/__tests__/Markdown.test.tsx:57-58`: the
  comment and the regex `/<hr[^>]*class="[^"]*divider/` describe the DSCO
  module class. The regex still passes, because the wrapper keeps the
  `divider` local name, so left alone it would not show which component
  rendered. Assert `MuiDivider-root` on the `<hr>` instead.
- `frontend/packages/markdown/src/components/Markdown.tsx:185-186`: the comment
  says Divider is not MUI-migrated. Rewrite it in one line.
- `apps/src/quiz/attempt/page-divider.module.scss` `.rule`: `width: auto` and
  `margin-inline: 0` now lose to the wrapper's two-class rule, and
  `flex: 1 0 0` loses its `flex-shrink: 0`. The render does not change:
  `flex-basis: 0` sizes the rule, the two rules take all free space, so auto
  margins resolve to 0, and a rule of basis 0 cannot shrink. No edit; apps
  sample 1 checks it.
- No snapshot, enzyme selector or `jest.mock` of the entry point exists
  today; re-grep at execution.

How to run (build the package first; apps resolves it to `dist/`):

```bash
cd frontend/packages/component-library
yarn build
TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/divider-to-mui-divider.ts \
  --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register \
  --dry ../../../apps/src ../../../apps/test/unit ../markdown/src
TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/divider-to-mui-divider.ts \
  --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register \
  ../../../apps/src/quiz/attempt/PageDivider.tsx \
  ../markdown/src/components/Markdown.tsx
```

## Parity

Tolerance: 0.005 mismatch ratio per story. The goal is pixel-identical.

Twins: each DSCO story gets an MUI story with the same export name, args and
template, rendering `MuiDivider`. The play functions are ported unchanged;
they read `border-top-color` and `margin`, which the wrapper keeps. The
margin template's flex column and `#646464` box come from
`muiDividerStory.module.scss`, not `style`; the gray stays a literal, since
no token equals it and the gate needs the same pixels. Title:
`DesignSystem/Divider/MuiDivider`; a title nested under a leaf title already
works here (`DesignSystem/Accordion/FAQ Accordion`). Execute confirms the ids
against `index.json`.

| DSCO story id                                         | MUI story id                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `designsystem-divider--default-divider`               | `designsystem-divider-muidivider--default-divider`               |
| `designsystem-divider--group-of-dividers`             | `designsystem-divider-muidivider--group-of-dividers`             |
| `designsystem-divider--group-of-dividers-with-margin` | `designsystem-divider-muidivider--group-of-dividers-with-margin` |

Must be identical: all three, in Light and Dark, LTR and RTL. The DOM gains
`MuiDivider-root`, `MuiDivider-fullWidth` and an emotion class; the render
must not change. Each rule is one 1px top border in the same token, 100%
wide, with the legacy block margin. MUI's thin bottom border would land on
the same pixel row of a 0-height box, but the module keeps the top border so
the play functions and any consumer reading `border-top-color` see what they
see today. The rule is symmetric, so RTL matches LTR.

Intended deviations: none.

Storybook is not apps. The Storybook decorator wraps stories in
`StyledEngineProvider enableCssLayer` and `CssBaseline`, so emotion sits in a
layer and any unlayered module rule beats it. apps/ uses neither, so
emotion's runtime styles usually land after the bundled CSS and win ties;
the quiz chunk loads lazily, which can reverse the order. A one-class module
rule passes the gate and loses in apps. Every selector in
`muiDivider.module.scss` carries two classes, so it wins in both hosts.

Tests that pin the contract (Execute, in `__tests__/MuiDivider.test.tsx`):

- One `separator`; it is an `HR` with no `role`, `aria-orientation` or `id`
  attribute.
- For every `color` and `margin` value, the `<hr>` has no `color` or `margin`
  attribute and carries `MuiDivider-root` and the matching module classes;
  the defaults are `primary` and `none`.
- `id`, `style` (`clear: both`) and `data-*` reach the `<hr>`; the consumer
  `className` follows the module classes.
- `muiDivider.module.scss`, parsed with `postcss`, has no rule whose selector
  carries fewer than two classes. jsdom applies no cascade, so the DOM tests
  cannot see it.

## Legacy defects fixed while here

| Defect                                                                                                                                                    | Fix                                                                                                                                                                                      | Stories changed |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `DividerProps` extends `HTMLAttributes<HTMLElement>` and narrows the inherited `color`; it also admits `children`, which React rejects on the void `<hr>` | `MuiDividerProps` is `Omit<HTMLAttributes<HTMLHRElement>, 'color' \| 'children'>` plus `color` and `margin`. Names and values are unchanged; `children` would also switch MUI to a `div` | none            |
| `Markdown.test.tsx` asserts the hashed module class, tying a consumer test to the legacy CSS-module name                                                  | The consumer PR asserts `MuiDivider-root` on the `<hr>`                                                                                                                                  | none            |
| The margin story sizes and colors its boxes with inline `style`                                                                                           | The twin takes them from `muiDividerStory.module.scss`. The DSCO story is left as is                                                                                                     | none            |

Not fixed:

- Margins stay rem literals. The nearest tokens are the CADS padding ramp
  (`--spacing-p-xxs` 0.5rem, `-xs` 1rem, `-m` 2rem, `-xxxl` 4rem): another
  property family, shifted names, and a host that does not load
  `shapeAndSpacingVariables.css` would lose every margin.
- The border reads `--background-neutral-*` tokens. `--borders-neutral-primary`
  matches under the legacy brands but resolves to the CADS border token under
  `codeai-next`, the default brand in apps, so the swap changes the render.
  The Figma run decides.
- `width: 100%` with `margin-inline: auto` stays. The pair is redundant only
  while nothing narrows the rule; a curriculum `<hr style="width: 50%">`
  through Markdown's `inlineStyles` is centered by it.
- The `color` prop name still shadows the HTML attribute. Renaming it is an
  API change with no consumer to benefit; no consumer passes it.
- `primary` on white is about 1.5:1. A decorative separator is outside the
  3:1 non-text contrast rule; the value is a design call for the Figma run.
- No vertical orientation or `flexItem`. The nine `@mui/material` call sites
  already cover that; folding them into the wrapper is new API, not parity.

## Shared globals

| Legacy global                                                                                               | Manager the wrapper shares                                                                                                     |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| None: no portal, body scroll lock, document listener, z-index constant, focus handling or hardcoded id/role | Nothing to share. The wrapper must not add one; MUI `Divider` owns no global, and no `Popover`, `Modal` or `FocusTrap` is used |

## Deferred changes

None. MUI `Divider` has no behavior of its own: no focus, keys, portal or
`aria-hidden`. With the wrapper's props it renders the element, role and
attributes legacy renders, so no MUI behavior is held off. The status row
becomes **Migrated** when the consumer PR lands.

| Behavior | Legacy today | With MUI | UI tests at risk | After | Moves DOM | Ticket |
| -------- | ------------ | -------- | ---------------- | ----- | --------- | ------ |

## Story gaps

These states render in no DSCO story, so they have no twin. The finish
workflow adds each as an MUI story when it deletes the legacy source.

| State                                                                                                               | Why                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A bare divider as a flex item between two labels in a row, no consumer `flex` (PageDivider's shape without `.rule`) | Only a flex item shows `flex-shrink`. If the `flex-shrink: 1` cancellation is lost, MUI's `0` lets the 100%-wide rule overflow the row; every twin's divider sits in a block box |
| A divider narrowed by inline `style` (`width: 50%`), as a curriculum `<hr style>` reaches it                        | The only state where `margin-inline: auto` shows. If MUI's `margin: 0` wins, the rule moves to the start edge, unseen by the twins                                               |

## Consumer chunks

Chunk size 25. One PR, stacked on the Execute PR.

| PR  | Scope                                                                                                                                                           | Files | Parity sample |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------- |
| 1   | `apps/src/quiz/attempt/PageDivider.tsx`, `frontend/packages/markdown/src/components/Markdown.tsx`, `frontend/packages/markdown/src/__tests__/Markdown.test.tsx` | 3     | 1, 2          |

Per PR: `yarn build` in `frontend/packages/component-library`, run the
codemod on the two source files, fix the Markdown test and comment, run
`yarn test` in `frontend/packages/markdown` and jest for
`apps/test/unit/quiz/attempt/QuizAttemptWorkspaceTest.tsx`, `yarn build` in
`frontend/packages/markdown` (apps resolves it to `dist/` too), run
`tools/hooks/lint.rb origin/staging <branch>`, and check the samples on the
local studio.

Apps parity sample:

1. `/s/allthethings/lessons/52/levels/11` ("Quiz Lab2 Showcase", two
   pages, results shown after submit), signed in as the seeded student
   `pink.audit.student@example.com`. Press "Begin", answer the three
   page-1 questions, press "Next", answer the page-2 question, press
   "Finish". The results view heads each page with a divider row ("Page 1 of
   2", "Page 2 of 2"). Capture at 1280px and at 400px wide (PageDivider:
   flex row, consumer `className`, Lab2 host, lazily loaded chunk).
2. `/s/coursee-2023/lessons/8/levels/1` (`courseD_artist_project1_2023`),
   same account. The instructions pane holds Elsa's prompt; the rule sits
   between "…between 20 and 50 pixels wide." and "You can try making a
   polygon". Expand the instructions if they are collapsed (Markdown `<hr/>`
   through `BlocklyMarkdown`, dashboard host with Bootstrap 3 and
   `legacy.scss`'s global `hr` rule).

## Docs

Execute:

- `@deprecated` JSDoc on legacy `Divider`, `DividerProps` and the default
  export, naming `MuiDivider` / `MuiDividerProps` and the codemod.
- `src/divider/README.md`: document both APIs, the import lines, `color` and
  `margin`, that a consumer `className` needs two classes (or inline `style`)
  to override border, margin, width or `flex-shrink`, and that vertical and
  flex-item separators use `Divider` from `@mui/material`.
- `codemods/README.md`: a section for the divider codemod.
- `MIGRATION_STATUS.md`: the `divider` row becomes In Progress,
  "— (wrapper, no override)", pointing at this plan.

Migrate (only when both consumer files are moved):

- `MIGRATION_STATUS.md`: the `divider` row becomes Migrated. Deferred changes
  is empty.
- `.agents/skills/design-system/SKILL.md`: add Divider to "Use MUI for", via
  `import {MuiDivider} from '@code-dot-org/component-library/divider'`, with
  `Divider` from `@mui/material` kept for vertical and flex-item separators.
- `apps/.eslintrc.js`: a `no-restricted-imports` paths entry for
  `@code-dot-org/component-library/divider` with
  `importNames: ['Divider', 'default', 'DividerProps']` and a message naming
  the codemod.
- `src/divider/README.md` keeps its legacy section until step 4, since those
  names still resolve.

Later, not this run: step 4 deletes the legacy source and swaps the aliases.
Whether the design-system look moves into a global `MuiDivider` override,
which would restyle the nine `@mui/material` call sites, is for the Figma run.

## Risks

- Emotion precedence differs between Storybook and apps (see Parity). A
  module rule that loses to emotion only in apps passes the gate. Keep every
  selector at two classes; the postcss test pins it.
- A consumer `className` can no longer override border, margin, width or
  `flex-shrink` with one class; under legacy it could, by load order. Neither
  consumer depends on it (see Codemod residue), and Markdown's `style` is
  inline and still wins.
- The two-class rules also outrank ancestor-scoped `X hr` rules (0,1,1) that
  beat the legacy class (0,1,0). grep finds none around either consumer; the
  ID-scoped `#puzzleRatingButtons hr` still wins and does not wrap Markdown.
- `color` and `margin` must be destructured. Passed through, MUI puts them on
  the `<hr>`, and Chromium styles an `hr` `color` attribute. The tests pin it.
- Passing `orientation`, `component` or `children` to MUI switches the root to
  a `div` with `role="separator"` and `aria-orientation`, which the module's
  top border draws wrong. The prop type omits them.
- A later global `MuiDivider` override reaches the wrapper in every property
  the module does not set (`opacity`, `height`, `align-self`).
- The quiz sample needs the allthethings quiz questions seeded, and both
  paths assume the current lesson positions. Execute confirms them before
  capturing.
- `dist/` is gitignored and can hold another branch's build. Rebuild
  `component-library`, then `markdown`, before any apps or Storybook check.
- The Storybook a11y job runs axe on every story; run
  `yarn vitest --run --project=storybook src/divider` in
  `frontend/apps/design-system-storybook` before pushing.
- The ESLint rule covers `apps/` only. Nothing stops a new legacy import in
  `frontend/packages`; the markdown consumer is the one there today.

## Deviations

- **Contract tests assert behavior, not classes.** Parity lists two pins the
  execution rules forbid: the `<hr>` carrying `MuiDivider-root` and the module
  classes in a given order, and a `postcss` parse of `muiDivider.module.scss`.
  `MuiDivider.test.tsx` instead checks that no `color` or `margin` value
  reaches the `<hr>` as an attribute, that a consumer `className` rule takes
  effect on it, that it carries no `role`, `aria-orientation`, `aria-hidden`
  or `id`, that it renders in place and leaves `document.body` alone, that Tab
  skips it, and, with `@ts-expect-error`, that `orientation`, `flexItem` and
  `children` are not props. The defaults (`primary`, `none`) and the look are
  checked by the twins' play functions and the pixel diff. Nothing automated
  guards the two-class rule: Storybook layers emotion, so a one-class selector
  would lose only in apps, where the Migrate samples check it.

## Outcome

Consumers: both moved, in one stacked PR (`apps/src/quiz/attempt`,
`frontend/packages/markdown`). None is left on the legacy names, and a grep
finds no legacy import of `@code-dot-org/component-library/divider` in
`apps/` or `frontend/packages` outside `src/divider` itself.

Verify: green. `yarn test src/__tests__/Markdown.test.tsx` in
`frontend/packages/markdown` passed 117 of 117; jest for
`apps/test/unit/quiz/attempt/QuizAttemptWorkspaceTest.tsx` passed 64 of 64;
eslint was clean on the four consumer files.

Parity: all three twins pixel-identical to their DSCO stories in Light and
Dark (mismatch ratio 0.0000 for each of the six pairs; see the Execute PR).

Apps parity: not run. No local studio was reachable during the sweep, so
neither sample was captured. Sample 1 is the only check of the two-class
rule against `.rule` in `page-divider.module.scss`; run it before the
consumer PR merges.

Codemod: rewrote 2 files, the import line of `PageDivider.tsx` and of
`Markdown.tsx`, both to `{MuiDivider as Divider}`. Untouched: everything
else in the scanned trees. In `Markdown.tsx` it also parenthesized the JSX
body of `makeLink`, a reprint artifact that was reverted by hand. Hand
residue, as predicted: the stale comment in `Markdown.tsx` and the
`Markdown.test.tsx` assertion, which now matches `MuiDivider-root` on the
`<hr>`. `page-divider.module.scss` is unchanged. The markdown package's
`dist/` was not rebuilt; apps renders `---` with the legacy `Divider` until
it is.
