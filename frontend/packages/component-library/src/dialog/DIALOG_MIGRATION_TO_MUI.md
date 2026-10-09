# Dialog Migration: DSCO to MUI

> Steps 1 to 4 are done. The sections before the closing notes are the plan as
> written: they still name the interim `Mui` exports, the codemod's original
> direction (legacy names to `Mui`) and the story ids of the time. The notes at
> the end record what each step changed.

## Summary

`Dialog` and `CustomDialog` move onto MUI's `Dialog` as a wrapper in
`src/dialog`, the way `notification-banner` is built. The wrapper keeps the
legacy API prop for prop, so every call site changes only its import line. It
ships as `MuiDialog` / `MuiCustomDialog` beside the untouched legacy names,
and an import-only codemod moves consumers over in four stacked PRs.

The wrapper is an MUI shell with the legacy managers plugged in. MUI supplies
the modal root, backdrop, centering container and transition. The legacy
hooks in `src/common/hooks` keep scroll lock, Escape and focus trap, and the
dialog still renders in place. Legacy and MUI dialogs coexist for the whole
staged migration, and two managers would release each other's state out of
order. MUI's own managers take over only after the last legacy dialog is
deleted, which is outside this run.

The target is what DSCO renders today, within 0.005 mismatch per story. Five
legacy defects are fixed on purpose. Figma is out of scope.

## Approach and exports

Approach: **wrapper**. Theme overrides alone cannot do this. `customContent`,
`customBottomContent`, the icon badge and the image are composition that
MUI's `Dialog` lacks. The legacy component also owns global side effects that
MUI's `Modal` would otherwise duplicate. No `styleOverrides/dialog.ts` is
added, and `muiAugmentation.ts` does not change.

Files (Execute):

| File                                                                 | Role                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `MuiCustomDialog.tsx`, `muiCustomDialog.module.scss`                 | MUI shell, legacy managers, panel, close button                           |
| `MuiDialog.tsx`, `muiDialog.module.scss`                             | Title, description, actions, icon, image; renders `MuiCustomDialog`       |
| `stories/MuiCustomDialog.story.tsx`, `stories/MuiDialog.story.tsx`   | Twins (see Parity); layout boxes from a story `.module.scss`, not `style` |
| `__tests__/MuiCustomDialog.test.tsx`, `__tests__/MuiDialog.test.tsx` | Legacy tests ported, plus the shared-global tests listed below            |
| `index.ts`                                                           | Adds the new exports; legacy lines unchanged                              |
| `CustomDialog.tsx`, `Dialog.tsx`                                     | `@deprecated` JSDoc only                                                  |

MUI parts used: `Dialog` from `@mui/material`, plus `Typography` and `Button`
as the legacy source already uses them. DSCO `CloseButton` and
`FontAwesomeV6Icon` stay. `IconButton` cannot reproduce `CloseButton`'s
25px box and 20px glyph without a new size, and `closeButton` has its own
migration still to come. `DialogTitle`, `DialogContent`, `DialogContentText`
and `DialogActions` are not used. Each ships emotion defaults (16px 24px and
20px 24px padding, a flex-end actions row, `margin-left` spacing that does not
flip in RTL, `color: text.secondary`), and every one of them would have to be
cancelled to reproduce today's render. They add no behavior the legacy API
needs: `DialogTitle` only wires its id into `aria-labelledby`, and the legacy
API uses `aria-label={title}`.

MUI `Dialog` props the wrapper sets on every render: `open`, `disablePortal`,
`container` (a childless detached element), `disableScrollLock`,
`disableEscapeKeyDown`, `disableEnforceFocus`, `transitionDuration={0}`, and
`slots.paper` (see below). It set `disableAutoFocus` and `disableRestoreFocus`
too until the focus trap moved to MUI (RE-216). `onClose` is never passed to
MUI, so a backdrop click does nothing, as today.

The panel (the `role="dialog"` element) is `slots.paper` set to a plain
`forwardRef` `div` that drops `ownerState`, `elevation` and `as`. It is not
MUI `Paper`. apps/ runs MUI without `enableCssLayer`, so emotion's runtime
styles land after the bundled CSS and win at equal specificity. `Paper` and
`DialogPaper` set `display`, `margin`, `max-height`, `max-width`, `overflow-y`,
`border-radius`, `box-shadow`, `color` and `background-color`. Consumer
`className` rules override exactly those properties (LibraryManagerDialog
`max-height`/`overflow-y`, ConfirmEnableMakerDialog `display`/`box-shadow`,
ProjectTypePicker `border-radius`). An emotion-free panel keeps today's
precedence. `overflow-y: auto` would also clip the icon badge, which sits
32px above the panel's top edge.

The two MUI-owned slots that need DSCO values get them from
`muiCustomDialog.module.scss`, at a specificity above emotion's single class.
Both selectors carry the root's `customDialogOverlay` class:

- `.customDialogOverlay:global(.MuiDialog-root)`:
  `z-index: var(--cdo-dialog-z-index, #{variables.$zindex-modal-backdrop})`.
- `.customDialogOverlay > :global(.MuiBackdrop-root)`:
  `background-color: var(--neutral-black-alpha-90)`. This is a primitive on
  purpose. `--background-neutral-alpha-90` resolves to white-alpha under
  Dark, and the legacy overlay stays black in both themes.

Exports after Execute:

| Name                                                                             | Status                           |
| -------------------------------------------------------------------------------- | -------------------------------- |
| `MuiDialog`, `MuiCustomDialog`, `MuiDialogProps`, `MuiCustomDialogProps`         | New: the MUI wrapper             |
| `Dialog`, `CustomDialog`, `default` (Dialog), `DialogProps`, `CustomDialogProps` | Legacy, unchanged, `@deprecated` |

Policy: MuiX beside the untouched legacy names, with an alias swap later. The
tooltip precedent gave the MUI version the plain name, but MUI's `Tooltip`
came from `@mui/material` and did not collide. Here both versions ship from
the same `@code-dot-org/component-library/dialog` entry. Handing the plain
names to the wrapper in Execute would flip all 49 consumers at once, with no
per-chunk review or revert. After Migrate deletes the legacy source,
`index.ts` re-exports the wrapper as `Dialog`, `CustomDialog` and `default`,
and the `Mui` names stay as aliases until consumers drop them.

## Prop map

Every prop keeps its name and value at the call site. `kind` says how the MUI
side implements the prop. `consumer` says what a call site edits.

| DSCO prop                        | MUI side                                                                                                                                                                                                      | kind          | consumer |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| `title`                          | `Typography variant="h2"` in the text section; `aria-label` on the panel                                                                                                                                      | wrapper-logic | none     |
| `description`                    | `Typography variant="body2" id="dsco-dialog-description"`                                                                                                                                                     | wrapper-logic | none     |
| `customContent`                  | Text-section child after the description                                                                                                                                                                      | wrapper-logic | none     |
| `customBottomContent`            | Panel child after the actions row                                                                                                                                                                             | wrapper-logic | none     |
| `primaryButtonProps`             | Spread on `Button variant="contained"`, color from `mode` unless overridden                                                                                                                                   | wrapper-logic | none     |
| `secondaryButtonProps`           | Spread on `Button variant="outlined"`; renders only when passed                                                                                                                                               | wrapper-logic | none     |
| `mode`                           | Button color (`primary`/`secondary` or `white`) and `CloseButton` color; nothing else, as today                                                                                                               | wrapper-logic | none     |
| `className`                      | `slotProps.paper.className`, beside the panel module classes; other `HTMLAttributes` (`id`, `style`, `title`, `data-*`, handlers) go there too                                                                | wrapper-logic | none     |
| `onClose`                        | `CloseButton` `onClick` and legacy `useEscapeKeyHandler`; MUI `onClose` left unset                                                                                                                            | wrapper-logic | none     |
| `closeLabel`                     | `CloseButton` `aria-label`, default `'Close dialog'`                                                                                                                                                          | wrapper-logic | none     |
| `icon`                           | `FontAwesomeV6Icon` badge, a direct panel child                                                                                                                                                               | wrapper-logic | none     |
| `imageUrl`                       | `<img>` above the title; new `imageAlt` supplies its alt (see defects)                                                                                                                                        | wrapper-logic | none     |
| `zIndex`                         | Root `sx={{'--cdo-dialog-z-index': zIndex}}`, read by the overlay rule                                                                                                                                        | wrapper-logic | none     |
| `aria-label` / `aria-labelledby` | `slotProps.paper`; `aria-labelledby` passed as an explicit key so MUI's generated id is not emitted                                                                                                           | wrapper-logic | none     |
| `role`                           | `slotProps.paper.role`: `MuiCustomDialog` defaults `dialog`, `MuiDialog` passes `alertdialog`                                                                                                                 | wrapper-logic | none     |
| `children` (CustomDialog)        | Panel children, before the close button                                                                                                                                                                       | direct        | none     |
| focus behavior                   | MUI's `FocusTrap` since RE-216, with `disableEnforceFocus`; the transition's `onEntered` focuses the first control that takes focus. Was legacy `useFocusTrap(panelRef)` with the three `disable*Focus` flags | wrapper-logic | none     |
| escape-to-close                  | Legacy `useEscapeKeyHandler(onClose)`; MUI `disableEscapeKeyDown`                                                                                                                                             | wrapper-logic | none     |
| body scroll lock                 | Legacy `useBodyScrollLock(true)`; MUI `disableScrollLock`                                                                                                                                                     | wrapper-logic | none     |
| missing-description warning      | Same mount-time `console.warn`, same text; the `aria-label`/`aria-labelledby` warning too                                                                                                                     | wrapper-logic | none     |
| no portal                        | `disablePortal`; `container` is a childless detached element (see Shared globals)                                                                                                                             | wrapper-logic | none     |

Panel child order is preserved (text section, actions, bottom content, icon,
close button). Consumer selectors such as `.transcriptDialog >
div:first-of-type` and `.genericDialog > i` depend on it. The module class
names keep their legacy local names (`customDialogOverlay`, `customDialog`,
`dialog`, `dialogTextSection`, `dialogContent`, `dialogActionsSection`,
`dialogIcon`), so `[class*=…]` selectors keep matching.

## Codemod

Required. No prop's consumer change is `rewrite`, `rename` or `drop`. Every
call site edits only its import, and that edit is mechanical. The transform
is idempotent, so it can be re-run when staging gains consumers while the PRs
are open.

Script: `codemods/dialog-to-mui-dialog.ts`, run with `yarn jscodeshift`.

Transforms:

1. `import L from '@code-dot-org/component-library/dialog'` becomes
   `import {MuiDialog as L} from '@code-dot-org/component-library/dialog'`
   (no `as` when `L` is `MuiDialog`). It merges into an existing named import
   from the same source.
2. The named value specifiers `Dialog` and `CustomDialog`, under any local
   name `L`, become `MuiDialog as L` and `MuiCustomDialog as L`. Local
   bindings, JSX and identifier references (`find(Dialog)`,
   `useModal ? Modal : Dialog`) are left as written.
3. The named type specifiers `DialogProps` and `CustomDialogProps` become
   `MuiDialogProps as L` and `MuiCustomDialogProps as L`. `import type` and
   inline `type` modifiers are kept.
4. Package-internal default imports: `@/dialog/CustomDialog` becomes
   `@/dialog/MuiCustomDialog` (Modal.tsx), and `@/dialog/Dialog` becomes
   `@/dialog/MuiDialog`.
5. `jest.mock('@code-dot-org/component-library/dialog', factory)` where the
   factory returns an object literal: for each `default`, `Dialog` or
   `CustomDialog` key, add a `MuiDialog` or `MuiCustomDialog` key with the
   same value unless one is already there.
6. Files without either source are untouched. Specifiers that already use
   `Mui` names are left alone. No prop is dropped, so no call site is
   skipped.
7. Reported per file for hand work, not rewritten: enzyme string selectors
   `find('Dialog')` / `find('CustomDialog')`, and `jest.mock` factories of any
   other shape.

Expected residue:

- `find('Dialog')` in `apps/test/unit/levelbuilder/AllVocabulariesEditorTest.js:45`
  and `apps/test/unit/levelbuilder/lesson-editor/VocabulariesEditorTest.js:43`
  becomes `find('MuiDialog')`. Left alone, those assertions pass without
  testing anything.
- Snapshot updates for any test that snapshots the dialog DOM. The MUI root,
  backdrop, container and two focus sentinels appear in the tree. No such
  snapshot exists today; re-grep at execution.
- The icon fix makes two workarounds redundant: ConfirmRemoveStudentDialog's
  icon `style: {display: 'flex'}` and GenericDialog's `> i {display: flex}`.
  Removing them is optional and not needed for parity.
- No SCSS specificity residue is expected. The panel has no emotion styles,
  so consumer `className` rules keep today's precedence. Only SCSS that
  reached the legacy overlay by structure would break, and there is none
  (grep `customDialogOverlay`).
- Pre-existing consumer bugs stay as they are and are not residue:
  LoginTypePicker passes `primaryButtonProps.text`, and
  SectionAvatarEditDialog's `title` reaches the panel as a native tooltip.

How to run (build the package first; apps resolves it to `dist/`):

```bash
cd frontend/packages/component-library
yarn build
TS_NODE_TRANSPILE_ONLY=true yarn jscodeshift -t ./codemods/dialog-to-mui-dialog.ts \
  --parser=tsx --extensions=js,jsx,ts,tsx --require ts-node/register \
  ../../../apps/src/templates ../../../apps/test/unit/templates src/modal/Modal.tsx
```

## Parity

Tolerance: 0.005 mismatch ratio per story. The goal is pixel-identical.

Twins: each DSCO story gets an MUI story with the same export name, args,
template and DSCO `Button` launcher. The launcher shows through the 90%
backdrop, so a different launcher would itself cause a diff. The gate opens
the first launcher and compares the pair.

| DSCO story id                                                         | MUI story id                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `designsystem-dialog-customdialog--default-custom-dialog`             | `designsystem-dialog-muicustomdialog--default-custom-dialog`             |
| `designsystem-dialog-customdialog--dark-mode-custom-dialog`           | `designsystem-dialog-muicustomdialog--dark-mode-custom-dialog`           |
| `designsystem-dialog-customdialog--custom-dialog-with-custom-content` | `designsystem-dialog-muicustomdialog--custom-dialog-with-custom-content` |
| `designsystem-dialog-customdialog--multiple-custom-dialog`            | `designsystem-dialog-muicustomdialog--multiple-custom-dialog`            |
| `designsystem-dialog-dialog--default-dialog`                          | `designsystem-dialog-muidialog--default-dialog`                          |
| `designsystem-dialog-dialog--dialog-with-icon`                        | `designsystem-dialog-muidialog--dialog-with-icon`                        |
| `designsystem-dialog-dialog--dialog-with-image`                       | `designsystem-dialog-muidialog--dialog-with-image`                       |
| `designsystem-dialog-dialog--dialog-without-close-button`             | `designsystem-dialog-muidialog--dialog-without-close-button`             |
| `designsystem-dialog-dialog--dialog-with-secondary-button`            | `designsystem-dialog-muidialog--dialog-with-secondary-button`            |
| `designsystem-dialog-dialog--dialog-with-long-text`                   | `designsystem-dialog-muidialog--dialog-with-long-text`                   |
| `designsystem-dialog-dialog--dialog-with-custom-content`              | `designsystem-dialog-muidialog--dialog-with-custom-content`              |
| `designsystem-dialog-dialog--dialog-with-custom-bottom-content`       | `designsystem-dialog-muidialog--dialog-with-custom-bottom-content`       |
| `designsystem-dialog-dialog--multiple-dialogs`                        | `designsystem-dialog-muidialog--multiple-dialogs`                        |

Titles: `DesignSystem/Dialog/MuiCustomDialog` and `DesignSystem/Dialog/MuiDialog`.
Execute confirms the ids against `index.json`.

Must be identical: the eleven twins not listed below. The DOM differs (MUI
root, backdrop, container, sentinels), but the render must not. The MUI
container centers the panel in a row flex where the legacy overlay used a
column flex. Both give the same box for every story. `transitionDuration={0}`
still leaves one frame at opacity 0, so the gate captures after the
transition reaches `entered`.

Intended deviations:

- `dialog-with-icon`: the badge's centering rule now outranks Font Awesome's
  `display`. The render changes only if the legacy capture shows the glyph
  off center.
- `dialog-with-image`: the image is `object-fit: contain` and its alt
  defaults to empty. The render changes if the story image's aspect ratio is
  not 260:138, or if the image fails to load.

Storybook is not apps. The Storybook decorator wraps stories in
`StyledEngineProvider enableCssLayer` and `CssBaseline`. apps/ uses neither,
so emotion beats module CSS there by load order. Twins passing does not prove
apps parity. The apps parity sample below checks it, one surface per chunk.

Modal chunk: the nine `designsystem-modal--*` stories are captured before and
after that PR, at the same tolerance.

## Legacy defects fixed while here

| Defect                                                                             | Fix                                                                                                                           | Stories changed     |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `imageUrl` image fixed at 16.25rem × 8.625rem, no `object-fit`, never scales down  | `width: 16.25rem; max-width: 100%; aspect-ratio: 260 / 138; height: auto; object-fit: contain`                                | `dialog-with-image` |
| `.dialog` `min-width: 39.375rem` clips narrow viewports and high zoom              | `min-width: min(39.375rem, 100%)`, `max-width: min(50rem, 100%)`; unchanged at 50rem and wider                                | none                |
| Image alt is the literal, unlocalized `"Dialog"`                                   | New optional `imageAlt` (as on `Modal`); defaults to `''`, which marks the image decorative. `imageUrl` has no apps consumers | `dialog-with-image` |
| `zIndex={0}` is dropped by a truthiness check, and the overlay falls back to 1040  | The wrapper checks for `undefined`. Legacy `CustomDialog` keeps its check until it is deleted; no consumer passes 0           | none                |
| `.dialogIcon` loses `display: flex` to Font Awesome's `display` (TODO in the SCSS) | `.dialog > .dialogIcon`, specificity (0,2,0); the inline `display` workaround is no longer needed                             | `dialog-with-icon`  |

Not fixed:

- `mode` never styles the panel. Behavior is kept as is: its dead
  `dialog-${mode}` / `customDialog-${mode}` lookups are not carried over, and
  the JSDoc names its two real effects. Making `mode` restyle the panel would
  change five consumers' renders.
- Initial focus goes to the first focusable element in DOM order. The legacy
  focus trap is shared, so changing it here would split behavior between
  `Modal` and the wrapper. This is deferred to the MUI-managers change.

## Shared globals

| Legacy global                                       | Manager the wrapper shares                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Body scroll lock (refcounted `useBodyScrollLock`)   | The wrapper calls the same `useBodyScrollLock(true)`, and MUI gets `disableScrollLock`. MUI's lock would also add `padding-right`, and it keeps its own snapshot outside the legacy refcount.                                                                                                                                                                                                                                                                   |
| Escape (one document `keydown` per open instance)   | The wrapper calls the same `useEscapeKeyHandler(onClose)`, and MUI gets `disableEscapeKeyDown`. Without that flag, MUI's root handler calls `stopPropagation()` on Escape for the top modal, and the document listener never fires. Escape still closes every open dialog, as today.                                                                                                                                                                            |
| Focus trap (`useFocusTrap`, own document `keydown`) | Handed to MUI in RE-216, and `useFocusTrap` is deleted; enforcement stays off, see Deferred changes. Before that, the wrapper called the same `useFocusTrap(panelRef)` and passed MUI `disableAutoFocus`, `disableEnforceFocus` and `disableRestoreFocus`.                                                                                                                                                                                                      |
| No portal (in place, `position: fixed`)             | `disablePortal`. Ancestor `data-theme` (Lab2's `ThemeProvider`, PixelEditorModal and ImageDetailsDialog hosts), ancestor selectors (`.dialogHost .modal`), inherited text styles and stacking context stay as today. `container` is a module-scoped detached `div`: MUI's `ModalManager` aria-hides the container's other children, and the default container, `document.body`, would hide the app root holding the in-place dialog. Legacy aria-hides nothing. |
| z-index (`$zindex-modal-backdrop`, 1040)            | The overlay rule reads the same SCSS variable, not MUI's `zIndex.modal` (1300). The `zIndex` prop overrides it through `--cdo-dialog-z-index`, with no inline style. MUI popovers (1300) and tooltips (1500) opened from a dialog still render above it.                                                                                                                                                                                                        |
| Hardcoded `id="dsco-dialog-description"`            | Same id and the same `aria-describedby`. The duplicate id when two dialogs are open remains.                                                                                                                                                                                                                                                                                                                                                                    |

Tests that pin these (Execute, in `__tests__`):

- Legacy `CustomDialog` and `MuiCustomDialog` open together and unmount in
  either order; `body.style.overflow` is restored only after the last one.
- Escape with both open calls both `onClose` handlers.
- While a wrapper dialog is open, no element in the document carries
  `aria-hidden="true"` except the backdrop.
- The `role="dialog"` element is a descendant of the render container.
- Focus moves to the first focusable element on mount and returns to the
  opener on unmount.
- The panel has no `aria-labelledby` unless one is passed.
- `className`, `id`, `style` and `data-theme` land on the `role="dialog"`
  element.
- `zIndex` sets `--cdo-dialog-z-index` on the root.

## Deferred changes

The wrapper keeps these legacy behaviors so the migration changes no UI-test
hook. Each row is one later PR that hands the behavior to MUI, after
RE-215 deletes the legacy source (lifecycle step 4). RE-216 goes before
RE-217, and both before RE-219. A PR deletes its row when it lands; the
status row becomes **Migrated** when the table is empty. PR #75436 (closed)
implements every row and is the reference.

| Behavior                 | Legacy, kept here                                                                                            | With MUI                                                                                                                                                                                                                                                                                             | UI tests at risk                                                                                                                                                                                               | Ticket            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Focus enforcement        | `disableEnforceFocus`: focus may leave the dialog for an overlay MUI does not track, as with the legacy hook | Focus is pulled back into the top dialog MUI tracks. Move these to MUI or close the dialog first: `LibraryManagerDialog`'s `BaseDialog`, the AI Teaching Assistant and teacher homepage persistent drawers, the legacy rubric panel, and the video and instructions dialogs over `SignInOrAgeDialog` | Tests that type into one of those overlays while a dialog is mounted                                                                                                                                           | —                 |
| Escape                   | `useEscapeKeyHandler`: a document listener; Escape closes every open dialog                                  | Closes only the top dialog, and only with focus inside it                                                                                                                                                                                                                                            | Tests that press Escape with focus outside the dialog                                                                                                                                                          | RE-217            |
| Scroll lock              | Reference-counted `useBodyScrollLock`; MUI `Menu` and `Popover` take their own lock                          | One lock, which also pads `body` by the scrollbar width                                                                                                                                                                                                                                              | Eyes screenshots that show a scrollbar                                                                                                                                                                         | RE-218            |
| Portal and `aria-hidden` | In place; the detached `container` keeps `ModalManager` from aria-hiding the page                            | On `document.body`; the rest of the page is aria-hidden; `data-theme` must be copied onto the panel                                                                                                                                                                                                  | `e2e-tests/tests/pages/legacy-blockly-lab.ts:96`, `callouts.spec.ts:118`; `callouts.feature:71` if the overlay class leaves the root; Playwright role queries behind the dialog. Needs eyes and the test build | RE-219            |
| Panel                    | A plain `div` in the paper slot                                                                              | MUI `Paper` with a theme override                                                                                                                                                                                                                                                                    | Consumer class rules that beat emotion today                                                                                                                                                                   | RE-220 (optional) |

## Consumer chunks

Chunk size 25. Stacked on the Execute PR, in this order.

| PR  | Scope                                                                                                                                                        | Files | Parity sample                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ----------------------------- |
| 1   | `apps/src/templates/**` (15), plus `AddSectionDialogTest`, `CoteacherSettingsTest`, `RemoveCoteacherDialogTest`                                              | 18    | ConfirmRemoveStudentDialog    |
| 2   | `apps/src/code-studio/**` (11), `levelbuilder/`, `maker/`, `storage/`, plus `ConfirmDeleteButtonTest`, `AllVocabulariesEditorTest`, `VocabulariesEditorTest` | 17    | LibraryManagerDialog          |
| 3   | `apps/src/lab2/`, `p5lab/`, `pythonlab/`, `scrapbook/`, `craft/`, `pixelEditor/`                                                                             | 13    | ProjectTypePicker             |
| 4   | `frontend/packages/component-library/src/modal/Modal.tsx`, which moves all 40 `Modal` call sites onto the MUI shell                                          | 1     | DeleteAccountDialog (`Modal`) |

Modal goes last and alone because it has the widest blast radius, and it can
be reverted without touching PRs 1 to 3. Per PR: `yarn build` the package,
run the codemod on the scope, fix the residue, run jest for the touched tests,
run `tools/hooks/lint.rb origin/staging <branch>`, and check the chunk's
parity sample on the local studio.

Apps parity sample:

1. `/teacher_dashboard/sections/12/manage_students`, signed in as
   `re183.teacher@example.com`: open a student row's Actions menu and choose
   "Remove student" (Dialog with icon badge, custom content, error primary).
2. `/projects/applab/new`, same account: open the Settings (gear) menu in the
   workspace header and choose "Manage Libraries" (CustomDialog with
   `className` `max-height`/`overflow-y` and an inline `width`).
3. `/projects/pythonlab/new`, same account: the project-type dialog opens on
   load; reopen it with the project-type button in the workspace header
   (CustomDialog under Lab2's `data-theme`, `mode` from the theme).
4. `/users/edit`, same account: click "Delete Account" (`Modal` over
   `CustomDialog`; a teacher whose students lack personal logins sees the
   personal-login `Modal` first, which is equally valid).

## Docs

Execute:

- `@deprecated` JSDoc on legacy `Dialog`, `CustomDialog`, `DialogProps` and
  `CustomDialogProps`, naming the `Mui` replacement and the codemod.
- `src/dialog/README.md`: document both APIs, the import lines, in-place
  rendering, the shared hooks, `imageAlt`, and `zIndex` via the custom
  property.
- `codemods/README.md`: add a section for the dialog codemod.
- `MIGRATION_STATUS.md`: the `dialog` row becomes In Progress, pointing at
  this plan. The `closeButton` row notes that `MuiCustomDialog` is an
  internal consumer.

Migrate (only when all 49 consumers are moved):

- `MIGRATION_STATUS.md`: the `dialog` row becomes Migrated. The `modal` row
  notes that it is built on `MuiCustomDialog`.
- `.agents/skills/design-system/SKILL.md`: move Dialog from "Use DSCO for" to
  "Use MUI for", via `MuiDialog` / `MuiCustomDialog`.
- `apps/.eslintrc.js`: add a `no-restricted-imports` paths entry for
  `@code-dot-org/component-library/dialog` with
  `importNames: ['default', 'Dialog', 'CustomDialog', 'DialogProps', 'CustomDialogProps']`
  and a message naming the codemod.
- `src/dialog/README.md`: drop the legacy section.

Later, not this run: delete the legacy source and swap the aliases
(RE-215), then remove the `disable*` flags and the detached `container` one
behavior at a time; see Deferred changes.

## Risks

- Storybook and apps resolve CSS precedence differently (see Parity). A rule
  that loses to emotion only in apps passes the gate. Keep emotion off the
  panel, keep the (0,2,0) slot selectors, and check the apps sample for every
  chunk.
- MUI passes `ownerState`, `elevation` and `as` (`Paper`) to `slots.paper`.
  If the panel component does not drop them, React warns, and `as` renders
  as an invalid attribute.
- `disableEscapeKeyDown` and the detached `container` are both
  load-bearing. Without the first, Escape never reaches the legacy listener.
  Without the second, the in-place dialog is aria-hidden along with the app
  root, and role queries in RTL, Playwright and screen readers stop seeing
  it.
- MUI `Menu`, `Popover` and `Drawer` opened inside a dialog still take MUI's
  own body scroll lock. That lock interleaves with the legacy refcount today
  and is not changed here.
- UI tests keep working only because the DOM hooks are reproduced:
  `[role='dialog']`, `[role='alertdialog']` (eyes3.feature), the
  `[role="dialog"] button[aria-label="Close"]` close step, `h2`/`h3` headings,
  and `[class*=customDialogOverlay]` read for its z-index (callouts.feature,
  a `Modal` surface, which is PR 4). The marker class must stay on the MUI
  root, the element that has the z-index.
- PR 4 changes the DOM under 40 `Modal` call sites at once. Its gate is the
  nine Modal stories plus sample 4.
- `dist/` is gitignored and can hold another branch's build. Rebuild before
  any apps or Storybook check.
- The sample paths assume the local seed described (section 12 with students
  on `re183.teacher@example.com`). Execute confirms them before capturing.

## Deviations

Execute departed from the plan as follows. None changes a twin's render.

- `.dialog` sets `box-sizing: border-box`, which the plan did not list. The
  `min(…, 100%)` limits assume it: under `content-box` the 7rem of padding and
  the border sit outside `100%`, and the panel still overflows a narrow
  viewport. Storybook's `CssBaseline` and dashboard's Bootstrap reset
  (`css/code-studio`) already resolve `border-box`; every legacy panel in
  Storybook measured `border-box`. Only a host without either reset sees the
  panel's width limits include padding and border.
- `muiDialog.module.scss` leaves `position`, `background-color` and `border`
  out of `.dialog`. Legacy sets the same three values in both `.dialog` and
  `.customDialog`, on the same element, from two sheets. Keeping them only in
  `.customDialog` leaves no property set twice across the package's sheets,
  so load order between them decides nothing. Consumer `className` rules
  still meet one (0,1,0) rule, as before.
- The detached `container` is created on first use by a module-scoped getter,
  passed to MUI as a function, rather than at module load. Importing the
  entry point where there is no `document` (SSR, node tests) does not throw.
- `MuiDialog` does not pass `mode` to `MuiCustomDialog`, because legacy
  `Dialog` does not pass it to `CustomDialog`. The prop map's "CloseButton
  color" effect belongs to `MuiCustomDialog` alone; `MuiDialog`'s close button
  is the dark X in both modes, as today.
- Codemod transform 4 also renames named `DialogProps` / `CustomDialogProps`
  specifiers of the two internal paths. Rewriting only the path would leave a
  named import the new module does not export. No such specifier exists today.
- The codemod reports more than the plan lists, and rewrites nothing more:
  enzyme string selectors for every wrapper method that takes a selector
  (`find`, `filter`, `closest`, `children`, `parents`, `exists`, `is`, `not`,
  `some`, `every`), in every file processed, since a test reaches the dialog
  through the component it renders; `jest.mock` keys written as methods;
  namespace imports; re-exports; and `require()` / `import()` of the entry
  point. The enzyme report is conditional: `legacySharedComponents/Dialog`
  has the same display name, and the test file imports neither.
- The codemod parses `.ts` files with the `ts` parser, whatever `--parser`
  says. `tsx` rejects `<T>x` casts, and jscodeshift skips a file that fails
  to parse and moves on.
- The codemod has no `package.json` script. It runs through
  `yarn jscodeshift`, not `npx`, per `frontend/AGENTS.md`.
- The CSS-only fixes are verified in Storybook, not in Vitest. The
  `DialogInNarrowViewport` story opens the dialog at 320px, and its play
  function asserts that the panel stays inside the viewport; with the legacy
  minimum width the panel starts at x = −155. The image, icon badge and
  overlay rules show in the twinned stories under eyes. No DSCO story twins
  `DialogInNarrowViewport`, since the legacy panel overflows there.
- Observed, not planned: a click outside the panel focuses the MUI container
  (`tabIndex=-1`, `outline: 0`, so no ring shows) where legacy left focus on
  `body`. The next Tab reaches the same button in both. Escape and close
  restore focus to the opener in both.

Parity measured on the Storybook build at 1280×720 (`dist/`, served on
localhost), per-pixel RGB difference above 30: all thirteen twins at 0.00000
in LTR, RTL, Dark and RTL with Dark, except `dialog-with-image` at about
0.001. The story's remote image did not load in the capture environment, and
the difference is the broken-image alt text, `"Dialog"` against `''`. With a
square image routed in, the legacy image stretches to 260×138 and the MUI one
letterboxes in the same box. At 420px wide the legacy panel stays 630px and
starts at x = −105; the MUI panel is 420px at x = 0.

## Outcome

This section records the whole stack: this PR and the consumer PRs #75564 to
#75566. On this PR alone no consumer has moved, and the status row reads In
Progress.

Consumers: all 49 moved, none left on the legacy names. That is 48 `/apps`
files (42 sources, 6 tests) and `Modal.tsx`. After the sweep no file in
`apps/` or `frontend/` imports `Dialog`, `CustomDialog`, the default export,
`DialogProps` or `CustomDialogProps` from the entry point, and no file in the
package imports `@/dialog/Dialog` or `@/dialog/CustomDialog`. The legacy
sources and exports still ship, `@deprecated`, until the later step deletes
them. `src/dialog/README.md` keeps its legacy section until then, because
those names still resolve.

The chunks ran in a different order from the table above. Modal went first,
on its own. The apps files were then split into two chunks by path order,
not by the scopes in the table:

| PR  | Scope                                                                                                   | Files |
| --- | ------------------------------------------------------------------------------------------------------- | ----- |
| 1   | `Modal.tsx`, `Modal.test.tsx`, `modal.module.scss`, the e2e `legacy-blockly-lab.ts` page object         | 4     |
| 2   | `code-studio/`, `craft/`, `lab2/`, `levelbuilder/`, `maker/`, `p5lab/`, `pixelEditor/`, and their tests | 25    |
| 3   | `pythonlab/`, `scrapbook/`, `storage/`, `templates/`, and their tests                                   | 23    |

Codemod: it rewrote 49 files, the 48 `apps/` files and `Modal.tsx`.
`AddSectionDialogTest`'s `jest.mock` factory gained its `MuiDialog` key from
transform 5. Twenty-four test files were swept with their sources but
import nothing from the entry point, so the codemod left them alone and they
needed no edit. A dry run over all 75 swept script files after the
sweep reports 75 unmodified and 0 to rewrite, so the tree is at the
codemod's fixed point.

Hand residue, as predicted plus two items:

- `find('Dialog')` in `AllVocabulariesEditorTest` and `VocabulariesEditorTest`
  became `find(Dialog)`, the component reference, which the codemod had
  already renamed to the wrapper. It is not `find('MuiDialog')` as the plan
  said. The reference survives any display-name change.
- ConfirmRemoveStudentDialog lost its icon `style: {display: 'flex'}`
  workaround. GenericDialog's `> i {display: flex}` stays. It is redundant
  but harmless.
- Not predicted: `modal.module.scss` gains `:where(.modal) {max-height:
100%}`. The MUI container centers in a row flex, and a tall `Modal` no
  longer shrank to the viewport the way the legacy column flex made it.
  `:where` keeps any consumer `max-height` winning.
- Not predicted: the e2e page object `legacy-blockly-lab.ts` located the Show
  Code overlay by `[role="presentation"]`. The MUI container carries that
  role too, so the locator now matches `.MuiDialog-root`, the element that
  carries the z-index.
- `Modal.test.tsx` gained the shared-global tests for the Modal chunk:
  in-place render, nothing aria-hidden but the backdrop, attributes on the
  panel, Escape, focus on mount and restore on unmount.
- No snapshot needed updating. No consumer SCSS needed a specificity fix.

Verify: green. Jest over the 30 listed `apps/` test files passes, 30 suites
and 331 tests. Vitest over `src/modal` and `src/dialog` passes, 6 files and
85 tests.

Parity, Storybook: the gate captured the thirteen twins in Light and Dark,
LTR and RTL. All 52 captures came out at 0 mismatched pixels, against a
tolerance of 0.005. The measurements recorded under Deviations still hold.

Parity, apps and Modal stories: this run recorded no result for the four
apps samples or the nine `designsystem-modal--*` stories. Treat them as
unverified. They must be checked on the local studio before the stacked
PRs merge, and the Modal PR (sample 4 and the Modal stories) comes first,
because its blast radius is the widest.

Docs, on the last consumer PR: `MIGRATION_STATUS.md` marks `dialog` as
Migrated, behavior pending; until that PR lands the row reads In Progress. The skill lists
Dialog under "Use MUI" and gives the wrapper's import. `apps/.eslintrc.js`
bans the five legacy names at `@code-dot-org/component-library/dialog`
through `importNames`, because the `Mui` names ship at the same path.

Legacy source deleted (RE-215, lifecycle step 4): the DSCO `Dialog.tsx`,
`CustomDialog.tsx`, their module sheets, tests and stories are gone, and the
wrapper files took their names (`MuiDialog.tsx` is now `Dialog.tsx`,
`muiCustomDialog.module.scss` is now `customDialog.module.scss`, and the same
for the tests and stories). `index.ts` exports `Dialog`, `CustomDialog`,
`DialogProps`, `CustomDialogProps` and `default` (`Dialog`), and nothing else.
The plan kept the `Mui` names as aliases until consumers dropped them. They
dropped them in the same change, so the aliases went too; `default` stays, as
the policy says. The codemod now moves `Mui` names to the plain ones. One run
over the tracked `apps/` and `frontend/` files rewrote 49 files, the 48 `apps/`
consumers and AI Lab's `TrainingModal.tsx`, and a second run rewrote none.
`Modal.tsx` imports by file path and followed the rename by hand, as did AI
Lab's `ResultsModal.tsx`, which reached staging after the run.
`PixelEditorModal.tsx` needed the parentheses recast added around two JSX
branches removed by hand, and `eslint --fix` joined `SignInOrAgeDialog.js`'s
shortened import onto one line. `apps/.eslintrc.js` no longer restricts imports
from the entry point. Behavior is unchanged: the `disable*` flags, the detached
`container`, the paper slot and the DSCO hooks are as they were. The story ids
are the legacy ones again (`designsystem-dialog-dialog--*`,
`designsystem-dialog-customdialog--*`). The generated class names did not change
(`_customDialogOverlay_1gbhd_1` before and after). The tests that opened a
legacy dialog beside the wrapper now open two wrappers, and
`DialogInNarrowViewport` moves with its stories to `stories/Dialog.story.tsx`.

Focus trap handed to MUI (RE-216): `CustomDialog` drops `disableAutoFocus`,
`disableRestoreFocus` and `useFocusTrap`, which is deleted. MUI's `FocusTrap`
focuses its container on open, wraps Tab and Shift+Tab through its sentinels,
and restores focus to the opener. `disableEnforceFocus` stays: with enforcement
on, MUI pulls focus back from any overlay it does not track, and several open
over a mounted dialog (see the Focus enforcement row). The transition's
`onEntered` then moves focus to the first control that takes focus, a tick later
than the hook did, unless focus is already in the panel; with nothing focusable
it stays on the container.
