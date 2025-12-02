import {Components, Theme} from '@mui/material/styles';

export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  defaultProps: {
    variant: 'body2',
  },
  styleOverrides: {
    root: ({theme}) => ({
      fontWeight: theme.typography.fontWeightBold,
    }),
  },
};
