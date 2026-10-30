# Chips Migration: DSCO to MUI

## Summary

`Chips` moves onto MUI as a wrapper in `src/chips`, the way `dialog` and
`notification-banner` are built. Each chip becomes an MUI `Chip` rendered as
a `<label>`, and the row becomes an MUI `FormGroup`. The wrapper keeps the
legacy API prop for prop, so every call site changes only its import line.
It ships as `MuiChips` beside the untouched legacy names. An import-only
codemod moves the six consumer files in one stacked PR.

The wrapper keeps the legacy form contract. Every chip still holds a real
`<input type="checkbox" name="<name>[]">` inside a `<label>`, so form posts,
native `required` validation, Cucumber's `input[name='grades[]']` clicks and
`getByRole('checkbox')` queries see what they see today. MUI's interactive
chip (`ButtonBase`, `role="button"`, its own Tab stop) is not used.

The target is what DSCO renders today, within 0.005 mismatch per story. Two
legacy defects are fixed on purpose; neither changes a story's render. Four
behaviors stay legacy and are deferred. Figma is out of scope.

## Approach and exports

Approach: **wrapper**. Theme overrides alone cannot do this. The DSCO API
describes a group (`options`/`values`/`setValues`, the `name[]` form array,
group-level `required` with custom validity, the `fieldset` and its
heading), which MUI `Chip` does not model. The look is keyed to the
wrapper's own DOM (`:has(input:checked)`), so a theme variant would style an
MUI `Chip` that has no checked state without the wrapper. A global `MuiChip`
override would also restyle the five apps files that use MUI `Chip` today
(`sentencePieces`, `AiTutorVersionFileChip`, `UploadedFileChip`,
`BackpackFileChip`, `NetworkRequestChip`). No `styleOverrides/chips.ts` is
added, and `muiAugmentation.ts` does not change: `size`, `color` and
`textThickness` stay wrapper props mapped to module classes, not MUI unions.

Files (Execute):

| File                                                               | Role                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `MuiChips.tsx`                                                     | Group, heading, `FormGroup`, one MUI `Chip` per option, validity   |
| `muiChips.module.scss`                                             | `chip.module.scss` ported, plus the MUI cancellations listed below |
| `stories/MuiChips.story.tsx`                                       | Twins (see Parity)                                                 |
| `__tests__/MuiChips.test.tsx`                                      | Legacy tests ported, plus the pins listed below                    |
| `index.ts`                                                         | Adds the new exports; legacy lines unchanged                       |
| `Chips.tsx`                                                        | `@deprecated` JSDoc only                                           |
| `codemods/chips-to-mui-chips.ts`, `package.json` (`codemod:chips`) | The codemod                                                        |

MUI parts used, from `@mui/material`:

- `FormGroup row` for the chip row. Its emotion styles (`display: flex`,
  `flex-wrap: wrap`, `flex-direction: row`) are the legacy
  `.chipsContainer`; the module adds `gap: 0.5rem`.
- `Chip component="label" variant="outlined"` per option, with no
  `onClick`, `clickable`, `onDelete` or `disabled`. Without those, `Chip`
  renders its root as the plain `<label>`: no `ButtonBase`, no `role`, no
  `tabIndex`. The checkbox and the option text go in the `label` prop, so
  they render inside `span.MuiChip-label`. `outlined` is the closest MUI
  shape (a 1px border), so the fewest MUI declarations differ.

Not used: `FormControl`, `FormLabel` and `FormHelperText`. `FormControl` is
`inline-flex` with `min-width: 0`, `FormLabel` adds an asterisk when
required and its own colors, and moving the heading into a `<legend>` pulls
in Bootstrap 3's `legend` styles on dashboard. All three are deferred (see
Deferred changes). `Typography` is not used for the heading or the chip
text: the legacy mixins read `--font-size-body-*` custom properties, which
the CADS brand can change, while the theme's `label1`-`label4` and
`body1`-`body4` use literal rem values.

DOM after Execute (new parts in bold):

`div.chips[data-testid="chips-<name>"]` > `fieldset`**`[aria-labelledby]`** >
(`label.groupLabel`**`[id]`**)? + `div.chipsContainer`**`.MuiFormGroup-root`** >
`div` > `label.chip`**`.MuiChip-root`** > **`span.MuiChip-label`** >
`input[type=checkbox][name="<name>[]"][value]` + text.

The module keeps the legacy local class names (`chips`, `chips-<color>`,
`chips-<size>`, `groupLabel`, `chipsContainer`, `chip`, `chip-thick`,
`chip-thin`) and the same selector shapes, so the cascade between them
resolves as today. That includes the 1em `margin-bottom` that
`paragraph-common` gives thin chips (0.5rem for thick), which outranks
`.chip {margin: 0}`.

MUI root and label-slot declarations the module must override, each from a
selector with at least two classes (see Risks):

- Chip root: `display: inline-block` (MUI `inline-flex`), `height: auto`
  (32px), `vertical-align: baseline` (`middle`), `transition: none`
  (animates `background-color`), plus `padding`, `border`,
  `border-radius`, `background-color`, `color`, `cursor` and the type
  mixins, which the legacy rules already set. `max-width: 100%`,
  `box-sizing: border-box` and `outline: 0` stay: Bootstrap 3 already gives
  `label` the same `max-width` on dashboard, both hosts already resolve
  `border-box`, and the legacy ring rules set `outline` at higher
  specificity.
- Label slot, via `slotProps.label.className`: `padding: 0` (MUI 11px each
  side), `overflow: visible`, `text-overflow: clip`, `white-space: normal`
  (see defects). It stays `display: inline`; signUpFlowStyles' global
  `span {margin-bottom: 0.125rem !important}` meets it, and vertical margins
  do nothing on an inline box.

Implementation notes: the per-option component is not `memo`ized, and its
validity reset runs after every render, as the legacy effect does in
practice (its `onCheckedChange` dependency is a new function each render).
It accepts no HTML attribute passthrough; `Chips` never forwarded any. The
input's `onChange` reads `e.target.checked` and calls
`e.target.setCustomValidity('')`, as today; `SingleSectionSetUpTest`
simulates `change` with a stub target of exactly that shape.

Exports after Execute:

| Name                             | Status                           |
| -------------------------------- | -------------------------------- |
| `MuiChips`, `MuiChipsProps`      | New: the MUI wrapper             |
| `Chips`, `ChipsProps`, `default` | Legacy, unchanged, `@deprecated` |

Policy: MuiX beside the untouched legacy names, with an alias swap later,
as in the dialog run. The tooltip precedent gave the MUI version the plain
name, but MUI's `Tooltip` came from `@mui/material` and did not collide.
Here both ship from `@code-dot-org/component-library/chips`, and the DSCO
stories must keep rendering the legacy component for the gate to compare.
The finish workflow's step 4 deletes the legacy source and re-exports the
wrapper as `Chips`, `ChipsProps` and `default`; the `Mui` names stay as
aliases until consumers drop them.

## Prop map

Every prop keeps its name and value at the call site. `kind` says how the
MUI side implements the prop. `consumer` says what a call site edits.

| DSCO prop / behavior           | MUI side                                                                                                                                  | kind          | consumer |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| `name`                         | Each input's `name` is `<name>[]`; the outer `div` gets `data-testid="chips-<name>"`                                                      | wrapper-logic | none     |
| `label`                        | `<label id={useId()} className=groupLabel>` first in the `fieldset`, rendered only when truthy; the `fieldset` gets `aria-labelledby`     | wrapper-logic | none     |
| `options`                      | One `Chip component="label"` per option in `FormGroup row`, each in a `div`, key `option.value`; `label` prop = input + `option.label`    | wrapper-logic | none     |
| `values`                       | Input `checked={values.includes(option.value)}`                                                                                           | wrapper-logic | none     |
| `setValues`                    | Check: `uniq([...values, value])`; uncheck: `values.filter(v => v !== value)`. Append order, as today                                     | wrapper-logic | none     |
| `required`                     | Input `required={required ? values.length === 0 : false}`; passed to no MUI component                                                     | wrapper-logic | none     |
| `requiredMessageText`          | `onInvalid`: `setCustomValidity(requiredMessageText \|\| 'Please choose at least one option')`                                            | wrapper-logic | none     |
| `disabled`                     | Input `disabled`; not passed to `Chip`, whose disabled look is `opacity: 0.38` and `pointer-events: none` (no `not-allowed` cursor)       | wrapper-logic | none     |
| `textThickness`                | `chip-thick` / `chip-thin` class on the `Chip` root; `button-*-text` / `body-*` mixins per size                                           | wrapper-logic | none     |
| `color`                        | `chips-black` / `chips-gray` class on the outer `div`; `Chip` `color` stays `default`                                                     | wrapper-logic | none     |
| `size`                         | `chips-xs` … `chips-l` class on the outer `div`; `Chip` `size` stays `medium`                                                             | wrapper-logic | none     |
| `className`                    | Outer `div`, after the module classes                                                                                                     | direct        | none     |
| DOM structure                  | As above; new: `span.MuiChip-label` between the chip `<label>` and its input, MUI classes on the row and the chips, ids on the heading    | wrapper-logic | none     |
| focus and keyboard             | The native checkbox is the only Tab stop per chip; Space toggles. Ring from `:has(input:focus-visible)` on the root, 2px teal, offset 2px | wrapper-logic | none     |
| role and a11y                  | `role="checkbox"` from the native input, named by its wrapping `<label>`; the group gains a name (see defects)                            | wrapper-logic | none     |
| form submission                | Real inputs in the host form; checked chips post `name[]=value`                                                                           | wrapper-logic | none     |
| validity reset                 | `setCustomValidity('')` in an effect after every render and in `onChange`                                                                 | wrapper-logic | none     |
| `console.warn` contract        | Same text, same `[required, requiredMessageText]` dependencies                                                                            | wrapper-logic | none     |
| global side effects            | None. Renders in place; `Chip` and `FormGroup` own no globals                                                                             | wrapper-logic | none     |
| hover/pressed/checked/disabled | Every legacy state rule and the `[data-brand='codeai-next']` block ported unchanged; MUI's own state styles stay unused                   | wrapper-logic | none     |
| unforwarded HTML attributes    | Dropped: the per-option component takes none. No consumer could reach it                                                                  | drop          | none     |

## Codemod

Required. No entry's consumer change is `rewrite`, `rename` or `drop`. Every
call site edits only its import, and that edit is mechanical. The transform
is idempotent, so it can be re-run when staging gains consumers while the
PRs are open. Build it from `codemods/dialog-to-mui-dialog.ts` with the
source and the rename tables swapped.

Script: `codemods/chips-to-mui-chips.ts`, run as `yarn codemod:chips`.

Transforms:

1. `import L from '@code-dot-org/component-library/chips'` becomes
   `import {MuiChips as L} from '@code-dot-org/component-library/chips'`
   (no `as` when `L` is `MuiChips`). It merges into an existing named
   value import from the same source.
2. The named value specifier `Chips` or `default`, under any local name
   `L`, becomes `MuiChips as L`. Local bindings, JSX and identifier references
   (`find(Chips)`) are left as written.
3. The named type specifier `ChipsProps` becomes `MuiChipsProps as L`.
   `import type` and inline `type` modifiers are kept.
4. `jest.mock`, `jest.doMock`, `vi.mock` or `vi.doMock` of the entry point
   where the factory returns one object literal (a return inside a branch is
   reported): for a `default` or `Chips` key whose value is a name or a
   function, add a `MuiChips` key with the same value unless one is already
   there. Any other value is reported: a copied `jest.fn()` would be a second mock
   that records none of the first one's calls. A factory with both keys is
   reported instead: only the file's import says which value `MuiChips`
   should take.
5. Files without the source are untouched. Specifiers already on `Mui`
   names are left alone. No prop is renamed or dropped, so no call site is
   skipped.
6. Reported per file for hand work, not rewritten: enzyme string selectors
   that name `Chips` as a type (`'Chips'`, `'.x Chips'`, `'Chips[name]'`),
   also through `?.`, passed to `find`, `filter`, `closest`, `children`, `parents`,
   `exists`, `is`, `not`, `some` or `every`; namespace imports; re-exports;
   `require()` / `import()` of the entry point.
7. `.ts` files are parsed with the `ts` parser, others with `tsx`.

Expected residue:

- `apps/test/unit/templates/sectionsRefresh/SingleSectionSetUpTest.jsx:86`
  `wrapper.find('Chips')` becomes `find(Chips)`, the reference the codemod
  has already pointed at the wrapper. The display name becomes `MuiChips`,
  so the string selector would match nothing and the `toBe(0)` assertion
  would pass without testing anything.
- No consumer SCSS edit. `.gradeSelectChips label`
  (`signUpFlowStyles.module.scss:39`) and `.studentChips label`
  (`pairing.module.scss:15`) still match the chip root, a `<label>`, and
  the heading, still a `<label>`.
- No snapshot of the chips DOM exists today; re-grep at execution.
- Not residue: `.chips fieldset div` in
  `apps/src/aiDifferentiation/ai-differentiation.module.scss:338` and
  `apps/src/aiTeacherDrawer/ai-differentiation.module.scss:395` uses those
  modules' own `.chips` class, which nothing renders.

How to run (build the package first; apps resolves it to `dist/`):

```bash
cd frontend/packages/component-library
yarn build
yarn codemod:chips --dry ../../../apps/src ../../../apps/test/unit
yarn codemod:chips \
  ../../../apps/src/levelbuilder/unit-editor/UnitEditor.jsx \
  ../../../apps/src/templates/sections/SectionSignIn.jsx \
  ../../../apps/src/templates/sectionsRefresh/GradeLevelChips.jsx \
  ../../../apps/src/templates/sectionsRefresh/SingleSectionSetUp.jsx \
  ../../../apps/src/code-studio/components/pairing/StudentSelector.jsx \
  ../../../apps/test/unit/templates/sectionsRefresh/SingleSectionSetUpTest.jsx
```

## Parity

Tolerance: 0.005 mismatch ratio per story. The goal is pixel-identical.

Twins: each DSCO story gets an MUI story with the same export name, args
and template, rendering `MuiChips`. `MultipleTemplate` keeps its one shared
`values` state across groups. Title: `DesignSystem/Chips/MuiChips`; a title
nested under a leaf title already works here
(`DesignSystem/Accordion/FAQ Accordion`). Execute confirms the ids against
`index.json`.

| DSCO story id                                  | MUI story id                                            |
| ---------------------------------------------- | ------------------------------------------------------- |
| `designsystem-chips--default-chips`            | `designsystem-chips-muichips--default-chips`            |
| `designsystem-chips--disabled-chips`           | `designsystem-chips-muichips--disabled-chips`           |
| `designsystem-chips--thick-and-thin-chips`     | `designsystem-chips-muichips--thick-and-thin-chips`     |
| `designsystem-chips--group-of-colors-of-chips` | `designsystem-chips-muichips--group-of-colors-of-chips` |
| `designsystem-chips--group-of-sizes-of-chips`  | `designsystem-chips-muichips--group-of-sizes-of-chips`  |

Must be identical: all five, in Light and Dark, LTR and RTL. The DOM gains
`span.MuiChip-label`, MUI classes and two attributes, but the render must
not change. Neither fixed defect shows at the stories' 1280px width with
labels `Chip1` to `Chip5`.

Intended deviations: none in the twins. The heading stays near invisible in
Dark in both (see Deferred changes, "Group label color").

Storybook is not apps. The Storybook decorator wraps stories in
`StyledEngineProvider enableCssLayer` and `CssBaseline`, so emotion sits in
a layer and any unlayered module rule beats it. apps/ uses neither, so
emotion's runtime styles land after the bundled CSS and win ties. A module
rule of one class passes the gate and loses in apps. Every selector in
`muiChips.module.scss` that meets an MUI slot carries at least two classes;
the legacy shapes (`.chips fieldset .chip`, (0,2,1) and up) already do.

What the gate cannot see: every story is unchecked, and none hovers,
presses or focuses a chip. The checked state is seen in apps by the eyes
checkpoint "Finish Sign Up Teacher" (`sign_up.feature:25`, after the first
grade is pressed) and by the apps sample below. The rest is listed under
Story gaps.

Tests that pin the contract (Execute, in `__tests__/MuiChips.test.tsx`):

- Each input is `type="checkbox"`, `name="<name>[]"`, `value` the option
  value, inside a `<label>` carrying `MuiChip-root`.
- No element has `role="button"`, and only the inputs are in the Tab
  order; Tab moves input to input and Space toggles.
- `data-testid="chips-<name>"` and the consumer `className` are on the
  outer `div`.
- With `label`, `getByRole('group', {name: label})` finds the `fieldset`;
  without it, the `fieldset` has no `aria-labelledby`.
- `setValues` gets append order on check and the filtered array on uncheck.
- Inside a `<form>`: with `required` and nothing checked,
  `checkValidity()` is false and every input carries the message (or the
  fallback); after one chip is checked, `checkValidity()` is true;
  `FormData` holds `name[]` for each checked value.
- `console.warn` fires with the legacy text when `required` has no message.
- With `disabled`, inputs are disabled and the chip root has no
  `Mui-disabled` class.

## Legacy defects fixed while here

| Defect                                                                                                                                                                   | Fix                                                                                                                                                         | Stories changed |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| The group has no accessible name: the heading is a `<label>` with no control, inside a `fieldset` with no `legend` or `aria-labelledby`                                  | The heading gets a `useId` id and the `fieldset` gets `aria-labelledby`. The element stays a `<label>`, so consumer `label` rules and Bootstrap still apply | none            |
| `white-space: nowrap` on every chip: a chip wider than its row overflows it and scrolls the page at high zoom or on narrow screens (long student names in SectionSignIn) | `white-space: normal; overflow-wrap: anywhere` on the chip root and the label slot; MUI's `max-width: 100%` bounds the chip to its row                      | none            |

Not fixed:

- The thin chip's 1em `margin-bottom` (0.5rem thick), inherited from the
  type mixins. Every story renders it, and the pairing and sign-up pages
  cancel it with `!important`.
- The hidden checkbox's box, the heading's missing color token: see
  Deferred changes. A UI-test file depends on each.
- The unlocalized `'Please choose at least one option'` fallback. The
  package has no i18n, and the three consumers that set `required` pass a
  message; the `console.warn` stays.
- The inset outline on press, and white text on the disabled fill for a
  disabled checked chip (low contrast in Light). Both are design calls for
  the later Figma run.

## Shared globals

| Legacy global                                                            | Manager the wrapper shares                                                                                                                                     |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| None: no portal, body scroll lock, document listener or z-index constant | Nothing to share. The wrapper must not add one: `Chip` stays non-clickable (no `ButtonBase`), and no `Popover`, `Modal`, `Menu` or `FormControl` is introduced |

## Deferred changes

The wrapper keeps these legacy behaviors so the migration changes no
UI-test hook and no eyes baseline. Each row is one later PR, after lifecycle
step 4 deletes the legacy source. A PR deletes its row when it lands; the
status row becomes **Migrated** when the table is empty.
RE-221 deletes the legacy source and adds the Story gaps stories; every
row waits on it, and the After column orders the rest.

| Behavior                   | Legacy today                                                                                                                                                                                                                        | With MUI                                                                                                                                                                                                                           | UI tests at risk                                                                                                                                                                                                                                                                     | After                      | Moves DOM | Ticket |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | --------- | ------ |
| Group label color          | The heading sets no color and inherits: #333 from the page on dashboard, CssBaseline's text color in Storybook. On a Dark surface it is near black on dark (Storybook Dark: "Chips label", "Thick Chips", "Black Chips", "Chips L") | `color: var(--text-neutral-primary)`, as the theme gives every `Typography`, following `data-theme`                                                                                                                                | `sign_up.feature:25` (eyes "Finish Sign Up Teacher" captures the "What grade(s) do you teach?\*" heading)                                                                                                                                                                            |                            | yes       | RE-222 |
| Group container and legend | Plain `fieldset` named through `aria-labelledby` by a `<label>` heading; `FormGroup row` holds the chips                                                                                                                            | `FormControl component="fieldset"` + `FormLabel component="legend"`: a native group name, and `disabled`/`required`/`error` handed to children. Needs overrides for `inline-flex`/`min-width: 0` and Bootstrap 3's `legend` styles | `signUpFlowStyles.module.scss:39` `.gradeSelectChips label` and `:33`/`:47` `label` rules stop reaching the heading; `sign_up.feature:25` eyes                                                                                                                                       | Group label color          | yes       | RE-225 |
| Required error display     | Native validation: each unchecked input is `required` while none is checked; `onInvalid` sets the custom message (English fallback); the browser bubble shows on the first chip                                                     | `FormControl error` + `FormHelperText`: an inline, persistent message tied to the group by `aria-describedby`; the wrapper sets it on `invalid` and keeps native `required` so submit still blocks                                 | `apps/test/unit/templates/sectionsRefresh/SingleSectionSetUpTest.jsx:97` (stub `setCustomValidity` target)                                                                                                                                                                           | Group container and legend | yes       | RE-226 |
| Hidden input hit target    | The checkbox is `position: absolute; opacity: 0` at its static spot, at its UA size, with no positioned ancestor in the chip; it can poke out of the chip and add scroll in a positioned scroller                                   | MUI's SwitchBase input: root `position: relative`, input `inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: inherit; z-index: 1`, so the whole chip is the input's box                                           | WebDriver native clicks on `input[name='grades[]']`, whose box moves: `sign_up.feature:24`, `section_management_steps.rb:19`, `section_management_steps.rb:82`, `course_overview.feature:21`, `assessment_feedback_download.feature:32`, `teacher_dashboard_local_nav_v2.feature:23` |                            | yes       | RE-223 |

## Story gaps

These states render in no DSCO story, so they have no twin. The finish
workflow adds each as an MUI story when it deletes the legacy source.

| State                                                                  | Why                                                                                                                                                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Checked, and disabled + checked, in the default and codeai-next brands | The teal fill, the white-fixed text, the codeai-next `--background-selected-*` tokens and the disabled + checked inverse label render nowhere; a lost `:has(input:checked)` rule passes the gate |
| Focus-visible (Tab onto a chip in a play function)                     | MUI's root sets `outline: 0`; the ring comes only from the module's `:has(input:focus-visible)` rule, and a specificity slip removes it unseen                                                   |
| Hover and pressed, unchecked and checked                               | MUI's root `transition` and `background-color` sit under these rules; needs a pseudo-state tool or an interaction test                                                                           |
| A chip wider than its row (long label, narrow container)               | Shows the wrapping fix; the legacy chip overflows the row, so no DSCO twin can exist                                                                                                             |

## Follow-ups

New features, not part of the migration. They do not gate **Migrated**.

**Icons.** Neither `Chips` nor `MuiChips` can show an icon: an option is
`{value, label}`, and `MuiChipOption` puts only the input and the text in
MUI's `label` slot. The Figma chip has a start and an end icon, either or
both. The shape is open; candidates:

- `iconLeft?` and `iconRight?: FontAwesomeV6IconProps` on each option, as
  `Button` takes them, drawn inside the `<label>` beside the text. The whole
  chip stays the click target and the spacing stays in `muiChips.module.scss`.
- MUI `Chip`'s `icon` prop for the start icon. It renders outside the label
  content, so the click target and spacing need checking, and `Chip` has no
  end slot but `deleteIcon`, which belongs to `onDelete`.
- `label: ReactNode`, leaving icons to the caller. Most flexible, but no
  longer one size and color rule per chip size and state.

Needs from Figma: icon size per chip size (xs to l), and color in the checked
and disabled states. Lands after lifecycle step 4 (RE-221), so it is
built in `MuiChips` alone. Ticket: RE-224.

## Consumer chunks

Chunk size 25. One PR, stacked on the Execute PR.

| PR  | Scope                                                                                                                                       | Files | Parity sample |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------- |
| 1   | `UnitEditor.jsx`, `SectionSignIn.jsx`, `GradeLevelChips.jsx`, `SingleSectionSetUp.jsx`, `StudentSelector.jsx`, `SingleSectionSetUpTest.jsx` | 6     | 1, 2, 3       |

Per PR: `yarn build` the package, run the codemod on the six files, fix
`find('Chips')`, run jest for `SingleSectionSetUpTest`,
`UnitEditorTest`, `FinishTeacherAccountTest` and the pairing tests, run
`tools/hooks/lint.rb origin/staging <branch>`, and check the samples on the
local studio.

Apps parity sample:

1. `/teacher_dashboard/sections/12/settings`, signed in as
   `re183.teacher@example.com`: the "Grade (choose all that apply)" group
   shows the saved grade checked. Hover an unchecked grade, click "K", then
   Tab from the section name field to the first chip for the focus ring
   (SingleSectionSetUp: heading, `required`, checked, focus).
2. `/users/sign_up/finish_teacher_account`, signed out: from
   `/users/sign_up/account_type` press "Sign up as a teacher", enter a new
   email and the same password twice, press "Create my account", then click
   "K" under "What grade(s) do you teach?\*" (GradeLevelChips under
   `.gradeSelectChips` and the page's global `label`/`span` rules; the eyes
   checkpoint's state).
3. `/sections/<code>` for section 11 (picture login) on
   `re183.teacher@example.com`, signed out; the code is
   `Section.find(11).code`. Click the student's name chip (SectionSignIn:
   no heading, default size, single select through `setValues`).

## Docs

Execute:

- `@deprecated` JSDoc on legacy `Chips`, `ChipsProps` and the default
  export, naming `MuiChips` / `MuiChipsProps` and `yarn codemod:chips`.
- `src/chips/README.md`: rewrite. It still describes `Chip` and
  `ChipsGroup` and links a radio-button story. Document both APIs, the
  import lines, the form contract (real checkboxes named `<name>[]`,
  `data-testid`), `required` and the message, sizes, colors and thickness,
  and why the MUI `Chip` is never clickable.
- `codemods/README.md`: a section for the chips codemod.
- `package.json`: `"codemod:chips"`, shaped like `codemod:dialog`.
- `MIGRATION_STATUS.md`: the `chips` row becomes In Progress, "wrapper, no
  override", pointing at this plan.

Migrate (only when all six consumer files are moved):

- `MIGRATION_STATUS.md`: the `chips` row becomes Migrated, behavior
  pending, linking Deferred changes.
- `.agents/skills/design-system/SKILL.md`: add Chips to "Use MUI for", via
  `import {MuiChips} from '@code-dot-org/component-library/chips'`.
- `apps/.eslintrc.js`: a `no-restricted-imports` paths entry for
  `@code-dot-org/component-library/chips` with
  `importNames: ['Chips', 'default', 'ChipsProps']` and a message naming
  the codemod.
- `src/chips/README.md` keeps its legacy section until step 4, since those
  names still resolve.

## Risks

- Emotion precedence differs between Storybook and apps (see Parity). A
  module rule that loses to emotion only in apps passes the gate. Keep
  every rule that meets an MUI slot at two classes or more, and check the
  apps samples.
- A later global `MuiChip` theme override (the `tags` migration maps to
  `Chip` too) reaches the wrapper's chips in every property the module does
  not set. The module sets every visual property; the risk is a new
  property, such as `box-shadow`.
- Passing `onClick`, `clickable`, `onDelete` or `disabled` to `Chip` flips
  it to `ButtonBase` (`role="button"`, `tabIndex=0`, a second Tab stop per
  chip) or applies MUI's disabled opacity. The tests above pin both.
- The label slot must stay inline. As `inline-block` it would take
  signUpFlowStyles' global `span` margin and move the eyes checkpoint by
  2px.
- The theme's typography is not used, on purpose: the legacy mixins read
  `--font-size-body-*`, which the CADS brand can change.
- The `[data-brand='codeai-next']` block must be ported, or every selected
  chip under the default brand reverts to teal; no story would show it (see
  Story gaps).
- The display name changes to `MuiChips`. Enzyme string selectors on
  `'Chips'` match nothing; the codemod reports them.
- `dist/` is gitignored and can hold another branch's build. Rebuild before
  any apps or Storybook check.
- The Storybook a11y job runs axe on every story; run
  `yarn vitest --run --project=storybook src/chips` in
  `frontend/apps/design-system-storybook` before pushing.
- The sample paths assume the local seed (sections 11 and 12 on
  `re183.teacher@example.com`). Execute confirms them before capturing.

## Deviations

Execute departed from the plan as follows. None changes a twin's render.

- `__tests__/MuiChips.test.tsx` also checks `muiChips.module.scss` itself,
  parsed with `postcss` (already a devDependency) after its `//` comments are
  stripped. jsdom applies no cascade, so the DOM tests cannot see the CSS. The
  stylesheet tests pin that every rule whose subject is `.chip`, `.chipLabel`
  or `.chipsContainer` carries two classes or more (the emotion precedence
  rule in Parity and Risks), the root and label-slot cancellations, the
  `nowrap` fix, and the `codeai-next` selected rule.
- The codemod has no package-internal transform, unlike the dialog one it is
  built from: nothing inside the package imports `chips`. Its four
  transforms are the plan's 1 to 4, in that order.
- The sample seed was not confirmed: the local MySQL reader did not start
  (rbenv lacks the Ruby in `.ruby-version`). Migrate confirms sections 11
  and 12 before capturing.

## Outcome

The result of the whole stack, as it stands once the consumer PR (#76496)
lands; this branch alone carries the package side.

Consumers: all six files in the PR 1 scope moved (`UnitEditor.jsx`,
`SectionSignIn.jsx`, `GradeLevelChips.jsx`, `SingleSectionSetUp.jsx`,
`StudentSelector.jsx`, `SingleSectionSetUpTest.jsx`), in one PR stacked on
the Execute PR. None is left on the legacy names.

Verify: green. No `/apps` file imports `Chips`, `ChipsProps` or the default
export of `@code-dot-org/component-library/chips`; the ESLint rule in
`apps/.eslintrc.js` now bans them.

Parity: the five twins carry the Execute PR's Storybook gate; the sweep
changed no package source, so it was not rerun.

Apps parity: not sampled. No local studio was reachable during the run, so
the three samples above are still owed before the consumer PR leaves draft.

Codemod: rewrote the five source files, each to
`import {MuiChips as Chips} from '@code-dot-org/component-library/chips'`,
with no hand edits after. In `SingleSectionSetUpTest.jsx` it rewrites the
import and reports `find('Chips')`, which was changed by hand to
`find(Chips)`; without that, a `toBe(0)` assertion passed vacuously. Jest:
`StudentSelectorTest`, `PairingDialogTest`, `UnitEditorTest`,
`SectionSignInTest`, `FinishTeacherAccountTest` and
`SingleSectionSetUpTest`, 6 suites, 67 tests, all pass.

Queued for the finish workflow: the Story gaps stories (step 4) and the
four Deferred changes rows (step 5).
