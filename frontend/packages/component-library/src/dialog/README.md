# `componentLibrary/dialog`

## Which one to use

| Component                                  | Built on                                                     | Notes                                     |
| ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------- |
| [`MuiDialog`](./MuiDialog.tsx)             | MUI `Dialog` + `DialogTitle`/`DialogContent`/`DialogActions` | Use this for new code.                    |
| [`MuiCustomDialog`](./MuiCustomDialog.tsx) | MUI `Dialog` + `IconButton`                                  | Bare panel; use when the layout is yours. |
| [`Dialog`](./Dialog.tsx)                   | our own SCSS, hooks and `CloseButton`                        | Legacy. Deprecated; do not add callers.   |
| [`CustomDialog`](./CustomDialog.tsx)       | our own SCSS, hooks and `CloseButton`                        | Legacy. Deprecated; do not add callers.   |

The MUI pair takes the same props as the legacy pair, so a call site moves by
changing the import name:

```tsx
import {
  MuiDialog,
  MuiCustomDialog,
  DIALOG_DESCRIPTION_ID,
} from '@code-dot-org/component-library/dialog';

const ConfirmDelete = ({onConfirm, onClose}) => (
  <MuiDialog
    title="Delete this project?"
    description="This cannot be undone."
    primaryButtonProps={{children: 'Delete', onClick: onConfirm}}
    secondaryButtonProps={{children: 'Cancel', onClick: onClose}}
    onClose={onClose}
  />
);

const Picker = ({onClose}) => (
  <MuiCustomDialog aria-label="Pick a sprite" onClose={onClose}>
    <p id={DIALOG_DESCRIPTION_ID}>Choose one of the sprites below.</p>
    {sprites}
  </MuiCustomDialog>
);
```

The surface comes from the `MuiDialog` entry in
[`styleOverrides/dialog.ts`](../themes/code.org/styleOverrides/dialog.ts) (on
`CdoTheme`): a flat `--background-neutral-primary` panel with a
`--borders-neutral-primary` hairline, no radius or shadow, on a
`--neutral-black-alpha-90` backdrop at z-index 1040, with no open or close
transition and no breakpoint cap on the width. That override is **global**: a
bare `Dialog` from `@mui/material` gets the same surface. Today that is one
component, `FormDialog` in `frontend/packages/users` (the account-settings
modals), which moves from MUI's white elevated paper to this flat panel the
next time that package rebuilds. `MuiDialog` adds the 0.5rem radius, the drop
shadow and the standard layout on top.

Both dialogs are open while mounted; there is no `open` prop. Render them
conditionally, as every consumer does today. `Dialog` and `CustomDialog` from
`@mui/material` are unrelated to the wrapper names here; alias them if a file
needs both.

## Prop mapping

Legacy props are accepted as they are. This is where each one lands on MUI, for
anyone reading the wrapper or moving to bare MUI later.

| Legacy prop                                                       | On MUI                                                                                    | Notes                                                                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `children` (CustomDialog)                                         | `Dialog` children                                                                         | Rendered inside Paper, nothing around them.                                                                                                 |
| `onClose`                                                         | `Dialog onClose` + a rendered close `IconButton`                                          | MUI reports `backdropClick`; the wrapper ignores it, so clicking outside never closes. No `onClose` means no X and `disableEscapeKeyDown`.  |
| `closeLabel` (default `Close dialog`)                             | `aria-label` on the close `IconButton`                                                    | UI tests select the X by this name.                                                                                                         |
| `mode` (`light` \| `dark`)                                        | Close X color; `Button color="white"` for both actions (Dialog)                           | Never changed the panel surface in the legacy version either. For a dark panel pass `data-theme="Dark"`.                                    |
| `className`                                                       | `slotProps.paper.className`                                                               | Lands on Paper, the box consumers size and lay out.                                                                                         |
| `zIndex`                                                          | `sx={{zIndex}}` on the Dialog root                                                        | Default is the theme's 1040.                                                                                                                |
| other HTML attributes (`role`, `aria-*`, `id`, `style`, `data-*`) | `slotProps.paper`                                                                         | The Paper is the `role="dialog"` element. `data-theme` is typed on the paper slot.                                                          |
| `aria-label` / `aria-labelledby` (CustomDialog)                   | `slotProps.paper`                                                                         | MUI would otherwise emit an `aria-labelledby` id that points nowhere; the wrapper drops it. The missing-name `console.warn` stays.          |
| `aria-describedby`                                                | `slotProps.paper['aria-describedby']`, default `dsco-dialog-description`                  | The literal id stays part of the contract (`DIALOG_DESCRIPTION_ID`); the missing-element `console.warn` stays.                              |
| mounted == open                                                   | `open` always `true`                                                                      | `transitionDuration: 0` from the theme, so unmount removes the DOM at once.                                                                 |
| focus trap (first control focused, restored on unmount)           | MUI `FocusTrap`, plus `slotProps.transition.onEntered` moving focus to the first control  | MUI alone focuses the container.                                                                                                            |
| Escape closes                                                     | `Dialog onClose` with reason `escapeKeyDown`                                              | MUI listens on the dialog root, not `document`; tests fire `keyDown` on the dialog.                                                         |
| body scroll lock                                                  | the legacy `useBodyScrollLock`; MUI's `disableScrollLock` is set                          | One reference-counted lock across legacy and MUI dialogs, so overlapping dialogs release the body only once both are gone.                  |
| overlay                                                           | theme `MuiDialog` root + `backdrop`                                                       |                                                                                                                                             |
| panel surface                                                     | theme `MuiDialog` paper                                                                   | `MuiDialog` re-adds the radius and shadow in its own class.                                                                                 |
| `title` (Dialog)                                                  | `DialogTitle` with `variant="h2"`, id linked through `aria-labelledby`                    | The h2 renders even with no title. A consumer `aria-label` still wins.                                                                      |
| `description` (Dialog)                                            | `Typography variant="body2"` with `id="dsco-dialog-description"` inside `DialogContent`   | `DialogContentText` was not used: it forces `text.secondary`, a color the legacy dialog never had.                                          |
| `customContent` (Dialog)                                          | `DialogContent` children after the description                                            | Keeps its own text alignment; only the heading and description are centered.                                                                |
| `customBottomContent` (Dialog)                                    | node after `DialogActions`                                                                |                                                                                                                                             |
| `primaryButtonProps` / `secondaryButtonProps`                     | `Button variant="contained"` / `variant="outlined"` inside `DialogActions disableSpacing` | Secondary renders first. Props spread as before.                                                                                            |
| `icon` (Dialog)                                                   | `FontAwesomeV6Icon` in the 64px teal badge over the top edge                              | The badge selector now beats Font Awesome's `display` rule, so the `style={{display: 'flex'}}` workaround is not needed on the MUI version. |
| `imageUrl` (Dialog)                                               | `<img alt="Dialog">` at 16.25rem × 8.625rem above the title                               | Alt text defaults to the literal `Dialog`, as before; the new `imageAlt` prop replaces it, `""` for a decorative image.                     |
| `role="alertdialog"` (Dialog) / `role="dialog"` (CustomDialog)    | `slotProps.paper.role`                                                                    | UI tests depend on `alertdialog` for Dialog.                                                                                                |

## What changes for consumers

- **The dialog renders in a portal on `document.body`**, not in place. It no
  longer inherits an ancestor's CSS: `[data-theme='Dark']` token resolution,
  `text-align`, fonts, or selectors like `.somePage .dialog`. The wrapper
  forwards `data-theme` to the panel and, when none is given, uses the theme
  of the enclosing DSCO `ThemeProvider` (Lab2 has one). Pass `data-theme`
  explicitly where a page sets the attribute on a div instead.
- **Focus lands on the first control after a tick**, via `onEntered`, rather
  than synchronously on mount. Tests asserting focus need `waitFor`.
- **Escape is handled on the dialog**, not on `document`. A `keyDown` fired on
  `document` no longer closes it.
- **The panel is a plain block with no height cap**, as the legacy one is: MUI
  Paper's flex column, `overflow-y: auto` and viewport max-height are undone
  in `muiCustomDialog.module.scss`, so tall content overflows the viewport
  rather than scrolling inside the panel, and a child's leading margin grows
  the panel. Consumers that want scrolling set it in their `className`.

## Storybook

Every legacy story has an MUI twin with the same export name under
`DesignSystem/Dialog/MuiDialog` and `DesignSystem/Dialog/MuiCustomDialog`, so
the two can be screenshotted side by side. Run storybook locally and go to
[DesignSystem / Dialog](http://localhost:6006/?path=/story/designsystem-dialog-muidialog--default-dialog).

## Legacy `Dialog` and `CustomDialog`

Still exported as `Dialog`, `CustomDialog` and the default export, with
`DialogProps` and `CustomDialogProps` referring to them, until their consumers
move. `Dialog` is a general purpose dialog with predefined structure;
`CustomDialog` is the base it is built on, with only the dialog behavior (focus
trap, close on escape, scroll lock) and no content structure. `Modal` in
`src/modal` is built on `MuiCustomDialog`. Two `apps/` callers remain on the
legacy `CustomDialog` because they depend on in-place rendering:
`pixelEditor/PixelEditorModal.tsx` and
`p5lab/spritelab/lab2/views/ImageDetailsDialog.tsx`.
