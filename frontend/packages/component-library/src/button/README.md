# `componentLibrary/button`

There is one button: MUI's, styled by `CdoTheme`. The DSCO components
(`Button`, `LinkButton`, `GenericButton`) are gone, and this directory ships no
code.

Import `Button` and `IconButton` straight from `@mui/material`. The `MuiButton`
and `MuiIconButton` entries in
[`styleOverrides/button.tsx`](../themes/code.org/styleOverrides/button.tsx)
style them, and [`muiAugmentation.ts`](../themes/code.org/muiAugmentation.ts)
adds the `extraSmall` size and the `tertiary` and `white` colors.

```tsx
import {Button} from '@mui/material';

<Button variant="contained" onClick={save}>
  Save
</Button>;
```

A link is a `Button` with `href`. For props and live examples, see
DesignSystem / Button / MuiButton in Storybook.
