import {Components, Theme} from '@mui/material/styles';

export const SVG_ICON_OVERRIDES: Components<Theme>['MuiSvgIcon'] = {
  styleOverrides: {
    root: () => ({
      color: 'var(--text-neutral-primary)',
    }),
  },
};
