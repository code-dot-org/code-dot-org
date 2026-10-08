# `componentLibrary/dialog`

[MuiDialog](MuiDialog.tsx) and [MuiCustomDialog](MuiCustomDialog.tsx) are the
MUI versions of the deprecated DSCO [Dialog](Dialog.tsx) and
[CustomDialog](CustomDialog.tsx). They take the same props, so moving a call
site over changes only its import.

```javascript
import {
  MuiDialog,
  MuiCustomDialog,
} from '@code-dot-org/component-library/dialog';
```

Use `MuiDialog` in most cases: title, description, buttons, and an optional
icon or image. Use `MuiCustomDialog`, the bare overlay and panel, only when the
content needs its own layout.

Both render in place, not in a portal, and keep the legacy scroll lock, Escape
handling and focus trap until those move to MUI; see Deferred changes in
[DIALOG_MIGRATION_TO_MUI.md](DIALOG_MIGRATION_TO_MUI.md). To move a legacy call
site, use the [codemod](../../codemods/README.md#dialog-to-mui-dialogts).

For props and live examples, see DesignSystem / Dialog in Storybook.
