# Accordion Migration: DSCO to MUI

## Summary

`Accordion` and `FAQAccordion` move onto MUI's `Accordion`, `AccordionSummary`
and `AccordionDetails`. The look goes into a theme override, so a bare
`Accordion` from `@mui/material` gets it too. A thin wrapper in
`src/accordion` keeps the legacy `items` API and the legacy behavior. It ships
as `MuiAccordion` and `MuiFAQAccordion` beside the untouched legacy names. An
import-only codemod moves the one consumer, `TutorVideoDialog.jsx`, in one
stacked PR.

Each item stops being a native `<details>`/`<summary>`. It becomes MUI's
root, a summary `<button type="button" aria-expanded>`, and a collapse panel
that keeps closed content mounted. The wrapper turns off three MUI behaviors
the legacy component lacks: the `<h3>` around the summary, `role="region"` on
the panel, and the height animation. Each is deferred to a later PR.

The target is what DSCO renders today, within 0.005 mismatch per story. Six
legacy defects are fixed on purpose. Two of them change an open-state
render; none changes a closed one, and every DSCO story renders closed.
Figma is out of scope.

## Approach and exports

Approach: **both**, a theme override and a wrapper.

- Override. Every visual property of an item (border, radius, backgrounds,
  hover, chevron color and flip, focus ring, paddings) is CSS on MUI slots.
  It belongs in the theme, as with `Tooltip` and `Button`. No MUI
  `Accordion` is used anywhere in `apps/` or `frontend/` today, so a global
  override restyles nothing else.
- Wrapper. The DSCO API is an `items` array whose string labels and contents
  are wrapped in `Typography`, laid out as a column with a 1rem gap. MUI's
  composition API cannot express that, so a wrapper keeps it, the way
  `notification-banner` does. The wrapper also holds the legacy-behavior
  `slotProps` (see Deferred changes), so a bare MUI `Accordion` keeps MUI's
  own semantics and animation.

Files (Execute):

| File                                                            | Role                                                                                |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/themes/code.org/styleOverrides/accordion.ts`               | `ACCORDION_OVERRIDES`, `ACCORDION_SUMMARY_OVERRIDES`, `ACCORDION_DETAILS_OVERRIDES` |
| `src/themes/code.org/styleOverrides/index.ts`                   | Registers `MuiAccordion`, `MuiAccordionSummary`, `MuiAccordionDetails`              |
| `src/accordion/MuiAccordion.tsx`, `muiAccordion.module.scss`    | Root, one MUI `Accordion` per item, `Typography` wrapping                           |
| `src/accordion/faqAccordion/MuiFAQAccordion.tsx`                | `MuiAccordion` plus the JSON-LD script, as legacy                                   |
| `src/accordion/stories/MuiAccordion.story.tsx`                  | Twins of the three `DesignSystem/Accordion` stories                                 |
| `src/accordion/faqAccordion/stories/MuiFAQAccordion.story.tsx`  | Twins of the three FAQ stories                                                      |
| `src/accordion/__tests__/MuiAccordion.test.tsx`                 | Legacy tests ported, plus the pins listed under Parity                              |
| `src/accordion/faqAccordion/__tests__/MuiFAQAccordion.test.tsx` | Legacy FAQ test ported, plus the JSON-LD pin                                        |
| `src/accordion/index.ts`, `faqAccordion/index.ts`               | Add the new exports; legacy lines unchanged                                         |
| `Accordion.tsx`, `faqAccordion/FAQAccordion.tsx`                | `@deprecated` JSDoc only                                                            |
| `package.json`                                                  | `./accordrion/faqAccordion` export key corrected (see defects)                      |
| `codemods/accordion-to-mui.ts`                                  | The codemod                                                                         |

`muiAugmentation.ts` does not change: no new variant, color or size.

MUI parts used, from `@mui/material`: `Accordion` (an MUI `Paper` root, with
`Collapse` as its transition slot), `AccordionSummary` (an MUI `ButtonBase`
that renders `<button type="button">`), `AccordionDetails`, and `Typography`
as the legacy source already uses it. `AccordionActions` and `Stack` are not
used. The root is a plain `div` with a module class, as today, so a consumer
`className` meets no emotion styles and keeps today's precedence.

The override, `styleOverrides/accordion.ts`:

- `MuiAccordion.defaultProps`: `disableGutters: true`, `square: true`,
  `elevation: 0`. `square` keeps off Paper's radius and MUI's
  first-of-type/last-of-type radius rules, so the root override's radius
  applies to all four corners of every item.
- `MuiAccordion` root: a 1px `--borders-neutral-primary` border,
  `border-radius: 0.25rem`, background `--background-neutral-secondary`,
  color `--text-neutral-primary` (see defects), `overflow: hidden`, and
  `&::before {display: none}`.
- Focus ring, on the `MuiAccordion` root: while its summary has
  `.Mui-focusVisible` (`:has`), a 2px `--borders-brand-teal-primary`
  outline at `outline-offset: 0.125rem`, the `focus-styles` mixin.
- `MuiAccordionSummary` root: `font: inherit`, `min-height: 0`,
  `padding: 0.75rem 1.25rem`, `gap: 0.875rem`,
  `justify-content: space-between`, background
  `--background-neutral-primary`, `transition: none`, `& p {margin: 0}`.
  Expanded, it adds a 1px `--borders-neutral-primary` bottom border.
  Focus-visible adds no background: MUI's `palette.action.focus` is
  cancelled. On hover, focused or not, the background is
  `--background-neutral-secondary` and the icon wrapper's color is
  `--text-neutral-quaternary`.
- `MuiAccordionSummary` content slot: `margin: 0`.
- `MuiAccordionSummary` expandIconWrapper slot: color
  `--text-neutral-placeholder`, `transform: none`,
  `transition: all 0.2s ease`; expanded, `transform: scaleY(-1)`. MUI's
  `rotate(180deg)` is replaced so the flip is the legacy one.
- `MuiAccordionDetails` root: `padding: 0`, and
  `& > p {margin: 0; padding: 1.25rem}`.

`font: inherit` on the summary is load-bearing. A `<button>` does not
inherit font: in Storybook the UA gives it 13.33px, which would shrink the
1em chevron, and dashboard's `legacy.scss` gives every `button`
`font-size: large`, then `14px` with `line-height: 20px`.

The wrapper, `MuiAccordion.tsx`, renders this shape:

```tsx
<div className={classNames(moduleStyles.accordion, className)} {...rest}>
  {items.map(({id, label, content}) => (
    <Accordion
      key={id}
      slotProps={{
        heading: {component: 'div'},
        region: {role: undefined},
        transition: {timeout: 0},
      }}
    >
      <AccordionSummary
        expandIcon={
          <FontAwesomeV6Icon iconName="chevron-down" aria-hidden="true" />
        }
      >
        {typeof label === 'string' ? (
          <Typography variant="body2" component="span">
            <Typography variant="strong">{label}</Typography>
          </Typography>
        ) : (
          label
        )}
      </AccordionSummary>
      <AccordionDetails>
        {typeof content === 'string' ? (
          <Typography variant="body2">{content}</Typography>
        ) : (
          content
        )}
      </AccordionDetails>
    </Accordion>
  ))}
</div>
```

- `muiAccordion.module.scss`:
  `.accordion {display: flex; flex-direction: column; gap: 1rem; width: 100%}`.
- Each slot prop carries one comment line naming Deferred changes.
- Each `Accordion` is uncontrolled, with no `unmountOnExit`. The summary
  gets no `id` and no `aria-controls`.
- `gutterBottom` is dropped from both `Typography` wrappers: legacy
  cancelled it with `margin: 0`.

DOM after Execute:

`div.accordion` > per item `div.MuiAccordion-root` > (`div.MuiAccordion-heading` >
`button.MuiAccordionSummary-root[type=button][aria-expanded]` >
`span.MuiAccordionSummary-content` + `span.MuiAccordionSummary-expandIconWrapper` >
`i[aria-hidden=true]`) + (`div.MuiCollapse-root` > `div.MuiCollapse-wrapper` >
`div.MuiCollapse-wrapperInner` > `div.MuiAccordion-region` >
`div.MuiAccordionDetails-root` > content).

Exports after Execute:

| Entry                    | Name                                                                          | Status                           |
| ------------------------ | ----------------------------------------------------------------------------- | -------------------------------- |
| `accordion`              | `MuiAccordion`, `MuiAccordionProps`, `MuiAccordionItem`                       | New: the wrapper                 |
| `accordion`              | `MuiFAQAccordion`, `MuiFAQAccordionProps`                                     | New: the FAQ wrapper             |
| `accordion/faqAccordion` | `MuiFAQAccordion`, `MuiFAQAccordionProps`, `MuiFAQAccordionItem`              | New: the FAQ wrapper             |
| `accordion`              | `Accordion`, `AccordionProps`, `FAQAccordion`, `FAQAccordionProps`, `default` | Legacy, unchanged, `@deprecated` |
| `accordion/faqAccordion` | `FAQAccordion`, `FAQAccordionProps`, `FAQAccordionItem`, `default`            | Legacy, unchanged, `@deprecated` |

`MuiAccordionItem` is new: legacy `AccordionItem` is exported from the
module but not from `index.ts`, and callers typing `items` need it.

Policy: MuiX beside the untouched legacy names, with an alias swap later, as
in the dialog and chips runs. The tooltip precedent gave the MUI version the
plain name, but MUI's `Tooltip` came from `@mui/material` and did not
collide. Here both ship from the same entry, and the DSCO stories import
`../index` and must keep rendering the legacy component for the gate to
compare. The finish workflow's step 4 deletes the legacy source and
re-exports the wrappers under the legacy names and `default`; the `Mui`
names stay as aliases until callers drop them.

## Prop map

Every prop keeps its name and value at the call site. `kind` says how the
MUI side implements it. `consumer` says what a call site edits.

| DSCO prop / behavior                  | MUI side                                                                                                                                                    | kind          | consumer |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| `items`                               | One `Accordion` per item, key `id`, holding `AccordionSummary` and `AccordionDetails`; `id` stays a React key only                                          | wrapper-logic | none     |
| `className`                           | Root `div`, after the module class                                                                                                                          | wrapper-logic | none     |
| other `HTMLAttributes`                | Spread on the root `div` (`id`, `data-*`, `aria-*`, `style`, handlers)                                                                                      | wrapper-logic | none     |
| `label` (string / ReactNode)          | `AccordionSummary` children: a string in `Typography body2 component="span"` > `Typography strong`; a ReactNode as is                                       | wrapper-logic | none     |
| `content` (string / ReactNode)        | `AccordionDetails` children: a string in `Typography body2` (a `<p>`); a ReactNode as is                                                                    | wrapper-logic | none     |
| open/close behavior                   | Uncontrolled `Accordion`, all closed, each item independent; `slotProps.transition.timeout: 0`; closed content stays mounted; Enter/Space on the `<button>` | wrapper-logic | none     |
| chevron icon                          | `expandIcon` = `FontAwesomeV6Icon chevron-down aria-hidden`; color, `scaleY(-1)` flip and 0.2s transition from the `expandIconWrapper` override             | wrapper-logic | none     |
| focus ring                            | `MuiAccordion` root override `:has(.MuiAccordionSummary-root.Mui-focusVisible)`; summary focus background cancelled                                         | theme-default | none     |
| no globals, ids, roles, warnings      | `slotProps.heading.component: 'div'`, `slotProps.region.role: undefined`, no summary `id`/`aria-controls`; no `console.warn`; MUI adds no global            | wrapper-logic | none     |
| FAQ `questionString` / `answerString` | `MuiFAQAccordion` composes `MuiAccordion` and renders the same `JsonLd` `FAQPage` script after the root                                                     | wrapper-logic | none     |

## Codemod

Required. No entry's consumer change is `rewrite`, `rename` or `drop`. Every
call site edits only its import, and that edit is mechanical. The transform
is idempotent, so it can be re-run when staging gains consumers while the
PRs are open. Build it from `codemods/dialog-to-mui-dialog.ts` with the
source paths and the rename tables swapped.

Script: `codemods/accordion-to-mui.ts`, run with `yarn jscodeshift`.

Transforms:

1. `import L from '@code-dot-org/component-library/accordion'` becomes
   `import {MuiAccordion as L} from '@code-dot-org/component-library/accordion'`
   (no `as` when `L` is `MuiAccordion`). It merges into an existing named
   value import from the same source.
2. Named value specifiers from `.../accordion`, under any local name `L`:
   `Accordion` and `default` become `MuiAccordion as L`; `FAQAccordion`
   becomes `MuiFAQAccordion as L`. JSX and identifier references are left
   as written.
3. Named type specifiers from `.../accordion`: `AccordionProps` becomes
   `MuiAccordionProps as L`, `FAQAccordionProps` becomes
   `MuiFAQAccordionProps as L`. `import type` and inline `type` modifiers are
   kept.
4. From `.../accordion/faqAccordion`: the default import and `FAQAccordion`
   become `MuiFAQAccordion as L`; `FAQAccordionProps` and `FAQAccordionItem`
   become `MuiFAQAccordionProps as L` and `MuiFAQAccordionItem as L`.
5. `jest.mock`, `jest.doMock`, `vi.mock` or `vi.doMock` of either entry,
   where the factory returns one object literal: for a `default`,
   `Accordion` or `FAQAccordion` key whose value is a name or a function, add
   the matching `Mui` key with the same value unless one is there. Any other
   value, or a factory with both `default` and the named key, is reported.
6. Files without either source are untouched. Specifiers already on `Mui`
   names are left alone. No prop is renamed or dropped, so no call site is
   skipped.
7. Reported per file for hand work, not rewritten: enzyme string selectors
   naming `Accordion` or `FAQAccordion` as a type, passed to `find`,
   `filter`, `closest`, `children`, `parents`, `exists`, `is`, `not`,
   `some` or `every`; namespace imports; re-exports; `require()` /
   `import()` of either entry.
8. `.ts` files are parsed with the `ts` parser, others with `tsx`.

Expected residue:

- None by hand in the one consumer. `TutorVideoDialog.jsx` becomes
  `import {MuiAccordion as Accordion} from '@code-dot-org/component-library/accordion'`.
  It has no unit test, no snapshot and no enzyme selector.
- No consumer SCSS edit. `.example` (`margin: 12px 0`) lands on the root
  `div`, which carries no emotion styles, as today. `.exampleCode` is on the
  `<pre>`, which no override reaches (`& > p` matches only a `<p>`).
- Not residue, but checked by hand: the `<pre>` text takes
  `--text-neutral-primary` from the item root instead of the dialog's
  inherited color (the dark-text fix), and the summary is now a `<button>`
  under dashboard's global `button` rules (see Risks).

How to run (build the package first; apps resolves it to `dist/`):

```bash
cd frontend/packages/component-library
yarn build
TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/accordion-to-mui.ts \
  --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register \
  --dry ../../../apps/src ../../../apps/test/unit
TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/accordion-to-mui.ts \
  --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register \
  ../../../apps/src/levelbuilder/lesson-editor/TutorVideoDialog.jsx
```

## Parity

Tolerance: 0.005 mismatch ratio per story. The goal is pixel-identical.

Twins: each DSCO story gets an MUI story with the same export name, args and
play function, rendering `MuiAccordion` or `MuiFAQAccordion`. One change: in
the FAQ `Playground` twin, the assertion that a collapsed answer is hidden
runs inside `waitFor`. MUI `Collapse` with `timeout: 0` still reaches
`exited` on the next macrotask, so right after the click the panel is 0px
tall but not yet `visibility: hidden`. Titles:
`DesignSystem/Accordion/MuiAccordion` and
`DesignSystem/Accordion/MuiFAQAccordion`. Execute confirms the ids against
`index.json`.

| DSCO story id                                                               | MUI story id                                                                  |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `designsystem-accordion--playground`                                        | `designsystem-accordion-muiaccordion--playground`                             |
| `designsystem-accordion--with-rich-content`                                 | `designsystem-accordion-muiaccordion--with-rich-content`                      |
| `designsystem-accordion--multiple-accordions`                               | `designsystem-accordion-muiaccordion--multiple-accordions`                    |
| `designsystem-accordion-faq-accordion--playground`                          | `designsystem-accordion-muifaqaccordion--playground`                          |
| `designsystem-accordion-faq-accordion--with-long-answers`                   | `designsystem-accordion-muifaqaccordion--with-long-answers`                   |
| `designsystem-accordion-faq-accordion--with-multiple-paragraphs-as-content` | `designsystem-accordion-muifaqaccordion--with-multiple-paragraphs-as-content` |

Capture, for the gate: the Discover recipe with the MUI selectors. Wait for
`#storybook-root .MuiAccordion-root` and clip the parent of the first one,
the wrapper root. Discover's closed and `-open-` baselines are both diffed.
For the open state, call `HTMLElement.click()` on every
`.MuiAccordionSummary-root` inside `page.evaluate`, then wait 400ms. A
Playwright pointer click leaves the last summary hovered, and the legacy
open captures set `details.open` with no pointer.

Must be identical: all six closed twins in Light and Dark, LTR and RTL
(24 captures), and every open capture except the intended deviations below.
The DOM differs (button, collapse wrappers, MUI classes); the render must
not.

Intended deviations, open captures only:

- `with-rich-content`: items 1 and 3 render their paragraph on one line
  instead of three (`Start with the` / `Hour of Code` / `activities…`), so
  those items are shorter. All rich text (the two paragraphs and the list)
  takes `--text-neutral-primary`: a small shift in Light, near black to
  white in Dark.
- `with-multiple-paragraphs-as-content` (FAQ): the paragraphs and list take
  `--text-neutral-primary`, as above. Layout is unchanged.

Behavior differences accepted, not deferred:

- The summary is a `<button type="button" aria-expanded>` where it was a
  `<summary>`. The item loses `<details>`' implicit `group` role. Nothing
  selects on either; Tab order, Enter and Space are unchanged.
- ButtonBase sets `user-select: none`, so the label text no longer selects
  on drag.
- Chrome expands a closed `<details>` when find-in-page matches its text.
  MUI's closed panel is `visibility: hidden`, so a closed answer no longer
  matches. React 18 cannot render `hidden="until-found"`.
- An `<i>` inside a ReactNode label no longer takes the chevron's color and
  flip; legacy styled every `summary i`. No story or consumer has one.

Storybook is not apps. The decorator wraps stories in
`StyledEngineProvider enableCssLayer` and `CssBaseline`; apps uses neither, so there emotion lands
after the bundled CSS and wins ties. The root carries no emotion, so a
consumer `className` behaves as today. The overrides meet dashboard's
global `button` and `label, input, button` rules at class specificity and win.

Tests that pin the contract (Execute):

- Each summary is a `button` named by its label, `aria-expanded` false
  until clicked; Enter and Space toggle it; Tab stops once per item.
- Closed content is in the document and not visible (`waitFor` after a
  close click); a link inside closed content is not reached by Tab.
- Two items open independently.
- No `heading` role, no `region` role, and no `id` other than one the
  caller passes.
- The chevron is `aria-hidden`; a string label puts no `<p>` inside the
  button.
- `className`, `id`, `data-*` and `style` land on the root.
- `MuiFAQAccordion`: the JSON-LD script is the root's next sibling and holds
  one `Question` per item.
- The five legacy `Accordion` tests and the FAQ test, ported.

## Legacy defects fixed while here

| Defect                                                                                                                                                 | Fix                                                                                                           | Stories changed                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ReactNode content takes no token color; in Dark it is near black on the dark panel                                                                     | Item root `color: var(--text-neutral-primary)`, replacing Paper's `palette.text.primary`                      | `with-rich-content`, `with-multiple-paragraphs-as-content` (open only) |
| `details > p` is `display: flex; flex-direction: column`, so a `<p>` with inline children splits into lines                                            | `& > p` keeps `margin: 0` and `padding: 1.25rem` and drops the flex rules; a text-only `<p>` renders the same | `with-rich-content` (open only)                                        |
| A string label renders a block `<p>` inside `<summary>`; the summary is now a `<button>`, which takes phrasing content only                            | The outer label `Typography` renders as `span`                                                                | none                                                                   |
| The chevron `<i>` has no `aria-hidden`, so its glyph can leak into the summary's name                                                                  | `aria-hidden="true"` on the icon                                                                              | none                                                                   |
| `.accordion` sets `justify-items` (ignored by flex) and centers items it then widens to 100%                                                           | The MUI root keeps `display`, `flex-direction`, `gap` and `width`; items stretch                              | none                                                                   |
| `package.json` exports `./accordrion/faqAccordion`, so the documented `@code-dot-org/component-library/accordion/faqAccordion` import does not resolve | The key becomes `./accordion/faqAccordion`. Nothing imports the misspelled path                               | none                                                                   |

Not fixed:

- Padding reaches only a direct `<p>`; `ul`, `pre` and fragments get none.
  Padding all content is a design call for the Figma run, and it would move
  the one consumer's `<pre>`.
- The focus ring needs `:has`. Every supported browser has it, and a ring on
  the summary would change the focused render.
- Item `id` stays off the DOM. Ids land with the region row below, from
  `useId`: item ids repeat across accordions on one page (the FAQ stories
  share `what-is-code-org`).
- No open/close animation: kept, see Deferred changes.
- The DSCO story titles break `DesignSystem/<Component>/<Name>`. Renaming
  them changes the ids the gate and Eyes key on; the twins use conforming
  titles, and step 4 retires the DSCO stories.

## Shared globals

| Legacy global                                                                               | Manager the wrapper shares                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| None: no portal, scroll lock, document or window listener, z-index constant, or React state | Nothing to share. The wrapper adds none: `Accordion` and `Collapse` render in place, and `ButtonBase` detects focus-visible per element (`:focus-visible`), not with a document listener. No `Modal`, `Popover` or `Portal` is introduced |

## Deferred changes

The wrapper keeps these legacy behaviors through `slotProps`. Each row is
one later PR, after lifecycle step 4 deletes the legacy source; it removes
one slot prop from `MuiAccordion.tsx` and deletes its row. The status row
becomes **Migrated** when the table is empty. No UI-test file selects on
this component, so none is at risk; the risk is page CSS and screen-reader
output.

| Behavior             | Legacy today                                                      | With MUI                                                                                                                             | UI tests at risk | After | Moves DOM | Ticket |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ----- | --------- | ------ |
| Heading              | No heading; `slotProps.heading.component: 'div'`                  | The summary sits in an `<h3>` (`all: unset`); a heading per item in the page outline. A page rule such as `.x h3` outranks the reset | None             |       | yes       |        |
| Region               | No `role="region"`, no ids; `slotProps.region.role: undefined`    | `role="region"` on the panel, labelled by the summary through a `useId` id and `aria-controls`; each open panel becomes a landmark   | None             |       | no        |        |
| Open/close animation | Instant, as native `<details>`; `slotProps.transition.timeout: 0` | `Collapse` animates height (`timeout: 'auto'`); a capture or assertion right after a click must wait for the transition              | None             |       | yes       |        |

## Story gaps

These states render in no DSCO story, so they have no twin. The finish
workflow adds each as an MUI story when it deletes the legacy source.

| State                                                   | Why                                                                                                                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expanded items, Light and Dark, string and rich content | The chevron flip, the summary's bottom border, the `& > p` padding and the rich-text color fix show only open; the gate sees them only in the extra `-open-` captures |
| Hover on a summary                                      | The hover background and chevron color sit over MUI's `transition` and background rules; a lost override passes every closed capture                                  |
| Focus-visible (Tab onto a summary in a play function)   | The ring comes only from the root's `:has(.Mui-focusVisible)` rule, and MUI's own focus background must stay cancelled                                                |
| A ReactNode label                                       | `font: inherit` on the `<button>` decides its font; every story uses string labels, which set their own                                                               |

## Consumer chunks

Chunk size 25. One PR, stacked on the Execute PR.

| PR  | Scope                                                      | Files | Parity sample |
| --- | ---------------------------------------------------------- | ----- | ------------- |
| 1   | `apps/src/levelbuilder/lesson-editor/TutorVideoDialog.jsx` | 1     | 1             |

Per PR: `yarn build` the package, run the codemod on the file, run
`tools/hooks/lint.rb origin/staging <branch>`, and check the sample on the
local studio.

Apps parity sample (this run captures none; `appsParity` is off, so it is a
hand check):

1. `/lessons/<id>/edit` for any lesson in a migrated unit, with
   `levelbuilder_mode: true` in `locals.yml`, signed in as a local account
   with the levelbuilder permission. Expand the "Tutor Deep Dive" section,
   press "Add Video", then in the "Add JSON Video" dialog press "Show example
   JSON file". Check it closed and open, hovered, and focused with Tab (the
   example `<pre>` in its own box; `className` margin on the root).

## Docs

Execute:

- `@deprecated` JSDoc on legacy `Accordion`, `AccordionProps`,
  `FAQAccordion`, `FAQAccordionProps`, `FAQAccordionItem` and both default
  exports, naming the `Mui` replacement and the codemod.
- JSDoc on every prop of `MuiAccordionProps`, `MuiAccordionItem` and
  `MuiFAQAccordionProps`.
- `src/accordion/README.md` and `faqAccordion/README.md`: both APIs, the
  import lines (the `faqAccordion` path now resolves), how to compose a bare
  MUI `Accordion` with the chevron `expandIcon`, pointers to this plan and
  the codemod's README entry, Storybook.
- `codemods/README.md`: an entry for `accordion-to-mui.ts`.
- `MIGRATION_STATUS.md`: the `accordion` row becomes In Progress, override
  `styleOverrides/accordion.ts` plus the wrapper, pointing at this plan; the
  `STYLE_OVERRIDES` block lists `MuiAccordion`, `MuiAccordionSummary`,
  `MuiAccordionDetails`.

Migrate (only when the consumer is moved):

- `MIGRATION_STATUS.md`: the `accordion` row becomes Migrated, behavior
  pending, linking Deferred changes.
- `.agents/skills/design-system/SKILL.md`: add Accordion to "Use MUI for",
  via `import {MuiAccordion} from '@code-dot-org/component-library/accordion'`.
- `apps/.eslintrc.js`: two `no-restricted-imports` paths entries, each
  with a message naming the codemod:
  - `@code-dot-org/component-library/accordion`, `importNames` `default`,
    `Accordion`, `AccordionProps`, `FAQAccordion`, `FAQAccordionProps`.
  - `@code-dot-org/component-library/accordion/faqAccordion`, `importNames`
    `default`, `FAQAccordion`, `FAQAccordionProps`, `FAQAccordionItem`.
- The READMEs keep their legacy sections until step 4, since those names
  still resolve.

## Risks

- Dashboard styles every `button`: `legacy.scss` sets `margin: 5px`,
  `padding: 10px`, a border, `border-radius: 4px`, `font-size: large`, a
  gray background and black text, and `label, input, button` sets `14px` /
  `line-height: 20px`. ButtonBase and the summary override set each of these
  at class specificity. A scoped rule (`#dialog button {min-width: 4em}` in
  `common.scss`, any `.x button`) outranks one class; the hand check is the
  guard.
- Emotion precedence differs between Storybook and apps (see Parity). Keep
  emotion off the root.
- The close is asynchronous by one macrotask. A test or play function that
  asserts hidden content right after a click must use `waitFor`.
- Find-in-page no longer reaches closed content (see Parity).
- A global override restyles every MUI `Accordion` that ever appears. None
  exists today; a later one gets the DSCO look unless it overrides.
- `dist/` is gitignored and can hold another branch's build. Rebuild before
  any apps or Storybook check.
- The Storybook a11y job runs axe on every story. Before pushing, run
  `yarn test-storybook --run ../../packages/component-library/src/accordion`
  in `frontend/apps/design-system-storybook`.
- The hand check needs levelbuilder mode and a levelbuilder account, and
  `/lessons/<id>/edit` redirects for a lesson in an unmigrated unit.

## Deviations

Execute records here every place the code departs from this plan.

- Closed Dark captures are not byte-identical. Each item differs from its
  DSCO baseline in about 14 anti-aliased pixels at its four rounded corners,
  where the summary's dark background shows through the border's edge
  (exact-diff ratio about 0.0002 per story, under the 0.005 tolerance).
  Light captures, every open capture outside the intended deviations, hover
  and focus-visible are exact. Setting `position: relative` on the legacy
  `<summary>` reproduces most of the difference in DSCO; making MUI's summary
  and root static does not remove it, and the rest was not traced.
- Codemod transform 5: a mock key written as a method (`Accordion() {}`) is
  reported, not copied, the same as any value that is neither a name nor a
  function expression. A factory with two legacy keys for one `Mui` key is
  reported once and gets no key for it; its other keys are still copied.
- Codemod transform 4 also rewrites a named `default` specifier from
  `.../accordion/faqAccordion` (`{default as L}`), as transform 2 does for
  `.../accordion`.
