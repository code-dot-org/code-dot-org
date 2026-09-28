# `componentLibrary/dialog`

This entry point ships two dialogs built on MUI's `Dialog`,
[MuiDialog](MuiDialog.tsx) and [MuiCustomDialog](MuiCustomDialog.tsx), beside
the deprecated DSCO [Dialog](Dialog.tsx) and [CustomDialog](CustomDialog.tsx).
The MUI versions take the legacy props unchanged and render the same, so
moving a call site over changes only its import. The plan and its rationale
are in [DIALOG_MIGRATION_TO_MUI.md](DIALOG_MIGRATION_TO_MUI.md).

## Consuming This Component

```javascript
import {
  MuiDialog,
  MuiDialogProps,
  MuiCustomDialog,
  MuiCustomDialogProps,
} from '@code-dot-org/component-library/dialog';
```

When a local name is already taken, or to keep the legacy name at a call site,
alias the import; this is what the codemod writes:

```javascript
import {MuiDialog as Dialog} from '@code-dot-org/component-library/dialog';
```

Import `MuiDialog` from this package, not `Dialog` from `@mui/material`: the
wrapper carries the DSCO layout and the shared behavior described below.

## Using MuiDialog vs MuiCustomDialog

`MuiDialog` is the general purpose dialog: an optional image or icon badge, a
title, a description, custom content, a row of one or two buttons, and
optional content below the buttons. Use it in most cases.

`MuiCustomDialog` is the shell `MuiDialog` is built on: the overlay, the
panel, the close button, scroll lock, Escape and the focus trap, with no
content structure. Use it only when the content needs its own layout and
styles. `Modal` is built on the legacy `CustomDialog` today.

```tsx
<MuiDialog
  title="Remove student?"
  description="Their progress stays in the section."
  icon={{iconName: 'user-minus'}}
  primaryButtonProps={{children: 'Remove', color: 'error', onClick: remove}}
  secondaryButtonProps={{children: 'Cancel', onClick: close}}
  onClose={close}
/>

<MuiCustomDialog aria-label="Keyboard shortcuts" onClose={close}>
  <p id="dsco-dialog-description">Press ? to open this list.</p>
</MuiCustomDialog>
```

### Props

| Prop                            | Component       | Behavior                                                                                        |
| ------------------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| `title`                         | MuiDialog       | `h2` heading; also the panel's `aria-label`                                                     |
| `description`                   | MuiDialog       | Centered `body2` text with `id="dsco-dialog-description"`                                       |
| `customContent`                 | MuiDialog       | Rendered after the description, in its own alignment                                            |
| `customBottomContent`           | MuiDialog       | Rendered after the button row                                                                   |
| `primaryButtonProps`            | MuiDialog       | Spread on an MUI `Button variant="contained"`                                                   |
| `secondaryButtonProps`          | MuiDialog       | Spread on an MUI `Button variant="outlined"`; the button renders only when passed               |
| `mode`                          | both            | MuiDialog: button color, `primary`/`secondary` or `white`. MuiCustomDialog: close button color. |
| `icon`                          | MuiDialog       | `FontAwesomeV6Icon` badge on the panel's top edge                                               |
| `imageUrl`, `imageAlt`          | MuiDialog       | Image above the title, scaled to fit; `imageAlt` defaults to `''` (decorative)                  |
| `onClose`                       | both            | Close button and Escape. Without it neither exists. A backdrop click never closes.              |
| `closeLabel`                    | both            | Close button `aria-label`, default `'Close dialog'`                                             |
| `zIndex`                        | both            | Overlay z-index, through `--cdo-dialog-z-index`; default `$zindex-modal-backdrop` (1040)        |
| `className`, other HTML attrs   | both            | On the panel, the `role="dialog"` (MuiCustomDialog) or `role="alertdialog"` (MuiDialog) element |
| `aria-label`, `aria-labelledby` | both            | On the panel; pass one of them. `aria-describedby` defaults to `dsco-dialog-description`.       |
| `role`                          | both            | Panel role; MuiCustomDialog defaults to `dialog`                                                |
| `children`                      | MuiCustomDialog | Panel content, before the close button                                                          |

`mode` never restyles the panel; the panel follows the surrounding
`data-theme`. Without a `description`, give the element that describes the
dialog `id="dsco-dialog-description"`, or the dialog warns on mount.

### Rendering in place

The dialog renders where it is mounted, not in a portal. It inherits the
surrounding `data-theme`, `dir`, text styles and ancestor selectors, and
covers the viewport with `position: fixed`. Nothing else on the page is
`aria-hidden` while it is open.

The panel is a plain `div` with no MUI emotion styles, so `className` rules
override it at the same specificity as they did the legacy panel. The module
class names keep their legacy local names (`customDialogOverlay`,
`customDialog`, `dialog`, `dialogTextSection`, `dialogActionsSection`,
`dialogIcon`); `customDialogOverlay` is on the element that carries the
z-index.

### Shared behavior

Scroll lock, Escape and the focus trap come from the same hooks the legacy
dialogs use (`useBodyScrollLock`, `useEscapeKeyHandler`, `useFocusTrap` in
`src/common/hooks`), and MUI's own versions are switched off. Legacy and MUI
dialogs can be open at once: the body scroll lock is released only when the
last of them closes, and Escape closes every open dialog, as before. Focus
moves to the first focusable element in the panel and returns to the opener
on close.

## Deprecated: Dialog and CustomDialog

`Dialog` (also the default export), `CustomDialog`, `DialogProps` and
`CustomDialogProps` are deprecated. Move call sites with the codemod:

```bash
cd frontend/packages/component-library
yarn build
yarn codemod:dialog --dry --print ../../../apps/src/<path>
yarn codemod:dialog ../../../apps/src/<path>
```

See [codemods/README.md](../../codemods/README.md#dialog-to-mui-dialogts).
The legacy components are unchanged and keep four defects the MUI versions
fix: the panel's fixed minimum width overflows narrow viewports, the image
distorts and never scales down, its alt is the literal `"Dialog"`, and the
icon badge loses its centering when Font Awesome's `display` rule loads later.

For guidelines and live examples, run Storybook locally and open
DesignSystem / Dialog.
