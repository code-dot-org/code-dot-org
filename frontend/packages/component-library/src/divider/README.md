# `componentLibrary/divider`

Use `Divider` from `@mui/material`. CdoTheme's `MuiDivider` entry
([styleOverrides/divider.ts](../themes/code.org/styleOverrides/divider.ts))
colors it `--background-neutral-quaternary`, the legacy `primary` color, and
changes nothing else, so vertical and `flexItem` dividers keep MUI's layout.

```javascript
import {Divider} from '@mui/material';
```

The override is global: it colors every MUI `Divider` rendered under
CdoTheme, labelled ones included. MUI's deprecated `light` prop no longer
lightens the line.

The deprecated DSCO [Divider](Divider.tsx) took `color` and `margin` props.
Plain MUI has neither; use `sx` when a call site needs them:

| Legacy prop       | MUI                                                      |
| ----------------- | -------------------------------------------------------- |
| `color="strong"`  | `sx={{borderColor: 'var(--background-neutral-senary)'}}` |
| `margin="xs"`–`l` | `sx={{my: 1}}`, `2`, `4`, `8`                            |
| `margin="none"`   | MUI's default                                            |

The legacy margins were 0.5rem, 1rem, 2rem and 4rem; MUI's spacing unit is
8px, which matches them only where the root font size is 16px.

The legacy component still resolves until it is deleted:

```javascript
import Divider from '@code-dot-org/component-library/divider';
```

See [DIVIDER_MIGRATION_TO_MUI.md](DIVIDER_MIGRATION_TO_MUI.md) for the
migration, and DesignSystem / Divider in Storybook for examples.
