import {Components, Theme} from '@mui/material/styles';

// Color only, so vertical and flexItem dividers keep MUI's layout.
export const DIVIDER_OVERRIDES: Components<Theme>['MuiDivider'] = {
  styleOverrides: {
    root: {
      borderColor: 'var(--background-neutral-quaternary)',
    },
  },
};
