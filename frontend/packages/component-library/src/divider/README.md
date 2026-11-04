# `componentLibrary/divider`

[MuiDivider](MuiDivider.tsx) is the MUI version of the deprecated DSCO
[Divider](Divider.tsx). It takes the same props, less `children`, which React
already rejects on an `<hr>`, so moving a call site over changes only its
import.

```javascript
import {MuiDivider} from '@code-dot-org/component-library/divider';
```

It renders a horizontal `<hr>`: a full-width 1px rule. `color` picks
`primary` (the default) or the darker `strong`; `margin` sets the space above
and below, from `none` (the default) to `l`. For a vertical or flex-item
separator, use `Divider` from `@mui/material`.

The wrapper's rules carry two classes, so a `className` rule needs two classes
too (or use `style`) to override border, margin, width or `flex-shrink`.

The legacy component still resolves until it is deleted:

```javascript
import Divider from '@code-dot-org/component-library/divider';
```

To move a legacy call site, use the
[codemod](../../codemods/README.md#divider-to-mui-dividerts); see
[DIVIDER_MIGRATION_TO_MUI.md](DIVIDER_MIGRATION_TO_MUI.md) for the plan.

For props and live examples, see DesignSystem / Divider in Storybook.
