# `componentLibrary/button`

> **⚠️ Deprecated**: The DSCO Button components (`Button`, `LinkButton`, `GenericButton`) are deprecated. Use MUI `Button` and `IconButton` from `@mui/material` instead. All `/apps` consumers and all internal DSCO component consumers have been migrated. See [BUTTON_MIGRATION_TO_MUI.md](BUTTON_MIGRATION_TO_MUI.md) for the migration guide and [MIGRATION_STATUS.md](../../MIGRATION_STATUS.md) for overall progress.

## Legacy Documentation

This package exports three styled React components: [GenericButton](GenericButton.tsx), [Button](Button.tsx),
[LinkButton](LinkButton.tsx).
They are identical visually, the only difference is that `Button` render `<button>`, `LinkButton` renders `<a>`,
and `GenericButton` can render both depending on what props are passed into it.

You can import them like this:

```javascript
import Button from '@code-dot-org/component-library/button';
import {
  GenericButton,
  Button,
  LinkButton,
} from '@code-dot-org/component-library/button';
```

Both of [Button](Button.tsx) and [LinkButton](LinkButton.tsx) are actually aliases for [GenericButton](GenericButton.tsx) component which handles
all the logic and styles, which is not exported from this package (since it's a private component for DesignSystem
internal use only).

For guidelines on how to use these components and the features they
offer, [visit Storybook](https://code-dot-org.github.io/dsco_)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go
to [Design System / Button](http://localhost:9001/?path=/story/designsystem-button-component--default-button).
