import {Components, Theme} from '@mui/material/styles';

const COLOR = 'var(--background-neutral-quaternary)';

// Color only, so MUI's layout for every orientation and variant stands.
// A labelled divider draws its lines with ::before and ::after.
export const DIVIDER_OVERRIDES: Components<Theme>['MuiDivider'] = {
  styleOverrides: {
    root: {
      borderColor: COLOR,
      '&::before, &::after': {
        borderColor: COLOR,
      },
    },
  },
};
