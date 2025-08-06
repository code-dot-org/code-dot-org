import {Components, Theme} from '@mui/material/styles';

export const DIVIDER_OVERRIDES: Components<Theme>['MuiDivider'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.MuiDivider-root.divider--color-primary': {
        borderColor: 'var(--background-neutral-quaternary)',
      },
      '&.MuiDivider-root.divider--color-strong': {
        borderColor: 'var(--background-neutral-senary)',
      },
      '&.MuiDivider-root.divider--color-white': {
        borderColor: theme.palette.common.white,
      },
      '&.MuiDivider-root.divider--margin-none': {
        marginTop: 0,
        marginBottom: 0,
      },
      '&.MuiDivider-root.divider--margin-xs': {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
      '&.MuiDivider-root.divider--margin-s': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
      },
      '&.MuiDivider-root.divider--margin-m': {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
      },
      '&.MuiDivider-root.divider--margin-l': {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(8),
      },
    }),
  },
};
