# `componentLibrary/dialog`

[Dialog](Dialog.tsx) and [CustomDialog](CustomDialog.tsx) are built on MUI's
`Dialog`. They replaced the DSCO components of the same names and take the same
props.

```javascript
import {Dialog, CustomDialog} from '@code-dot-org/component-library/dialog';
```

Import `Dialog` from this package, not from `@mui/material`. Use `Dialog` in
most cases: title, description, buttons, and an optional icon or image. Use
`CustomDialog`, the bare overlay and panel, only when the content needs its
own layout; `Modal` is built on it.

Both render in place, not in a portal. MUI's focus trap moves focus into the
dialog on open (to the first control, or to MUI's container when nothing takes
focus), wraps Tab and Shift+Tab inside it, and returns focus to the opener on
close. It does not pull focus back from outside, so an overlay MUI does not
track (apps' `BaseDialog`, a persistent drawer, a Bootstrap modal) can open over
the dialog and keep focus, as with the legacy dialog. Scroll lock and Escape
handling stay DSCO until they move to MUI too; see Deferred changes in
[DIALOG_MIGRATION_TO_MUI.md](DIALOG_MIGRATION_TO_MUI.md).

For props and live examples, see DesignSystem / Dialog in Storybook.
