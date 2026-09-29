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

Both render in place, not in a portal. MUI's focus trap holds focus in the
top dialog and returns it to the opener on close; scroll lock and Escape
handling stay DSCO until they move to MUI too; see Deferred changes in
[DIALOG_MIGRATION_TO_MUI.md](DIALOG_MIGRATION_TO_MUI.md).

For props and live examples, see DesignSystem / Dialog in Storybook.
