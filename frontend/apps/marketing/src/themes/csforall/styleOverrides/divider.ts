import {Components, Theme} from '@mui/material/styles';

export const DIVIDER_OVERRIDES: Components<Theme>['MuiDivider'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.MuiDivider-root.divider--color-primary': {
        borderColor: theme.palette.divider,
      },
      '&.MuiDivider-root.divider--color-strong': {
        borderColor: theme.palette.divider,
        borderStyle: 'dashed',
      },
      '&.MuiDivider-root.divider--margin-none': {
        marginTop: 0,
        marginBottom: 0,
      },
      '&.MuiDivider-root.divider--margin-xs': {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
      },
      '&.MuiDivider-root.divider--margin-s': {
        marginTop: theme.spacing(5),
        marginBottom: theme.spacing(5),
      },
      '&.MuiDivider-root.divider--margin-m': {
        marginTop: theme.spacing(7),
        marginBottom: theme.spacing(7),
      },
      '&.MuiDivider-root.divider--margin-l': {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(8),
      },
    }),
  },
};
